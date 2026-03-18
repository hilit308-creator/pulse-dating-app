// SOS Abuse Prevention Service
// Safeguards for the reward system to prevent manipulation
// Implements: same-pair limits, helper cooldowns, daily caps, suspicious behavior detection

const STORAGE_KEY = 'pulse_sos_abuse_prevention';

// Configuration
const CONFIG = {
  // Cooldown between help sessions with the same user pair
  SAME_PAIR_COOLDOWN_MS: 24 * 60 * 60 * 1000, // 24 hours
  
  // Helper cooldown between receiving rewards
  HELPER_COOLDOWN_MS: 10 * 60 * 1000, // 10 minutes between rewards
  
  // Maximum rewards per day per helper
  MAX_REWARDS_PER_DAY: 5,
  
  // Maximum rewards per day per requester (to prevent farming)
  MAX_REQUESTS_PER_DAY: 3,
  
  // Minimum time between SOS requests from same user
  MIN_REQUEST_INTERVAL_MS: 30 * 60 * 1000, // 30 minutes
  
  // Pattern detection: max consecutive helps between same pair per week
  MAX_CONSECUTIVE_SAME_PAIR: 2,
  
  // Suspicious pattern thresholds
  SUSPICIOUS: {
    // Too many quick confirmations
    QUICK_CONFIRMATION_THRESHOLD_MS: 30 * 1000, // 30 seconds
    MAX_QUICK_CONFIRMATIONS_PER_DAY: 2,
    
    // Unrealistic arrival times
    MIN_REALISTIC_ARRIVAL_MS: 60 * 1000, // 1 minute minimum
    
    // Perfect confirmation rate threshold
    PERFECT_RATE_MIN_SESSIONS: 10, // Need 10+ sessions to flag
    PERFECT_RATE_THRESHOLD: 1.0,   // 100% confirmation rate
    
    // Same pair frequency
    SAME_PAIR_FREQUENCY_WINDOW_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
    SAME_PAIR_MAX_IN_WINDOW: 3,
  },
};

// Get stored abuse prevention data
function getStoredData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptyData();
    
    const data = JSON.parse(stored);
    // Clean up old entries (older than 7 days)
    cleanupOldEntries(data);
    return data;
  } catch (e) {
    console.warn('Failed to load abuse prevention data:', e);
    return createEmptyData();
  }
}

function createEmptyData() {
  return {
    helpSessions: [], // { requesterId, helperId, timestamp, confirmationTimeMs }
    dailyRewards: {}, // { date: { userId: count } }
    dailyRequests: {}, // { date: { userId: count } }
    lastRequestTime: {}, // { userId: timestamp }
    flaggedUsers: [], // Users flagged for suspicious activity
  };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save abuse prevention data:', e);
  }
}

function cleanupOldEntries(data) {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  // Clean old help sessions
  data.helpSessions = data.helpSessions.filter(s => s.timestamp > sevenDaysAgo);
  
  // Clean old daily counts (keep only last 7 days)
  const today = new Date().toISOString().split('T')[0];
  const validDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    validDates.push(date.toISOString().split('T')[0]);
  }
  
  Object.keys(data.dailyRewards).forEach(date => {
    if (!validDates.includes(date)) delete data.dailyRewards[date];
  });
  
  Object.keys(data.dailyRequests).forEach(date => {
    if (!validDates.includes(date)) delete data.dailyRequests[date];
  });
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

// Check if a help request can be made
export function canMakeRequest(requesterId) {
  const data = getStoredData();
  const today = getTodayKey();
  
  // Check daily request limit
  const dailyRequests = data.dailyRequests[today]?.[requesterId] || 0;
  if (dailyRequests >= CONFIG.MAX_REQUESTS_PER_DAY) {
    return {
      allowed: false,
      reason: 'daily_limit',
      message: 'You have reached the maximum number of SOS requests for today.',
    };
  }
  
  // Check minimum interval between requests
  const lastRequest = data.lastRequestTime[requesterId];
  if (lastRequest && (Date.now() - lastRequest) < CONFIG.MIN_REQUEST_INTERVAL_MS) {
    const waitMinutes = Math.ceil((CONFIG.MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequest)) / 60000);
    return {
      allowed: false,
      reason: 'cooldown',
      message: `Please wait ${waitMinutes} minutes before making another SOS request.`,
    };
  }
  
  // Check if user is flagged
  if (data.flaggedUsers.includes(requesterId)) {
    return {
      allowed: false,
      reason: 'flagged',
      message: 'Your account has been flagged for review. Please contact support.',
    };
  }
  
  return { allowed: true };
}

