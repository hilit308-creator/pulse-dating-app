/**
 * HomeScreen - Pulse Home (MVP)
 * 
 * Home is the center of moments in Pulse.
 * Not a feed, not a dashboard, not a to-do list.
 * 
 * Product Principles (LOCKED):
 * - No Infinite Scroll
 * - No addictive Feed
 * - No decision overload
 * - No pressure to act
 * - Everything is contextual, momentary, and gentle
 * 
 * Home doesn't ask "what will you do now?"
 * It says: "These are your options right now."
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Avatar,
  Card,
  CardMedia,
  IconButton,
} from '@mui/material';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  MapPin, 
  ArrowRight, 
  WifiOff, 
  Calendar,
  Users,
  Compass,
  MessageCircle,
  Eye,
  Pause,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import UserAvatarButton from '../components/UserAvatarButton';
import { UserCardStack } from '../components/UserCard';
import PageHelpButton from '../components/PageHelpButton';
import { getPageHelpContent } from '../config/pageHelpContent';

// Safe bottom padding for tab bar
const SAFE_BOTTOM = 'calc(88px + env(safe-area-inset-bottom, 0px))';
const SWIPE_THRESHOLD = 100; // px to trigger swipe action

// Get time-based greeting
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

// Mock data - would come from API
// Updated with new spec fields: isTodaysPick, crossedPathsToday, etc.
const MOCK_NEARBY_PROFILES = [
  {
    id: 1,
    userId: 'user_1',
    firstName: 'Maya',
    name: 'Maya',
    age: 28,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    ],
    vibeLine: 'Looking for real conversations',
    contextLine: '0.8km · crossed paths today',
    distanceMeters: 800,
    crossedPathsToday: true,
    isTodaysPick: true,
    todaysPickReason: 'high_chance',
    chips: ['Travel', 'Music', 'Coffee'],
    heightCm: 168,
    smokes: false,
    zodiacSign: 'libra',
    interests: ['Travel', 'Music', 'Photography'],
  },
  {
    id: 2,
    userId: 'user_2',
    firstName: 'Daniel',
    name: 'Daniel',
    age: 31,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    ],
    vibeLine: 'Coffee lover & night owl',
    contextLine: 'Same area this evening',
    distanceMeters: 1200,
    sameAreaEvening: true,
    isTodaysPick: true,
    todaysPickReason: 'nearby_tonight',
    chips: ['Coffee', 'Art', 'Night owl'],
    heightCm: 182,
    smokes: false,
    zodiacSign: 'scorpio',
    interests: ['Coffee', 'Art', 'Reading'],
  },
  {
    id: 3,
    userId: 'user_3',
    firstName: 'Noa',
    name: 'Noa',
    age: 26,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    ],
    vibeLine: 'Yoga & good vibes',
    contextLine: 'Going to Sunset Yoga',
    distanceMeters: 2500,
    sharedEvent: 'Sunset Yoga in the Park',
    isTodaysPick: true,
    todaysPickReason: 'same_event',
    chips: ['Yoga', 'Wellness', 'Nature'],
    heightCm: 165,
    smokes: false,
    zodiacSign: 'pisces',
    interests: ['Yoga', 'Meditation', 'Hiking'],
  },
];

const MOCK_EVENTS = [
  {
    id: 1,
    name: 'Sunset Yoga in the Park',
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    date: 'Tonight',
    time: '18:00',
    location: 'Yarkon Park',
    vibeIcon: '🧘',
  },
  {
    id: 2,
    name: 'Rooftop Jazz Night',
    coverImage: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=800&q=80',
    date: 'Tomorrow',
    time: '20:00',
    location: 'Tel Aviv',
    vibeIcon: '🎷',
  },
];

const MOCK_PLACES = [
  {
    id: 1,
    name: 'The Breakfast Club',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80',
    category: 'Cafe',
    openStatus: 'Open now',
  },
  {
    id: 2,
    name: 'Vinyl Bar',
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=400&q=80',
    category: 'Bar',
    openStatus: 'Closing soon',
  },
];

const MOCK_ACTIVE_CHAT = {
  id: 1,
  name: 'Alex',
  photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  lastMessage: 'Sounds great! See you there 😊',
  unread: true,
};

// Mock data for Today's Picks
const MOCK_TODAYS_PICKS = [
  {
    userId: 'u1',
    firstName: 'Maya',
    age: 27,
    matchPercentage: 82,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    primaryRole: 'Product Designer',
    height: '170 cm',
    interests: ['Coffee lover', 'Art enthusiast'],
  },
  {
    userId: 'u2',
    firstName: 'Noa',
    age: 29,
    matchPercentage: 78,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    primaryRole: 'Marketing Director',
    height: '165 cm',
    interests: ['Yoga', 'Travel'],
  },
  {
    userId: 'u3',
    firstName: 'Lior',
    age: 26,
    matchPercentage: 72,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    primaryRole: 'Software Engineer',
    height: '168 cm',
    interests: ['Music', 'Photography'],
  },
  {
    userId: 'u4',
    firstName: 'Dana',
    age: 30,
    matchPercentage: 88,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    primaryRole: 'Architect',
    height: '182 cm',
    interests: ['Design', 'Coffee'],
  },
  {
    userId: 'u5',
    firstName: 'Shira',
    age: 25,
    matchPercentage: 85,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    primaryRole: 'Fashion Blogger',
    height: '168 cm',
    interests: ['Fashion lover', 'Travel'],
  },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Data states
  const [nearbyProfiles, setNearbyProfiles] = useState([]);
  const [events, setEvents] = useState([]);
  const [places, setPlaces] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [todaysPicks, setTodaysPicks] = useState([]);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [swipedPicks, setSwipedPicks] = useState({ liked: [], passed: [] });
  const [matchPerson, setMatchPerson] = useState(null);
  
  // Profile completion check
  const isProfileComplete = useMemo(() => {
    if (!user) return true; // Don't show if not logged in
    return user.workplace && user.education && user.bio;
  }, [user]);
  
  const isProfileAlmostComplete = useMemo(() => {
    if (!user) return false;
    const fields = [user.workplace, user.education, user.bio, user.photos?.length > 3];
    const completed = fields.filter(Boolean).length;
    return completed >= 2 && completed < fields.length;
  }, [user]);
  
  // Visibility status
  const visibilityStatus = useMemo(() => {
    if (!user?.isVisible) return { visible: false, text: "You're currently paused" };
    const hour = new Date().getHours();
    if (hour >= 18 && hour < 23) return { visible: true, text: "You're visible this evening" };
    return { visible: true, text: "You're visible right now" };
  }, [user]);
  
  // Time-based greeting
  const greeting = useMemo(() => getTimeBasedGreeting(), []);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data on mount (no live refresh per spec)
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Load all preview data
      // In real app: fetch from API without triggering scans
      setNearbyProfiles(MOCK_NEARBY_PROFILES.slice(0, 2));
      setEvents(MOCK_EVENTS.slice(0, 2));
      setPlaces(MOCK_PLACES.slice(0, 2));
      setActiveChat(MOCK_ACTIVE_CHAT);
      setTodaysPicks(MOCK_TODAYS_PICKS);
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Navigation handlers
  const handleGoToNearby = useCallback(() => navigate('/nearby'), [navigate]);
  const handleGoToEvents = useCallback(() => navigate('/events'), [navigate]);
  const handleGoToExplore = useCallback(() => navigate('/explore'), [navigate]);
  const handleGoToChats = useCallback(() => navigate('/matches'), [navigate]);
  const handleGoToProfile = useCallback(() => navigate('/profile'), [navigate]);
  
  // Today's Picks navigation handlers
  const handlePrevPick = useCallback(() => {
    setCurrentPickIndex((prev) => (prev > 0 ? prev - 1 : todaysPicks.length - 1));
  }, [todaysPicks.length]);
  
  const handleNextPick = useCallback(() => {
    setCurrentPickIndex((prev) => (prev < todaysPicks.length - 1 ? prev + 1 : 0));
  }, [todaysPicks.length]);
  
  const handlePickClick = useCallback((userId) => {
    navigate(`/profile/${userId}`);
  }, [navigate]);
  
  // Handle swipe action
  const handleSwipe = useCallback((direction, person) => {
    if (navigator?.vibrate) navigator.vibrate(10);
    
    if (direction === 'right') {
      setSwipedPicks(prev => ({
        ...prev,
        liked: [...prev.liked, person]
      }));
      
      // Check for mutual like (match!)
      if (person.likesYou) {
        if (navigator?.vibrate) navigator.vibrate([50, 50, 100]);
        setMatchPerson(person);
        return;
      }
    } else {
      setSwipedPicks(prev => ({
        ...prev,
        passed: [...prev.passed, person]
      }));
    }

    // Move to next card
    setTimeout(() => {
      setCurrentPickIndex(prev => {
        const nextIndex = prev + 1;
        return nextIndex >= todaysPicks.length ? 0 : nextIndex;
      });
    }, 200);
  }, [todaysPicks.length]);

  // Handle button actions
  const handlePass = useCallback(() => {
    if (currentPickIndex < todaysPicks.length) {
      handleSwipe('left', todaysPicks[currentPickIndex]);
    }
  }, [currentPickIndex, todaysPicks, handleSwipe]);

  const handleLike = useCallback(() => {
    if (currentPickIndex < todaysPicks.length) {
      handleSwipe('right', todaysPicks[currentPickIndex]);
    }
  }, [currentPickIndex, todaysPicks, handleSwipe]);

  const handleUndo = useCallback(() => {
    if (currentPickIndex > 0) {
      setCurrentPickIndex(prev => prev - 1);
      setSwipedPicks(prev => {
        const lastLiked = prev.liked[prev.liked.length - 1];
        const lastPassed = prev.passed[prev.passed.length - 1];
        const lastPerson = todaysPicks[currentPickIndex - 1];
        
        if (lastLiked && lastLiked.userId === lastPerson?.userId) {
          return { ...prev, liked: prev.liked.slice(0, -1) };
        } else if (lastPassed && lastPassed.userId === lastPerson?.userId) {
          return { ...prev, passed: prev.passed.slice(0, -1) };
        }
        return prev;
      });
    }
  }, [currentPickIndex, todaysPicks]);
  
  // Handle match screen actions
  const handleStartChat = useCallback(() => {
    if (matchPerson) {
      navigate("/chat", { state: { matchPerson } });
    }
  }, [navigate, matchPerson]);

  const handleKeepSwiping = useCallback(() => {
    setMatchPerson(null);
    setTimeout(() => {
      setCurrentPickIndex(prev => {
        const nextIndex = prev + 1;
        return nextIndex >= todaysPicks.length ? 0 : nextIndex;
      });
    }, 200);
  }, [todaysPicks.length]);
  
  // Check if we have any content to show
  const hasAnyContent = nearbyProfiles.length > 0 || events.length > 0 || places.length > 0 || activeChat;

  // Loading skeleton
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#fafbfc', pb: SAFE_BOTTOM }}>
        <Box sx={{ px: 3, pt: 3 }}>
          <Skeleton variant="text" width={80} height={36} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={140} height={28} sx={{ mb: 3 }} />
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: '16px', mb: 2 }} />
          <Skeleton variant="rounded" height={160} sx={{ borderRadius: '16px', mb: 2 }} />
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: '16px' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#fafbfc',
        pb: SAFE_BOTTOM,
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* Help Button */}
      <PageHelpButton {...getPageHelpContent('home')} />
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Box
              sx={{
                backgroundColor: '#fef3c7',
                px: 3,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <WifiOff size={18} color="#d97706" />
              <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500 }}>
                No internet connection
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: '#1a1a2e',
            letterSpacing: '-0.5px',
          }}
        >
          Pulse
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleGoToNearby}
            startIcon={<Compass size={16} />}
            sx={{
              py: 0.75,
              px: 2,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              boxShadow: '0 4px 12px rgba(108,92,231,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                boxShadow: '0 6px 16px rgba(108,92,231,0.4)',
              },
            }}
          >
            גלה מי קרוב
          </Button>
          <PageHelpButton {...getPageHelpContent('home')} />
          <UserAvatarButton photoUrl={user?.photoUrl} />
        </Box>
      </Box>

      {/* Time-based greeting - no username per spec */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
            {greeting}
          </Typography>
        </Box>
      </motion.div>

      {/* 2. Status / Presence Hint (Optional) */}
      {user?.isVisible !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Box
            sx={{
              mx: 3,
              mb: 2,
              px: 2,
              py: 1.25,
              borderRadius: '12px',
              bgcolor: visibilityStatus.visible ? 'rgba(16, 185, 129, 0.08)' : 'rgba(100, 116, 139, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            {visibilityStatus.visible ? (
              <Eye size={16} color="#10b981" />
            ) : (
              <Pause size={16} color="#64748b" />
            )}
            <Typography
              variant="body2"
              sx={{
                color: visibilityStatus.visible ? '#059669' : '#64748b',
                fontWeight: 500,
              }}
            >
              {visibilityStatus.text}
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Match Screen Overlay */}
      <AnimatePresence>
        {matchPerson && (
          <MatchScreen
            person={matchPerson}
            onStartChat={handleStartChat}
            onKeepSwiping={handleKeepSwiping}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        
        {/* Today's Picks Section */}
        {todaysPicks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography 
                  component={motion.h5}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  variant="h5" 
                  sx={{ fontWeight: 700, color: '#1a1a2e' }}
                >
                  Today's Picks
                </Typography>
              </Box>
              
              {/* Horizontal Scrollable Carousel */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  pb: 2,
                  mb: 1,
                  scrollSnapType: 'x mandatory',
                  scrollBehavior: 'smooth',
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#cbd5e1',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#94a3b8',
                    },
                  },
                }}
              >
                {todaysPicks.map((profile, index) => (
                  <HorizontalPickCard
                    key={profile.userId}
                    profile={profile}
                    onClick={() => handlePickClick(profile.userId)}
                    index={index}
                  />
                ))}
              </Box>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  color: '#94a3b8', 
                }}
              >
                ← Swipe to browse • Tap to pull • Tap again to view →
              </Typography>
            </Box>
          </motion.div>
        )}
        
        {/* 3. Profile Completion Card (Conditional) */}
        {!isProfileComplete && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Box
              sx={{
                p: 2.5,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(168,85,247,0.06) 100%)',
                border: '1px solid rgba(108,92,231,0.12)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                {isProfileAlmostComplete ? 'Almost there' : 'Complete your profile'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                {isProfileAlmostComplete 
                  ? 'A few more details can unlock better matches'
                  : 'It helps us spark better connections for you'}
              </Typography>
              <Button
                size="small"
                onClick={handleGoToProfile}
                endIcon={<ArrowRight size={16} />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#6C5CE7',
                  p: 0,
                }}
              >
                {isProfileAlmostComplete ? 'Finish profile' : 'Complete profile'}
              </Button>
            </Box>
          </motion.div>
        )}


        {/* Nearby Preview - Vertical layout per spec */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader 
            icon={<Users size={18} color="#6C5CE7" />}
            title={t('nearby')}
            subtitle="People worth meeting right now"
          />
          
          {nearbyProfiles.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 }}>
              {nearbyProfiles.map((profile) => (
                <ProfilePreviewCard key={profile.id} profile={profile} />
              ))}
            </Box>
          ) : (
            <EmptyPreview text="No strong matches right now. You can try again later." />
          )}
          
          <Button
            size="small"
            onClick={handleGoToNearby}
            endIcon={<ArrowRight size={16} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#6C5CE7',
              p: 0,
            }}
          >
            Find nearby matches
          </Button>
        </motion.div>

        {/* 5. Events Preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <SectionHeader 
            icon={<Calendar size={18} color="#ec4899" />}
            title={t('events')}
            subtitle="Things worth stepping out for"
          />
          
          {events.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 }}>
              {events.map((event) => (
                <EventPreviewCard key={event.id} event={event} onClick={handleGoToEvents} />
              ))}
            </Box>
          ) : (
            <EmptyPreview text="No upcoming events right now." />
          )}
          
          <Button
            size="small"
            onClick={handleGoToEvents}
            endIcon={<ArrowRight size={16} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#6C5CE7',
              p: 0,
            }}
          >
            View all events
          </Button>
        </motion.div>

        {/* 6. Explore Preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader 
            icon={<Compass size={18} color="#10b981" />}
            title={t('explore')}
            subtitle="Places open right now"
          />
          
          {places.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 }}>
              {places.map((place) => (
                <PlacePreviewCard key={place.id} place={place} onClick={handleGoToExplore} />
              ))}
            </Box>
          ) : (
            <EmptyPreview text="Nothing active nearby right now." />
          )}
          
          <Button
            size="small"
            onClick={handleGoToExplore}
            endIcon={<ArrowRight size={16} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#6C5CE7',
              p: 0,
            }}
          >
            Explore places
          </Button>
        </motion.div>

        {/* 7. Chats Preview (Conditional) */}
        {activeChat && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <SectionHeader 
              icon={<MessageCircle size={18} color="#f59e0b" />}
              title={t('chats')}
            />
            
            <Box
              onClick={handleGoToChats}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                bgcolor: '#fff',
                borderRadius: '14px',
                border: '1px solid rgba(0,0,0,0.06)',
                cursor: 'pointer',
                mb: 1.5,
                '&:hover': { bgcolor: '#f8fafc' },
              }}
            >
              <Avatar src={activeChat.photo} sx={{ width: 44, height: 44 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                  {activeChat.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activeChat.lastMessage}
                </Typography>
              </Box>
              {activeChat.unread && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#6C5CE7',
                  }}
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                size="small"
                onClick={handleGoToChats}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#6C5CE7',
                  p: 0,
                }}
              >
                Open chat
              </Button>
              <Button
                size="small"
                onClick={handleGoToChats}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  color: '#94a3b8',
                  p: 0,
                }}
              >
                View all chats
              </Button>
            </Box>
          </motion.div>
        )}

        {/* 8. Empty / Calm State (Global) */}
        {!hasAnyContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Sparkles size={32} color="#94a3b8" style={{ marginBottom: 12 }} />
              <Typography variant="body1" sx={{ color: '#64748b', mb: 1 }}>
                Nothing pressing right now.
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Pulse works quietly in the background.
              </Typography>
              <Typography variant="caption" sx={{ color: '#cbd5e1', mt: 2, display: 'block' }}>
                You can always check Nearby or Events.
              </Typography>
            </Box>
          </motion.div>
        )}

        {/* Bottom spacer */}
        <Box sx={{ height: 20 }} />
      </Box>
    </Box>
  );
};

