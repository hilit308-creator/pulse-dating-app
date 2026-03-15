// MatchesScreen.jsx
// Per spec: "Relationship management space" - calm, predictable, organized
// NOT designed to: create excitement, drive novelty, push decisions
// Must feel: calm, predictable, organized, trustworthy

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Stack,
  Tabs,
  Tab,
  Card,
  CardContent,
  Skeleton,
  IconButton,
  Slider,
  Tooltip,
  Select,
  MenuItem,
  Drawer,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Switch,
} from "@mui/material";
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from "framer-motion";
import { HomeInlinePromoBanner } from '../components/SubscriptionPromoBanner';
import ReportDialog from '../components/ReportDialog';
import { ProfileTimeline } from '../components/timeline';
import useHomeDeckStore from '../store/homeDeckStore';
import {
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
  Flag,
  SlidersHorizontal,
  Filter,
  Lock,
  MapPin,
  Ruler,
  Wine,
  Baby,
  PawPrint,
  Sun,
  DoorOpen,
  HeartHandshake,
  Heart,
  Sparkles,
  RotateCcw,
  Compass,
} from "lucide-react";

/* =============================
   Demo Data
============================= */
export const demoMatches = [
  {
    id: 6,
    name: "Shani",
    age: 24,
    distance: 0.7,
    lat: 32.0853, // Tel Aviv coordinates
    lng: 34.7818,
    verified: true,
    online: true,
    city: "Tel Aviv",
    photoUrl: "/liza_1.jpg",
    photos: [
      "/liza_1.jpg",
      "/liza_2.jpg",
      "/liza_3.jpg",
    ],
    matchedAt: Date.now() - 1 * 60 * 60 * 1000,
    status: "mutual",
    chatActive: true,
    chatTimeLeft: 680,
    interests: ["Fashion", "Photography", "Brunch", "Style", "Travel"],
    compatibility: 89,
    profession: "Fashion Blogger",
    tagline: "Living my best life, one outfit at a time 💫",
    aboutMe: ["168 cm", "Fashion lover", "Always smiling"],
    lookingFor: ["Style", "Confidence", "Fun vibes"],
  },
  {
    id: 7,
    name: "Yael",
    age: 26,
    distance: 1.1,
    lat: 32.0900, // Tel Aviv - slightly north
    lng: 34.7750,
    verified: true,
    online: false,
    city: "Tel Aviv",
    photoUrl: "/gali_1.jpg",
    photos: [
      "/gali_1.jpg",
      "/gali_2.jpg",
      "/gali_3.jpg",
    ],
    matchedAt: Date.now() - 3 * 60 * 60 * 1000,
    status: "mutual",
    chatActive: false,
    chatTimeLeft: 0,
    interests: ["Design", "Travel", "Fashion", "Architecture"],
    compatibility: 84,
    profession: "Interior Designer",
    tagline: "Aesthetic vibes and good energy 🌟",
    aboutMe: ["170 cm", "Design enthusiast", "Loves sunglasses"],
    lookingFor: ["Sophistication", "Ambition", "Good taste"],
  },
  {
    id: 3,
    name: "Lior",
    age: 26,
    distance: 1.2,
    lat: 32.0714, // Givatayim coordinates
    lng: 34.8122,
    verified: false,
    online: true,
    city: "Givatayim",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&h=1200&q=80",
    ],
    matchedAt: Date.now() - 5 * 60 * 60 * 1000,
    status: "mutual",
    chatActive: true,
    chatTimeLeft: 320,
    interests: ["Photography", "Art", "Pilates", "Wellness"],
    compatibility: 91,
    profession: "UX Researcher",
    tagline: "Designing with empathy",
    aboutMe: ["168 cm", "Doesn't smoke", "Likes pets"],
    lookingFor: ["Openness", "Humor", "Stability"],
  },
  {
    id: 1,
    name: "Maya",
    age: 27,
    distance: 0.6,
    lat: 32.0800, // Tel Aviv - central
    lng: 34.7805,
    verified: true,
    online: true,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&h=1200&q=80",
    ],
    matchedAt: Date.now() - 12 * 60 * 60 * 1000,
    status: "mutual",
    chatActive: false,
    chatTimeLeft: 0,
    interests: ["Design", "Yoga", "Music", "Coffee"],
    compatibility: 87,
    profession: "Product Designer",
    tagline: "Coffee, cats, and cozy playlists ☕️🐱",
    aboutMe: ["170 cm", "Sometimes drinks", "Likes pets"],
    lookingFor: ["A life partner", "Confidence", "Openness", "Optimism"],
  },
];

