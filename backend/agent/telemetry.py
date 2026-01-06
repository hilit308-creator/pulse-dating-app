"""
Agent Telemetry System
Tracks all agent events for learning and optimization.
"""
import time
import json
from datetime import datetime
from collections import defaultdict

# In-memory storage (V1) - will migrate to DB in V2
_events = []
_metrics = defaultdict(int)
_user_sessions = defaultdict(list)

# Event Types
EVENT_SUGGESTION_SHOWN = "suggestion_shown"
EVENT_SUGGESTION_CLICKED = "suggestion_clicked"
EVENT_SUGGESTION_EDITED = "suggestion_edited_then_sent"
EVENT_REGENERATE_CLICKED = "regenerate_clicked"
EVENT_NO_OP_DECISION = "no_op_decision"
EVENT_SUGGESTION_IGNORED = "suggestion_ignored"
EVENT_USER_TYPED_ALONE = "user_typed_alone"
EVENT_MODE_SELECTED = "mode_selected"
EVENT_MODE_AUTO_DETECTED = "mode_auto_detected"
EVENT_CRISIS_FLAG_TRIGGERED = "crisis_flag_triggered"


def log_event(event_type, data=None):
    """Log an agent event with timestamp and data."""
    event = {
        "type": event_type,
        "timestamp": int(time.time() * 1000),
        "datetime": datetime.now().isoformat(),
        "data": data or {}
    }
    _events.append(event)
    _metrics[event_type] += 1
    
    # Track per-user sessions
    user_id = (data or {}).get("user_id", "unknown")
    chat_id = (data or {}).get("chat_id", "unknown")
    _user_sessions[f"{user_id}:{chat_id}"].append(event)
    
    # Keep only last 10000 events in memory
    if len(_events) > 10000:
        _events.pop(0)
    
    return event


def log_suggestion_shown(user_id, chat_id, suggestions, mode, decision_trace_id):
    """Log when suggestions are shown to user."""
    return log_event(EVENT_SUGGESTION_SHOWN, {
        "user_id": user_id,
        "chat_id": chat_id,
        "suggestion_count": len(suggestions),
        "suggestions": [s.get("text", "")[:50] for s in suggestions],  # Truncate for storage
        "mode": mode,
        "trace_id": decision_trace_id
    })


def log_suggestion_clicked(user_id, chat_id, suggestion_text, trace_id):
    """Log when user clicks/selects a suggestion."""
    return log_event(EVENT_SUGGESTION_CLICKED, {
        "user_id": user_id,
        "chat_id": chat_id,
        "suggestion_text": suggestion_text[:100],
        "trace_id": trace_id
    })


def log_suggestion_edited(user_id, chat_id, original_text, final_text, trace_id):
    """Log when user edits a suggestion before sending."""
    return log_event(EVENT_SUGGESTION_EDITED, {
        "user_id": user_id,
        "chat_id": chat_id,
        "original_text": original_text[:100],
        "final_text": final_text[:100],
        "edit_distance": _levenshtein_ratio(original_text, final_text),
        "trace_id": trace_id
    })


def log_regenerate(user_id, chat_id, trace_id):
    """Log when user clicks regenerate."""
    return log_event(EVENT_REGENERATE_CLICKED, {
        "user_id": user_id,
        "chat_id": chat_id,
        "trace_id": trace_id
    })


def log_no_op(user_id, chat_id, reason, conversation_state):
    """Log when agent decides not to show suggestions."""
    return log_event(EVENT_NO_OP_DECISION, {
        "user_id": user_id,
        "chat_id": chat_id,
        "reason": reason,
        "conversation_state": conversation_state
    })


def log_suggestion_ignored(user_id, chat_id, trace_id, time_visible_ms):
    """Log when suggestions were shown but user typed their own message."""
    return log_event(EVENT_SUGGESTION_IGNORED, {
        "user_id": user_id,
        "chat_id": chat_id,
        "trace_id": trace_id,
        "time_visible_ms": time_visible_ms
    })


def log_mode_selected(user_id, chat_id, mode_selected):
    """Log when user manually selects a mode (Auto/Coach/Support)."""
    return log_event(EVENT_MODE_SELECTED, {
        "user_id": user_id,
        "chat_id": chat_id,
        "mode_selected": mode_selected
    })


