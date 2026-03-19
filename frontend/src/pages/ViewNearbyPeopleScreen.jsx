// ViewNearbyPeopleScreen.jsx - Swipeable Cards
// Shows one card at a time - swipe right to like, left to pass

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowLeft, MapPin, Sparkles, X, Heart, Ruler, Wine, PawPrint, Baby, ShieldCheck, HeartHandshake, Sun, Smile, Radar, HelpCircle } from "lucide-react";
import { NearbyMatchMoment, InvitationModal } from "../components/nearby";
import MapView from "../components/MapView";
import { ProfileTimeline } from "../components/timeline";
import SwipeWrapper, { SwipeLabels } from "../components/SwipeWrapper";
import useHomeDeckStore from "../store/homeDeckStore";
import { demoUsers } from "../data/demoUsers";
import useNearbyPeopleStore from "../store/nearbyPeopleStore";
import { buildPulseMagic, getViewerSignalsFromStorage, sanitizeNoProximityText } from "../utils/pulseMagic";

/* ------------------------------ Constants --------------------------------- */
const SAFE_BOTTOM = 'calc(88px + env(safe-area-inset-bottom, 0px))';
const SWIPE_THRESHOLD = 100; // px to trigger swipe action
const NEARBY_MOMENT_KEEP_BROWSING_COUNT_KEY = 'pulse_nearby_moment_keep_browsing_count';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

const normalizeNearbyPerson = (user, index = 0) => {
  const id = user?.id ?? index;
  const firstName = user?.firstName || user?.first_name || user?.name || "";
  const photos = Array.isArray(user?.photos) ? user.photos : [];
  const interests = Array.isArray(user?.interests) ? user.interests : (Array.isArray(user?.tags) ? user.tags : []);
  const lookingForRaw = user?.lookingFor ?? user?.looking_for;

  return {
    id,
    firstName,
    age: user?.age,
    city: user?.location || user?.city || user?.residence || "",
    tags: interests,
    status: user?.status,
    aboutMoment: user?.aboutMoment ?? null,
    profession: user?.profession,
    tagline: user?.tagline || user?.bio,
    aboutMe: Array.isArray(user?.aboutMe) ? user.aboutMe : [],
    lookingFor: Array.isArray(user?.lookingFor)
      ? user.lookingFor
      : (typeof lookingForRaw === 'string' && lookingForRaw ? [lookingForRaw] : []),
    photos,
    verified: !!user?.verified,
    likesYou: !!user?.likesYou,
    hasEvent: !!user?.hasEvent,
    eventId: user?.eventId,
    isOnline: user?.isOnline || false, // Only show "Live now" if actually online
  };
};

// Transform nearby person to ProfileTimeline format (same as Home page)
const transformToUserCardModel = (person) => ({
  id: person.id,
  userId: String(person.id),
  firstName: person.firstName,
  age: person.age,
  distanceMeters: person.distanceMeters || null,
  primaryPhotoUrl: person.photos?.[0] || '',
  photos: person.photos || [],
  liveStatus: person.isOnline ? person.aboutMoment || 'Online now' : (person.aboutMoment || null),
  primaryRole: person.profession || null,
  topInterests: person.tags?.slice(0, 3).map(tag => ({
    label: typeof tag === 'string' ? tag : tag.label,
    icon: null
  })) || null,
  contextLine: person.tagline || person.profession || 'Looking for genuine connections',
  height: null,
  drinking: null,
  professionalField: null,
  isVerified: person.verified || false,
  isMatch: false,
  likesYou: person.likesYou || false,
  bio: person.tagline || '',
  occupation: person.profession,
  education: null,
  gender: null,
  location: person.city,
  hometown: null,
  interests: person.tags,
  lookingFor: person.lookingFor,
  qualities: person.qualities || null,
  causes: null,
  exercise: null,
  smoking: null,
  kids: null,
  starSign: null,
  politics: null,
  languages: null,
  spotifyPlaylists: null,
  userRhythm: null,
  weeklyRhythm: null,
  weeklyTimeline: null,
  // Prompts (displayed after each photo)
  prompts: person.prompts || [],
  introLine: person.introLine || (person.prompts?.[0]?.answer) || null,
  _original: person,
});

