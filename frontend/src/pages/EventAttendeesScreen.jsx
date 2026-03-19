/**
 * EventAttendeesScreen - Shows attendees of an event that match user's criteria
 * Uses the new Discover-style ProfileTimeline cards (scrollable, one at a time)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import {
  Calendar,
  Users,
  Sparkles,
} from 'lucide-react';
import ProfileTimeline from '../components/timeline/ProfileTimeline';
import SwipeWrapper, { SwipeLabels } from '../components/SwipeWrapper';

const SWIPE_THRESHOLD = 100; // px to trigger swipe action

// Mock attendees data - formatted for ProfileTimeline
const MOCK_ATTENDEES = [
  {
    id: 101,
    firstName: "Shira",
    name: "Shira",
    age: 26,
    city: "Tel Aviv",
    distance: 0.8,
    profession: "Marketing Manager",
    tagline: "Always up for an adventure 🌟",
    bio: "Marketing manager by day, adventure seeker by night. Love discovering new places and meeting interesting people.",
    interests: ["Wine", "Travel", "Music", "Dancing", "Yoga", "Photography"],
    photos: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    ],
    likesYou: true,
    verified: true,
    height: "168 cm",
    location: "Tel Aviv",
    lookingFor: ["Relationship"],
    qualities: ["Humor", "Kindness", "Openness"],
  },
  {
    id: 102,
    firstName: "Yael",
    name: "Yael",
    age: 28,
    city: "Ramat Gan",
    distance: 2.1,
    profession: "Software Engineer",
    tagline: "Code by day, wine by night 🍷",
    bio: "Software engineer who believes in work-life balance. When I'm not coding, you'll find me at yoga or exploring new coffee shops.",
    interests: ["Tech", "Yoga", "Books", "Coffee", "Hiking", "Cooking"],
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    ],
    likesYou: false,
    verified: true,
    height: "165 cm",
    location: "Ramat Gan",
    lookingFor: ["Something casual"],
    qualities: ["Intelligence", "Ambition", "Honesty"],
  },
  {
    id: 103,
    firstName: "Noa",
    name: "Noa",
    age: 25,
    city: "Tel Aviv",
    distance: 0.5,
    profession: "Graphic Designer",
    tagline: "Creating beautiful things ✨",
    bio: "Data nerd by day, bookworm by night. Love hiking and discovering new recipes.",
    interests: ["Art", "Design", "Photography", "Hiking", "Reading", "Museums"],
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
    ],
    likesYou: true,
    verified: false,
    height: "170 cm",
    location: "Tel Aviv",
    lookingFor: ["Relationship"],
    qualities: ["Creativity", "Empathy", "Curiosity"],
  },
  {
    id: 104,
    firstName: "Maya",
    name: "Maya",
    age: 27,
    city: "Herzliya",
    distance: 5.2,
    profession: "Product Designer",
    tagline: "Coffee enthusiast ☕",
    bio: "Product designer passionate about creating meaningful experiences. Always looking for the next great coffee spot.",
    interests: ["UX", "Coffee", "Pilates", "Travel", "Design", "Music"],
    photos: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    ],
    likesYou: false,
    verified: true,
    height: "172 cm",
    location: "Herzliya",
    lookingFor: ["New connections"],
    qualities: ["Passion", "Authenticity", "Humor"],
  },
];

// Transform attendee to ProfileTimeline format
const transformToProfileTimelineFormat = (person) => ({
  ...person,
  name: person.firstName,
  primaryPhoto: person.photos?.[0],
});

const EventAttendeesScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  const [attendees] = useState(MOCK_ATTENDEES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedPeople, setSwipedPeople] = useState({ liked: [], passed: [] });
  const [matchPerson, setMatchPerson] = useState(null);
  const [isAllDone, setIsAllDone] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0); // Track swipe offset for labels

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

  // Show match popup when someone likes you back
  useEffect(() => {
    if (!matchPerson) return;
    try {
      window.dispatchEvent(
        new CustomEvent('pulse:show_match', {
          detail: {
            match: {
              id: matchPerson.id,
              name: matchPerson.firstName,
              firstName: matchPerson.firstName,
              photo: matchPerson.photos?.[0],
              photos: matchPerson.photos,
            },
            copy: {
              title: "It's a Match",
              subtitle: "You're in sync",
              description: 'Something real can happen now',
              matchedLine: `You and ${matchPerson.firstName} matched!`,
              primaryCta: 'Start chat',
              secondaryCta: 'Keep swiping',
            },
          },
        })
      );
    } catch {
      // ignore
    }
    setMatchPerson(null);
  }, [matchPerson]);

  const currentPerson = attendees[currentIndex];
  const nextPerson = attendees[currentIndex + 1] || null;

  if (!event) {
    navigate('/my-events');
    return null;
  }

  return (
    <>
      {/* Swipe Labels - NOPE/LIKE */}
      <SwipeLabels swipeOffset={swipeOffset} />
      
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fafbfc',
        position: 'relative',
      }}
    >
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
        /* ProfileTimeline - New Discover-style scrollable card */
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            pb: 'calc(88px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '520px',
              mx: 'auto',
              bgcolor: 'rgba(108, 92, 231, 0.08)',
              boxShadow: { xs: 'none', md: '0 0 40px rgba(0,0,0,0.08)' },
              minHeight: '100vh',
              position: 'relative',
            }}
          >
            {/* Background Card - Next person preview (visible underneath during swipe) */}
            {nextPerson && Math.abs(swipeOffset) > 10 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1,
                  pointerEvents: 'none',
                  transform: `scale(${0.97 + Math.min(Math.abs(swipeOffset) / SWIPE_THRESHOLD, 1) * 0.03})`,
                  transition: 'none',
                  willChange: 'transform',
                  border: '2px solid rgba(108, 92, 231, 0.3)',
                  borderRadius: '24px',
                  overflow: 'hidden',
                }}
              >
                <ProfileTimeline
                  user={transformToProfileTimelineFormat(nextPerson)}
                  hideUndo={true}
                />
              </Box>
            )}
            {/* Active Card - Draggable foreground card */}
            {currentPerson && (
              <Box sx={{ position: 'relative', zIndex: 2 }}>
              <SwipeWrapper
                key={`swipe-${currentPerson.id}`}
                onSwipeRight={() => handleSwipe('right', currentPerson)}
                onSwipeLeft={() => handleSwipe('left', currentPerson)}
                onOffsetChange={setSwipeOffset}
              >
                <Box sx={{ pointerEvents: 'auto' }}>
                  <ProfileTimeline
                    user={transformToProfileTimelineFormat(currentPerson)}
                    onLike={() => handleSwipe('right', currentPerson)}
                    onPass={() => handleSwipe('left', currentPerson)}
                    onUndo={handleUndo}
                    canUndo={currentIndex > 0}
                  />
                </Box>
              </SwipeWrapper>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
    </>
  );
};

export default EventAttendeesScreen;
