// SOS Trust Score System
// Tracks helper reliability and influences matching priority
// Formula: trust_score = (success_rate * 0.5) + (completion_rate * 0.2) + (response_speed_score * 0.2) + (consistency_score * 0.1)

const STORAGE_KEY = 'pulse_sos_trust_scores';

// Trust Score Configuration
const CONFIG = {
  // Base score for new users
  BASE_SCORE: 50,
  
  // Weighted formula components (must sum to 1.0)
  WEIGHTS: {
    SUCCESS_RATE: 0.5,      // confirmed_helps / total_helps
    COMPLETION_RATE: 0.2,   // completed (not abandoned) / total_accepted
    RESPONSE_SPEED: 0.2,    // based on average arrival time
    CONSISTENCY: 0.1,       // regularity of helping behavior
  },
  
  // Speed scoring thresholds (in minutes)
  SPEED_THRESHOLDS: {
    EXCELLENT: 5,   // Under 5 min = 100 points
    GOOD: 10,       // Under 10 min = 80 points
    AVERAGE: 15,    // Under 15 min = 60 points
    SLOW: 20,       // Under 20 min = 40 points
    VERY_SLOW: 30,  // Under 30 min = 20 points
  },
  
  // Score bounds
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  
  // Reliability thresholds for badges/filtering
  THRESHOLDS: {
    TRUSTED_HELPER: 75,  // "Trusted Helper" badge
    EXCELLENT: 80,       // Top tier helper
    GOOD: 60,            // Reliable helper
    AVERAGE: 40,         // Normal
    LOW: 20,             // Below average - may need review
    CRITICAL: 10,        // Very low - restrict from helping
  },
  
  // Minimum helps required for reliable score
  MIN_HELPS_FOR_SCORE: 3,
  
  // Decay: scores slowly return to baseline over time
  DECAY_RATE: 0.01,   // 1% per day towards baseline
  DECAY_INTERVAL_MS: 24 * 60 * 60 * 1000, // Daily
};

// Get stored trust score data
function getStoredData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { users: {}, lastDecay: Date.now() };
    return JSON.parse(stored);
  } catch (e) {
    console.warn('Failed to load trust score data:', e);
    return { users: {}, lastDecay: Date.now() };
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save trust score data:', e);
  }
}

// Apply daily decay to all scores (move towards baseline)
function applyDecay(data) {
  const now = Date.now();
  const daysSinceLastDecay = (now - data.lastDecay) / CONFIG.DECAY_INTERVAL_MS;
  
  if (daysSinceLastDecay < 1) return data;
  
  const decayFactor = Math.pow(1 - CONFIG.DECAY_RATE, Math.floor(daysSinceLastDecay));
  
  Object.keys(data.users).forEach(userId => {
    const user = data.users[userId];
    const diff = user.score - CONFIG.BASE_SCORE;
    user.score = CONFIG.BASE_SCORE + (diff * decayFactor);
    user.score = Math.max(CONFIG.MIN_SCORE, Math.min(CONFIG.MAX_SCORE, user.score));
  });
  
  data.lastDecay = now;
  return data;
}

// Get or create user trust data
function getUserData(data, userId) {
  if (!data.users[userId]) {
    data.users[userId] = {
      // Core metrics
      totalHelps: 0,
      confirmedHelps: 0,
      unconfirmedHelps: 0,
      
      // Abandonment tracking
      totalAccepted: 0,        // Times accepted a help request
      completedHelps: 0,       // Actually arrived (not abandoned)
      cancelledHelps: 0,
      unavailableCount: 0,
      notProgressingCount: 0,
      
      // Speed tracking
      totalArrivalTimeMs: 0,   // Sum of all arrival times
      arrivalCount: 0,         // Number of arrivals (for average)
      
      // Consistency tracking
      helpDates: [],           // Array of dates when helped (for consistency calc)
      
      // Requester stats
      totalRequests: 0,
      cancelledRequests: 0,
      
      // Metadata
      lastActivity: Date.now(),
      createdAt: Date.now(),
      
      // Cached score (recalculated on access)
      _cachedScore: CONFIG.BASE_SCORE,
      _cacheTime: 0,
    };
  }
  return data.users[userId];
}

// Calculate speed score based on average arrival time
function calculateSpeedScore(avgArrivalTimeMs) {
  if (!avgArrivalTimeMs) return CONFIG.BASE_SCORE;
  
  const avgMinutes = avgArrivalTimeMs / 60000;
  
  if (avgMinutes <= CONFIG.SPEED_THRESHOLDS.EXCELLENT) return 100;
  if (avgMinutes <= CONFIG.SPEED_THRESHOLDS.GOOD) return 80;
  if (avgMinutes <= CONFIG.SPEED_THRESHOLDS.AVERAGE) return 60;
  if (avgMinutes <= CONFIG.SPEED_THRESHOLDS.SLOW) return 40;
  if (avgMinutes <= CONFIG.SPEED_THRESHOLDS.VERY_SLOW) return 20;
  return 10;
}

