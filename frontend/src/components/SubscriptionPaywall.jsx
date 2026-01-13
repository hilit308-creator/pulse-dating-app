/**
 * SubscriptionPaywall - Reusable Paywall Component
 * 
 * Per Spec: Paywalls appear only when a user attempts to use a subscription-gated feature
 * 
 * Paywall Types:
 * - paywall_undo: After free undo quota exhausted
 * - paywall_nearby: Scan cooldown / show more
 * - paywall_likes_you: Tap blurred profile or CTA
 * 
 * Features:
 * - A/B copy variants (deterministic per user)
 * - Bottom sheet UI (~55% height)
 * - Dismissible with "Not now"
 * - Frequency caps (same paywall max once per session)
 * - Analytics events
 * 
 * API Contract:
 * - Remote config for copy variants (fallback to hardcoded)
 * - Analytics: paywall_impression, paywall_cta_click, purchase_started
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Undo2, MapPin, Heart, Check, Sparkles } from 'lucide-react';

// A/B Copy Variants per spec
const PAYWALL_COPY = {
  paywall_undo: {
    A: {
      title: "Want to go back?",
      subtitle: "Don't miss a match because of one mistake.",
      cta_primary: "Unlock Unlimited Undo",
      cta_secondary: "Not now",
      bullets: ["Unlimited Undo", "Nearby without limits", "See who liked you"],
    },
    B: {
      title: "Made a mistake?",
      subtitle: "Undo gives you full control over your matches.",
      cta_primary: "Get Unlimited Undo",
      cta_secondary: "Not now",
      bullets: ["Unlimited Undo", "Nearby without limits", "See who liked you"],
    },
    C: {
      title: "Swipe smarter",
      subtitle: "Undo anytime. No limits. No regrets.",
      cta_primary: "Upgrade Now",
      cta_secondary: "Not now",
      bullets: ["Unlimited Undo", "Nearby without limits", "See who liked you"],
    },
  },
  paywall_nearby: {
    A: {
      title: "Nearby without limits",
      subtitle: "Scan anytime and see everyone around you.",
      cta_primary: "Upgrade to Premium",
      cta_secondary: "Not now",
      bullets: ["Unlimited scans", "No cooldowns", "100% nearby visibility"],
    },
    B: {
      title: "Find matches faster",
      subtitle: "No waiting. No cooldowns. Just people nearby.",
      cta_primary: "Unlock Nearby",
      cta_secondary: "Not now",
      bullets: ["Unlimited scans", "No cooldowns", "100% nearby visibility"],
    },
    C: {
      title: "You're surrounded",
      subtitle: "Unlock full access to everyone around you.",
      cta_primary: "Get Full Access",
      cta_secondary: "Not now",
      bullets: ["Unlimited scans", "No cooldowns", "100% nearby visibility"],
    },
  },
  paywall_likes_you: {
    A: {
      title: "Someone already likes you 💜",
      subtitle: "Unlock the full list and find out who.",
      cta_primary: "See Who Liked You",
      cta_secondary: "Not now",
      bullets: ["See who liked you", "Match faster", "No more guessing"],
    },
    B: {
      title: "See who's waiting for you",
      subtitle: "Take control of your matches.",
      cta_primary: "Unlock Premium",
      cta_secondary: "Not now",
      bullets: ["See who liked you", "Match faster", "No more guessing"],
    },
    C: {
      title: "Choose faster",
      subtitle: "Match smarter by seeing who liked you.",
      cta_primary: "Upgrade Now",
      cta_secondary: "Not now",
      bullets: ["See who liked you", "Match faster", "No more guessing"],
    },
  },
};

// Paywall icons
const PAYWALL_ICONS = {
  paywall_undo: Undo2,
  paywall_nearby: MapPin,
  paywall_likes_you: Heart,
};

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Deterministic variant assignment (hash-based)
const getVariantForUser = (userId, paywallId, variants = ['A', 'B']) => {
  // Simple hash function
  const hash = (userId + ':' + paywallId).split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const bucket = Math.abs(hash) % 100;
  
  // 50/50 split for 2 variants, 33/33/34 for 3
  if (variants.length === 2) {
    return bucket < 50 ? 'A' : 'B';
  } else {
    if (bucket < 33) return 'A';
    if (bucket < 66) return 'B';
    return 'C';
  }
};

// Session frequency cap storage
const SESSION_SHOWN_PAYWALLS = new Set();

const SubscriptionPaywall = ({
  paywallId,
  triggerType,
  isOpen,
  onClose,
  onUpgrade,
  userId = 'anonymous',
}) => {
  const navigate = useNavigate();
  const [variant, setVariant] = useState('A');
  const [copy, setCopy] = useState(null);
  
  // Get variant and copy on mount
  useEffect(() => {
    if (!isOpen) return;
    
    // Check frequency cap
    if (SESSION_SHOWN_PAYWALLS.has(paywallId)) {
      console.log(`[Paywall] ${paywallId} already shown this session, skipping`);
      onClose?.();
      return;
    }
    
    // Get variant
    const assignedVariant = getVariantForUser(userId, paywallId, ['A', 'B']);
    setVariant(assignedVariant);
    
    // Get copy
    const paywallCopy = PAYWALL_COPY[paywallId]?.[assignedVariant] || PAYWALL_COPY[paywallId]?.A;
    setCopy(paywallCopy);
    
    // Mark as shown
    SESSION_SHOWN_PAYWALLS.add(paywallId);
    
    // Track impression
    trackEvent('paywall_impression', {
      paywall_id: paywallId,
      variant_id: assignedVariant,
      trigger_type: triggerType,
    });
  }, [isOpen, paywallId, triggerType, userId, onClose]);

  const handlePrimaryClick = useCallback(() => {
    trackEvent('paywall_cta_click', {
      paywall_id: paywallId,
      variant_id: variant,
      cta: 'primary',
    });
    
    trackEvent('purchase_started', {
      source_paywall_id: paywallId,
      variant_id: variant,
    });
    
    onClose?.();
    
    // Navigate to subscriptions or call upgrade handler
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/subscriptions');
    }
  }, [paywallId, variant, onClose, onUpgrade, navigate]);

  const handleSecondaryClick = useCallback(() => {
    trackEvent('paywall_dismiss', {
      paywall_id: paywallId,
      variant_id: variant,
    });
    
    onClose?.();
  }, [paywallId, variant, onClose]);

  if (!isOpen || !copy) return null;

  const Icon = PAYWALL_ICONS[paywallId] || Sparkles;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleSecondaryClick}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998,
            }}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              maxHeight: '55vh',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              background: '#fff',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 3, pb: 4 }}>
              {/* Close button */}
              <IconButton
                onClick={handleSecondaryClick}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  color: '#94a3b8',
                }}
              >
                <X size={20} />
              </IconButton>
              
              {/* Icon */}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(168,85,247,0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Icon size={28} color="#6C5CE7" />
              </Box>
              
              {/* Title */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a2e',
                  textAlign: 'center',
                  mb: 1,
                }}
              >
                {copy.title}
              </Typography>
              
              {/* Subtitle */}
              <Typography
                sx={{
                  color: '#64748b',
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                {copy.subtitle}
              </Typography>
              
              {/* Benefits */}
              <Box sx={{ mb: 3 }}>
                {copy.bullets.map((bullet, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'rgba(108,92,231,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={12} color="#6C5CE7" />
                    </Box>
                    <Typography sx={{ color: '#1a1a2e', fontSize: '0.95rem' }}>
                      {bullet}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              {/* Primary CTA */}
              <Button
                fullWidth
                variant="contained"
                onClick={handlePrimaryClick}
                sx={{
                  py: 1.75,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(108,92,231,0.35)',
                  mb: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                  },
                }}
              >
                {copy.cta_primary}
              </Button>
              
              {/* Secondary CTA */}
              <Button
                fullWidth
                variant="text"
                onClick={handleSecondaryClick}
                sx={{
                  py: 1,
                  color: '#94a3b8',
                  fontWeight: 500,
                  textTransform: 'none',
                }}
              >
                {copy.cta_secondary}
              </Button>
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Hook for easy paywall usage
export const usePaywall = () => {
  const [paywallState, setPaywallState] = useState({
    isOpen: false,
    paywallId: null,
    triggerType: null,
  });

  const showPaywall = useCallback((paywallId, triggerType) => {
    // Check if user is subscribed
    const subscription = localStorage.getItem('pulse_subscription');
    if (subscription) {
      console.log('[Paywall] User is subscribed, skipping paywall');
      return false;
    }
    
    setPaywallState({
      isOpen: true,
      paywallId,
      triggerType,
    });
    
    return true;
  }, []);

  const hidePaywall = useCallback(() => {
    setPaywallState({
      isOpen: false,
      paywallId: null,
      triggerType: null,
    });
  }, []);

  return {
    paywallState,
    showPaywall,
    hidePaywall,
  };
};

// Reset session paywalls (for testing)
export const resetSessionPaywalls = () => {
  SESSION_SHOWN_PAYWALLS.clear();
};

export default SubscriptionPaywall;
