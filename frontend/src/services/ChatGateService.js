/**
 * ChatGateService - Chat Feature Gates Logic
 * 
 * 🔒 IMPORTANT: This is for UI display only.
 * The SERVER is the source of truth for gate state.
 * Client NEVER decides if messaging is allowed - only displays server result.
 * 
 * Thread States:
 * - NO_THREAD: No chat thread exists
 * - MATCHED_UNLOCKED: Match open, messages allowed
 * - MATCHED_GATED: Match exists but messages blocked
 * - BLOCKED: Blocked (report/safety/manual)
 * - EXPIRED: Communication window expired
 */

// Thread states
export const THREAD_STATES = {
  NO_THREAD: 'NO_THREAD',
  MATCHED_UNLOCKED: 'MATCHED_UNLOCKED',
  MATCHED_GATED: 'MATCHED_GATED',
  BLOCKED: 'BLOCKED',
  EXPIRED: 'EXPIRED',
};

// Block reasons
export const BLOCK_REASONS = {
  NEED_MATCH: 'NEED_MATCH',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  POINTS_FEATURE_REQUIRED: 'POINTS_FEATURE_REQUIRED',
  GATED_BY_RULE: 'GATED_BY_RULE',
  SYSTEM_BLOCKED: 'SYSTEM_BLOCKED',
};

// CTA types
export const CTA_TYPES = {
  BUY_SUBSCRIPTION: 'BUY_SUBSCRIPTION',
  USE_POINTS: 'USE_POINTS',
  NONE: 'NONE',
};

/**
 * Get gate display info for UI
 * @param {string} blockReason 
 * @param {string} language - 'en' or 'he'
 * @returns {object} { title, subtitle, ctaLabel, ctaType }
 */
export const getGateDisplayInfo = (blockReason, language = 'en') => {
  const displays = {
    [BLOCK_REASONS.NEED_MATCH]: {
      en: {
        title: 'Match first',
        subtitle: 'You can message after you match',
        ctaLabel: null,
        ctaType: CTA_TYPES.NONE,
      },
      he: {
        title: 'התאימו קודם',
        subtitle: 'תוכלו לשלוח הודעות אחרי שתתאימו',
        ctaLabel: null,
        ctaType: CTA_TYPES.NONE,
      },
    },
    [BLOCK_REASONS.SUBSCRIPTION_REQUIRED]: {
      en: {
        title: 'Premium required',
        subtitle: 'Messaging is unlocked with Premium',
        ctaLabel: 'View Premium',
        ctaType: CTA_TYPES.BUY_SUBSCRIPTION,
      },
      he: {
        title: 'נדרש פרימיום',
        subtitle: 'הודעות נפתחות עם פרימיום',
        ctaLabel: 'צפה בפרימיום',
        ctaType: CTA_TYPES.BUY_SUBSCRIPTION,
      },
    },
    [BLOCK_REASONS.POINTS_FEATURE_REQUIRED]: {
      en: {
        title: 'Unlock messaging',
        subtitle: 'Unlock 10 minutes of messaging with points',
        ctaLabel: 'Use Points',
        ctaType: CTA_TYPES.USE_POINTS,
      },
      he: {
        title: 'פתח הודעות',
        subtitle: 'פתח 10 דקות של הודעות עם נקודות',
        ctaLabel: 'השתמש בנקודות',
        ctaType: CTA_TYPES.USE_POINTS,
      },
    },
    [BLOCK_REASONS.GATED_BY_RULE]: {
      en: {
        title: 'Messaging locked',
        subtitle: 'Complete the required action to unlock',
        ctaLabel: null,
        ctaType: CTA_TYPES.NONE,
      },
      he: {
        title: 'הודעות נעולות',
        subtitle: 'השלם את הפעולה הנדרשת לפתיחה',
        ctaLabel: null,
        ctaType: CTA_TYPES.NONE,
      },
    },
    [BLOCK_REASONS.SYSTEM_BLOCKED]: {
      en: {
        title: 'Chat unavailable',
        subtitle: 'This conversation is no longer available',
        ctaLabel: null,
        ctaType: CTA_TYPES.NONE,
      },
      he: {
        title: 'צ׳אט לא זמין',
        subtitle: 'השיחה הזו אינה זמינה יותר',
        ctaLabel: null,
        ctaType: CTA_TYPES.NONE,
      },
    },
  };

  const display = displays[blockReason]?.[language] || displays[blockReason]?.en;
  return display || {
    title: 'Messaging locked',
    subtitle: 'Unable to send messages',
    ctaLabel: null,
    ctaType: CTA_TYPES.NONE,
  };
};

