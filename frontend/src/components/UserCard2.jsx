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
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { Box, Typography, Chip, IconButton, Dialog, DialogContent, Button } from '@mui/material';
import { Sparkles, RotateCcw, ChevronLeft, ChevronRight, X, User, Ruler, MapPin, Home, Briefcase, GraduationCap, Dumbbell, Wine, Cigarette, Baby, Star, Vote, Globe, Heart, MoreHorizontal, Music } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import UserProfileStory from './UserProfileStory';

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
 * עיצוב מרחק לתצוגה - Privacy-first: ranges only, never exact
 * @param {number|null} meters - מרחק במטרים
 * @returns {string|null}
 */
const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return null;
  const km = meters / 1000;
  if (km < 1) return '0-1 km away';
  if (km < 3) return '1-3 km away';
  if (km < 5) return '3-5 km away';
  if (km < 10) return '5-10 km away';
  return '10+ km away';
};

/**
 * Generate conversation opener chips based on interests
 * @param {Array} interests - User interests
 * @returns {Array<{label: string, message: string}>}
 */
const generateConversationChips = (interests) => {
  const chipTemplates = {
    'Coffee': { label: 'Best coffee spot?', message: "Hey! I noticed you're into coffee too ☕ What's your favorite spot in the city?" },
    'Travel': { label: 'Next destination?', message: "I saw you love traveling! ✈️ Where's your next adventure?" },
    'Music': { label: 'Favorite artist?', message: "Fellow music lover! 🎶 Who are you listening to these days?" },
    'Yoga': { label: 'Morning or evening?', message: "I see you're into yoga! 🧘‍♀️ Are you a morning or evening practitioner?" },
    'Hiking': { label: 'Best trail?', message: "A hiker! 🥾 What's the best trail you've done recently?" },
    'Photography': { label: 'Camera or phone?', message: "I noticed you're into photography! 📷 Do you shoot with a camera or phone?" },
    'Cooking': { label: 'Signature dish?', message: "A fellow foodie who cooks! 👨‍🍳 What's your signature dish?" },
    'Art': { label: 'Favorite museum?', message: "I love that you're into art! 🎨 Been to any good exhibitions lately?" },
    'Fitness': { label: 'Workout routine?', message: "Fitness enthusiast! 💪 What's your go-to workout?" },
    'Wine': { label: 'Red or white?', message: "A wine lover! 🍷 Are you more of a red or white person?" },
    'Design': { label: 'Favorite designer?', message: "I see you're into design! Who inspires you?" },
    'Tech': { label: 'Latest obsession?', message: "Fellow tech person! What's your latest tech obsession?" },
    'Books': { label: 'Current read?', message: "A reader! 📚 What are you reading right now?" },
    'Movies': { label: 'Recent favorite?', message: "Movie buff! 🎬 Seen anything good lately?" },
    'Bars': { label: 'Hidden gem?', message: "Know any hidden gem bars around here?" },
    'Beaches': { label: 'Favorite beach?', message: "Beach lover! 🏖️ What's your favorite spot?" },
  };
  
  const chips = [];
  for (const interest of interests || []) {
    const interestName = typeof interest === 'string' ? interest : interest.label;
    for (const [key, template] of Object.entries(chipTemplates)) {
      if (interestName?.toLowerCase().includes(key.toLowerCase()) && chips.length < 3) {
        chips.push(template);
        break;
      }
    }
    if (chips.length >= 3) break;
  }
  
  // Fallback chips if no matches
  if (chips.length === 0) {
    chips.push({ label: 'Say hi!', message: "Hey! I'd love to get to know you better 😊" });
  }
  
  return chips;
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
export default function UserCard2({ 
  user, 
  onLike, 
  onPass, 
  onTap,
  onUndo,
  canUndo = false,
  hasLocationPermission = true,
  // Expandable Card Flow props
  isExpanded = false,
  onExpand,
  onCollapse,
  disableSwipe = false,
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

  // Generate conversation opener chips based on interests
  const conversationChips = useMemo(() => {
    return generateConversationChips(user?.interests);
  }, [user?.interests]);

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
    
    console.log('[UserCard] handleDecision:', direction, 'user:', user?.name || user?.firstName);
    if (direction === 'right') {
      console.log('[UserCard] Calling onLike, exists:', !!onLike);
      onLike?.(user);
    } else {
      console.log('[UserCard] Calling onPass, exists:', !!onPass);
      onPass?.(user);
    }
  }, [controls, onLike, onPass, user]);

  // Handle drag end
  const handleDragEnd = useCallback((_, info) => {
    setIsSwiping(false);
    
    // Disable swipe when expanded or disableSwipe is true
    if (isExpanded || disableSwipe) {
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring', damping: 20, stiffness: 300 } });
      return;
    }
    
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
  }, [controls, handleDecision, isExpanded, disableSwipe]);

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
    // If expanded, don't handle tap for photo navigation
    if (isExpanded) return;
    
    const touch = e.changedTouches?.[0] || e;
    const deltaX = Math.abs(touch.clientX - tapStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - tapStartRef.current.y);
    const deltaTime = Date.now() - tapStartRef.current.time;
    
    console.log('[UserCard2] handleTapEnd:', { deltaX, deltaY, deltaTime, hasOnExpand: !!onExpand });
    
    // Consider it a tap if movement < 15px and time < 300ms
    if (deltaX < 15 && deltaY < 15 && deltaTime < 300) {
      // Single tap - expand the card (Expandable Card Flow)
      console.log('[UserCard2] Tap detected, calling onExpand');
      if (onExpand) {
        onExpand();
      }
    }
    
    // Reset swiping state
    setIsSwiping(false);
  }, [isExpanded, onExpand]);

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

  // Scroll container ref for Bumble-style card
  const scrollContainerRef = useRef(null);

  if (!user) return null;

  // === STORY TIMELINE PROFILE ===
  // Full-width story sections alternating between photos and content
  // No card container, no boxed sections - continuous story flow
  
  // Distribute photos across timeline (not stacked)
  const heroPhoto = photos[0] || user.primaryPhotoUrl;
  const midPhoto = photos[1] || null;
  const interestsPhoto = photos[2] || null;
  const finalPhoto = photos[3] || null;
  
  return (
    <motion.div
      animate={controls}
      style={{ x, rotate, scale, position: 'relative', width: '100%' }}
      drag={disableSwipe ? false : "x"}
      dragElastic={0.15}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => setIsSwiping(true)}
      onDragEnd={handleDragEnd}
    >
      {/* Swipe Labels - Fixed position */}
      <motion.div style={{ opacity: passOpacity, position: 'fixed', left: 40, top: '35%', transform: 'rotate(-15deg)', padding: '12px 24px', borderRadius: '12px', border: '4px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', pointerEvents: 'none', zIndex: 1000 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#ef4444', letterSpacing: 3 }}>NOPE</Typography>
      </motion.div>
      <motion.div style={{ opacity: likeOpacity, position: 'fixed', right: 40, top: '35%', transform: 'rotate(15deg)', padding: '12px 24px', borderRadius: '12px', border: '4px solid #22c55e', backgroundColor: 'rgba(34, 197, 94, 0.2)', pointerEvents: 'none', zIndex: 1000 }}>
        <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#22c55e', letterSpacing: 3 }}>LIKE</Typography>
      </motion.div>

      {/* Story Timeline Container - No card borders, full width */}
      <Box sx={{ width: '100%', bgcolor: '#fff' }}>
        
        {/* ===== SECTION 1: HERO PHOTO (75vh) ===== */}
        <Box sx={{ position: 'relative', width: '100%', height: '75vh', minHeight: 500 }}>
          <Box
            component="img"
            src={heroPhoto}
            alt={user.firstName}
            onLoad={() => setImageLoaded(true)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          
          {/* Subtle gradient overlay */}
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)', pointerEvents: 'none' }} />
          
          {/* Hero Content - Name, Age, Tagline, Verified */}
          <Box sx={{ position: 'absolute', bottom: 32, left: 24, right: 24 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Typography sx={{ fontSize: 36, fontWeight: 700, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                {user.firstName}, {user.age}
              </Typography>
              {user.isVerified && (
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(108,92,231,0.5)' }}>
                  <Star size={14} color="#fff" fill="#fff" />
                </Box>
              )}
            </Box>
            {(user.liveStatus || user.tagline || user.bio) && (
              <Typography sx={{ fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,0.95)', textShadow: '0 1px 4px rgba(0,0,0,0.6)', lineHeight: 1.5 }}>
                {user.liveStatus || user.tagline || (user.bio?.split('.')[0] + '.')}
              </Typography>
            )}
          </Box>

          {/* Likes You Badge */}
          {(user.likesYou || user.isMatch) && (
            <Box sx={{ position: 'absolute', top: 20, left: 20, px: 2, py: 1, borderRadius: '24px', background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', gap: 0.75, boxShadow: '0 4px 16px rgba(108,92,231,0.4)' }}>
              <Heart size={16} color="white" fill="white" />
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Likes you</Typography>
            </Box>
          )}
        </Box>

        {/* ===== SECTION 2: BIO BLOCK ===== */}
        {user.bio && (
          <Box sx={{ bgcolor: '#fff', px: 3, py: 4 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              My story
            </Typography>
            <Typography sx={{ fontSize: 18, color: '#1a1a2e', lineHeight: 1.8, fontWeight: 400 }}>
              {user.bio}
            </Typography>
          </Box>
        )}

        {/* ===== SECTION 3: PHOTO + PROMPT ===== */}
        {midPhoto && (
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box
              component="img"
              src={midPhoto}
              alt={`${user.firstName} 2`}
              sx={{ width: '100%', height: 'auto', minHeight: 300, objectFit: 'cover' }}
            />
            {/* Overlay prompt text */}
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', p: 3, pt: 8 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                After work you'll find me
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>
                {user.interests?.[0] ? `${user.interests[0]} & good conversations` : 'Exploring the city'}
              </Typography>
            </Box>
          </Box>
        )}

        {/* ===== SECTION 4: INTERESTS CLUSTER ===== */}
        {user.interests?.length > 0 && (
          <Box sx={{ bgcolor: '#fff', px: 3, py: 4 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#6B7280', mb: 2 }}>
              {user.firstName}'s into
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {user.interests.map((interest, i) => (
                <Chip 
                  key={i} 
                  label={typeof interest === 'string' ? interest : interest.label} 
                  sx={{ 
                    bgcolor: 'transparent', 
                    border: '1.5px solid #e5e7eb',
                    fontSize: 15,
                    fontWeight: 500,
                    py: 2.5,
                    px: 0.5,
                    borderRadius: '24px',
                    '&:hover': { borderColor: '#6C5CE7', bgcolor: 'rgba(108,92,231,0.05)' },
                  }} 
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Spotify section moved to bottom */}

        {/* ===== SECTION 6: LIFESTYLE SNAPSHOT ===== */}
        <Box sx={{ bgcolor: '#fff', px: 3, py: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {user.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MapPin size={20} color="#6B7280" />
                <Typography sx={{ fontSize: 16, color: '#4B5563' }}>Based in {user.location}</Typography>
              </Box>
            )}
            {user.languages && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Globe size={20} color="#6B7280" />
                <Typography sx={{ fontSize: 16, color: '#4B5563' }}>Speaks {user.languages}</Typography>
              </Box>
            )}
            {user.lookingFor && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Heart size={20} color="#6B7280" />
                <Typography sx={{ fontSize: 16, color: '#4B5563' }}>Looking for {user.lookingFor}</Typography>
              </Box>
            )}
            {user.height && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Ruler size={20} color="#6B7280" />
                <Typography sx={{ fontSize: 16, color: '#4B5563' }}>{user.height}</Typography>
              </Box>
            )}
            {user.jobTitle && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Briefcase size={20} color="#6B7280" />
                <Typography sx={{ fontSize: 16, color: '#4B5563' }}>{user.jobTitle}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ===== SECTION 7: FINAL PHOTO (if exists) ===== */}
        {interestsPhoto && (
          <Box sx={{ width: '100%' }}>
            <Box
              component="img"
              src={interestsPhoto}
              alt={`${user.firstName} 3`}
              sx={{ width: '100%', height: 'auto', minHeight: 250, objectFit: 'cover' }}
            />
          </Box>
        )}

        {/* ===== SPOTIFY SECTION - Subtle/Elegant style ===== */}
        {(user.favoriteMusic?.length > 0 || user.spotifyPlaylists?.length > 0) && (
          <Box sx={{ bgcolor: '#fff', px: 3, py: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Music size={16} color="#1DB954" /> Favorite Music
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              {(user.favoriteMusic || user.spotifyPlaylists || []).map((item, i) => (
                <Box key={i} sx={{ minWidth: 100, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      bgcolor: '#f3f4f6',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      mb: 1,
                      mx: 'auto',
                    }}
                  >
                    {item.image ? (
                      <Box component="img" src={item.image} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Music size={28} color="#1DB954" />
                      </Box>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#374151', lineHeight: 1.2 }} noWrap>
                    {item.name || item}
                  </Typography>
                  {item.artist && (
                    <Typography sx={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.2 }} noWrap>
                      {item.artist}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ===== FINAL DECISION AREA ===== */}
        <Box sx={{ bgcolor: '#fff', px: 3, py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Typography sx={{ fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>
            What do you think?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
            <IconButton
              onClick={() => handleDecision('left')}
              sx={{
                width: 72,
                height: 72,
                bgcolor: '#fff',
                border: '2px solid #fecaca',
                boxShadow: '0 4px 20px rgba(239,68,68,0.25)',
                '&:hover': { bgcolor: '#fef2f2', transform: 'scale(1.08)' },
                transition: 'all 0.2s',
              }}
            >
              <X size={32} color="#ef4444" />
            </IconButton>
            <IconButton
              onClick={() => handleDecision('right')}
              sx={{
                width: 72,
                height: 72,
                bgcolor: '#fff',
                border: '2px solid #bbf7d0',
                boxShadow: '0 4px 20px rgba(34,197,94,0.25)',
                '&:hover': { bgcolor: '#f0fdf4', transform: 'scale(1.08)' },
                transition: 'all 0.2s',
              }}
            >
              <Heart size={32} color="#22c55e" />
            </IconButton>
          </Box>
        </Box>

      </Box>
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
      <UserCard2
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

UserCard2.propTypes = {
  user: UserCardModelShape.isRequired,
  onLike: PropTypes.func,
  onPass: PropTypes.func,
  onTap: PropTypes.func,
  hasLocationPermission: PropTypes.bool,
};

UserCard2.defaultProps = {
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
