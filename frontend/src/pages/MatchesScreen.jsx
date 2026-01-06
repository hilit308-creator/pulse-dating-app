// MatchesScreen.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Stack,
  Tabs,
  Tab,
  Card,
  CardContent,
  Skeleton,
  IconButton,
  Slider,
  Tooltip,
  Badge,
  Select,
  MenuItem,
  LinearProgress,
  Drawer,
  Divider,
  Switch,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useLanguage } from '../context/LanguageContext';
import {
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
  Flag,
  SlidersHorizontal,
  ShieldCheck,
  Filter,
  Lock,
  ChevronDown,
  ChevronUp,
  MapPin,
  Ruler,
  Wine,
  Baby,
  PawPrint,
  HelpCircle,
  Sun,
  DoorOpen,
  HeartHandshake,
} from "lucide-react";

/* =============================
   Demo Data
============================= */
const demoMatches = [
  {
    id: 6,
    name: "Shani",
    age: 24,
    distance: 0.7,
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
    age: 28,
    photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=256&q=80",
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1600&h=1000&q=80",
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=1400&h=1400&q=80",
    ],
    status: "liked_you",
    interestHint: "Travel",
  },
  {
    id: 5,
    name: "Gali",
    age: 25,
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&h=1000&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1400&h=1400&q=80",
    ],
    status: "liked_you",
    interestHint: "Art",
  },
  {
    id: 7,
    name: "Yael",
    age: 26,
    photoUrl: "/gali_1.jpg",
    photos: [
      "/gali_1.jpg",
      "/gali_2.jpg",
      "/gali_3.jpg",
    ],
    status: "liked_you",
    interestHint: "Design",
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
    
    // For now, use demo data but store it with user-specific key
    const syncedData = {
      matches: demoMatches,
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
    
    // Ultimate fallback to demo data
    return {
      matches: demoMatches,
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

function TimerBar({ seconds }) {
  if (seconds <= 0) return null;
  const pct = Math.min(100, Math.max(0, (seconds / 900) * 100)); // 15m window
  return <LinearProgress variant="determinate" value={pct} sx={{ height: 3, borderRadius: 6 }} />;
}

/* Photo Carousel — TikTok-style vertical (9:16 aspect ratio) */
function PhotoCarousel({ photos, name, onPrev, onNext, index }) {
  const canPrev = index > 0;
  const canNext = index < photos.length - 1;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "9 / 16",
        maxHeight: "78vh",
        background: "#F4F6F8",
        overflow: "hidden",
        borderRadius: 4,
      }}
    >
      <img
        key={photos[index]}
        src={photos[index]}
        loading="lazy"
        alt={`${name} ${index + 1}`}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />

      <IconButton
        onClick={onPrev}
        disabled={!canPrev}
        size="small"
        sx={{
          position: "absolute",
          top: "50%",
          left: 8,
          transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.9)",
          color: "#000",
          "&:hover": { bgcolor: "#fff" },
        }}
        aria-label="Previous image"
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        onClick={onNext}
        disabled={!canNext}
        size="small"
        sx={{
          position: "absolute",
          top: "50%",
          right: 8,
          transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.9)",
          color: "#000",
          "&:hover": { bgcolor: "#fff" },
        }}
        aria-label="Next image"
      >
        <ChevronRight />
      </IconButton>

      <Dots count={photos.length} index={index} />
    </Box>
  );
}

