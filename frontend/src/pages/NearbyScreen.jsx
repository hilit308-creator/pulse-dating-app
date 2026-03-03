// NearbyScreen.jsx - People Radar
// Spec: Nearby is a core screen (Bottom Tab) for real-time presence visualization
// No profiles, no matching, no chat - just visualization and discovery action

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, IconButton, Stack, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Slider
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, WifiOff, HelpCircle, Settings, ChevronDown } from "lucide-react";
import { useAuth, PERMISSION_STATE } from "../context/AuthContext";
import { useLanguage } from '../context/LanguageContext';
import { NearbyStickyStickyBanner } from '../components/SubscriptionPromoBanner';
import { updateUserLocation } from '../config/api';

/* ------------------------------ Theme & tokens ----------------------------- */
const APP_BG =
  "radial-gradient(1200px 600px at 50% -220px, rgba(108,92,231,0.08) 0%, transparent 60%)," +
  "radial-gradient(900px 520px at 12% 120%, rgba(168,85,247,0.06) 0%, transparent 60%)," +
  "radial-gradient(800px 800px at 80% 20%, rgba(244,114,182,0.04) 0%, transparent 70%)," +
  "linear-gradient(135deg, #fafbff 0%, #f5f3ff 50%, #eff2f9 100%)";

const BOTTOM_NAV_HEIGHT = 64;
const SCAN_DURATION = 3000; // 3 seconds scanning animation
const SAFE_BOTTOM = 'calc(88px + env(safe-area-inset-bottom, 0px))';

// Scan states per spec
const SCAN_STATE = {
  IDLE: 'IDLE',
  SCANNING: 'SCANNING',
  COMPLETED: 'COMPLETED',
};

// Analytics helper (placeholder - replace with real analytics)
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
  // TODO: Implement real analytics (e.g., Firebase, Mixpanel)
};

/* -------------------------------- Mock Data -------------------------------- */
// Activity categories for visual display on radar (per spec)
const ACTIVITY_CATEGORIES = [
  "Art",
  "Yoga",
  "UX Researcher",
  "Design",
  "Music",
  "Photography",
];

// Default radius in meters
const DEFAULT_RADIUS_METERS = 500;

