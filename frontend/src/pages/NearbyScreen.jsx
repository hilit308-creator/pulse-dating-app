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
import { MapPin, WifiOff, HelpCircle, Settings } from "lucide-react";
import { useAuth, PERMISSION_STATE } from "../context/AuthContext";
import { useLanguage } from '../context/LanguageContext';
import { NearbyStickyStickyBanner } from '../components/SubscriptionPromoBanner';

/* ------------------------------ Theme & tokens ----------------------------- */
const APP_BG =
  "radial-gradient(1200px 600px at 50% -220px, #eef2f9 0%, transparent 60%)," +
  "radial-gradient(900px 520px at 12% 120%, #edf7f3 0%, transparent 60%)," +
  "linear-gradient(90deg, #fafbff 0%, #f7f8fc 70%, #eff2f9 100%)";

const BOTTOM_NAV_HEIGHT = 64;
const SCAN_DURATION = 2000; // 1.5-3 seconds per spec
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
  const { permissions, updatePermission } = useAuth();
  const { t } = useLanguage();
  const [containerRef, containerW] = useElementWidth();
  const timersRef = useRef([]);

  // Radar sizes - 40% viewport width, max 260px (compact radar)
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
  const ringSize = Math.max(180, Math.min(260, viewportWidth * 0.40));
  const rOuter = ringSize / 2 - 4;
  const rMid = rOuter - 8;
  const ctaSize = Math.max(110, Math.floor((rMid - 4) * 2));

  // State per spec
  const [scanState, setScanState] = useState(SCAN_STATE.IDLE);
  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_METERS);
  const [liveNowCount, setLiveNowCount] = useState(14); // Mock data
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLocationDeniedDialog, setShowLocationDeniedDialog] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showDistanceDialog, setShowDistanceDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

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

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    trackEvent('nearby_location_request_clicked');
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
  }, [updatePermission]);

  // Start scan action - navigate directly to nearby/people
  const startScan = useCallback(() => {
    if (!hasLocationPermission) {
      requestLocationPermission();
      return;
    }

    trackEvent('nearby_scan_started');
    if (navigator?.vibrate) navigator.vibrate([10, 40, 10]);
    
    // Navigate directly to nearby/people
    navigate('/nearby/people', {
      state: {
        liveNowCount,
        scanCompleted: true,
        radiusMeters,
      },
    });
  }, [hasLocationPermission, requestLocationPermission, liveNowCount, navigate, radiusMeters]);

  // Handle "View nearby people" CTA
  const handleViewNearbyPeople = useCallback(() => {
    trackEvent('nearby_results_view_clicked', { radiusMeters });
    // Navigate to View Nearby People screen with scan data
    navigate('/nearby/people', {
      state: {
        liveNowCount,
        scanCompleted: true,
        radiusMeters,
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
        return "Tap to scan and see who's around";
      case SCAN_STATE.SCANNING:
        return "Scanning nearby…";
      case SCAN_STATE.COMPLETED:
        if (liveNowCount > 0) {
          return `${liveNowCount} people nearby`;
        }
        return "It's quiet right now. Try again in a bit.";
      default:
        return "Tap to scan and see who's around";
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
        Enable location to see who's nearby
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          color: '#64748b',
          mb: 4,
          maxWidth: 300,
        }}
      >
        Pulse uses your location to show nearby activity.
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

        {/* Help Button - positioned absolute to not take space */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
          }}
        >
          <IconButton
            onClick={() => setShowTutorial(true)}
            sx={{
              color: '#6C5CE7',
              backgroundColor: 'rgba(108,92,231,0.08)',
              '&:hover': { backgroundColor: 'rgba(108,92,231,0.12)' },
            }}
            size="small"
          >
            <HelpCircle size={18} />
          </IconButton>
        </Box>

        {/* Location Empty State */}
        {!hasLocationPermission ? (
          renderLocationEmptyState()
        ) : (
          <>
            {/* Distance Selector Pill - compact */}
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <Box
                onClick={() => setShowDistanceDialog(true)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  backgroundColor: 'rgba(108,92,231,0.08)',
                  border: '1px solid rgba(108,92,231,0.15)',
                  minHeight: 32,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(108,92,231,0.12)',
                  },
                }}
              >
                <MapPin size={14} color="#6C5CE7" />
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: '#6C5CE7',
                    fontSize: '12px',
                  }}
                >
                  Distance · {radiusMeters >= 1000 ? `${(radiusMeters / 1000).toFixed(1)} km` : `${radiusMeters}m`}
                </Typography>
                <Settings size={12} color="#6C5CE7" />
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
                px: 2,
              }}
            >
              {/* People Radar */}
              <Box sx={{ position: 'relative', width: ringSize, height: ringSize }}>
                {/* Live Indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 999,
                    bgcolor: '#fff',
                    border: '1px solid #e6eaf1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    zIndex: 3,
                  }}
                >
                  <span className="live-dot" />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0b1324' }}>
                    Live now: {liveNowCount} nearby
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
                    whileHover={{ scale: scanState === SCAN_STATE.IDLE ? 1.04 : 1 }}
                    whileTap={{ scale: scanState === SCAN_STATE.IDLE ? 0.98 : 1 }}
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
                      background: 'radial-gradient(200px 200px at 30% 30%, #ccfff1 0%, #cfe8ff 60%, #d6d3ff 100%)',
                      boxShadow: '0 26px 72px rgba(0,83,166,0.20)',
                      '&:active': {
                        background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                        color: '#ffffff',
                      },
                      backdropFilter: 'blur(4px)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    aria-label={scanState === SCAN_STATE.IDLE ? "Start scanning" : "Scanning"}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '50%',
                        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.55), 0 0 0 6px rgba(99,102,241,0.08)',
                      }}
                    />
                    <Stack alignItems="center" spacing={1} sx={{ position: 'relative', zIndex: 1, px: 2 }}>
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
                          fontWeight: 700,
                          fontSize: '18px',
                          lineHeight: 1.3,
                          textAlign: 'center',
                        }}
                      >
                        One tap — discover who's nearby
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Box>

              {/* Instruction Text */}
              <Box sx={{ mt: 0.5, textAlign: 'center' }}>
                <Typography sx={{ color: '#64748b', fontWeight: 500, fontSize: '14px' }}>
                  {getInstructionText()}
                </Typography>
              </Box>

              {/* CTA Buttons - Always visible */}
              <Box sx={{ mt: 0.75, mb: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={startScan}
                  sx={{
                    py: 0.75,
                    px: 2,
                    borderRadius: '10px',
                    fontSize: '13px',
                    minHeight: 36,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    boxShadow: '0 3px 10px rgba(108,92,231,0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                    },
                  }}
                >
                  {t('viewNearbyPeople')}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={startScan}
                  sx={{
                    color: '#1a1a2e',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    mb: 0,
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
            Set how far you want to search for people nearby
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
                  border: '3px solid #6C5CE7',
                  '&:hover': {
                    boxShadow: '0 0 0 8px rgba(108,92,231,0.16)',
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

      {/* Tutorial Dialog */}
      <Dialog
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            maxWidth: 360,
            width: '100%',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, textAlign: 'center' }}>
          How Nearby Works
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            {/* Step 1 */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>📍</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Set your distance
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Tap the distance pill to choose how far you want to search
              </Typography>
            </Box>

            {/* Step 2 */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>📡</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Scan the radar
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Tap the radar to discover people nearby in real-time
              </Typography>
            </Box>

            {/* Step 3 */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>👆</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Swipe to connect
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Swipe right to like, left to pass. Match when you both like!
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowTutorial(false)}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSS for live dot animation */}
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
          border-radius: 50%;
          border: 2px solid rgba(34,197,94,0.35);
          animation: pingPulse 1.6s ease-out infinite;
        }
        @keyframes pingPulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
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
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            pointerEvents: 'none',
            background:
              'conic-gradient(from 0deg, rgba(99,102,241,.25) 0 30deg, transparent 30deg 360deg)',
            WebkitMask: 'radial-gradient(circle at 50% 50%, transparent 0 40%, black 41% 100%)',
            mask: 'radial-gradient(circle at 50% 50%, transparent 0 40%, black 41% 100%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
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
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7" />
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

      {/* Ripple effects */}
      {[0, 0.6, 1.2].map((d, i) => (
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
          'linear-gradient(90deg, rgba(34,197,94,0.25), rgba(96,165,250,0.25), rgba(139,92,246,0.25))',
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
