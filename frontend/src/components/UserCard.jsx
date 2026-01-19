/**
 * כרטיס משתמש v2 – בית / גילוי (Pulse)
 * 
 * לפי המפרט (גרסה מתוקנת - מקור אמת יחיד):
 * - החלטה מהירה ואינטואיטיבית (לייק/פאס) ללא עומס
 * - תחושה אנושית, הקשר ברור, הסחות דעת מינימליות
 * - מעבר טבעי לפרופיל מורחב
 * 
 * ❗ הערות קריטיות:
 * - ללא תגים/אייקונים/CTAs שלא מוגדרים במפרט
 * - ללא כפתורי לייק/פאס גלויים
 * - שורת ההקשר היא האלמנט המרכזי, לא הביוגרפיה
 * - צ'יפים = מינימליזם, לא עומס
 * - פרופיל מורחב נפתח רק בהקשה, לא בהחלקה
 * 
 * הבחירות של היום (ממפרט סעיף 4):
 * - תג סגול להתאמות בסבירות גבוהה
 * - תגים: "סיכוי גבוה להיפגש", "חלון זמן זהה", "קרוב הערב", "אותו אירוע"
 * 
 * שורות הקשר (ממפרט סעיף 3):
 * - "0.8 ק"מ · חצו נתיבים היום"
 * - "אותו אזור הערב"
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Box, Typography, Chip, IconButton, Dialog, DialogContent } from '@mui/material';
import { Sparkles, RotateCcw, ChevronLeft, ChevronRight, X, User, Ruler, MapPin, Home, Briefcase, GraduationCap, Dumbbell, Wine, Cigarette, Baby, Star, Vote, Globe, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Screen width for swipe calculations
const SCREEN_W = typeof window !== 'undefined' ? window.innerWidth : 400;

// Swipe threshold: 22-28% of screen width (using 25% as middle)
const SWIPE_THRESHOLD = SCREEN_W * 0.25;

/**
 * מודל כרטיס משתמש (חוזה נתונים לפי מפרט סעיף 7)
 * @typedef {Object} UserCardModel
 * @property {string} userId - מזהה משתמש
 * @property {string} firstName - שם פרטי
 * @property {number} age - גיל
 * @property {number|null} distanceMeters - מרחק במטרים (null אם אין הרשאת מיקום)
 * @property {string} primaryPhotoUrl - כתובת תמונה ראשית
 * @property {string} [liveStatus] - הקשר בזמן אמת (מקס 60 תווים, אימוג'י אופציונלי)
 * @property {string} [primaryRole] - מקצוע קצר (מקס 40 תווים, ללא שם חברה)
 * @property {Array<{label: string, icon?: string}>} [topInterests] - מקס 3 תחומי עניין לתצוגה מקדימה
 * @property {string} contextLine - הקשר אנושי (אירוע, קרוב, עבודה, אווירה)
 * @property {Array<{label: string, type?: string}>} chips - מקס 3 צ'יפים, ממוינים לפי עדיפות
 * @property {string} [height] - גובה בס"מ (ליצירת צ'יפים)
 * @property {string} [drinking] - העדפת שתייה (ליצירת צ'יפים)
 * @property {string} [professionalField] - תחום מקצועי/אווירה (ליצירת צ'יפים)
 * @property {boolean} [isVerified] - מאומת (לשימוש עתידי)
 * @property {Object} [safetyFlags] - דגלי בטיחות (שימוש פנימי)
 * @property {boolean} [isTodaysPick] - תג "הבחירה של היום" (התאמה בסבירות גבוהה)
 * @property {string} [todaysPickReason] - סיבה לתג "הבחירה של היום"
 * @property {string} [crossedPathsText] - שורת הקשר לחציית נתיבים
 */

// סיבות לתג "הבחירה של היום" (ממפרט סעיף 4)
const TODAYS_PICK_BADGES = {
  high_chance: "סיכוי גבוה להיפגש",
  same_time: "חלון זמן זהה",
  nearby_tonight: "קרוב הערב",
  same_event: "אותו אירוע",
};

/**
 * יצירת שורת הקשר על בסיס נתוני משתמש (ממפרט סעיף 3)
 * דוגמאות: "0.8 ק"מ · חצו נתיבים היום", "אותו אזור הערב"
 */