// Calculate consistency score based on helping regularity
function calculateConsistencyScore(helpDates) {
  if (!helpDates || helpDates.length < 2) return CONFIG.BASE_SCORE;
  
  // Get unique days helped in last 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentDates = helpDates.filter(d => d > thirtyDaysAgo);
  const uniqueDays = new Set(recentDates.map(d => new Date(d).toDateString())).size;
  
  // Score based on how many unique days helped
  if (uniqueDays >= 15) return 100;  // Helped on 15+ days in last month
  if (uniqueDays >= 10) return 80;
  if (uniqueDays >= 5) return 60;
  if (uniqueDays >= 2) return 40;
  return 20;
}

// Calculate weighted trust score using the formula
function calculateTrustScore(user) {
  // If not enough data, return base score
  if (user.totalHelps < CONFIG.MIN_HELPS_FOR_SCORE) {
    return CONFIG.BASE_SCORE;
  }
  
  // Success Rate: confirmed_helps / total_helps (0-100)
  const successRate = user.totalHelps > 0 
    ? (user.confirmedHelps / user.totalHelps) * 100 
    : 50;
  
  // Completion Rate: completed (arrived) / total_accepted (0-100)
  const completionRate = user.totalAccepted > 0 
    ? (user.completedHelps / user.totalAccepted) * 100 
    : 50;
  
  // Response Speed Score (0-100)
  const avgArrivalTime = user.arrivalCount > 0 
    ? user.totalArrivalTimeMs / user.arrivalCount 
    : null;
  const speedScore = calculateSpeedScore(avgArrivalTime);
  
  // Consistency Score (0-100)
  const consistencyScore = calculateConsistencyScore(user.helpDates);
  
  // Apply weighted formula
  const score = 
    (successRate * CONFIG.WEIGHTS.SUCCESS_RATE) +
    (completionRate * CONFIG.WEIGHTS.COMPLETION_RATE) +
    (speedScore * CONFIG.WEIGHTS.RESPONSE_SPEED) +
    (consistencyScore * CONFIG.WEIGHTS.CONSISTENCY);
  
  // Clamp to bounds
  return Math.max(CONFIG.MIN_SCORE, Math.min(CONFIG.MAX_SCORE, score));
}

// Get trust score for a user
export function getTrustScore(userId) {
  const data = applyDecay(getStoredData());
  const user = getUserData(data, userId);
  
  // Calculate score using weighted formula
  const score = calculateTrustScore(user);
  
  saveData(data);
  
  const successRate = user.totalHelps > 0 
    ? Math.round((user.confirmedHelps / user.totalHelps) * 100) 
    : null;
  
  const avgArrivalTimeMs = user.arrivalCount > 0 
    ? Math.round(user.totalArrivalTimeMs / user.arrivalCount) 
    : null;
  
  return {
    score: Math.round(score),
    level: getScoreLevel(score),
    isTrustedHelper: score >= CONFIG.THRESHOLDS.TRUSTED_HELPER,
    stats: {
      totalHelps: user.totalHelps,
      confirmedHelps: user.confirmedHelps,
      successRate,
      completionRate: user.totalAccepted > 0 
        ? Math.round((user.completedHelps / user.totalAccepted) * 100) 
        : null,
      avgArrivalTimeMs,
      totalRequests: user.totalRequests,
    },
  };
}

// Get score level based on thresholds
function getScoreLevel(score) {
  if (score >= CONFIG.THRESHOLDS.EXCELLENT) return 'excellent';
  if (score >= CONFIG.THRESHOLDS.GOOD) return 'good';
  if (score >= CONFIG.THRESHOLDS.AVERAGE) return 'average';
  if (score >= CONFIG.THRESHOLDS.LOW) return 'low';
  return 'critical';
}

// Record helper accepted a request
export function recordHelperAccepted(helperId) {
  const data = applyDecay(getStoredData());
  const user = getUserData(data, helperId);
  
  user.totalAccepted++;
  user.lastActivity = Date.now();
  
  saveData(data);
  return getTrustScore(helperId);
}

// Record helper arrived (with arrival time for speed tracking)
export function recordHelperArrived(helperId, arrivalTimeMs) {
  const data = applyDecay(getStoredData());
  const user = getUserData(data, helperId);
  
  user.completedHelps++;
  user.totalArrivalTimeMs += arrivalTimeMs || 0;
  user.arrivalCount++;
  user.lastActivity = Date.now();
  
  saveData(data);
  return getTrustScore(helperId);
}

// Record helper confirmed (requester said "yes, they helped")
export function recordHelpConfirmed(helperId) {
  const data = applyDecay(getStoredData());
  const user = getUserData(data, helperId);
  
  user.totalHelps++;
  user.confirmedHelps++;
  user.helpDates.push(Date.now()); // Track for consistency score
  user.lastActivity = Date.now();
  
  // Keep only last 90 days of help dates
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  user.helpDates = user.helpDates.filter(d => d > ninetyDaysAgo);
  
  saveData(data);
  return getTrustScore(helperId);
}