/* =========================
   Sub-components
   ========================= */

function SectionHeader({ icon, title, subtitle }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
        {icon}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function ProfilePreviewCard({ profile }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: '#fff',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Square photo thumbnail per spec */}
      <Avatar
        src={profile.photo}
        sx={{
          width: 64,
          height: 64,
          borderRadius: '12px',
          flexShrink: 0,
        }}
        variant="rounded"
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {profile.name}, {profile.age}
        </Typography>
        {/* Quick Vibe Line - italic/lighter tone per spec */}
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontStyle: 'italic',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          "{profile.vibeLine}"
        </Typography>
      </Box>
    </Box>
  );
}

function EventPreviewCard({ event, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: '#fff',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.06)',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
        transition: 'all 0.2s ease',
      }}
    >
      {/* Wide image per spec */}
      <Box
        sx={{
          height: 120,
          backgroundImage: `url(${event.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Vibe icon overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: 'rgba(255,255,255,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Typography sx={{ fontSize: 18 }}>{event.vibeIcon}</Typography>
        </Box>
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
          {event.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Calendar size={14} color="#6C5CE7" />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              {event.date} · {event.time}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MapPin size={14} color="#94a3b8" />
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              {event.location}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function PlacePreviewCard({ place, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: '#fff',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.06)',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
        transition: 'all 0.2s ease',
      }}
    >
      {/* Place image */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '12px',
          backgroundImage: `url(${place.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {place.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {place.category}
          </Typography>
          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#d1d5db' }} />
          <Typography
            variant="body2"
            sx={{
              color: place.openStatus === 'Open now' ? '#10b981' : '#f59e0b',
              fontWeight: 600,
            }}
          >
            {place.openStatus}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function EmptyPreview({ text }) {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#f8fafc',
        borderRadius: '12px',
        mb: 1.5,
      }}
    >
      <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center' }}>
        {text}
      </Typography>
    </Box>
  );
}

// Horizontal Pick Card Component (for carousel)
function HorizontalPickCard({ profile, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      style={{
        minWidth: '280px',
        maxWidth: '280px',
        scrollSnapAlign: 'start',
      }}
    >
      <Box
        onClick={onClick}
        sx={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          bgcolor: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          height: '100%',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 32px rgba(139,92,246,0.25), 0 0 20px rgba(249,115,22,0.15)',
          },
        }}
      >
        {/* Profile Image */}
        <Box
          sx={{
            width: '100%',
            height: 320,
            backgroundImage: `url(${profile.primaryPhotoUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* Match Percentage Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #F97316 100%)',
              color: '#fff',
              px: 2,
              py: 0.75,
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '0.95rem',
              boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
              border: '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {profile.matchPercentage}%
          </Box>
        </Box>
        
        {/* Profile Info */}
        <Box sx={{ p: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#1a1a2e',
              mb: 0.5,
            }}
          >
            {profile.firstName}{profile.lastName ? ` ${profile.lastName}` : ''}, {profile.age}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#94a3b8',
              mb: 1.5,
            }}
          >
            {profile.primaryRole}
          </Typography>
          
          {/* Tags */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(249,115,22,0.12) 100%)',
                border: '1px solid rgba(139,92,246,0.25)',
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #F97316 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 600,
                }}
              >
                {profile.height}
              </Typography>
            </Box>
            {profile.interests.slice(0, 1).map((interest, idx) => (
              <Box
                key={idx}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(249,115,22,0.12) 100%)',
                  border: '1px solid rgba(139,92,246,0.25)',
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #F97316 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 600,
                  }}
                >
                  {interest}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

// Swipeable Card Component
function SwipeableCard({ profile, onSwipe, isActive }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe('right', profile);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe('left', profile);
    }
  };

  if (!isActive) return null;

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        x,
        rotate,
        opacity,
        cursor: 'grab',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: "#fff",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          position: 'relative',
        }}
      >
        {/* Like indicator */}
        <motion.div
          style={{
            position: 'absolute',
            top: 60,
            left: 20,
            opacity: likeOpacity,
            zIndex: 10,
            transform: 'rotate(-20deg)',
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '12px',
              border: '4px solid #10b981',
              backgroundColor: 'rgba(16,185,129,0.15)',
            }}
          >
            <Typography sx={{ color: '#10b981', fontWeight: 800, fontSize: '1.5rem' }}>
              LIKE
            </Typography>
          </Box>
        </motion.div>

        {/* Nope indicator */}
        <motion.div
          style={{
            position: 'absolute',
            top: 60,
            right: 20,
            opacity: nopeOpacity,
            zIndex: 10,
            transform: 'rotate(20deg)',
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1,
              borderRadius: '12px',
              border: '4px solid #ef4444',
              backgroundColor: 'rgba(239,68,68,0.15)',
            }}
          >
            <Typography sx={{ color: '#ef4444', fontWeight: 800, fontSize: '1.5rem' }}>
              NOPE
            </Typography>
          </Box>
        </motion.div>

        {/* Profile Image */}
        <Box
          sx={{
            width: '100%',
            height: '70%',
            backgroundImage: `url(${profile.primaryPhotoUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* Match Percentage Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              color: '#fff',
              px: 2.5,
              py: 1,
              borderRadius: '24px',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(108,92,231,0.4)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            {profile.matchPercentage}%
          </Box>
        </Box>
        
        {/* Profile Info */}
        <Box sx={{ p: 2.5, height: '30%', overflow: 'auto' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: '#1a1a2e',
              mb: 0.5,
            }}
          >
            {profile.firstName}{profile.lastName ? ` ${profile.lastName}` : ''}, {profile.age}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#94a3b8',
              mb: 1.5,
            }}
          >
            {profile.primaryRole}
          </Typography>
          
          {/* Tags */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: '16px',
                background: 'rgba(108,92,231,0.1)',
                border: '1px solid rgba(108, 92, 231, 0.2)',
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#6C5CE7',
                  fontWeight: 600,
                }}
              >
                {profile.height}
              </Typography>
            </Box>
            {profile.interests.slice(0, 2).map((interest, index) => (
              <Box
                key={index}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '16px',
                  background: 'rgba(108,92,231,0.1)',
                  border: '1px solid rgba(108, 92, 231, 0.2)',
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#6C5CE7',
                    fontWeight: 600,
                  }}
                >
                  {interest}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

// Match Screen
function MatchScreen({ person, onStartChat, onKeepSwiping }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(108,92,231,0.95) 0%, rgba(168,85,247,0.95) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <motion.div
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Heart size={64} color="#fff" fill="#fff" />
          </motion.div>
        </Box>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            color: '#fff',
            textAlign: 'center',
            mb: 1,
            textShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
        >
          It's a Pulse!
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            mb: 4,
          }}
        >
          You can start chatting now
        </Typography>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ width: '100%', maxWidth: 300, padding: '0 24px' }}
      >
        <Button
          fullWidth
          variant="contained"
          onClick={onStartChat}
          startIcon={<MessageCircle size={20} />}
          sx={{
            py: 1.75,
            mb: 2,
            borderRadius: '14px',
            fontSize: '1.1rem',
            fontWeight: 700,
            textTransform: 'none',
            backgroundColor: '#fff',
            color: '#6C5CE7',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            '&:hover': {
              backgroundColor: '#f8f8f8',
            },
          }}
        >
          Start chat
        </Button>
        <Button
          fullWidth
          variant="text"
          onClick={onKeepSwiping}
          sx={{
            py: 1.25,
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            color: 'rgba(255,255,255,0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          Keep browsing
        </Button>
      </motion.div>
    </motion.div>
  );
}

// CSS animations for badges
const styles = `
  @keyframes badgePulse {
    0%, 100% { 
      box-shadow: 0 4px 16px rgba(108,92,231,0.4), 0 0 20px rgba(108,92,231,0.3);
    }
    50% { 
      box-shadow: 0 4px 20px rgba(108,92,231,0.6), 0 0 30px rgba(108,92,231,0.5);
    }
  }
  @keyframes badgeGlow {
    0%, 100% { 
      transform: scale(1);
      opacity: 0.4;
    }
    50% { 
      transform: scale(1.2);
      opacity: 0.6;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  if (!document.head.querySelector('style[data-home-animations]')) {
    styleSheet.setAttribute('data-home-animations', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default HomeScreen;
