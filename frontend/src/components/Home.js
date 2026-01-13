import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { useNavigate } from "react-router-dom";
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
    tagline: "It's a Pulse! 💕",
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
  userId: String(user.id),
  firstName: user.name,
  age: user.age,
  distanceMeters: user.distance * 1000, // Convert km to meters
  primaryPhotoUrl: user.photoUrl,
  photos: user.photos || [user.photoUrl], // Include all photos for scrolling
  contextLine: user.tagline || user.profession || 'Looking for genuine connections',
  chips: [
    ...(user.aboutMe || []).slice(0, 2).map(label => ({ label, type: 'factual' })),
    ...(user.interests || []).slice(0, 1).map(label => ({ label, type: 'hobby' })),
  ].slice(0, 3),
  isVerified: user.verified || false,
  isMatch: user.isMatch || false,
  likesYou: user.likesYou || false,
  // Profile details
  bio: user.bio || user.tagline || '',
  occupation: user.profession,
  education: user.education,
  height: user.height || user.aboutMe?.find(a => a.includes('cm'))?.replace(' cm', ''),
  gender: user.gender,
  location: user.location || user.city,
  hometown: user.hometown,
  // Interests and values
  interests: user.interests,
  lookingFor: user.lookingFor,
  qualities: user.qualities,
  causes: user.causes,
  // Lifestyle
  exercise: user.exercise,
  drinking: user.drinking,
  smoking: user.smoking,
  kids: user.kids,
  starSign: user.starSign,
  // More info
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
   Picks carousel ("Today's Picks") - Diagonal stacked cards with horizontal swipe