const demoLikes = [
  {
    id: 4,
    name: "Liza",
    firstName: "Liza",
    age: 28,
    city: "Tel Aviv",
    distance: 2.3,
    photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=256&q=80",
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1600&h=1000&q=80",
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=1400&h=1400&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&h=1400&q=80",
    ],
    status: "liked_you",
    interestHint: "Travel",
    verified: true,
    tagline: "Adventure seeker with a passion for discovering new places ✈️",
    bio: "I believe life is too short to stay in one place. Currently exploring the world one city at a time. Looking for someone to share sunsets, street food, and spontaneous adventures with.",
    profession: "Travel Photographer",
    education: "Tel Aviv University",
    height: "168 cm",
    interests: ["Travel", "Photography", "Hiking", "Coffee", "Live Music", "Yoga"],
    qualities: ["Adventurous", "Open-minded", "Curious", "Spontaneous"],
    aboutMe: ["168 cm", "Non-smoker", "Social drinker"],
    lookingFor: ["Long-term relationship", "Someone adventurous"],
    drinking: "Socially",
    smoking: "Never",
    exercise: "Often",
    languages: ["Hebrew", "English", "Spanish"],
  },
  {
    id: 5,
    name: "Gali",
    firstName: "Gali",
    age: 25,
    city: "Ramat Gan",
    distance: 4.1,
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&h=1000&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1400&h=1400&q=80",
    ],
    status: "liked_you",
    interestHint: "Art",
    verified: true,
    tagline: "Creating beauty in everyday moments 🎨",
    bio: "Artist by day, dreamer by night. I find inspiration in the little things - a perfect cup of coffee, a beautiful sunset, or a deep conversation. Let's create something beautiful together.",
    profession: "Graphic Designer",
    education: "Bezalel Academy",
    height: "165 cm",
    interests: ["Art", "Design", "Museums", "Coffee", "Reading", "Meditation"],
    qualities: ["Creative", "Thoughtful", "Calm", "Artistic"],
    aboutMe: ["165 cm", "Non-smoker", "Rarely drinks"],
    lookingFor: ["Meaningful connection", "Someone creative"],
    drinking: "Rarely",
    smoking: "Never",
    exercise: "Sometimes",
    languages: ["Hebrew", "English"],
  },
  {
    id: 7,
    name: "Yael",
    firstName: "Yael",
    age: 26,
    city: "Herzliya",
    distance: 5.8,
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1600&h=1000&q=80",
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1400&h=1400&q=80",
    ],
    status: "liked_you",
    interestHint: "Design",
    verified: false,
    tagline: "Design enthusiast who loves good vibes ✨",
    bio: "UX designer who believes in making the world more beautiful, one pixel at a time. When I'm not designing, you'll find me at the beach or trying new restaurants.",
    profession: "UX Designer",
    education: "Shenkar College",
    height: "170 cm",
    interests: ["Design", "Beach", "Food", "Tech", "Podcasts", "Pilates"],
    qualities: ["Detail-oriented", "Friendly", "Ambitious", "Fun"],
    aboutMe: ["170 cm", "Non-smoker", "Social drinker"],
    lookingFor: ["Something real", "Good conversations"],
    drinking: "Socially",
    smoking: "Never",
    exercise: "Often",
    languages: ["Hebrew", "English", "French"],
  },
];

/* =============================
   Google Account Sync Configuration
============================= */
const GOOGLE_USER_EMAIL = "hilit308@gmail.com"; // Primary user account
const SYNC_ENDPOINT = "https://your-backend-api.com/sync"; // TODO: Replace with actual backend

/* =============================
   Local Storage helpers (per current user)
============================= */
const LS_BLOCKS_KEY = `pulse_blocks_v1_${GOOGLE_USER_EMAIL}`;         // Set<number>
const LS_REPORTS_KEY = `pulse_reports_v1_${GOOGLE_USER_EMAIL}`;       // { [profileId]: { count: number, notes: string[] } }
const LS_REVIEW_QUEUE_KEY = `pulse_review_queue_v1_${GOOGLE_USER_EMAIL}`; // Array<{profileId, when, notesSnapshot}>
const LS_MATCHES_KEY = `pulse_matches_v1_${GOOGLE_USER_EMAIL}`;       // Synced matches data
const LS_LIKES_KEY = `pulse_likes_v1_${GOOGLE_USER_EMAIL}`;           // Synced likes data
const LS_LAST_SYNC_KEY = `pulse_last_sync_${GOOGLE_USER_EMAIL}`;      // Last sync timestamp

