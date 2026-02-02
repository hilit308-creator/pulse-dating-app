// ViewNearbyPeopleScreen.jsx - Swipeable Cards
// Shows one card at a time - swipe right to like, left to pass

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowLeft, MapPin, Sparkles, X, Heart, Ruler, Wine, PawPrint, Baby, ShieldCheck, HeartHandshake, Sun, Smile, Radar, RefreshCw, MessageCircle, HelpCircle, Coffee } from "lucide-react";
import { NearbyMatchMoment, InvitationModal } from "../components/nearby";
import useHomeDeckStore from "../store/homeDeckStore";

/* ------------------------------ Constants --------------------------------- */
const SAFE_BOTTOM = 'calc(88px + env(safe-area-inset-bottom, 0px))';
const SWIPE_THRESHOLD = 100; // px to trigger swipe action

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Mock data for nearby people with full profile details
const MOCK_NEARBY_PEOPLE = [
  {
    id: 1,
    firstName: "Maya",
    age: 27,
    distanceRange: "< 1 km",
    distance: 0.6,
    city: "Tel Aviv",
    tags: ["Yoga", "Design", "Coffee", "Music"],
    status: "Live now",
    aboutMoment: "Looking for good coffee nearby",
    profession: "Product Designer",
    tagline: "Coffee, cats, and cozy playlists ☕️🐱",
    aboutMe: ["170 cm", "Sometimes drinks", "Likes pets"],
    lookingFor: ["A life partner", "Confidence", "Openness"],
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&h=1700&crop=faces&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=1400&h=1700&q=80",
    ],
    hasEvent: true,
    eventId: 1,
    verified: true,
    likesYou: true, // Mutual like potential
  },
  {
    id: 2,
    firstName: "Lior",
    age: 26,
    distanceRange: "1–3 km",
    distance: 1.2,
    city: "Givatayim",
    tags: ["Art", "Music", "Photography", "Pilates"],
    status: "Active today",
    aboutMoment: null,
    profession: "UX Researcher",
    tagline: "Designing with empathy",
    aboutMe: ["168 cm", "Doesn't smoke", "Likes pets"],
    lookingFor: ["Openness", "Humor", "Stability"],
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&h=1700&q=80",
    ],
    hasEvent: false,
    verified: false,
  },
  {
    id: 3,
    firstName: "Noa",
    age: 29,
    distanceRange: "< 1 km",
    distance: 0.3,
    city: "Tel Aviv",
    tags: ["Photography", "Travel", "Hiking", "Wine"],
    status: "Live now",
    aboutMoment: "Exploring the neighborhood",
    profession: "Photographer",
    tagline: "Capturing moments, one frame at a time 📸",
    aboutMe: ["165 cm", "Sometimes drinks", "No kids"],
    lookingFor: ["Adventure", "Creativity", "Deep talks"],
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=1400&h=1700&q=80",
    ],
    hasEvent: true,
    eventId: 2,
    verified: true,
    likesYou: true, // Mutual like potential
  },
  {
    id: 4,
    firstName: "Shira",
    age: 25,
    distanceRange: "3–7 km",
    distance: 4.5,
    city: "Ramat Gan",
    tags: ["Music", "Yoga", "Wellness", "Meditation"],
    status: "Active today",
    aboutMoment: null,
    profession: "Music Teacher",
    tagline: "Finding harmony in everything 🎵",
    aboutMe: ["172 cm", "Doesn't drink", "Vegetarian"],
    lookingFor: ["Mindfulness", "Kindness", "Music lover"],
    photos: [
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1400&h=1700&q=80",
    ],
    hasEvent: false,
    verified: true,
  },
  {
    id: 5,
    firstName: "Dana",
    age: 28,
    distanceRange: "1–3 km",
    distance: 2.1,
    city: "Tel Aviv",
    tags: ["Design", "Art", "Brunch", "Architecture"],
    status: "Live now",
    aboutMoment: "Working from a cafe",
    profession: "Interior Designer",
    tagline: "Aesthetic vibes and good energy 🌟",
    aboutMe: ["170 cm", "Sometimes drinks", "Dog mom"],
    lookingFor: ["Sophistication", "Ambition", "Good taste"],
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1400&h=1700&q=80",
    ],
    hasEvent: true,
    eventId: 1,
    verified: true,
  },
  {
    id: 6,
    firstName: "Yael",
    age: 24,
    distanceRange: "< 1 km",
    distance: 0.7,
    city: "Tel Aviv",
    tags: ["Yoga", "Nature", "Cooking", "Reading"],
    status: "Live now",
    aboutMoment: null,
    profession: "Yoga Instructor",
    tagline: "Living mindfully, one breath at a time 🧘‍♀️",
    aboutMe: ["163 cm", "Doesn't smoke", "Vegan"],
    lookingFor: ["Authenticity", "Health-conscious", "Patience"],
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&h=1700&q=80",
    ],
    hasEvent: false,
    verified: false,
  },
];

