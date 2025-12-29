/**
 * InAppNotificationBanner - Pulse Notification System
 * 
 * Product Principles (LOCKED):
 * - Quiet, respectful notifications
 * - No attention competition
 * - Invitation-like, not demanding
 * - Auto-dismisses (4 seconds)
 * - No aggressive CTAs
 * 
 * Supports: Match, Message, Event, System notifications
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Heart,
  MessageCircle,
  Calendar,
  Info,
  Clock,
  Bell,
} from 'lucide-react';
import { useActivity } from '../context/ActivityContext';
import { useNotifications } from '../context/NotificationsContext';

// Auto-dismiss duration (4 seconds - balanced between readable and non-intrusive)
const AUTO_DISMISS_MS = 4000;

// Notification type constants
const NOTIFICATION_TYPE = {
  MATCH: 'match',
  MESSAGE: 'message',
  EVENT: 'event',
  SYSTEM: 'system',
};

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Get icon and color based on notification type
const getNotificationStyle = (type) => {
  switch (type) {
    case NOTIFICATION_TYPE.MATCH:
      return {
        icon: <Heart size={22} />,
        gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
        emoji: '💫',
      };
    case NOTIFICATION_TYPE.MESSAGE:
      return {
        icon: <MessageCircle size={22} />,
        gradient: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
        emoji: '💬',
      };
    case NOTIFICATION_TYPE.EVENT:
      return {
        icon: <Calendar size={22} />,
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        emoji: '✨',
      };
    case NOTIFICATION_TYPE.SYSTEM:
      return {
        icon: <Info size={22} />,
        gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
        emoji: 'ℹ️',
      };
    default:
      return {
        icon: <Bell size={22} />,
        gradient: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
        emoji: '🔔',
      };
  }
};

const InAppNotificationBanner = () => {
  const navigate = useNavigate();
  
  // Use both contexts - hooks must be called unconditionally
  const activityContext = useActivity();
  const notificationsContext = useNotifications();
  
  // Determine which notification source to use
  const notification = notificationsContext?.currentNotification || activityContext?.pendingNotification || null;
  
  const dismissFn = useMemo(() => {
    if (notificationsContext?.currentNotification) {
      return notificationsContext.dismissNotification;
    }
    return activityContext?.clearPendingNotification || (() => {});
  }, [notificationsContext?.currentNotification, notificationsContext?.dismissNotification, activityContext?.clearPendingNotification]);
  
  const [isVisible, setIsVisible] = useState(false);

  // Show banner when there's a notification
  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      trackEvent('notification_shown', { type: notification.type });
      
      // Auto-dismiss after timeout
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(dismissFn, 300);
      }, AUTO_DISMISS_MS);
      
      return () => clearTimeout(timer);
    }
  }, [notification, dismissFn]);

  // Handle banner tap - navigate based on action type
  const handleTap = useCallback(() => {
    if (!notification) return;
    
    const { action, type, data } = notification;
    
    // Navigate based on notification type and action
    switch (action) {
      case 'chat':
        if (data?.chatId) {
          navigate(`/chat/${data.chatId}`);
        } else {
          navigate('/matches');
        }
        break;
      case 'event':
        if (data?.eventId) {
          navigate(`/events/${data.eventId}`);
        } else {
          navigate('/events');
        }
        break;
      case 'nearby':
        navigate('/activity-response', {
          state: { fromNotification: true, type },
        });
        break;
      default:
        // System notifications don't navigate
        break;
    }
    
    setIsVisible(false);
    dismissFn();
  }, [notification, navigate, dismissFn]);

  // Handle dismiss
  const handleDismiss = useCallback((e) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(dismissFn, 300);
  }, [dismissFn]);

  // Handle "Remind me later" action
  const handleRemindLater = useCallback((e) => {
    e.stopPropagation();
    // In a real app, this would schedule a reminder
    console.log('[Notifications] Remind later scheduled');
    setIsVisible(false);
    dismissFn();
  }, [dismissFn]);

  // Handle "Like back" action for messages
  const handleLikeBack = useCallback((e) => {
    e.stopPropagation();
    // In a real app, this would send a like to the message sender
    console.log('[Notifications] Like back sent');
    trackEvent('notification_like_back', { type: notification?.type });
    setIsVisible(false);
    dismissFn();
  }, [dismissFn, notification]);

  // Handle "Ignore" action - dismiss without any action
  const handleIgnore = useCallback((e) => {
    e.stopPropagation();
    console.log('[Notifications] Notification ignored');
    trackEvent('notification_ignored', { type: notification?.type });
    setIsVisible(false);
    dismissFn();
  }, [dismissFn, notification]);

  // Get notification style
  const style = notification ? getNotificationStyle(notification.type) : getNotificationStyle();
  const hasAction = notification?.action && notification.action !== null;

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 30,
          }}
          style={{
            position: 'fixed',
            top: 'calc(56px + env(safe-area-inset-top, 12px))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: 'calc(100% - 32px)',
            maxWidth: 400,
          }}
        >
          <Box
            onClick={handleTap}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(108, 92, 231, 0.15)',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              transition: 'transform 0.15s ease',
              '&:hover': {
                transform: 'scale(1.01)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#fff',
              }}
            >
              {style.icon}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a2e',
                  fontSize: '0.9rem',
                  lineHeight: 1.3,
                }}
              >
                {notification?.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                  mt: 0.25,
                }}
              >
                {notification.body}
              </Typography>
            </Box>

            {/* Dismiss button */}
            <IconButton
              size="small"
              onClick={handleDismiss}
              sx={{
                color: '#94a3b8',
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <X size={18} />
            </IconButton>
          </Box>

          {/* Action Buttons - soft, non-aggressive */}
          {hasAction && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                px: 2,
                pb: 1.5,
                pt: 0.5,
              }}
            >
              {/* Primary action based on type */}
              {notification.type === NOTIFICATION_TYPE.MATCH && (
                <Button
                  size="small"
                  onClick={handleTap}
                  sx={{
                    flex: 1,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    py: 0.75,
                    bgcolor: 'rgba(236, 72, 153, 0.1)',
                    color: '#ec4899',
                    '&:hover': { bgcolor: 'rgba(236, 72, 153, 0.15)' },
                  }}
                >
                  Open chat
                </Button>
              )}
              {notification.type === NOTIFICATION_TYPE.MESSAGE && (
                <>
                  <Button
                    size="small"
                    onClick={handleTap}
                    sx={{
                      flex: 1,
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      py: 0.75,
                      bgcolor: 'rgba(108, 92, 231, 0.1)',
                      color: '#6C5CE7',
                      '&:hover': { bgcolor: 'rgba(108, 92, 231, 0.15)' },
                    }}
                  >
                    Reply
                  </Button>
                  <Button
                    size="small"
                    onClick={handleLikeBack}
                    startIcon={<Heart size={14} />}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      py: 0.75,
                      px: 1.5,
                      color: '#ec4899',
                      '&:hover': { bgcolor: 'rgba(236, 72, 153, 0.08)' },
                    }}
                  >
                    Like
                  </Button>
                  <Button
                    size="small"
                    onClick={handleIgnore}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      py: 0.75,
                      px: 1,
                      minWidth: 'auto',
                      color: '#94a3b8',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    Ignore
                  </Button>
                </>
              )}
              {notification.type === NOTIFICATION_TYPE.EVENT && (
                <Button
                  size="small"
                  onClick={handleTap}
                  sx={{
                    flex: 1,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    py: 0.75,
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.15)' },
                  }}
                >
                  View event
                </Button>
              )}
              
              {/* Remind me later - soft secondary action */}
              <Button
                size="small"
                onClick={handleRemindLater}
                startIcon={<Clock size={14} />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  py: 0.75,
                  px: 1.5,
                  color: '#94a3b8',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                }}
              >
                Later
              </Button>
            </Box>
          )}

          {/* Progress bar for auto-dismiss */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 16,
              right: 16,
              height: 3,
              borderRadius: '0 0 16px 16px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
              style={{
                height: '100%',
                background: style.gradient,
                borderRadius: 2,
              }}
            />
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InAppNotificationBanner;
