const MEETING_DRAFTS_KEY = 'pulse_nearby_meeting_drafts';

function readJsonSafe(raw, fallback) {
  try {
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function getMeetingDrafts() {
  if (typeof window === 'undefined') return {};
  return readJsonSafe(window.localStorage.getItem(MEETING_DRAFTS_KEY), {});
}

export function getMeetingDraft(matchId) {
  const key = String(matchId ?? '');
  if (!key) return null;
  const drafts = getMeetingDrafts();
  return drafts[key] || null;
}

export function saveMeetingDraft(matchId, draft) {
  if (typeof window === 'undefined') return;
  const key = String(matchId ?? '');
  if (!key) return;
  const drafts = getMeetingDrafts();
  const next = { ...drafts, [key]: draft };
  window.localStorage.setItem(MEETING_DRAFTS_KEY, JSON.stringify(next));
}

export function clearMeetingDraft(matchId) {
  if (typeof window === 'undefined') return;
  const key = String(matchId ?? '');
  if (!key) return;
  const drafts = getMeetingDrafts();
  if (!Object.prototype.hasOwnProperty.call(drafts, key)) return;
  const { [key]: _, ...rest } = drafts;
  window.localStorage.setItem(MEETING_DRAFTS_KEY, JSON.stringify(rest));
}
