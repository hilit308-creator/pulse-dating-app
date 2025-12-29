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
import { ArrowLeft, MapPin, Sparkles, X, Heart, RotateCcw, Ruler, Wine, PawPrint, Baby, ShieldCheck, HeartHandshake, Sun, Smile, Radar, RefreshCw, MessageCircle, HelpCircle } from "lucide-react";

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
            height: "65%",
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

        {/* Content below photo */}
        <Box sx={{ p: 2.5, height: '35%', overflow: 'auto' }}>
          {/* Profession */}
          {person.profession && (
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
              {person.profession}
            </Typography>
          )}

          {/* Tagline */}
          {person.tagline && (
            <Typography variant="body2" sx={{ color: "#1a1a2e", mt: 0.75, mb: 1.5 }}>
              {person.tagline}
            </Typography>
          )}

          {/* About the moment (optional) */}
          {person.aboutMoment && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: "12px",
                backgroundColor: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.15)",
                mb: 1.5,
              }}
            >
              <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 600, display: "block", mb: 0.25 }}>
                Right now
              </Typography>
              <Typography variant="body2" sx={{ color: "#1a1a2e" }}>
                {person.aboutMoment}
              </Typography>
            </Box>
          )}

          {/* Details section */}
          {person.aboutMe && person.aboutMe.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.75, fontSize: '0.8rem' }}>
                Details
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {person.aboutMe.map((item, i) => (
                  <DetailPill key={i} text={item} />
                ))}
              </Box>
            </Box>
          )}

          {/* Interests */}
          {person.tags && person.tags.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.75, fontSize: '0.8rem' }}>
                Interests
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {person.tags.map((tag, i) => (
                  <Box
                    key={i}
                    sx={{
                      px: 1.25,
                      py: 0.4,
                      borderRadius: 999,
                      backgroundColor: "rgba(108,92,231,0.08)",
                      border: "1px solid rgba(108,92,231,0.15)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#6C5CE7", fontWeight: 600, fontSize: '0.7rem' }}
                    >
                      {tag}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Looking for */}
          {person.lookingFor && person.lookingFor.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.75, fontSize: '0.8rem' }}>
                Looking for
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {person.lookingFor.map((item, i) => (
                  <LookingForPill key={i} text={item} />
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

// Match Screen - shown when there's a mutual like
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
      {/* Hearts animation */}
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

      {/* Title */}
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
          It's a Match!
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

      {/* Profile photos */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: -2, mb: 4 }}>
          {/* User photo (placeholder) */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: '4px solid #fff',
              backgroundColor: '#e0e0e0',
              backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              zIndex: 2,
            }}
          />
          {/* Match photo */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              border: '4px solid #fff',
              backgroundImage: `url(${person.photos?.[0] || ''})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              ml: -3,
              zIndex: 1,
            }}
          />
        </Box>
      </motion.div>

      {/* Buttons */}
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

      {/* Confetti effect */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              y: window.innerHeight + 20,
              rotate: Math.random() * 360,
              opacity: 0,
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
            style={{
              position: 'absolute',
              width: 10,
              height: 10,
              borderRadius: Math.random() > 0.5 ? '50%' : 0,
              backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#fff'][Math.floor(Math.random() * 5)],
            }}
          />
        ))}
      </Box>
    </motion.div>
  );
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
  
  // States
  const [people, setPeople] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedPeople, setSwipedPeople] = useState({ liked: [], passed: [] });
  const [isEmpty, setIsEmpty] = useState(false);
  const [isAllDone, setIsAllDone] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [liveCount, setLiveCount] = useState(liveNowCount);
  const [matchPerson, setMatchPerson] = useState(null); // Person we matched with
  const [showTutorial, setShowTutorial] = useState(false); // Tutorial dialog

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

  // Load data - either from NearbyScreen or auto-scan
  useEffect(() => {
    // If coming from NearbyScreen with scan data, use it
    if (scanCompleted && liveNowCount > 0) {
      const mockPeople = MOCK_NEARBY_PEOPLE.slice(0, Math.min(liveNowCount, MOCK_NEARBY_PEOPLE.length));
      setPeople(mockPeople);
      setLiveCount(mockPeople.length);
      setHasScanned(true);
      trackEvent("nearby_results_viewed", { count: mockPeople.length });
    } 
    // Otherwise auto-scan on first load
    else if (!hasScanned && !isScanning) {
      handleScan();
    }
  }, [scanCompleted, liveNowCount, hasScanned, isScanning, handleScan]);

  // Handle swipe action
  const handleSwipe = useCallback((direction, person) => {
    if (navigator?.vibrate) navigator.vibrate(10);
    
    if (direction === 'right') {
      trackEvent("nearby_swipe_right", { personId: person.id });
      setSwipedPeople(prev => ({
        ...prev,
        liked: [...prev.liked, person]
      }));
      
      // Check for mutual like (match!)
      if (person.likesYou) {
        trackEvent("match_created", { personId: person.id });
        if (navigator?.vibrate) navigator.vibrate([50, 50, 100]);
        setMatchPerson(person);
        return; // Don't move to next card yet - show match screen first
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
  }, [people.length]);

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
      navigate("/chat", { state: { matchPerson } });
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
            <IconButton onClick={handleBack} sx={{ color: "#1a1a2e" }}>
              <ArrowLeft size={22} />
            </IconButton>
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
        {matchPerson && (
          <MatchScreen
            person={matchPerson}
            onStartChat={handleStartChat}
            onKeepSwiping={handleKeepSwiping}
          />
        )}
      </AnimatePresence>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleBack} sx={{ color: "#1a1a2e" }}>
            <ArrowLeft size={22} />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e", lineHeight: 1.2 }}>
              People nearby
            </Typography>
            {liveCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {liveCount} live now
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
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
          {/* Help button - Tutorial */}
          <IconButton
            onClick={() => setShowTutorial(true)}
            sx={{
              color: '#6C5CE7',
              backgroundColor: 'rgba(108,92,231,0.08)',
              '&:hover': {
                backgroundColor: 'rgba(108,92,231,0.15)',
              },
            }}
          >
            <HelpCircle size={20} />
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
          {/* Undo button */}
          <IconButton
            onClick={handleUndo}
            disabled={currentIndex === 0}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#f8fafc',
              },
              '&:disabled': {
                opacity: 0.4,
              },
            }}
          >
            <RotateCcw size={22} color="#f59e0b" />
          </IconButton>

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
                It's a match!
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
