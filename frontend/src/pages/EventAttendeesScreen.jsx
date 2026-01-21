/**
 * EventAttendeesScreen - Shows attendees of an event that match user's criteria
 * Users can swipe through attendees like in the Nearby flow
 */

import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
} from '@mui/material';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  X,
  Heart,
  RotateCcw,
  Sparkles,
  MessageCircle,
  Filter,
} from 'lucide-react';

// Mock attendees data
const MOCK_ATTENDEES = [
  {
    id: 101,
    firstName: "Shira",
    age: 26,
    city: "Tel Aviv",
    distance: 0.8,
    profession: "Marketing Manager",
    tagline: "Always up for an adventure 🌟",
    interests: ["Wine", "Travel", "Music", "Dancing"],
    photos: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    ],
    likesYou: true,
    verified: true,
  },
  {
    id: 102,
    firstName: "Yael",
    age: 28,
    city: "Ramat Gan",
    distance: 2.1,
    profession: "Software Engineer",
    tagline: "Code by day, wine by night 🍷",
    interests: ["Tech", "Yoga", "Books", "Coffee"],
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    ],
    likesYou: false,
    verified: true,
  },
  {
    id: 103,
    firstName: "Noa",
    age: 25,
    city: "Tel Aviv",
    distance: 0.5,
    profession: "Graphic Designer",
    tagline: "Creating beautiful things ✨",
    interests: ["Art", "Design", "Photography", "Hiking"],
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    ],
    likesYou: true,
    verified: false,
  },
  {
    id: 104,
    firstName: "Maya",
    age: 27,
    city: "Herzliya",
    distance: 5.2,
    profession: "Product Designer",
    tagline: "Coffee enthusiast ☕",
    interests: ["UX", "Coffee", "Pilates", "Travel"],
    photos: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=800&q=80",
    ],
    likesYou: false,
    verified: true,
  },
];

// Swipeable Card Component
function AttendeeCard({ person, onSwipe }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;
    if (offset.x > 100 || velocity.x > 500) {
      onSwipe('right', person);
    } else if (offset.x < -100 || velocity.x < -500) {
      onSwipe('left', person);
    }
  };

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    if (tapX < rect.width * 0.3) {
      setPhotoIndex((prev) => Math.max(0, prev - 1));
    } else {
      setPhotoIndex((prev) => Math.min(person.photos.length - 1, prev + 1));
    }
  };

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        position: 'absolute',
        width: '100%',
        height: '100%',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Photo */}
        <Box
          onClick={handleTap}
          sx={{
            position: 'relative',
            height: '55%',
            cursor: 'pointer',
          }}
        >
          <img
            src={person.photos[photoIndex]}
            alt={person.firstName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          
          {/* Photo dots */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            {person.photos.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </Box>

          {/* Gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
            }}
          />

          {/* Name overlay */}
          <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
              {person.firstName}, {person.age}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <MapPin size={14} color="#fff" />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {person.city} · {person.distance} km away
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
            {person.profession}
          </Typography>
          <Typography variant="body2" sx={{ color: '#1a1a2e', mb: 1.5 }}>
            {person.tagline}
          </Typography>

          {/* Interests */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {person.interests.map((interest, i) => (
              <Chip
                key={i}
                label={interest}
                size="small"
                sx={{
                  backgroundColor: 'rgba(108,92,231,0.08)',
                  color: '#6C5CE7',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

// Match Screen
function MatchModal({ person, onStartChat, onKeepSwiping }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(108,92,231,0.95) 0%, rgba(168,85,247,0.95) 100%)',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        <Heart size={64} color="#fff" fill="#fff" />
      </motion.div>

      <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', mt: 3, mb: 1 }}>
        It's a Match!
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4 }}>
        You and {person.firstName} both liked each other
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '3px solid #fff',
            backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80)',
            backgroundSize: 'cover',
          }}
        />
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '3px solid #fff',
            backgroundImage: `url(${person.photos[0]})`,
            backgroundSize: 'cover',
          }}
        />
      </Box>

      <Button
        variant="contained"
        startIcon={<MessageCircle size={20} />}
        onClick={onStartChat}
        sx={{
          py: 1.5,
          px: 4,
          mb: 2,
          borderRadius: '14px',
          backgroundColor: '#fff',
          color: '#6C5CE7',
          fontWeight: 700,
          '&:hover': { backgroundColor: '#f8f8f8' },
        }}
      >
        Start Chat
      </Button>
      <Button
        variant="text"
        onClick={onKeepSwiping}
        sx={{ color: 'rgba(255,255,255,0.9)' }}
      >
        Keep Swiping
      </Button>
    </motion.div>
  );
}

const EventAttendeesScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  const [attendees] = useState(MOCK_ATTENDEES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedPeople, setSwipedPeople] = useState({ liked: [], passed: [] });
  const [matchPerson, setMatchPerson] = useState(null);
  const [isAllDone, setIsAllDone] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSwipe = useCallback((direction, person) => {
    if (direction === 'right') {
      setSwipedPeople((prev) => ({ ...prev, liked: [...prev.liked, person] }));
      if (person.likesYou) {
        setMatchPerson(person);
        return;
      }
    } else {
      setSwipedPeople((prev) => ({ ...prev, passed: [...prev.passed, person] }));
    }

    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev + 1 >= attendees.length) {
          setIsAllDone(true);
        }
        return prev + 1;
      });
    }, 200);
  }, [attendees.length]);

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsAllDone(false);
    }
  };

  const handleStartChat = () => {
    navigate('/chat', { state: { matchPerson } });
  };

  const handleKeepSwiping = () => {
    setMatchPerson(null);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev + 1 >= attendees.length) {
          setIsAllDone(true);
        }
        return prev + 1;
      });
    }, 200);
  };

  const currentPerson = attendees[currentIndex];

  if (!event) {
    navigate('/my-events');
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafbfc',
        position: 'relative',
      }}
    >
      {/* Match Modal */}
      <AnimatePresence>
        {matchPerson && (
          <MatchModal
            person={matchPerson}
            onStartChat={handleStartChat}
            onKeepSwiping={handleKeepSwiping}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <IconButton onClick={handleBack} sx={{ color: '#1a1a2e' }}>
            <ArrowLeft size={22} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2 }}>
              {event.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Calendar size={12} color="#64748b" />
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {event.date}
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<Users size={14} />}
            label={`${attendees.length} matches`}
            size="small"
            sx={{
              backgroundColor: 'rgba(34,197,94,0.1)',
              color: '#16a34a',
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>

      {/* Card Stack */}
      {isAllDone ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
          }}
        >
          <Sparkles size={64} color="#6C5CE7" />
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 3, mb: 1, color: '#1a1a2e' }}>
            All done!
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', textAlign: 'center', mb: 3 }}>
            You've seen all matching attendees for this event
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#22c55e' }}>
                {swipedPeople.liked.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Liked</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ef4444' }}>
                {swipedPeople.passed.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Passed</Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{
              mt: 4,
              py: 1.5,
              px: 4,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Back to My Events
          </Button>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              flex: 1,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                flex: 1,
                position: 'relative',
                maxWidth: 400,
                width: '100%',
                mx: 'auto',
              }}
            >
              <AnimatePresence>
                {currentPerson && (
                  <AttendeeCard
                    key={currentPerson.id}
                    person={currentPerson}
                    onSwipe={handleSwipe}
                  />
                )}
              </AnimatePresence>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
              py: 3,
              pb: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <IconButton
              onClick={handleUndo}
              disabled={currentIndex === 0}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: '#fff',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                '&:disabled': { opacity: 0.4 },
              }}
            >
              <RotateCcw size={22} color="#f59e0b" />
            </IconButton>

            <IconButton
              onClick={() => handleSwipe('left', currentPerson)}
              sx={{
                width: 64,
                height: 64,
                backgroundColor: '#fff',
                boxShadow: '0 4px 20px rgba(239,68,68,0.3)',
                '&:hover': { backgroundColor: '#fef2f2' },
              }}
            >
              <X size={28} color="#ef4444" />
            </IconButton>

            <IconButton
              onClick={() => handleSwipe('right', currentPerson)}
              sx={{
                width: 64,
                height: 64,
                backgroundColor: '#fff',
                boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
                '&:hover': { backgroundColor: '#f0fdf4' },
              }}
            >
              <Heart size={28} color="#22c55e" />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EventAttendeesScreen;
