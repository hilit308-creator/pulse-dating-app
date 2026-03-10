/**
 * PointsHubScreen - Points Hub / Points Store
 * 
 * API Contract: /v1/points/*
 * 
 * Purpose:
 * - View points balance
 * - See active feature (if any)
 * - Activate ONE feature at a time using points
 * - Purchase points (one-time)
 * 
 * 🔒 Locked Rules:
 * - Only ONE feature active at a time
 * - New feature IMMEDIATELY ends existing feature
 * - Points don't stack between features
 * - Points are NOT refunded
 * - Points don't expire
 * - Active subscription = Points section DISABLED
 * - All timers and enforcement = Server only
 * - Client is DUMB RENDERER only
 * 
 * ❌ Forbidden:
 * - No XP, levels, progress bars
 * - No stacking features
 * - No feature statistics shown to user
 * - No "celebration" animations
 * - No confirmation dialogs on activate
 * 
 * Design: Matches SubscriptionsScreen (dark, nightlife, premium feel)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Undo2,
  Heart,
  MapPin,
  Zap,
  Clock,
  Coins,
  Crown,
  Check,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Pulse Wave SVG Component - Same as SubscriptionsScreen
const PulseWave = ({ intensity = 'calm', style = {} }) => {
  const isCalm = intensity === 'calm';
  const peakHeight = isCalm ? 15 : 25;
  const glowIntensity = isCalm ? 0.3 : 0.5;
  
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        height: 120,
        overflow: 'hidden',
        opacity: 0.2,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="pulseGradientPoints" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="pulseGlowPoints">
            <feGaussianBlur stdDeviation={glowIntensity * 8} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <motion.path
          d={`M0,60 Q150,${60 - peakHeight} 300,60 T600,60 Q750,${60 + peakHeight} 900,60 T1200,60`}
          fill="none"
          stroke="url(#pulseGradientPoints)"
          strokeWidth="3"
          filter="url(#pulseGlowPoints)"
          animate={{ 
            d: [
              `M0,60 Q150,${60 - peakHeight} 300,60 T600,60 Q750,${60 + peakHeight} 900,60 T1200,60`,
              `M0,60 Q150,${60 + peakHeight * 0.5} 300,60 T600,60 Q750,${60 - peakHeight * 0.5} 900,60 T1200,60`,
              `M0,60 Q150,${60 - peakHeight} 300,60 T600,60 Q750,${60 + peakHeight} 900,60 T1200,60`,
            ]
          }}
          transition={{
            d: {
              duration: isCalm ? 8 : 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          }}
        />
      </svg>
    </Box>
  );
};

// Feature Item Component - Same style as SubscriptionsScreen
const FeatureItem = ({ text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'rgba(236, 72, 153, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Check size={14} color="#ec4899" />
    </Box>
    <Typography
      sx={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.9rem',
        fontWeight: 500,
      }}
    >
      {text}
    </Typography>
  </Box>
);

// Pricing Option Component - Same style as SubscriptionsScreen
const PricingOption = ({ label, price, note, selected, onSelect }) => (
  <Box
    onClick={onSelect}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: 1.5,
      borderRadius: '12px',
      border: selected 
        ? '2px solid rgba(236, 72, 153, 0.8)' 
        : '1px solid rgba(255, 255, 255, 0.15)',
      background: selected 
        ? 'rgba(236, 72, 153, 0.1)' 
        : 'rgba(255, 255, 255, 0.03)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      mb: 1,
      '&:hover': {
        background: 'rgba(236, 72, 153, 0.08)',
        borderColor: 'rgba(236, 72, 153, 0.5)',
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: selected 
            ? '6px solid #ec4899' 
            : '2px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.2s ease',
        }}
      />
      <Box>
        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
          {label}
        </Typography>
        {note && (
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
            {note}
          </Typography>
        )}
      </Box>
    </Box>
    <Typography sx={{ color: '#ec4899', fontWeight: 700, fontSize: '1rem' }}>
      {price}
    </Typography>
  </Box>
);

// CTA Button with gradient - Same style as SubscriptionsScreen
const CTAButton = ({ children, onClick, disabled }) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    sx={{
      width: '100%',
      py: 1.75,
      borderRadius: '14px',
      background: disabled ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
      color: disabled ? 'rgba(255,255,255,0.5)' : '#fff',
      fontWeight: 700,
      fontSize: '1rem',
      textTransform: 'none',
      boxShadow: disabled ? 'none' : '0 8px 32px rgba(236, 72, 153, 0.35)',
      '&:hover': {
        background: disabled ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
        boxShadow: disabled ? 'none' : '0 12px 40px rgba(236, 72, 153, 0.45)',
      },
      '&.Mui-disabled': {
        background: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.5)',
      },
    }}
  >
    {children}
  </Button>
);

// Feature definitions (LOCKED - do not modify)
const FEATURES = [
  {
    id: 'undo',
    icon: Undo2,
    duration: 30, // minutes
    cost: 40,
    note: 'swipe_screens_only',
  },
  {
    id: 'likes_you',
    icon: Heart,
    duration: 10,
    cost: 80,
    note: 'list_opens_immediately',
  },
  {
    id: 'nearby_priority',
    icon: MapPin,
    duration: 10,
    cost: 70,
    note: 'no_distance_change',
  },
  {
    id: 'beat_pulse',
    icon: Zap,
    duration: 15,
    cost: 70,
    note: 'no_user_statistics',
  },
];

// Points packages (LOCKED - do not modify)
const PACKAGES = [
  { id: 'small', points: 100, price: 9.90, currency: '₪' },
  { id: 'medium', points: 250, price: 19.90, currency: '₪' },
  { id: 'large', points: 600, price: 39.90, currency: '₪' },
];

// Analytics helper
const trackEvent = (event, payload = {}) => {
  console.log('[Analytics]', event, payload);
  // TODO: Implement actual analytics
};

const PointsHubScreen = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  
  // State - all from server
  const [loading, setLoading] = useState(true);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [activeFeature, setActiveFeature] = useState(null); // { id, endsAt }
  const [hasSubscription, setHasSubscription] = useState(false);
  const [activatingFeature, setActivatingFeature] = useState(null);
  const [purchasingPackage, setPurchasingPackage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Timer state for active feature
  const [remainingTime, setRemainingTime] = useState(null);

  // Fetch points data from server
  const fetchPointsData = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/points/status');
      // const data = await response.json();
      
      // Mock data for development
      const mockData = {
        balance: 150,
        activeFeature: null, // or { id: 'undo', endsAt: Date.now() + 1000 * 60 * 15 }
        hasSubscription: false,
      };
      
      setPointsBalance(mockData.balance);
      setActiveFeature(mockData.activeFeature);
      setHasSubscription(mockData.hasSubscription);
      setLoading(false);
      
      trackEvent('points_balance_viewed', { balance: mockData.balance });
      trackEvent('points_store_opened', { source_screen: 'direct' });
    } catch (error) {
      console.error('Failed to fetch points data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPointsData();
  }, [fetchPointsData]);

  // Timer countdown for active feature
  useEffect(() => {
    if (!activeFeature?.endsAt) {
      setRemainingTime(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, activeFeature.endsAt - now);
      
      if (remaining === 0) {
        // Feature ended - refresh from server
        setActiveFeature(null);
        setRemainingTime(null);
        trackEvent('feature_ended', { feature: activeFeature.id });
        fetchPointsData();
      } else {
        setRemainingTime(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeFeature, fetchPointsData]);

  // Format remaining time as mm:ss
  const formatTime = (ms) => {
    if (!ms) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Activate feature - NO CONFIRMATION
  const handleActivateFeature = async (feature) => {
    if (activatingFeature) return;
    if (activeFeature) return; // Another feature is active
    if (pointsBalance < feature.cost) return; // Not enough points
    if (hasSubscription) return; // Has subscription
    
    setActivatingFeature(feature.id);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/points/activate', {
      //   method: 'POST',
      //   body: JSON.stringify({ featureId: feature.id }),
      // });
      
      // Mock response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newBalance = pointsBalance - feature.cost;
      const endsAt = Date.now() + feature.duration * 60 * 1000;
      
      setPointsBalance(newBalance);
      setActiveFeature({ id: feature.id, endsAt });
      
      trackEvent('points_spent', { 
        feature: feature.id, 
        points_amount: feature.cost 
      });
      trackEvent('feature_started', { 
        feature: feature.id, 
        duration: feature.duration 
      });
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('activationFailed') || 'Activation failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setActivatingFeature(null);
    }
  };

  // Purchase points package
  const handlePurchasePackage = async (pkg) => {
    if (purchasingPackage) return;
    
    setPurchasingPackage(pkg.id);
    
    try {
      // TODO: Implement native checkout (App Store / Google Play)
      // This would open the native payment flow
      
      // Mock response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBalance = pointsBalance + pkg.points;
      setPointsBalance(newBalance);
      
      trackEvent('points_purchase_success', {
        package: pkg.id,
        points_amount: pkg.points,
        price: pkg.price,
      });
      trackEvent('points_earned', {
        points_amount: pkg.points,
        source: 'purchase',
      });
      
      // NO success screen, NO celebration animation
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('purchaseFailed') || 'Purchase failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setPurchasingPackage(null);
    }
  };

  // Get feature display info
  const getFeatureInfo = (feature) => {
    const names = {
      undo: t('featureUndo') || 'Undo',
      likes_you: t('featureLikesYou') || 'See Who Likes You',
      nearby_priority: t('featureNearbyPriority') || 'Nearby Priority',
      beat_pulse: t('featureBeatPulse') || 'BeatPulse Boost',
    };
    return names[feature.id] || feature.id;
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(180deg, #0f0a15 0%, #1a1025 50%, #0f0a15 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CircularProgress sx={{ color: '#ec4899' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #0f0a15 0%, #1a1025 50%, #0f0a15 100%)',
      pb: 10,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Hero Section - Dark theme like SubscriptionsScreen */}
      <Box
        sx={{
          position: 'relative',
          pt: 8,
          pb: 6,
          textAlign: 'center',
        }}
      >
        {/* Floating profile images in background - decorative */}
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[
            { top: '15%', right: '8%', size: 48 },
            { top: '25%', left: '5%', size: 40 },
            { top: '60%', right: '12%', size: 36 },
            { bottom: '20%', left: '10%', size: 44 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              style={{
                position: 'absolute',
                ...pos,
                width: pos.size,
                height: pos.size,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                opacity: 0.3,
              }}
            />
          ))}
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#fff',
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2.25rem' },
            }}
          >
            {t('chooseHowYouWant') || 'Choose how you'}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: '#fff',
              fontWeight: 800,
              mb: 4,
              fontSize: { xs: '1.75rem', sm: '2.25rem' },
            }}
          >
            {t('wantToBePresent') || 'want to be present'}
          </Typography>
        </motion.div>

        {/* Points Balance Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            px: 3,
            py: 1.5,
            borderRadius: '20px',
            background: 'rgba(236, 72, 153, 0.15)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
          }}>
            <Coins size={24} color="#ec4899" />
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem' }}>
              {pointsBalance}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              {t('pointsAvailable') || 'points'}
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* Section 1: PULSE BOOST - Spend Points */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Box
          sx={{
            position: 'relative',
            mx: 2,
            mb: 4,
            p: 3,
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
          }}
        >
          {/* Pulse Wave in background */}
          <PulseWave intensity="calm" style={{ opacity: 0.15 }} />
          
          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '20px',
                background: 'rgba(236, 72, 153, 0.15)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                mb: 2,
              }}
            >
              <Sparkles size={14} color="#ec4899" />
              <Typography sx={{ color: '#ec4899', fontSize: '0.75rem', fontWeight: 600 }}>
                PULSE BOOST
              </Typography>
            </Box>
            
            {/* Headline */}
            <Typography
              variant="h5"
              sx={{
                color: '#fff',
                fontWeight: 800,
                mb: 0.5,
                fontSize: '1.5rem',
              }}
            >
              {t('boostYourVisibility') || 'Boost your visibility'}
            </Typography>
            
            {/* Subline */}
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.95rem',
                mb: 3,
              }}
            >
              {t('spendPointsDesc') || 'Spend points to stand out'}
            </Typography>
            
            {/* Features list */}
            <Box sx={{ mb: 3 }}>
              {FEATURES.map((feature) => (
                <FeatureItem 
                  key={feature.id} 
                  text={`${getFeatureInfo(feature)} - ${feature.duration} ${t('minutes') || 'min'}`} 
                />
              ))}
            </Box>
            
            {/* Pricing Options */}
            <Box sx={{ mb: 3 }}>
              {FEATURES.map((feature, idx) => {
                const isActive = activeFeature?.id === feature.id;
                const isDisabled = hasSubscription || (activeFeature && !isActive) || pointsBalance < feature.cost;
                
                return (
                  <PricingOption
                    key={feature.id}
                    label={getFeatureInfo(feature)}
                    price={`${feature.cost} pts`}
                    note={isActive ? `⏱ ${formatTime(remainingTime)}` : `${feature.duration} min`}
                    selected={isActive}
                    onSelect={() => !isDisabled && !isActive && handleActivateFeature(feature)}
                  />
                );
              })}
            </Box>
            
            {/* Active Feature Notice */}
            {activeFeature && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 1.75,
                  borderRadius: '14px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <Check size={20} color="#22c55e" />
                <Typography sx={{ color: '#22c55e', fontWeight: 600 }}>
                  {getFeatureInfo({ id: activeFeature.id })} {t('active') || 'Active'}
                </Typography>
              </Box>
            )}

            {/* Subscription Active Notice */}
            {hasSubscription && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 1.75,
                  borderRadius: '14px',
                  background: 'rgba(236, 72, 153, 0.15)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                }}
              >
                <Crown size={20} color="#ec4899" />
                <Typography sx={{ color: '#ec4899', fontWeight: 600 }}>
                  {t('premiumActive') || 'Premium Active'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </motion.div>

      {/* Section 2: BUY POINTS */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      >
        <Box
          sx={{
            position: 'relative',
            mx: 2,
            mb: 4,
            p: 3,
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
          }}
        >
          {/* Pulse Wave in background */}
          <PulseWave intensity="energetic" style={{ opacity: 0.22 }} />
          
          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '20px',
                background: 'rgba(236, 72, 153, 0.15)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                mb: 2,
              }}
            >
              <Coins size={14} color="#ec4899" />
              <Typography sx={{ color: '#ec4899', fontSize: '0.75rem', fontWeight: 600 }}>
                PULSE POINTS
              </Typography>
            </Box>
            
            {/* Headline */}
            <Typography
              variant="h5"
              sx={{
                color: '#fff',
                fontWeight: 800,
                mb: 0.5,
                fontSize: '1.5rem',
              }}
            >
              {t('getMorePoints') || 'Get more points'}
            </Typography>
            
            {/* Subline */}
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.95rem',
                mb: 3,
              }}
            >
              {t('buyPointsDesc') || 'One-time purchase, no subscription'}
            </Typography>
            
            {/* Pricing Options */}
            <Box sx={{ mb: 3 }}>
              {PACKAGES.map((pkg) => (
                <PricingOption
                  key={pkg.id}
                  label={`${pkg.points} ${t('points') || 'Points'}`}
                  price={`${pkg.currency}${pkg.price}`}
                  note={t('oneTimePurchase') || 'one-time'}
                  selected={purchasingPackage === pkg.id}
                  onSelect={() => handlePurchasePackage(pkg)}
                />
              ))}
            </Box>
            
            {/* CTA */}
            <CTAButton 
              onClick={() => {
                const selectedPkg = PACKAGES.find(p => p.id === purchasingPackage) || PACKAGES[1];
                handlePurchasePackage(selectedPkg);
              }}
              disabled={!!purchasingPackage}
            >
              {purchasingPackage ? (
                <CircularProgress size={20} sx={{ color: '#fff' }} />
              ) : (
                t('buyNow') || 'Buy Now'
              )}
            </CTAButton>
          </Box>
        </Box>
      </motion.div>

      {/* Premium upsell link */}
      <Box sx={{ textAlign: 'center', px: 2, mb: 4 }}>
        <Typography
          onClick={() => navigate('/subscriptions')}
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            '&:hover': { color: '#ec4899' },
            transition: 'color 0.2s ease',
          }}
        >
          <Crown size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {t('premiumUnlocksEverything') || 'Premium unlocks everything — anytime'}
        </Typography>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PointsHubScreen;
