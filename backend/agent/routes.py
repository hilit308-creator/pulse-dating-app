import time
from flask import request, jsonify
from . import agent_bp
from .engine import make_suggestions, should_abstain, make_therapist_response, detect_mode
from .store import save_feedback
from .telemetry import (
    log_suggestion_shown, log_suggestion_clicked, log_suggestion_edited,
    log_regenerate, log_no_op, get_metrics, get_recent_events, get_cooldown_status,
    log_mode_selected, log_mode_auto_detected, log_crisis_flag
)
from .decision_flow import evaluate_state, get_decision


@agent_bp.route("/agent/evaluate", methods=["POST"])
def agent_evaluate():
    """
    POST /agent/evaluate
    Unified Agent endpoint with Auto + Override mode.
    
    Request:
    {
        "user_id": str,
        "chat_id": str,
        "counterparty_id": str (optional),
        "trigger": "after_incoming_message" | "on_typing" | "on_button",
        "mode": "auto" | "coach" | "therapist",
        "draft_text": str (optional),
        "messages": [{id, from, text, ts}]
    }
    
    Response:
    {
        "mode_used": "coach" | "therapist",
        "decision": "no_op" | "suggest" | "reply",
        "cooldown_seconds": int,
        "crisis_flag": bool,
        "payload": {
            "suggestions": [{text, confidence}],
            "reply_text": str
        }
    }
    """
    data = request.get_json(force=True) or {}

    user_id = str(data.get("user_id", ""))
    chat_id = str(data.get("chat_id", ""))
    counterparty_id = str(data.get("counterparty_id", ""))
    trigger = data.get("trigger", data.get("context", {}).get("trigger_type", "unknown"))
    mode = data.get("mode", "auto")
    draft_text = data.get("draft_text", "")
    messages = data.get("messages", [])
    context = data.get("context", {}) or {}
    
    # Evaluate conversation state
    conv_state = evaluate_state(messages, context)
    state_decision = get_decision(conv_state, context)
    
    trace_id = f"{chat_id}:{int(time.time() * 1000)}"
    
    # Get last user message for mode detection
    last_user_msg = ""
    for m in reversed(messages):
        if m.get("from") == "me" and m.get("text"):
            last_user_msg = m.get("text", "")
            break
    
    # Determine mode_used
    crisis_flag = False
    mode_used = mode
    
    if mode == "auto":
        # Auto-detect mode from text
        detection = detect_mode(last_user_msg, context, messages)
        mode_used = detection["mode"]
        crisis_flag = detection["crisis_flag"]
        
        # Log auto-detection
        log_mode_auto_detected(user_id, chat_id, mode_used, detection["confidence"])
    else:
        # Manual override - log it
        log_mode_selected(user_id, chat_id, mode)
        # Still check for crisis even with manual mode
        from .engine import detect_crisis
        if detect_crisis(last_user_msg):
            crisis_flag = True
    
    # Log crisis if triggered
    if crisis_flag:
        log_crisis_flag(user_id, chat_id, trace_id)
    
    # Check cooldown (skip for button clicks)
    cooldown_seconds = state_decision["cooldown_seconds"]
    cooldown = get_cooldown_status(user_id, chat_id, cooldown_seconds)
    
    if cooldown["should_cooldown"] and trigger not in ["on_button", "button_click"]:
        log_no_op(user_id, chat_id, f"cooldown:{cooldown['reason']}", conv_state.value)
        return jsonify({
            "mode_used": mode_used,
            "decision": "no_op",
            "cooldown_seconds": cooldown.get("seconds_remaining", cooldown_seconds),
            "crisis_flag": crisis_flag,
            "state": conv_state.value,
            "payload": {
                "suggestions": [],
                "reply_text": None
            },
            "meta": {"trace_id": trace_id, "reason": f"cooldown:{cooldown['reason']}"}
        })
    
    # THERAPIST MODE - empathetic reply, no suggestions
    if mode_used == "therapist":
        response = make_therapist_response(messages, context)
        log_suggestion_shown(user_id, chat_id, [], "therapist", trace_id)
        
        return jsonify({
            "mode_used": "therapist",
            "decision": "reply",
            "cooldown_seconds": cooldown_seconds,
            "crisis_flag": crisis_flag,
            "state": conv_state.value,
            "payload": {
                "suggestions": [],
                "reply_text": response
            },
            "meta": {"trace_id": trace_id}
        })
    
    # COACH MODE - suggestions
    if not state_decision["should_suggest"]:
        log_no_op(user_id, chat_id, f"state:{conv_state.value}", conv_state.value)
        return jsonify({
            "mode_used": "coach",
            "decision": "no_op",
            "cooldown_seconds": cooldown_seconds,
            "crisis_flag": crisis_flag,
            "state": conv_state.value,
            "payload": {
                "suggestions": [],
                "reply_text": None
            },
            "meta": {"trace_id": trace_id, "reason": f"state:{conv_state.value}"}
        })

    # Generate suggestions
    out = make_suggestions(
        user_id=user_id,
        chat_id=chat_id,
        counterparty_id=counterparty_id,
        messages=messages,
        context=context,
        preferences={
            "intent": state_decision["intent"],
            "tone": state_decision["tone"],
            "length": state_decision["length"],
        }
    )
    
    suggestions = out.get("suggestions", [])[:state_decision["max_suggestions"]]
    
    # Log telemetry
    log_suggestion_shown(user_id, chat_id, suggestions, "coach", trace_id)

    return jsonify({
        "mode_used": "coach",
        "decision": "suggest",
        "cooldown_seconds": cooldown_seconds,
        "crisis_flag": crisis_flag,
        "state": conv_state.value,
        "payload": {
            "suggestions": suggestions,
            "reply_text": None
        },
        "meta": {
            "trace_id": trace_id,
            "intent": state_decision["intent"],
            "tone": state_decision["tone"]
        }
    })


