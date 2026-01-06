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
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import UserAvatarButton from '../components/UserAvatarButton';
import { UserCardStack } from '../components/UserCard';

// Safe bottom padding for tab bar
const SAFE_BOTTOM = 'calc(88px + env(safe-area-inset-bottom, 0px))';

// Get time-based greeting
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

// Mock data - would come from API
const MOCK_NEARBY_PROFILES = [
  {
    id: 1,
    name: 'Maya',
    age: 28,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    vibeLine: 'Looking for real conversations',
  },
  {
    id: 2,
    name: 'Daniel',
    age: 31,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    vibeLine: 'Coffee lover & night owl',
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

// Mock data for UserCard v2 (per spec section 7 - UserCardModel)
const MOCK_DISCOVER_PROFILES = [
  {
    userId: 'u1',
    firstName: 'Shani',
    age: 24,
    distanceMeters: 700,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    contextLine: 'Here for the event tonight',
    chips: [
      { label: '168cm', type: 'factual' },
      { label: 'Social drinker', type: 'factual' },
      { label: 'Yoga lover', type: 'hobby' },
    ],
  },
  {
    userId: 'u2',
    firstName: 'Noa',
    age: 27,
    distanceMeters: 1200,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    contextLine: 'Fashion Blogger',
    chips: [
      { label: '172cm', type: 'factual' },
      { label: 'Non-smoker', type: 'factual' },
      { label: 'Art & Design', type: 'hobby' },
    ],
  },
  {
    userId: 'u3',
    firstName: 'Maya',
    age: 25,
    distanceMeters: 450,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    contextLine: 'Spontaneous coffee lover',
    chips: [
      { label: '165cm', type: 'factual' },
      { label: 'Foodie', type: 'hobby' },
      { label: 'Travel addict', type: 'hobby' },
    ],
  },
  {
    userId: 'u4',
    firstName: 'Tamar',
    age: 29,
    distanceMeters: 2300,
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
    contextLine: 'Software developer by day, musician by night',
    chips: [
      { label: '170cm', type: 'factual' },
      { label: 'Guitar', type: 'hobby' },
      { label: 'Looking for relationship', type: 'lookingFor' },
    ],
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
  const [discoverProfiles, setDiscoverProfiles] = useState([]);
  const [showDiscover, setShowDiscover] = useState(true); // Toggle between Discover and Browse mode
  
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
      setDiscoverProfiles(MOCK_DISCOVER_PROFILES);
      
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
  
  // UserCard handlers
  const handleLike = useCallback((user) => {
    console.log('Liked:', user.firstName);
    // In real app: send like to API, check for match
  }, []);
  
  const handlePass = useCallback((user) => {
    console.log('Passed:', user.firstName);
    // In real app: send pass to API
  }, []);
  
  const handleTapProfile = useCallback((user) => {
    console.log('View profile:', user.firstName);
    // In real app: navigate to expanded profile
    navigate(`/profile/${user.userId}`);
  }, [navigate]);
  
  const handleDiscoverEmpty = useCallback(() => {
    console.log('No more profiles');
    // Could show refresh option or switch to browse mode
  }, []);
  
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
      }}
    >
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
        <UserAvatarButton photoUrl={user?.photoUrl} />
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

      {/* Main Content */}
      <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        
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

        {/* 4. Discover Section - UserCard v2 */}
        {showDiscover && discoverProfiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SectionHeader 
              icon={<Sparkles size={18} color="#6C5CE7" />}
              title="Discover"
              subtitle="People you might like"
            />
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 2,
              mx: -3, // Extend beyond padding for full-width card
            }}>
              <UserCardStack
                users={discoverProfiles}
                onLike={handleLike}
                onPass={handlePass}
                onTap={handleTapProfile}
                onEmpty={handleDiscoverEmpty}
                hasLocationPermission={true}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Button
                size="small"
                onClick={() => setShowDiscover(false)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  color: '#64748b',
                  p: 0,
                }}
              >
                Browse instead
              </Button>
            </Box>
          </motion.div>
        )}

        {/* 5. Nearby Preview - Vertical layout per spec */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: showDiscover ? 0.3 : 0.2 }}
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

export default HomeScreen;
