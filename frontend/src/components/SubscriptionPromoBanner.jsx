/**
 * SubscriptionPromoBanner - Promotional Upgrade Banners
 * 
 * Per Spec: Non-blocking promotional banners
 * 
 * Banner Types:
 * - promo_home_inline: Inline card after 6-10 swipes on Home
 * - promo_nearby_sticky: Fixed bottom banner in Nearby screen
 * 
 * Features:
 * - Dismissible (X button)
 * - Frequency caps (dismiss → hide for 7-14 days)
 * - A/B copy variants
 * - Non-blocking
 * 
 * Analytics:
 * - promo_impression
 * - promo_click
 * - promo_dismiss
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronRight } from 'lucide-react';

// Mini Pulse Wave for banners - same style as Subscriptions screen
const MiniPulseWave = () => (
  <Box
    sx={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      height: '100%',
      overflow: 'hidden',
      opacity: 0.25,
      pointerEvents: 'none',
    }}
  >
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 50"
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="miniPulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <filter id="miniPulseGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <motion.path
        d="M0,25 Q50,15 100,25 T200,25 Q250,35 300,25 T400,25"
        fill="none"
        stroke="url(#miniPulseGradient)"
        strokeWidth="2"
        filter="url(#miniPulseGlow)"
        animate={{ 
          d: [
            "M0,25 Q50,15 100,25 T200,25 Q250,35 300,25 T400,25",
            "M0,25 Q50,30 100,25 T200,25 Q250,20 300,25 T400,25",
            "M0,25 Q50,15 100,25 T200,25 Q250,35 300,25 T400,25",
          ]
        }}
        transition={{
          d: {
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }
        }}
      />
    </svg>
  </Box>
);

// A/B Copy Variants
const PROMO_COPY = {
  promo_home_inline: {
    A: {
      main: "Undo + Likes You unlocked",
      cta: "Unlock",
    },
    B: {
      main: "Don't miss matches",
      cta: "Upgrade",
    },
    C: {
      main: "Someone might be waiting",
      cta: "See More",
    },
  },
  promo_nearby_sticky: {
    A: {
      main: "Nearby without limits",
      sub: "Scan anytime · See everyone",
      cta: "Upgrade",
    },
    B: {
      main: "Scan anytime · No waiting",
      sub: null,
      cta: "Unlock",
    },
    C: {
      main: "See everyone around you",
      sub: null,
      cta: "Get Access",
    },
  },
};

// Storage keys for dismiss tracking
const DISMISS_STORAGE_KEY = 'pulse_promo_dismissed';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Check if promo should be shown (respects dismiss period)
const shouldShowPromo = (promoId, dismissDays = 7) => {
  try {
    const dismissed = JSON.parse(localStorage.getItem(DISMISS_STORAGE_KEY) || '{}');
    const dismissedAt = dismissed[promoId];
    
    if (!dismissedAt) return true;
    
    const daysSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return daysSinceDismiss >= dismissDays;
  } catch {
    return true;
  }
};

// Mark promo as dismissed
const dismissPromo = (promoId) => {
  try {
    const dismissed = JSON.parse(localStorage.getItem(DISMISS_STORAGE_KEY) || '{}');
    dismissed[promoId] = Date.now();
    localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify(dismissed));
  } catch {
    // Ignore storage errors
  }
};

// Deterministic variant assignment
const getVariantForUser = (userId, promoId) => {
  const hash = (userId + ':' + promoId).split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const bucket = Math.abs(hash) % 100;
  return bucket < 50 ? 'A' : 'B';
};

/**
 * Home Screen Inline Promo Banner
 * Appears after 6-10 swipes, inline below profile image
 */