// Record help unconfirmed (timeout without confirmation)
export function recordHelpUnconfirmed(helperId) {
  const data = applyDecay(getStoredData());
  const user = getUserData(data, helperId);
  
  user.totalHelps++;
  user.unconfirmedHelps++;
  user.lastActivity = Date.now();
  
  saveData(data);
  return getTrustScore(helperId);
}

// Record helper cancelled after accepting
export function recordHelpCancelled(helperId) {
  const data = applyDecay(getStoredData());
  const user = getUserData(data, helperId);
  
  user.cancelledHelps++;
  user.lastActivity = Date.now();
  
  saveData(data);
  return getTrustScore(helperId);
}

// Record helper became unavailable (no heartbeat)
export function recordHelperUnavailable(helperId) {
  const data = applyDecay(getStoredData());
  const user = getUserData(data, helperId);
  
  user.unavailableCount++;
  user.lastActivity = Date.now();
  
  saveData(data);
  return getTrustScore(helperId);
}

// Record helper not progressing (didn't approach)
export function recordHelperNotProgressing(helperId) {
  const data = applyDecay(getStoredData());
  const user = getUserData(data, helperId);
  
  user.notProgressingCount++;
  user.lastActivity = Date.now();
  
  saveData(data);
  return getTrustScore(helperId);
}

// Record requester completed a session
export function recordRequestCompleted(requesterId) {
  const data = applyDecay(getStoredData());
  const user = getUserData(data, requesterId);
  
  user.totalRequests++;
  user.lastActivity = Date.now();
  
  saveData(data);
  return getTrustScore(requesterId);
}

// Record requester cancelled SOS
export function recordRequestCancelled(requesterId) {
  const data = applyDecay(getStoredData());
  const user = getUserData(data, requesterId);
  
  user.cancelledRequests++;
  user.lastActivity = Date.now();
  
  saveData(data);
  return getTrustScore(requesterId);
}

// Check if user can be a helper (not in critical state)
export function canBeHelper(userId) {
  const { score, level } = getTrustScore(userId);
  
  if (level === 'critical') {
    return {
      allowed: false,
      reason: 'trust_score_too_low',
      message: 'Your helper status is currently restricted. Please contact support.',
    };
  }
  
  return { allowed: true, score, level };
}

// Get helper priority for matching (higher score = higher priority)
export function getHelperPriority(userId) {
  const { score, level } = getTrustScore(userId);
  
  // Priority multiplier based on level
  const multipliers = {
    excellent: 1.5,
    good: 1.2,
    average: 1.0,
    low: 0.7,
    critical: 0,
  };
  
  return {
    priority: score * (multipliers[level] || 1.0),
    score,
    level,
  };
}

// Get leaderboard of top helpers
export function getTopHelpers(limit = 10) {
  const data = applyDecay(getStoredData());
  
  const helpers = Object.entries(data.users)
    .filter(([_, user]) => user.totalHelps > 0)
    .map(([userId, user]) => ({
      userId,
      score: Math.round(user.score),
      level: getScoreLevel(user.score),
      totalHelps: user.totalHelps,
      confirmedHelps: user.confirmedHelps,
      successRate: Math.round((user.confirmedHelps / user.totalHelps) * 100),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  saveData(data);
  return helpers;
}

// Get detailed stats for a user
export function getDetailedStats(userId) {
  const data = applyDecay(getStoredData());
  const user = getUserData(data, userId);
  saveData(data);
  
  return {
    score: Math.round(user.score),
    level: getScoreLevel(user.score),
    asHelper: {
      totalHelps: user.totalHelps,
      confirmedHelps: user.confirmedHelps,
      unconfirmedHelps: user.unconfirmedHelps,
      cancelledHelps: user.cancelledHelps,
      unavailableCount: user.unavailableCount,
      notProgressingCount: user.notProgressingCount,
      successRate: user.totalHelps > 0 
        ? Math.round((user.confirmedHelps / user.totalHelps) * 100) 
        : null,
    },
    asRequester: {
      totalRequests: user.totalRequests,
      cancelledRequests: user.cancelledRequests,
    },
    lastActivity: user.lastActivity,
    memberSince: user.createdAt,
  };
}

// Clear all trust score data (for testing)
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}

export default {
  getTrustScore,
  recordHelperAccepted,
  recordHelperArrived,
  recordHelpConfirmed,
  recordHelpUnconfirmed,
  recordHelpCancelled,
  recordHelperUnavailable,
  recordHelperNotProgressing,
  recordRequestCompleted,
  recordRequestCancelled,
  canBeHelper,
  getHelperPriority,
  getTopHelpers,
  getDetailedStats,
  clearAllData,
  CONFIG,
};