// Use shared demo users from data file (same as Home page)
// MANDATORY: 4+ photos per user (app requirement)
const MOCK_NEARBY_PEOPLE = demoUsers;

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
function SwipeableCard({ person, onSwipe, isActive, viewerSignals }) {
  const isLive = person.status === "Live now";
  const photos = person.photos || [];
  const [photoIndex, setPhotoIndex] = useState(0);
  const [pulseMagicOpen, setPulseMagicOpen] = useState(false);
  const pulseMagic = useMemo(() => buildPulseMagic(person, viewerSignals), [person, viewerSignals]);
  const aboutMomentSafe = useMemo(() => sanitizeNoProximityText(person?.aboutMoment), [person?.aboutMoment]);

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
                {person.city}
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
            {pulseMagic?.vibeLine && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 0.5 }}>
                <Box sx={{ color: '#6C5CE7', display: 'flex', alignItems: 'center', pt: '2px' }}>
                  <Sparkles size={14} />
                </Box>
                <Typography sx={{ color: '#1a1a2e', fontSize: '0.78rem', lineHeight: 1.25, flex: 1 }}>
                  {pulseMagic.vibeLine}
                </Typography>
                {pulseMagic?.insights?.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPulseMagicOpen(true);
                    }}
                    sx={{ p: 0.25, mt: '-2px' }}
                    aria-label="Pulse Magic details"
                  >
                    <HelpCircle size={16} color="#64748b" />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>

          {/* Row 2: About the moment - inline */}
          {aboutMomentSafe && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.5, px: 1, borderRadius: 2, bgcolor: 'rgba(34,197,94,0.08)' }}>
              <Typography sx={{ color: "#10b981", fontWeight: 600, fontSize: '0.7rem' }}>📍</Typography>
              <Typography sx={{ color: "#1a1a2e", fontSize: '0.75rem' }}>{aboutMomentSafe}</Typography>
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

        <Dialog
          open={pulseMagicOpen}
          onClose={() => setPulseMagicOpen(false)}
          sx={{ zIndex: 10000 }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#1a1a2e' }}>
            Pulse Magic
          </DialogTitle>
          <DialogContent
            sx={{ pt: 0.5 }}
          >
            {pulseMagic?.vibeLine && (
              <Typography sx={{ color: '#1a1a2e', fontWeight: 700, mb: 1 }}>
                {pulseMagic.vibeLine}
              </Typography>
            )}
            {(pulseMagic?.insights || []).slice(0, 3).map((t, idx) => (
              <Typography key={idx} variant="body2" sx={{ color: '#64748b', mb: 0.75 }}>
                {idx + 1}. {t}
              </Typography>
            ))}
          </DialogContent>
          <DialogActions sx={{ px: 2.5, pb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setPulseMagicOpen(false)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, bgcolor: '#6C5CE7', '&:hover': { bgcolor: '#5a4ee0' } }}
            >
              Got it
            </Button>
          </DialogActions>
        </Dialog>
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
        Back
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
        You've seen everyone for now
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
        Back
      </Button>
    </Box>
  );
}