/* ------------------------------ Components -------------------------------- */

// Photo indicator dots
function PhotoDots({ count, currentIndex }) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 12,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 0.5,
        px: 2,
        zIndex: 5,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: i === currentIndex ? "#fff" : "rgba(255,255,255,0.4)",
            transition: "background-color 0.2s ease",
            maxWidth: 60,
          }}
        />
      ))}
    </Box>
  );
}

// Get icon for detail item
const getDetailIcon = (text) => {
  const t = (text || "").toLowerCase();
  if (t.includes("cm")) return <Ruler size={12} />;
  if (t.includes("drink")) return <Wine size={12} />;
  if (t.includes("smoke")) return <Wine size={12} />;
  if (t.includes("kid")) return <Baby size={12} />;
  if (t.includes("pet") || t.includes("dog") || t.includes("cat")) return <PawPrint size={12} />;
  if (t.includes("vegan") || t.includes("vegetarian")) return <Sun size={12} />;
  return <Smile size={12} />;
};

// Get icon for looking for item
const getLookingForIcon = (text) => {
  const t = (text || "").toLowerCase();
  if (t.includes("partner") || t.includes("relationship")) return <HeartHandshake size={12} />;
  if (t.includes("confidence") || t.includes("ambition")) return <Sun size={12} />;
  return <Heart size={12} />;
};

// Detail pill component
function DetailPill({ text }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.4,
        borderRadius: 999,
        backgroundColor: "#efeaff",
        border: "1px solid rgba(108,92,231,0.2)",
      }}
    >
      <Box sx={{ color: "#6C5CE7", display: 'flex', alignItems: 'center' }}>
        {getDetailIcon(text)}
      </Box>
      <Typography variant="caption" sx={{ color: "#6C5CE7", fontWeight: 600, fontSize: '0.7rem' }}>
        {text}
      </Typography>
    </Box>
  );
}

// Looking for pill component
function LookingForPill({ text }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.4,
        borderRadius: 999,
        backgroundColor: "rgba(244,63,94,0.08)",
        border: "1px solid rgba(244,63,94,0.15)",
      }}
    >
      <Box sx={{ color: "#f43f5e", display: 'flex', alignItems: 'center' }}>
        {getLookingForIcon(text)}
      </Box>
      <Typography variant="caption" sx={{ color: "#f43f5e", fontWeight: 600, fontSize: '0.7rem' }}>
        {text}
      </Typography>
    </Box>
  );
}

