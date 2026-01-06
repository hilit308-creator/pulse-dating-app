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
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PointsBalanceSkeleton, FeatureCardsSkeleton } from '../components/SkeletonLoading';

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
          <IconButton disabled sx={{ color: '#e2e8f0' }}>
            <ArrowLeft size={24} />
          </IconButton>
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
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f8fafc',
      pb: 4,
    }}>
      {/* Header */}
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
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#1a1a2e' }}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {t('yourPoints') || 'Your Points'}
        </Typography>
      </Box>

      <Box sx={{ px: 2, pt: 3 }}>
        {/* Section A: Balance Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{
            bgcolor: '#ffffff',
            borderRadius: '20px',
            p: 3,
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            mb: 3,
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mb: 1,
            }}>
              <Coins size={28} color="#6C5CE7" />
            </Box>
            <Typography sx={{
              fontSize: 48,
              fontWeight: 800,
              color: '#1a1a2e',
              lineHeight: 1,
            }}>
              {pointsBalance}
            </Typography>
            <Typography sx={{
              fontSize: 16,
              color: '#64748b',
              mt: 1,
            }}>
              {t('points') || 'Points'}
            </Typography>
          </Box>
        </motion.div>

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
          {FEATURES.map((feature) => {
            const FeatureIcon = feature.icon;
            const isActive = activeFeature?.id === feature.id;
            const isDisabled = hasSubscription || 
                             (activeFeature && !isActive) || 
                             pointsBalance < feature.cost;
            const notEnoughPoints = pointsBalance < feature.cost && !hasSubscription && !activeFeature;
            const isActivating = activatingFeature === feature.id;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Box sx={{
                  bgcolor: '#ffffff',
                  borderRadius: '16px',
                  p: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  opacity: isDisabled && !isActive ? 0.6 : 1,
                  border: isActive ? '2px solid #6C5CE7' : '2px solid transparent',
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
                        borderRadius: '12px',
                        bgcolor: isActive ? '#6C5CE7' : 'rgba(108,92,231,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <FeatureIcon size={24} color={isActive ? '#ffffff' : '#6C5CE7'} />
                      </Box>
                      <Box>
                        <Typography sx={{ 
                          fontWeight: 600, 
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
                        bgcolor: '#6C5CE7',
                        color: '#ffffff',
                        px: 2,
                        py: 1,
                        borderRadius: '10px',
                        fontSize: 13,
                        fontWeight: 600,
                      }}>
                        {t('active') || 'Active'}
                      </Box>
                    ) : (
                      <Button
                        onClick={() => handleActivateFeature(feature)}
                        disabled={isDisabled || isActivating}
                        sx={{
                          bgcolor: isDisabled ? '#e2e8f0' : '#6C5CE7',
                          color: isDisabled ? '#94a3b8' : '#ffffff',
                          px: 2.5,
                          py: 1,
                          borderRadius: '10px',
                          fontSize: 13,
                          fontWeight: 600,
                          textTransform: 'none',
                          minWidth: 90,
                          '&:hover': {
                            bgcolor: isDisabled ? '#e2e8f0' : '#5b4cdb',
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#e2e8f0',
                            color: '#94a3b8',
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
                      color: '#f59e0b',
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
          {PACKAGES.map((pkg) => {
            const isPurchasing = purchasingPackage === pkg.id;
            
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  onClick={() => !isPurchasing && handlePurchasePackage(pkg)}
                  sx={{
                    bgcolor: '#ffffff',
                    borderRadius: '16px',
                    p: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.01)',
                    },
                    '&:active': {
                      transform: 'scale(0.99)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: 'rgba(108,92,231,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Coins size={24} color="#6C5CE7" />
                    </Box>
                    <Box>
                      <Typography sx={{ 
                        fontWeight: 700, 
                        color: '#1a1a2e',
                        fontSize: 18,
                      }}>
                        {pkg.points} {t('points') || 'Points'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{
                    bgcolor: '#6C5CE7',
                    color: '#ffffff',
                    px: 2.5,
                    py: 1,
                    borderRadius: '10px',
                    fontSize: 15,
                    fontWeight: 700,
                    minWidth: 80,
                    textAlign: 'center',
                  }}>
                    {isPurchasing ? (
                      <CircularProgress size={18} sx={{ color: '#ffffff' }} />
                    ) : (
                      `${pkg.currency}${pkg.price}`
                    )}
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </Box>

        {/* Premium comparison text (required) */}
        <Box sx={{
          bgcolor: 'rgba(108,92,231,0.08)',
          borderRadius: '12px',
          p: 2,
          textAlign: 'center',
        }}>
          <Typography sx={{
            fontSize: 14,
            color: '#6C5CE7',
            fontWeight: 500,
          }}>
            <Crown size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
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
