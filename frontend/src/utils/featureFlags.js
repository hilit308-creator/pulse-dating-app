const FEATURE_FLAGS_STORAGE_KEY = 'pulse_feature_flags';

export const DEFAULT_FEATURE_FLAGS = {
  nearby_phase4_venues: true,  // Enabled for venues integration
  nearby_phase6_payments: false,
  nearby_phase7_meeting_setup: false,
  nearby_phase8_post_meeting_rating: false,
};

function readJsonSafe(raw, fallback) {
  try {
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function getFeatureFlags() {
  const fromWindow =
    typeof window !== 'undefined' && window.APP_SETTINGS && window.APP_SETTINGS.featureFlags
      ? window.APP_SETTINGS.featureFlags
      : null;

  const stored =
    typeof window !== 'undefined'
      ? readJsonSafe(window.localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY), {})
      : {};

  const windowFlags = fromWindow && typeof fromWindow === 'object' ? fromWindow : {};

  return {
    ...DEFAULT_FEATURE_FLAGS,
    ...windowFlags,
    ...stored,
  };
}

export function getFeatureFlag(key, defaultValue) {
  const flags = getFeatureFlags();
  if (Object.prototype.hasOwnProperty.call(flags, key)) {
    return !!flags[key];
  }
  return !!defaultValue;
}

export function setFeatureFlag(key, value) {
  if (typeof window === 'undefined') return;
  const current = readJsonSafe(window.localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY), {});
  const next = { ...current, [key]: !!value };
  window.localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(next));
}

export function resetFeatureFlags() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(FEATURE_FLAGS_STORAGE_KEY);
}
