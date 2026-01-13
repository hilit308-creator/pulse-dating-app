"""
Agent Orchestrator - Single Source of Truth for Agent Outputs

Goal: Unify all relevant agents under a single orchestration layer,
ensuring consistent ranking, messaging, and UX behavior across Pulse moments.

Agents (Modules):
1. Profile Ranking Agent (Discover Order)
2. Event Relevance Agent (My Events People Layer)
3. Empowerment Engine (Match Moment Copy Selector)
4. Chat AI Assistant (First-Message Helper)
5. Safety & Trust Agent (flags, throttles, restrictions)

Rules:
- The orchestrator is the only layer allowed to combine agent outputs
- Frontend must never run ranking logic locally
- Each agent produces structured outputs, never free-form decisions
"""

import time
import hashlib
from typing import Dict, List, Optional, Any
from enum import Enum

from .decision_flow import evaluate_state, get_decision, ConversationState
from .engine import detect_mode, detect_crisis, make_suggestions
from .feature_flags import (
    is_ranking_enabled, is_event_relevance_enabled, 
    is_empowerment_enabled, is_chat_assistant_enabled, is_safety_enabled
)
from .fallbacks import (
    get_fallback_profiles, get_fallback_event_people, 
    get_fallback_suggestions, get_fallback_safety
)


class AgentType(Enum):
    PROFILE_RANKING = "profile_ranking"
    EVENT_RELEVANCE = "event_relevance"
    EMPOWERMENT = "empowerment"
    CHAT_ASSISTANT = "chat_assistant"
    SAFETY_TRUST = "safety_trust"


class AgentPriority(Enum):
    """Priority levels for conflict resolution"""
    CRITICAL = 1    # Safety & Trust - always overrides
    HIGH = 2        # Event relevance in Events flow
    NORMAL = 3      # Standard agent decisions
    LOW = 4         # Fallback/default behaviors


# Shared contract structure for all agent outputs
def create_agent_output(
    agent_type: AgentType,
    decision: Dict[str, Any],
    reason_codes: List[str] = None,
    ttl_seconds: int = 300,
) -> Dict[str, Any]:
    """
    Create standardized agent output per spec.
    
    All agents must output:
    - decision_id (for debugging / analytics)
    - inputs_version
    - output_version
    - reason_codes (internal only)
    - ttl (how long the decision remains valid)
    """
    decision_id = hashlib.md5(
        f"{agent_type.value}_{time.time()}_{str(decision)}".encode()
    ).hexdigest()[:16]
    
    return {
        "decision_id": decision_id,
        "agent_type": agent_type.value,
        "inputs_version": "1.0",
        "output_version": "1.0",
        "reason_codes": reason_codes or [],
        "ttl_seconds": ttl_seconds,
        "timestamp": int(time.time() * 1000),
        "decision": decision,
    }


class SafetyTrustAgent:
    """
    Safety & Trust Agent - Always has highest priority.
    Outputs: flags, throttles, restrictions (server-controlled)
    """
    
    # Blocked patterns (expandable)
    BLOCKED_PATTERNS = [
        "spam", "scam", "fake", "bot",
    ]
    
    @staticmethod
    def evaluate(user_id: str, context: Dict = None) -> Dict[str, Any]:
        """
        Evaluate safety and trust signals for a user.
        Returns flags, throttles, and restrictions.
        """
        context = context or {}
        
        flags = []
        throttles = {}
        restrictions = []
        
        # Check for crisis in recent messages
        recent_text = context.get("recent_text", "")
        if detect_crisis(recent_text):
            flags.append("crisis_detected")
            restrictions.append("show_crisis_resources")
        
        # Check report count
        report_count = context.get("report_count", 0)
        if report_count >= 3:
            flags.append("high_report_count")
            throttles["message_rate"] = 0.5  # 50% slower
        if report_count >= 5:
            restrictions.append("review_required")
        
        # Check for spam behavior
        messages_per_minute = context.get("messages_per_minute", 0)
        if messages_per_minute > 10:
            flags.append("spam_behavior")
            throttles["message_rate"] = 0.1
            restrictions.append("rate_limited")
        
        decision = {
            "is_safe": len(restrictions) == 0,
            "flags": flags,
            "throttles": throttles,
            "restrictions": restrictions,
        }
        
        return create_agent_output(
            AgentType.SAFETY_TRUST,
            decision,
            reason_codes=flags,
            ttl_seconds=60,  # Short TTL for safety decisions
        )


