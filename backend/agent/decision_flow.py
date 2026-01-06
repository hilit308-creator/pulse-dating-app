"""
Decision Flow / State Machine for Agent
6 states with specific behaviors for each.
"""
import time
from enum import Enum

class ConversationState(Enum):
    EARLY = "early"           # 1-3 messages
    WARMING = "warming"       # 4-10 messages
    ENGAGED = "engaged"       # Flowing back-and-forth
    STUCK = "stuck"           # Time passed, no response
    DROP_OFF = "drop_off"     # Cooling down
    HIGH_LOAD = "high_load"   # Many active chats

# State-specific configurations
STATE_CONFIG = {
    ConversationState.EARLY: {
        "should_suggest": True,
        "suggest_probability": 0.7,  # 70% chance to suggest
        "preferred_intents": ["open", "compliment"],
        "tone": "friendly",
        "length": "short",
        "cooldown_seconds": 120,  # 2 min cooldown
        "max_suggestions": 2,
    },
    ConversationState.WARMING: {
        "should_suggest": True,
        "suggest_probability": 0.5,  # 50% chance
        "preferred_intents": ["followup", "invite"],
        "tone": "playful",
        "length": "medium",
        "cooldown_seconds": 90,
        "max_suggestions": 3,
    },
    ConversationState.ENGAGED: {
        "should_suggest": False,  # Don't interrupt good flow
        "suggest_probability": 0.15,  # Only 15% - mostly silent
        "preferred_intents": ["clarify"],
        "tone": "confident",
        "length": "short",
        "cooldown_seconds": 180,  # 3 min - very conservative
        "max_suggestions": 2,
    },
    ConversationState.STUCK: {
        "should_suggest": True,
        "suggest_probability": 0.8,  # High chance - help needed
        "preferred_intents": ["followup", "invite"],
        "tone": "friendly",
        "length": "medium",
        "cooldown_seconds": 60,
        "max_suggestions": 3,
    },
    ConversationState.DROP_OFF: {
        "should_suggest": True,
        "suggest_probability": 0.6,
        "preferred_intents": ["open", "invite"],
        "tone": "playful",
        "length": "short",
        "cooldown_seconds": 300,  # 5 min - don't push too hard
        "max_suggestions": 2,
    },
    ConversationState.HIGH_LOAD: {
        "should_suggest": False,  # User is busy
        "suggest_probability": 0.1,  # Very low
        "preferred_intents": ["open"],
        "tone": "friendly",
        "length": "short",
        "cooldown_seconds": 300,
        "max_suggestions": 1,
    },
}


def evaluate_state(messages, context=None):
    """
    Evaluate conversation state based on messages and context.
    Returns ConversationState enum.
    """
    if not messages:
        return ConversationState.EARLY
    
    context = context or {}
    
    # Count messages
    total_messages = len(messages)
    my_messages = [m for m in messages if m.get("from") == "me"]
    their_messages = [m for m in messages if m.get("from") == "them"]
    
    # Check social load first
    social_load = context.get("social_load", {})
    active_chats = int(social_load.get("active_chats", 1))
    if active_chats >= 5:
        return ConversationState.HIGH_LOAD
    
    # Check for stuck/drop-off based on timing
    last_their_msg = None
    last_my_msg = None
    for m in reversed(messages):
        if m.get("from") == "them" and not last_their_msg:
            last_their_msg = m
        if m.get("from") == "me" and not last_my_msg:
            last_my_msg = m
        if last_their_msg and last_my_msg:
            break
    
    now = int(time.time() * 1000)
    
    # If I sent last and no reply for > 2 hours = DROP_OFF
    if last_my_msg and (not last_their_msg or last_my_msg.get("ts", 0) > last_their_msg.get("ts", 0)):
        time_since_my_msg = now - last_my_msg.get("ts", now)
        if time_since_my_msg > 2 * 60 * 60 * 1000:  # 2 hours
            return ConversationState.DROP_OFF
    
    # If they sent last and I haven't replied for > 30 min = STUCK
    if last_their_msg and (not last_my_msg or last_their_msg.get("ts", 0) > last_my_msg.get("ts", 0)):
        time_since_their_msg = now - last_their_msg.get("ts", now)
        if time_since_their_msg > 30 * 60 * 1000:  # 30 min
            return ConversationState.STUCK
    
    # Check for engaged (good back-and-forth)
    if total_messages >= 6:
        recent = messages[-6:]
        my_recent = sum(1 for m in recent if m.get("from") == "me")
        their_recent = sum(1 for m in recent if m.get("from") == "them")
        
        # Balanced conversation = engaged
        if 2 <= my_recent <= 4 and 2 <= their_recent <= 4:
            return ConversationState.ENGAGED
    
    # Early vs Warming based on message count
    if total_messages <= 3:
        return ConversationState.EARLY
    elif total_messages <= 10:
        return ConversationState.WARMING
    else:
        return ConversationState.ENGAGED


def get_decision(state, context=None):
    """
    Get decision parameters for a given state.
    Returns dict with should_suggest, intent, tone, length, cooldown, etc.
    """
    import random
    
    config = STATE_CONFIG.get(state, STATE_CONFIG[ConversationState.EARLY])
    
    # Random probability check
    should_suggest = config["should_suggest"]
    if should_suggest:
        should_suggest = random.random() < config["suggest_probability"]
    
    return {
        "state": state.value,
        "should_suggest": should_suggest,
        "intent": random.choice(config["preferred_intents"]),
        "tone": config["tone"],
        "length": config["length"],
        "cooldown_seconds": config["cooldown_seconds"],
        "max_suggestions": config["max_suggestions"],
        "config": config
    }


def get_state_description(state):
    """Get human-readable description of state."""
    descriptions = {
        ConversationState.EARLY: "Early stage (1-3 messages) - Building initial connection",
        ConversationState.WARMING: "Warming up (4-10 messages) - Getting to know each other",
        ConversationState.ENGAGED: "Engaged - Conversation is flowing well",
        ConversationState.STUCK: "Stuck - User needs help responding",
        ConversationState.DROP_OFF: "Drop-off - Conversation cooling down",
        ConversationState.HIGH_LOAD: "High load - User has many active chats",
    }
    return descriptions.get(state, "Unknown state")
