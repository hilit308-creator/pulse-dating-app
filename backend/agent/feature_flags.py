"""
Feature Flags - Agent Rollout Strategy

Per Spec Section X - Rollout Strategy:
- Feature-flag each agent independently
- Fallback behavior must exist for every agent
  (e.g., default ordering, default copy, no event layer)

Usage:
    from agent.feature_flags import is_enabled, get_flag_value

    if is_enabled('profile_ranking_agent'):
        # Use AI ranking
    else:
        # Use default ordering
"""

import os
import json
import time
from typing import Any, Dict, Optional
from functools import lru_cache

# Default feature flag configuration
DEFAULT_FLAGS = {
    # Agent flags
    "profile_ranking_agent": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "AI-powered profile ranking for Discover",
    },
    "event_relevance_agent": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "AI-powered relevant people for events",
    },
    "empowerment_engine": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "Empowerment copy on match screen",
    },
    "chat_assistant": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "AI chat suggestions (coach/therapist)",
    },
    "safety_trust_agent": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "Safety checks and throttling",
    },
    
    # Feature flags
    "todays_picks_badge": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "Today's Picks purple badge on cards",
    },
    "context_lines": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "Crossed paths / same area context lines",
    },
    "event_countdown": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "Event countdown in chat header",
    },
    "ai_first_message": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "AI first message with tone buttons",
    },
    "undo_button": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "Undo button on user cards",
    },
    "image_gallery": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "Vertical swipe image navigation",
    },
    "profile_icons": {
        "enabled": True,
        "rollout_percentage": 100,
        "description": "Height/smoking/zodiac icons row",
    },
}

# In-memory flag overrides (for testing/admin)
_flag_overrides: Dict[str, Dict] = {}

# Cache TTL in seconds
FLAG_CACHE_TTL = 60


def _load_flags_from_env() -> Dict[str, Dict]:
    """Load flag overrides from environment variables."""
    flags = {}
    
    for key in os.environ:
        if key.startswith("PULSE_FLAG_"):
            flag_name = key[11:].lower()  # Remove PULSE_FLAG_ prefix
            value = os.environ[key].lower()
            flags[flag_name] = {
                "enabled": value in ("true", "1", "yes", "on"),
                "rollout_percentage": 100,
            }
    
    return flags


def _load_flags_from_file(filepath: str = "feature_flags.json") -> Dict[str, Dict]:
    """Load flags from JSON file if exists."""
    try:
        if os.path.exists(filepath):
            with open(filepath, "r") as f:
                return json.load(f)
    except Exception:
        pass
    return {}


@lru_cache(maxsize=1)
def _get_cached_flags() -> tuple:
    """Get cached flags with TTL."""
    return (time.time(), {
        **DEFAULT_FLAGS,
        **_load_flags_from_file(),
        **_load_flags_from_env(),
        **_flag_overrides,
    })


def get_all_flags() -> Dict[str, Dict]:
    """Get all feature flags."""
    cache_time, flags = _get_cached_flags()
    
    # Invalidate cache if TTL expired
    if time.time() - cache_time > FLAG_CACHE_TTL:
        _get_cached_flags.cache_clear()
        _, flags = _get_cached_flags()
    
    return flags


def get_flag(flag_name: str) -> Optional[Dict]:
    """Get a specific flag configuration."""
    flags = get_all_flags()
    return flags.get(flag_name)


def is_enabled(flag_name: str, user_id: str = None) -> bool:
    """
    Check if a feature flag is enabled.
    
    Args:
        flag_name: Name of the feature flag
        user_id: Optional user ID for percentage-based rollout
    
    Returns:
        True if flag is enabled for this user
    """
    flag = get_flag(flag_name)
    
    if flag is None:
        return False
    
    if not flag.get("enabled", False):
        return False
    
    # Check rollout percentage
    rollout = flag.get("rollout_percentage", 100)
    if rollout < 100 and user_id:
        # Deterministic hash-based rollout
        user_hash = hash(f"{flag_name}:{user_id}") % 100
        return user_hash < rollout
    
    return rollout > 0


def get_flag_value(flag_name: str, key: str, default: Any = None) -> Any:
    """Get a specific value from a flag configuration."""
    flag = get_flag(flag_name)
    if flag is None:
        return default
    return flag.get(key, default)


def set_flag_override(flag_name: str, enabled: bool, rollout_percentage: int = 100):
    """
    Set a runtime flag override (for testing/admin).
    
    Args:
        flag_name: Name of the feature flag
        enabled: Whether the flag should be enabled
        rollout_percentage: Percentage of users to enable for (0-100)
    """
    _flag_overrides[flag_name] = {
        "enabled": enabled,
        "rollout_percentage": rollout_percentage,
    }
    _get_cached_flags.cache_clear()


def clear_flag_overrides():
    """Clear all runtime flag overrides."""
    _flag_overrides.clear()
    _get_cached_flags.cache_clear()


def get_flags_for_user(user_id: str) -> Dict[str, bool]:
    """
    Get all flags evaluated for a specific user.
    Useful for sending to frontend.
    """
    flags = get_all_flags()
    return {
        name: is_enabled(name, user_id)
        for name in flags
    }


# Convenience functions for specific agents
def is_ranking_enabled(user_id: str = None) -> bool:
    return is_enabled("profile_ranking_agent", user_id)


def is_event_relevance_enabled(user_id: str = None) -> bool:
    return is_enabled("event_relevance_agent", user_id)


def is_empowerment_enabled(user_id: str = None) -> bool:
    return is_enabled("empowerment_engine", user_id)


def is_chat_assistant_enabled(user_id: str = None) -> bool:
    return is_enabled("chat_assistant", user_id)


def is_safety_enabled(user_id: str = None) -> bool:
    return is_enabled("safety_trust_agent", user_id)
