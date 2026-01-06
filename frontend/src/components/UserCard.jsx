/**
 * UserCard v2 – Home / Discover (Pulse)
 * 
 * Per Spec (Corrected Version - Single Source of Truth):
 * - Quick, intuitive decision (Like/Pass) without overload
 * - Human feel, clear context, minimal distractions
 * - Natural transition to expanded profile
 * 
 * ❗ Critical Notes:
 * - No badges/icons/CTAs not defined in spec
 * - No visible Like/Pass buttons
 * - Context Line is the main element, not biography
 * - Chips = minimalism, not overload
 * - Expanded Profile opens only on Tap, not Swipe
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Box, Typography, Chip } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

// Screen width for swipe calculations
const SCREEN_W = typeof window !== 'undefined' ? window.innerWidth : 400;

// Swipe threshold: 22-28% of screen width (using 25% as middle)
const SWIPE_THRESHOLD = SCREEN_W * 0.25;

/**
 * UserCardModel (Data Contract per spec section 7)
 * @typedef {Object} UserCardModel
 * @property {string} userId
 * @property {string} firstName
 * @property {number} age
 * @property {number|null} distanceMeters - nullable if no location permission
 * @property {string} primaryPhotoUrl
 * @property {string} contextLine - Human context (event, nearby, job, vibe)
 * @property {Array<{label: string, type?: string}>} chips - Max 3, priority ordered
 * @property {boolean} [isVerified] - Future use
 * @property {Object} [safetyFlags] - Internal use
 */

/**
 * Format distance for display
 * @param {number|null} meters 
 * @returns {string|null}
 */
const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return null;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * UserCard Component
 * @param {Object} props
 * @param {UserCardModel} props.user - User data
 * @param {function} props.onLike - Called on swipe right / like
 * @param {function} props.onPass - Called on swipe left / pass
 * @param {function} props.onTap - Called on tap to open expanded profile
 * @param {boolean} [props.hasLocationPermission=true] - Whether to show distance
 */
