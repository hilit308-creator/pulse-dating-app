import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import useHomeDeckStore from "../store/homeDeckStore";
import { resolvePrimaryPhoto } from "../utils/photoUtils";
import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormControlLabel,
  Checkbox,
  IconButton,
  Chip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useAnimation,
} from "framer-motion";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Search,
  Heart,
  X,
  Info,
  Ruler,
  Wine,
  Baby,
  PawPrint,
  HeartHandshake,
  Shield,
  DoorOpen,
  Sun,
  HelpCircle,
  Smile,
  Pizza,
  Umbrella,
  Tent,
  Compass,
  Calendar,
  ThumbsUp,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  Home as HomeIcon,
  Briefcase,
  GraduationCap,
  Dumbbell,
  Cigarette,
  Star,
  Vote,
  Globe,
} from "lucide-react";
import UserAvatarButton from "./UserAvatarButton";
import UserCard from "./UserCard";
import { PointsBannerCompact } from "./PointsBanner";

/* ---------------------------------------
   Photos helper (generate multiple crops)
--------------------------------------- */
const personPhotos = (base) => {
  const v = (q) => `${base}?auto=format&fit=crop&${q}&q=80`;
  return [
    v("w=1400&h=1700&crop=faces"),
    v("w=1600&h=1000&crop=faces"),
    v("w=1400&h=1400&crop=faces"),
    v("w=1500&h=1900&crop=focalpoint&fp-x=0.35&fp-y=0.35"),
    v("w=1500&h=1900&crop=focalpoint&fp-x=0.65&fp-y=0.40"),
    v("w=1600&h=1200&crop=focalpoint&fp-x=0.50&fp-y=0.20"),
  ];
};

