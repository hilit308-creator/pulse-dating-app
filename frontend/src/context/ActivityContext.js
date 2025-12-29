/**
 * ActivityContext - Response & Feedback Flow State Management
 * 
 * Purpose: Give users feedback on activities (Signal/Event) without
 * exposing identities, chat, or match functionality.
 * 
 * State:
 * - hasUnreadActivity: boolean - show badge indicator
 * - lastActivityType: 'signal' | 'event' | null
 * - lastActivityTimestamp: ISO string
 * - pendingNotification: object | null - for in-app banner
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Activity types per spec
export const ACTIVITY_TYPE = {
  SIGNAL: 'signal',
  EVENT: 'event',
};

// Storage keys
const STORAGE_KEYS = {
  ACTIVITY_STATE: 'pulse_activity_state',
};

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
  // TODO: Implement real analytics (e.g., Firebase, Mixpanel)
};

const ActivityContext = createContext(null);

export function ActivityProvider({ children }) {
  // Core activity state per spec
  const [hasUnreadActivity, setHasUnreadActivity] = useState(false);
  const [lastActivityType, setLastActivityType] = useState(null);
  const [lastActivityTimestamp, setLastActivityTimestamp] = useState(null);
  
  // Pending notification for in-app banner
  const [pendingNotification, setPendingNotification] = useState(null);
  
  // Notification queue for offline handling
  const [notificationQueue, setNotificationQueue] = useState([]);
  
  // Online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY_STATE);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHasUnreadActivity(parsed.hasUnreadActivity || false);
        setLastActivityType(parsed.lastActivityType || null);
        setLastActivityTimestamp(parsed.lastActivityTimestamp || null);
      }
    } catch (err) {
      console.error('Error loading activity state:', err);
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_STATE, JSON.stringify({
        hasUnreadActivity,
        lastActivityType,
        lastActivityTimestamp,
      }));
    } catch (err) {
      console.error('Error persisting activity state:', err);
    }
  }, [hasUnreadActivity, lastActivityType, lastActivityTimestamp]);

  // Online/offline handling per spec
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process queued notifications when back online
      if (notificationQueue.length > 0) {
        notificationQueue.forEach(notification => {
          triggerActivity(notification.type, notification.data);
        });
        setNotificationQueue([]);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [notificationQueue]);

  /**
   * Trigger a new activity event
   * Called when: signal_received, event_activity_detected
   */
  const triggerActivity = useCallback((type, data = {}) => {
    // Don't send notifications if offline - queue for later
    if (!navigator.onLine) {
      setNotificationQueue(prev => [...prev, { type, data, timestamp: new Date().toISOString() }]);
      return;
    }

    const timestamp = new Date().toISOString();
    
    // Update state
    setHasUnreadActivity(true);
    setLastActivityType(type);
    setLastActivityTimestamp(timestamp);
    
    // Create notification based on type
    let notification = null;
    
    if (type === ACTIVITY_TYPE.SIGNAL) {
      notification = {
        id: `notif_${Date.now()}`,
        type: ACTIVITY_TYPE.SIGNAL,
        title: "Something's happening nearby",
        body: 'Someone around you is open to connect',
        action: 'nearby', // Navigate to Nearby tab
        timestamp,
      };
      trackEvent('notification_sent', { type: 'signal_received' });
    } else if (type === ACTIVITY_TYPE.EVENT) {
      notification = {
        id: `notif_${Date.now()}`,
        type: ACTIVITY_TYPE.EVENT,
        title: 'People are active tonight',
        body: "There's activity around an event you viewed",
        action: 'event', // Navigate to Event Details
        eventId: data.eventId,
        timestamp,
      };
      trackEvent('notification_sent', { type: 'event_activity' });
    }
    
    // Set pending notification for in-app banner
    if (notification) {
      setPendingNotification(notification);
    }
  }, []);

  /**
   * Clear the pending notification (after banner is dismissed)
   */
  const clearPendingNotification = useCallback(() => {
    setPendingNotification(null);
  }, []);

  /**
   * Mark activity as read - called when user enters Nearby or Event
   * Clears the badge
   */
  const markActivityAsRead = useCallback(() => {
    setHasUnreadActivity(false);
    trackEvent('activity_marked_read', { type: lastActivityType });
  }, [lastActivityType]);

  /**
   * Handle notification opened - for analytics
   */
  const handleNotificationOpened = useCallback((notification) => {
    trackEvent('notification_opened', { 
      type: notification.type,
      action: notification.action,
    });
  }, []);

  /**
   * Simulate receiving activity (for testing/demo)
   * In production, this would come from push notifications or WebSocket
   */
  const simulateActivity = useCallback((type = ACTIVITY_TYPE.SIGNAL) => {
    const data = type === ACTIVITY_TYPE.EVENT ? { eventId: 'event_demo_123' } : {};
    triggerActivity(type, data);
  }, [triggerActivity]);

  const value = {
    // State
    hasUnreadActivity,
    lastActivityType,
    lastActivityTimestamp,
    pendingNotification,
    isOnline,
    
    // Actions
    triggerActivity,
    clearPendingNotification,
    markActivityAsRead,
    handleNotificationOpened,
    simulateActivity,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}

export default ActivityContext;