// Swipeable Card Component with real photos
function SwipeableCard({ person, onSwipe, isActive }) {
  const isLive = person.status === "Live now";
  const photos = person.photos || [];
  const [photoIndex, setPhotoIndex] = useState(0);
  
  // Motion values for drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Like/Nope indicator opacity
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  // Handle tap on photo to change
  const handlePhotoTap = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const width = rect.width;
    
    // Tap left third = previous, tap right two-thirds = next
    if (tapX < width * 0.33) {
      // Previous photo
      setPhotoIndex(prev => Math.max(0, prev - 1));
    } else {
      // Next photo (tap middle or right)
      setPhotoIndex(prev => Math.min(photos.length - 1, prev + 1));
    }
  }, [photos.length]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe('right', person);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe('left', person);
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
        aria-label={`${person.firstName}, ${person.age}`}
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

        {/* Photo with tap zones */}
        <Box
          onClick={handlePhotoTap}
          sx={{
            width: "100%",
            height: "45%",
            position: "relative",
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {/* Photo */}
          <img
            src={photos[photoIndex]}
            alt={person.firstName}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />

          {/* Photo dots */}
          {photos.length > 1 && (
            <PhotoDots count={photos.length} currentIndex={photoIndex} />
          )}

          {/* Tap zone indicators (invisible, for gesture hints) */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `linear-gradient(90deg, rgba(34,197,94,0) 0%, transparent 30%)`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `linear-gradient(-90deg, rgba(239,68,68,0) 0%, transparent 30%)`,
            }}
          />

          {/* Status badge */}
          {isLive && (
            <Box
              sx={{
                position: "absolute",
                top: 24,
                right: 16,
                zIndex: 6,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                backgroundColor: "rgba(34,197,94,0.95)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "#fff", fontWeight: 700, fontSize: 12 }}
              >
                Live now
              </Typography>
            </Box>
          )}

          {/* Gradient overlay at bottom */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              zIndex: 2,
            }}
          />

          {/* Name & location overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2.5,
              zIndex: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#fff",
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {person.firstName}, {person.age}
              </Typography>
              {person.verified && (
                <Box
                  sx={{
                    backgroundColor: 'rgba(59,130,246,0.9)',
                    borderRadius: '50%',
                    p: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={16} color="#fff" />
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <MapPin size={16} color="#fff" />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                {person.city} · {person.distance ? `${person.distance.toFixed(1)} km away` : person.distanceRange}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content below photo - ultra compact layout */}
        <Box sx={{ p: 1.25, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {/* Row 1: Profession + Tagline */}
          <Box>
            {person.profession && (
              <Typography sx={{ color: "#64748b", fontWeight: 500, fontSize: '0.8rem' }}>
                {person.profession}
              </Typography>
            )}
            {person.tagline && (
              <Typography sx={{ color: "#1a1a2e", fontSize: '0.85rem', mt: 0.25 }}>
                {person.tagline}
              </Typography>
            )}
          </Box>

          {/* Row 2: About the moment - inline */}
          {person.aboutMoment && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.5, px: 1, borderRadius: 2, bgcolor: 'rgba(34,197,94,0.08)' }}>
              <Typography sx={{ color: "#10b981", fontWeight: 600, fontSize: '0.7rem' }}>📍</Typography>
              <Typography sx={{ color: "#1a1a2e", fontSize: '0.75rem' }}>{person.aboutMoment}</Typography>
            </Box>
          )}

          {/* Row 3: Interests */}
          {person.tags && person.tags.length > 0 && (
            <Box>
              <Typography sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: '0.75rem', mb: 0.25 }}>Interests</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
                {person.tags.slice(0, 4).map((tag, i) => (
                  <Box key={i} sx={{ px: 0.75, py: 0.2, borderRadius: 999, bgcolor: "rgba(108,92,231,0.1)" }}>
                    <Typography sx={{ color: "#6C5CE7", fontWeight: 600, fontSize: '0.7rem' }}>{tag}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Row 4: Looking for */}
          {person.lookingFor && person.lookingFor.length > 0 && (
            <Box>
              <Typography sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: '0.75rem', mb: 0.25 }}>Looking for</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
                {person.lookingFor.slice(0, 3).map((item, i) => (
                  <Box key={i} sx={{ px: 0.75, py: 0.2, borderRadius: 999, bgcolor: "rgba(244,63,94,0.1)" }}>
                    <Typography sx={{ color: "#f43f5e", fontWeight: 600, fontSize: '0.7rem' }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
}

// Empty State when people disappeared
function EmptyState({ onBack }) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 4,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(168,85,247,0.1) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <MapPin size={36} color="#6C5CE7" />
      </Box>

      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#1a1a2e",
          mb: 1,
        }}
      >
        Looks like things changed
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "#64748b",
          mb: 4,
        }}
      >
        Try scanning again
      </Typography>

      <Button
        variant="contained"
        onClick={onBack}
        startIcon={<ArrowLeft size={18} />}
        sx={{
          py: 1.25,
          px: 3,
          borderRadius: "12px",
          fontSize: "0.95rem",
          fontWeight: 600,
          textTransform: "none",
          background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)",
          boxShadow: "0 4px 16px rgba(108,92,231,0.35)",
        }}
      >
        Back to Nearby
      </Button>
    </Box>
  );
}

// Match Screen - LEGACY: This component is disabled and should never render.
// The useEffect in the main component dispatches pulse:show_match directly.
// This function exists only as a safety fallback.
function MatchScreen({ person, onStartChat, onKeepSwiping, onSuggestMeeting }) {
  // This component should never be rendered (wrapped in {false && ...})
  // If somehow called, just return null immediately
  return null;
}

