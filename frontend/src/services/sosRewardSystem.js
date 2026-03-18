// SOS Smart Reward System
// Calculates rewards with bonuses based on performance
// Core Rule: No reward unless helper_arrived AND requester_confirmed

const STORAGE_KEY = 'pulse_sos_rewards';

// Reward Configuration
const CONFIG = {
  // Base reward
  BASE_REWARD: 150,
  
  // Bonus rewards
  BONUSES: {
    FIRST_HELP_OF_DAY: 25,      // First help today
    LONG_DISTANCE: 20,          // Traveled > 500m
    FAST_ARRIVAL: 15,           // Arrived in < 5 minutes
    TRUSTED_HELPER: 10,         // Has "Trusted Helper" badge
  },
  
  // Distance thresholds (in km)
  DISTANCE: {
    LONG: 0.5,    // 500m+ = long distance bonus
    VERY_LONG: 1, // 1km+ = extra bonus (future)
  },
  
  // Speed thresholds (in ms)
  SPEED: {
    FAST: 5 * 60 * 1000,      // 5 minutes
    VERY_FAST: 3 * 60 * 1000, // 3 minutes (future extra bonus)
  },
  
  // Diminishing returns for repeated interactions
  DIMINISHING_RETURNS: {
    ENABLED: true,
    SAME_PAIR_MULTIPLIERS: [
      1.0,   // 1st interaction: 100%
      0.75,  // 2nd interaction: 75%
      0.5,   // 3rd interaction: 50%
      0.25,  // 4th interaction: 25%
      0,     // 5th+ interaction: 0% (no reward)
    ],
    RESET_AFTER_DAYS: 7, // Reset counter after 7 days
  },
  
  // Daily limits
  MAX_REWARDS_PER_DAY: 5,
};

// Get stored reward data
function getStoredData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptyData();
    return JSON.parse(stored);
  } catch (e) {
    console.warn('Failed to load reward data:', e);
    return createEmptyData();
  }
}

function createEmptyData() {
  return {
    dailyRewards: {},      // { date: { userId: count } }
    pairInteractions: {},  // { pairKey: { count, lastInteraction } }
    rewardHistory: [],     // Array of reward records
  };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save reward data:', e);
  }
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getPairKey(requesterId, helperId) {
  return [requesterId, helperId].sort().join('_');
}

// Clean up old data
function cleanupOldData(data) {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  // Clean old daily rewards
  const today = getTodayKey();
  Object.keys(data.dailyRewards).forEach(date => {
    if (date !== today) delete data.dailyRewards[date];
  });
  
  // Clean old pair interactions
  Object.keys(data.pairInteractions).forEach(pairKey => {
    const pair = data.pairInteractions[pairKey];
    if (pair.lastInteraction < sevenDaysAgo) {
      delete data.pairInteractions[pairKey];
    }
  });
  
  // Keep only last 100 reward records
  if (data.rewardHistory.length > 100) {
    data.rewardHistory = data.rewardHistory.slice(-100);
  }
  
  return data;
}

// Calculate reward for a help session
export function calculateReward({
  requesterId,
  helperId,
  distanceKm,
  arrivalTimeMs,
  isTrustedHelper = false,
}) {
  const data = cleanupOldData(getStoredData());
  const today = getTodayKey();
  
  // Initialize tracking
  if (!data.dailyRewards[today]) data.dailyRewards[today] = {};
  
  const pairKey = getPairKey(requesterId, helperId);
  if (!data.pairInteractions[pairKey]) {
    data.pairInteractions[pairKey] = { count: 0, lastInteraction: 0 };
  }
  
  // Check daily limit
  const helperDailyCount = data.dailyRewards[today][helperId] || 0;
  if (helperDailyCount >= CONFIG.MAX_REWARDS_PER_DAY) {
    saveData(data);
    return {
      eligible: false,
      reason: 'daily_limit_reached',
      message: 'Daily reward limit reached. Help is still appreciated!',
      baseReward: 0,
      bonuses: [],
      totalReward: 0,
    };
  }
  
  // Calculate diminishing returns multiplier
  const pairData = data.pairInteractions[pairKey];
  let diminishingMultiplier = 1.0;
  
  if (CONFIG.DIMINISHING_RETURNS.ENABLED) {
    const multipliers = CONFIG.DIMINISHING_RETURNS.SAME_PAIR_MULTIPLIERS;
    const interactionIndex = Math.min(pairData.count, multipliers.length - 1);
    diminishingMultiplier = multipliers[interactionIndex];
    
    if (diminishingMultiplier === 0) {
      saveData(data);
      return {
        eligible: false,
        reason: 'diminishing_returns',
        message: 'Reward reduced due to repeated interactions with same user.',
        baseReward: 0,
        bonuses: [],
        totalReward: 0,
      };
    }
  }
  
  // Calculate base reward
  let baseReward = CONFIG.BASE_REWARD;
  const bonuses = [];
  
  // Check for first help of day bonus
  if (helperDailyCount === 0) {
    bonuses.push({
      type: 'first_help_of_day',
      amount: CONFIG.BONUSES.FIRST_HELP_OF_DAY,
      label: 'First help today! 🌟',
    });
  }
  
  // Check for long distance bonus
  if (distanceKm && distanceKm >= CONFIG.DISTANCE.LONG) {
    bonuses.push({
      type: 'long_distance',
      amount: CONFIG.BONUSES.LONG_DISTANCE,
      label: `Traveled ${(distanceKm * 1000).toFixed(0)}m 🚶`,
    });
  }
  
  // Check for fast arrival bonus
  if (arrivalTimeMs && arrivalTimeMs <= CONFIG.SPEED.FAST) {
    bonuses.push({
      type: 'fast_arrival',
      amount: CONFIG.BONUSES.FAST_ARRIVAL,
      label: 'Quick response! ⚡',
    });
  }
  
  // Check for trusted helper bonus
  if (isTrustedHelper) {
    bonuses.push({
      type: 'trusted_helper',
      amount: CONFIG.BONUSES.TRUSTED_HELPER,
      label: 'Trusted Helper 🛡️',
    });
  }
  
  // Calculate total
  const bonusTotal = bonuses.reduce((sum, b) => sum + b.amount, 0);
  const subtotal = baseReward + bonusTotal;
  const totalReward = Math.round(subtotal * diminishingMultiplier);
  
  saveData(data);
  
  return {
    eligible: true,
    baseReward,
    bonuses,
    bonusTotal,
    diminishingMultiplier,
    totalReward,
    breakdown: {
      base: baseReward,
      bonuses: bonusTotal,
      multiplier: diminishingMultiplier,
      final: totalReward,
    },
  };
}

