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
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false); // Vertical scroll gallery
  const [scrollPosition, setScrollPosition] = useState('top'); // 'top', 'middle', 'bottom'
  const photoContainerRef = useRef(null);
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
        // Double tap - navigate to user details page
        const userId = user?.id ?? user?.userId ?? user?.user_id;
        console.log('[DoubleTap] opening user:', userId, user?.firstName || user?.name);
        if (userId) {
          navigate(`/user/${userId}`, { state: { user } });
        } else {
          console.error('Cannot navigate to user details: missing user ID', user);
        }
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
  }, [photos.length, user, navigate]);

  // Navigate photos
  const handlePrevPhoto = useCallback((e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const handleNextPhoto = useCallback((e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  // Handle scroll position for adaptive arrows
  const handlePhotoScroll = useCallback((e) => {
    const container = e.target;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    if (scrollTop <= 10) {
      setScrollPosition('top');
    } else if (scrollTop + clientHeight >= scrollHeight - 10) {
      setScrollPosition('bottom');
    } else {
      setScrollPosition('middle');
    }
  }, []);

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
          height: 'min(680px, 85vh)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.04)',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          mx: 'auto', // Desktop: centered
          userSelect: 'none',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Glowing NOPE label - Shows on left swipe - OUTSIDE scroll area */}
        <motion.div
          style={{
            opacity: passOpacity,
            position: 'absolute',
            left: 16,
            top: '25%',
            transform: 'translateY(-50%) rotate(-15deg)',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '3px solid #ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)',
            pointerEvents: 'none',
            zIndex: 100,
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

        {/* Glowing LIKE label - Shows on right swipe - OUTSIDE scroll area */}
        <motion.div
          style={{
            opacity: likeOpacity,
            position: 'absolute',
            right: 16,
            top: '25%',
            transform: 'translateY(-50%) rotate(15deg)',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '3px solid #22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3)',
            pointerEvents: 'none',
            zIndex: 100,
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

        {/* Down arrow - shows when NOT at bottom (can still scroll down) */}
        {photos.length > 1 && scrollPosition !== 'bottom' && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '42%',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#fff',
              animation: 'blink 1.5s infinite',
              zIndex: 50,
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
            <ChevronRight size={26} style={{ transform: 'rotate(90deg)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          </Box>
        )}

        {/* Up arrow - shows ONLY when at bottom (can only go back up) */}
        {photos.length > 1 && scrollPosition === 'bottom' && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#fff',
              animation: 'blink 1.5s infinite',
              zIndex: 50,
              pointerEvents: 'none',
              '@keyframes blink': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.3 },
              },
            }}
          >
            <ChevronRight size={26} style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          </Box>
        )}

        {/* Section A - PhotoBlock (62% height) - Scrollable vertically */}
        <Box
          ref={photoContainerRef}
          onScroll={handlePhotoScroll}
          onDoubleClick={(e) => {
            e.stopPropagation();
            const userId = user?.id ?? user?.userId ?? user?.user_id;
            console.log('[DoubleTap onDoubleClick] opening user:', userId, user?.firstName || user?.name);
            if (userId) {
              navigate(`/user/${userId}`, { state: { user } });
            } else {
              console.error('Cannot navigate to user details: missing user ID', user);
            }
          }}
          sx={{
            position: 'relative',
            height: '62%',
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

          {/* Likes You Badge - Shows when they liked you (including potential matches) */}
          {(user.likesYou || user.isMatch) && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              {/* Main badge */}
              <Box
                sx={{
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
                  Likes you
                </Typography>
              </Box>
              {/* Shared interest hint */}
              {user.interests?.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  <Sparkles size={12} color="#6C5CE7" />
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#6C5CE7',
                    }}
                  >
                    You both like {user.interests[0]}
                  </Typography>
                </Box>
              )}
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

        {/* Section B - InfoBlock (38% height) - Enhanced per new spec */}
        <Box
          sx={{
            height: '38%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto',
            overflowX: 'hidden',
            bgcolor: '#fff',
            position: 'relative',
            zIndex: 5,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { 
              backgroundColor: 'rgba(0,0,0,0.1)', 
              borderRadius: 2 
            },
          }}
        >
          {/* B1 - Live Status (if exists) - Max 60 chars, optional emoji */}
          {user.liveStatus && (
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#6C5CE7',
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
                gap: 0.75,
                flexWrap: 'wrap',
              }}
            >
              {quickInfoChips.map((chip, index) => (
                <Chip
                  key={index}
                  label={chip.label || chip}
                  size="small"
                  sx={{
                    height: '26px',
                    borderRadius: '13px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
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
                gap: 1,
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
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '20px',
                    bgcolor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <Typography sx={{ fontSize: '14px', lineHeight: 1 }}>
                    {interest.icon}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#374151',
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
          <Box sx={{ mt: 'auto', pt: 0.5 }}>
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 400,
                color: '#9CA3AF',
                textAlign: 'center',
              }}
            >
              Swipe left – Pass | Swipe right – Like
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