function loadBlocks() {
  try {
    const raw = localStorage.getItem(LS_BLOCKS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function saveBlocks(set) {
  try { localStorage.setItem(LS_BLOCKS_KEY, JSON.stringify(Array.from(set))); } catch {}
}

function loadReports() {
  try {
    const raw = localStorage.getItem(LS_REPORTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveReports(obj) {
  try { localStorage.setItem(LS_REPORTS_KEY, JSON.stringify(obj)); } catch {}
}

function pushToReviewQueue(item) {
  try {
    const raw = localStorage.getItem(LS_REVIEW_QUEUE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(item);
    localStorage.setItem(LS_REVIEW_QUEUE_KEY, JSON.stringify(arr));
  } catch {}
}

/* =============================
   Google Account Sync Functions
============================= */

/**
 * Syncs matches and likes data from Google account
 * This function pulls fresh data from the backend/Firebase for the authenticated user
 * @param {string} userEmail - The Google account email to sync
 * @returns {Promise<{matches: Array, likes: Array}>}
 */
async function syncFromGoogleAccount(userEmail) {
  try {
    console.log(`[Google Sync] Syncing data for: ${userEmail}`);
    
    // TODO: Replace this with actual backend API call
    // Example:
    // const response = await fetch(`${SYNC_ENDPOINT}/matches?email=${userEmail}`, {
    //   headers: { 'Authorization': `Bearer ${firebaseToken}` }
    // });
    // const data = await response.json();
    
    // For now, use demo data but merge with any new matches from events
    // Get new matches created from EventLikesScreen (Like Back action)
    let eventMatches = [];
    try {
      const storedEventMatches = localStorage.getItem('pulse_matches');
      if (storedEventMatches) {
        eventMatches = JSON.parse(storedEventMatches);
      }
    } catch (e) {
      console.error('Error reading event matches:', e);
    }
    
    // Merge event matches with demo matches (event matches first, then demo)
    const allMatches = [...eventMatches, ...demoMatches.filter(dm => 
      !eventMatches.find(em => em.id === dm.id)
    )];
    
    const syncedData = {
      matches: allMatches,
      likes: demoLikes,
      timestamp: Date.now(),
    };
    
    // Cache synced data in localStorage
    localStorage.setItem(LS_MATCHES_KEY, JSON.stringify(syncedData.matches));
    localStorage.setItem(LS_LIKES_KEY, JSON.stringify(syncedData.likes));
    localStorage.setItem(LS_LAST_SYNC_KEY, syncedData.timestamp.toString());
    
    console.log(`[Google Sync] Successfully synced at ${new Date(syncedData.timestamp).toLocaleString()}`);
    
    return syncedData;
  } catch (error) {
    console.error('[Google Sync] Error syncing data:', error);
    
    // Fallback to cached data if available
    try {
      const cachedMatches = localStorage.getItem(LS_MATCHES_KEY);
      const cachedLikes = localStorage.getItem(LS_LIKES_KEY);
      
      if (cachedMatches && cachedLikes) {
        console.log('[Google Sync] Using cached data');
        return {
          matches: JSON.parse(cachedMatches),
          likes: JSON.parse(cachedLikes),
        };
      }
    } catch (cacheError) {
      console.error('[Google Sync] Error reading cache:', cacheError);
    }
    
    // Ultimate fallback to demo data, but still check for event matches
    let eventMatches = [];
    try {
      const storedEventMatches = localStorage.getItem('pulse_matches');
      if (storedEventMatches) {
        eventMatches = JSON.parse(storedEventMatches);
      }
    } catch (e) {}
    
    const allMatches = [...eventMatches, ...demoMatches.filter(dm => 
      !eventMatches.find(em => em.id === dm.id)
    )];
    
    return {
      matches: allMatches,
      likes: demoLikes,
    };
  }
}

/**
 * Gets the last sync timestamp for display
 * @returns {string|null}
 */
function getLastSyncTime() {
  try {
    const timestamp = localStorage.getItem(LS_LAST_SYNC_KEY);
    if (timestamp) {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleString();
    }
  } catch {}
  return null;
}

/* =============================
   Utils
============================= */
function formatTimeLeft(seconds) {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* =============================
   Subcomponents
============================= */
function Dots({ count, index }) {
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 8,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 0.5,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            opacity: i === index ? 1 : 0.3,
            bgcolor: "common.white",
            transform: i === index ? "scale(1.15)" : "scale(1)",
            transition: "transform .2s ease, opacity .2s ease",
          }}
        />
      ))}
    </Box>
  );
}


/* Photo Section — Compact for Matches (per spec: 60-65% of Discover card height) */
function CompactPhotoSection({ photos, name, index, onChangeIndex }) {
  const canPrev = index > 0;
  const canNext = index < photos.length - 1;

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    if (tapX < rect.width * 0.3 && canPrev) {
      onChangeIndex(index - 1);
    } else if (tapX > rect.width * 0.7 && canNext) {
      onChangeIndex(index + 1);
    }
  };

  return (
    <Box
      onClick={handleTap}
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        background: "#F4F6F8",
        overflow: "hidden",
        borderRadius: "12px 12px 0 0",
        cursor: "pointer",
      }}
    >
      <img
        src={photos[index]}
        loading="lazy"
        alt={`${name} ${index + 1}`}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block" }}
      />

      {/* Photo dots - light navigation only per spec */}
      {photos.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 0.5,
            px: 2,
          }}
        >
          {photos.map((_, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                height: 3,
                maxWidth: 40,
                borderRadius: 2,
                backgroundColor: i === index ? "#fff" : "rgba(255,255,255,0.4)",
                transition: "background-color 0.2s ease",
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

/* Compact Match Card — Per spec: 60-65% of Discover card height
 * Card content order: Image, Identity line, Short description, Details, Interests (4-5 max), Looking For
 * No expandable sections allowed
 */
function CompactMatchCard({ profile, onPass, onOpenChat, onBlock, onReport, pendingWorkshopInvite, onInvite, isYouLikeTab = false }) {
  const { t } = useLanguage();
  const photos = profile.photos?.length ? profile.photos : [profile.photoUrl].filter(Boolean);
  const [photoIdx, setPhotoIdx] = useState(0);

  const interests = (profile.interests || []).slice(0, 5); // Max 4-5 per spec
  const aboutMe = (profile.aboutMe || []).slice(0, 3); // Keep compact
  const lookingFor = (profile.lookingFor || []).slice(0, 3); // Keep compact

  const BRAND_PRIMARY = "#6C5CE7";

  // Compact chip component
  const CompactChip = ({ label, variant = "default" }) => (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1,
        py: 0.3,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        bgcolor: variant === "looking" ? "rgba(244,63,94,0.08)" : "#efeaff",
        color: variant === "looking" ? "#f43f5e" : BRAND_PRIMARY,
        border: `1px solid ${variant === "looking" ? "rgba(244,63,94,0.15)" : "rgba(108,92,231,0.2)"}`,
      }}
    >
      {label}
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          overflow: "hidden",
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          bgcolor: "#fff",
          border: "1px solid rgba(0,0,0,0.04)",
          transition: "all 0.2s ease",
          display: "flex",
          flexDirection: "row",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Left side - Details */}
        <CardContent sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Identity line: name, age, city, distance */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
            {profile.name}, {profile.age}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <MapPin size={14} color="#64748b" />
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              {(profile.calculatedDistance ?? profile.distance ?? 0).toFixed(1)} km
            </Typography>
          </Box>
        </Box>

        {/* Short description (single line per spec) */}
        {profile.tagline && (
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {profile.tagline}
          </Typography>
        )}

        {/* Details (default-visible attributes with icons) */}
        {aboutMe.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
            {aboutMe.map((item, i) => (
              <CompactChip key={i} label={item} />
            ))}
          </Box>
        )}

        {/* Interests (4-5 chips max, truncated per spec) */}
        {interests.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
            {interests.map((item, i) => (
              <CompactChip key={i} label={item} />
            ))}
          </Box>
        )}

        {/* Looking For (softer chips per spec) */}
        {lookingFor.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
            {lookingFor.map((item, i) => (
              <CompactChip key={i} label={item} variant="looking" />
            ))}
          </Box>
        )}

        {/* Actions: Primary = Chat/Invite, Secondary = Pass, Safety actions available */}
        <Stack direction="row" spacing={1} alignItems="center">
          {pendingWorkshopInvite ? (
            <Button
              variant="contained"
              size="small"
              onClick={() => onInvite?.(profile, pendingWorkshopInvite)}
              sx={{
                flex: 1,
                borderRadius: "10px",
                py: 0.75,
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #6C5CE7 0%, #8b5cf6 100%)",
                "&:hover": { background: "linear-gradient(135deg, #5b4cdb 0%, #7c4ddb 100%)" },
              }}
            >
              🎟️ Invite to workshop
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={() => onOpenChat?.(profile)}
              startIcon={<MessageCircle size={16} />}
              sx={{
                flex: 1,
                borderRadius: "10px",
                py: 0.75,
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)",
                "&:hover": { background: "linear-gradient(135deg, #5a4bd1 0%, #9333ea 100%)" },
              }}
            >
              {t('chat')}
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => onPass?.(profile)}
            sx={{
              borderRadius: "10px",
              py: 0.75,
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#e2e8f0",
              color: "#64748b",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
            }}
          >
            {isYouLikeTab ? 'Unlike' : t('pass')}
          </Button>
          <IconButton
            size="small"
            onClick={() => onBlock?.(profile)}
            sx={{ color: "#94a3b8" }}
            aria-label="Block"
          >
            <ShieldAlert size={18} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onReport?.(profile)}
            sx={{ color: "#94a3b8" }}
            aria-label="Report"
          >
            <Flag size={18} />
          </IconButton>
        </Stack>
      </CardContent>

        {/* Right side - Photo */}
        <Box
          sx={{
            width: 140,
            minWidth: 140,
            position: "relative",
            overflow: "hidden",
            borderRadius: "0 20px 20px 0",
          }}
        >
          <img
            src={photos[photoIdx]}
            alt={profile.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onClick={() => setPhotoIdx((prev) => (prev + 1) % photos.length)}
          />
          {photos.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              {photos.map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: i === photoIdx ? "#fff" : "rgba(255,255,255,0.5)",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
    </Card>
    </motion.div>
  );
}

// Transform profile to ProfileTimeline format
const transformToProfileTimelineFormat = (profile) => ({
  id: profile.id,
  userId: String(profile.id),
  name: profile.name || profile.firstName,
  firstName: profile.firstName || profile.name,
  age: profile.age,
  city: profile.city || 'Nearby',
  distance: profile.distance,
  profession: profile.profession,
  education: profile.education,
  tagline: profile.tagline,
  bio: profile.bio,
  interests: profile.interests || [],
  tags: profile.tags || profile.interests || [],
  verified: profile.verified,
  isOnline: profile.isOnline || profile.online,
  photos: profile.photos?.length ? profile.photos : [profile.photoUrl].filter(Boolean),
  primaryPhoto: profile.photos?.[0] || profile.photoUrl,
  aboutMe: profile.aboutMe || [],
  lookingFor: profile.lookingFor || [],
  qualities: profile.qualities || [],
  height: profile.height,
  location: profile.location || profile.city,
  hometown: profile.hometown,
  exercise: profile.exercise,
  drinking: profile.drinking,
  smoking: profile.smoking,
  kids: profile.kids,
  starSign: profile.starSign,
  politics: profile.politics,
  languages: profile.languages || [],
  causes: profile.causes || [],
  spotifyConnected: profile.spotifyConnected,
  spotifyPlaylists: profile.spotifyPlaylists || [],
  userRhythm: profile.userRhythm,
  prompts: profile.prompts || [],
  favoriteSongs: profile.favoriteSongs || [],
  likesYou: true, // They're in "Interested in You" so they like you
});

/* Full Profile Card for Interested in You - Uses ProfileTimeline with scrolling */
function FullProfileCard({ profile, onLike, onPass, onClose }) {
  const transformedProfile = transformToProfileTimelineFormat(profile);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%', 
          maxWidth: 400, 
          height: 'calc(100vh - 100px)',
          maxHeight: 700,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 100,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
            }}
            size="small"
          >
            <X size={18} />
          </IconButton>

          {/* Scrollable ProfileTimeline */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { 
                backgroundColor: 'rgba(0,0,0,0.2)', 
                borderRadius: 2 
              },
            }}
          >
            <ProfileTimeline
              user={transformedProfile}
              onLike={() => onLike(profile)}
              onPass={() => onPass(profile)}
              hideUndo={true}
            />
          </Box>
        </Box>
      </motion.div>
    </motion.div>
  );
}

