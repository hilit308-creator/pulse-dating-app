/**
 * PointsPromoBanner - Points Promotional Banners
 * 
 * Per Spec: Points System promotional surfaces
 * 
 * Banner Types:
 * - EditProfileBanner: Persistent in Edit Profile, below Profile Strength
 * - ChatStickyBanner: Bottom sticky in Chat List, dismissible (7 days)
 * - HomePromoBanner: Inline card after X swipes
 * 
 * Design: Dark theme matching SubscriptionsScreen (nightlife, premium feel)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Sparkles, ChevronRight } from 'lucide-react';

// Storage key for dismiss tracking
const DISMISS_STORAGE_KEY = 'pulse_points_promo_dismissed';

// Check if promo should be shown
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
  } catch {}
};

// Floating circles animation - same style as PointsHubScreen hero
const FloatingCircles = ({ count = 3 }) => (
  <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {[
      { top: '10%', right: '8%', size: 28 },
      { top: '55%', left: '5%', size: 24 },
      { bottom: '15%', right: '15%', size: 20 },
      { top: '35%', left: '12%', size: 18 },
    ].slice(0, count).map((pos, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 3 + i * 0.5, 
          repeat: Infinity,
          delay: i * 0.3,
        }}
        style={{
          position: 'absolute',
          ...pos,
          width: pos.size,
          height: pos.size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
        }}
      />
    ))}
  </Box>
);

/**
 * Edit Profile Points Banner
 * Placement: Below Profile Strength bar, above Photos section
 * Persistent, non-dismissible
 * Design: Dark theme matching SubscriptionsScreen
 */
export const EditProfilePointsBanner = ({ pointsBalance = 150 }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        onClick={() => navigate('/points')}
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #1a1025 0%, #0f0a15 100%)',
          borderRadius: '16px',
          p: 2,
          mx: 2,
          mb: 2,
          cursor: 'pointer',
          overflow: 'hidden',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          boxShadow: '0 4px 20px rgba(236, 72, 153, 0.2)',
        }}
      >
        {/* Floating circles animation */}
        <FloatingCircles count={3} />
        
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(236, 72, 153, 0.2)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Coins size={24} color="#ec4899" />
            </Box>
            <Box>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                {pointsBalance} Points available
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                Use points to unlock short premium boosts
              </Typography>
            </Box>
          </Box>
          
          <Button
            sx={{
              background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
              },
            }}
          >
            <Sparkles size={16} style={{ marginRight: 6 }} />
            Get More
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
};

/**
 * Chat List Sticky Banner
 * Placement: Bottom of Chat List, above tab bar
 * Dismissible - hidden for 7 days after dismiss
 * Design: Dark theme matching SubscriptionsScreen
 */
export const ChatPointsStickyBanner = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (shouldShowPromo('points_chat_sticky', 7)) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = useCallback((e) => {
    e.stopPropagation();
    dismissPromo('points_chat_sticky');
    setIsVisible(false);
  }, []);

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
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 70px)',
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 16px',
        }}
      >
        <Box
          onClick={() => navigate('/points')}
          sx={{
            position: 'relative',
            background: 'linear-gradient(135deg, #1a1025 0%, #0f0a15 100%)',
            borderRadius: '14px',
            p: 2,
            cursor: 'pointer',
            overflow: 'hidden',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            boxShadow: '0 4px 20px rgba(236, 72, 153, 0.25)',
          }}
        >
          {/* Floating circles animation */}
          <FloatingCircles count={3} />
          
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(236, 72, 153, 0.2)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Coins size={18} color="#ec4899" />
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                  Boost your chances!
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                  Get Points & Unlock special features
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                sx={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  px: 2,
                  py: 0.75,
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
                  },
                }}
              >
                Shop Now
                <ChevronRight size={16} style={{ marginLeft: 4 }} />
              </Button>
              
              <IconButton
                size="small"
                onClick={handleDismiss}
                sx={{ p: 0.5, color: 'rgba(255,255,255,0.5)' }}
              >
                <X size={18} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Home Feed Promo Card
 * Placement: Inline after X swipes, replaces swipe card temporarily
 * Non-blocking, dismissible
 * Design: Dark theme matching SubscriptionsScreen
 */
export const HomePointsPromoCard = ({ onDismiss }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0f0a15 0%, #1a1025 100%)',
          borderRadius: '24px',
          p: 3,
          mx: 2,
          my: 2,
          overflow: 'hidden',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          boxShadow: '0 8px 32px rgba(236, 72, 153, 0.2)',
        }}
      >
        {/* Background glow */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        
        {/* Floating circles animation */}
        <FloatingCircles count={3} />
        
        {/* Close button */}
        <IconButton
          onClick={onDismiss}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'rgba(255,255,255,0.5)',
            zIndex: 2,
          }}
        >
          <X size={20} />
        </IconButton>
        
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
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
              PULSE POINTS
            </Typography>
          </Box>
          
          <Typography sx={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#fff',
            mb: 0.5,
          }}>
            Get More Likes!
          </Typography>
          
          <Typography sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.95rem',
            mb: 3,
          }}>
            Use Points to boost your profile and see who likes you
          </Typography>
          
          <Button
            onClick={() => navigate('/points')}
            sx={{
              background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(236, 72, 153, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
                boxShadow: '0 12px 40px rgba(236, 72, 153, 0.45)',
              },
            }}
          >
            Unlock Now
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
};

// Reset dismissed promos (for testing)
export const resetPointsPromos = () => {
  localStorage.removeItem(DISMISS_STORAGE_KEY);
};

export default {
  EditProfilePointsBanner,
  ChatPointsStickyBanner,
  HomePointsPromoCard,
};