def log_mode_auto_detected(user_id, chat_id, mode_detected, confidence):
    """Log when mode is auto-detected."""
    return log_event(EVENT_MODE_AUTO_DETECTED, {
        "user_id": user_id,
        "chat_id": chat_id,
        "mode_detected": mode_detected,
        "confidence": confidence
    })


def log_crisis_flag(user_id, chat_id, trace_id):
    """Log when crisis flag is triggered."""
    return log_event(EVENT_CRISIS_FLAG_TRIGGERED, {
        "user_id": user_id,
        "chat_id": chat_id,
        "trace_id": trace_id
    })


def _levenshtein_ratio(s1, s2):
    """Calculate similarity ratio between two strings."""
    if not s1 or not s2:
        return 0.0
    if s1 == s2:
        return 1.0
    
    len1, len2 = len(s1), len(s2)
    if len1 < len2:
        s1, s2 = s2, s1
        len1, len2 = len2, len1
    
    # Simple ratio based on length difference and common prefix
    common = 0
    for c1, c2 in zip(s1, s2):
        if c1 == c2:
            common += 1
        else:
            break
    
    return common / max(len1, len2)


def get_metrics():
    """Get current metrics summary."""
    total_shown = _metrics.get(EVENT_SUGGESTION_SHOWN, 0)
    total_clicked = _metrics.get(EVENT_SUGGESTION_CLICKED, 0)
    total_edited = _metrics.get(EVENT_SUGGESTION_EDITED, 0)
    total_regenerate = _metrics.get(EVENT_REGENERATE_CLICKED, 0)
    total_no_op = _metrics.get(EVENT_NO_OP_DECISION, 0)
    total_ignored = _metrics.get(EVENT_SUGGESTION_IGNORED, 0)
    
    # Calculate rates
    adoption_rate = (total_shown / max(1, total_shown + total_no_op)) * 100
    ctr = (total_clicked / max(1, total_shown)) * 100
    edit_rate = (total_edited / max(1, total_clicked)) * 100
    ignore_rate = (total_ignored / max(1, total_shown)) * 100
    
    return {
        "total_events": len(_events),
        "counts": {
            "suggestions_shown": total_shown,
            "suggestions_clicked": total_clicked,
            "suggestions_edited": total_edited,
            "regenerate_clicked": total_regenerate,
            "no_op_decisions": total_no_op,
            "suggestions_ignored": total_ignored
        },
        "rates": {
            "adoption_rate": round(adoption_rate, 1),
            "ctr": round(ctr, 1),
            "edit_rate": round(edit_rate, 1),
            "ignore_rate": round(ignore_rate, 1),
            "annoyance_proxy": round((total_regenerate + total_ignored) / max(1, total_shown) * 100, 1)
        },
        "last_updated": datetime.now().isoformat()
    }


def get_recent_events(limit=100):
    """Get most recent events."""
    return _events[-limit:]


def get_user_session(user_id, chat_id):
    """Get events for a specific user session."""
    return _user_sessions.get(f"{user_id}:{chat_id}", [])


def get_cooldown_status(user_id, chat_id, cooldown_seconds=60):
    """Check if we should cooldown for this user/chat."""
    session_key = f"{user_id}:{chat_id}"
    session = _user_sessions.get(session_key, [])
    
    if not session:
        return {"should_cooldown": False, "reason": "no_history"}
    
    now = int(time.time() * 1000)
    recent_shown = [e for e in session if e["type"] == EVENT_SUGGESTION_SHOWN and now - e["timestamp"] < cooldown_seconds * 1000]
    
    if len(recent_shown) >= 1:
        last_shown = recent_shown[-1]
        time_since = (now - last_shown["timestamp"]) / 1000
        return {
            "should_cooldown": True,
            "reason": "recent_suggestion",
            "seconds_remaining": int(cooldown_seconds - time_since)
        }
    
    # Check for repeated regenerates (annoyance signal)
    recent_regenerates = [e for e in session if e["type"] == EVENT_REGENERATE_CLICKED and now - e["timestamp"] < 30000]
    if len(recent_regenerates) >= 3:
        return {
            "should_cooldown": True,
            "reason": "regenerate_spam",
            "seconds_remaining": 30
        }
    
    return {"should_cooldown": False, "reason": "ok"}