/* ------------------------------ Main Screen ------------------------------- */
export default function ViewNearbyPeopleScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const viewerSignals = useMemo(() => getViewerSignalsFromStorage(), []);

  const [nearbyMomentNudgeOpen, setNearbyMomentNudgeOpen] = useState(false);
  const [nearbyMomentNudgePerson, setNearbyMomentNudgePerson] = useState(null);
  
  // Get data from NearbyScreen navigation (if coming from radar screen)
  const { liveNowCount = 0, scanCompleted = false, scanRequestedAt } = location.state || {};
  
  // Global store for liked profiles (YOU LIKE tab) and mutual matches
  const { addLikedProfile, addLikedUser, removeLikedProfile, addMutualMatch } = useHomeDeckStore();
  
  // States - load cards directly, no scanning
  const [people, setPeople] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedPeople, setSwipedPeople] = useState({ liked: [], passed: [] });
  const [isEmpty, setIsEmpty] = useState(false);
  const [isAllDone, setIsAllDone] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [liveCount, setLiveCount] = useState(MOCK_NEARBY_PEOPLE.length);
  const [matchPerson, setMatchPerson] = useState(null); // Person we matched with
  const [showTutorial, setShowTutorial] = useState(false); // Tutorial dialog
  const [showNearbyMoment, setShowNearbyMoment] = useState(false); // Nearby match moment
  const [nearbyMomentPerson, setNearbyMomentPerson] = useState(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false); // Invitation modal
  const [invitationPerson, setInvitationPerson] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0); // Track swipe offset for labels

  const [viewMode, setViewMode] = useState('browse');

  const viewerId = String(localStorage.getItem('userId') || 'anonymous');
  const scan = useNearbyPeopleStore((s) => s.scanByViewer?.[viewerId] || null);
  const setScan = useNearbyPeopleStore((s) => s.setScan);
  const isSuppressedStore = useNearbyPeopleStore((s) => s.isSuppressed);
  const viewerExposure = useNearbyPeopleStore((s) => s.exposureByViewer?.[viewerId] || null);
  const markShown = useNearbyPeopleStore((s) => s.markShown);
  const markInteracted = useNearbyPeopleStore((s) => s.markInteracted);
  const [radiusMeters, setRadiusMeters] = useState(() => {
    const fromNav = location.state?.radiusMeters;
    if (typeof fromNav === 'number') return fromNav;
    if (typeof scan?.lastRadiusMeters === 'number') return scan.lastRadiusMeters;
    return 1000;
  });

  useEffect(() => {
    const nextRadius = location.state?.radiusMeters;
    if (typeof nextRadius === 'number' && nextRadius !== radiusMeters) {
      setRadiusMeters(nextRadius);
    }
  }, [location.state, radiusMeters]);

  const isSuppressed = useCallback(
    (candidateId) => isSuppressedStore(viewerId, candidateId),
    [isSuppressedStore, viewerId]
  );

  const runScan = useCallback(async () => {
    if (isScanning) return;

    const now = Date.now();
    const seenIds = new Set(
      Object.entries(viewerExposure || {})
        .filter(([, record]) => typeof record?.lastShownAt === 'number')
        .map(([candidateId]) => String(candidateId))
    );
    setIsScanning(true);
    trackEvent("nearby_scan_started", { radiusMeters });
    if (navigator?.vibrate) navigator.vibrate([10, 40, 10]);

    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (viewerId && viewerId !== 'anonymous') params.set('user_id', viewerId);
      params.set('radius_meters', String(radiusMeters));

      const response = await fetch(`/api/nearby-users?${params.toString()}`);
      let nextPeople;

      if (response.ok) {
        const data = await response.json();
        const rawUsers = Array.isArray(data?.users) ? data.users : [];
        nextPeople = rawUsers
          .map((u, i) => {
            const normalized = normalizeNearbyPerson(u, i);
            return {
              ...normalized,
              verified: normalized.verified || true,
              likesYou: typeof normalized.likesYou === 'boolean' ? normalized.likesYou : (Number(normalized.id) % 5 === 0),
            };
          })
          .filter((p) => p && p.id != null)
          .filter((p) => !isSuppressed(p.id));
      } else {
        nextPeople = MOCK_NEARBY_PEOPLE.map((p, i) => normalizeNearbyPerson(p, i)).filter((p) => !isSuppressed(p.id));
      }

      if (!Array.isArray(nextPeople)) nextPeople = [];

      const fresh = [];
      const existing = [];
      nextPeople.forEach((p) => {
        const key = String(p?.id);
        if (seenIds.has(key)) existing.push(p);
        else fresh.push(p);
      });
      nextPeople = [...fresh, ...existing];

      setLiveCount(nextPeople.length);
      setPeople(nextPeople);
      setCurrentIndex(0);
      setSwipedPeople({ liked: [], passed: [] });
      setIsAllDone(false);
      setIsEmpty(nextPeople.length === 0);
      setHasScanned(true);

      setScan(viewerId, { lastScanAt: now, radiusMeters, results: nextPeople });
      trackEvent("nearby_scan_completed", { count: nextPeople.length, radiusMeters });
    } catch (error) {
      console.error('[Nearby] scan failed', error);
      const fallback = MOCK_NEARBY_PEOPLE.map((p, i) => normalizeNearbyPerson(p, i)).filter((p) => !isSuppressed(p.id));
      const fresh = [];
      const existing = [];
      fallback.forEach((p) => {
        const key = String(p?.id);
        if (seenIds.has(key)) existing.push(p);
        else fresh.push(p);
      });
      const orderedFallback = [...fresh, ...existing];
      setLiveCount(fallback.length);
      setPeople(orderedFallback);
      setCurrentIndex(0);
      setSwipedPeople({ liked: [], passed: [] });
      setIsAllDone(false);
      setIsEmpty(fallback.length === 0);
      setHasScanned(true);
      setScan(viewerId, { lastScanAt: now, radiusMeters, results: orderedFallback });
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, radiusMeters, viewerExposure, viewerId, setScan, isSuppressed]);

  const handleScan = useCallback(() => {
    runScan();
  }, [runScan]);

  // DEV: Force Maya to appear first for testing venues integration
  useEffect(() => {
    const maya = MOCK_NEARBY_PEOPLE.find(p => p.firstName === 'Maya' && p.likesYou);
    console.log('[ViewNearbyPeopleScreen] Found Maya:', maya?.firstName, 'likesYou:', maya?.likesYou);
    if (maya) {
      const normalized = normalizeNearbyPerson(maya, 0);
      console.log('[ViewNearbyPeopleScreen] Normalized Maya likesYou:', normalized.likesYou);
      const testPeople = [normalized, ...MOCK_NEARBY_PEOPLE.filter(p => p.id !== maya.id).map((p, i) => normalizeNearbyPerson(p, i + 1))];
      console.log('[ViewNearbyPeopleScreen] Test people:', testPeople.map(p => ({ name: p.firstName, likesYou: p.likesYou })));
      setPeople(testPeople);
      setCurrentIndex(0);
      setHasScanned(true);
      setLiveCount(testPeople.length);
    }
  }, []);

  useEffect(() => {
    const cachedResults = scan?.results;
    const hasCached = Array.isArray(cachedResults) && cachedResults.length > 0;
    const shouldAttemptNewScan =
      typeof scanRequestedAt === 'number' &&
      (typeof scan?.lastScanAt !== 'number' || scanRequestedAt > scan.lastScanAt);

    if (shouldAttemptNewScan) {
      // Skip auto-scan for dev testing
      // runScan();
      return;
    }

    if (hasCached) {
      setPeople(cachedResults);
      setLiveCount(cachedResults.length);
      setHasScanned(true);
      return;
    }

    if (scanCompleted) {
      runScan();
      return;
    }

    setHasScanned(false);
  }, [scanCompleted, scanRequestedAt, scan?.lastScanAt, scan?.results, runScan]);

  // Track page view
  useEffect(() => {
    trackEvent("nearby_results_viewed", { count: people.length });
  }, []);

  // Handle swipe action
  const handleSwipe = useCallback((direction, person) => {
    if (navigator?.vibrate) navigator.vibrate(10);

    if (person?.id != null) {
      markInteracted(viewerId, person.id);
    }
    
    if (direction === 'right') {
      trackEvent("nearby_swipe_right", { personId: person.id });
      console.log('[ViewNearbyPeopleScreen] Swipe right on:', person.firstName, 'likesYou:', person.likesYou);
      setSwipedPeople(prev => ({
        ...prev,
        liked: [...prev.liked, person]
      }));
      
      // Add to global store for YOU LIKE tab
      addLikedUser(person.id);
      
      // Check for mutual like (match!)
      console.log('[ViewNearbyPeopleScreen] Checking for match - person.likesYou:', person.likesYou, 'person:', person);
      if (person.likesYou) {
        trackEvent("match_created", { personId: person.id });
        if (navigator?.vibrate) navigator.vibrate([50, 50, 100]);
        // Remove from likedProfiles since it's now a match
        removeLikedProfile(person.id);
        
        // Create match profile with all user data for consistent display
        const matchProfile = {
          id: person.id,
          name: person.firstName || person.name,
          firstName: person.firstName || person.name,
          age: person.age,
          distance: person.distance,
          city: person.city,
          location: person.location || person.city,
          photoUrl: person.photos?.[0] || '',
          photos: person.photos || [],
          verified: person.verified,
          interests: person.tags || person.interests || [],
          tags: person.tags || person.interests || [],
          profession: person.profession,
          education: person.education,
          tagline: person.tagline,
          bio: person.bio,
          aboutMe: person.aboutMe || [],
          lookingFor: person.lookingFor || [],
          qualities: person.qualities || [],
          height: person.height,
          drinking: person.drinking,
          smoking: person.smoking,
          kids: person.kids,
          exercise: person.exercise,
          starSign: person.starSign,
          languages: person.languages || [],
        };
        
        console.log('[ViewNearbyPeopleScreen] Creating match for:', matchProfile.name, matchProfile.id);
        
        // Add to MUTUAL MATCHES tab (store)
        addMutualMatch(matchProfile);
        console.log('[ViewNearbyPeopleScreen] Added to store');
        
        // Also save to localStorage for persistence
        try {
          const existingMatches = JSON.parse(localStorage.getItem('pulse_matches') || '[]');
          console.log('[ViewNearbyPeopleScreen] Existing matches in localStorage:', existingMatches.length);
          if (!existingMatches.find(m => m.id === matchProfile.id)) {
            existingMatches.unshift(matchProfile);
            localStorage.setItem('pulse_matches', JSON.stringify(existingMatches));
            console.log('[ViewNearbyPeopleScreen] Saved to localStorage, new count:', existingMatches.length);
            // Dispatch custom event for same-tab listeners
            window.dispatchEvent(new CustomEvent('pulse:matches_updated'));
          } else {
            console.log('[ViewNearbyPeopleScreen] Match already exists in localStorage');
          }
        } catch (e) {
          console.error('[ViewNearbyPeopleScreen] Failed to save match to localStorage:', e);
        }
        
        setMatchPerson(person);
        return; // Don't move to next card yet - show match screen first
      } else {
        // Not a match yet - add full profile to YOU LIKE tab
        addLikedProfile({
          id: person.id,
          name: person.firstName || person.name,
          firstName: person.firstName || person.name,
          age: person.age,
          distance: person.distance,
          city: person.city,
          location: person.location || person.city,
          photoUrl: person.photos?.[0] || '',
          photos: person.photos || [],
          verified: person.verified,
          interests: person.tags || person.interests || [],
          tags: person.tags || person.interests || [],
          profession: person.profession,
          education: person.education,
          tagline: person.tagline,
          bio: person.bio,
          aboutMe: person.aboutMe || [],
          lookingFor: person.lookingFor || [],
          qualities: person.qualities || [],
          height: person.height,
          drinking: person.drinking,
          smoking: person.smoking,
          kids: person.kids,
          exercise: person.exercise,
          starSign: person.starSign,
          languages: person.languages || [],
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
  }, [people.length, addLikedUser, addLikedProfile, removeLikedProfile, markInteracted, viewerId]);

  useEffect(() => {
    const p = people?.[currentIndex];
    if (!p || p.id == null) return;
    markShown(viewerId, p.id);
  }, [people, currentIndex, markShown, viewerId]);

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

  const mapProfiles = people.map((p) => ({
    id: p.id,
    name: p.firstName,
    photo: p.photos?.[0] || '',
    distance: Math.max(120, Math.min(400, Math.round(radiusMeters / 5))),
  }));

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

    try {
      const raw = localStorage.getItem(NEARBY_MOMENT_KEEP_BROWSING_COUNT_KEY);
      const current = raw ? parseInt(raw, 10) : 0;
      const next = Number.isFinite(current) ? current + 1 : 1;

      if (next >= 2 && nearbyMomentPerson) {
        localStorage.setItem(NEARBY_MOMENT_KEEP_BROWSING_COUNT_KEY, '0');
        setNearbyMomentNudgePerson(nearbyMomentPerson);
        setNearbyMomentNudgeOpen(true);
      } else {
        localStorage.setItem(NEARBY_MOMENT_KEEP_BROWSING_COUNT_KEY, String(next));
      }
    } catch {
      // ignore
    }
  }, [nearbyMomentPerson]);

  const handleNearbyMomentNudgeSayHello = useCallback(() => {
    const p = nearbyMomentNudgePerson;
    setNearbyMomentNudgeOpen(false);
    if (p?.id != null) {
      navigate(`/chat/${p.id}`);
    }
  }, [navigate, nearbyMomentNudgePerson]);

  const handleNearbyMomentNudgeKeepBrowsing = useCallback(() => {
    setNearbyMomentNudgeOpen(false);
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
    
    // Store invitation in localStorage so ChatScreen can pick it up and create the message
    const pendingInvite = {
      id: `invite_${Date.now()}`,
      type: invitation.type,
      venue: invitation.venue,
      message: invitation.message,
      personId: invitation.person.id,
      personName: invitation.person.firstName || invitation.person.name,
      createdAt: Date.now(),
    };
    localStorage.setItem('pulse_pending_meeting_invite', JSON.stringify(pendingInvite));
    
    // Navigate to chat with invitation context
    navigate(`/chat/${invitation.person.id}?meetingInvite=true`);
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
              People
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
  const nextPerson = people[currentIndex + 1] || null;

  return (
    <>
      {/* Swipe Labels - NOPE/LIKE */}
      <SwipeLabels swipeOffset={swipeOffset} />
      
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

      <Dialog
        open={nearbyMomentNudgeOpen}
        onClose={handleNearbyMomentNudgeKeepBrowsing}
        sx={{ zIndex: 10000 }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1a1a2e' }}>
          Gentle nudge
        </DialogTitle>
        <DialogContent sx={{ pt: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            No pressure. If you’re curious, one hello to {nearbyMomentNudgePerson?.firstName || 'them'} can be enough.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            variant="text"
            onClick={handleNearbyMomentNudgeKeepBrowsing}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
          >
            Keep browsing
          </Button>
          <Button
            variant="contained"
            onClick={handleNearbyMomentNudgeSayHello}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, bgcolor: '#6C5CE7', '&:hover': { bgcolor: '#5a4ee0' } }}
          >
            Say hello
          </Button>
        </DialogActions>
      </Dialog>

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

{/* Map toggle removed per user request */}
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
              Scanning...
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: '#64748b' }}
            >
              Finding people to browse
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
        {viewMode === 'map' ? (
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {hasScanned && people.length > 0 ? (
              <MapView profiles={mapProfiles} showUserMarker={false} />
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Run a scan to see the map</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              position: 'relative',
              maxWidth: 520,
              width: '100%',
              mx: 'auto',
              overflow: 'auto',
              bgcolor: '#fff',
              // Hide scrollbar but keep scroll functionality
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
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
                  user={transformToUserCardModel(nextPerson)}
                  hideUndo={true}
                />
              </Box>
            )}
            {/* Active Card - Draggable foreground card */}
            {currentPerson && (
              <Box sx={{ position: 'relative', zIndex: 2 }}>
              <SwipeWrapper
                key={`swipe-${currentPerson.id}`}
                onSwipeRight={handleLike}
                onSwipeLeft={handlePass}
                onOffsetChange={setSwipeOffset}
              >
                <Box sx={{ pointerEvents: 'auto' }}>
                  <ProfileTimeline
                    user={transformToUserCardModel(currentPerson)}
                    onLike={handleLike}
                    onPass={handlePass}
                    onUndo={handleUndo}
                    canUndo={currentIndex > 0}
                    hideUndo={false}
                  />
                </Box>
              </SwipeWrapper>
              </Box>
            )}
          </Box>
        )}
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
                Tap the radar icon to refresh results
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
    </>
  );
}
