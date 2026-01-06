# Agent Store - V2 placeholder for feedback storage
# Currently feedback is acknowledged but not persisted

feedback_log = []

def save_feedback(data):
    """Save feedback for future model improvements (V2)"""
    feedback_log.append(data)
    # In V2: persist to DB
    return True

def get_feedback_stats():
    """Get feedback statistics (V2)"""
    return {
        "total": len(feedback_log),
        "log": feedback_log[-100:]  # Last 100 entries
    }