export default function UserCard({ 
  user, 
  onLike, 
  onPass, 
  onTap,
  hasLocationPermission = true,
}) {
  const { t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const tapStartRef = useRef({ x: 0, y: 0, time: 0 });

  const x = useMotionValue(0);
  const controls = useAnimation();

  // Transform values for micro animations
  const rotate = useTransform(x, [-SCREEN_W, 0, SCREEN_W], [-8, 0, 8]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  
  // Scale animation for Like (per spec: 1 → 1.02 → 1)
  const scale = useTransform(x, 
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], 
    [1, 1, 1.02]
  );

  // Format distance display
  const distanceText = useMemo(() => {
    if (!hasLocationPermission) return null;
    return formatDistance(user?.distanceMeters);
  }, [user?.distanceMeters, hasLocationPermission]);

  // Determine if we're on mobile
  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }, []);

  // Handle swipe decision
  const handleDecision = useCallback(async (direction) => {
    const targetX = direction === 'right' ? SCREEN_W * 1.5 : -SCREEN_W * 1.5;
    const targetRotate = direction === 'right' ? 15 : -15;
    
    // Pass animation: slight rotation + left movement + fade out
    // Like animation: scale pulse (handled by transform)
    await controls.start({
      x: targetX,
      rotate: targetRotate,
      opacity: 0,
      transition: { 
        type: 'spring', 
        damping: 20,
        stiffness: 200,
      }
    });

    // Reset for next card
    controls.set({ x: 0, rotate: 0, opacity: 1 });
    
    if (direction === 'right') {
      onLike?.(user);
    } else {
      onPass?.(user);
    }
  }, [controls, onLike, onPass, user]);

  // Handle drag end
  const handleDragEnd = useCallback((_, info) => {
    setIsSwiping(false);
    const { offset } = info;
    
    // Check if threshold reached
    if (offset.x > SWIPE_THRESHOLD) {
      handleDecision('right');
    } else if (offset.x < -SWIPE_THRESHOLD) {
      handleDecision('left');
    } else {
      // Snap back
      controls.start({ 
        x: 0, 
        rotate: 0, 
        transition: { type: 'spring', damping: 20, stiffness: 300 } 
      });
    }
  }, [controls, handleDecision]);

  // Handle tap (not during swipe)
  const handleTapStart = useCallback((e) => {
    const touch = e.touches?.[0] || e;
    tapStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTapEnd = useCallback((e) => {
    if (isSwiping) return;
    
    const touch = e.changedTouches?.[0] || e;
    const deltaX = Math.abs(touch.clientX - tapStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - tapStartRef.current.y);
    const deltaTime = Date.now() - tapStartRef.current.time;
    
    // Consider it a tap if movement < 10px and time < 200ms
    if (deltaX < 10 && deltaY < 10 && deltaTime < 200) {
      onTap?.(user);
    }
  }, [isSwiping, onTap, user]);

  if (!user) return null;

  return (
    <motion.div
      animate={controls}
      style={{ 
        x, 
        rotate, 
        scale,
        position: 'relative',
        touchAction: 'pan-y',
      }}
      drag="x"
      dragElastic={0.15}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => setIsSwiping(true)}
      onDragEnd={handleDragEnd}
      onPointerDown={handleTapStart}
      onPointerUp={handleTapEnd}
    >
      {/* Container - Per spec section 2 */}
      <Box
        sx={{
          width: 'min(420px, 92vw)',
          height: 'min(640px, 78vh)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.04)',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          mx: 'auto', // Desktop: centered
          userSelect: 'none',
          cursor: 'pointer',
        }}
      >
        {/* Section A - PhotoBlock (72% height) */}
        <Box
          sx={{
            position: 'relative',
            height: '72%',
            flexShrink: 0,
          }}
        >
          {/* Image loading skeleton */}
          {!imageLoaded && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear',
              }}
            />
          )}

          {/* Main photo */}
          <Box
            component="img"
            src={user.primaryPhotoUrl}
            alt={user.firstName}
            onLoad={() => setImageLoaded(true)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: imageLoaded ? 'block' : 'none',
            }}
          />

          {/* Gradient Overlay - Per spec: readability only, not decorative */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '28%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* A1 - Hero Line (Overlay on photo) */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Left side: Name + Age + Distance */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
              <Typography
                sx={{
                  fontSize: '21px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                {user.firstName}, {user.age}
              </Typography>
              
              {/* Distance - Only show if location permission exists */}
              {distanceText && (
                <>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.85)',
                    }}
                  >
                    ·
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.85)',
                    }}
                  >
                    {distanceText}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Like/Pass visual feedback - subtle, no harsh colors */}
          <motion.div
            style={{
              opacity: likeOpacity,
              position: 'absolute',
              top: 20,
              right: 20,
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(34, 197, 94, 0.9)',
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
              {t('like').toUpperCase()}
            </Typography>
          </motion.div>

          <motion.div
            style={{
              opacity: passOpacity,
              position: 'absolute',
              top: 20,
              left: 20,
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
              {t('pass').toUpperCase()}
            </Typography>
          </motion.div>
        </Box>

        {/* Section B - InfoBlock (28% height) */}
        <Box
          sx={{
            height: '28%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* B1 - Human Context Line */}
          <Typography
            sx={{
              fontSize: '15px',
              fontWeight: 500,
              color: '#1F2937',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.4,
            }}
          >
            {user.contextLine || t('lookingForConnections')}
          </Typography>

          {/* B2 - Smart Chips Row */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflow: 'hidden',
              flexWrap: 'nowrap',
            }}
          >
            {(user.chips || []).slice(0, 3).map((chip, index) => (
              <Chip
                key={index}
                label={chip.label || chip}
                size="small"
                sx={{
                  height: '28px',
                  borderRadius: '999px',
                  px: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: '#F3F4F6',
                  color: '#4B5563',
                  border: '1px solid #E5E7EB',
                  flexShrink: 0,
                  '& .MuiChip-label': {
                    px: 0,
                  },
                }}
              />
            ))}
          </Box>

          {/* B3 - Action Hint (text only, no buttons) */}
          <Box sx={{ mt: 'auto' }}>
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 400,
                color: '#9CA3AF',
                textAlign: 'center',
              }}
            >
              {isMobile 
                ? `${t('swipeLeftPass')} | ${t('swipeRightLike')}`
                : t('passLikeHint')
              }
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Keyframes for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </motion.div>
  );
}

/**
 * UserCardStack - Manages stack of UserCards for swiping
 */
export function UserCardStack({ 
  users, 
  onLike, 
  onPass, 
  onTap, 
  onEmpty,
  hasLocationPermission = true,
}) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLike = useCallback((user) => {
    onLike?.(user);
    setCurrentIndex(prev => prev + 1);
  }, [onLike]);

  const handlePass = useCallback((user) => {
    onPass?.(user);
    setCurrentIndex(prev => prev + 1);
  }, [onPass]);

  // Check if we've gone through all cards
  if (currentIndex >= users.length) {
    onEmpty?.();
    return (
      <Box
        sx={{
          width: 'min(420px, 92vw)',
          height: 'min(640px, 78vh)',
          borderRadius: '16px',
          backgroundColor: '#F9FAFB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          gap: 2,
        }}
      >
        <Typography sx={{ color: '#6B7280', fontSize: 16 }}>
          {t('noMoreProfiles')}
        </Typography>
        <Typography sx={{ color: '#9CA3AF', fontSize: 14 }}>
          {t('checkBackLater')}
        </Typography>
      </Box>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Show next card underneath for visual stacking effect */}
      {currentIndex + 1 < users.length && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%) scale(0.95)',
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Box
            sx={{
              width: 'min(420px, 92vw)',
              height: 'min(640px, 78vh)',
              borderRadius: '16px',
              backgroundColor: '#E5E7EB',
            }}
          />
        </Box>
      )}

      {/* Current card */}
      <UserCard
        user={currentUser}
        onLike={handleLike}
        onPass={handlePass}
        onTap={onTap}
        hasLocationPermission={hasLocationPermission}
      />
    </Box>
  );
}

// PropTypes validation for UserCardModel data contract (per spec section 7)
const UserCardModelShape = PropTypes.shape({
  userId: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
  distanceMeters: PropTypes.number, // nullable if no location permission
  primaryPhotoUrl: PropTypes.string.isRequired,
  contextLine: PropTypes.string,
  chips: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        type: PropTypes.string,
      }),
    ])
  ),
  isVerified: PropTypes.bool,
  safetyFlags: PropTypes.object,
});

UserCard.propTypes = {
  user: UserCardModelShape.isRequired,
  onLike: PropTypes.func,
  onPass: PropTypes.func,
  onTap: PropTypes.func,
  hasLocationPermission: PropTypes.bool,
};

UserCard.defaultProps = {
  hasLocationPermission: true,
};

UserCardStack.propTypes = {
  users: PropTypes.arrayOf(UserCardModelShape).isRequired,
  onLike: PropTypes.func,
  onPass: PropTypes.func,
  onTap: PropTypes.func,
  onEmpty: PropTypes.func,
  hasLocationPermission: PropTypes.bool,
};

UserCardStack.defaultProps = {
  hasLocationPermission: true,
};