--------------------------------------- */
function PicksCoverflow({ users = [], brand, onCardClick }) {
  const [pulledCard, setPulledCard] = useState(null);
  const containerRef = useRef(null);

  const handleCardClick = (e, user, index) => {
    e.stopPropagation();
    // Open profile directly on click
    if (onCardClick) onCardClick(user);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5, pl: 2 }}
      >
        Today's Picks
      </Typography>

      {/* Horizontal scrollable cards - each moves independently */}
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-start",
          overflowX: "scroll",
          overflowY: "visible",
          pb: 8,
          pt: 4,
          pl: 3,
          pr: 16,
          minHeight: 300,
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
        onClick={() => setPulledCard(null)}
      >
        {users.map((u, i) => {
          const isPulled = pulledCard === i;
          // Each card has slight tilt
          const baseRotation = -8 + (i * 4);
          
          return (
            <motion.div
              key={u.id}
              initial={false}
              animate={{
                y: isPulled ? -70 : 0,
                scale: isPulled ? 1.15 : 1,
                rotate: isPulled ? 0 : baseRotation,
              }}
              whileHover={{ y: -15, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => handleCardClick(e, u, i)}
              style={{
                flexShrink: 0,
                marginRight: 16,
                scrollSnapAlign: "start",
                cursor: "pointer",
                transformOrigin: "bottom center",
                position: "relative",
                zIndex: isPulled ? 100 : 1,
              }}
            >
              <Box
                sx={{
                  width: 140,
                  height: 200,
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: isPulled 
                    ? `0 30px 60px ${alpha("#000", 0.45)}, 0 0 0 3px ${brand.primary}`
                    : `0 10px 30px ${alpha("#000", 0.3)}, -3px 3px 10px ${alpha("#000", 0.15)}`,
                  background: "#fff",
                  transition: "box-shadow 0.3s ease",
                }}
              >
                {/* Photo */}
                <Box sx={{ height: "100%", position: "relative" }}>
                  <Box
                    component="img"
                    src={u.photoUrl}
                    alt={u.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {/* Gradient overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "55%",
                      background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                    }}
                  />
                  {/* Name overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 10,
                      left: 10,
                      right: 10,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#fff",
                        fontSize: 14,
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      }}
                    >
                      {u.name}, {u.age}
                    </Typography>
                  </Box>
                  {/* Match percentage badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 700,
                      bgcolor: brand.primary,
                      color: "#fff",
                    }}
                  >
                    {Math.round((1 - (u.matchDistance ?? 0.3)) * 100)}%
                  </Box>
                  
                  {/* Tap hint when pulled */}
                  {isPulled && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 999,
                        fontSize: 9,
                        fontWeight: 600,
                        bgcolor: "rgba(255,255,255,0.95)",
                        color: "#1a1a2e",
                      }}
                    >
                      Tap to view
                    </Box>
                  )}
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Box>
      
      {/* Swipe hint */}
      <Typography
        sx={{
          textAlign: "center",
          fontSize: 11,
          color: "#94a3b8",
          mt: -3,
        }}
      >
        ← Swipe to browse • Tap to pull • Tap again to view →
      </Typography>
    </Box>
  );
}

/* ---------------------------------------
   MAIN SCREEN (Home)
--------------------------------------- */
export default function Home({ onOpenTutorial }) {
  const navigate = useNavigate();

  // data
  const [users] = useState(demoUsers);

  // prefs
  const [prefs, setPrefs] = useState(loadPrefs());
  const [filtersOpen, setFiltersOpen] = useState(false);

  // swipe state
  const [deckIndex, setDeckIndex] = useState(0);
  const [likedUsers, setLikedUsers] = useState([]); // right swipes
  const [passedUsers, setPassedUsers] = useState([]); // left swipes
  const [photoIdx, setPhotoIdx] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [swipeHistory, setSwipeHistory] = useState([]); // For undo functionality

  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState([
    { type: 'system', text: 'Console ready. Type "help" for available commands.' }
  ]);

  // Reset all cards function
  const resetAllCards = () => {
    setDeckIndex(0);
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
    if (swipeHistory.length === 0) return;
    
    const lastAction = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory(prev => prev.slice(0, -1));
    
    // Remove from liked/passed arrays
    if (lastAction.action === 'like') {
      setLikedUsers(prev => prev.filter(id => id !== lastAction.userId));
    } else {
      setPassedUsers(prev => prev.filter(id => id !== lastAction.userId));
    }
    
    // Go back to previous index
    setDeckIndex(lastAction.index);
  };
  
  // tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Selected profile from Today's Picks
  const [selectedPickUser, setSelectedPickUser] = useState(null);
  const [pickPhotoIndex, setPickPhotoIndex] = useState(0);
  
  // Match popup state
  const [matchUser, setMatchUser] = useState(null);
  
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
      .filter((u) => !passedUsers.includes(u.id))
      .filter((u) => !likedUsers.includes(u.id));
  }, [users, prefs, passedUsers, likedUsers]);

  /* pick current / next cards without looping */
  const topUser =
    filtered.length > 0 && deckIndex < filtered.length
      ? filtered[deckIndex]
      : null;

  const nextUser =
    filtered.length > 0 && deckIndex + 1 < filtered.length
      ? filtered[deckIndex + 1]
      : null;

  /* reset photo index when card changes */
  useEffect(() => {
    setPhotoIdx(0);
    setImageLoaded(false);
  }, [deckIndex]);

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
            onClick={() => navigate("/discover?smart=1")}
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

              <Button
                size="small"
                sx={{ mt: 1, borderRadius: 999 }}
                variant="contained"
                color="primary"
                onClick={() => {
                  setDeckIndex(0);
                  setLikedUsers([]);
                  setPassedUsers([]);
                  setSwipeHistory([]);
                }}
              >
                Start over
              </Button>
            </Box>
          ) : (
            <UserCard
              user={transformToUserCardModel(topUser)}
              onLike={(user) => {
                // Record like and move to next
                if (topUser?.id != null) {
                  setSwipeHistory(prev => [...prev, { userId: topUser.id, action: 'like', index: deckIndex }]);
                  setLikedUsers((arr) =>
                    arr.includes(topUser.id) ? arr : [...arr, topUser.id]
                  );
                  // Check if it's a match (they already liked you)
                  if (topUser.likesYou || topUser.isMatch) {
                    setMatchUser(topUser);
                  }
                }
                setDeckIndex((i) => i + 1);
              }}
              onPass={(user) => {
                // Record pass and move to next
                if (topUser?.id != null) {
                  setSwipeHistory(prev => [...prev, { userId: topUser.id, action: 'pass', index: deckIndex }]);
                  setPassedUsers((arr) =>
                    arr.includes(topUser.id) ? arr : [...arr, topUser.id]
                  );
                }
                setDeckIndex((i) => i + 1);
              }}
              onTap={(user) => {
                // Navigate to expanded profile
                navigate(`/profile/${user.userId}`);
              }}
              onUndo={handleUndo}
              canUndo={swipeHistory.length > 0}
              hasLocationPermission={true}
            />
          )}
        </Box>

        {/* Picks carousel */}
        <PicksCoverflow 
          users={filtered} 
          brand={brand} 
          onCardClick={(user) => setSelectedPickUser(user)}
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

      {/* Profile from Today's Picks */}
      <Dialog
        open={!!selectedPickUser}
        onClose={() => { setSelectedPickUser(null); setPickPhotoIndex(0); }}
        fullScreen
        PaperProps={{ sx: { bgcolor: '#fff' } }}
      >
        {selectedPickUser && (
          <DialogContent sx={{ p: 0, position: 'relative', overflowY: 'auto' }}>
            {/* Back button */}
            <IconButton
              onClick={() => { setSelectedPickUser(null); setPickPhotoIndex(0); }}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 100,
                bgcolor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#fff' },
              }}
            >
              <ChevronLeft size={24} color="#1a1a2e" />
            </IconButton>

            {/* Photo Gallery with navigation */}
            <Box sx={{ height: '50vh', position: 'relative' }}>
              {/* Photo indicators */}
              {selectedPickUser.photos?.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 16,
                    right: 16,
                    display: 'flex',
                    gap: 0.5,
                    zIndex: 10,
                  }}
                >
                  {selectedPickUser.photos.map((_, i) => (
                    <Box
                      key={i}
                      onClick={() => setPickPhotoIndex(i)}
                      sx={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: i === pickPhotoIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                    />
                  ))}
                </Box>
              )}
              
              <Box
                component="img"
                src={selectedPickUser.photos?.[pickPhotoIndex] || selectedPickUser.photoUrl}
                alt={selectedPickUser.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
              {/* Left/Right navigation arrows */}
              {selectedPickUser.photos?.length > 1 && (
                <>
                  <IconButton
                    onClick={() => setPickPhotoIndex(prev => Math.max(0, prev - 1))}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0,0,0,0.3)',
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                      opacity: pickPhotoIndex === 0 ? 0.3 : 1,
                    }}
                    disabled={pickPhotoIndex === 0}
                  >
                    <ChevronLeft size={24} />
                  </IconButton>
                  <IconButton
                    onClick={() => setPickPhotoIndex(prev => Math.min(selectedPickUser.photos.length - 1, prev + 1))}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0,0,0,0.3)',
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                      opacity: pickPhotoIndex === selectedPickUser.photos.length - 1 ? 0.3 : 1,
                    }}
                    disabled={pickPhotoIndex === selectedPickUser.photos.length - 1}
                  >
                    <ChevronRight size={24} />
                  </IconButton>
                </>
              )}
            </Box>
            
            {/* Like/Nope buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
                py: 2,
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <IconButton
                onClick={() => {
                  setPassedUsers(prev => [...prev, selectedPickUser.id]);
                  setSelectedPickUser(null);
                  setPickPhotoIndex(0);
                }}
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: '#fff',
                  border: '2px solid #ef4444',
                  color: '#ef4444',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
                  '&:hover': { bgcolor: '#fef2f2' },
                }}
              >
                <X size={28} />
              </IconButton>
              <IconButton
                onClick={() => {
                  setLikedUsers(prev => [...prev, selectedPickUser.id]);
                  setSelectedPickUser(null);
                  setPickPhotoIndex(0);
                }}
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: '#fff',
                  border: '2px solid #22c55e',
                  color: '#22c55e',
                  boxShadow: '0 4px 12px rgba(34,197,94,0.2)',
                  '&:hover': { bgcolor: '#f0fdf4' },
                }}
              >
                <Heart size={28} />
              </IconButton>
            </Box>

            {/* Profile info */}
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {selectedPickUser.name}, {selectedPickUser.age}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                {selectedPickUser.distance ? `${selectedPickUser.distance}km away` : selectedPickUser.city}
              </Typography>
              
              {selectedPickUser.bio && (
                <Typography sx={{ mb: 2, color: '#374151' }}>
                  {selectedPickUser.bio}
                </Typography>
              )}

              {/* Looking for */}
              {selectedPickUser.lookingFor && (
                <Box sx={{ mb: 2.5, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
                  <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>Looking for</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{selectedPickUser.lookingFor}</Typography>
                </Box>
              )}

              {/* Interests */}
              {selectedPickUser.interests?.length > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>Interests</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {selectedPickUser.interests.map((interest, i) => (
                      <Chip key={i} label={interest} size="small" sx={{ bgcolor: '#f3f4f6', color: '#374151' }} />
                    ))}
                  </Box>
                </Box>
              )}

              {/* My Details */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>My Details</Typography>
                {selectedPickUser.gender && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <User size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Gender</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.gender}</Typography>
                  </Box>
                )}
                {selectedPickUser.height && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <Ruler size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Height</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.height} cm</Typography>
                  </Box>
                )}
                {selectedPickUser.hometown && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <HomeIcon size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Hometown</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.hometown}</Typography>
                  </Box>
                )}
                {selectedPickUser.profession && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <Briefcase size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Work</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.profession}</Typography>
                  </Box>
                )}
                {selectedPickUser.education && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <GraduationCap size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Education</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.education}</Typography>
                  </Box>
                )}
              </Box>

              {/* Lifestyle */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>Lifestyle</Typography>
                {selectedPickUser.exercise && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <Dumbbell size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Exercise</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.exercise}</Typography>
                  </Box>
                )}
                {selectedPickUser.drinking && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <Wine size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Drinking</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.drinking}</Typography>
                  </Box>
                )}
                {selectedPickUser.smoking && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <Cigarette size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Smoking</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.smoking}</Typography>
                  </Box>
                )}
                {selectedPickUser.kids && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <Baby size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Kids</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.kids}</Typography>
                  </Box>
                )}
                {selectedPickUser.starSign && (
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                    <Star size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Star sign</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.starSign}</Typography>
                  </Box>
                )}
              </Box>

              {/* More */}
              {(selectedPickUser.politics || selectedPickUser.languages?.length > 0) && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>More</Typography>
                  {selectedPickUser.politics && (
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                      <Vote size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                      <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Politics</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.politics}</Typography>
                    </Box>
                  )}
                  {selectedPickUser.languages?.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
                      <Globe size={14} color="#94a3b8" style={{ marginRight: 8 }} />
                      <Typography sx={{ fontSize: 13, color: '#64748b', width: 80, flexShrink: 0 }}>Languages</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{selectedPickUser.languages.join(', ')}</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Spotify Playlists */}
              {selectedPickUser.spotifyPlaylists?.length > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>My Music</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                    {selectedPickUser.spotifyPlaylists.map((playlist, i) => (
                      <Box key={i} sx={{ flexShrink: 0, width: 100, textAlign: 'center' }}>
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            overflow: 'hidden',
                            mb: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                        >
                          <img
                            src={playlist.image || `https://picsum.photos/seed/${playlist.name}/200`}
                            alt={playlist.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }} noWrap>
                          {playlist.name}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: '#64748b' }} noWrap>
                          {playlist.artist}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
        )}
      </Dialog>

      {/* It's a Match! Dialog */}
      <Dialog
        open={!!matchUser}
        onClose={() => setMatchUser(null)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 0,
            maxWidth: 360,
            width: '100%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #6C5CE7 100%)',
          },
        }}
      >
        <DialogContent sx={{ p: 0, textAlign: 'center' }}>
          <Box sx={{ p: 4, pb: 3 }}>
            {/* Hearts animation */}
            <Box sx={{ fontSize: 48, mb: 2 }}>💕</Box>
            
            {/* Title */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#fff',
                mb: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              It's a Pulse!
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
              You and {matchUser?.name} liked each other
            </Typography>
            
            {/* Profile photo */}
            {matchUser && (
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  mx: 'auto',
                  mb: 3,
                  border: '4px solid #fff',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
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
            <Stack spacing={1.5}>
              <Button
                variant="contained"
                onClick={() => {
                  setMatchUser(null);
                  navigate('/chat');
                }}
                sx={{
                  bgcolor: '#fff',
                  color: '#ec4899',
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: '12px',
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
                When you both like each other, it's a Pulse!
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
