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
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
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
  Gift,
  Star,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PointsBalanceSkeleton, FeatureCardsSkeleton } from '../components/SkeletonLoading';

// Floating particles animation for vibrant feel
const FloatingParticles = () => (
  <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        style={{
          position: 'absolute',
          width: 8 + Math.random() * 12,
          height: 8 + Math.random() * 12,
          borderRadius: '50%',
          background: `rgba(${200 + Math.random() * 55}, ${100 + Math.random() * 100}, ${200 + Math.random() * 55}, 0.6)`,
          left: `${10 + Math.random() * 80}%`,
          top: `${10 + Math.random() * 80}%`,
        }}
        animate={{
          y: [0, -20, 0],
          x: [0, Math.random() * 10 - 5, 0],
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </Box>
);

// Coin icon with glow effect
const GlowingCoin = ({ size = 40 }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{
        position: 'absolute',
        inset: -8,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,200,50,0.4) 0%, transparent 70%)',
      }}
    />
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(255,165,0,0.5)',
      }}
    >
      <Coins size={size * 0.5} color="#fff" />
    </Box>
  </Box>
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
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 4 }}>
        {/* Header Skeleton */}
        <Box sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
            {t('yourPoints') || 'Your Points'}
          </Typography>
        </Box>
        <Box sx={{ px: 2, pt: 3 }}>
          <PointsBalanceSkeleton />
          <Box sx={{ mt: 3 }}>
            <FeatureCardsSkeleton count={4} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', pb: 10 }}>
      {/* Hero Section with Gradient - IDENTICAL to Events page */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          pt: 3,
          pb: 6,
          mb: 3,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(108,92,231,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.3) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, px: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 900, 
                color: '#fff',
                mb: 1,
                textShadow: '0 2px 20px rgba(0,0,0,0.2)',
              }}
            >
              {t('yourPoints') || 'Your Points'}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 500,
                mb: 3,
                maxWidth: 600,
              }}
            >
              {t('boostYourProfile') || 'Boost your profile and unlock premium features'}
            </Typography>
          </motion.div>

          {/* Points Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.3)',
              p: 2.5,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(255,165,0,0.4)',
                }}>
                  <Coins size={28} color="#fff" />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                    {pointsBalance}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    {t('pointsAvailable') || 'Points Available'}
                  </Typography>
                </Box>
              </Box>
              <Button
                onClick={() => {/* scroll to buy section */}}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: '12px',
                  bgcolor: '#fff',
                  color: '#667eea',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: '#f8f9ff',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Gift size={18} style={{ marginRight: 8 }} />
                {t('getMorePoints') || 'Get More'}
              </Button>
            </Box>
          </motion.div>
        </Box>
      </Box>

      <Box sx={{ px: 2 }}>
        {/* Section A: Balance Display removed - now in hero */}

        {/* Section B: Active Feature (Conditional) */}
        {activeFeature && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{
              bgcolor: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              borderRadius: '16px',
              p: 2.5,
              mb: 3,
              color: '#ffffff',
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Box>
                  <Typography sx={{ 
                    fontSize: 12, 
                    fontWeight: 600, 
                    opacity: 0.9,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    mb: 0.5,
                  }}>
                    {t('activeNow') || 'Active Now'}
                  </Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                    {getFeatureInfo({ id: activeFeature.id })}
                  </Typography>
                </Box>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  px: 2,
                  py: 1,
                }}>
                  <Clock size={18} />
                  <Typography sx={{ 
                    fontSize: 20, 
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}>
                    {formatTime(remainingTime)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Subscription Active Notice */}
        {hasSubscription && (
          <Box sx={{
            bgcolor: '#fef3c7',
            borderRadius: '12px',
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <Crown size={24} color="#d97706" />
            <Typography sx={{ color: '#92400e', fontSize: 14 }}>
              {t('subscriptionActivePointsDisabled') || 'You have an active subscription. Points features are included.'}
            </Typography>
          </Box>
        )}

        {/* Section C: Spend Points (Feature Cards) */}
        <Typography sx={{
          fontSize: 14,
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: 1,
          mb: 2,
        }}>
          {t('spendPoints') || 'Spend Points'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {FEATURES.map((feature, idx) => {
            const FeatureIcon = feature.icon;
            const isActive = activeFeature?.id === feature.id;
            const isDisabled = hasSubscription || 
                             (activeFeature && !isActive) || 
                             pointsBalance < feature.cost;
            const notEnoughPoints = pointsBalance < feature.cost && !hasSubscription && !activeFeature;
            const isActivating = activatingFeature === feature.id;
            
            // Gradient colors for each feature - matching Events page style
            const featureColors = [
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Undo
              'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Likes
              'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Nearby
              'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // BeatPulse
            ];

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Box sx={{
                  bgcolor: '#fff',
                  borderRadius: '16px',
                  p: 2,
                  opacity: isDisabled && !isActive ? 0.6 : 1,
                  border: isActive ? '2px solid #667eea' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: isActive ? '0 4px 20px rgba(102,126,234,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  },
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        background: featureColors[idx],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                      }}>
                        <FeatureIcon size={24} color="#fff" />
                      </Box>
                      <Box>
                        <Typography sx={{ 
                          fontWeight: 700, 
                          color: '#1a1a2e',
                          fontSize: 15,
                        }}>
                          {getFeatureInfo(feature)}
                        </Typography>
                        <Typography sx={{ 
                          fontSize: 13, 
                          color: '#64748b',
                        }}>
                          {feature.duration} {t('minutes') || 'min'} • {feature.cost} {t('pts') || 'pts'}
                        </Typography>
                      </Box>
                    </Box>

                    {isActive ? (
                      <Box sx={{
                        background: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
                        color: '#ffffff',
                        px: 2,
                        py: 1,
                        borderRadius: '10px',
                        fontSize: 13,
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                      }}>
                        {t('active') || 'Active'}
                      </Box>
                    ) : (
                      <Button
                        onClick={() => handleActivateFeature(feature)}
                        disabled={isDisabled || isActivating}
                        sx={{
                          background: isDisabled ? '#e5e7eb' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: isDisabled ? '#9ca3af' : '#ffffff',
                          px: 2.5,
                          py: 1,
                          borderRadius: '10px',
                          fontSize: 13,
                          fontWeight: 700,
                          textTransform: 'none',
                          minWidth: 90,
                          boxShadow: isDisabled ? 'none' : '0 4px 12px rgba(102,126,234,0.3)',
                          '&:hover': {
                            background: isDisabled ? '#e5e7eb' : 'linear-gradient(135deg, #5568d3 0%, #6a4296 100%)',
                            boxShadow: isDisabled ? 'none' : '0 6px 16px rgba(102,126,234,0.4)',
                          },
                          '&.Mui-disabled': {
                            background: '#e5e7eb',
                            color: '#9ca3af',
                          },
                        }}
                      >
                        {isActivating ? (
                          <CircularProgress size={18} sx={{ color: '#ffffff' }} />
                        ) : (
                          t('activate') || 'Activate'
                        )}
                      </Button>
                    )}
                  </Box>

                  {/* Not enough points hint */}
                  {notEnoughPoints && (
                    <Typography sx={{
                      fontSize: 12,
                      color: '#667eea',
                      mt: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}>
                      <Sparkles size={14} />
                      {t('needMorePoints') || `Need ${feature.cost - pointsBalance} more points`}
                    </Typography>
                  )}
                </Box>
              </motion.div>
            );
          })}
        </Box>

        {/* Section D: Buy Points */}
        <Typography sx={{
          fontSize: 14,
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: 1,
          mb: 2,
        }}>
          {t('buyPoints') || 'Buy Points'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {PACKAGES.map((pkg, idx) => {
            const isPurchasing = purchasingPackage === pkg.id;
            
            // Package colors - matching Events page style
            const packageColors = [
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Small
              'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Medium
              'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', // Large - best value
            ];
            
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Box
                  onClick={() => !isPurchasing && handlePurchasePackage(pkg)}
                  sx={{
                    position: 'relative',
                    bgcolor: '#fff',
                    borderRadius: '16px',
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    border: '1px solid rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '14px',
                      background: packageColors[idx],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                    }}>
                      <Coins size={24} color="#fff" />
                    </Box>
                    <Box>
                      <Typography sx={{ 
                        fontWeight: 700, 
                        color: '#1a1a2e',
                        fontSize: 20,
                      }}>
                        {pkg.points}
                      </Typography>
                      <Typography sx={{ 
                        fontSize: 13, 
                        color: '#64748b',
                      }}>
                        {t('points') || 'Points'}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      px: 3,
                      py: 1.25,
                      borderRadius: '12px',
                      fontSize: 16,
                      fontWeight: 700,
                      minWidth: 90,
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a4296 100%)',
                        boxShadow: '0 6px 16px rgba(102,126,234,0.4)',
                      },
                    }}
                  >
                    {isPurchasing ? (
                      <CircularProgress size={18} sx={{ color: '#ffffff' }} />
                    ) : (
                      `${pkg.currency}${pkg.price}`
                    )}
                  </Button>
                </Box>
              </motion.div>
            );
          })}
        </Box>

        {/* Premium comparison text (required) */}
        <Box sx={{
          bgcolor: '#fff',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: '16px',
          p: 2.5,
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <Typography sx={{
            fontSize: 14,
            color: '#1a1a2e',
            fontWeight: 600,
          }}>
            <Crown size={16} style={{ verticalAlign: 'middle', marginRight: 6, color: '#667eea' }} />
            {t('premiumUnlocksEverything') || 'Premium unlocks everything — anytime'}
          </Typography>
        </Box>
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