# Keep old endpoint for backwards compatibility
@agent_bp.route("/agent/suggest", methods=["POST"])
def agent_suggest():
    """Legacy endpoint - calls evaluate with coach mode"""
    # Just call agent_evaluate directly - it reads from request.get_json()
    return agent_evaluate()


@agent_bp.route("/agent/feedback", methods=["POST"])
def agent_feedback():
    """
    POST /agent/feedback
    Receives feedback on what the user did with the suggestion.
    """
    data = request.get_json(force=True) or {}
    
    user_id = data.get("user_id", "unknown")
    chat_id = data.get("chat_id", "unknown")
    trace_id = data.get("trace_id", "")
    action = data.get("action", "")
    suggestion_text = data.get("suggestion_text", "")
    final_text = data.get("final_text", "")
    
    # Log to telemetry based on action
    if action == "inserted" or action == "clicked":
        log_suggestion_clicked(user_id, chat_id, suggestion_text, trace_id)
    elif action == "sent":
        if final_text and final_text != suggestion_text:
            log_suggestion_edited(user_id, chat_id, suggestion_text, final_text, trace_id)
        else:
            log_suggestion_clicked(user_id, chat_id, suggestion_text, trace_id)
    elif action == "regenerate":
        log_regenerate(user_id, chat_id, trace_id)
    
    # Also save to store
    save_feedback({
        "trace_id": trace_id,
        "action": action,
        "suggestion_text": suggestion_text,
        "final_text": final_text,
        "timestamp": data.get("timestamp", int(time.time() * 1000))
    })
    
    return jsonify({"ok": True})


@agent_bp.route("/agent/metrics", methods=["GET"])
def agent_metrics():
    """GET /agent/metrics - Dashboard metrics for telemetry."""
    return jsonify(get_metrics())


@agent_bp.route("/agent/events", methods=["GET"])
def agent_events():
    """GET /agent/events - Recent events for debugging."""
    limit = request.args.get("limit", 100, type=int)
    return jsonify({"events": get_recent_events(limit)})
