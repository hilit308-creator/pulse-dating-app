/**
 * VisibilityService - Visibility Logic Calculator
 * 
 * 🔒 IMPORTANT: This is for UI display only.
 * The SERVER is the source of truth for visibility.
 * Client NEVER decides visibility - only displays server result.
 * 
 * Priority Order (Locked):
 * 1. System Override (Ban / Safety)
 * 2. Global Pause
 * 3. Time Visibility
 * 4. Location Visibility
 */

// Visibility reason constants
export const VISIBILITY_REASONS = {
  VISIBLE: 'VISIBLE',
  PAUSED: 'PAUSED',
  OUTSIDE_TIME: 'OUTSIDE_TIME',
  OUTSIDE_LOCATION: 'OUTSIDE_LOCATION',
  GPS_UNAVAILABLE: 'GPS_UNAVAILABLE',
  SYSTEM_BLOCKED: 'SYSTEM_BLOCKED',
};

// Day keys
export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// Day display names
export const DAY_NAMES = {
  mon: { en: 'Monday', he: 'שני' },
  tue: { en: 'Tuesday', he: 'שלישי' },
  wed: { en: 'Wednesday', he: 'רביעי' },
  thu: { en: 'Thursday', he: 'חמישי' },
  fri: { en: 'Friday', he: 'שישי' },
  sat: { en: 'Saturday', he: 'שבת' },
  sun: { en: 'Sunday', he: 'ראשון' },
};

// Short day names
export const DAY_SHORT = {
  mon: { en: 'Mon', he: 'ב׳' },
  tue: { en: 'Tue', he: 'ג׳' },
  wed: { en: 'Wed', he: 'ד׳' },
  thu: { en: 'Thu', he: 'ה׳' },
  fri: { en: 'Fri', he: 'ו׳' },
  sat: { en: 'Sat', he: 'ש׳' },
  sun: { en: 'Sun', he: 'א׳' },
};

/**
 * Get visibility status message for UI display
 * @param {string} reason - Visibility reason from server
 * @param {string} language - 'en' or 'he'
 * @returns {object} { message, color, icon }
 */
export const getVisibilityStatusDisplay = (reason, language = 'en') => {
  const messages = {
    [VISIBILITY_REASONS.VISIBLE]: {
      en: 'Visible now',
      he: 'נראה כרגע',
      color: '#22c55e',
      icon: 'visible',
    },
    [VISIBILITY_REASONS.PAUSED]: {
      en: "Paused — you're hidden everywhere",
      he: 'מושהה — אינך נראה לאף אחד',
      color: '#ef4444',
      icon: 'paused',
    },
    [VISIBILITY_REASONS.OUTSIDE_TIME]: {
      en: 'Outside your visible hours',
      he: 'מחוץ לשעות הפעילות שלך',
      color: '#f59e0b',
      icon: 'time',
    },
    [VISIBILITY_REASONS.OUTSIDE_LOCATION]: {
      en: "You're not inside a visible area right now",
      he: 'אינך באזור נראות כרגע',
      color: '#64748b',
      icon: 'location',
    },
    [VISIBILITY_REASONS.GPS_UNAVAILABLE]: {
      en: 'Unable to determine location',
      he: 'לא ניתן לקבוע מיקום',
      color: '#64748b',
      icon: 'gps',
    },
    [VISIBILITY_REASONS.SYSTEM_BLOCKED]: {
      en: 'Account temporarily suspended',
      he: 'החשבון מושהה זמנית',
      color: '#ef4444',
      icon: 'blocked',
    },
  };

  const status = messages[reason] || messages[VISIBILITY_REASONS.VISIBLE];
  return {
    message: status[language] || status.en,
    color: status.color,
    icon: status.icon,
  };
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Check if a point is within a circular area
 * @param {object} point - { lat, lng }
 * @param {object} area - { center: { lat, lng }, radiusMeters }
 * @returns {boolean}
 */
export const isPointInArea = (point, area) => {
  const distance = calculateDistance(
    point.lat,
    point.lng,
    area.center.lat,
    area.center.lng
  );
  return distance <= area.radiusMeters;
};

/**
 * Check if current time is within active hours for today
 * @param {object} timeSettings - Time visibility settings
 * @returns {boolean}
 */
export const isWithinActiveHours = (timeSettings) => {
  if (!timeSettings?.enabled) return true; // If disabled, always visible
  
  const now = new Date();
  const dayIndex = now.getDay(); // 0 = Sunday
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = dayKeys[dayIndex];
  
  const todaySettings = timeSettings.days?.[todayKey];
  if (!todaySettings?.enabled) return false;
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [fromHours, fromMins] = todaySettings.from.split(':').map(Number);
  const [toHours, toMins] = todaySettings.to.split(':').map(Number);
  
  const fromMinutes = fromHours * 60 + fromMins;
  const toMinutes = toHours * 60 + toMins;
  
  return currentMinutes >= fromMinutes && currentMinutes <= toMinutes;
};

/**
 * Get next time when visibility will change
 * @param {object} timeSettings - Time visibility settings
 * @returns {Date|null}
 */
export const getNextVisibilityChange = (timeSettings) => {
  if (!timeSettings?.enabled) return null;
  
  const now = new Date();
  const dayIndex = now.getDay();
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  
  // Check next 7 days
  for (let i = 0; i < 7; i++) {
    const checkDayIndex = (dayIndex + i) % 7;
    const checkDayKey = dayKeys[checkDayIndex];
    const daySettings = timeSettings.days?.[checkDayKey];
    
    if (!daySettings?.enabled) continue;
    
    const [fromHours, fromMins] = daySettings.from.split(':').map(Number);
    const [toHours, toMins] = daySettings.to.split(':').map(Number);
    
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() + i);
    
    // If today, check if we're before the start time
    if (i === 0) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const fromMinutes = fromHours * 60 + fromMins;
      const toMinutes = toHours * 60 + toMins;
      
      if (currentMinutes < fromMinutes) {
        // Next change is start of visibility
        checkDate.setHours(fromHours, fromMins, 0, 0);
        return checkDate;
      } else if (currentMinutes < toMinutes) {
        // Next change is end of visibility
        checkDate.setHours(toHours, toMins, 0, 0);
        return checkDate;
      }
      // Already past today's window, check next day
      continue;
    }
    
    // Future day - next change is start of visibility
    checkDate.setHours(fromHours, fromMins, 0, 0);
    return checkDate;
  }
  
  return null;
};

