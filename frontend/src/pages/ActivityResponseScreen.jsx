/**
 * ActivityResponseScreen - Response screen for activity notifications
 * 
 * Spec:
 * - Entry: From notification or in-app banner
 * - Title: "There's activity around you"
 * - Text: "People nearby are active right now."
 * - Single CTA: "Check Nearby" → Navigate to Nearby tab
 * - No names, no photos, no identity exposure
 * - No dead ends
 */

import React, { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Radar, Sparkles, ArrowRight } from 'lucide-react';
import { useActivity, ACTIVITY_TYPE } from '../context/ActivityContext';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

const ActivityResponseScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { markActivityAsRead, lastActivityType } = useActivity();
  
  // Get navigation state
  const { fromNotification, type, eventId } = location.state || {};
  
  // Determine the activity type to display
  const activityType = type || lastActivityType || ACTIVITY_TYPE.SIGNAL;
  const isEventActivity = activityType === ACTIVITY_TYPE.EVENT;

  // Track screen view
  useEffect(() => {
    trackEvent('response_screen_viewed', {
      fromNotification: !!fromNotification,
      activityType,
    });
  }, [fromNotification, activityType]);

  // Handle "Check Nearby" CTA
  const handleCheckNearby = useCallback(() => {
    trackEvent('nearby_opened_from_response', {
      activityType,
    });
    
    // Mark activity as read (clears badge)
    markActivityAsRead();
    
    // Navigate to Nearby
    navigate('/nearby', { replace: true });
  }, [navigate, markActivityAsRead, activityType]);

  // Handle "View Event" CTA (for event activities)
  const handleViewEvent = useCallback(() => {
    trackEvent('event_opened_from_response', {
      eventId,
    });
    
    // Mark activity as read
    markActivityAsRead();
    
    // Navigate to event or nearby
    if (eventId) {
      navigate('/nearby/event', { 
        state: { eventId },
        replace: true,
      });
    } else {
      navigate('/events', { replace: true });
    }
  }, [navigate, markActivityAsRead, eventId]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 50%, #f0f4ff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,92,231,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 3,
          py: 6,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: 340,
          }}
        >
          {/* Animated icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '28px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                boxShadow: '0 12px 40px rgba(108,92,231,0.3)',
                position: 'relative',
              }}
            >
              {isEventActivity ? (
                <Sparkles size={48} color="white" />
              ) : (
                <Radar size={48} color="white" />
              )}
              
              {/* Pulse animation */}
              <Box
                component={motion.div}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '28px',
                  border: '2px solid',
                  borderColor: 'rgba(108,92,231,0.5)',
                }}
              />
            </Box>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#1a1a2e',
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              {isEventActivity
                ? "There's activity tonight"
                : "There's activity around you"}
            </Typography>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                mb: 5,
              }}
            >
              {isEventActivity
                ? 'People are gathering at an event you showed interest in.'
                : 'People nearby are active right now.'}
            </Typography>
          </motion.div>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{ width: '100%' }}
          >
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleCheckNearby}
              endIcon={<ArrowRight size={20} />}
              sx={{
                py: 2,
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                boxShadow: '0 8px 32px rgba(108,92,231,0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                  boxShadow: '0 10px 36px rgba(108,92,231,0.5)',
                },
              }}
            >
              Check Nearby
            </Button>
          </motion.div>

          {/* Secondary CTA for event activities */}
          {isEventActivity && eventId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              style={{ width: '100%', marginTop: 12 }}
            >
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleViewEvent}
                sx={{
                  py: 1.75,
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#6C5CE7',
                  borderWidth: 2,
                  color: '#6C5CE7',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#5b4cdb',
                    backgroundColor: 'rgba(108,92,231,0.05)',
                  },
                }}
              >
                View Event Details
              </Button>
            </motion.div>
          )}
        </motion.div>
      </Box>

      {/* Bottom safe area padding */}
      <Box sx={{ height: 'env(safe-area-inset-bottom, 20px)' }} />
    </Box>
  );
};

export default ActivityResponseScreen;