const generateContextLine = (user, hasLocationPermission) => {
  // עדיפות 1: חציית נתיבים
  if (user.crossedPathsText) {
    return user.crossedPathsText;
  }
  
  // עדיפות 2: אותו אירוע
  if (user.sharedEvent) {
    return `הולך ל-${user.sharedEvent}`;
  }
  
  // עדיפות 3: מרחק + הקשר זמן
  if (hasLocationPermission && user.distanceMeters) {
    const distanceText = user.distanceMeters < 1000 
      ? `${Math.round(user.distanceMeters)}m` 
      : `${(user.distanceMeters / 1000).toFixed(1)}km`;
    
    if (user.crossedPathsToday) {
      return `${distanceText} · חצו נתיבים היום`;
    }
    if (user.sameAreaEvening) {
      return `${distanceText} · אותו אזור הערב`;
    }
    return distanceText;
  }
  
  // עדיפות 4: עיסוק או שורת אווירה
  return user.contextLine || user.occupation || null;
};

/**
 * עיצוב מרחק לתצוגה
 * @param {number|null} meters - מרחק במטרים
 * @returns {string|null}
 */
const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return null;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * יצירת צ'יפים של מידע מהיר (מקס 3) לפי המפרט
 * עדיפות: גובה → שתייה → תחום מקצועי/אווירה
 * @param {UserCardModel} user - נתוני משתמש
 * @returns {Array<{label: string, type: string}>}
 */
const generateQuickInfoChips = (user) => {
  const chips = [];
  
  if (user.height && chips.length < 3) {
    chips.push({ label: `${user.height} cm`, type: 'height' });
  }
  
  if (user.drinking && user.drinking !== 'מעדיף לא לומר' && chips.length < 3) {
    chips.push({ label: user.drinking, type: 'drinking' });
  }
  
  if (user.professionalField && chips.length < 3) {
    chips.push({ label: user.professionalField, type: 'professional' });
  }
  
  return chips;
};

/**
 * קבלת אייקון תחום עניין על בסיס שם התחום
 * @param {string} interest - שם תחום העניין
 * @returns {string} אימוג'י אייקון
 */
const getInterestIcon = (interest) => {
  const iconMap = {
    'coffee': '☕',
    'קפה': '☕',
    'music': '🎶',
    'מוזיקה': '🎶',
    'yoga': '🧘‍♀️',
    'יוגה': '🧘‍♀️',
    'travel': '✈️',
    'טיולים': '✈️',
    'fitness': '💪',
    'כושר': '💪',
    'art': '🎨',
    'אמנות': '🎨',
    'food': '🍕',
    'אוכל': '🍕',
    'reading': '📚',
    'קריאה': '📚',
    'movies': '🎬',
    'סרטים': '🎬',
    'photography': '📷',
    'צילום': '📷',
    'hiking': '🥾',
    'טיולי רגל': '🥾',
    'cooking': '👨‍🍳',
    'בישול': '👨‍🍳',
    'dancing': '💃',
    'ריקודים': '💃',
    'gaming': '🎮',
    'גיימינג': '🎮',
    'wine': '🍷',
    'יין': '🍷',
  };
  
  const lowerInterest = interest.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerInterest.includes(key)) return icon;
  }
  return '✨';
};

/**
 * UserCard Component
 * @param {Object} props
 * @param {UserCardModel} props.user - User data
 * @param {function} props.onLike - Called on swipe right / like
 * @param {function} props.onPass - Called on swipe left / pass
 * @param {function} props.onTap - Called on tap to open expanded profile
 * @param {function} props.onUndo - Called when undo button is clicked
 * @param {boolean} [props.canUndo=false] - Whether undo is available
 * @param {boolean} [props.hasLocationPermission=true] - Whether to show distance
 */