/* Profile Card — white details style */
function ProfileCard({ profile, onPass, onOpenChat, onBlock, onReport }) {
  const { t } = useLanguage();
  const photos = profile.photos?.length ? profile.photos : [profile.photoUrl].filter(Boolean);
  const [idx, setIdx] = useState(0);

  const goNext = useCallback(() => setIdx((i) => Math.min(i + 1, photos.length - 1)), [photos.length]);
  const goPrev = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);
  const online = !!profile.online;

  const interests = profile.interests || [];
  const aboutMe = profile.aboutMe || [];
  const lookingFor = profile.lookingFor || [];

  const BRAND_PRIMARY = "#6C5CE7";
  const chipIconFor = (section, text) => {
    const t = (text || "").toLowerCase();
    if (section === "about") {
      if (t.includes("cm")) return <Ruler size={14} />;
      if (t.includes("drink")) return <Wine size={14} />;
      if (t.includes("kid")) return <Baby size={14} />;
      if (t.includes("pet")) return <PawPrint size={14} />;
      return <HelpCircle size={14} />;
    }
    if (section === "looking") {
      if (t.includes("partner")) return <HeartHandshake size={14} />;
      if (t.includes("open")) return <DoorOpen size={14} />;
      if (t.includes("optim")) return <Sun size={14} />;
      return <HelpCircle size={14} />;
    }
    return <HelpCircle size={14} />;
  };

  function TagPill({ label, icon }) {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.6,
          px: 1.1,
          py: 0.6,
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 700,
          bgcolor: "#efeaff",
          color: BRAND_PRIMARY,
          border: `1px solid rgba(108,92,231,0.28)`,
        }}
      >
        {icon ? (
          <Box sx={{ display: "grid", placeItems: "center", "& svg": { width: 14, height: 14 } }}>{icon}</Box>
        ) : null}
        <Typography component="span" sx={{ fontSize: 13, fontWeight: 700 }}>
          {label}
        </Typography>
      </Box>
    );
  }

  return (
    <Card
      sx={{
        overflow: "hidden",
        borderRadius: 4,
        boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
        bgcolor: "#fff",
      }}
    >
      <PhotoCarousel photos={photos} name={profile.name} onPrev={goPrev} onNext={goNext} index={idx} />

      <CardContent sx={{ p: { xs: 1.75, sm: 2 } }}>
        {/* Name */}
        <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
          {profile.name}, {profile.age}
        </Typography>

        {/* Location + distance */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "#475569", mt: 0.25, flexWrap: "wrap" }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <MapPin size={16} />
            <Typography variant="body2">{profile.city || "Tel Aviv"}</Typography>
          </Stack>
          <Typography variant="body2">·</Typography>
          <Typography variant="body2">{(profile.distance ?? 0).toFixed(1)} km away</Typography>
        </Stack>

        {/* Profession */}
        {profile.profession && (
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            {profile.profession}
          </Typography>
        )}

        {/* Tagline */}
        {profile.tagline && (
          <Typography variant="body2" sx={{ color: "#0f172a", mt: 1 }}>
            {profile.tagline}
          </Typography>
        )}

        {/* Details */}
        {aboutMe.length > 0 && (
          <Box sx={{ mt: 1.25 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.6, color: "#0f172a" }}>
              Details
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
              {aboutMe.map((item, i) => (
                <TagPill key={i} icon={chipIconFor("about", item)} label={item} />
              ))}
            </Box>
          </Box>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <Box sx={{ mt: 1.25 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.6, color: "#0f172a" }}>
              Interests
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
              {interests.map((item, i) => (
                <TagPill key={i} icon={chipIconFor("interests", item)} label={item} />
              ))}
            </Box>
          </Box>
        )}

        {/* Looking for */}
        {lookingFor.length > 0 && (
          <Box sx={{ mt: 1.25 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.6, color: "#0f172a" }}>
              Looking for
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
              {lookingFor.map((item, i) => (
                <TagPill key={i} icon={chipIconFor("looking", item)} label={item} />
              ))}
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Stack direction="row" spacing={1} sx={{ mt: 1.75 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => onOpenChat?.(profile)}
            startIcon={<MessageCircle size={16} />}
            sx={{ 
              borderRadius: 999,
              background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)",
              "&:hover": { background: "linear-gradient(135deg, #5a4bd1 0%, #9333ea 100%)" },
            }}
          >
            {t('chat')}
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => onPass?.(profile)} 
            sx={{ 
              borderRadius: 999,
              borderColor: "#6C5CE7",
              color: "#6C5CE7",
              "&:hover": { borderColor: "#5a4bd1", bgcolor: "rgba(108,92,231,0.04)" },
            }}
          >
            {t('pass')}
          </Button>
          <Tooltip title={t('block')}>
            <IconButton onClick={() => onBlock?.(profile)} aria-label="Block">
              <ShieldAlert />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('report')}>
            <IconButton onClick={() => onReport?.(profile)} aria-label="Report">
              <Flag />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* =============================
   Main Screen
============================= */
export default function MatchesScreen() {
  const theme = useTheme();
  const { t } = useLanguage();

  const [tab, setTab] = useState(0);
  const [matches, setMatches] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Blocked profiles (per current user)
  const [blocked, setBlocked] = useState(() => loadBlocks());
  // Reports state
  const [reports, setReports] = useState(() => loadReports());

  // Google Account Sync: Load fresh data on mount/reload
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Sync from Google account
        const syncedData = await syncFromGoogleAccount(GOOGLE_USER_EMAIL);
        
        if (isMounted) {
          setMatches(syncedData.matches);
          setLikes(syncedData.likes);
          setLoading(false);
          
          // Log sync info
          const lastSync = getLastSyncTime();
          console.log('[MatchesScreen] Data loaded from Google account');
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
  }, []); // Runs on every page load/reload

  // countdown for active chats
  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setMatches((prev) =>
          prev.map((m) => (m.chatActive && m.chatTimeLeft > 0 ? { ...m, chatTimeLeft: m.chatTimeLeft - 1 } : m))
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // persist blocks & reports
  useEffect(() => saveBlocks(blocked), [blocked]);
  useEffect(() => saveReports(reports), [reports]);

  const filteredMatches = useMemo(() => {
    let res = matches
      .filter((m) => !blocked.has(m.id))
      .filter((m) => m.age >= ageRange[0] && m.age <= ageRange[1])
      .filter((m) => (maxDistance ? m.distance <= maxDistance : true))
      .filter((m) => (onlyActiveChats ? m.chatActive : true));

    if (sortBy === "distance") return [...res].sort((a, b) => a.distance - b.distance);
    if (sortBy === "compat") return [...res].sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0));
    return [...res].sort((a, b) => b.matchedAt - a.matchedAt);
  }, [matches, blocked, ageRange, maxDistance, onlyActiveChats, sortBy]);

  const handlePass = (p) => setMatches((prev) => prev.filter((x) => x.id !== p.id));
  const handleOpenChat = (p) => {
    // Navigate to chat screen with match data
    window.location.href = `/chat?matchId=${p.id}`;
  };

  // === BLOCK (per user) ===
  const handleBlock = (p) => {
    const next = new Set(blocked);
    next.add(p.id);
    setBlocked(next);
    setSnack({ open: true, msg: `${p.name} has been blocked.`, severity: "info" });
  };

  // === REPORT (with optional note; threshold->queue) ===
  const openReportDialog = (p) => {
    setReportTarget(p);
    setReportNote("");
    setReportOpen(true);
  };
  const submitReport = () => {
    if (!reportTarget) return;
    const id = reportTarget.id;
    const prev = reports[id] || { count: 0, notes: [] };
    const next = {
      count: prev.count + 1,
      notes: reportNote?.trim() ? [...prev.notes, reportNote.trim()] : prev.notes,
    };
    const merged = { ...reports, [id]: next };
    setReports(merged);
    setReportOpen(false);
    setSnack({ open: true, msg: `Report submitted${reportNote.trim() ? " with note" : ""}.`, severity: "success" });

    // threshold = 5 → push to review queue (admin)
    if (next.count >= 5) {
      pushToReviewQueue({
        profileId: id,
        when: new Date().toISOString(),
        notesSnapshot: next.notes.slice(-10), // last notes
      });
      // Here you would call your backend:
      // await fetch("/api/moderation/review-queue", { method: "POST", body: JSON.stringify({...}) })
      setSnack({ open: true, msg: `Profile sent to admin review queue.`, severity: "warning" });
    }
  };

  // **ADMIN BAN (hard ban) — demo only**
  // call this to permanently remove a user from the app (server-side responsibility)
  async function adminBanUser(profileId) {
    // await fetch(`/api/moderation/ban/${profileId}`, { method: "POST" })
    // In UI we can also hide immediately:
    setMatches((prev) => prev.filter((m) => m.id !== profileId));
    setLikes((prev) => prev.filter((l) => l.id !== profileId));
  }

  const handleReport = (p) => openReportDialog(p);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        maxWidth: 520,
        mx: "auto",
        pb: "calc(10px + env(safe-area-inset-bottom, 0))",
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1.25, pt: 0.75, pb: 0.5 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.2,
              fontSize: { xs: 18, sm: 20 },
            }}
          >
            {t('matches')}
          </Typography>
          <Tooltip title={t('filters')}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Filter size={16} />}
              onClick={() => setDrawerOpen(true)}
              sx={{ 
                borderRadius: 999, 
                minHeight: 34,
                borderColor: "#6C5CE7",
                color: "#6C5CE7",
                "&:hover": { borderColor: "#5a4bd1", bgcolor: "rgba(108,92,231,0.04)" },
              }}
            >
              {t('filters')}
            </Button>
          </Tooltip>
        </Stack>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{ 
            ".MuiTab-root": { minWidth: { xs: 140, sm: 160 } },
            "& .MuiTabs-indicator": { backgroundColor: "#6C5CE7" },
            "& .Mui-selected": { color: "#6C5CE7 !important" },
          }}
        >
          <Tab label={t('mutualMatches')} />
          <Tab label={t('interestedInYou')} />
        </Tabs>
      </Box>

      {/* Content */}
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
                py: 8,
                px: 3,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <HeartHandshake size={64} color="#cbd5e1" />
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 2, color: "#1a1a2e" }}>
                {t('noMatchesYet')}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 1, mb: 3 }}>
                {t('yourNextConnection')}
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.href = "/nearby"}
                sx={{
                  py: 1.25,
                  px: 3,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)",
                }}
              >
                {t('goToNearby')}
              </Button>
            </Box>
          ) : (
            <Stack spacing={3}>
              {filteredMatches.map((m) => (
                <ProfileCard
                  key={m.id}
                  profile={m}
                  onPass={(p) => setMatches((prev) => prev.filter((x) => x.id !== p.id))}
                  onOpenChat={(p) => (window.location.href = `/chat?matchId=${p.id}`)}
                  onBlock={handleBlock}
                  onReport={handleReport}
                />
              ))}
            </Stack>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ px: 1.25, pt: 1.25 }}>
          {loading ? (
            <Skeleton variant="rounded" height={110} sx={{ mb: 1.25 }} />
          ) : likes.length === 0 ? (
            <Typography sx={{ color: "text.secondary", textAlign: "center", mt: 4 }}>
              {t('keepExploring')}
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {likes
                .filter((l) => !blocked.has(l.id))
                .map((l) => (
                  <Card
                    key={l.id}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 10, p: 1.25 }}>
                      <Avatar src={l.photoUrl} sx={{ width: 44, height: 44, filter: "blur(1.2px)" }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: 15 }}>
                          {t('someoneLikedYou')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {l.interestHint ? `Hint: likes ${l.interestHint}` : ""}
                        </Typography>
                      </Box>
                      <Button variant="contained" size="small" startIcon={<Lock />} sx={{ minHeight: 34, background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)" }}>
                        {t('unlock')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </Stack>
          )}
        </Box>
      )}

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

      {/* Report Dialog */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('reportUser')}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t('tellUsWhatHappened')}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            placeholder={t('writeNote')}
            value={reportNote}
            onChange={(e) => setReportNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)} color="inherit">{t('cancel')}</Button>
          <Button onClick={submitReport} variant="contained" sx={{ background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)" }}>{t('submitReport')}</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