// All done screen when user finishes swiping
function AllDoneState({ onBack, likedCount, passedCount }) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 4,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          boxShadow: "0 12px 40px rgba(108,92,231,0.3)",
        }}
      >
        <Sparkles size={48} color="#fff" />
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: "#1a1a2e",
          mb: 1,
        }}
      >
        All done!
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "#64748b",
          mb: 2,
        }}
      >
        You've seen everyone nearby
      </Typography>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>
            {likedCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Liked
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#ef4444' }}>
            {passedCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Passed
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        onClick={onBack}
        startIcon={<ArrowLeft size={18} />}
        sx={{
          py: 1.5,
          px: 4,
          borderRadius: "14px",
          fontSize: "1rem",
          fontWeight: 600,
          textTransform: "none",
          background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)",
          boxShadow: "0 8px 24px rgba(108,92,231,0.4)",
        }}
      >
        Back to Nearby
      </Button>
    </Box>
  );
}

/* ------------------------------ Main Screen ------------------------------- */
export default function ViewNearbyPeopleScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from NearbyScreen navigation (if coming from radar screen)
  const { liveNowCount = 0, scanCompleted = false } = location.state || {};
  
  // Global store for liked profiles (YOU LIKE tab)
  const { addLikedProfile, addLikedUser, removeLikedProfile } = useHomeDeckStore();
  
  // States - load cards directly, no scanning
  const [people, setPeople] = useState(MOCK_NEARBY_PEOPLE);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedPeople, setSwipedPeople] = useState({ liked: [], passed: [] });
  const [isEmpty, setIsEmpty] = useState(false);
  const [isAllDone, setIsAllDone] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(true);
  const [liveCount, setLiveCount] = useState(MOCK_NEARBY_PEOPLE.length);
  const [matchPerson, setMatchPerson] = useState(null); // Person we matched with
  const [showTutorial, setShowTutorial] = useState(false); // Tutorial dialog
  const [showNearbyMoment, setShowNearbyMoment] = useState(false); // Nearby match moment
  const [nearbyMomentPerson, setNearbyMomentPerson] = useState(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false); // Invitation modal
  const [invitationPerson, setInvitationPerson] = useState(null);

  // Scan for nearby people
  const handleScan = useCallback(() => {
    if (isScanning) return;
    
    setIsScanning(true);
    trackEvent("nearby_scan_started");
    
    if (navigator?.vibrate) navigator.vibrate([10, 40, 10]);
    
    // Simulate scanning delay (1.5-2 seconds)
    setTimeout(() => {
      const foundCount = Math.floor(Math.random() * 4) + MOCK_NEARBY_PEOPLE.length - 2; // Random 4-8 people
      const mockPeople = MOCK_NEARBY_PEOPLE.slice(0, Math.min(foundCount, MOCK_NEARBY_PEOPLE.length));
      
      setLiveCount(mockPeople.length);
      setPeople(mockPeople);
      setCurrentIndex(0);
      setSwipedPeople({ liked: [], passed: [] });
      setIsAllDone(false);
      setIsEmpty(mockPeople.length === 0);
      setHasScanned(true);
      setIsScanning(false);
      
      trackEvent("nearby_scan_completed", { count: mockPeople.length });
    }, 1800);
  }, [isScanning]);

  // Track page view
  useEffect(() => {
    trackEvent("nearby_results_viewed", { count: people.length });
  }, []);

  // Handle swipe action
  const handleSwipe = useCallback((direction, person) => {
    if (navigator?.vibrate) navigator.vibrate(10);
    
    if (direction === 'right') {
      trackEvent("nearby_swipe_right", { personId: person.id });
      setSwipedPeople(prev => ({
        ...prev,
        liked: [...prev.liked, person]
      }));
      
      // Add to global store for YOU LIKE tab
      addLikedUser(person.id);
      
      // Check for mutual like (match!)
      if (person.likesYou) {
        trackEvent("match_created", { personId: person.id });
        if (navigator?.vibrate) navigator.vibrate([50, 50, 100]);
        // Remove from likedProfiles since it's now a match
        removeLikedProfile(person.id);
        setMatchPerson(person);
        return; // Don't move to next card yet - show match screen first
      } else {
        // Not a match yet - add full profile to YOU LIKE tab
        addLikedProfile({
          id: person.id,
          name: person.firstName,
          age: person.age,
          distance: person.distance,
          city: person.city,
          photoUrl: person.photos?.[0] || '',
          photos: person.photos || [],
          verified: person.verified,
          interests: person.tags || [],
          profession: person.profession,
          tagline: person.tagline,
          aboutMe: person.aboutMe || [],
          lookingFor: person.lookingFor || [],
          status: 'you_liked',
        });
      }
    } else {
      trackEvent("nearby_swipe_left", { personId: person.id });
      setSwipedPeople(prev => ({
        ...prev,
        passed: [...prev.passed, person]
      }));
    }

    // Move to next card
    setTimeout(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= people.length) {
          setIsAllDone(true);
        }
        return nextIndex;
      });
    }, 200);
  }, [people.length, addLikedUser, addLikedProfile, removeLikedProfile]);

  useEffect(() => {
    if (!matchPerson) return;
    try {
      window.dispatchEvent(
        new CustomEvent('pulse:show_match', {
          detail: {
            match: {
              id: matchPerson.id,
              name: matchPerson.name,
              firstName: matchPerson.firstName || matchPerson.name,
              photo: matchPerson.photos?.[0],
              photos: matchPerson.photos,
            },
            copy: {
              title: "It's a Match",
              subtitle: "You're in sync",
              description: 'Something real can happen now',
              matchedLine: `You and ${matchPerson.name || matchPerson.firstName} matched!`,
              primaryCta: 'Start chat',
              secondaryCta: 'Keep browsing',
              tertiaryCta: 'Suggest meeting',
            },
            onLater: () => {
              // Continue browsing - same behavior as previous overlay
              setTimeout(() => {
                setCurrentIndex((prev) => {
                  const nextIndex = prev + 1;
                  if (nextIndex >= people.length) {
                    setIsAllDone(true);
                  }
                  return nextIndex;
                });
              }, 200);
            },
            onTertiary: () => {
              handleOpenInvitation(matchPerson);
            },
          },
        })
      );
    } catch {
      // ignore
    }
    setMatchPerson(null);
  }, [matchPerson]);

  // Handle button actions
  const handlePass = useCallback(() => {
    if (currentIndex < people.length) {
      handleSwipe('left', people[currentIndex]);
    }
  }, [currentIndex, people, handleSwipe]);

  const handleLike = useCallback(() => {
    if (currentIndex < people.length) {
      handleSwipe('right', people[currentIndex]);
    }
  }, [currentIndex, people, handleSwipe]);

  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsAllDone(false);
      // Remove last swiped person from the appropriate list
      setSwipedPeople(prev => {
        const lastLiked = prev.liked[prev.liked.length - 1];
        const lastPassed = prev.passed[prev.passed.length - 1];
        const lastPerson = people[currentIndex - 1];
        
        if (lastLiked && lastLiked.id === lastPerson?.id) {
          return { ...prev, liked: prev.liked.slice(0, -1) };
        } else if (lastPassed && lastPassed.id === lastPerson?.id) {
          return { ...prev, passed: prev.passed.slice(0, -1) };
        }
        return prev;
      });
    }
  }, [currentIndex, people]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate("/nearby");
  }, [navigate]);

  // Handle match screen actions
  const handleStartChat = useCallback(() => {
    if (matchPerson) {
      trackEvent("match_start_chat", { personId: matchPerson.id });
      navigate(`/chat/${matchPerson.id}`);
    }
  }, [navigate, matchPerson]);

  const handleKeepSwiping = useCallback(() => {
    setMatchPerson(null);
    // Move to next card after dismissing match
    setTimeout(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= people.length) {
          setIsAllDone(true);
        }
        return nextIndex;
      });
    }, 200);
  }, [people.length]);

  // Handle Nearby Match Moment - per spec: "invitation, not gate"
  const handleNearbyMomentChat = useCallback(() => {
    if (nearbyMomentPerson) {
      trackEvent("nearby_moment_chat_started", { personId: nearbyMomentPerson.id });
      navigate(`/chat/${nearbyMomentPerson.id}`);
    }
    setShowNearbyMoment(false);
  }, [navigate, nearbyMomentPerson]);

  const handleNearbyMomentContinue = useCallback(() => {
    trackEvent("nearby_moment_continued_browsing");
    setShowNearbyMoment(false);
  }, []);

  // Handle Invitation Modal - per spec: "two equal paths"
  const handleOpenInvitation = useCallback((person) => {
    setInvitationPerson(person);
    setShowInvitationModal(true);
  }, []);

  const handleSendInvitation = useCallback((invitation) => {
    trackEvent("invitation_sent", { 
      type: invitation.type, 
      personId: invitation.person.id,
      hasVenue: !!invitation.venue,
    });
    // Navigate to chat with invitation context
    navigate(`/chat/${invitation.person.id}`);
    setShowInvitationModal(false);
  }, [navigate]);

  // Empty state
  if (isEmpty) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fafbfc",
        }}
      >
        <EmptyState onBack={handleBack} />
      </Box>
    );
  }

  // All done state
  if (isAllDone) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fafbfc",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            backgroundColor: "#fff",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              People nearby
            </Typography>
          </Box>
          <IconButton
            onClick={() => setShowTutorial(true)}
            sx={{
              color: '#6C5CE7',
              backgroundColor: 'rgba(108,92,231,0.08)',
            }}
          >
            <HelpCircle size={20} />
          </IconButton>
        </Box>
        <AllDoneState 
          onBack={handleBack}
          likedCount={swipedPeople.liked.length}
          passedCount={swipedPeople.passed.length}
        />
      </Box>
    );
  }

  const currentPerson = people[currentIndex];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fafbfc",
        position: "relative",
      }}
    >
      {/* Match Screen Overlay */}
      <AnimatePresence>
        {false && matchPerson && (
          <MatchScreen
            person={matchPerson}
            onStartChat={handleStartChat}
            onKeepSwiping={handleKeepSwiping}
            onSuggestMeeting={(person) => {
              setMatchPerson(null);
              handleOpenInvitation(person);
            }}
          />
        )}
      </AnimatePresence>

      {/* Nearby Match Moment - per spec: calm invitation */}
      <NearbyMatchMoment
        isOpen={showNearbyMoment}
        person={nearbyMomentPerson}
        onClose={() => setShowNearbyMoment(false)}
        onStartChat={handleNearbyMomentChat}
        onContinueBrowsing={handleNearbyMomentContinue}
      />

      {/* Invitation Modal - per spec: two equal paths */}
      <InvitationModal
        isOpen={showInvitationModal}
        person={invitationPerson}
        onClose={() => setShowInvitationModal(false)}
        onSendInvitation={handleSendInvitation}
      />
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          backgroundColor: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#1a1a2e', fontWeight: 600 }}>
            {currentIndex + 1} / {people.length}
          </Typography>
          {/* Scan button */}
          <IconButton
            onClick={handleScan}
            disabled={isScanning}
            sx={{
              backgroundColor: 'rgba(108,92,231,0.1)',
              color: '#6C5CE7',
              '&:hover': {
                backgroundColor: 'rgba(108,92,231,0.15)',
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            <motion.div
              animate={isScanning ? { rotate: 360 } : { rotate: 0 }}
              transition={isScanning ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
            >
              <Radar size={20} />
            </motion.div>
          </IconButton>
        </Box>
      </Box>

      {/* Scanning Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255,255,255,0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            >
              <Radar size={64} color="#6C5CE7" />
            </motion.div>
            <Typography
              variant="h6"
              sx={{ mt: 3, fontWeight: 700, color: '#1a1a2e' }}
            >
              Scanning nearby...
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: '#64748b' }}
            >
              Looking for people around you
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack */}
      <Box 
        sx={{ 
          flex: 1, 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Card container */}
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
              <SwipeableCard
                key={currentPerson.id}
                person={currentPerson}
                onSwipe={handleSwipe}
                isActive={true}
              />
            )}
          </AnimatePresence>
        </Box>

        {/* Action buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
            py: 3,
          }}
        >
          {/* Pass button */}
          <IconButton
            onClick={handlePass}
            sx={{
              width: 64,
              height: 64,
              backgroundColor: '#fff',
              boxShadow: '0 4px 20px rgba(239,68,68,0.25)',
              border: '2px solid #ef4444',
              '&:hover': {
                backgroundColor: 'rgba(239,68,68,0.05)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <X size={32} color="#ef4444" />
          </IconButton>

          {/* Like button */}
          <IconButton
            onClick={handleLike}
            sx={{
              width: 64,
              height: 64,
              backgroundColor: '#10b981',
              boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
              '&:hover': {
                backgroundColor: '#059669',
                transform: 'scale(1.05)',
              },
            }}
          >
            <Heart size={32} color="#fff" fill="#fff" />
          </IconButton>
        </Box>
      </Box>

      {/* Tutorial Dialog */}
      <Dialog
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            maxWidth: 360,
            width: '100%',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, textAlign: 'center' }}>
          How Swipe Works
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            {/* Step 1 */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>👆</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Tap on photos
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Tap left/right on photos to see more pictures
              </Typography>
            </Box>

            {/* Step 2 */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>👈 👉</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Swipe to decide
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Swipe right to like, left to pass
              </Typography>
            </Box>

            {/* Step 3 */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>💚</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                It's a Match!
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                When you both like each other, you can start chatting!
              </Typography>
            </Box>

            {/* Step 4 */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>📡</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Scan again
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Tap the radar icon to find more people nearby
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowTutorial(false)}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