// Grant reward (call after confirmation)
export function grantReward({
  requesterId,
  helperId,
  distanceKm,
  arrivalTimeMs,
  isTrustedHelper = false,
}) {
  const calculation = calculateReward({
    requesterId,
    helperId,
    distanceKm,
    arrivalTimeMs,
    isTrustedHelper,
  });
  
  if (!calculation.eligible) {
    return calculation;
  }
  
  const data = getStoredData();
  const today = getTodayKey();
  const pairKey = getPairKey(requesterId, helperId);
  
  // Update daily count
  if (!data.dailyRewards[today]) data.dailyRewards[today] = {};
  data.dailyRewards[today][helperId] = (data.dailyRewards[today][helperId] || 0) + 1;
  
  // Update pair interaction count
  if (!data.pairInteractions[pairKey]) {
    data.pairInteractions[pairKey] = { count: 0, lastInteraction: 0 };
  }
  data.pairInteractions[pairKey].count++;
  data.pairInteractions[pairKey].lastInteraction = Date.now();
  
  // Record reward
  data.rewardHistory.push({
    timestamp: Date.now(),
    requesterId,
    helperId,
    reward: calculation.totalReward,
    bonuses: calculation.bonuses.map(b => b.type),
  });
  
  saveData(data);
  
  // In production, this would also call the backend to persist the reward
  // and update the user's points balance
  
  return {
    ...calculation,
    granted: true,
  };
}

// Check if reward is possible (pre-check before confirmation)
export function canReceiveReward(requesterId, helperId) {
  const data = cleanupOldData(getStoredData());
  const today = getTodayKey();
  const pairKey = getPairKey(requesterId, helperId);
  
  // Check daily limit
  const helperDailyCount = data.dailyRewards[today]?.[helperId] || 0;
  if (helperDailyCount >= CONFIG.MAX_REWARDS_PER_DAY) {
    return {
      canReceive: false,
      reason: 'daily_limit',
      message: 'Helper has reached daily reward limit.',
    };
  }
  
  // Check diminishing returns
  const pairCount = data.pairInteractions[pairKey]?.count || 0;
  const multipliers = CONFIG.DIMINISHING_RETURNS.SAME_PAIR_MULTIPLIERS;
  if (pairCount >= multipliers.length - 1 && multipliers[multipliers.length - 1] === 0) {
    return {
      canReceive: false,
      reason: 'repeated_pair',
      message: 'Too many interactions between same users.',
    };
  }
  
  saveData(data);
  
  return {
    canReceive: true,
    dailyRemaining: CONFIG.MAX_REWARDS_PER_DAY - helperDailyCount,
    pairInteractions: pairCount,
  };
}

// Get reward stats for a user
export function getRewardStats(userId) {
  const data = getStoredData();
  const today = getTodayKey();
  
  const todayCount = data.dailyRewards[today]?.[userId] || 0;
  const totalRewards = data.rewardHistory.filter(r => r.helperId === userId).length;
  const totalPoints = data.rewardHistory
    .filter(r => r.helperId === userId)
    .reduce((sum, r) => sum + r.reward, 0);
  
  return {
    todayCount,
    todayRemaining: CONFIG.MAX_REWARDS_PER_DAY - todayCount,
    totalRewards,
    totalPoints,
  };
}

// Clear all reward data (for testing)
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}

export default {
  calculateReward,
  grantReward,
  canReceiveReward,
  getRewardStats,
  clearAllData,
  CONFIG,
};