export const HomeInlinePromoBanner = ({ userId = 'anonymous', swipeCount = 0 }) => {
  const navigate = useNavigate();
  const [variant, setVariant] = useState('A');
  
  useEffect(() => {
    setVariant(getVariantForUser(userId, 'promo_home_inline'));
    trackEvent('promo_impression', {
      promo_id: 'promo_home_inline',
      variant_id: variant,
      swipe_count: swipeCount,
    });
  }, [swipeCount, userId, variant]);

  const handleClick = useCallback(() => {
    trackEvent('promo_click', {
      promo_id: 'promo_home_inline',
      variant_id: variant,
    });
    navigate('/subscriptions');
  }, [variant, navigate]);

  const copy = PROMO_COPY.promo_home_inline[variant] || PROMO_COPY.promo_home_inline.A;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          onClick={handleClick}
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mx: 2,
            my: 1.5,
            px: 2,
            py: 1.25,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(15,10,25,0.95) 0%, rgba(25,15,40,0.95) 100%)',
            border: '1px solid rgba(236,72,153,0.3)',
            cursor: 'pointer',
            overflow: 'hidden',
            '&:hover': {
              border: '1px solid rgba(236,72,153,0.5)',
            },
          }}
        >
          {/* Pulse Wave Animation */}
          <MiniPulseWave />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
            <Sparkles size={18} color="#ec4899" />
            <Typography sx={{ color: '#fff', fontWeight: 500, fontSize: '0.9rem' }}>
              {copy.main}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1 }}>
            <Button
              size="small"
              sx={{
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
                },
              }}
            >
              {copy.cta}
            </Button>
          </Box>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Nearby Sticky Bottom Banner
 * Fixed at bottom of Nearby screen, above tab bar
 */
export const NearbyStickyStickyBanner = ({ userId = 'anonymous' }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true); // Start visible
  const [variant, setVariant] = useState('A');
  
  useEffect(() => {
    // Check if should show (reappears after 3 minutes if dismissed)
    const checkVisibility = () => {
      const shouldShow = shouldShowPromo('promo_nearby_sticky', 0.00208); // 3 minutes = 0.00208 days
      setIsVisible(shouldShow);
      if (shouldShow) {
        setVariant(getVariantForUser(userId, 'promo_nearby_sticky'));
        trackEvent('promo_impression', {
          promo_id: 'promo_nearby_sticky',
          variant_id: variant,
        });
      }
    };
    
    checkVisibility();
    
    // Check every 30 seconds if banner should reappear
    const interval = setInterval(checkVisibility, 30000);
    return () => clearInterval(interval);
  }, [userId, variant]);

  const handleClick = useCallback(() => {
    trackEvent('promo_click', {
      promo_id: 'promo_nearby_sticky',
      variant_id: variant,
    });
    navigate('/subscriptions');
  }, [variant, navigate]);

  const handleDismiss = useCallback((e) => {
    e.stopPropagation();
    trackEvent('promo_dismiss', {
      promo_id: 'promo_nearby_sticky',
      variant_id: variant,
    });
    dismissPromo('promo_nearby_sticky');
    setIsVisible(false);
  }, [variant]);

  const copy = PROMO_COPY.promo_nearby_sticky[variant] || PROMO_COPY.promo_nearby_sticky.A;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 70px)', // Above tab bar
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 16px',
        }}
      >
        <Box
          onClick={handleClick}
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(15,10,25,0.98) 0%, rgba(25,15,40,0.98) 100%)',
            border: '1px solid rgba(236,72,153,0.4)',
            boxShadow: '0 4px 20px rgba(236,72,153,0.3)',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {/* Pulse Wave Animation */}
          <MiniPulseWave />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
              {copy.main}
            </Typography>
            {copy.sub && (
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                {copy.sub}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1 }}>
            <Button
              size="small"
              sx={{
                minWidth: 'auto',
                px: 2,
                py: 0.75,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
                },
              }}
            >
              {copy.cta}
              <ChevronRight size={16} style={{ marginLeft: 4 }} />
            </Button>
            
            <IconButton
              size="small"
              onClick={handleDismiss}
              sx={{ p: 0.5, color: 'rgba(255,255,255,0.7)' }}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

// Reset dismissed promos (for testing)
export const resetDismissedPromos = () => {
  localStorage.removeItem(DISMISS_STORAGE_KEY);
};

export default {
  HomeInlinePromoBanner,
  NearbyStickyStickyBanner,
};