/* ---------------------------------------
   Demo users
--------------------------------------- */
const baseUsers = [
  {
    id: 1,
    name: "Maya",
    age: 27,
    gender: "Woman",
    city: "Tel Aviv",
    distance: 0.6,
    profession: "Product Designer",
    education: "Tel Aviv University",
    tagline: "Here for the rooftop event tonight 🌃",
    bio: "Creative soul who loves exploring new places and meeting interesting people. Always up for a good conversation over coffee.",
    interests: ["Design", "Yoga", "Music", "Coffee", "Bars", "Beaches"],
    matchDistance: 0.18,
    likesYou: true,
    verified: true,
    base: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    aboutMe: ["170 cm", "Sometimes drinks", "Likes pets"],
    lookingFor: ["Relationship"],
    qualities: ["Humor", "Kindness", "Openness"],
    height: 170,
    location: "Tel Aviv",
    hometown: "Haifa",
    exercise: "Active",
    drinking: "I drink sometimes",
    smoking: "Never",
    kids: "Not sure",
    starSign: "Taurus",
    politics: "Moderate",
    languages: ["English", "Hebrew"],
    causes: ["Environment", "Education"],
    spotifyPlaylists: [
      { name: "Chill Vibes", artist: "Various Artists", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" },
      { name: "Morning Coffee", artist: "Acoustic Covers", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
      { name: "Workout Mix", artist: "Top Hits", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: 2,
    name: "Noa",
    age: 29,
    gender: "Woman",
    city: "Givatayim",
    distance: 0.9,
    profession: "Data Scientist",
    education: "Hebrew University",
    tagline: "Just moved to the neighborhood 🏠",
    bio: "Data nerd by day, bookworm by night. Love hiking and discovering new recipes.",
    interests: ["Hiking", "Books", "Cooking", "Wine"],
    matchDistance: 0.22,
    likesYou: false,
    verified: true,
    base: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    aboutMe: ["165 cm", "Rarely drinks", "Wants kids"],
    lookingFor: ["Relationship"],
    qualities: ["Kindness", "Curiosity", "Humor"],
    height: 165,
    location: "Givatayim",
    hometown: "Jerusalem",
    exercise: "Sometimes",
    drinking: "Rarely",
    smoking: "Never",
    kids: "Want someday",
    starSign: "Virgo",
    politics: "Liberal",
    languages: ["Hebrew", "English", "French"],
    causes: ["Animal rights"],
    spotifyPlaylists: [
      { name: "Indie Folk", artist: "Various Artists", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&h=200&fit=crop" },
      { name: "Study Focus", artist: "Lo-Fi Beats", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: 3,
    name: "Lior",
    age: 26,
    gender: "Woman",
    city: "Tel Aviv",
    distance: 1.2,
    profession: "UX Researcher",
    education: "Bezalel Academy",
    tagline: "Working from the coffee shop nearby ☕",
    bio: "Passionate about design and capturing moments. Always looking for the next adventure.",
    interests: ["Photography", "Art", "Pilates", "Music"],
    matchDistance: 0.28,
    likesYou: false,
    verified: false,
    base: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    aboutMe: ["168 cm", "Doesn't smoke", "Likes pets"],
    lookingFor: ["Something casual"],
    qualities: ["Openness", "Humor", "Stability"],
    height: 168,
    location: "Tel Aviv",
    hometown: "Herzliya",
    exercise: "Active",
    drinking: "Socially",
    smoking: "Never",
    kids: "Not sure",
    starSign: "Leo",
    politics: "Progressive",
    languages: ["Hebrew", "English"],
    causes: ["Arts", "LGBTQ+"],
    spotifyPlaylists: [
      { name: "Creative Flow", artist: "Ambient", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&h=200&fit=crop" },
      { name: "Pilates Beats", artist: "Electronic", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: 4,
    name: "Dana",
    age: 30,
    gender: "Woman",
    city: "Ramat Gan",
    distance: 0.4,
    profession: "Product Manager",
    education: "Technion",
    tagline: "Training for the TLV marathon 🏃‍♀️",
    bio: "Tech enthusiast who loves running and exploring new places. Looking for someone to share adventures with.",
    interests: ["Running", "Tech", "Travel", "Yoga"],
    matchDistance: 0.12,
    likesYou: false,
    verified: true,
    base: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
    aboutMe: ["172 cm", "Sometimes drinks", "No kids"],
    lookingFor: ["Relationship"],
    qualities: ["Ambition", "Loyalty", "Positivity"],
    height: 172,
    location: "Ramat Gan",
    hometown: "Haifa",
    exercise: "Very active",
    drinking: "Sometimes",
    smoking: "Never",
    kids: "Don't have",
    starSign: "Aries",
    politics: "Moderate",
    languages: ["Hebrew", "English", "Spanish"],
    causes: ["Tech for good", "Health"],
    spotifyPlaylists: [
      { name: "Running Hits", artist: "Pop Mix", image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200&h=200&fit=crop" },
      { name: "Tech Podcasts", artist: "Various", image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: 5,
    name: "Shira",
    age: 26,
    gender: "Woman",
    city: "Tel Aviv",
    distance: 0.3,
    profession: "Photographer",
    education: "Bezalel Academy",
    tagline: "It's a Match! 💕",
    bio: "Capturing moments and creating memories. Love spontaneous adventures and deep conversations.",
    interests: ["Photography", "Travel", "Art", "Coffee", "Music", "Nature"],
    matchDistance: 0.12,
    likesYou: true,
    isMatch: true,
    verified: true,
    base: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    aboutMe: ["165 cm", "Social drinker", "Cat lover"],
    lookingFor: ["Relationship", "Something serious"],
    qualities: ["Creative", "Adventurous", "Authentic"],
    height: 165,
    location: "Tel Aviv",
    hometown: "Jerusalem",
    exercise: "Sometimes",
    drinking: "Socially",
    smoking: "Never",
    kids: "Want someday",
    starSign: "Pisces",
    politics: "Liberal",
    languages: ["Hebrew", "English", "Italian"],
    causes: ["Arts", "Environment"],
    spotifyPlaylists: [
      { name: "Sunset Vibes", artist: "Chill Mix", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" },
      { name: "Road Trip", artist: "Indie Folk", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" },
    ],
  },
];

const demoUsers = baseUsers.map((u) => {
  const photos = personPhotos(u.base);
  return { ...u, photos, photoUrl: photos[0] };
});

// Transform to UserCardModel format (per spec section 7)
const transformToUserCardModel = (user) => ({
  id: user.id, // Keep numeric ID for navigation
  userId: String(user.id),
  firstName: user.name,
  age: user.age,
  distanceMeters: user.distance * 1000, // Convert km to meters
  primaryPhotoUrl: user.primaryPhotoUrl || user.photoUrl || (user.photos && user.photos[0]) || '',
  photos: user.photos || [user.primaryPhotoUrl || user.photoUrl].filter(Boolean), // Include all photos for scrolling
  // New spec fields
  liveStatus: user.liveStatus || user.tagline || null, // Max 60 chars, optional emoji
  primaryRole: user.profession && user.profession.length <= 40 ? user.profession : null, // Max 40 chars
  topInterests: user.interests?.slice(0, 3).map(interest => ({
    label: typeof interest === 'string' ? interest : interest.label,
    icon: null // Will be auto-generated by UserCard
  })) || null, // Max 3 interests for preview
  contextLine: user.tagline || user.profession || 'Looking for genuine connections',
  // Chip generation fields (auto-generated if chips not provided)
  height: user.height != null ? String(user.height) : user.aboutMe?.find(a => a.includes('cm'))?.replace(' cm', ''),
  drinking: user.drinking || user.aboutMe?.find(a => a.toLowerCase().includes('drink'))?.replace('Sometimes drinks', 'Sometimes drinks'),
  professionalField: user.professionalField || (user.interests?.find(i => ['Tech', 'Design', 'Art', 'Marketing', 'Finance'].includes(i))),
  chips: null, // Let UserCard auto-generate from height, drinking, professionalField
  isVerified: user.verified || false,
  isMatch: user.isMatch || false,
  likesYou: user.likesYou || false,
  // Profile details (for expanded view only - NOT shown on main card)
  bio: user.bio || user.tagline || '',
  occupation: user.profession,
  education: user.education,
  gender: user.gender,
  location: user.location || user.city,
  hometown: user.hometown,
  // Interests and values
  interests: user.interests,
  lookingFor: user.lookingFor,
  qualities: user.qualities,
  causes: user.causes,
  // Lifestyle (for expanded view only)
  exercise: user.exercise,
  smoking: user.smoking,
  kids: user.kids,
  starSign: user.starSign,
  // More info (for expanded view only)
  politics: user.politics,
  languages: user.languages,
  spotifyPlaylists: user.spotifyPlaylists,
  // Keep original data for expanded profile
  _original: user,
});

/* ---------------------------------------
   Prefs / theme
--------------------------------------- */
const SAFE_BOTTOM =
  "calc(var(--app-bottom-nav-height, 88px) + env(safe-area-inset-bottom, 0px))";

const DEFAULT_PREFS = {
  maxDistanceKm: 5,
  genders: ["female"],
  ageRange: [18, 60],
};

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem("userPrefs");
    const base = raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
    // force women-only for now (include both "female" and "Woman" for compatibility)
    return { ...base, genders: ["female", "Woman"] };
  } catch {
    return DEFAULT_PREFS;
  }
};

const savePrefs = (p) =>
  localStorage.setItem("userPrefs", JSON.stringify(p));

const DEFAULT_BRAND = { primary: "#6C5CE7", accent: "#F43F5E" };
const DEFAULT_TAG_STYLE = "soft";
const DEFAULT_RADIUS = 999;

function loadAppSettings() {
  try {
    const fromWindow =
      typeof window !== "undefined" ? window.APP_SETTINGS : null;
    const fromLocal =
      localStorage.getItem("app.settings") ||
      localStorage.getItem("appTheme");
    const parsed = fromLocal ? JSON.parse(fromLocal) : {};
    const brand =
      parsed.brand || parsed.palette || fromWindow?.brand || DEFAULT_BRAND;
    const tagStyle =
      parsed.tagStyle || fromWindow?.tagStyle || DEFAULT_TAG_STYLE;
    const radius =
      parsed.radius ?? fromWindow?.radius ?? DEFAULT_RADIUS;
    return { brand, tagStyle, radius };
  } catch {
    return {
      brand: DEFAULT_BRAND,
      tagStyle: DEFAULT_TAG_STYLE,
      radius: DEFAULT_RADIUS,
    };
  }
}

/* ---------------------------------------
   Helpers
--------------------------------------- */
const formatDistance = (km) =>
  km < 1
    ? `${Math.round(km * 1000)} m`
    : `${Math.round(km * 10) / 10} km`;

const chipIconFor = (section, text) => {
  const t = (text || "").toLowerCase();
  if (section === "about") {
    if (t.includes("cm")) return <Ruler size={14} />;
    if (t.includes("drink")) return <Wine size={14} />;
    if (t.includes("kid")) return <Baby size={14} />;
    if (t.includes("pet")) return <PawPrint size={14} />;
    return <Info size={14} />;
  }
  if (section === "looking") {
    if (t.includes("partner")) return <HeartHandshake size={14} />;
    if (t.includes("confidence")) return <Shield size={14} />;
    if (t.includes("open")) return <DoorOpen size={14} />;
    if (t.includes("optim")) return <Sun size={14} />;
    if (t.includes("kind")) return <Heart size={14} />;
    if (t.includes("curio")) return <HelpCircle size={14} />;
    if (t.includes("humor") || t.includes("fun")) return <Smile size={14} />;
    return <Search size={14} />;
  }
  if (section === "interests") {
    if (t.includes("wine")) return <Wine size={14} />;
    if (t.includes("pizza")) return <Pizza size={14} />;
    if (t.includes("beach")) return <Umbrella size={14} />;
    if (t.includes("camp")) return <Tent size={14} />;
    if (t.includes("positiv") || t.includes("sun")) return <Sun size={14} />;
    return <Info size={14} />;
  }
  return <Info size={14} />;
};

/* ---------------------------------------
   TagPill chip
--------------------------------------- */
function TagPill({
  icon,
  label,
  brand,
  variant = "soft",
  radius = 999,
  size = "small",
}) {
  const padY = size === "small" ? 0.4 : 0.6;
  const padX = size === "small" ? 0.9 : 1.1;
  const font = size === "small" ? 12 : 13;
  const bgSoft = alpha(brand.primary, 0.08);
  const bdSoft = alpha(brand.primary, 0.18);
  const variants = {
    soft: {
      bgcolor: bgSoft,
      border: `1px solid ${bdSoft}`,
      color: brand.primary,
    },
    outline: {
      bgcolor: "transparent",
      border: `1px solid ${alpha(brand.primary, 0.35)}`,
      color: brand.primary,
    },
    glass: {
      bgcolor: "rgba(255,255,255,0.65)",
      border: `1px solid rgba(0,0,0,0.06)`,
      color: "#0f172a",
      backdropFilter: "blur(6px)",
    },
  };
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: radius,
        px: padX,
        py: padY,
        fontSize: font,
        gap: 0.6,
        ...variants[variant],
      }}
    >
      {icon ? (
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            "& svg": { width: 14, height: 14 },
          }}
        >
          {icon}
        </Box>
      ) : null}
      <Typography component="span" sx={{ fontWeight: 600, fontSize: font }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ---------------------------------------
   Today's Picks - Per Product Spec v1 (Locked)
   
   Purpose: Focus mechanism to reduce choice overload
   Rules:
   - 3-5 picks max, fixed per day
   - No pagination, no "see more", no refill
   - No ranking badges, no FOMO mechanics
   - Calm, intentional, trust-building tone
--------------------------------------- */

// Subtle subtitles (rotated daily, non-urgent)
const PICKS_SUBTITLES = [
  "Handpicked for today",
  "Active around you today", 
  "Relevant right now",
];

function TodaysPicks({ users = [], brand, onCardClick, onPickViewed }) {
  const containerRef = useRef(null);
  
  // Get today's subtitle (changes daily, not randomly)
  const todaySubtitle = PICKS_SUBTITLES[new Date().getDate() % PICKS_SUBTITLES.length];
  
  // Limit to 3-5 picks max (spec: hard limit)
  const picks = users.slice(0, 5);
  
  // Track view event on mount
  useEffect(() => {
    if (picks.length > 0 && onPickViewed) {
      onPickViewed();
    }
  }, [picks.length, onPickViewed]);

  const handleCardClick = (e, user, index) => {
    e.stopPropagation();
    if (onCardClick) onCardClick(user, index);
  };

  // Empty state per spec
  if (picks.length === 0) {
    return (
      <Box 
        sx={{ 
          mt: 2, 
          mx: 2,
          p: 3,
          textAlign: "center",
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: 3,
          border: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ fontSize: 40, mb: 1 }}>✨</Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}
        >
          All caught up!
        </Typography>
        <Typography
          sx={{ fontSize: 13, color: "#64748b", mb: 2, lineHeight: 1.5 }}
        >
          You've seen all your picks for today! ✨<br />
          Tomorrow brings new possibilities.
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            // Scroll to Discover section
            const discoverSection = document.querySelector('[data-section="discover"]');
            if (discoverSection) {
              discoverSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          sx={{ 
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' },
          }}
        >
          Keep exploring
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mx: -2 }}> {/* Negative margin to extend beyond parent padding */}
      {/* Section header */}
      <Box sx={{ px: 4, mb: 1.5 }}> {/* Extra padding to compensate for negative margin */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 800, color: "#0f172a" }}
        >
          Today's Picks
        </Typography>
        <Typography
          sx={{ fontSize: 12, color: "#64748b", mt: 0.25 }}
        >
          {todaySubtitle}
        </Typography>
      </Box>

      {/* Cards - horizontal scrolling (MANDATORY per spec) */}
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-start",
          overflowX: "auto",
          overflowY: "visible",
          pb: 3,
          pt: 2,
          px: 4, // Extra padding to compensate for negative margin
          gap: 1.5,
          // Smooth horizontal scroll, no snapping required per spec
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          // Ensure cards are partially visible at edges to indicate scrollability
          maskImage: "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
        }}
      >
        {picks.map((u, i) => {
          // Subtle tilt for visual interest (not ranking)
          const baseRotation = picks.length > 1 ? -4 + (i * (8 / (picks.length - 1 || 1))) : 0;
          
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => handleCardClick(e, u, i)}
              style={{
                flexShrink: 0,
                cursor: "pointer",
                transformOrigin: "bottom center",
                transform: `rotate(${baseRotation}deg)`,
                scrollSnapAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 130,
                  height: 180,
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: `0 8px 24px ${alpha("#000", 0.15)}, 0 2px 8px ${alpha("#000", 0.1)}`,
                  background: "#fff",
                  transition: "box-shadow 0.2s ease",
                  "&:hover": {
                    boxShadow: `0 12px 32px ${alpha("#000", 0.2)}, 0 4px 12px ${alpha("#000", 0.12)}`,
                  },
                }}
              >
                {/* Photo */}
                <Box sx={{ height: "100%", position: "relative" }}>
                  <Box
                    component="img"
                    src={resolvePrimaryPhoto(u)}
                    alt={u.name || u.firstName}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {/* Status badge - LOCKED to "Worth a look" per spec */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(100, 116, 139, 0.85)',
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ fontSize: 10 }}
                    >
                      ✨
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: "#fff",
                        textTransform: "none",
                        letterSpacing: 0.2,
                      }}
                    >
                      Worth a look
                    </Typography>
                  </Box>
                  {/* Gradient overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "50%",
                      background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
                    }}
                  />
                  {/* Name + age + distance */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      left: 8,
                      right: 8,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#fff",
                        fontSize: 13,
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                        lineHeight: 1.2,
                      }}
                    >
                      {u.name || u.firstName}, {u.age}
                    </Typography>
                    {u.distance != null && (
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.85)",
                          mt: 0.25,
                        }}
                      >
                        {u.distance < 1 ? `${Math.round(u.distance * 1000)}m` : `${u.distance.toFixed(1)}km`} away
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}

/* ---------------------------------------
   MAIN SCREEN (Home)
--------------------------------------- */
export default function Home({ onOpenTutorial }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Track if we've initialized from URL (only do it once per mount)
  const initializedFromUrlRef = useRef(false);
  
  // Read initial card index from URL (single source of truth)
  const getUrlCardIndex = () => parseInt(searchParams.get('card') || '0', 10);
  
  // Read userId from URL for anchor-based restoration
  const getUrlUserId = () => {
    const userParam = searchParams.get('user');
    return userParam ? parseInt(userParam, 10) : null;
  };
  
  // Logging will be added after state initialization

  // === GLOBAL STORE FOR STATE PERSISTENCE ACROSS ROUTE TRANSITIONS ===
  const {
    users: cachedUsers,
    isUsersLoaded: isCachedUsersLoaded,
    setUsers: setCachedUsers,
    likedUsers,
    passedUsers,
    swipeHistory,
    anchorUserId,
    setLikedUsers,
    setPassedUsers,
    setSwipeHistory,
    addLikedUser,
    addPassedUser,
    removeLikedUser,
    removePassedUser,
    addSwipeHistory,
    popSwipeHistory,
    getLastSwipeHistory,
    setAnchor,
    clearAnchor,
    resetDeck,
    addLikedProfile,
    removeLikedProfile,
  } = useHomeDeckStore();

  // Use cached users if available, otherwise local state for loading
  const [localUsers, setLocalUsers] = useState([]);
  const users = isCachedUsersLoaded ? cachedUsers : localUsers;
  const setUsers = isCachedUsersLoaded ? setCachedUsers : setLocalUsers;
  
  const [isLoadingUsers, setIsLoadingUsers] = useState(!isCachedUsersLoaded);

  // Fetch users from API on mount (only if not already cached)
  useEffect(() => {
    console.log(`[Home] MOUNT: isCachedUsersLoaded=${isCachedUsersLoaded} cachedUsersCount=${cachedUsers.length} likedUsersCount=${likedUsers.length} passedUsersCount=${passedUsers.length} anchorUserId=${anchorUserId}`);
    
    if (isCachedUsersLoaded && cachedUsers.length > 0) {
      console.log(`[Home] Using cached users: count=${cachedUsers.length} likedCount=${likedUsers.length} passedCount=${passedUsers.length}`);
      setIsLoadingUsers(false);
      return;
    }
    
    const fetchUsers = async () => {
      console.log('[Home] Fetching users from API...');
      try {
        const response = await fetch('/api/nearby-users?limit=20');
        console.log('[Home] API response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('[Home] Received', data.users?.length, 'users from API');
          
          // Transform API users to match expected format - use actual API data, not constant fallbacks
          const apiUsers = data.users.map((user, index) => ({
            id: user.id,
            name: user.firstName,
            firstName: user.firstName,
            age: user.age,
            gender: user.gender,
            city: user.location,
            distance: (user.distanceMeters || 500) / 1000,
            distanceMeters: user.distanceMeters,
            profession: '',
            education: '',
            tagline: user.bio,
            bio: user.bio,
            interests: user.interests || [],
            matchDistance: 0.2,
            likesYou: index % 3 === 0,
            verified: true,
            photos: user.photos || [],
            primaryPhotoUrl: user.primaryPhotoUrl || user.photos?.[0] || '',
            photoUrl: user.primaryPhotoUrl || user.photos?.[0] || '',
            base: (user.photos?.[0] || '').split('?')[0],
            aboutMe: [],
            lookingFor: user.lookingFor ? [user.lookingFor] : [],
            qualities: [],
            height: user.height,
            location: user.location,
            hometown: user.hometown,
            exercise: user.exercise,
            drinking: user.drinking,
            smoking: user.smoking,
            kids: user.kids,
            starSign: user.starSign,
            politics: '',
            languages: ['Hebrew', 'English'],
            causes: [],
            spotifyPlaylists: [],
            favoriteMusic: user.favoriteMusic,
            diet: user.diet,
            pets: user.pets,
          }));
          
          if (apiUsers.length > 0) {
            console.log(`[Home] beforeSetUsers: deckIndex=${deckIndexRef.current} usersCount=0 apiUsersCount=${apiUsers.length}`);
            setCachedUsers(apiUsers); // Store in global cache
            setLocalUsers(apiUsers);
            console.log(`[Home] afterSetUsers: deckIndex=${deckIndexRef.current} usersCount=${apiUsers.length}`);
          }
        } else {
          console.warn('[Home] API failed, using demo users as fallback');
          setCachedUsers(demoUsers);
          setLocalUsers(demoUsers);
        }
      } catch (error) {
        console.error('[Home] Error fetching users:', error);
        // Fallback to demo users on error
        setCachedUsers(demoUsers);
        setLocalUsers(demoUsers);
      } finally {
        setIsLoadingUsers(false);
        console.log(`[Home] loadingDone: deckIndex=${deckIndexRef.current} isLoading=false`);
      }
    };
    
    fetchUsers();
  }, [isCachedUsersLoaded, cachedUsers.length, setCachedUsers]);

  // prefs
  const [prefs, setPrefs] = useState(loadPrefs());
  const [filtersOpen, setFiltersOpen] = useState(false);

  // swipe state - restore from URL query param (single source of truth)
  // Use ref to track the index so we don't lose it on re-renders
  const deckIndexRef = useRef(getUrlCardIndex());
  const [deckIndexRaw, setDeckIndexRaw] = useState(() => {
    const initial = getUrlCardIndex();
    initializedFromUrlRef.current = true;
    return initial;
  });
  
  // Track filtered length in a ref for safe access in callbacks
  const filteredLengthRef = useRef(0);
  
  // Track previous filtered state for change detection
  const prevFilteredRef = useRef({ count: 0, idsHash: '', reason: 'init' });
  
  // Safe setter that validates index before setting
  const setDeckIndex = (valueOrUpdater, source = 'unknown') => {
    setDeckIndexRaw(prev => {
      const maxIndex = Math.max(0, filteredLengthRef.current - 1);
      let next;
      if (typeof valueOrUpdater === 'function') {
        next = valueOrUpdater(prev);
      } else {
        next = valueOrUpdater;
      }
      // Clamp to valid range BEFORE setting
      const clamped = Math.max(0, Math.min(next, maxIndex));
      if (clamped !== next) {
        console.log(`[Home] deckIndexChange: prev=${prev} next=${next} clamped=${clamped} source=${source} filteredCount=${filteredLengthRef.current}`);
      } else if (clamped !== prev) {
        console.log(`[Home] deckIndexChange: prev=${prev} next=${clamped} source=${source} filteredCount=${filteredLengthRef.current}`);
      }
      return clamped;
    });
  };
  
  // Alias for external access
  const deckIndex = deckIndexRaw;
  
  // Keep ref in sync with state
  useEffect(() => {
    deckIndexRef.current = deckIndex;
  }, [deckIndex]);
  
  // Sync deckIndex with URL ONLY on Back navigation (when URL changes externally)
  // This should NOT run after our own setSearchParams calls
  const lastUrlCardRef = useRef(searchParams.get('card'));
  useEffect(() => {
    const currentUrlCard = searchParams.get('card');
    // Only sync if URL changed externally (not by our own setSearchParams)
    if (currentUrlCard !== lastUrlCardRef.current) {
      const urlIndex = parseInt(currentUrlCard || '0', 10);
      console.log('[Home] URL changed externally:', lastUrlCardRef.current, '->', currentUrlCard);
      lastUrlCardRef.current = currentUrlCard;
      if (urlIndex !== deckIndex) {
        setDeckIndex(urlIndex, 'urlSync');
      }
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // likedUsers, passedUsers, swipeHistory now come from global store (useHomeDeckStore)
  const [photoIdx, setPhotoIdx] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState([
    { type: 'system', text: 'Console ready. Type "help" for available commands.' }
  ]);

  // Reset all cards function
  const resetAllCards = () => {
    setDeckIndex(0, 'reset');
    setLikedUsers([]);
    setPassedUsers([]);
    setSwipeHistory([]);
  };

  // Console command handler
  const handleConsoleCommand = (cmd) => {
    const command = cmd.trim().toLowerCase();
    const args = command.split(' ');
    const mainCmd = args[0];

    setConsoleOutput(prev => [...prev, { type: 'input', text: `> ${cmd}` }]);

    let response = '';
    
    switch (mainCmd) {
      case 'help':
        response = `Available commands:
- reset: Reset all cards to beginning
- goto [n]: Go to card number n
- status: Show current state
- clear: Clear console
- like: Like current card
- pass: Pass current card
- users: List all users`;
        break;
      case 'reset':
        resetAllCards();
        response = 'All cards reset to beginning.';
        break;
      case 'goto':
        const cardNum = parseInt(args[1]) - 1;
        if (!isNaN(cardNum) && cardNum >= 0 && cardNum < users.length) {
          setDeckIndex(cardNum);
          response = `Moved to card ${cardNum + 1} (${users[cardNum]?.name})`;
        } else {
          response = `Invalid card number. Use 1-${users.length}`;
        }
        break;
      case 'status':
        response = `Card: ${deckIndex + 1}/${users.length} | Liked: ${likedUsers.length} | Passed: ${passedUsers.length} | Current: ${users[deckIndex]?.name || 'none'}`;
        break;
      case 'clear':
        setConsoleOutput([{ type: 'system', text: 'Console cleared.' }]);
        return;
      case 'like':
        if (users[deckIndex]) {
          setLikedUsers(prev => [...prev, users[deckIndex].id]);
          setDeckIndex(prev => prev + 1);
          response = `Liked ${users[deckIndex]?.name}`;
        } else {
          response = 'No card to like';
        }
        break;
      case 'pass':
        if (users[deckIndex]) {
          setPassedUsers(prev => [...prev, users[deckIndex].id]);
          setDeckIndex(prev => prev + 1);
          response = `Passed ${users[deckIndex]?.name}`;
        } else {
          response = 'No card to pass';
        }
        break;
      case 'users':
        response = users.map((u, i) => `${i + 1}. ${u.name}, ${u.age}`).join('\n');
        break;
      default:
        response = `Unknown command: "${mainCmd}". Type "help" for available commands.`;
    }

    setConsoleOutput(prev => [...prev, { type: 'output', text: response }]);
  };

  // Handle undo - go back to previous card
  const handleUndo = () => {
    console.log('[Home] handleUndo called, swipeHistory:', JSON.stringify(swipeHistory));
    console.log('[Home] handleUndo - likedUsers:', JSON.stringify(likedUsers));
    console.log('[Home] handleUndo - passedUsers:', JSON.stringify(passedUsers));
    if (swipeHistory.length === 0) {
      console.log('[Home] handleUndo: No swipe history to undo');
      return;
    }
    
    const lastAction = swipeHistory[swipeHistory.length - 1];
    const currentlyShowingId = topUser?.id ?? 'none';
    popSwipeHistory(); // Use store method to remove last entry
    
    // Remove from liked/passed arrays - this will re-add the user to filtered list
    // Since we don't increment deckIndex on swipe, the current index will now
    // point to the restored user (no need to change deckIndex)
    if (lastAction.action === 'like') {
      removeLikedUser(lastAction.userId); // Use store method
    } else {
      removePassedUser(lastAction.userId); // Use store method
    }
    
    // Log for verification - nowShowingUserId will be the restored user after next render
    console.log(`[Home] undo: restoredUserId=${lastAction.userId} previouslyShowingUserId=${currentlyShowingId}`);
  };
  
  // tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Today's Picks now navigates to full profile page (not popup) per spec
  // selectedPickUser and pickPhotoIndex removed - profile opens via navigate()
  
  // AUTO-RESET removed - now handled by store version check

  // Today's Picks state - SEPARATE from Discover
  // Fetched from dedicated /api/todays-picks endpoint
  // Picks are a locked daily set that shrinks on action, never refills
  const [todaysPicksRaw, setTodaysPicksRaw] = useState([]);
  const [picksLoading, setPicksLoading] = useState(true);
  const todaysPicksFetchedRef = useRef(false);
  
  // todaysPicks filtering moved below where safeLikedUsers/safePassedUsers are defined
  
  // Fetch Today's Picks from dedicated endpoint (NOT from Discover)
  useEffect(() => {
    if (todaysPicksFetchedRef.current) return;
    todaysPicksFetchedRef.current = true;
    
    const fetchTodaysPicks = async () => {
      // Helper to load fallback demo picks - use DIFFERENT users than Discover
      // Today's Picks should be a separate set from the main deck
      const loadFallbackPicks = () => {
        // Use users 3, 4, 5 (Dana, Shira, etc.) for Today's Picks
        // while Discover uses users 1, 2, 3 (Maya, Noa, Lior)
        const fallbackPicks = demoUsers.slice(3, 6).map(u => ({ ...u }));
        // If not enough users, wrap around
        if (fallbackPicks.length === 0) {
          setTodaysPicksRaw(demoUsers.slice(0, 3).map(u => ({ ...u })));
        } else {
          setTodaysPicksRaw(fallbackPicks);
        }
        console.log('[TodaysPicks] Using fallback demo picks:', fallbackPicks.length);
      };

      try {
        setPicksLoading(true);
        // Demo: no user_id means server generates picks for anonymous user
        // Production: would include auth token
        const response = await fetch('/api/todays-picks');
        if (response.ok) {
          const data = await response.json();
          // Transform to match expected format
          const picks = (data.picks || []).map(pick => ({
            id: pick.id,
            name: pick.firstName,
            age: pick.age,
            distance: pick.distanceMeters ? pick.distanceMeters / 1000 : null,
            photoUrl: pick.primaryPhotoUrl,
            photos: pick.photos || [pick.primaryPhotoUrl],
            bio: pick.bio,
            interests: pick.interests || [],
            lookingFor: pick.lookingFor,
            meetingContext: pick.meetingContext, // 'nearby_now', 'active_today', 'good_timing', null
          }));
          if (picks.length > 0) {
            setTodaysPicksRaw(picks);
            console.log('[TodaysPicks] Fetched from API:', picks.length, 'picks');
          } else {
            // API returned empty, use fallback
            loadFallbackPicks();
          }
        } else {
          // API returned error status, use fallback
          console.log('[TodaysPicks] API returned status:', response.status);
          loadFallbackPicks();
        }
      } catch (error) {
        console.error('[TodaysPicks] Failed to fetch:', error);
        loadFallbackPicks();
      } finally {
        setPicksLoading(false);
      }
    };
    
    fetchTodaysPicks();
  }, []);
  
  // Remove a pick when user acts on it (like/pass from pick dialog)
  // Also calls backend to mark as dismissed
  const dismissPick = useCallback(async (userId) => {
    // Optimistically remove from local state
    setTodaysPicksRaw(prev => prev.filter(p => p.id !== userId));
    
    // Notify backend (fire and forget for now)
    try {
      await fetch(`/api/todays-picks/${userId}/dismiss`, {
        method: 'POST',
      });
      console.log('[TodaysPicks] Dismissed pick:', userId);
    } catch (error) {
      console.error('[TodaysPicks] Failed to dismiss:', error);
    }
  }, []);
  
  // Match popup state
  const [matchUser, setMatchUser] = useState(null);

  // Dispatch global match popup event when matchUser changes
  useEffect(() => {
    if (!matchUser) return;
    try {
      window.dispatchEvent(
        new CustomEvent('pulse:show_match', {
          detail: {
            match: {
              id: matchUser.id,
              name: matchUser.name,
              firstName: matchUser.firstName || matchUser.name,
              photo: matchUser.photoUrl,
              photos: matchUser.photos,
            },
            copy: {
              title: "It's a Match",
              subtitle: "You're in sync",
              description: 'Something real can happen now',
              matchedLine: `You and ${matchUser.name} matched!`,
              primaryCta: 'Send a message',
              secondaryCta: 'Keep swiping',
            },
          },
        })
      );
    } catch {
      // ignore
    }
    setMatchUser(null); // Clear local state - global popup handles display
  }, [matchUser]);
  
  // Soft onboarding state
  const [showOnboardingCard, setShowOnboardingCard] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => {
    return localStorage.getItem('pulse_onboarding_dismissed') === 'true';
  });

  // Show onboarding card 5 seconds after mount (simulating 5 minutes for demo)
  useEffect(() => {
    if (onboardingDismissed) return;
    
    const hasSetAvailability = localStorage.getItem('pulse_availability_set') === 'true';
    if (hasSetAvailability) return;
    
    const timer = setTimeout(() => {
      setShowOnboardingCard(true);
    }, 5000); // 5 seconds for demo (would be 5 minutes = 300000 in production)
    
    return () => clearTimeout(timer);
  }, [onboardingDismissed]);

  const handleDismissOnboarding = () => {
    setShowOnboardingCard(false);
    setOnboardingDismissed(true);
    localStorage.setItem('pulse_onboarding_dismissed', 'true');
  };

  // theme / brand
  const [{ brand, tagStyle, radius }, setAppSettings] =
    useState(loadAppSettings());

  useEffect(() => {
    const onStorage = () => setAppSettings(loadAppSettings());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* bg gradients for page */
  const bg1 = alpha(brand.primary, 0.12);
  const bg2 = alpha(brand.accent || brand.primary, 0.1);

  /* filter users by prefs AND remove ones we've handled */
  // Safety: ensure passedUsers and likedUsers are arrays (sessionStorage may have corrupted data)
  const safePassedUsers = Array.isArray(passedUsers) ? passedUsers : [];
  const safeLikedUsers = Array.isArray(likedUsers) ? likedUsers : [];
  
  const filtered = useMemo(() => {
    const { maxDistanceKm, genders, ageRange } = prefs;
    return users
      .filter(
        (u) =>
          u.distance <= maxDistanceKm &&
          genders.includes(u.gender) &&
          u.age >= ageRange[0] &&
          u.age <= ageRange[1]
      )
      .filter((u) => !safePassedUsers.includes(u.id))
      .filter((u) => !safeLikedUsers.includes(u.id));
  }, [users, prefs, safePassedUsers, safeLikedUsers]);

  // Filter out liked/passed users from Today's Picks
  // This ensures picks disappear when user returns from profile page after like/pass
  const todaysPicks = useMemo(() => {
    return todaysPicksRaw.filter(p => 
      !safeLikedUsers.includes(p.id) && !safePassedUsers.includes(p.id)
    );
  }, [todaysPicksRaw, safeLikedUsers, safePassedUsers]);

  // Keep filteredLengthRef in sync for safe clamping in setDeckIndex
  // This runs synchronously during render, not in an effect, to ensure it's always up-to-date
  filteredLengthRef.current = filtered.length;

  // === ANCHOR-BASED RESTORATION ON BACK NAVIGATION ===
  // Priority: 1) anchorUserId from store, 2) user param from URL, 3) card param from URL
  const anchorRestoredRef = useRef(false);
  useEffect(() => {
    if (filtered.length === 0 || anchorRestoredRef.current) return;
    
    // Try store anchor first, then URL user param
    const targetUserId = anchorUserId || getUrlUserId();
    
    if (targetUserId) {
      const anchorIndex = filtered.findIndex(u => u.id === targetUserId);
      if (anchorIndex !== -1) {
        console.log(`[Home] anchorRestore: targetUserId=${targetUserId} (source=${anchorUserId ? 'store' : 'url'}) foundAtIndex=${anchorIndex} currentDeckIndex=${deckIndex}`);
        if (anchorIndex !== deckIndex) {
          setDeckIndex(anchorIndex, 'anchorRestore');
        }
        anchorRestoredRef.current = true;
        if (anchorUserId) clearAnchor(); // Clear store anchor after restoration
      } else {
        console.log(`[Home] anchorRestore: targetUserId=${targetUserId} NOT FOUND in filtered, falling back to card index`);
        if (anchorUserId) clearAnchor();
      }
    }
  }, [anchorUserId, filtered, deckIndex, clearAnchor, searchParams]);

  // Reset anchor restored flag when anchor changes
  useEffect(() => {
    if (!anchorUserId) {
      anchorRestoredRef.current = false;
    }
  }, [anchorUserId]);

  /* pick current / next cards without looping */
  const topUser =
    filtered.length > 0 && deckIndex < filtered.length
      ? filtered[deckIndex]
      : null;

  const nextUser =
    filtered.length > 0 && deckIndex + 1 < filtered.length
      ? filtered[deckIndex + 1]
      : null;

  // === COMPREHENSIVE LOGGING FOR STABILITY VERIFICATION ===
  // Compute stable hash of filtered IDs for change detection
  const filteredIdsHash = filtered.map(u => u.id).join(',');
  const hasPhoto = topUser ? Boolean(topUser.primaryPhotoUrl || topUser.photoUrl || (topUser.photos && topUser.photos[0])) : false;
  
  // Log filtered snapshot on every render for determinism verification
  console.log(`[Home] filteredSnapshot: count=${filtered.length} idsHash=${filteredIdsHash.slice(0, 30)}... currentIndex=${deckIndex} currentUserId=${topUser?.id ?? 'none'} hasPhoto=${hasPhoto}`);
  
  // Detect unexpected filtered changes
  const prevFiltered = prevFilteredRef.current;
  if (prevFiltered.idsHash && filteredIdsHash !== prevFiltered.idsHash) {
    // Determine reason for change
    let reason = 'unknown';
    if (filtered.length === prevFiltered.count - 1) {
      reason = 'swipeRemoval'; // Expected: user was swiped
    } else if (filtered.length === prevFiltered.count + 1) {
      reason = 'undoRestore'; // Expected: user was restored via undo
    } else if (filtered.length > prevFiltered.count + 1) {
      reason = 'apiLoad'; // API loaded more users
    } else if (filtered.length === 0 && prevFiltered.count > 0) {
      reason = 'filtersCleared'; // All users filtered out
    } else {
      reason = 'unexpected'; // This should NOT happen during normal operation
    }
    console.log(`[Home] filteredChanged: prevCount=${prevFiltered.count} nextCount=${filtered.length} prevHash=${prevFiltered.idsHash.slice(0, 20)}... nextHash=${filteredIdsHash.slice(0, 20)}... reason=${reason}`);
  }
  // Update ref for next render
  prevFilteredRef.current = { count: filtered.length, idsHash: filteredIdsHash, reason: 'render' };

  /* reset photo index when card changes + persist deckIndex AND userId to URL */
  useEffect(() => {
    setPhotoIdx(0);
    setImageLoaded(false);
    // Persist both deck index AND userId to URL for robust restoration
    // userId is the primary restoration key, card is fallback
    const currentCard = searchParams.get('card');
    const currentUser = searchParams.get('user');
    const newCard = String(deckIndex);
    const newUser = topUser?.id ? String(topUser.id) : null;
    
    if (newCard !== currentCard || (newUser && newUser !== currentUser)) {
      console.log(`[Home] URL_WRITE: prevCard=${currentCard} nextCard=${newCard} prevUser=${currentUser} nextUser=${newUser} source=deckIndexEffect`);
      // Update our ref BEFORE calling setSearchParams to prevent sync loop
      lastUrlCardRef.current = newCard;
      const params = { card: newCard };
      if (newUser) params.user = newUser;
      setSearchParams(params, { replace: true });
    }
  }, [deckIndex, searchParams, setSearchParams, topUser?.id]);

  /* ---------- swipe physics / visuals ---------- */
  const x = useMotionValue(0);
  const controls = useAnimation();
  const RIGHT_FULL = 320;
  const LEFT_FULL = -320;

  // how far you're dragging → "like" / "nope" intensity
  const likeProgress = useTransform(x, (v) =>
    Math.max(0, Math.min(1, v / 120))
  );
  const nopeProgress = useTransform(x, (v) =>
    Math.max(0, Math.min(1, -v / 120))
  );

  // badge opacity/scale
  const likeOpacity = likeProgress;
  const likeScale = useTransform(likeProgress, [0, 1], [0.9, 2.6]);
  const nopeOpacity = nopeProgress;
  const nopeScale = useTransform(nopeProgress, [0, 1], [0.9, 2.6]);

  // card rotation
  const rotate = useTransform(x, [LEFT_FULL, 0, RIGHT_FULL], [-12, 0, 12]);

  // side glows
  const rightGlow = useTransform(
    likeProgress,
    (p) =>
      `linear-gradient(90deg, rgba(34,197,94,${0.1 * p}) 0%, transparent 30%)`
  );
  const leftGlow = useTransform(
    nopeProgress,
    (p) =>
      `linear-gradient(-90deg, rgba(239,68,68,${0.1 * p}) 0%, transparent 30%)`
  );

  // finalize swipe decision and move to next
  const throwAndNext = async (dir, userForDecision) => {
    const off = (window.innerWidth || 800) + 260;

    // animate throw outward
    await controls.start({
      x: dir * off,
      y: (Math.random() - 0.5) * 80,
      rotate: dir * 25,
      opacity: 0.98,
      transition: { type: "spring", stiffness: 220, damping: 22 },
    });

    // record decision (this is where you'd also call backend)
    if (userForDecision?.id != null) {
      if (dir > 0) {
        // RIGHT = like
        setLikedUsers((arr) =>
          arr.includes(userForDecision.id)
            ? arr
            : [...arr, userForDecision.id]
        );
        // TODO: POST /api/like userForDecision.id
      } else if (dir < 0) {
        // LEFT = pass
        setPassedUsers((arr) =>
          arr.includes(userForDecision.id)
            ? arr
            : [...arr, userForDecision.id]
        );
        // TODO: POST /api/pass userForDecision.id
      }
    }

    // go to next card
    setDeckIndex((i) => i + 1);

    // reset visuals for the next top card
    controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
  };

  // handle letting go of the drag
  const onDragEnd = (_, info) => {
    const { offset, velocity } = info;
    const passRight = offset.x > 140 || velocity.x > 600;
    const passLeft = offset.x < -140 || velocity.x < -600;

    if (passRight) return throwAndNext(+1, topUser); // like
    if (passLeft) return throwAndNext(-1, topUser); // pass

    // not far enough -> snap back
    controls.start({
      x: 0,
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 32,
      },
    });
  };

  /* photo paging inside the card */
  const advancePhoto = (dir = 1) => {
    if (!topUser?.photos?.length) return;
    const total = topUser.photos.length;
    setImageLoaded(false);
    setPhotoIdx((i) => (i + dir + total) % total);
  };

  const currentSrc =
    topUser &&
    (topUser.photos?.length
      ? topUser.photos[photoIdx % topUser.photos.length]
      : topUser.photoUrl);

  return (
    <>
      {/* Top bar with avatar and help */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          pt: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        }}
      >
        {/* Help/Tutorial button */}
        <IconButton
          onClick={() => setShowTutorial(true)}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: '#6C5CE7',
            '&:hover': {
              backgroundColor: '#fff',
            },
          }}
          size="small"
        >
          <HelpCircle size={18} />
        </IconButton>
        {/* avatar / self-profile button */}
        <UserAvatarButton photoUrl={null} />
      </Box>

      <Box
        sx={{
          minHeight: "100vh",
          px: 2,
          pb: `calc(${SAFE_BOTTOM} + 40px)`,
          background: `radial-gradient(1200px 500px at 50% -200px, ${bg1}, transparent 60%), radial-gradient(900px 400px at 10% 120%, ${bg2}, transparent 60%), #fff`,
        }}
      >
        {/* header */}
        <Box
          sx={{
            pt: 2,
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: 0.2 }}
            >
              Home
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#6B7280" }}
            >
              Swipe with purpose ✨
            </Typography>
          </Box>
        </Box>

        {/* Quick actions */}
        <Stack direction="row" spacing={1.25} sx={{ mb: 1.5 }}>
          <QuickAction
            brand={brand}
            onClick={() => {
              // Scroll to Discover section on Home page
              const discoverSection = document.querySelector('[data-section="discover"]');
              if (discoverSection) {
                discoverSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            icon={<Compass size={18} />}
            label="Discover"
          />
          <QuickAction
            brand={brand}
            onClick={() => navigate("/my-events")}
            icon={<Calendar size={18} />}
            label="My Events"
          />
        </Stack>

        {/* Points Banner */}
        <Box sx={{ mb: 1.5 }}>
          <PointsBannerCompact balance={150} />
        </Box>

        {/* Soft Onboarding Card */}
        <AnimatePresence>
          {showOnboardingCard && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  mb: 2,
                  p: 2.5,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(168,85,247,0.08) 100%)',
                  border: '1px solid rgba(108,92,231,0.15)',
                  position: 'relative',
                }}
              >
                {/* Close button */}
                <IconButton
                  size="small"
                  onClick={handleDismissOnboarding}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#94a3b8',
                    '&:hover': { color: '#64748b' },
                  }}
                >
                  <X size={16} />
                </IconButton>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={22} color="#fff" />
                  </Box>
                  <Box sx={{ flex: 1, pr: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                      Want better matches faster?
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 2, lineHeight: 1.5 }}>
                      Tell Pulse where and when you're comfortable being around.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          handleDismissOnboarding();
                          navigate('/settings/location-visibility');
                        }}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2,
                          py: 0.75,
                          background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                          boxShadow: '0 4px 12px rgba(108,92,231,0.3)',
                        }}
                      >
                        Set my availability
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={handleDismissOnboarding}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          color: '#94a3b8',
                          fontWeight: 500,
                        }}
                      >
                        Maybe later
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card stack - UserCard v2 per spec */}
        <Box
          data-section="discover"
          sx={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            mb: 1,
          }}
        >
          {!topUser ? (
            // empty / end-of-deck state
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
                gap: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  mb: 1,
                }}
              >
                You're all caught up
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                Try widening your filters to see more people nearby.
              </Typography>

              <Button
                size="small"
                sx={{ mt: 2, borderRadius: 999 }}
                variant="outlined"
                onClick={() => setFiltersOpen(true)}
              >
                Adjust filters
              </Button>

              <Typography variant="body2" sx={{ color: '#6B7280', mt: 3, fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
                You've seen all your picks for today! ✨<br />
                Tomorrow brings new possibilities.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Hidden element for E2E tests to read current user state */}
              <div
                data-testid="current-user-state"
                data-user-id={topUser.id}
                data-deck-index={deckIndex}
                data-filtered-count={filtered.length}
                style={{ display: 'none' }}
              />
              <UserCard
                key={topUser.id}
                user={transformToUserCardModel(topUser)}
                onLike={async (user) => {
                // Record like - NO need to increment deckIndex because the user
                // is removed from filtered list, so current index now points to next user
                if (topUser?.id != null) {
                  // Capture current state before any changes
                  const currentFilteredLen = filtered.length;
                  const isLastCard = deckIndex >= currentFilteredLen - 1;
                  
                  // Check if this will be a match (they already liked us)
                  const willBeMatch = topUser.likesYou || topUser.isMatch;
                  console.log('[Home] Like action - willBeMatch:', willBeMatch, 'likesYou:', topUser.likesYou, 'isMatch:', topUser.isMatch, 'user:', topUser.name);
                  
                  console.log('[Home] Adding to swipeHistory:', { userId: topUser.id, action: 'like', index: deckIndex });
                  addSwipeHistory({ userId: topUser.id, action: 'like', index: deckIndex });
                  console.log('[Home] Adding to likedUsers:', topUser.id);
                  addLikedUser(topUser.id);
                  
                  // Add full profile to YOU LIKE tab (will be removed if it becomes a match)
                  if (!willBeMatch) {
                    addLikedProfile({
                      id: topUser.id,
                      name: topUser.name || topUser.firstName,
                      age: topUser.age,
                      distance: topUser.distance,
                      city: topUser.city,
                      photoUrl: topUser.photos?.[0] || topUser.photoUrl || '',
                      photos: topUser.photos || [],
                      verified: topUser.verified,
                      interests: topUser.interests || topUser.tags || [],
                      profession: topUser.profession,
                      tagline: topUser.tagline || topUser.bio,
                      aboutMe: topUser.aboutMe || [],
                      lookingFor: topUser.lookingFor || [],
                      status: 'you_liked',
                    });
                  }
                  
                  // Send like to server for persistence and match creation
                  const currentUserId = localStorage.getItem('pulse_user_id');
                  let apiMatch = false;
                  try {
                    const response = await fetch('/api/likes', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        liker_id: currentUserId ? parseInt(currentUserId) : 1,
                        liked_id: topUser.id,
                        source: 'discover',
                      }),
                    });
                    if (response.ok) {
                      const data = await response.json();
                      apiMatch = data.isMatch;
                      console.log('[Home] API response - isMatch:', apiMatch);
                    } else {
                      console.log('[Home] API failed with status:', response.status);
                    }
                  } catch (err) {
                    console.error('[Home] Failed to send like:', err);
                  }
                  
                  // Show match if API says it's a match OR if local data indicates they liked us
                  if (apiMatch || willBeMatch) {
                    console.log('[Home] Triggering match popup for:', topUser.name);
                    // Remove from YOU LIKE tab since it's now a match
                    removeLikedProfile(topUser.id);
                    setMatchUser(topUser);
                  }
                  
                  // If this was the last card, decrement index to stay in bounds
                  if (isLastCard && deckIndex > 0) {
                    setDeckIndex(deckIndex - 1, 'swipeLikeLastCard');
                  }
                }
              }}
              onPass={(user) => {
                // Record pass - NO need to increment deckIndex because the user
                // is removed from filtered list, so current index now points to next user
                if (topUser?.id != null) {
                  // Capture current state before any changes
                  const currentFilteredLen = filtered.length;
                  const isLastCard = deckIndex >= currentFilteredLen - 1;
                  
                  console.log('[Home] Adding to swipeHistory:', { userId: topUser.id, action: 'pass', index: deckIndex });
                  addSwipeHistory({ userId: topUser.id, action: 'pass', index: deckIndex });
                  console.log('[Home] Adding to passedUsers:', topUser.id);
                  addPassedUser(topUser.id);
                  
                  // If this was the last card, decrement index to stay in bounds
                  if (isLastCard && deckIndex > 0) {
                    setDeckIndex(deckIndex - 1, 'swipePassLastCard');
                  }
                }
              }}
              onTap={(user) => {
                // Set anchor before navigating so we can restore on Back
                setAnchor(topUser.id, filteredIdsHash);
                console.log(`[Home] setAnchor: userId=${topUser.id} before navigating to profile`);
                // Navigate to Full Profile Card (UserDetailsScreen) - same as Today's Picks
                sessionStorage.setItem('pulse_profile_source', 'discover');
                navigate(`/user/${topUser.id}`, { state: { from: 'discover', user: topUser } });
              }}
              onUndo={handleUndo}
                canUndo={swipeHistory.length > 0}
                hasLocationPermission={true}
              />
            </>
          )}
        </Box>

        {/* Today's Picks - per product spec v1 */}
        <TodaysPicks 
          users={todaysPicks} 
          brand={brand} 
          onCardClick={(user) => {
            // Analytics: todays_picks_card_opened
            console.log('[Analytics] todays_picks_card_opened', { userId: user.id });
            // Navigate to full profile page (NOT popup) per spec
            // Store source so profile page knows where to return
            sessionStorage.setItem('pulse_profile_source', 'todays_picks');
            navigate(`/user/${user.id}`, { state: { from: 'todays_picks', user } });
          }}
          onPickViewed={() => {
            // Analytics: todays_picks_viewed
            console.log('[Analytics] todays_picks_viewed', { count: todaysPicks.length });
          }}
        />

        {/* Filters dialog */}
        <FiltersDialog
          open={filtersOpen}
          prefs={prefs}
          onClose={() => setFiltersOpen(false)}
          onSave={(p) => {
            // force only female for now until you add gender selector logic
            const fixed = { ...p, genders: ["female"] };
            setPrefs(fixed);
            savePrefs(fixed);
            setFiltersOpen(false);
          }}
        />
      </Box>

      {/* Admin Console */}
      <Dialog
        open={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            bgcolor: '#1a1a2e',
            color: '#fff',
            height: '70vh',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#10b981', fontFamily: 'monospace', py: 1.5, borderBottom: '1px solid #333' }}>
          &gt; Console
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Console output */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              fontFamily: 'monospace',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {consoleOutput.map((line, i) => (
              <Box
                key={i}
                sx={{
                  color: line.type === 'input' ? '#60a5fa' : line.type === 'system' ? '#fbbf24' : '#e5e7eb',
                  whiteSpace: 'pre-wrap',
                  mb: 0.5,
                }}
              >
                {line.text}
              </Box>
            ))}
          </Box>
          
          {/* Console input */}
          <Box sx={{ borderTop: '1px solid #333', p: 1.5, display: 'flex', gap: 1 }}>
            <Typography sx={{ color: '#10b981', fontFamily: 'monospace' }}>&gt;</Typography>
            <input
              type="text"
              value={consoleInput}
              onChange={(e) => setConsoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && consoleInput.trim()) {
                  handleConsoleCommand(consoleInput);
                  setConsoleInput('');
                }
              }}
              placeholder="Type a command..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: 14,
              }}
              autoFocus
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Today's Picks profile now opens as full page via navigate() - dialog removed per spec */}

      {/* It's a Match! Dialog - LEGACY: Now handled by global MatchPulseScreen popup */}
      <Dialog
        open={false && !!matchUser}
        onClose={() => setMatchUser(null)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 0,
            maxWidth: 320,
            width: '90%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #6C5CE7 100%)',
            m: 2,
          },
        }}
      >
        <DialogContent sx={{ p: 0, textAlign: 'center' }}>
          <Box sx={{ p: 3, pb: 2.5 }}>
            {/* Hearts animation */}
            <Box sx={{ fontSize: 36, mb: 1.5 }}>💕</Box>
            
            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#fff',
                mb: 0.5,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              It's a Match!
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, fontSize: 14 }}>
              You and {matchUser?.name} liked each other
            </Typography>
            
            {/* Profile photo */}
            {matchUser && (
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  mx: 'auto',
                  mb: 2,
                  border: '3px solid #fff',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
                }}
              >
                <Box
                  component="img"
                  src={matchUser.photoUrl}
                  alt={matchUser.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            )}
            
            {/* Buttons */}
            <Stack spacing={1}>
              <Button
                variant="contained"
                onClick={() => {
                  const matchId = matchUser?.id;
                  setMatchUser(null);
                  navigate(`/chat/${matchId}`);
                }}
                sx={{
                  bgcolor: '#fff',
                  color: '#ec4899',
                  fontWeight: 700,
                  py: 1.25,
                  borderRadius: '10px',
                  fontSize: 14,
                  '&:hover': { bgcolor: '#f8f8f8' },
                }}
              >
                Send a Message
              </Button>
              <Button
                variant="text"
                onClick={() => setMatchUser(null)}
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Keep Swiping
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>

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
          How to Use
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>👆</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Swipe to Connect
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Swipe right to like, left to pass
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>💕</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Match & Chat
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                When you both like each other, it's a Match!
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>📷</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Tap for More Photos
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Tap left/right on the photo to see more
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
    </>
  );
}

