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
  Dialog,
  DialogContent,
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

// Feature definitions with descriptions
const FEATURES = [
  {
    id: 'undo',
    icon: Undo2,
    duration: 30, // minutes
    cost: 40,
    name: 'Undo',
    description: 'Changed your mind? Go back and undo your last swipe decision.',
    note: 'Works on Home & Nearby screens',
  },
  {
    id: 'likes_you',
    icon: Heart,
    duration: 10,
    cost: 80,
    name: 'See Who Likes You',
    description: 'See the list of people who already liked your profile.',
    note: 'List opens immediately',
  },
  {
    id: 'nearby_priority',
    icon: MapPin,
    duration: 10,
    cost: 70,
    name: 'Nearby Priority',
    description: 'Get shown first to people near you for more matches.',
    note: 'Boosts your visibility locally',
  },
  {
    id: 'beat_pulse',
    icon: Zap,
    duration: 15,
    cost: 70,
    name: 'BeatPulse Boost',
    description: 'Your profile gets a surge of visibility to more people.',
    note: 'Up to 10x more views',
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
  const [activeFeatures, setActiveFeatures] = useState({}); // { featureId: { endsAt } }
  const [selectedFeatures, setSelectedFeatures] = useState([]); // Features selected for purchase
  const [hasSubscription, setHasSubscription] = useState(false);
  const [activatingFeatures, setActivatingFeatures] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('medium'); // Selected package for purchase
  const [purchasingPackage, setPurchasingPackage] = useState(null); // Currently purchasing (loading state)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false); // Purchase confirmation dialog
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Timer state for active features
  const [remainingTimes, setRemainingTimes] = useState({}); // { featureId: remainingMs }

  // Fetch points data from server
  const fetchPointsData = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/points/status');
      // const data = await response.json();
      
      // Mock data for development
      const mockData = {
        balance: 150,
        activeFeatures: {}, // or { undo: { endsAt: Date.now() + 1000 * 60 * 15 } }
        hasSubscription: false,
      };
      
      setPointsBalance(mockData.balance);
      setActiveFeatures(mockData.activeFeatures || {});
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

  // Timer countdown for active features
  useEffect(() => {
    const activeIds = Object.keys(activeFeatures);
    if (activeIds.length === 0) {
      setRemainingTimes({});
      return;
    }

    const updateTimers = () => {
      const now = Date.now();
      const newTimes = {};
      const expiredFeatures = [];
      
      activeIds.forEach(featureId => {
        const feature = activeFeatures[featureId];
        if (feature?.endsAt) {
          const remaining = Math.max(0, feature.endsAt - now);
          if (remaining === 0) {
            expiredFeatures.push(featureId);
          } else {
            newTimes[featureId] = remaining;
          }
        }
      });
      
      setRemainingTimes(newTimes);
      
      // Remove expired features
      if (expiredFeatures.length > 0) {
        setActiveFeatures(prev => {
          const updated = { ...prev };
          expiredFeatures.forEach(id => {
            delete updated[id];
            trackEvent('feature_ended', { feature: id });
          });
          return updated;
        });
      }
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [activeFeatures]);

  // Format remaining time as mm:ss
  const formatTime = (ms) => {
    if (!ms) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Toggle feature selection (for purchase)
  const toggleFeatureSelection = (featureId) => {
    if (activeFeatures[featureId]) return; // Already active, can't select
    if (hasSubscription) return;
    
    setSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
  };

  // Calculate total cost of selected features
  const getSelectedTotalCost = () => {
    return selectedFeatures.reduce((total, featureId) => {
      const feature = FEATURES.find(f => f.id === featureId);
      return total + (feature?.cost || 0);
    }, 0);
  };

  // Activate selected features (after clicking Activate button)
  const handleActivateSelectedFeatures = async () => {
    if (activatingFeatures) return;
    if (selectedFeatures.length === 0) return;
    
    const totalCost = getSelectedTotalCost();
    if (pointsBalance < totalCost) {
      setSnackbar({
        open: true,
        message: 'Not enough points. Purchase more points below.',
        severity: 'warning',
      });
      return;
    }
    
    setActivatingFeatures(true);
    
    try {
      // Mock response - activate all selected features
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newActiveFeatures = { ...activeFeatures };
      selectedFeatures.forEach(featureId => {
        const feature = FEATURES.find(f => f.id === featureId);
        if (feature) {
          newActiveFeatures[featureId] = {
            endsAt: Date.now() + feature.duration * 60 * 1000,
          };
          trackEvent('points_spent', { 
            feature: featureId, 
            points_amount: feature.cost 
          });
          trackEvent('feature_started', { 
            feature: featureId, 
            duration: feature.duration 
          });
        }
      });
      
      setPointsBalance(prev => prev - totalCost);
      setActiveFeatures(newActiveFeatures);
      setSelectedFeatures([]);
      
      setSnackbar({
        open: true,
        message: `${selectedFeatures.length} feature${selectedFeatures.length > 1 ? 's' : ''} activated!`,
        severity: 'success',
      });
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Activation failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setActivatingFeatures(false);
    }
  };

  // Package size keys for the service
  const PACKAGE_KEYS = { small: 'small', medium: 'medium', large: 'large' };

  // Purchase points package via store billing service
  const handlePurchasePackage = async (pkg) => {
    if (purchasingPackage) return;
    
    setPurchasingPackage(pkg.id);
    setSnackbar({ open: true, message: 'Processing purchase...', severity: 'info' });
    
    try {
      // Import store billing service
      const { storeBilling, PRODUCTS } = await import('../services/storeBilling');
      
      const product = PRODUCTS.points[pkg.id];
      if (!product) {
        throw new Error('Invalid package');
      }
      
      trackEvent('points_purchase_initiated', {
        package: pkg.id,
        product_id: product.id,
        platform: storeBilling.getPlatform(),
      });

      // Use purchaseAndValidate for full flow with duplicate prevention
      const result = await storeBilling.purchaseAndValidate(product.id);
      
      if (result.success) {
        // Check if already processed (duplicate callback)
        if (result.alreadyProcessed) {
          console.log('[PointsHub] Purchase already processed, skipping');
          setShowPurchaseDialog(false);
          return;
        }
        
        // Points are added by validateReceipt via _cacheEntitlements
        // But also update local state for immediate UI feedback
        const newBalance = storeBilling.getPointsBalance();
        setPointsBalance(newBalance);
        
        // Close dialog and show success
        setShowPurchaseDialog(false);
        setSnackbar({
          open: true,
          message: `${product.points} Points added successfully!`,
          severity: 'success',
        });
        
        trackEvent('points_purchase_success', {
          package: pkg.id,
          points_amount: product.points,
          price: product.price,
          transactionId: result.transactionId,
        });
        trackEvent('points_earned', {
          points_amount: product.points,
          source: 'purchase',
        });
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error) {
      const errorMessage = error.message === 'cancelled' 
        ? 'Purchase cancelled' 
        : 'Payment failed. Please try again.';
      
      setShowPurchaseDialog(false);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      
      trackEvent('points_purchase_failed', {
        package: pkg.id,
        error: error.message,
      });
    } finally {
      setPurchasingPackage(null);
    }
  };

  // Restore purchases from store
  const handleRestorePurchases = async () => {
    setSnackbar({ open: true, message: 'Restoring purchases...', severity: 'info' });
    
    try {
      trackEvent('restore_purchases_initiated');
      const { storeBilling } = await import('../services/storeBilling');
      const purchases = await storeBilling.restorePurchases();
      
      if (purchases && purchases.length > 0) {
        setSnackbar({ open: true, message: 'Purchases restored!', severity: 'success' });
      } else {
        setSnackbar({
          open: true,
          message: 'No purchases to restore',
          severity: 'info',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to restore purchases',
        severity: 'error',
      });
    }
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
            Choose how you
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
            want to be present
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
              points
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
              Boost your visibility
            </Typography>
            
            {/* Subline */}
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.95rem',
                mb: 3,
              }}
            >
              Spend points to stand out
            </Typography>
            
            {/* Feature Selection Cards */}
            <Box sx={{ mb: 3 }}>
              {FEATURES.map((feature) => {
                const isActive = !!activeFeatures[feature.id];
                const isSelected = selectedFeatures.includes(feature.id);
                const Icon = feature.icon;
                
                return (
                  <Box
                    key={feature.id}
                    onClick={() => toggleFeatureSelection(feature.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      p: 2,
                      mb: 1.5,
                      borderRadius: '14px',
                      border: isActive 
                        ? '2px solid rgba(34, 197, 94, 0.6)'
                        : isSelected 
                          ? '2px solid rgba(236, 72, 153, 0.8)' 
                          : '1px solid rgba(255, 255, 255, 0.15)',
                      background: isActive
                        ? 'rgba(34, 197, 94, 0.1)'
                        : isSelected 
                          ? 'rgba(236, 72, 153, 0.1)' 
                          : 'rgba(255, 255, 255, 0.03)',
                      cursor: isActive ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isActive ? 0.8 : 1,
                      '&:hover': !isActive ? {
                        background: 'rgba(236, 72, 153, 0.08)',
                        borderColor: 'rgba(236, 72, 153, 0.5)',
                      } : {},
                    }}
                  >
                    {/* Checkbox / Active indicator */}
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: isActive 
                          ? '2px solid #22c55e'
                          : isSelected 
                            ? '6px solid #ec4899' 
                            : '2px solid rgba(255, 255, 255, 0.3)',
                        background: isActive ? '#22c55e' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.25,
                      }}
                    >
                      {isActive && <Check size={14} color="#fff" />}
                    </Box>
                    
                    {/* Feature content */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Icon size={18} color={isActive ? '#22c55e' : '#ec4899'} />
                        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                          {feature.name}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', mb: 0.5 }}>
                        {feature.description}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.7rem', fontStyle: 'italic' }}>
                        {feature.note}
                      </Typography>
                    </Box>
                    
                    {/* Price / Timer */}
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      {isActive ? (
                        <>
                          <Typography sx={{ color: '#22c55e', fontWeight: 700, fontSize: '0.9rem' }}>
                            Active
                          </Typography>
                          <Typography sx={{ color: '#22c55e', fontSize: '0.75rem' }}>
                            ⏱ {formatTime(remainingTimes[feature.id])}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography sx={{ color: '#ec4899', fontWeight: 700, fontSize: '0.95rem' }}>
                            {feature.cost} pts
                          </Typography>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                            {feature.duration} min
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
            
            {/* Activate Selected Button */}
            {selectedFeatures.length > 0 && (
              <CTAButton 
                onClick={handleActivateSelectedFeatures}
                disabled={activatingFeatures || pointsBalance < getSelectedTotalCost()}
              >
                {activatingFeatures ? (
                  <CircularProgress size={20} sx={{ color: '#fff' }} />
                ) : (
                  <>
                    Activate {selectedFeatures.length} feature{selectedFeatures.length > 1 ? 's' : ''} 
                    <span style={{ marginLeft: 8, opacity: 0.8 }}>
                      ({getSelectedTotalCost()} pts)
                    </span>
                  </>
                )}
              </CTAButton>
            )}
            
            {/* Not enough points warning */}
            {selectedFeatures.length > 0 && pointsBalance < getSelectedTotalCost() && (
              <Typography sx={{ 
                color: '#f59e0b', 
                fontSize: '0.85rem', 
                textAlign: 'center',
                mt: 1.5,
              }}>
                Not enough points. You need {getSelectedTotalCost() - pointsBalance} more points.
              </Typography>
            )}
            
            {/* Active Features Summary */}
            {Object.keys(activeFeatures).length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 1.5,
                  mt: 2,
                  borderRadius: '14px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <Check size={18} color="#22c55e" />
                <Typography sx={{ color: '#22c55e', fontWeight: 600, fontSize: '0.9rem' }}>
                  {Object.keys(activeFeatures).length} feature{Object.keys(activeFeatures).length > 1 ? 's' : ''} active
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
              Get more points
            </Typography>
            
            {/* Subline */}
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.95rem',
                mb: 3,
              }}
            >
              One-time purchase, no subscription
            </Typography>
            
            {/* Pricing Options - Click to SELECT, not purchase */}
            <Box sx={{ mb: 3 }}>
              {PACKAGES.map((pkg) => (
                <PricingOption
                  key={pkg.id}
                  label={`${pkg.points} Points`}
                  price={`${pkg.currency}${pkg.price}`}
                  note="one-time"
                  selected={selectedPackage === pkg.id}
                  onSelect={() => setSelectedPackage(pkg.id)}
                />
              ))}
            </Box>
            
            {/* CTA - Opens purchase confirmation dialog */}
            <CTAButton 
              onClick={() => setShowPurchaseDialog(true)}
              disabled={!!purchasingPackage}
            >
              {purchasingPackage ? (
                <CircularProgress size={20} sx={{ color: '#fff' }} />
              ) : (
                `Buy Now - ${PACKAGES.find(p => p.id === selectedPackage)?.points || 250} Points`
              )}
            </CTAButton>
          </Box>
        </Box>
      </motion.div>

      {/* Restore Purchases */}
      <Box sx={{ textAlign: 'center', px: 2, mb: 2 }}>
        <Typography
          onClick={handleRestorePurchases}
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            '&:hover': { color: 'rgba(255, 255, 255, 0.8)' },
            transition: 'color 0.2s ease',
          }}
        >
          Restore Purchases
        </Typography>
      </Box>

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
          Premium unlocks everything — anytime
        </Typography>
      </Box>

      {/* Purchase Confirmation Dialog */}
      <Dialog
        open={showPurchaseDialog}
        onClose={() => !purchasingPackage && setShowPurchaseDialog(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, #1a1025 0%, #0f0a15 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: 340,
            mx: 2,
          },
        }}
      >
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          {/* Icon */}
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(236, 72, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Coins size={28} color="#ec4899" />
          </Box>
          
          {/* Title */}
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', mb: 1 }}>
            {purchasingPackage ? 'Processing...' : 'Confirm Purchase'}
          </Typography>
          
          {/* Package details */}
          {!purchasingPackage && (
            <>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', mb: 2 }}>
                You're about to purchase
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  background: 'rgba(236, 72, 153, 0.1)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  mb: 3,
                }}
              >
                <Typography sx={{ color: '#ec4899', fontWeight: 700, fontSize: '1.5rem' }}>
                  {PACKAGES.find(p => p.id === selectedPackage)?.points} Points
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                  for {PACKAGES.find(p => p.id === selectedPackage)?.currency}
                  {PACKAGES.find(p => p.id === selectedPackage)?.price}
                </Typography>
              </Box>
            </>
          )}
          
          {/* Loading state */}
          {purchasingPackage && (
            <Box sx={{ py: 3 }}>
              <CircularProgress sx={{ color: '#ec4899' }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 2, fontSize: '0.9rem' }}>
                Connecting to store...
              </Typography>
            </Box>
          )}
          
          {/* Buttons */}
          {!purchasingPackage && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                onClick={() => setShowPurchaseDialog(false)}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#ffffff !important',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.08)',
                  '&:hover': { background: 'rgba(255,255,255,0.12)' },
                  '& .MuiButton-label': { color: '#ffffff' },
                }}
              >
                <span style={{ color: '#ffffff' }}>Cancel</span>
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  const pkg = PACKAGES.find(p => p.id === selectedPackage);
                  if (pkg) handlePurchasePackage(pkg);
                }}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)' },
                }}
              >
                Confirm
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 8 }}
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
