import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Compass, ArrowRight, WifiOff, Settings, Sparkles, Bell } from 'lucide-react';
import { useAuth, PERMISSION_STATE } from '../context/AuthContext';
import { useActivity, ACTIVITY_TYPE } from '../context/ActivityContext';

// Safe bottom padding for tab bar
const SAFE_BOTTOM = 'calc(88px + env(safe-area-inset-bottom, 0px))';

// Analytics helper (placeholder - replace with real analytics)
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
  // TODO: Implement real analytics (e.g., Firebase, Mixpanel)
};

// Activity state (placeholder - would come from backend)
const ACTIVITY_STATE = {
  ACTIVITY_EXISTS: 'ACTIVITY_EXISTS',
  NO_ACTIVITY: 'NO_ACTIVITY',
};

const Home1Screen = () => {
  const navigate = useNavigate();
  const { user, permissions, updatePermission } = useAuth();
  const { simulateActivity, hasUnreadActivity } = useActivity();
  const hasCheckedRef = useRef(false);
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activityState, setActivityState] = useState(ACTIVITY_STATE.NO_ACTIVITY);
  const [showLocationDeniedDialog, setShowLocationDeniedDialog] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  
  // Determine if user is new (placeholder logic - would come from backend)
  const isNewUser = user?.isNewUser ?? !user?.lastLoginAt;
  const firstName = user?.firstName || '';
  const locationPermission = permissions?.location || PERMISSION_STATE.UNKNOWN;
  const hasLocationPermission = locationPermission === PERMISSION_STATE.GRANTED;

  // Track page view
  useEffect(() => {
    trackEvent('home_viewed', {
      isNewUser,
      hasLocation: hasLocationPermission,
      activityState,
    });
  }, []);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check state function - called on mount and on focus
  const checkState = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    // Brief loading (0.5-1s per spec) - only on first load
    if (!hasCheckedRef.current) {
      await new Promise(resolve => setTimeout(resolve, 600));
      hasCheckedRef.current = true;
    }
    
    // Check location permission status
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (result.state === 'granted') {
          updatePermission('location', PERMISSION_STATE.GRANTED);
        } else if (result.state === 'denied') {
          updatePermission('location', PERMISSION_STATE.DENIED);
        }
        
        // Listen for permission changes
        result.onchange = () => {
          if (result.state === 'granted') {
            updatePermission('location', PERMISSION_STATE.GRANTED);
          } else if (result.state === 'denied') {
            updatePermission('location', PERMISSION_STATE.DENIED);
          }
        };
      } catch (e) {
        // Permissions API not supported
      }
    }
    
    // TODO: Fetch activity state from backend
    // For now, simulate no activity
    setActivityState(ACTIVITY_STATE.NO_ACTIVITY);
    
    if (showLoading) setIsLoading(false);
  }, [updatePermission]);

  // Initial load
  useEffect(() => {
    checkState();
  }, [checkState]);

  // onFocus lifecycle - check state when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkState(false); // Don't show loading on refocus
      }
    };

    const handleFocus = () => {
      checkState(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkState]);

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    trackEvent('home_location_request_clicked');
    setIsRequestingLocation(true);
    
    try {
      const result = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              resolve('denied');
            } else {
              resolve('error');
            }
          },
          { timeout: 10000 }
        );
      });

      if (result === 'granted') {
        updatePermission('location', PERMISSION_STATE.GRANTED);
        // Auto-navigate to nearby after granting permission
        trackEvent('home_go_to_nearby_clicked');
        navigate('/nearby');
      } else {
        updatePermission('location', PERMISSION_STATE.DENIED);
        setShowLocationDeniedDialog(true);
      }
    } catch (error) {
      console.error('Location permission error:', error);
      setShowLocationDeniedDialog(true);
    } finally {
      setIsRequestingLocation(false);
    }
  }, [updatePermission, navigate]);

  // Navigation handlers
  const handleGoToNearby = () => {
    trackEvent('home_go_to_nearby_clicked');
    navigate('/nearby');
  };

  const handleGoToExplore = () => {
    trackEvent('home_go_to_explore_clicked');
    navigate('/explore');
  };

  const handleCTAClick = () => {
    trackEvent('home_cta_clicked', { state: getCurrentState() });
    
    if (!hasLocationPermission) {
      requestLocationPermission();
    } else if (activityState === ACTIVITY_STATE.ACTIVITY_EXISTS) {
      handleGoToNearby();
    } else {
      // No activity - go to explore
      handleGoToExplore();
    }
  };

  const handleOpenSettings = () => {
    // On web, we can't directly open settings
    alert('Please enable location access in your browser settings, then refresh the page.');
    setShowLocationDeniedDialog(false);
  };

  // Determine current state for UI
  const getCurrentState = () => {
    if (!hasLocationPermission) {
      return isNewUser ? 'new_no_location' : 'returning_no_location';
    }
    if (activityState === ACTIVITY_STATE.ACTIVITY_EXISTS) {
      return 'returning_with_activity';
    }
    return isNewUser ? 'new_with_location' : 'returning_no_activity';
  };

  // Get UI content based on state
  const getUIContent = () => {
    const state = getCurrentState();
    
    switch (state) {
      case 'new_no_location':
        return {
          greeting: firstName ? `Hey, ${firstName} 👋` : 'Hey 👋',
          subtext: "You're all set. One more thing to get started.",
          heroTitle: 'Enable location to get started',
          heroText: 'Pulse works around people nearby.\nYour exact location is never shown.',
          ctaText: 'Enable location',
          ctaIcon: <MapPin size={20} />,
        };
      
      case 'new_with_location':
        return {
          greeting: firstName ? `Hey, ${firstName} 👋` : 'Hey 👋',
          subtext: 'People around you are active right now.',
          heroTitle: "See who's around you",
          heroText: 'Explore nearby people and moments happening around you.',
          ctaText: 'Go to Nearby',
          ctaIcon: <ArrowRight size={20} />,
        };
      
      case 'returning_no_location':
        return {
          greeting: firstName ? `Welcome back, ${firstName}` : 'Welcome back',
          subtext: "Enable location to see what's happening around you.",
          heroTitle: 'Turn on location',
          heroText: 'Pulse needs location to show nearby activity.',
          ctaText: 'Enable location',
          ctaIcon: <MapPin size={20} />,
        };
      
      case 'returning_no_activity':
        return {
          greeting: firstName ? `Hey, ${firstName}` : 'Hey',
          subtext: 'Nothing nearby right now.',
          heroTitle: 'Check back soon',
          heroText: 'New people and moments appear throughout the day.',
          ctaText: 'Explore',
          ctaIcon: <Compass size={20} />,
        };
      
      case 'returning_with_activity':
        return {
          greeting: firstName ? `Hey, ${firstName} 👋` : 'Hey 👋',
          subtext: "There's activity around you.",
          heroTitle: 'Something is happening nearby',
          heroText: 'People are active around you right now.',
          ctaText: 'Go to Nearby',
          ctaIcon: <ArrowRight size={20} />,
        };
      
      default:
        return {
          greeting: 'Hey 👋',
          subtext: 'Welcome to Pulse',
          heroTitle: 'Get started',
          heroText: 'Discover people and moments around you.',
          ctaText: 'Continue',
          ctaIcon: <ArrowRight size={20} />,
        };
    }
  };

  const content = getUIContent();

  // Loading skeleton
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          px: 3,
          pt: 6,
          pb: SAFE_BOTTOM,
        }}
      >
        {/* Greeting skeleton */}
        <Skeleton 
          variant="text" 
          width={200} 
          height={44} 
          sx={{ mb: 0.5, borderRadius: 2 }} 
        />
        <Skeleton 
          variant="text" 
          width={280} 
          height={24} 
          sx={{ mb: 4, borderRadius: 1 }} 
        />
        
        {/* Hero card skeleton */}
        <Box
          sx={{
            background: 'rgba(108,92,231,0.04)',
            borderRadius: '24px',
            p: 4,
            border: '1px solid rgba(108,92,231,0.08)',
          }}
        >
          <Skeleton 
            variant="rounded" 
            width={64} 
            height={64} 
            sx={{ mb: 3, borderRadius: '16px' }} 
          />
          <Skeleton 
            variant="text" 
            width="70%" 
            height={32} 
            sx={{ mb: 1.5, borderRadius: 1 }} 
          />
          <Skeleton 
            variant="text" 
            width="90%" 
            height={20} 
            sx={{ mb: 0.5, borderRadius: 1 }} 
          />
          <Skeleton 
            variant="text" 
            width="60%" 
            height={20} 
            sx={{ mb: 4, borderRadius: 1 }} 
          />
          <Skeleton 
            variant="rounded" 
            height={56} 
            sx={{ borderRadius: '14px' }} 
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        pb: SAFE_BOTTOM,
      }}
    >
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Box
              sx={{
                backgroundColor: '#fef3c7',
                px: 3,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <WifiOff size={18} color="#d97706" />
              <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500 }}>
                No internet connection
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 3,
          pt: 6,
          pb: 4,
        }}
      >
        {/* Header / Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1a1a2e',
              mb: 0.5,
            }}
          >
            {content.greeting}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            {content.subtext}
          </Typography>
        </motion.div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(168,85,247,0.08) 100%)',
              borderRadius: '24px',
              p: 4,
              border: '1px solid rgba(108,92,231,0.1)',
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: '0 8px 24px rgba(108,92,231,0.3)',
              }}
            >
              {!hasLocationPermission ? (
                <MapPin size={28} color="white" />
              ) : (
                <Compass size={28} color="white" />
              )}
            </Box>

            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1a1a2e',
                mb: 1.5,
              }}
            >
              {content.heroTitle}
            </Typography>

            {/* Text */}
            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                mb: 4,
                whiteSpace: 'pre-line',
                lineHeight: 1.6,
              }}
            >
              {content.heroText}
            </Typography>

            {/* CTA Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleCTAClick}
              disabled={isRequestingLocation}
              endIcon={isRequestingLocation ? null : content.ctaIcon}
              sx={{
                py: 1.75,
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                boxShadow: '0 4px 20px rgba(108,92,231,0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  opacity: 0.7,
                },
              }}
            >
              {isRequestingLocation ? 'Requesting...' : content.ctaText}
            </Button>
          </Box>
        </motion.div>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Soft content / tip (optional) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mt: 4,
              px: 2,
            }}
          >
            {!hasLocationPermission ? (
              <>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '6px',
                    backgroundColor: 'rgba(34,197,94,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  🔒
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: '#94a3b8' }}
                >
                  Your privacy is important. We never share your exact location.
                </Typography>
              </>
            ) : (
              <>
                <Sparkles size={16} color="#6C5CE7" />
                <Typography
                  variant="body2"
                  sx={{ color: '#94a3b8' }}
                >
                  Great connections happen when you least expect them.
                </Typography>
              </>
            )}
          </Box>
        </motion.div>
      </Box>

      {/* Demo Activity Buttons (for testing) */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={() => simulateActivity(ACTIVITY_TYPE.SIGNAL)}
          startIcon={<Bell size={16} />}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5,
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            boxShadow: '0 4px 12px rgba(108,92,231,0.3)',
          }}
        >
          Test Signal
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => simulateActivity(ACTIVITY_TYPE.EVENT)}
          startIcon={<Sparkles size={16} />}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5,
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
            boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
          }}
        >
          Test Event
        </Button>
        {hasUnreadActivity && (
          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              color: '#6C5CE7',
              fontWeight: 600,
            }}
          >
            Badge active
          </Typography>
        )}
      </Box>

      {/* Location Denied Dialog */}
      <Dialog
        open={showLocationDeniedDialog}
        onClose={() => setShowLocationDeniedDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            maxWidth: 340,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Location access required
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Location access is required to see what's happening around you.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleOpenSettings}
            startIcon={<Settings size={18} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Open settings
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowLocationDeniedDialog(false)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: '#64748b',
            }}
          >
            Not now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home1Screen;
