// frontend/src/services/analytics.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Analytics event types (for reference):
// message_sent, message_deleted, call_started, call_ended, quick_action_selected,
// attachment_uploaded, voice_record_started, voice_record_stopped, voice_record_sent,
// chat_muted, chat_unmuted, user_blocked, user_unblocked, chat_cleared, chat_deleted,
// chat_reported, chat_theme_changed,
// SOS: sos_requested, sos_helper_found, sos_helper_approaching, sos_helper_arrived,
// sos_confirmed, sos_unconfirmed, sos_cancelled, sos_helper_unavailable,
// sos_helper_not_progressing, sos_reward_granted,
// Meeting: meeting_started, meeting_ended

export async function track(event, payload = {}) {
  try {
    const device = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    };
    const appVersion = window.__APP_VERSION__ || '0.1.0';

    await fetch(`${API_URL}/api/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, payload, device, appVersion }),
      keepalive: true,
    });
  } catch (e) {
    // non-blocking
  }
}

// SOS Analytics Helper - tracks full lifecycle with timing metrics
let currentSOSSession = null;

export function startSOSSession() {
  const sessionId = `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  currentSOSSession = {
    sessionId,
    requestedAt: Date.now(),
  };
  track('sos_requested', { sessionId });
  return sessionId;
}

export function trackSOSHelperFound(helperId, distance) {
  if (!currentSOSSession) return;
  currentSOSSession.helperFoundAt = Date.now();
  const timeToFind = currentSOSSession.helperFoundAt - currentSOSSession.requestedAt;
  track('sos_helper_found', {
    sessionId: currentSOSSession.sessionId,
    timeToFindMs: timeToFind,
    helperId,
    distance,
  });
}

export function trackSOSHelperApproaching(helperId, distance) {
  if (!currentSOSSession) return;
  track('sos_helper_approaching', {
    sessionId: currentSOSSession.sessionId,
    helperId,
    distance,
  });
}

export function trackSOSHelperArrived(helperId) {
  if (!currentSOSSession) return;
  currentSOSSession.helperArrivedAt = Date.now();
  const timeToArrive = currentSOSSession.helperArrivedAt - (currentSOSSession.helperFoundAt || currentSOSSession.requestedAt);
  track('sos_helper_arrived', {
    sessionId: currentSOSSession.sessionId,
    timeToArriveMs: timeToArrive,
    totalTimeMs: currentSOSSession.helperArrivedAt - currentSOSSession.requestedAt,
    helperId,
  });
}

export function trackSOSConfirmed(rewardPoints) {
  if (!currentSOSSession) return;
  currentSOSSession.resolvedAt = Date.now();
  currentSOSSession.outcome = 'confirmed';
  const totalTime = currentSOSSession.resolvedAt - currentSOSSession.requestedAt;
  track('sos_confirmed', {
    sessionId: currentSOSSession.sessionId,
    totalTimeMs: totalTime,
    rewardPoints,
  });
  if (rewardPoints) {
    track('sos_reward_granted', {
      sessionId: currentSOSSession.sessionId,
      points: rewardPoints,
    });
  }
  currentSOSSession = null;
}

export function trackSOSUnconfirmed() {
  if (!currentSOSSession) return;
  currentSOSSession.resolvedAt = Date.now();
  currentSOSSession.outcome = 'unconfirmed';
  track('sos_unconfirmed', {
    sessionId: currentSOSSession.sessionId,
    totalTimeMs: currentSOSSession.resolvedAt - currentSOSSession.requestedAt,
  });
  currentSOSSession = null;
}

export function trackSOSCancelled(stage) {
  if (!currentSOSSession) return;
  currentSOSSession.resolvedAt = Date.now();
  currentSOSSession.outcome = 'cancelled';
  track('sos_cancelled', {
    sessionId: currentSOSSession.sessionId,
    cancelledAtStage: stage,
    totalTimeMs: currentSOSSession.resolvedAt - currentSOSSession.requestedAt,
  });
  currentSOSSession = null;
}

export function trackSOSHelperUnavailable() {
  if (!currentSOSSession) return;
  track('sos_helper_unavailable', {
    sessionId: currentSOSSession.sessionId,
    timeMs: Date.now() - currentSOSSession.requestedAt,
  });
}

export function trackSOSHelperNotProgressing() {
  if (!currentSOSSession) return;
  track('sos_helper_not_progressing', {
    sessionId: currentSOSSession.sessionId,
    timeMs: Date.now() - currentSOSSession.requestedAt,
  });
}

export function trackMeetingStarted(matchId, matchName) {
  track('meeting_started', { matchId, matchName });
}

export function trackMeetingEnded(matchId, durationMs, hadSOS) {
  track('meeting_ended', { matchId, durationMs, hadSOS });
}

export function getSOSSessionId() {
  return currentSOSSession ? currentSOSSession.sessionId : null;
}