/**
 * Format time remaining until next change
 * @param {Date} nextChange 
 * @returns {string}
 */
export const formatTimeUntil = (nextChange) => {
  if (!nextChange) return '';
  
  const now = new Date();
  const diffMs = nextChange - now;
  
  if (diffMs <= 0) return '';
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24);
    return `${days}d`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMins}m`;
  } else {
    return `${diffMins}m`;
  }
};

/**
 * Validate time settings before saving
 * @param {object} timeSettings 
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateTimeSettings = (timeSettings) => {
  if (!timeSettings?.enabled) return { valid: true };
  
  const enabledDays = DAYS.filter(day => timeSettings.days?.[day]?.enabled);
  
  if (enabledDays.length === 0) {
    return { valid: false, error: 'At least one day must be enabled' };
  }
  
  for (const day of enabledDays) {
    const daySettings = timeSettings.days[day];
    if (!daySettings.from || !daySettings.to) {
      return { valid: false, error: `${day}: Missing time range` };
    }
    
    const [fromH, fromM] = daySettings.from.split(':').map(Number);
    const [toH, toM] = daySettings.to.split(':').map(Number);
    
    if (fromH * 60 + fromM >= toH * 60 + toM) {
      return { valid: false, error: `${day}: End time must be after start time` };
    }
  }
  
  return { valid: true };
};

/**
 * Validate location settings before saving
 * @param {object} locationSettings 
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateLocationSettings = (locationSettings) => {
  if (!locationSettings?.enabled) return { valid: true };
  
  const enabledAreas = locationSettings.areas?.filter(a => a.enabled) || [];
  
  if (enabledAreas.length === 0) {
    return { valid: false, error: 'At least one area must be enabled' };
  }
  
  for (const area of enabledAreas) {
    if (!area.center?.lat || !area.center?.lng) {
      return { valid: false, error: 'Invalid area coordinates' };
    }
    
    if (area.radiusMeters < 100 || area.radiusMeters > 5000) {
      return { valid: false, error: 'Radius must be between 100m and 5km' };
    }
  }
  
  return { valid: true };
};

/**
 * Get default time settings
 * @returns {object}
 */
export const getDefaultTimeSettings = () => ({
  enabled: false,
  days: {
    mon: { enabled: true, from: '18:00', to: '23:00' },
    tue: { enabled: true, from: '18:00', to: '23:00' },
    wed: { enabled: true, from: '18:00', to: '23:00' },
    thu: { enabled: true, from: '18:00', to: '23:00' },
    fri: { enabled: true, from: '14:00', to: '23:59' },
    sat: { enabled: true, from: '10:00', to: '23:59' },
    sun: { enabled: false, from: '18:00', to: '23:00' },
  },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

/**
 * Get default location settings
 * @returns {object}
 */
export const getDefaultLocationSettings = () => ({
  enabled: false,
  areas: [],
  maxAreas: 5,
});

export default {
  VISIBILITY_REASONS,
  DAYS,
  DAY_NAMES,
  DAY_SHORT,
  getVisibilityStatusDisplay,
  calculateDistance,
  isPointInArea,
  isWithinActiveHours,
  getNextVisibilityChange,
  formatTimeUntil,
  validateTimeSettings,
  validateLocationSettings,
  getDefaultTimeSettings,
  getDefaultLocationSettings,
};