// Check if a reward can be granted
export function canGrantReward(requesterId, helperId, confirmationTimeMs) {
  const data = getStoredData();
  const today = getTodayKey();
  
  // Check helper daily reward limit
  const helperDailyRewards = data.dailyRewards[today]?.[helperId] || 0;
  if (helperDailyRewards >= CONFIG.MAX_REWARDS_PER_DAY) {
    return {
      allowed: false,
      reason: 'helper_daily_limit',
      message: 'Helper has reached maximum rewards for today.',
      grantReward: false,
    };
  }
  
  // Check same-pair cooldown
  const recentSamePair = data.helpSessions.filter(s => 
    s.requesterId === requesterId && 
    s.helperId === helperId &&
    (Date.now() - s.timestamp) < CONFIG.SAME_PAIR_COOLDOWN_MS
  );
  
  if (recentSamePair.length > 0) {
    return {
      allowed: false,
      reason: 'same_pair_cooldown',
      message: 'A reward was already granted between these users recently.',
      grantReward: false,
    };
  }
  
  // Check consecutive same-pair pattern
  const samePairSessions = data.helpSessions.filter(s => 
    s.requesterId === requesterId && s.helperId === helperId
  );
  
  if (samePairSessions.length >= CONFIG.MAX_CONSECUTIVE_SAME_PAIR) {
    // Flag for review but still allow (with reduced reward or review)
    return {
      allowed: true,
      reason: 'pattern_detected',
      message: 'Repeated help pattern detected - flagged for review.',
      grantReward: true,
      flagForReview: true,
    };
  }
  
  // Check for suspiciously quick confirmations
  if (confirmationTimeMs < CONFIG.QUICK_CONFIRMATION_THRESHOLD_MS) {
    const quickConfirmations = data.helpSessions.filter(s => 
      s.requesterId === requesterId &&
      s.confirmationTimeMs < CONFIG.QUICK_CONFIRMATION_THRESHOLD_MS &&
      (Date.now() - s.timestamp) < 24 * 60 * 60 * 1000
    );
    
    if (quickConfirmations.length >= CONFIG.MAX_QUICK_CONFIRMATIONS_PER_DAY) {
      return {
        allowed: false,
        reason: 'quick_confirmation_pattern',
        message: 'Unusual confirmation pattern detected.',
        grantReward: false,
        flagForReview: true,
      };
    }
  }
  
  // Check if either user is flagged
  if (data.flaggedUsers.includes(requesterId) || data.flaggedUsers.includes(helperId)) {
    return {
      allowed: false,
      reason: 'user_flagged',
      message: 'One of the users is flagged for review.',
      grantReward: false,
    };
  }
  
  return { allowed: true, grantReward: true };
}

// Record a help request
export function recordRequest(requesterId) {
  const data = getStoredData();
  const today = getTodayKey();
  
  // Update daily requests
  if (!data.dailyRequests[today]) data.dailyRequests[today] = {};
  data.dailyRequests[today][requesterId] = (data.dailyRequests[today][requesterId] || 0) + 1;
  
  // Update last request time
  data.lastRequestTime[requesterId] = Date.now();
  
  saveData(data);
}

// Record a completed help session with reward
export function recordHelpSession(requesterId, helperId, confirmationTimeMs) {
  const data = getStoredData();
  const today = getTodayKey();
  
  // Add help session
  data.helpSessions.push({
    requesterId,
    helperId,
    timestamp: Date.now(),
    confirmationTimeMs,
  });
  
  // Update daily rewards for helper
  if (!data.dailyRewards[today]) data.dailyRewards[today] = {};
  data.dailyRewards[today][helperId] = (data.dailyRewards[today][helperId] || 0) + 1;
  
  saveData(data);
}

// Flag a user for suspicious activity
export function flagUser(userId, reason) {
  const data = getStoredData();
  
  if (!data.flaggedUsers.includes(userId)) {
    data.flaggedUsers.push(userId);
  }
  
  // In production, this would also send to backend for review
  console.warn(`User ${userId} flagged for: ${reason}`);
  
  saveData(data);
}

// Get abuse prevention stats for a user
export function getUserStats(userId) {
  const data = getStoredData();
  const today = getTodayKey();
  
  return {
    dailyRequests: data.dailyRequests[today]?.[userId] || 0,
    dailyRewards: data.dailyRewards[today]?.[userId] || 0,
    lastRequestTime: data.lastRequestTime[userId] || null,
    isFlagged: data.flaggedUsers.includes(userId),
    totalHelpSessions: data.helpSessions.filter(s => 
      s.requesterId === userId || s.helperId === userId
    ).length,
  };
}

// Clear all abuse prevention data (for testing)
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}

export default {
  canMakeRequest,
  canGrantReward,
  recordRequest,
  recordHelpSession,
  flagUser,
  getUserStats,
  clearAllData,
  CONFIG,
};