/**
 * Get composer placeholder based on gate state
 * @param {object} gateState 
 * @param {string} language 
 * @returns {string}
 */
export const getComposerPlaceholder = (gateState, language = 'en') => {
  if (gateState?.canSendMessage) {
    return language === 'he' ? 'הקלד הודעה...' : 'Type a message...';
  }

  const placeholders = {
    [BLOCK_REASONS.NEED_MATCH]: {
      en: 'Match to message',
      he: 'התאימו כדי לשלוח הודעה',
    },
    [BLOCK_REASONS.SUBSCRIPTION_REQUIRED]: {
      en: 'Upgrade to message',
      he: 'שדרגו כדי לשלוח הודעה',
    },
    [BLOCK_REASONS.POINTS_FEATURE_REQUIRED]: {
      en: 'Unlock to message',
      he: 'פתחו כדי לשלוח הודעה',
    },
    [BLOCK_REASONS.GATED_BY_RULE]: {
      en: 'Messaging locked',
      he: 'הודעות נעולות',
    },
    [BLOCK_REASONS.SYSTEM_BLOCKED]: {
      en: 'Chat unavailable',
      he: 'צ׳אט לא זמין',
    },
  };

  const reason = gateState?.blockReason;
  return placeholders[reason]?.[language] || placeholders[reason]?.en || 
    (language === 'he' ? 'הודעות נעולות' : 'Messaging locked');
};

/**
 * Check if thread can send messages
 * @param {object} thread 
 * @returns {boolean}
 */
export const canSendMessage = (thread) => {
  if (!thread) return false;
  if (thread.state === THREAD_STATES.BLOCKED) return false;
  if (thread.state === THREAD_STATES.EXPIRED) return false;
  return thread.gates?.canSendMessage === true;
};

/**
 * Check if gate has CTA
 * @param {object} gateState 
 * @returns {boolean}
 */
export const hasGateCTA = (gateState) => {
  if (!gateState) return false;
  if (gateState.canSendMessage) return false;
  return gateState.cta?.type && gateState.cta.type !== CTA_TYPES.NONE;
};

/**
 * Get CTA navigation target
 * @param {string} ctaType 
 * @returns {string} Route path
 */
export const getCTANavigationTarget = (ctaType) => {
  switch (ctaType) {
    case CTA_TYPES.BUY_SUBSCRIPTION:
      return '/subscriptions';
    case CTA_TYPES.USE_POINTS:
      return '/points';
    default:
      return null;
  }
};

/**
 * Format unlock timer
 * @param {string} expiresAt - ISO timestamp
 * @returns {string} Formatted time remaining
 */
export const formatUnlockTimer = (expiresAt) => {
  if (!expiresAt) return '';
  
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires - now;
  
  if (diffMs <= 0) return 'Expired';
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Track gate analytics event
 * @param {string} event 
 * @param {object} payload 
 */
export const trackGateEvent = (event, payload = {}) => {
  console.log('[ChatGate Analytics]', event, payload);
  // TODO: Implement actual analytics
};

// Analytics event names
export const GATE_EVENTS = {
  GATE_VIEWED: 'chat_gate_viewed',
  CTA_TAPPED: 'chat_gate_cta_tapped',
  UNLOCKED: 'chat_unlocked',
  BLOCKED: 'chat_blocked',
  MESSAGE_BLOCKED: 'chat_message_blocked',
};

export default {
  THREAD_STATES,
  BLOCK_REASONS,
  CTA_TYPES,
  GATE_EVENTS,
  getGateDisplayInfo,
  getComposerPlaceholder,
  canSendMessage,
  hasGateCTA,
  getCTANavigationTarget,
  formatUnlockTimer,
  trackGateEvent,
};
