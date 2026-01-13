"""
Fallback Behaviors - Default behaviors when agents are disabled or fail

Per Spec Section X - Rollout Strategy:
- Fallback behavior must exist for every agent
  (e.g., default ordering, default copy, no event layer)

Usage:
    from agent.fallbacks import get_fallback_profiles, get_fallback_suggestions
"""

import random
from typing import Dict, List, Any
from datetime import datetime


# Default empowerment copy (Pool D - Minimal Confidence Boost)
DEFAULT_EMPOWERMENT_COPY = [
    "One small message can change the whole vibe.",
    "You're already halfway there.",
]


def get_fallback_profiles(
    candidate_profiles: List[Dict],
    context: Dict = None,
) -> Dict[str, Any]:
    """
    Fallback profile ordering when Profile Ranking Agent is disabled.
    
    Default behavior:
    - Sort by distance (closest first)
    - No Today's Picks badges
    - No AI-generated context lines
    """
    context = context or {}
    
    # Simple distance-based sorting
    sorted_profiles = sorted(
        candidate_profiles,
        key=lambda p: p.get("distance_meters", float("inf"))
    )
    
    # Add basic structure without AI enhancements
    result_profiles = []
    for profile in sorted_profiles:
        result_profiles.append({
            "user_id": profile.get("user_id"),
            "score": 0,  # No AI scoring
            "reasons": ["distance_sort"],
            "is_todays_pick": False,
            "todays_pick_reason": None,
        })
    
    return {
        "success": True,
        "profiles": result_profiles,
        "todays_picks_count": 0,
        "decision_id": "fallback_distance_sort",
        "ttl_seconds": 300,
        "is_fallback": True,
    }


def get_fallback_event_people(
    event_id: str,
    attendees: List[Dict],
) -> Dict[str, Any]:
    """
    Fallback event people when Event Relevance Agent is disabled.
    
    Default behavior:
    - Return all attendees without relevance scoring
    - No shared interests highlighting
    """
    # Just return attendees as-is, limited to 10
    people = [
        {
            "user_id": a.get("user_id"),
            "name": a.get("name"),
            "photo": a.get("photo"),
            "shared_interests": [],
            "relevance_score": 0,
        }
        for a in attendees[:10]
    ]
    
    return {
        "success": True,
        "event_id": event_id,
        "people": people,
        "total": len(attendees),
        "decision_id": "fallback_no_relevance",
        "is_fallback": True,
    }


def get_fallback_empowerment() -> Dict[str, str]:
    """
    Fallback empowerment copy when Empowerment Engine is disabled.
    
    Default behavior:
    - Return random copy from Pool D (Minimal Confidence Boost)
    """
    text = random.choice(DEFAULT_EMPOWERMENT_COPY)
    return {
        "text": text,
        "messageId": "fallback_d",
        "is_fallback": True,
    }


def get_fallback_suggestions(
    messages: List[Dict],
    context: Dict = None,
) -> Dict[str, Any]:
    """
    Fallback chat suggestions when Chat Assistant is disabled.
    
    Default behavior:
    - Return empty suggestions
    - No AI assistance
    """
    return {
        "success": True,
        "state": "unknown",
        "mode": "disabled",
        "crisis_flag": False,
        "should_suggest": False,
        "suggestions": [],
        "cooldown_seconds": 0,
        "is_fallback": True,
    }


def get_fallback_safety() -> Dict[str, Any]:
    """
    Fallback safety check when Safety & Trust Agent is disabled.
    
    Default behavior:
    - Allow all actions (no restrictions)
    - Log warning for monitoring
    """
    return {
        "is_safe": True,
        "flags": ["safety_agent_disabled"],
        "throttles": {},
        "restrictions": [],
        "is_fallback": True,
    }


# Fallback context lines (no AI)
DEFAULT_CONTEXT_LINES = [
    "Looking for connections",
    "Open to meeting new people",
    "Here to explore",
]


def get_fallback_context_line(user: Dict) -> str:
    """
    Fallback context line when AI context generation is disabled.
    
    Default behavior:
    - Use occupation if available
    - Otherwise use generic line
    """
    if user.get("occupation"):
        return user["occupation"]
    
    if user.get("bio"):
        # Truncate bio to 50 chars
        bio = user["bio"][:50]
        if len(user["bio"]) > 50:
            bio += "..."
        return bio
    
    return random.choice(DEFAULT_CONTEXT_LINES)


# Fallback Today's Pick logic (simple rules)
def get_fallback_todays_pick(user: Dict, context: Dict = None) -> Dict[str, Any]:
    """
    Fallback Today's Pick logic when AI is disabled.
    
    Default behavior:
    - Mark as Today's Pick if distance < 1km
    - No other AI signals
    """
    context = context or {}
    distance = user.get("distance_meters", float("inf"))
    
    is_pick = distance < 1000
    reason = "nearby_tonight" if is_pick else None
    
    return {
        "is_todays_pick": is_pick,
        "todays_pick_reason": reason,
        "is_fallback": True,
    }


class FallbackOrchestrator:
    """
    Orchestrator that uses fallback behaviors for all agents.
    Used when main orchestrator fails or agents are disabled.
    """
    
    def get_discover_profiles(
        self,
        user_id: str,
        candidate_profiles: List[Dict],
        context: Dict = None,
    ) -> Dict[str, Any]:
        return get_fallback_profiles(candidate_profiles, context)
    
    def get_event_people(
        self,
        user_id: str,
        event_id: str,
        attendees: List[Dict],
        user_interests: List[str] = None,
    ) -> Dict[str, Any]:
        return get_fallback_event_people(event_id, attendees)
    
    def get_chat_suggestion(
        self,
        user_id: str,
        chat_id: str,
        messages: List[Dict],
        context: Dict = None,
        preferences: Dict = None,
    ) -> Dict[str, Any]:
        return get_fallback_suggestions(messages, context)


# Singleton fallback orchestrator
fallback_orchestrator = FallbackOrchestrator()


def get_fallback_orchestrator() -> FallbackOrchestrator:
    """Get the fallback orchestrator instance."""
    return fallback_orchestrator