class ProfileRankingAgent:
    """
    Profile Ranking Agent - Orders profiles for Discover.
    Outputs: ordered user IDs + reason codes (internal)
    """
    
    @staticmethod
    def rank_profiles(
        user_id: str,
        candidate_profiles: List[Dict],
        context: Dict = None,
    ) -> Dict[str, Any]:
        """
        Rank profiles based on:
        - Time overlap
        - Location proximity
        - Shared places / routes
        - Event participation
        - Mutual intent signals
        """
        context = context or {}
        user_location = context.get("user_location")
        user_events = context.get("user_events", [])
        current_time = context.get("current_time", time.time())
        
        scored_profiles = []
        
        for profile in candidate_profiles:
            score = 0
            reasons = []
            
            # Proximity score (0-30 points)
            if user_location and profile.get("location"):
                distance = profile.get("distance_meters", 10000)
                if distance < 500:
                    score += 30
                    reasons.append("very_close")
                elif distance < 2000:
                    score += 20
                    reasons.append("nearby")
                elif distance < 5000:
                    score += 10
                    reasons.append("same_area")
            
            # Crossed paths (0-25 points)
            if profile.get("crossed_paths_today"):
                score += 25
                reasons.append("crossed_paths")
            
            # Same event (0-25 points)
            profile_events = profile.get("events", [])
            shared_events = set(user_events) & set(profile_events)
            if shared_events:
                score += 25
                reasons.append("same_event")
            
            # Time overlap (0-20 points)
            if profile.get("active_same_time"):
                score += 20
                reasons.append("time_overlap")
            
            # Today's Pick determination
            is_todays_pick = score >= 50
            todays_pick_reason = None
            if is_todays_pick:
                if "same_event" in reasons:
                    todays_pick_reason = "same_event"
                elif "crossed_paths" in reasons:
                    todays_pick_reason = "high_chance"
                elif "very_close" in reasons:
                    todays_pick_reason = "nearby_tonight"
                elif "time_overlap" in reasons:
                    todays_pick_reason = "same_time"
            
            scored_profiles.append({
                "user_id": profile.get("user_id"),
                "score": score,
                "reasons": reasons,
                "is_todays_pick": is_todays_pick,
                "todays_pick_reason": todays_pick_reason,
            })
        
        # Sort by score descending
        scored_profiles.sort(key=lambda x: x["score"], reverse=True)
        
        decision = {
            "ranked_profiles": scored_profiles,
            "total_count": len(scored_profiles),
            "todays_picks_count": sum(1 for p in scored_profiles if p["is_todays_pick"]),
        }
        
        return create_agent_output(
            AgentType.PROFILE_RANKING,
            decision,
            reason_codes=["ranking_complete"],
            ttl_seconds=300,  # 5 minutes
        )


class EventRelevanceAgent:
    """
    Event Relevance Agent - Finds relevant people per event.
    Outputs: relevant people per event + interest tags
    """
    
    @staticmethod
    def get_relevant_people(
        user_id: str,
        event_id: str,
        attendees: List[Dict],
        user_interests: List[str] = None,
    ) -> Dict[str, Any]:
        """
        Find relevant people for an event based on shared interests.
        """
        user_interests = user_interests or []
        
        relevant_people = []
        
        for attendee in attendees:
            if attendee.get("user_id") == user_id:
                continue  # Skip self
            
            attendee_interests = attendee.get("interests", [])
            shared_interests = set(user_interests) & set(attendee_interests)
            
            relevance_score = len(shared_interests) * 10
            
            # Boost for mutual likes
            if attendee.get("liked_user"):
                relevance_score += 30
            
            # Boost for previous interactions
            if attendee.get("previous_chat"):
                relevance_score += 20
            
            if relevance_score > 0:
                relevant_people.append({
                    "user_id": attendee.get("user_id"),
                    "name": attendee.get("name"),
                    "photo": attendee.get("photo"),
                    "shared_interests": list(shared_interests),
                    "relevance_score": relevance_score,
                })
        
        # Sort by relevance
        relevant_people.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        decision = {
            "event_id": event_id,
            "relevant_people": relevant_people[:10],  # Top 10
            "total_relevant": len(relevant_people),
        }
        
        return create_agent_output(
            AgentType.EVENT_RELEVANCE,
            decision,
            reason_codes=["event_relevance_complete"],
            ttl_seconds=600,  # 10 minutes
        )