/* It's a Match! Match celebration - LEGACY: now redirects to global popup */
function MatchCelebration({ person, onStartChat, onKeepBrowsing }) {
  // FALLBACK: dispatch global popup and render nothing
  React.useEffect(() => {
    if (!person) return;
    try {
      window.dispatchEvent(
        new CustomEvent('pulse:show_match', {
          detail: {
            match: {
              id: person.id,
              name: person.name || person.firstName,
              firstName: person.firstName || person.name,
              photo: person.photoUrl || person.photos?.[0],
              photos: person.photos,
            },
            copy: {
              title: "It's a Match",
              subtitle: "You're in sync",
              description: 'Something real can happen now',
              matchedLine: `You and ${person.name || person.firstName} matched!`,
              primaryCta: 'Start chat',
              secondaryCta: 'Keep browsing',
            },
            onLater: onKeepBrowsing,
          },
        })
      );
    } catch {
      // ignore
    }
    if (onKeepBrowsing) onKeepBrowsing();
  }, [person, onKeepBrowsing]);

  // Never render legacy UI - global popup handles display
  return null;
}

/* =============================
   Main Screen
============================= */
export default function MatchesScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Global store for liked profiles (YOU LIKE tab) and mutual matches (MUTUAL MATCHES tab)
  const { likedProfiles, removeLikedProfile, mutualMatches, removeMutualMatch, addMutualMatch } = useHomeDeckStore();

  const [tab, setTab] = useState(0);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // GPS location for distance calculation
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Filters (open only on button)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ageRange, setAgeRange] = useState([22, 42]);
  const [maxDistance, setMaxDistance] = useState(25);
  const [sortBy, setSortBy] = useState("recent"); // "recent" | "distance" | "compat"
  const [onlyActiveChats, setOnlyActiveChats] = useState(false);

  // Moderation UI state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportNote, setReportNote] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  
  // Block confirmation dialog state
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null);

  // Interested in You - unlocked state per spec
  const [isSubscribed, setIsSubscribed] = useState(true); // Mock: user has subscription
  const [selectedLikeProfile, setSelectedLikeProfile] = useState(null); // Profile card open
  const [matchCelebration, setMatchCelebration] = useState(null); // "It's a Match!" celebration

  // Pending workshop invite (from decline flow)
  const [pendingWorkshopInvite, setPendingWorkshopInvite] = useState(null);

  // Blocked profiles (per current user)
  const [blocked, setBlocked] = useState(() => loadBlocks());
  // Reports state
  const [reports, setReports] = useState(() => loadReports());

  // Load pending workshop invite from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pending_workshop_invite');
      if (raw) {
        setPendingWorkshopInvite(JSON.parse(raw));
      }
    } catch {}
  }, []);

  // Listen for match updates from other screens (Nearby, Home)
  useEffect(() => {
    const reloadMatches = () => {
      try {
        const storedMatches = localStorage.getItem('pulse_matches');
        console.log('[MatchesScreen] Reloading matches from localStorage');
        if (storedMatches) {
          const matches = JSON.parse(storedMatches);
          matches.forEach(match => {
            addMutualMatch(match);
          });
        }
      } catch (e) {
        console.error('[MatchesScreen] Error reloading matches:', e);
      }
    };
    
    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'pulse_matches') {
        console.log('[MatchesScreen] Storage changed, reloading matches');
        reloadMatches();
      }
    };
    
    // Listen for custom event (same-tab updates from Nearby/Home)
    const handleMatchesUpdated = () => {
      console.log('[MatchesScreen] pulse:matches_updated event received');
      reloadMatches();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pulse:matches_updated', handleMatchesUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pulse:matches_updated', handleMatchesUpdated);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get user's GPS location for distance filtering
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
        console.log('[MatchesScreen] GPS location obtained:', position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn('[MatchesScreen] GPS error:', error.message);
        setLocationError(error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }, []);

  // Load "Interested in You" data (likes) on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Sync likes from Google account
        const syncedData = await syncFromGoogleAccount(GOOGLE_USER_EMAIL);
        
        if (isMounted) {
          setLikes(syncedData.likes);
          
          // Also add synced matches to the store (in case they're not there yet)
          if (syncedData.matches && Array.isArray(syncedData.matches)) {
            console.log('[MatchesScreen] Adding synced matches to store:', syncedData.matches.length);
            syncedData.matches.forEach(match => {
              addMutualMatch(match);
            });
          }
          
          setLoading(false);
          
          // Log sync info
          const lastSync = getLastSyncTime();
          console.log('[MatchesScreen] Likes loaded from Google account');
          console.log('[MatchesScreen] Mutual matches from store:', mutualMatches.length);
          console.log('[MatchesScreen] Last sync:', lastSync);
        }
      } catch (error) {
        console.error('[MatchesScreen] Failed to load data:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Run only on mount

  // persist blocks & reports
  useEffect(() => saveBlocks(blocked), [blocked]);
  useEffect(() => saveReports(reports), [reports]);

  const filteredMatches = useMemo(() => {
    // Use mutualMatches from global store
    const matches = mutualMatches || [];
    console.log('[MatchesScreen] filteredMatches recalculating - mutualMatches:', matches.length, 'blocked:', blocked.size, 'names:', matches.map(m => m.name));
    
    // Calculate real distance from GPS if available, otherwise use static distance
    const matchesWithDistance = matches.map((m) => {
      if (userLocation && m.lat && m.lng) {
        // Calculate real distance from GPS
        const realDistance = calculateDistance(userLocation.lat, userLocation.lng, m.lat, m.lng);
        return { ...m, calculatedDistance: realDistance };
      }
      // Use static distance if no GPS or no match coordinates (don't filter out)
      return { ...m, calculatedDistance: m.distance ?? 0 };
    });

    let res = matchesWithDistance
      .filter((m) => !blocked.has(m.id))
      .filter((m) => {
        // Only filter by age if age is defined
        if (!m.age) return true;
        return m.age >= ageRange[0] && m.age <= ageRange[1];
      })
      .filter((m) => {
        // Only filter by distance if we have GPS location
        if (!userLocation) return true; // No GPS = show all
        return maxDistance ? m.calculatedDistance <= maxDistance : true;
      })
      .filter((m) => (onlyActiveChats ? m.chatActive : true));

    if (sortBy === "distance") return [...res].sort((a, b) => a.calculatedDistance - b.calculatedDistance);
    if (sortBy === "compat") return [...res].sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0));
    return [...res].sort((a, b) => (b.matchedAt || 0) - (a.matchedAt || 0));
  }, [mutualMatches, blocked, ageRange, maxDistance, onlyActiveChats, sortBy, userLocation, calculateDistance]);

  const handlePass = (p) => {
    console.log('[MatchesScreen] Passing on user:', p.id, p.name);
    console.log('[MatchesScreen] Current mutualMatches count before pass:', mutualMatches.length);
    removeMutualMatch(p.id);
  };
  const handleOpenChat = (p) => {
    // Navigate to chat screen with match data
    // Include full profile data so ChatScreen can create a new chat if needed
    navigate(`/chat/${p.id}`, { 
      state: { 
        profile: {
          id: p.id,
          name: p.name,
          firstName: p.name,
          age: p.age,
          photoUrl: p.photos?.[0] || p.photoUrl,
          photos: p.photos || [p.photoUrl],
          verified: p.verified,
          interests: p.interests || [],
          tagline: p.tagline,
        },
        matchName: p.name,
        matchPhoto: p.photos?.[0] || p.photoUrl,
      } 
    });
  };

  // === BLOCK (per user) ===
  // Open confirmation dialog
  const handleBlock = (p) => {
    setBlockTarget(p);
    setBlockConfirmOpen(true);
  };
  
  // Confirm block action
  const confirmBlock = () => {
    if (!blockTarget) return;
    
    const p = blockTarget;
    console.log('[MatchesScreen] Blocking user:', p.id, p.name);
    console.log('[MatchesScreen] Current blocked count:', blocked.size);
    console.log('[MatchesScreen] Current mutualMatches count:', mutualMatches.length);
    
    // Add to blocked users in localStorage for Settings page
    const blockedUser = {
      id: p.id,
      name: p.name || 'User',
      photo: p.photos?.[0] || p.photoUrl || '',
      source: 'profile',
      blockedAt: new Date().toISOString().split('T')[0],
    };
    try {
      const existing = JSON.parse(localStorage.getItem('pulse_blocked_users') || '[]');
      if (!existing.find(u => u.id === blockedUser.id)) {
        localStorage.setItem('pulse_blocked_users', JSON.stringify([...existing, blockedUser]));
      }
    } catch (e) {
      console.error('Failed to save blocked user to localStorage:', e);
    }
    
    // Create new Set with only the blocked user ID added
    const next = new Set(blocked);
    next.add(p.id);
    console.log('[MatchesScreen] New blocked count:', next.size);
    setBlocked(next);
    setSnack({ open: true, msg: `${p.name} has been blocked.`, severity: "info" });
    
    // Close dialog
    setBlockConfirmOpen(false);
    setBlockTarget(null);
  };

  // === REPORT (with optional note; threshold->queue) ===
  const openReportDialog = (p) => {
    setReportTarget(p);
    setReportOpen(true);
  };
  
  const submitReport = (reportData) => {
    if (!reportTarget) return;
    const id = reportTarget.id;
    const prev = reports[id] || { count: 0, notes: [], reasons: [] };
    const next = {
      count: prev.count + 1,
      notes: reportData.note ? [...prev.notes, reportData.note] : prev.notes,
      reasons: [...(prev.reasons || []), reportData.reason],
    };
    const merged = { ...reports, [id]: next };
    setReports(merged);
    setReportOpen(false);
    setReportTarget(null);
    setSnack({ open: true, msg: `Report submitted. Thank you for helping keep Pulse safe.`, severity: "success" });

    // threshold = 5 → push to review queue (admin)
    if (next.count >= 5) {
      pushToReviewQueue({
        profileId: id,
        when: new Date().toISOString(),
        notesSnapshot: next.notes.slice(-10),
        reasons: next.reasons,
      });
      setSnack({ open: true, msg: `Profile sent to admin review queue.`, severity: "warning" });
    }
  };

  // **ADMIN BAN (hard ban) — demo only**
  // call this to permanently remove a user from the app (server-side responsibility)
  async function adminBanUser(profileId) {
    // await fetch(`/api/moderation/ban/${profileId}`, { method: "POST" })
    // In UI we can also hide immediately:
    removeMutualMatch(profileId);
    setLikes((prev) => prev.filter((l) => l.id !== profileId));
  }

  const handleReport = (p) => openReportDialog(p);

  // Interested in You - Like/Pass handlers per spec
  // Like: Immediate match creation, show "It's a Match", CTA: Start chat
  // Pass: Profile removed permanently, no notification, no match created
  const handleLikeFromInterested = useCallback((profile) => {
    // Create match immediately
    const newMatch = {
      ...profile,
      status: "mutual",
      matchedAt: Date.now(),
      chatActive: true,
      chatTimeLeft: 900, // 15 min window
    };
    
    // Remove from likes, add to mutual matches store
    setLikes(prev => prev.filter(l => l.id !== profile.id));
    addMutualMatch(newMatch);
    
    // Close profile card and show celebration
    setSelectedLikeProfile(null);
    setMatchCelebration(profile);
  }, [addMutualMatch]);

  const handlePassFromInterested = useCallback((profile) => {
    // Profile removed permanently per spec - no notification, no match
    setLikes(prev => prev.filter(l => l.id !== profile.id));
    setSelectedLikeProfile(null);
  }, []);

  const handleStartChatFromMatch = useCallback((person) => {
    setMatchCelebration(null);
    navigate(`/chat?matchId=${person.id}`);
  }, [navigate]);

  const handleKeepBrowsingFromMatch = useCallback(() => {
    setMatchCelebration(null);
  }, []);

  // Handle inviting a match to a workshop
  const handleInviteToWorkshop = useCallback((profile, workshop) => {
    // Clear the pending workshop invite
    localStorage.removeItem('pending_workshop_invite');
    setPendingWorkshopInvite(null);
    
    // Create the invite message to be added to chat
    const inviteMessage = {
      matchId: profile.id,
      message: {
        id: `workshop_invite_${Date.now()}`,
        from: 'me',
        type: 'workshop_invite',
        text: `🎉 ${workshop.title}`,
        workshop: {
          id: workshop.id,
          title: workshop.title,
          date: workshop.date,
          time: workshop.time,
          venue: workshop.venue,
          cover: workshop.cover,
        },
        timestamp: Date.now(),
        status: 'sent',
      }
    };
    
    // Store in localStorage for ChatScreen to pick up
    try {
      const key = 'pending_workshop_invite_messages';
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(inviteMessage);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch {}
    
    // Show success message
    setSnack({ 
      open: true, 
      msg: `Invitation sent to ${profile.name} for ${workshop.title}!`, 
      severity: "success" 
    });
    
    // Navigate to chat with this person
    navigate(`/chat/${profile.id}`);
  }, [navigate]);

  useEffect(() => {
    if (!matchCelebration) return;
    try {
      window.dispatchEvent(
        new CustomEvent('pulse:show_match', {
          detail: {
            match: {
              id: matchCelebration.id,
              name: matchCelebration.name,
              firstName: matchCelebration.firstName || matchCelebration.name,
              photo: matchCelebration.photoUrl,
              photos: matchCelebration.photos,
            },
            copy: {
              title: "It's a Match",
              subtitle: "You're in sync",
              description: 'Something real can happen now',
              matchedLine: `You and ${matchCelebration.name} matched!`,
              primaryCta: 'Start chat',
              secondaryCta: 'Keep browsing',
            },
          },
        })
      );
    } catch {
      // ignore
    }
    setMatchCelebration(null);
  }, [matchCelebration]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#fafbfc',
        pb: "calc(80px + env(safe-area-inset-bottom, 0))",
        position: 'relative',
      }}
    >
      {/* Subscription Promo Banner - appears after browsing */}
      <HomeInlinePromoBanner swipeCount={8} />

      {/* Pending Workshop Invite Banner */}
      {pendingWorkshopInvite && (
        <Box
          sx={{
            mx: 2,
            mt: 2,
            p: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(168,85,247,0.1) 100%)',
            border: '1px solid rgba(108,92,231,0.2)',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6C5CE7', mb: 0.5 }}>
            🎯 Invite someone to the workshop
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
            {pendingWorkshopInvite.title}
            {pendingWorkshopInvite.date && (
              <span> • {new Date(pendingWorkshopInvite.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            )}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1.5 }}>
            Tap on a match below to send them an invite
          </Typography>
          <Button
            size="small"
            onClick={() => {
              localStorage.removeItem('pending_workshop_invite');
              setPendingWorkshopInvite(null);
            }}
            sx={{ 
              color: '#94a3b8', 
              textTransform: 'none',
              fontSize: 12,
              p: 0,
              minWidth: 'auto',
              '&:hover': { color: '#64748b', bgcolor: 'transparent' }
            }}
          >
            Cancel
          </Button>
        </Box>
      )}

      {/* Top bar - per spec: calm, organized, no excitement */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, pt: 1.5, pb: 1 }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#1a1a2e",
              }}
            >
              {t('matches')}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              {filteredMatches.length} connections
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ 
                backgroundColor: "#f8fafc",
                border: "1px solid rgba(0,0,0,0.06)",
                "&:hover": { backgroundColor: "#f1f5f9" },
              }}
            >
              <SlidersHorizontal size={18} color="#64748b" />
            </IconButton>
          </Box>
        </Stack>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons={false}
          sx={{ 
            px: 1,
            minHeight: 44,
            ".MuiTab-root": { 
              minWidth: 'auto',
              minHeight: 44,
              px: 1.25,
              py: 1,
              textTransform: 'uppercase',
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.02em',
              color: '#64748b',
              '&.Mui-selected': { color: '#6C5CE7' },
            },
            "& .MuiTabs-indicator": { 
              backgroundColor: "#6C5CE7",
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            "& .MuiTabs-flexContainer": { gap: 0.5 },
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{t('mutualMatches')}</span>
                {filteredMatches.length > 0 && (
                  <Box sx={{ 
                    backgroundColor: tab === 0 ? '#6C5CE7' : '#e2e8f0',
                    color: tab === 0 ? '#fff' : '#64748b',
                    borderRadius: 999,
                    px: 0.75,
                    py: 0.25,
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 20,
                    textAlign: 'center',
                  }}>
                    {filteredMatches.length}
                  </Box>
                )}
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{t('interestedInYou')}</span>
                {likes.filter(l => !blocked.has(l.id)).length > 0 && (
                  <Box sx={{ 
                    backgroundColor: tab === 1 ? '#f43f5e' : '#e2e8f0',
                    color: tab === 1 ? '#fff' : '#64748b',
                    borderRadius: 999,
                    px: 0.75,
                    py: 0.25,
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 20,
                    textAlign: 'center',
                  }}>
                    {likes.filter(l => !blocked.has(l.id)).length}
                  </Box>
                )}
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>YOU LIKE</span>
                {likedProfiles.filter(p => !blocked.has(p.id)).length > 0 && (
                  <Box sx={{ 
                    backgroundColor: tab === 2 ? '#6C5CE7' : '#e2e8f0',
                    color: tab === 2 ? '#fff' : '#64748b',
                    borderRadius: 999,
                    px: 0.75,
                    py: 0.25,
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 20,
                    textAlign: 'center',
                  }}>
                    {likedProfiles.filter(p => !blocked.has(p.id)).length}
                  </Box>
                )}
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Content */}
      {/* DEV LOG */}
      {console.log('[MatchesScreen RENDER] tab:', tab, 'mutualMatches:', mutualMatches.length, 'filteredMatches:', filteredMatches.length, 'loading:', loading)}
      {tab === 0 && (
        <Box sx={{ px: 1.25, pt: 1.25 }}>
          {loading ? (
            <>
              <Skeleton variant="rounded" height={260} sx={{ mb: 1.25 }} />
              <Skeleton variant="rounded" height={260} sx={{ mb: 1.25 }} />
            </>
          ) : filteredMatches.length === 0 ? (
            <Box
              sx={{
                py: 6,
                px: 3,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Illustration */}
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(168,85,247,0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <HeartHandshake size={48} color="#6C5CE7" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>
                {t('noMatchesYet')}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 3, maxWidth: 280 }}>
                When you match with someone, they'll appear here. No rush — good things take time.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/nearby")}
                startIcon={<Compass size={18} />}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: "14px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)",
                  boxShadow: '0 4px 16px rgba(108,92,231,0.3)',
                }}
              >
                Explore Nearby
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filteredMatches.map((m, index) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CompactMatchCard
                    profile={m}
                    onPass={(p) => removeMutualMatch(p.id)}
                    onOpenChat={handleOpenChat}
                    onBlock={handleBlock}
                    onReport={handleReport}
                    pendingWorkshopInvite={pendingWorkshopInvite}
                    onInvite={handleInviteToWorkshop}
                  />
                </motion.div>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* INTERESTED IN YOU Tab */}
      {tab === 1 && (
        <Box sx={{ px: 1.25, pt: 1.25 }}>
          {loading ? (
            <Skeleton variant="rounded" height={110} sx={{ mb: 1.25 }} />
          ) : likes.length === 0 ? (
            <Box
              sx={{
                py: 8,
                px: 3,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Heart size={64} color="#cbd5e1" />
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 2, color: "#1a1a2e" }}>
                No one yet
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 1 }}>
                {t('keepExploring')}
              </Typography>
            </Box>
          ) : isSubscribed ? (
            /* Unlocked State - per spec: blocks become clickable, each opens full profile card */
            <Stack spacing={1.5}>
              {likes
                .filter((l) => !blocked.has(l.id))
                .map((l) => (
                  <Card
                    key={l.id}
                    onClick={() => setSelectedLikeProfile(l)}
                    sx={{
                      borderRadius: "16px",
                      border: "1px solid rgba(0,0,0,0.06)",
                      bgcolor: "#fff",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 4px 16px rgba(108,92,231,0.15)",
                        borderColor: "rgba(108,92,231,0.2)",
                      },
                    }}
                  >
                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
                      <Avatar 
                        src={l.photoUrl} 
                        sx={{ 
                          width: 56, 
                          height: 56,
                          border: "2px solid #d1d5db",
                        }} 
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: 16 }}>
                          {l.name}, {l.age}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          {l.interestHint ? `Interested in ${l.interestHint}` : "Likes you"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 999,
                          bgcolor: "rgba(108,92,231,0.1)",
                        }}
                      >
                        <Heart size={14} color="#6C5CE7" fill="#6C5CE7" />
                        <Typography variant="caption" sx={{ color: "#6C5CE7", fontWeight: 600 }}>
                          View
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Stack>
          ) : (
            /* Locked State - per spec: uniform blocks, obscured profile, hint text only, unlock CTA */
            <Stack spacing={1.25}>
              {likes
                .filter((l) => !blocked.has(l.id))
                .map((l) => (
                  <Card
                    key={l.id}
                    sx={{
                      borderRadius: "16px",
                      border: "1px solid rgba(0,0,0,0.06)",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
                      <Avatar 
                        src={l.photoUrl} 
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          filter: "blur(8px)",
                          opacity: 0.7,
                        }} 
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: 15 }}>
                          {t('someoneLikedYou')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          {l.interestHint ? `Hint: likes ${l.interestHint}` : ""}
                        </Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<Lock size={14} />} 
                        onClick={() => setIsSubscribed(true)} // Mock unlock
                        sx={{ 
                          minHeight: 36,
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 600,
                          background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)",
                        }}
                      >
                        {t('unlock')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </Stack>
          )}
        </Box>
      )}

      {/* YOU LIKE Tab */}
      {tab === 2 && (
        <Box sx={{ px: 1.25, pt: 1.25 }}>
          {likedProfiles.filter(p => !blocked.has(p.id)).length === 0 ? (
            <Box
              sx={{
                py: 6,
                px: 3,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(139,92,246,0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <Heart size={48} color="#6C5CE7" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}>
                No likes yet
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 3, maxWidth: 280 }}>
                When you like someone, they'll appear here until they like you back.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/")}
                startIcon={<Heart size={18} />}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: "14px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  background: "linear-gradient(135deg, #6C5CE7 0%, #8b5cf6 100%)",
                  boxShadow: '0 4px 16px rgba(108,92,231,0.3)',
                }}
              >
                Start Swiping
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              {likedProfiles
                .filter(p => !blocked.has(p.id))
                .map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <CompactMatchCard
                      profile={profile}
                      onPass={(p) => removeLikedProfile(p.id)}
                      onOpenChat={handleOpenChat}
                      onBlock={handleBlock}
                      onReport={handleReport}
                      isYouLikeTab={true}
                    />
                  </motion.div>
                ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Full Profile Card - opens when clicking unlocked "Interested in You" */}
      <AnimatePresence>
        {selectedLikeProfile && (
          <FullProfileCard
            profile={selectedLikeProfile}
            onLike={handleLikeFromInterested}
            onPass={handlePassFromInterested}
            onClose={() => setSelectedLikeProfile(null)}
          />
        )}
      </AnimatePresence>

      {/* Match Celebration - "It's a Match!" */}
      <AnimatePresence>
        {false && matchCelebration && (
          <MatchCelebration
            person={matchCelebration}
            onStartChat={() => handleStartChatFromMatch(matchCelebration)}
            onKeepBrowsing={handleKeepBrowsingFromMatch}
          />
        )}
      </AnimatePresence>

      {/* Filters Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: 320, sm: 360 } } }}
      >
        <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <SlidersHorizontal size={18} />
              <Typography sx={{ fontWeight: 700 }}>{t('filters')}</Typography>
            </Stack>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close filters">
              <X />
            </IconButton>
          </Stack>
          <Divider />

          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t('ageRange')}
            </Typography>
            <Slider
              value={ageRange}
              onChange={(_, v) => setAgeRange(v)}
              valueLabelDisplay="auto"
              min={18}
              max={70}
              disableSwap
              sx={{ color: "#6C5CE7" }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t('maxDistance')}
            </Typography>
            <Slider
              value={maxDistance}
              onChange={(_, v) => setMaxDistance(v)}
              valueLabelDisplay="auto"
              min={1}
              max={100}
              sx={{ color: "#6C5CE7" }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t('sortBy')}
            </Typography>
            <Select fullWidth size="small" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="recent">{t('mostRecent')}</MenuItem>
              <MenuItem value="distance">{t('distance')}</MenuItem>
              <MenuItem value="compat">{t('compatibility')}</MenuItem>
            </Select>
          </Box>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2">{t('activeChatsOnly')}</Typography>
            <Switch 
              checked={onlyActiveChats} 
              onChange={(e) => setOnlyActiveChats(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#6C5CE7" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#6C5CE7" },
              }}
            />
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1}>
            <Button
              color="inherit"
              fullWidth
              onClick={() => {
                setAgeRange([22, 42]);
                setMaxDistance(25);
                setSortBy("recent");
                setOnlyActiveChats(false);
              }}
            >
              {t('reset')}
            </Button>
            <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)} sx={{ background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)" }}>
              {t('apply')}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* Block Confirmation Dialog */}
      <Dialog
        open={blockConfirmOpen}
        onClose={() => {
          setBlockConfirmOpen(false);
          setBlockTarget(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            maxWidth: 340,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
          Block {blockTarget?.name}?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to block this profile? They won't be able to see you or contact you anymore.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setBlockConfirmOpen(false);
              setBlockTarget(null);
            }}
            sx={{ color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmBlock}
            sx={{
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
            }}
          >
            Block
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <ReportDialog
        open={reportOpen}
        onClose={() => {
          setReportOpen(false);
          setReportTarget(null);
        }}
        onSubmit={submitReport}
        userName={reportTarget?.name || 'this user'}
      />

      {/* Snackbars */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ 
          top: 80,
          zIndex: 99999,
          '& .MuiAlert-root': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }
        }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