/* ---------------------------------------
   Filters modal + QuickAction button
--------------------------------------- */
function FiltersDialog({ open, onClose, onSave, prefs }) {
  const [local, setLocal] = useState(prefs);

  useEffect(() => setLocal(prefs), [prefs]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Filters</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mt: 1 }}>
          Max distance: {local.maxDistanceKm} km
        </Typography>

        <Slider
          value={local.maxDistanceKm}
          onChange={(_, v) =>
            setLocal((p) => ({
              ...p,
              maxDistanceKm: Number(v),
            }))
          }
          valueLabelDisplay="auto"
          step={1}
          min={1}
          max={50}
        />

        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Age range: {local.ageRange[0]}–{local.ageRange[1]}
        </Typography>

        <Slider
          value={local.ageRange}
          onChange={(_, v) =>
            setLocal((p) => ({ ...p, ageRange: v }))
          }
          valueLabelDisplay="auto"
          step={1}
          min={18}
          max={80}
        />

        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Genders
        </Typography>

        <Stack direction="row" spacing={2}>
          {/* Right now we're forcing "Women" checked only, and Men disabled.
              Later you can make this real.
          */}
          <FormControlLabel
            control={<Checkbox checked disabled />}
            label="Women"
          />
          <FormControlLabel
            control={<Checkbox checked={false} disabled />}
            label="Men"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => onSave(local)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function QuickAction({ icon, label, onClick, brand }) {
  return (
    <Button
      onClick={onClick}
      startIcon={icon}
      variant="outlined"
      sx={{
        flex: 1,
        borderRadius: 999,
        textTransform: "none",
        fontWeight: 700,
        color: brand.primary,
        bgcolor: alpha(brand.primary, 0.06),
        borderColor: alpha(brand.primary, 0.18),
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        "&:hover": {
          bgcolor: alpha(brand.primary, 0.1),
          borderColor: alpha(brand.primary, 0.28),
        },
      }}
    >
      {label}
    </Button>
  );
}