class Orchestrator:
    """
    Main Orchestrator - Combines all agent outputs.
    
    Priority & Conflict Resolution:
    1. Safety & Trust always overrides (block, throttle, hide)
    2. Event relevance overrides generic discover relevance in Events flow
    3. Match moment copy is always locked per match (no re-selection)
    4. Chat suggestions never auto-send (always draft)
    """
    
    def __init__(self):
        self.safety_agent = SafetyTrustAgent()
        self.ranking_agent = ProfileRankingAgent()
        self.event_agent = EventRelevanceAgent()
    
    def get_discover_profiles(
        self,
        user_id: str,
        candidate_profiles: List[Dict],
        context: Dict = None,
    ) -> Dict[str, Any]:
        """
        Get ranked profiles for Discover screen.
        Applies safety checks first, then ranking.
        Uses fallback if agents are disabled.
        """
        context = context or {}
        
        # Check feature flags - use fallback if ranking disabled
        if not is_ranking_enabled(user_id):
            return get_fallback_profiles(candidate_profiles, context)
        
        # Step 1: Safety check (use fallback if disabled)
        if is_safety_enabled(user_id):
            safety_result = self.safety_agent.evaluate(user_id, context)
            if not safety_result["decision"]["is_safe"]:
                return {
                    "success": False,
                    "error": "safety_restriction",
                    "restrictions": safety_result["decision"]["restrictions"],
                }
        
        # Step 2: Rank profiles
        try:
            ranking_result = self.ranking_agent.rank_profiles(
                user_id, candidate_profiles, context
            )
            
            return {
                "success": True,
                "profiles": ranking_result["decision"]["ranked_profiles"],
                "todays_picks_count": ranking_result["decision"]["todays_picks_count"],
                "decision_id": ranking_result["decision_id"],
                "ttl_seconds": ranking_result["ttl_seconds"],
            }
        except Exception as e:
            # Fallback on error
            print(f"[Orchestrator] Ranking failed, using fallback: {e}")
            return get_fallback_profiles(candidate_profiles, context)
    
    def get_event_people(
        self,
        user_id: str,
        event_id: str,
        attendees: List[Dict],
        user_interests: List[str] = None,
    ) -> Dict[str, Any]:
        """
        Get relevant people for an event.
        Uses fallback if agent is disabled.
        """
        # Check feature flag
        if not is_event_relevance_enabled(user_id):
            return get_fallback_event_people(event_id, attendees)
        
        try:
            result = self.event_agent.get_relevant_people(
                user_id, event_id, attendees, user_interests
            )
            
            return {
                "success": True,
                "people": result["decision"]["relevant_people"],
                "total": result["decision"]["total_relevant"],
                "decision_id": result["decision_id"],
            }
        except Exception as e:
            print(f"[Orchestrator] Event relevance failed, using fallback: {e}")
            return get_fallback_event_people(event_id, attendees)
    
    def get_chat_suggestion(
        self,
        user_id: str,
        chat_id: str,
        messages: List[Dict],
        context: Dict = None,
        preferences: Dict = None,
    ) -> Dict[str, Any]:
        """
        Get chat suggestions with safety checks.
        Uses fallback if agent is disabled.
        """
        context = context or {}
        preferences = preferences or {}
        
        # Check feature flag
        if not is_chat_assistant_enabled(user_id):
            return get_fallback_suggestions(messages, context)
        
        try:
            # Step 1: Safety check on recent messages
            recent_text = " ".join([m.get("text", "") for m in messages[-5:]])
            
            crisis_flag = False
            if is_safety_enabled(user_id):
                safety_result = self.safety_agent.evaluate(
                    user_id, {"recent_text": recent_text}
                )
                crisis_flag = "crisis_detected" in safety_result["decision"]["flags"]
            
            # Step 2: Evaluate conversation state
            conv_state = evaluate_state(messages, context)
            state_decision = get_decision(conv_state, context)
            
            # Step 3: Detect mode (coach vs therapist)
            mode_result = detect_mode(recent_text, context, messages)
            
            # Step 4: Generate suggestions if appropriate
            suggestions = []
            if state_decision["should_suggest"] and not crisis_flag:
                suggestion_result = make_suggestions(
                    user_id, chat_id, None, messages, context, preferences
                )
                suggestions = suggestion_result.get("suggestions", [])
            
            return {
                "success": True,
                "state": conv_state.value,
                "mode": mode_result["mode"],
                "crisis_flag": crisis_flag,
                "should_suggest": state_decision["should_suggest"],
                "suggestions": suggestions,
                "cooldown_seconds": state_decision["cooldown_seconds"],
            }
        except Exception as e:
            print(f"[Orchestrator] Chat suggestion failed, using fallback: {e}")
            return get_fallback_suggestions(messages, context)


# Singleton instance
orchestrator = Orchestrator()


def get_orchestrator() -> Orchestrator:
    """Get the singleton orchestrator instance."""
    return orchestrator
