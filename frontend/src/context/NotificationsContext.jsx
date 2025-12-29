/**
 * NotificationsContext - Pulse Notifications System
 * 
 * Product Principles (LOCKED):
 * - No notification flooding
 * - No urgency language
 * - No "you missed something" 
 * - No scores, ratings, or pressure
 * - Every notification must justify its existence
 * 
 * Pulse doesn't compete for attention — it respects it.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Notification Types
export const NOTIFICATION_TYPE = {
  MATCH: 'match',
  MESSAGE: 'message',
  EVENT: 'event',
  SYSTEM: 'system',
};

// Notification Sub-types
export const NOTIFICATION_SUBTYPE = {
  // Match
  NEW_MATCH: 'new_match',
  // Message
  NEW_MESSAGE: 'new_message',
  // Event
  EVENT_REMINDER: 'event_reminder',
  PLUS_ONE_INVITE: 'plus_one_invite',
  EVENT_STARTING: 'event_starting',
  // System
  BLOCK_CONFIRM: 'block_confirm',
  REPORT_SUBMITTED: 'report_submitted',
  EVENT_ENDED: 'event_ended',
};

// Soft copy variations - non-aggressive, invitation-like
const NOTIFICATION_COPY = {
  [NOTIFICATION_SUBTYPE.NEW_MATCH]: [
    "You've got a new connection",
    "Someone you liked liked you back",
    "A new connection is waiting",
  ],
  [NOTIFICATION_SUBTYPE.NEW_MESSAGE]: [
    "Sent you a message",
    "New message",
  ],
  [NOTIFICATION_SUBTYPE.EVENT_REMINDER]: [
    "Event tonight — looks like your kind of vibe",
    "Your event is today",
    "Something's happening tonight",
  ],
  [NOTIFICATION_SUBTYPE.PLUS_ONE_INVITE]: [
    "You've been invited as a +1",
    "Someone wants you to join them",
  ],
  [NOTIFICATION_SUBTYPE.EVENT_STARTING]: [
    "Event is starting soon",
    "Almost time for the event",
  ],
  [NOTIFICATION_SUBTYPE.BLOCK_CONFIRM]: [
    "You blocked this user. You won't receive messages from them.",
  ],
  [NOTIFICATION_SUBTYPE.REPORT_SUBMITTED]: [
    "Report submitted. Thank you for helping keep Pulse safe.",
  ],
  [NOTIFICATION_SUBTYPE.EVENT_ENDED]: [
    "This event has ended",
  ],
};

// Icons for each type
export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPE.MATCH]: '💫',
  [NOTIFICATION_TYPE.MESSAGE]: '💬',
  [NOTIFICATION_TYPE.EVENT]: '✨',
  [NOTIFICATION_TYPE.SYSTEM]: 'ℹ️',
};

// Get random copy variation
const getRandomCopy = (subtype) => {
  const copies = NOTIFICATION_COPY[subtype] || [];
  return copies[Math.floor(Math.random() * copies.length)] || '';
};

// Context
const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  // State
  const [currentNotification, setCurrentNotification] = useState(null);
  const [quietHoursActive, setQuietHoursActive] = useState(false);
  const [notificationQueue, setNotificationQueue] = useState([]);
  
  // Track which events have already sent notifications (max 1 per event)
  const [notifiedEventIds, setNotifiedEventIds] = useState(new Set());
  
  // Quiet hours settings (would come from user settings)
  const [quietHoursSettings, setQuietHoursSettings] = useState({
    enabled: false,
    startTime: '23:00',
    endTime: '07:00',
  });

  // Check if currently in quiet hours
  const isInQuietHours = useCallback(() => {
    if (!quietHoursSettings.enabled) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startH, startM] = quietHoursSettings.startTime.split(':').map(Number);
    const [endH, endM] = quietHoursSettings.endTime.split(':').map(Number);
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;
    
    // Handle overnight quiet hours
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }
    return currentTime >= startTime && currentTime < endTime;
  }, [quietHoursSettings]);

  // Update quiet hours status
  useEffect(() => {
    const checkQuietHours = () => {
      setQuietHoursActive(isInQuietHours());
    };
    
    checkQuietHours();
    const interval = setInterval(checkQuietHours, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [isInQuietHours]);

  // Show notification
  const showNotification = useCallback((notification) => {
    // Don't show if in quiet hours (except system notifications)
    if (quietHoursActive && notification.type !== NOTIFICATION_TYPE.SYSTEM) {
      console.log('[Notifications] Quiet hours active, notification suppressed');
      return;
    }

    // Don't queue notifications during quiet hours
    // They will be shown when relevant on app open (per spec)
    
    const fullNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...notification,
      // Auto-generate copy if not provided
      body: notification.body || getRandomCopy(notification.subtype),
      // Add icon based on type
      icon: notification.icon || NOTIFICATION_ICONS[notification.type],
    };

    setCurrentNotification(fullNotification);
  }, [quietHoursActive]);

  // Dismiss current notification
  const dismissNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  // Show match notification
  const showMatchNotification = useCallback((matchData = {}) => {
    showNotification({
      type: NOTIFICATION_TYPE.MATCH,
      subtype: NOTIFICATION_SUBTYPE.NEW_MATCH,
      title: "New Connection",
      action: 'chat',
      data: matchData,
    });
  }, [showNotification]);

  // Show message notification
  const showMessageNotification = useCallback((messageData = {}) => {
    // Don't show full message content, just sender name or generic text
    const senderName = messageData.senderName || 'Someone';
    
    showNotification({
      type: NOTIFICATION_TYPE.MESSAGE,
      subtype: NOTIFICATION_SUBTYPE.NEW_MESSAGE,
      title: senderName,
      body: messageData.preview || 'Sent you a message',
      action: 'chat',
      data: messageData,
    });
  }, [showNotification]);

  // Show event notification - MAX 1 PER EVENT (per spec)
  const showEventNotification = useCallback((subtype, eventData = {}) => {
    const eventId = eventData.eventId;
    
    // Enforce max 1 notification per event
    if (eventId && notifiedEventIds.has(eventId)) {
      console.log('[Notifications] Event already notified, skipping:', eventId);
      return;
    }
    
    const titles = {
      [NOTIFICATION_SUBTYPE.EVENT_REMINDER]: 'Event Tonight',
      [NOTIFICATION_SUBTYPE.PLUS_ONE_INVITE]: '+1 Invitation',
      [NOTIFICATION_SUBTYPE.EVENT_STARTING]: 'Starting Soon',
    };

    // Mark event as notified
    if (eventId) {
      setNotifiedEventIds(prev => new Set([...prev, eventId]));
    }

    showNotification({
      type: NOTIFICATION_TYPE.EVENT,
      subtype,
      title: titles[subtype] || 'Event',
      action: 'event',
      data: eventData,
    });
  }, [showNotification, notifiedEventIds]);

  // Show system notification
  const showSystemNotification = useCallback((subtype, data = {}) => {
    const titles = {
      [NOTIFICATION_SUBTYPE.BLOCK_CONFIRM]: 'User Blocked',
      [NOTIFICATION_SUBTYPE.REPORT_SUBMITTED]: 'Report Submitted',
      [NOTIFICATION_SUBTYPE.EVENT_ENDED]: 'Event Ended',
    };

    showNotification({
      type: NOTIFICATION_TYPE.SYSTEM,
      subtype,
      title: titles[subtype] || 'Notice',
      action: null, // System notifications don't navigate
      data,
    });
  }, [showNotification]);

  // Update quiet hours settings
  const updateQuietHours = useCallback((settings) => {
    setQuietHoursSettings(prev => ({ ...prev, ...settings }));
    // Would also save to backend/localStorage
  }, []);

  const value = {
    // State
    currentNotification,
    quietHoursActive,
    quietHoursSettings,
    
    // Actions
    showNotification,
    dismissNotification,
    showMatchNotification,
    showMessageNotification,
    showEventNotification,
    showSystemNotification,
    updateQuietHours,
    
    // Types (for external use)
    NOTIFICATION_TYPE,
    NOTIFICATION_SUBTYPE,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// Hook
export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}

export default NotificationsContext;
