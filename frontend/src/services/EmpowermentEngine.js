/**
 * Empowerment Engine - Match Moment Copy Selector
 * 
 * Purpose: Encourage users to take the first step without pressure,
 * using short, human, confidence-building messages.
 * 
 * Rules (from spec):
 * - Never repeat the same message twice in a row
 * - Never shame, rush, or instruct
 * - Never explain why a message was shown
 * - Never frame this as "personalized" to the user
 * - Selected message is locked at match creation
 */

// Copy Pools (Locked - No dynamic generation)
const COPY_POOLS = {
  // Pool A – Gentle Initiative
  A: [
    "Someone has to break the ice —\nyou seem like a good choice.",
    "Every conversation starts with one person.\nToday, that could be you.",
  ],
  
  // Pool B – Presence over Performance
  B: [
    "This moment doesn't need planning.\nJust presence.",
    "First messages are rarely perfect.\nThey're just a beginning.",
  ],
  
  // Pool C – Normalizing Discomfort
  C: [
    "If it feels unfamiliar —\nyou're probably doing it right.",
    "Nervous is normal.\nThat's where connection starts.",
  ],
  
  // Pool D – Minimal Confidence Boost
  D: [
    "One small message can change the whole vibe.",
    "You're already halfway there.",
  ],
  
  // Pool E – Permission & Safety
  E: [
    "There's no wrong way to say hello.",
    "This doesn't have to be big.\nJust honest.",
  ],
};

// User type to pool mapping (internal only)
const USER_TYPE_POOLS = {
  hesitant_initiator: ['C', 'E'],
  overthinking_user: ['B'],
  confident_but_passive: ['A'],
  active_initiator: ['D'],
  cold_start: ['D', 'A'],
};

// Storage key for tracking last shown messages
const LAST_MESSAGE_KEY = 'pulse_empowerment_last';
const MATCH_MESSAGES_KEY = 'pulse_empowerment_matches';

/**
 * Get the last shown message ID to avoid repetition
 */
function getLastMessageId() {
  try {
    return localStorage.getItem(LAST_MESSAGE_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Save the last shown message ID
 */
function setLastMessageId(messageId) {
  try {
    localStorage.setItem(LAST_MESSAGE_KEY, messageId);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get locked message for a specific match
 */
function getMatchMessage(matchId) {
  try {
    const stored = localStorage.getItem(MATCH_MESSAGES_KEY);
    if (stored) {
      const messages = JSON.parse(stored);
      return messages[matchId] || null;
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Lock a message for a specific match
 */
function setMatchMessage(matchId, messageId, text) {
  try {
    const stored = localStorage.getItem(MATCH_MESSAGES_KEY);
    const messages = stored ? JSON.parse(stored) : {};
    messages[matchId] = { messageId, text, lockedAt: Date.now() };
    localStorage.setItem(MATCH_MESSAGES_KEY, JSON.stringify(messages));
  } catch {
    // Ignore
  }
}

/**
 * Detect user type based on behavior signals
 * @param {Object} signals - User behavior signals
 * @returns {string} User type key
 */
function detectUserType(signals = {}) {
  const {
    avgTimeToFirstMessage = null,  // ms between match and first message
    matchToChatRate = null,        // 0-1, how often matches lead to chats
    usesAiAssist = false,          // whether user uses AI writing help
    matchScreenExits = 0,          // times user exits match screen without action
    historicalInitiations = 0,     // how many times user initiated first
    isNewUser = false,
  } = signals;

  // Cold start for new users
  if (isNewUser || historicalInitiations === 0) {
    return 'cold_start';
  }

  // Hesitant: exits without action, slow to message
  if (matchScreenExits > 3 || (avgTimeToFirstMessage && avgTimeToFirstMessage > 24 * 60 * 60 * 1000)) {
    return 'hesitant_initiator';
  }

  // Overthinking: uses AI assist frequently
  if (usesAiAssist) {
    return 'overthinking_user';
  }

  // Active initiator: high initiation rate
  if (historicalInitiations > 5 && matchToChatRate > 0.6) {
    return 'active_initiator';
  }

  // Confident but passive: matches but doesn't initiate
  if (matchToChatRate !== null && matchToChatRate < 0.3 && historicalInitiations > 0) {
    return 'confident_but_passive';
  }

  // Default
  return 'cold_start';
}

/**
 * Select a message from pools, avoiding the last shown message
 * @param {string[]} poolKeys - Array of pool keys to select from
 * @returns {{messageId: string, text: string}}
 */
function selectFromPools(poolKeys) {
  const lastMessageId = getLastMessageId();
  
  // Collect all messages from specified pools
  const candidates = [];
  for (const poolKey of poolKeys) {
    const pool = COPY_POOLS[poolKey];
    if (pool) {
      pool.forEach((text, index) => {
        const messageId = `${poolKey}_${index}`;
        candidates.push({ messageId, text });
      });
    }
  }

  // Filter out last shown message
  const filtered = candidates.filter(c => c.messageId !== lastMessageId);
  
  // If all filtered out (shouldn't happen), use all candidates
  const finalCandidates = filtered.length > 0 ? filtered : candidates;
  
  // Random selection
  const selected = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];
  
  return selected;
}

/**
 * Get empowerment message for a match
 * 
 * @param {string|number} matchId - Unique match identifier
 * @param {Object} [signals] - Optional user behavior signals
 * @returns {{text: string, messageId: string}}
 */
export function getEmpowermentMessage(matchId, signals = {}) {
  // Check if message is already locked for this match
  const existing = getMatchMessage(matchId);
  if (existing) {
    return { text: existing.text, messageId: existing.messageId };
  }

  // Detect user type and get appropriate pools
  const userType = detectUserType(signals);
  const poolKeys = USER_TYPE_POOLS[userType] || USER_TYPE_POOLS.cold_start;

  // Select message
  const selected = selectFromPools(poolKeys);

  // Lock message for this match
  setMatchMessage(matchId, selected.messageId, selected.text);
  setLastMessageId(selected.messageId);

  return selected;
}

/**
 * Get all available pools (for testing/admin)
 */
export function getAllPools() {
  return COPY_POOLS;
}

/**
 * Clear empowerment data (for testing)
 */
export function clearEmpowermentData() {
  try {
    localStorage.removeItem(LAST_MESSAGE_KEY);
    localStorage.removeItem(MATCH_MESSAGES_KEY);
  } catch {
    // Ignore
  }
}

export default {
  getEmpowermentMessage,
  getAllPools,
  clearEmpowermentData,
};