export default function UserCard({ 
  user, 
  onLike, 
  onPass, 
  onTap,
  onUndo,
  canUndo = false,
  hasLocationPermission = true,
}) {
  const { t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false); // Vertical scroll gallery
  const tapStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTapRef = useRef(0); // For double tap detection

  // Get all photos
  const photos = useMemo(() => {
    if (user?.photos?.length) return user.photos;
    if (user?.primaryPhotoUrl) return [user.primaryPhotoUrl];
    return [];
  }, [user]);

  const currentPhoto = photos[photoIndex] || user?.primaryPhotoUrl;

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

  // Generate quick info chips if not provided
  const quickInfoChips = useMemo(() => {
    if (user?.chips?.length > 0) return user.chips.slice(0, 3);
    return generateQuickInfoChips(user || {});
  }, [user]);

  // Get top interests for preview (max 3)
  const topInterests = useMemo(() => {
    if (user?.topInterests?.length > 0) return user.topInterests.slice(0, 3);
    if (user?.interests?.length > 0) {
      return user.interests.slice(0, 3).map(interest => ({
        label: typeof interest === 'string' ? interest : interest.label,
        icon: getInterestIcon(typeof interest === 'string' ? interest : interest.label)
      }));
    }
    return [];
  }, [user]);

  // Debug: Log user data to check what's being passed
  if (process.env.NODE_ENV === 'development') {
    console.log('UserCard Data:', {
      liveStatus: user?.liveStatus,
      primaryRole: user?.primaryRole,
      topInterests: topInterests,
      quickInfoChips: quickInfoChips,
    });
  }

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
    const touch = e.changedTouches?.[0] || e;
    const deltaX = Math.abs(touch.clientX - tapStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - tapStartRef.current.y);
    const deltaTime = Date.now() - tapStartRef.current.time;
    
    // Consider it a tap if movement < 15px and time < 300ms
    if (deltaX < 15 && deltaY < 15 && deltaTime < 300) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      
      if (timeSinceLastTap < 300) {
        // Double tap - open full profile
        setShowFullProfile(true);
        lastTapRef.current = 0; // Reset to prevent triple tap
      } else {
        // Single tap - go to next photo (like Instagram)
        if (photos.length > 1) {
          setPhotoIndex((prev) => (prev + 1) % photos.length);
        }
        lastTapRef.current = now;
      }
    }
    
    // Reset swiping state
    setIsSwiping(false);
  }, [photos.length]);

  // Navigate photos
  const handlePrevPhoto = useCallback((e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const handleNextPhoto = useCallback((e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

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
        {/* Section A - PhotoBlock (68% height) - Scrollable vertically */}
        <Box
          onDoubleClick={(e) => {
            e.stopPropagation();
            setShowFullProfile(true);
          }}
          sx={{
            position: 'relative',
            height: '68%',
            flexShrink: 0,
            overflowY: 'scroll',
            overflowX: 'hidden',
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {/* Scrollable photos */}
          {photos.map((photo, index) => (
            <Box
              key={index}
              sx={{
                width: '100%',
                height: '100%',
                minHeight: '100%',
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={photo}
                alt={`${user.firstName} ${index + 1}`}
                onLoad={() => setImageLoaded(true)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </Box>
          ))}

          {/* Photo indicators */}
          {photos.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 16,
                right: 16,
                display: 'flex',
                gap: 0.5,
                zIndex: 10,
              }}
            >
              {photos.map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    bgcolor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </Box>
          )}

          {/* Scroll hint animation - blinking arrow at bottom with text */}
          {photos.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#fff',
                animation: 'blink 1.5s infinite',
                zIndex: 10,
                pointerEvents: 'none',
                '@keyframes blink': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                },
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 500, mb: 0.25, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                Scroll for more
              </Typography>
              <ChevronRight size={22} style={{ transform: 'rotate(90deg)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
            </Box>
          )}


          {/* Glowing NOPE label - Shows on left swipe */}
          <motion.div
            style={{
              opacity: passOpacity,
              position: 'absolute',
              left: 16,
              top: '40%',
              transform: 'translateY(-50%) rotate(-15deg)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '3px solid #ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 800,
                color: '#ef4444',
                letterSpacing: 2,
                textShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
              }}
            >
              NOPE
            </Typography>
          </motion.div>

          {/* Glowing LIKE label - Shows on right swipe */}
          <motion.div
            style={{
              opacity: likeOpacity,
              position: 'absolute',
              right: 16,
              top: '40%',
              transform: 'translateY(-50%) rotate(15deg)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '3px solid #22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3)',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 800,
                color: '#22c55e',
                letterSpacing: 2,
                textShadow: '0 0 10px rgba(34, 197, 94, 0.8)',
              }}
            >
              LIKE
            </Typography>
          </motion.div>

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

          {/* Undo Button - Elegant minimal style at top right */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onUndo?.();
            }}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 38,
              height: 38,
              backgroundColor: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.5)',
                transform: 'scale(1.08)',
              },
              transition: 'all 0.25s ease',
              zIndex: 15,
            }}
          >
            <RotateCcw size={18} color="#fff" strokeWidth={2.5} />
          </IconButton>

          {/* Pulsed You Badge - Shows when they liked you (including potential matches) */}
          {(user.likesYou || user.isMatch) && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.75,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                boxShadow: '0 2px 8px rgba(108,92,231,0.5)',
                animation: 'pulseGlow 2s infinite',
                '@keyframes pulseGlow': {
                  '0%, 100%': { boxShadow: '0 2px 8px rgba(108,92,231,0.5)' },
                  '50%': { boxShadow: '0 4px 16px rgba(108,92,231,0.8)' },
                },
              }}
            >
              <Heart size={14} color="white" fill="white" />
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '0.02em',
                }}
              >
                Pulsed you
              </Typography>
            </Box>
          )}

          {/* Today's Pick Badge - Per spec section 4 */}
          {user.isTodaysPick && !user.isMatch && !user.likesYou && !(user.likesYou || user.isMatch) && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.75,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                boxShadow: '0 2px 8px rgba(108,92,231,0.4)',
              }}
            >
              <Sparkles size={14} color="white" />
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  letterSpacing: '0.02em',
                }}
              >
                {TODAYS_PICK_BADGES[user.todaysPickReason] || "Today's Pick"}
              </Typography>
            </Box>
          )}

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
                {user.firstName}{user.lastName ? ` ${user.lastName}` : ''}, {user.age}
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

        </Box>

        {/* Section B - InfoBlock (32% height) - Enhanced per new spec */}
        <Box
          sx={{
            height: '32%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflow: 'hidden',
          }}
        >
          {/* B1 - Live Status (if exists) - Max 60 chars, optional emoji */}
          {user.liveStatus && (
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#6C5CE7',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.4,
              }}
            >
              {user.liveStatus}
            </Typography>
          )}

          {/* B2 - Primary Role (if exists) - Max 40 chars */}
          {user.primaryRole && (
            <Typography
              sx={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#1F2937',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}
            >
              {user.primaryRole}
            </Typography>
          )}

          {/* B3 - Quick Info Chips (max 3, auto-selected) */}
          {quickInfoChips.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflow: 'hidden',
                flexWrap: 'nowrap',
              }}
            >
              {quickInfoChips.map((chip, index) => (
                <Chip
                  key={index}
                  label={chip.label || chip}
                  size="small"
                  sx={{
                    height: '30px',
                    borderRadius: '999px',
                    px: '12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    backgroundColor: '#FFA726',
                    color: '#FFFFFF',
                    border: 'none',
                    flexShrink: 0,
                    '& .MuiChip-label': {
                      px: 0,
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* B4 - Top Interests Preview (max 3, space-dependent) */}
          {topInterests.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                overflow: 'hidden',
                flexWrap: 'nowrap',
                mt: 0.5,
              }}
            >
              {topInterests.map((interest, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    flexShrink: 0,
                  }}
                >
                  <Typography sx={{ fontSize: '16px', lineHeight: 1 }}>
                    {interest.icon}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#4B5563',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {interest.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* B5 - Action Hint (text only, no buttons) */}
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

      {/* Full Profile Dialog */}
      <Dialog
        open={showFullProfile}
        onClose={() => setShowFullProfile(false)}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: '#fff',
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {/* Back button - top left */}
          <IconButton
            onClick={() => setShowFullProfile(false)}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 100,
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            <ChevronLeft size={24} color="#1a1a2e" />
          </IconButton>

          {/* Photo gallery */}
          <Box sx={{ position: 'relative', width: '100%', height: '50vh' }}>
            <Box
              component="img"
              src={currentPhoto}
              alt={user.firstName}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            
            {/* Photo indicators */}
            {photos.length > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 16,
                  right: 16,
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                {photos.map((_, i) => (
                  <Box
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    sx={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Photo navigation */}
            {photos.length > 1 && (
              <>
                <IconButton
                  onClick={() => setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.85)',
                    '&:hover': { bgcolor: '#fff' },
                  }}
                >
                  <ChevronLeft size={24} />
                </IconButton>
                <IconButton
                  onClick={() => setPhotoIndex((prev) => (prev + 1) % photos.length)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.85)',
                    '&:hover': { bgcolor: '#fff' },
                  }}
                >
                  <ChevronRight size={24} />
                </IconButton>
              </>
            )}
          </Box>

          {/* Profile details - Classic left-aligned list layout */}
          <Box sx={{ p: 3, pb: 6 }}>
            {/* Name and age */}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {user.firstName}{user.lastName ? ` ${user.lastName}` : ''}, {user.age}
            </Typography>
            {distanceText && (
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                {distanceText} away
              </Typography>
            )}

            {/* Bio */}
            {user.bio && (
              <Typography sx={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, mb: 3 }}>
                {user.bio}
              </Typography>
            )}

            {/* Looking For */}
            {user.lookingFor && (
              <Box sx={{ mb: 2.5, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>Looking for</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                  {(Array.isArray(user.lookingFor) ? user.lookingFor : [user.lookingFor]).join(', ')}
                </Typography>
              </Box>
            )}

            {/* Interests */}
            {(user.interests?.length > 0 || user.chips?.length > 0) && (
              <Box sx={{ mb: 2.5, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1 }}>Interests</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {(user.interests || user.chips || []).map((item, i) => (
                    <Chip key={i} label={item.label || item} size="small" sx={{ bgcolor: '#f3f4f6', color: '#374151', fontSize: 12 }} />
                  ))}
                </Box>
              </Box>
            )}

            {/* Qualities I Value */}
            {user.qualities?.length > 0 && (
              <Box sx={{ mb: 2.5, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1 }}>Qualities I value</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {user.qualities.map((q, i) => (
                    <Chip key={i} label={q} size="small" sx={{ bgcolor: '#f3f4f6', color: '#374151', fontSize: 12 }} />
                  ))}
                </Box>
              </Box>
            )}

            {/* My Details */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>My Details</Typography>
              {user.gender && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                  <User size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Gender</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.gender}</Typography>
                </Box>
              )}
              {user.height && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                  <Ruler size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Height</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.height} cm</Typography>
                </Box>
              )}
              {user.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                  <MapPin size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Location</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.location}</Typography>
                </Box>
              )}
              {user.hometown && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                  <Home size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Hometown</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.hometown}</Typography>
                </Box>
              )}
              {user.occupation && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                  <Briefcase size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Work</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.occupation}</Typography>
                </Box>
              )}
              {user.education && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                  <GraduationCap size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Education</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.education}</Typography>
                </Box>
              )}
            </Box>

            {/* Lifestyle */}
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>Lifestyle</Typography>
              {user.exercise && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                  <Dumbbell size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Exercise</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.exercise}</Typography>
                </Box>
              )}
              {user.drinking && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                  <Wine size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Drinking</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.drinking}</Typography>
                </Box>
              )}
              {user.smoking && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                  <Cigarette size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Smoking</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.smoking}</Typography>
                </Box>
              )}
              {user.kids && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                  <Baby size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Kids</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.kids}</Typography>
                </Box>
              )}
              {user.starSign && (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                  <Star size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Star sign</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.starSign}</Typography>
                </Box>
              )}
            </Box>

            {/* More Info */}
            {(user.politics || user.languages?.length > 0) && (
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>More</Typography>
                {user.politics && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <Vote size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Politics</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.politics}</Typography>
                  </Box>
                )}
                {user.languages?.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <Globe size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Languages</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{user.languages.join(', ')}</Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Causes & Communities */}
            {user.causes?.length > 0 && (
              <Box sx={{ mb: 2.5, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1 }}>Causes & communities</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {user.causes.map((cause, i) => (
                    <Chip key={i} label={cause} size="small" sx={{ bgcolor: '#f3f4f6', color: '#374151', fontSize: 12 }} />
                  ))}
                </Box>
              </Box>
            )}

            {/* Spotify Playlists - Horizontal scroll */}
            {user.spotifyPlaylists?.length > 0 && (
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>My Music</Typography>
                <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, mx: -3, px: 3, '&::-webkit-scrollbar': { display: 'none' } }}>
                  {user.spotifyPlaylists.map((playlist, i) => (
                    <Box key={i} sx={{ flexShrink: 0, width: 100, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 2,
                          overflow: 'hidden',
                          mb: 1,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        <img
                          src={playlist.image || `https://picsum.photos/seed/${playlist.name}/200`}
                          alt={playlist.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3, mb: 0.25 }} noWrap>
                        {playlist.name}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: '#64748b' }} noWrap>
                        {playlist.artist}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Vertical Photo Gallery Dialog */}
      <Dialog
        open={showPhotoGallery}
        onClose={() => setShowPhotoGallery(false)}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: '#000',
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {/* Close button */}
          <IconButton
            onClick={() => setShowPhotoGallery(false)}
            sx={{
              position: 'fixed',
              top: 16,
              right: 16,
              zIndex: 100,
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            <X size={24} color="#1a1a2e" />
          </IconButton>

          {/* Photo counter */}
          <Box
            sx={{
              position: 'fixed',
              top: 20,
              left: 16,
              zIndex: 100,
              bgcolor: 'rgba(0,0,0,0.6)',
              px: 2,
              py: 0.5,
              borderRadius: 2,
            }}
          >
            <Typography sx={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
              {user.firstName}
            </Typography>
          </Box>

          {/* Vertical scrollable photo gallery */}
          <Box
            sx={{
              height: '100%',
              width: '100%',
              overflowY: 'scroll',
              overflowX: 'hidden',
              scrollSnapType: 'y mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {photos.map((photo, index) => (
              <Box
                key={index}
                sx={{
                  width: '100%',
                  height: '100vh',
                  minHeight: '100vh',
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  bgcolor: '#000',
                }}
              >
                <Box
                  component="img"
                  src={photo}
                  alt={`${user.firstName} ${index + 1}`}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
                {/* Photo number indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 60,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    px: 2.5,
                    py: 1,
                    borderRadius: 3,
                  }}
                >
                  <Typography sx={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                    {index + 1} / {photos.length}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Scroll hint */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'rgba(255,255,255,0.7)',
              animation: 'bounce 2s infinite',
            }}
          >
            <Typography sx={{ fontSize: 12, mb: 0.5 }}>Scroll to see more</Typography>
            <ChevronRight size={20} style={{ transform: 'rotate(90deg)' }} />
          </Box>

          <style>{`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
              40% { transform: translateX(-50%) translateY(-10px); }
              60% { transform: translateX(-50%) translateY(-5px); }
            }
          `}</style>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/**
 * UserCardStack - Manages stack of UserCards for swiping
 * Now includes Undo functionality per spec section 3
 */
export function UserCardStack({ 
  users, 
  onLike, 
  onPass, 
  onTap, 
  onEmpty,
  onMatch,
  hasLocationPermission = true,
}) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]); // For undo functionality

  const handleLike = useCallback((user) => {
    setHistory(prev => [...prev, { user, action: 'like', index: currentIndex }]);
    onLike?.(user);
    setCurrentIndex(prev => prev + 1);
    
    // Simulate match (for demo - 50% chance)
    if (Math.random() > 0.5) {
      onMatch?.(user);
    }
  }, [onLike, onMatch, currentIndex]);

  const handlePass = useCallback((user) => {
    setHistory(prev => [...prev, { user, action: 'pass', index: currentIndex }]);
    onPass?.(user);
    setCurrentIndex(prev => prev + 1);
  }, [onPass, currentIndex]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(lastAction.index);
  }, [history]);

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
        onUndo={handleUndo}
        canUndo={history.length > 0}
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
  distanceMeters: PropTypes.number,
  primaryPhotoUrl: PropTypes.string.isRequired,
  liveStatus: PropTypes.string,
  primaryRole: PropTypes.string,
  topInterests: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ),
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
  height: PropTypes.string,
  drinking: PropTypes.string,
  professionalField: PropTypes.string,
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