/* -------------------------- math helpers for SVG --------------------------- */
const toRad = (deg) => ((deg - 90) * Math.PI) / 180;
const pt0 = (r, deg) => ({ x: r * Math.cos(toRad(deg)), y: r * Math.sin(toRad(deg)) });
const arc0 = (r, startDeg, endDeg) => {
  const s = pt0(r, startDeg);
  const e = pt0(r, endDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

/* --------------------------- hooks: element width -------------------------- */
function useElementWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(Math.min(window.innerWidth * 0.9, 600));
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      // Use viewport-based sizing, not container-limited
      setW(Math.max(320, Math.min(600, Math.round(width))));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/* -------------------------------- Main screen ------------------------------ */
export default function NearbyScreen() {
  const navigate = useNavigate();
  const { permissions, updatePermission, accessToken } = useAuth();
  const { t } = useLanguage();
  const [containerRef, containerW] = useElementWidth();
  const timersRef = useRef([]);

  // Radar sizes - 65% viewport width, max 380px (larger radar)
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
  const ringSize = Math.max(280, Math.min(380, viewportWidth * 0.65));
  const rOuter = ringSize / 2 - 4;
  const rMid = rOuter - 8;
  const ctaSize = Math.max(160, Math.floor((rMid - 4) * 2));

  // State per spec
  const [scanState, setScanState] = useState(SCAN_STATE.IDLE);
  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_METERS);
  const [liveNowCount, setLiveNowCount] = useState(14); // Mock data
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLocationDeniedDialog, setShowLocationDeniedDialog] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showDistanceDialog, setShowDistanceDialog] = useState(false);

  // Location permission state
  const locationPermission = permissions?.location || PERMISSION_STATE.UNKNOWN;
  const hasLocationPermission = locationPermission === PERMISSION_STATE.GRANTED;

  // Cleanup timers on unmount
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);
  const pushTimer = (id) => timersRef.current.push(id);

  // Track page view on mount
  useEffect(() => {
    trackEvent('nearby_viewed', {
      hasLocation: hasLocationPermission,
      scanState,
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

  // Check location permission on mount
  useEffect(() => {
    const checkLocationPermission = async () => {
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
    };
    checkLocationPermission();
  }, [updatePermission]);

  // Simulate live count fluctuation (mock)
  useEffect(() => {
    const id = setInterval(() => {
      setLiveNowCount((prev) => Math.max(0, prev + Math.round((Math.random() - 0.5) * 4)));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Request location permission and send coordinates to backend
  const requestLocationPermission = useCallback(async () => {
    console.log('[NearbyScreen] requestLocationPermission called');
    console.log('[NearbyScreen] Token present:', !!accessToken, accessToken ? `(${accessToken.substring(0, 20)}...)` : '(none)');
    trackEvent('nearby_location_request_clicked');
    setIsRequestingLocation(true);
    
    try {
      console.log('[NearbyScreen] Calling navigator.geolocation.getCurrentPosition...');
      const result = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('[NearbyScreen] Geolocation SUCCESS:', position.coords.latitude, position.coords.longitude);
            resolve({ 
              status: 'granted', 
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            });
          },
          (error) => {
            console.error('[NearbyScreen] Geolocation ERROR:', error.code, error.message);
            if (error.code === error.PERMISSION_DENIED) {
              resolve({ status: 'denied' });
            } else {
              resolve({ status: 'error' });
            }
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      });

      console.log('[NearbyScreen] Geolocation result:', result);

      if (result.status === 'granted') {
        updatePermission('location', PERMISSION_STATE.GRANTED);
        
        // Send location to backend
        if (result.coords && accessToken) {
          const { latitude, longitude } = result.coords;
          console.log('[NearbyScreen] About to call updateUserLocation with:', { latitude, longitude, accessTokenPresent: !!accessToken });
          trackEvent('nearby_location_sent', { latitude, longitude });
          const locationResult = await updateUserLocation(latitude, longitude, accessToken);
          console.log('[NearbyScreen] updateUserLocation result:', locationResult);
          if (!locationResult.success) {
            console.warn('[NearbyScreen] Failed to update location on server:', locationResult.error);
          }
        } else {
          console.warn('[NearbyScreen] Skipping API call - coords:', !!result.coords, 'accessToken:', !!accessToken);
          if (!accessToken) {
            console.error('[NearbyScreen] NO TOKEN - user may not be logged in!');
          }
        }
      } else {
        updatePermission('location', PERMISSION_STATE.DENIED);
        setShowLocationDeniedDialog(true);
      }
    } catch (error) {
      console.error('[NearbyScreen] Location permission error:', error);
      setShowLocationDeniedDialog(true);
    } finally {
      setIsRequestingLocation(false);
    }
  }, [updatePermission, accessToken]);

  // Start scan action - show 3-second scanning animation
  const startScan = useCallback(async () => {
    console.log('[NearbyScreen] startScan clicked');
    const scanRequestedAt = Date.now();
    
    if (!hasLocationPermission) {
      console.log('[NearbyScreen] No location permission, requesting...');
      requestLocationPermission();
      return;
    }

    console.log('[NearbyScreen] Has location permission, starting scan');
    trackEvent('nearby_scan_started');
    if (navigator?.vibrate) navigator.vibrate([10, 40, 10]);
    
    // Start scanning state
    setScanState(SCAN_STATE.SCANNING);
    
    // Get current location and send to backend
    console.log('[NearbyScreen] Before geolocation getCurrentPosition');
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('[NearbyScreen] Geolocation success:', latitude, longitude);
          
          // Send location to backend
          console.log('[NearbyScreen] Token present:', !!accessToken);
          if (accessToken) {
            console.log('[NearbyScreen] Before POST /api/location');
            const locationResult = await updateUserLocation(latitude, longitude, accessToken);
            console.log('[NearbyScreen] Location updated, result:', locationResult);
          } else {
            console.error('[NearbyScreen] NO TOKEN - cannot send location to server!');
          }
        },
        (error) => {
          console.error('[NearbyScreen] Geolocation error:', error.code, error.message);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } catch (err) {
      console.error('[NearbyScreen] Geolocation exception:', err);
    }
    
    // After 3 seconds, navigate to results
    const timerId = setTimeout(() => {
      console.log('[NearbyScreen] Scan complete, navigating to /nearby/people');
      setScanState(SCAN_STATE.COMPLETED);
      navigate('/nearby/people', {
        state: {
          liveNowCount,
          scanCompleted: true,
          radiusMeters,
          scanRequestedAt,
        },
      });
    }, SCAN_DURATION);
    
    pushTimer(timerId);
  }, [hasLocationPermission, requestLocationPermission, liveNowCount, navigate, radiusMeters, accessToken]);

  // Handle "View nearby people" CTA
  const handleViewNearbyPeople = useCallback(() => {
    trackEvent('nearby_results_view_clicked', { radiusMeters });
    // Navigate to View Nearby People screen with scan data
    navigate('/nearby/people', {
      state: {
        liveNowCount,
        scanCompleted: true,
        radiusMeters,
        scanRequestedAt: Date.now(),
      },
    });
  }, [navigate, liveNowCount, radiusMeters]);

  // Handle "Explore" CTA when no people nearby
  const handleExplore = useCallback(() => {
    navigate('/explore');
  }, [navigate]);

  // Reset scan
  const handleReset = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    setScanState(SCAN_STATE.IDLE);
  }, []);

  // Open settings (for location denied)
  const handleOpenSettings = () => {
    alert('Please enable location access in your browser settings, then refresh the page.');
    setShowLocationDeniedDialog(false);
  };

  // Get instruction text based on state
  const getInstructionText = () => {
    if (!hasLocationPermission) {
      return null; // Will show empty state instead
    }
    
    switch (scanState) {
      case SCAN_STATE.IDLE:
        return "Tap to scan and see who's active";
      case SCAN_STATE.SCANNING:
        return "Scanning…";
      case SCAN_STATE.COMPLETED:
        if (liveNowCount > 0) {
          return `${liveNowCount} people active`;
        }
        return "It's quiet right now. Try again in a bit.";
      default:
        return "Tap to scan and see who's active";
    }
  };

  // Render Location Empty State
  const renderLocationEmptyState = () => (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(168,85,247,0.1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <MapPin size={36} color="#6C5CE7" />
      </Box>
      
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: '#1a1a2e',
          mb: 1.5,
        }}
      >
        Enable location to use Pulse
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          color: '#64748b',
          mb: 4,
          maxWidth: 300,
        }}
      >
        Pulse uses your location to tailor this screen.
        Your exact location is never shown.
      </Typography>
      
      <Button
        variant="contained"
        size="large"
        onClick={requestLocationPermission}
        disabled={isRequestingLocation}
        startIcon={<MapPin size={20} />}
        sx={{
          py: 1.5,
          px: 4,
          borderRadius: '14px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
          boxShadow: '0 4px 20px rgba(108,92,231,0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
          },
        }}
      >
        {isRequestingLocation ? 'Requesting...' : 'Enable location'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box sx={{ position: "fixed", inset: 0, zIndex: 0, background: APP_BG }} />

      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
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

        {/* Location Empty State */}
        {!hasLocationPermission ? (
          renderLocationEmptyState()
        ) : (
          <>
            {/* Top Bar with Distance Selector and Help Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, py: 2, mt: 1 }}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                onClick={() => {
                  setShowDistanceDialog(true);
                  if (navigator?.vibrate) navigator.vibrate(5);
                }}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2.5,
                  py: 1,
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(168,85,247,0.08) 100%)',
                  border: '1.5px solid rgba(108,92,231,0.2)',
                  minHeight: 40,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(108,92,231,0.1)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(168,85,247,0.12) 100%)',
                    boxShadow: '0 4px 16px rgba(108,92,231,0.2)',
                    transform: 'translateY(-2px) scale(1.02)',
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(0.98)',
                  },
                }}
              >
                <MapPin size={16} color="#6C5CE7" />
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: '#6C5CE7',
                    fontSize: '13px',
                    letterSpacing: '0.3px',
                  }}
                >
                  {radiusMeters >= 1000 ? `${(radiusMeters / 1000).toFixed(1)} km` : `${radiusMeters}m`}
                </Typography>
                <ChevronDown size={16} color="#6C5CE7" />
              </Box>
            </Box>

            {/* Main Content */}
            <Box
              ref={containerRef}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                px: 3,
                py: 3,
              }}
            >
              {/* People Radar */}
              <Box sx={{ position: 'relative', width: ringSize, height: ringSize }}>
                {/* Live Indicator - Circular Badge with Glow */}
                <Box
                  component={motion.div}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.3,
                  }}
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: '4px solid #ffffff',
                    boxShadow: '0 8px 24px rgba(34,197,94,0.35), 0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3,
                    animation: 'glowPulse 2s ease-in-out infinite',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -8,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)',
                      animation: 'glowExpand 2s ease-in-out infinite',
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: 900, color: '#ffffff', fontSize: '24px', lineHeight: 1 }}>
                    {liveNowCount}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', mt: 0.25 }}>
                    Live
                  </Typography>
                </Box>

                {/* Radar Rings */}
                <RadarRings
                  size={ringSize}
                  categories={ACTIVITY_CATEGORIES}
                  isScanning={scanState === SCAN_STATE.SCANNING}
                  isCompleted={scanState === SCAN_STATE.COMPLETED}
                  hasResults={liveNowCount > 0}
                />

                {/* Center CTA */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Box
                    component={motion.button}
                    whileHover={{ 
                      scale: scanState === SCAN_STATE.IDLE ? 1.05 : 1,
                      boxShadow: scanState === SCAN_STATE.IDLE ? '0 32px 88px rgba(0,83,166,0.25)' : undefined,
                    }}
                    whileTap={{ scale: scanState === SCAN_STATE.IDLE ? 0.97 : 1, opacity: scanState === SCAN_STATE.IDLE ? 0.8 : 1 }}
                    onClick={scanState === SCAN_STATE.IDLE ? startScan : undefined}
                    sx={{
                      pointerEvents: scanState === SCAN_STATE.IDLE ? 'auto' : 'none',
                      width: ctaSize,
                      height: ctaSize,
                      borderRadius: '50%',
                      border: '1px solid rgba(0,0,0,0.06)',
                      cursor: scanState === SCAN_STATE.IDLE ? 'pointer' : 'default',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#0b1324',
                      fontWeight: 900,
                      letterSpacing: 1,
                      textTransform: 'none',
                      background: 'radial-gradient(200px 200px at 30% 30%, #ccfff1 0%, #cfe8ff 50%, #bae6fd 100%)',
                      boxShadow: '0 26px 72px rgba(0,83,166,0.20)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'radial-gradient(200px 200px at 30% 30%, #ccfff1 0%, #cfe8ff 50%, #bae6fd 100%)',
                      },
                      '&:focus': {
                        outline: 'none',
                        background: 'radial-gradient(200px 200px at 30% 30%, #ccfff1 0%, #cfe8ff 50%, #bae6fd 100%)',
                      },
                      '&:active': {
                        opacity: 0.7,
                        transform: 'scale(0.98)',
                      },
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': scanState === SCAN_STATE.IDLE ? {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                        animation: 'shimmerSweep 3s ease-in-out infinite',
                      } : {},
                    }}
                    aria-label={scanState === SCAN_STATE.IDLE ? "Start scanning" : "Scanning"}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '50%',
                        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.55), 0 0 0 6px rgba(96,165,250,0.08)',
                      }}
                    />
                    <Stack alignItems="center" spacing={1} sx={{ position: 'relative', zIndex: 1, px: 2 }}>
                      {scanState === SCAN_STATE.SCANNING ? (
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '24px',
                            color: '#64748b',
                            animation: 'pulse 1.5s ease-in-out infinite',
                          }}
                        >
                          Scanning...
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            sx={{ 
                              letterSpacing: 2, 
                              fontWeight: 700, 
                              opacity: 0.85, 
                              fontSize: '12px',
                              textTransform: 'uppercase',
                            }}
                          >
                            PEOPLE RADAR
                          </Typography>
                          <Typography
                            sx={{
                              color: '#64748b',
                              fontWeight: 500,
                              fontSize: '0.9rem',
                              textAlign: 'center',
                            }}
                          >
                            One tap — see who's active
                          </Typography>
                        </>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </Box>

              {/* Instruction Text */}
              <Box sx={{ mt: 2, textAlign: 'center', px: 2 }}>
                <Typography sx={{ 
                  color: '#64748b', 
                  fontWeight: 600, 
                  fontSize: '15px',
                  lineHeight: 1.5,
                  letterSpacing: '0.2px',
                }}>
                  {getInstructionText()}
                </Typography>
              </Box>

              {/* CTA Buttons - Always visible */}
              <Box 
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                sx={{ mt: 3, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}
              >
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  variant="contained"
                  size="large"
                  onClick={() => {
                    startScan();
                    if (navigator?.vibrate) navigator.vibrate([10, 5, 10]);
                  }}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: '16px',
                    fontSize: '15px',
                    minHeight: 52,
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    boxShadow: '0 8px 24px rgba(108,92,231,0.35), 0 2px 8px rgba(108,92,231,0.2)',
                    letterSpacing: '0.3px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transform: 'translateX(-100%)',
                      animation: 'shimmerSlide 2s ease-in-out infinite',
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                      boxShadow: '0 12px 32px rgba(108,92,231,0.4), 0 4px 12px rgba(108,92,231,0.25)',
                    },
                  }}
                >
                  {t('viewNearbyPeople')}
                </Button>
                <Button
                  variant="text"
                  size="medium"
                  onClick={startScan}
                  sx={{
                    color: '#6C5CE7',
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    mb: 0,
                    letterSpacing: '0.2px',
                    '&:hover': {
                      backgroundColor: 'rgba(108,92,231,0.08)',
                    },
                  }}
                >
                  {t('scanNearby')}
                </Button>
                {/* Loading stripes animation - directly below Scan Nearby */}
                {scanState !== SCAN_STATE.COMPLETED && (
                  <LoadingStripes width={Math.round(ctaSize * 0.92)} />
                )}
              </Box>
            </Box>
          </>
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
            Location access is required to see what's happening.
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

      {/* Distance Selector Dialog */}
      <Dialog
        open={showDistanceDialog}
        onClose={() => setShowDistanceDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            maxWidth: 340,
            width: '100%',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, textAlign: 'center' }}>
          Search Distance
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', mb: 3 }}>
            Set how far you want to search
          </Typography>
          
          {/* Current value display */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: '#6C5CE7',
                lineHeight: 1,
              }}
            >
              {radiusMeters >= 1000 ? (radiusMeters / 1000).toFixed(1) : radiusMeters}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {radiusMeters >= 1000 ? 'kilometers' : 'meters'}
            </Typography>
          </Box>

          {/* Slider */}
          <Box sx={{ px: 2 }}>
            <Slider
              value={radiusMeters}
              onChange={(_, value) => setRadiusMeters(value)}
              min={100}
              max={2000}
              step={100}
              marks={[
                { value: 100, label: '100m' },
                { value: 1000, label: '1 km' },
                { value: 2000, label: '2 km' },
              ]}
              sx={{
                color: '#6C5CE7',
                '& .MuiSlider-thumb': {
                  width: 24,
                  height: 24,
                  backgroundColor: '#fff',
                  border: '3px solid #e2e8f0',
                  '&:hover': {
                    boxShadow: '0 0 0 8px rgba(0,0,0,0.04)',
                  },
                },
                '& .MuiSlider-track': {
                  height: 6,
                  borderRadius: 3,
                },
                '& .MuiSlider-rail': {
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(108,92,231,0.2)',
                },
                '& .MuiSlider-mark': {
                  display: 'none',
                },
                '& .MuiSlider-markLabel': {
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                },
              }}
            />
          </Box>

          {/* Quick select buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[200, 500, 1000, 2000].map((meters) => (
              <Button
                key={meters}
                variant={radiusMeters === meters ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setRadiusMeters(meters)}
                sx={{
                  borderRadius: '20px',
                  minWidth: 55,
                  textTransform: 'none',
                  fontWeight: 600,
                  ...(radiusMeters === meters
                    ? {
                        background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                        border: 'none',
                      }
                    : {
                        borderColor: 'rgba(108,92,231,0.3)',
                        color: '#6C5CE7',
                      }),
                }}
              >
                {meters >= 1000 ? `${meters / 1000} km` : `${meters}m`}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowDistanceDialog(false)}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>


      {/* CSS for animations */}
      <style>{`
        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          position: relative;
          display: inline-block;
        }
        .live-dot::after {
          content: "";
          position: absolute;
          inset: -6px;
          borderRadius: 50%;
          border: 2px solid rgba(34,197,94,0.35);
          animation: pingPulse 1.6s ease-out infinite;
        }
        @keyframes pingPulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes glowPulse {
          0%, 100% { 
            box-shadow: 0 8px 24px rgba(34,197,94,0.35), 0 2px 8px rgba(0,0,0,0.1), 0 0 20px rgba(34,197,94,0.3);
          }
          50% { 
            box-shadow: 0 8px 32px rgba(34,197,94,0.5), 0 2px 12px rgba(0,0,0,0.15), 0 0 40px rgba(34,197,94,0.5);
          }
        }
        @keyframes glowExpand {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.4;
          }
          50% { 
            transform: scale(1.2);
            opacity: 0.6;
          }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }
        @keyframes shimmerSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* Subscription Promo Banner - Fixed at bottom */}
      <NearbyStickyStickyBanner />
    </>
  );
}

/* ---------------------------- Radar Rings Component ------------------------- */
function RadarRings({ size, categories, isScanning, isCompleted, hasResults }) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 16;
  const rMid = rOuter - 24;

  const gapAngle = 360 / Math.max(categories.length, 1);
  const spanAngle = Math.min(50, 300 / Math.max(categories.length, 1));
  const startAngle = -90 + (gapAngle - spanAngle) / 2;

  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Scanning animation overlay */}
      {isScanning && (
        <>
          {/* Center fill to cover page background during scan */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '78%',
              height: '78%',
              borderRadius: '50%',
              background: 'radial-gradient(200px 200px at 30% 30%, #ccfff1 0%, #cfe8ff 50%, #bae6fd 100%)',
              pointerEvents: 'none',
            }}
          />
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              pointerEvents: 'none',
              background:
                'conic-gradient(from 0deg, rgba(96,165,250,.25) 0 30deg, transparent 30deg 360deg)',
              WebkitMask: 'radial-gradient(circle at 50% 50%, transparent 0 40%, black 41% 100%)',
              mask: 'radial-gradient(circle at 50% 50%, transparent 0 40%, black 41% 100%)',
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </>
      )}

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <g transform={`translate(${cx} ${cy})`}>
          {/* Base rings */}
          {[rOuter, rMid].map((rad, i) => (
            <circle
              key={i}
              cx={0}
              cy={0}
              r={rad}
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={1}
            />
          ))}

          {/* Dashed inner circle */}
          <circle
            r={rMid - 24}
            fill="none"
            stroke="rgba(2, 6, 23, 0.10)"
            strokeWidth="1"
            strokeDasharray="1 10"
          />

          {/* Category arcs on outer ring */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
          >
            {categories.map((label, i) => {
              const start = startAngle + i * gapAngle;
              const end = start + spanAngle;
              const id = `arc-cat-${i}`;
              const d = arc0(rOuter, start, end);
              const mid = start + spanAngle / 2;
              const dot = pt0(rOuter, mid);

              return (
                <g key={id}>
                  <motion.path
                    d={d}
                    stroke="url(#ringGrad1)"
                    strokeWidth={8}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.0, delay: i * 0.08 }}
                  />
                  <circle cx={dot.x} cy={dot.y} r={4} fill="#60a5fa" opacity={0.95} />
                  <defs>
                    <path id={id} d={d} />
                    <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.7" />
                      <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>
                  <text
                    fontSize={12}
                    fontWeight="800"
                    fill="#0b1324"
                    style={{
                      paintOrder: 'stroke',
                      stroke: 'rgba(255,255,255,0.9)',
                      strokeWidth: 2,
                      letterSpacing: 0.6,
                    }}
                  >
                    <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
                      {label}
                    </textPath>
                  </text>
                </g>
              );
            })}
          </motion.g>
        </g>
      </svg>

      {/* Expanding circles during scan */}
      {isScanning && [0, 0.4, 0.8].map((d, i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            pointerEvents: 'none',
            border: '3px solid rgba(96,165,250,0.3)',
          }}
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut', delay: d }}
        />
      ))}
      
      {/* Ripple effects (when not scanning) */}
      {!isScanning && [0, 0.6, 1.2].map((d, i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            pointerEvents: 'none',
            border: `2px solid ${isCompleted && hasResults ? 'rgba(34,197,94,0.2)' : 'rgba(0,163,255,0.16)'}`,
          }}
          initial={{ scale: 0.7, opacity: 0.7 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeOut', delay: d }}
        />
      ))}
    </Box>
  );
}

/* ------------------------------ Loading stripes ---------------------------- */
function LoadingStripes({ width = 220 }) {
  const line = (w, i, d = 0) => (
    <Box
      key={i}
      sx={{
        height: 5,
        width: w,
        borderRadius: 999,
        background:
          'linear-gradient(90deg, rgba(34,197,94,0.25), rgba(96,165,250,0.25), rgba(56,189,248,0.25))',
        backgroundSize: '200% 100%',
        animation: `shimmer 1.6s linear ${d}s infinite, hue 6s ease-in-out ${d}s infinite`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        willChange: 'filter, background-position',
      }}
    />
  );

  return (
    <>
      <Stack spacing={0.4} alignItems="center" sx={{ mt: 0 }}>
        {line(Math.round(width * 0.85), 1, 0)}
        {line(Math.round(width * 0.65), 2, 0.12)}
        {line(Math.round(width * 0.5), 3, 0.24)}
      </Stack>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes hue { 0%, 100% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(40deg); } }
      `}</style>
    </>
  );
}
