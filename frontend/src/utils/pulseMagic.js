export const PROXIMITY_UNIT_NUMBER_PATTERN = /\b\d+(?:\.\d+)?\s?(?:km|kilometers?|m|meters?)\b/gi;
export const PROXIMITY_BANNED_PATTERN = /(\bnearby\b|\baway\b|\bdistance\b|\bkm\b|\bkilometers?\b|\bmeters?\b)/gi;

export function sanitizeNoProximityText(text) {
  if (!text) return '';
  const str = String(text);
  const cleaned = str
    .replace(PROXIMITY_UNIT_NUMBER_PATTERN, '')
    .replace(PROXIMITY_BANNED_PATTERN, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned;
}

export function getViewerSignalsFromStorage() {
  try {
    const storedUser = localStorage.getItem('pulse_user');
    const storedOnboarding = localStorage.getItem('pulse_onboarding_data');
    const user = storedUser ? JSON.parse(storedUser) : {};
    const onboarding = storedOnboarding ? JSON.parse(storedOnboarding) : {};
    const merged = { ...user, ...onboarding };

    const interestsRaw = merged?.interests;
    const interests = Array.isArray(interestsRaw) ? interestsRaw.filter(Boolean) : [];

    const lookingForRaw = merged?.lookingFor;
    const lookingFor = Array.isArray(lookingForRaw)
      ? lookingForRaw.filter(Boolean)
      : (typeof lookingForRaw === 'string' && lookingForRaw ? [lookingForRaw] : []);

    return {
      interests,
      lookingFor,
    };
  } catch {
    return { interests: [], lookingFor: [] };
  }
}

function hashToIndex(value, mod) {
  const str = String(value ?? '0');
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % mod;
}

export function buildPulseMagic(person, viewerSignals) {
  const viewerInterests = viewerSignals?.interests || [];
  const viewerLookingFor = viewerSignals?.lookingFor || [];

  const personTags = Array.isArray(person?.tags) ? person.tags : [];
  const personLookingFor = Array.isArray(person?.lookingFor) ? person.lookingFor : [];

  const sharedInterests = personTags.filter((t) => viewerInterests.includes(t));
  const sharedIntents = personLookingFor.filter((x) => viewerLookingFor.includes(x));

  const aboutMoment = sanitizeNoProximityText(person?.aboutMoment);

  const vibeTemplatesInterest = [
    (x) => `You both love ${x}.`,
    (x) => `You both picked ${x} as an interest.`,
    (x) => `${x} could be an easy first topic.`,
  ];

  const vibeTemplatesIntent = [
    (x) => `Also looking for ${x}.`,
    (x) => `You both chose: ${x}.`,
  ];

  const vibeTemplatesSignal = [
    () => 'Feels like an easy conversation starter.',
    () => 'Could be a good hello.',
    () => 'A calm place to start a chat.',
  ];

  let vibeLine = '';
  let insights = [];

  if (sharedInterests.length > 0) {
    const pick = sharedInterests[0];
    vibeLine = vibeTemplatesInterest[hashToIndex(person?.id, vibeTemplatesInterest.length)](pick);

    insights = sharedInterests.slice(0, 3).map((x) => `Shared interest: ${x}`);
  } else if (sharedIntents.length > 0) {
    const pick = sharedIntents[0];
    vibeLine = vibeTemplatesIntent[hashToIndex(person?.id, vibeTemplatesIntent.length)](pick);

    insights = sharedIntents.slice(0, 3).map((x) => `You both chose: ${x}`);
  } else if (aboutMoment) {
    vibeLine = `${aboutMoment}.`;
    insights = [`They shared: “${aboutMoment}”`];
  } else {
    vibeLine = vibeTemplatesSignal[hashToIndex(person?.id, vibeTemplatesSignal.length)]();
    insights = personTags.slice(0, 3).map((x) => `They’re into ${x}`);
  }

  const normalizedInsights = (insights || []).filter(Boolean).slice(0, 3);

  return {
    vibeLine,
    insights: normalizedInsights,
  };
}
