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
  X as CloseIcon,
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
} from "lucide-react";
import UserAvatarButton from "./UserAvatarButton";

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
    gender: "female",
    distance: 0.6,
    profession: "Product Designer",
    tagline: "Coffee, cats, and cozy playlists ☕️🐱",
    interests: ["Design", "Yoga", "Music"],
    matchDistance: 0.18,
    likesYou: true,
    base: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    aboutMe: ["170 cm", "Sometimes drinks", "Likes pets"],
    lookingFor: ["A life partner", "Confidence", "Openness", "Optimism"],
  },
  {
    id: 3,
    name: "Lior",
    age: 26,
    gender: "female",
    distance: 1.2,
    profession: "UX Researcher",
    tagline: "Designing with empathy",
    interests: ["Photography", "Art", "Pilates"],
    matchDistance: 0.28,
    likesYou: true,
    base: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    aboutMe: ["168 cm", "Doesn't smoke", "Likes pets"],
    lookingFor: ["Openness", "Humor", "Stability"],
  },
  {
    id: 4,
    name: "Liza",
    age: 28,
    gender: "female",
    distance: 0.8,
    profession: "Marketing Director",
    tagline: "Living life one adventure at a time 🌍",
    interests: ["Travel", "Photography", "Wine"],
    matchDistance: 0.15,
    likesYou: true,
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1600&h=1000&q=80",
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=1400&h=1400&q=80",
    ],
    aboutMe: ["166 cm", "Loves wine", "Dog person"],
    lookingFor: ["Adventure partner", "Humor", "Authenticity"],
  },
  {
    id: 5,
    name: "Gali",
    age: 25,
    gender: "female",
    distance: 1.5,
    profession: "Graphic Designer",
    tagline: "Art, coffee, and good vibes ✨",
    interests: ["Art", "Coffee", "Festivals"],
    matchDistance: 0.20,
    likesYou: false,
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&h=1700&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&h=1000&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1400&h=1400&q=80",
    ],
    aboutMe: ["163 cm", "Creative soul", "Loves festivals"],
    lookingFor: ["Creativity", "Openness", "Good vibes"],
  },
  {
    id: 6,
    name: "Shani",
    age: 24,
    gender: "female",
    distance: 0.7,
    profession: "Fashion Blogger",
    tagline: "Living my best life, one outfit at a time 💫",
    interests: ["Fashion", "Photography", "Brunch"],
    matchDistance: 0.17,
    likesYou: true,
    photos: [
      "/liza_1.jpg",
      "/liza_2.jpg",
      "/liza_3.jpg",
    ],
    aboutMe: ["168 cm", "Fashion lover", "Always smiling"],
    lookingFor: ["Style", "Confidence", "Fun vibes"],
  },
  {
    id: 7,
    name: "Yael",
    age: 26,
    gender: "female",
    distance: 1.1,
    profession: "Interior Designer",
    tagline: "Aesthetic vibes and good energy 🌟",
    interests: ["Design", "Travel", "Fashion"],
    matchDistance: 0.19,
    likesYou: false,
    photos: [
      "/gali_1.jpg",
      "/gali_2.jpg",
      "/gali_3.jpg",
    ],
    aboutMe: ["170 cm", "Design enthusiast", "Loves sunglasses"],
    lookingFor: ["Sophistication", "Ambition", "Good taste"],
  },
];

const demoUsers = baseUsers.map((u) => {
  // If user already has photos array, use it; otherwise generate from base
  const photos = u.photos || personPhotos(u.base);
  return { ...u, photos, photoUrl: photos[0] };
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
    // force women-only for now
    return { ...base, genders: ["female"] };
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
   Picks carousel ("Today’s Picks")
--------------------------------------- */
function PicksCoverflow({ users = [], brand }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const cardW = 230;
  const gap = 22;

  const scrollTo = (idx) => {
    const el = trackRef.current;
    if (!el) return;
    const x = idx * (cardW + gap) - (el.clientWidth - cardW) / 2;
    el.scrollTo({ left: x, behavior: "smooth" });
  };

  const go = (dir) => {
    const next = Math.max(0, Math.min(users.length - 1, active + dir));
    setActive(next);
    scrollTo(next);
  };

  return (
    <Box sx={{ mt: 24 / 12, mx: "auto", maxWidth: 980 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 800, color: "#0f172a" }}
        >
          Today’s Picks
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => go(-1)}>
            <ChevronLeft size={18} />
          </IconButton>
          <IconButton size="small" onClick={() => go(+1)}>
            <ChevronRight size={18} />
          </IconButton>
        </Stack>
      </Stack>

      <Box
        ref={trackRef}
        sx={{
          position: "relative",
          overflowX: "auto",
          px: 2,
          py: 1,
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { display: "none" },
          maskImage:
            "linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)",
        }}
        onScroll={(e) => {
          const i = Math.round(
            e.currentTarget.scrollLeft / (cardW + gap)
          );
          if (i !== active)
            setActive(Math.max(0, Math.min(users.length - 1, i)));
        }}
      >
        <Box sx={{ display: "inline-flex", gap, pr: 2 }}>
          {users.map((u, i) => {
            const offset = Math.abs(active - i);
            const scale = Math.max(0.85, 1 - offset * 0.08);
            const rot = (active - i) * 6;
            const dim = alpha("#000", Math.min(0.35, offset * 0.15));

            return (
              <motion.div
                key={u.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActive(i);
                  scrollTo(i);
                }}
                style={{
                  scrollSnapAlign: "center",
                  cursor: "pointer",
                }}
              >
                <Box
                  sx={{
                    width: cardW,
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: `0 20px 50px ${alpha("#000", 0.12)}`,
                    background: "#fff",
                    transform: `perspective(900px) rotateY(${rot}deg) scale(${scale})`,
                    transition:
                      "transform .35s ease, box-shadow .35s ease",
                    willChange: "transform",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      height: 160,
                      bgcolor: "#eee",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <motion.img
                      src={u.photoUrl}
                      alt={u.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      initial={{ scale: 1.06 }}
                      animate={{ scale: active === i ? 1.02 : 1.06 }}
                      transition={{ duration: 0.4 }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background: dim,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        px: 1,
                        py: 0.25,
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        bgcolor: alpha(brand.primary, 0.12),
                        color: brand.primary,
                        border: `1px solid ${alpha(
                          brand.primary,
                          0.2
                        )}`,
                      }}
                    >
                      {Math.round(
                        (1 - (u.matchDistance ?? 0.3)) * 100
                      )}
                      %
                    </Box>
                  </Box>

                  <Box sx={{ p: 1.25 }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {u.name}, {u.age}
                    </Typography>

                    {u.profession && (
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", mt: 0.25 }}
                      >
                        {u.profession}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.6,
                        mt: 1,
                      }}
                    >
                      {(u.aboutMe || [])
                        .slice(0, 2)
                        .map((t, idxChip) => (
                          <Box
                            key={idxChip}
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.6,
                              px: 1,
                              py: 0.4,
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                              bgcolor: alpha(brand.primary, 0.08),
                              color: brand.primary,
                              border: `1px solid ${alpha(
                                brand.primary,
                                0.2
                              )}`,
                            }}
                          >
                            {t}
                          </Box>
                        ))}
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

/* ---------------------------------------
   MAIN SCREEN (Home)
--------------------------------------- */
export default function Home() {
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

  /* ---------- SWIPE ALGORITHM (per spec) ---------- */
  
  // 1. Input: horizontal position of the card
  const x = useMotionValue(0); // x = 0 → centered, x > 0 → right, x < 0 → left
  const controls = useAnimation();
  const RIGHT_FULL = 320;
  const LEFT_FULL = -320;

  // 2. Like / Nope intensity (thresholds per spec)
  const LIKE_TRIGGER = 120;  // pixels to the right
  const NOPE_TRIGGER = -120; // pixels to the left
  
  // Normalized progress [0, 1] using clamp logic
  const likeProgress = useTransform(x, (v) =>
    Math.max(0, Math.min(1, v / LIKE_TRIGGER)) // clamp(x / 120, 0, 1)
  );
  const nopeProgress = useTransform(x, (v) =>
    Math.max(0, Math.min(1, -v / -NOPE_TRIGGER)) // clamp(-x / 120, 0, 1)
  );

  // 3. Icon size and opacity (Heart / X)
  // Heart (right swipe): scale 0.9 → 2.6, opacity 0 → 1
  const likeOpacity = likeProgress;
  const likeScale = useTransform(likeProgress, [0, 1], [0.9, 2.6]);
  
  // X (left swipe): scale 0.9 → 2.6, opacity 0 → 1
  const nopeOpacity = nopeProgress;
  const nopeScale = useTransform(nopeProgress, [0, 1], [0.9, 2.6]);

  // 4. Card rotation (-12° to +12°)
  const MAX_ROTATE = 12; // degrees
  const rotate = useTransform(x, [LEFT_FULL, 0, RIGHT_FULL], [-MAX_ROTATE, 0, MAX_ROTATE]);

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

  // 5. Decision on release (per spec)
  const onDragEnd = (_, info) => {
    const { offset, velocity } = info;
    
    // Thresholds per spec
    const SWIPE_THRESHOLD = 140;  // pixels
    const SPEED_THRESHOLD = 600;  // pixels/second
    
    const passRight = offset.x > SWIPE_THRESHOLD || velocity.x > SPEED_THRESHOLD;
    const passLeft = offset.x < -SWIPE_THRESHOLD || velocity.x < -SPEED_THRESHOLD;

    if (passRight) return throwAndNext(+1, topUser); // LIKE: throw right
    if (passLeft) return throwAndNext(-1, topUser);  // NOPE: throw left

    // Not far/fast enough -> snap back to center
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
      {/* avatar / self-profile button */}
      <UserAvatarButton photoUrl={null} />

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
            onClick={() => navigate("/events?view=my")}
            icon={<Calendar size={18} />}
            label="My Events"
          />
          <QuickAction
            brand={brand}
            onClick={() => navigate("/matches?mode=likesMe")}
            icon={<ThumbsUp size={18} />}
            label="Likes Me"
          />
        </Stack>

        {/* Card stack */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            mx: "auto",
          }}
        >
          {!topUser ? (
            // empty / end-of-deck state
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                color: "#6B7280",
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
              <Typography variant="body2">
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
            </Box>
          ) : (
            <>
              {/* preview of next card (background) */}
              {nextUser && (
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1,
                    pointerEvents: "none",
                    transform:
                      "scale(0.96) translateY(10px)",
                    opacity: 0.92,
                    filter: "saturate(0.9)",
                  }}
                >
                  <Box
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      boxShadow:
                        "0 10px 20px rgba(0,0,0,0.06)",
                      bgcolor: "#f6f7f9",
                      aspectRatio: "4 / 5",
                      width: "100%",
                    }}
                  >
                    <img
                      src={nextUser.photoUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* active card */}
              <AnimatePresence>
                {topUser && (
                  <motion.div
                    key={topUser.id + "-" + deckIndex}
                    animate={controls}
                    style={{
                      x,
                      rotate,
                      position: "relative",
                      zIndex: 2,
                    }}
                    drag="x"
                    dragElastic={0.18}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={onDragEnd}
                    initial={{ scale: 0.985, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{
                      opacity: 0,
                      y: 40,
                      transition: { duration: 0.25 },
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: 4,
                        background: "#fff",
                        boxShadow:
                          "0 16px 40px rgba(0,0,0,0.10)",
                        overflow: "visible",
                        position: "relative",
                      }}
                    >
                      {/* dynamic side glows */}
                      <motion.div
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          background: rightGlow,
                        }}
                      />
                      <motion.div
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          background: leftGlow,
                        }}
                      />

                      {/* photo area */}
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "4 / 5",
                          userSelect: "none",
                          bgcolor: "#eee",
                        }}
                        aria-label={`${topUser.name}, ${topUser.age}`}
                      >
                        {!imageLoaded && (
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(90deg,#eee,#f5f5f5,#eee)",
                              backgroundSize:
                                "200% 100%",
                              animation:
                                "shimmer 1.2s infinite linear",
                            }}
                          />
                        )}

                        <img
                          src={currentSrc || topUser.photoUrl}
                          alt={topUser.name}
                          onLoad={() => setImageLoaded(true)}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: imageLoaded
                              ? "block"
                              : "none",
                          }}
                        />

                        {/* top progress bars for multi-photo */}
                        {topUser?.photos?.length > 1 && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              right: 8,
                              display: "flex",
                              gap: 0.5,
                            }}
                          >
                            {topUser.photos.map(
                              (_, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    flex: 1,
                                    height: 4,
                                    borderRadius: 999,
                                    bgcolor:
                                      "rgba(255,255,255,0.35)",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: `${
                                        i <= photoIdx
                                          ? 100
                                          : 0
                                      }%`,
                                      height: "100%",
                                      borderRadius: 999,
                                      bgcolor: "#fff",
                                      transition:
                                        "width .25s",
                                    }}
                                  />
                                </Box>
                              )
                            )}
                          </Box>
                        )}

                        {/* bottom dots + arrows */}
                        {topUser?.photos?.length > 1 && (
                          <>
                            <Box
                              sx={{
                                position:
                                  "absolute",
                                bottom: 10,
                                left: 0,
                                right: 0,
                                display: "flex",
                                justifyContent:
                                  "center",
                                gap: 1,
                              }}
                            >
                              {topUser.photos.map(
                                (_, i) => (
                                  <Box
                                    key={i}
                                    onClick={() => {
                                      setImageLoaded(
                                        false
                                      );
                                      setPhotoIdx(i);
                                    }}
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: 999,
                                      cursor:
                                        "pointer",
                                      bgcolor:
                                        i ===
                                        photoIdx
                                          ? "rgba(255,255,255,0.95)"
                                          : "rgba(255,255,255,0.5)",
                                    }}
                                  />
                                )
                              )}
                            </Box>

                            <IconButton
                              onClick={() => {
                                setImageLoaded(
                                  false
                                );
                                advancePhoto(-1);
                              }}
                              size="small"
                              sx={{
                                position:
                                  "absolute",
                                top: "50%",
                                left: 6,
                                transform:
                                  "translateY(-50%)",
                                bgcolor:
                                  "rgba(255,255,255,.9)",
                                "&:hover": {
                                  bgcolor:
                                    "#fff",
                                },
                              }}
                            >
                              <ChevronLeft
                                size={18}
                              />
                            </IconButton>

                            <IconButton
                              onClick={() => {
                                setImageLoaded(
                                  false
                                );
                                advancePhoto(+1);
                              }}
                              size="small"
                              sx={{
                                position:
                                  "absolute",
                                top: "50%",
                                right: 6,
                                transform:
                                  "translateY(-50%)",
                                bgcolor:
                                  "rgba(255,255,255,.9)",
                                "&:hover": {
                                  bgcolor:
                                    "#fff",
                                },
                              }}
                            >
                              <ChevronRight
                                size={18}
                              />
                            </IconButton>
                          </>
                        )}

                        {/* like / nope floating badges */}
                        <motion.div
                          style={{
                            opacity: likeOpacity,
                            scale: likeScale,
                            zIndex: 5,
                          }}
                          className="like-ind"
                          aria-hidden
                        >
                          <Heart />
                        </motion.div>

                        <motion.div
                          style={{
                            opacity: nopeOpacity,
                            scale: nopeScale,
                            zIndex: 5,
                          }}
                          className="nope-ind"
                          aria-hidden
                        >
                          <CloseIcon />
                        </motion.div>

                        <style>{`
                          .like-ind,
                          .nope-ind {
                            position: absolute;
                            width: 42px;
                            height: 42px;
                            border-radius: 999px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: rgba(255,255,255,0.95);
                            backdrop-filter: blur(6px);
                            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
                          }
                          .like-ind {
                            right: -6px;
                            top: 50%;
                            transform: translateY(-50%);
                          }
                          .nope-ind {
                            left: -6px;
                            top: 50%;
                            transform: translateY(-50%);
                          }
                          .like-ind svg {
                            color: #22c55e;
                          }
                          .nope-ind svg {
                            color: #ef4444;
                          }
                          @keyframes shimmer {
                            0% { background-position: 0% 0; }
                            100% { background-position: 200% 0; }
                          }
                        `}</style>
                      </Box>

                      {/* details under the photo */}
                      <Box sx={{ p: 1.5 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            lineHeight: 1.2,
                            color: "#0f172a",
                          }}
                        >
                          {topUser.name}, {topUser.age}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: "center",
                            color: "#475569",
                            mt: 0.25,
                            flexWrap: "wrap",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ alignItems: "center" }}
                          >
                            <MapPin size={16} />
                            <Typography variant="body2">
                              {topUser.city || "Tel Aviv"}
                            </Typography>
                          </Stack>
                          <Typography variant="body2">
                            ·
                          </Typography>
                          <Typography variant="body2">
                            {formatDistance(
                              topUser.distance
                            )}{" "}
                            away
                          </Typography>
                        </Stack>

                        {topUser.profession && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#64748b",
                              mt: 0.5,
                            }}
                          >
                            {topUser.profession}
                          </Typography>
                        )}

                        {topUser.tagline && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#0f172a",
                              mt: 1,
                            }}
                          >
                            {topUser.tagline}
                          </Typography>
                        )}

                        {topUser?.aboutMe?.length > 0 && (
                          <Box sx={{ mt: 1.25 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                mb: 0.6,
                                color: "#0f172a",
                              }}
                            >
                              Details
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.6,
                              }}
                            >
                              {topUser.aboutMe.map(
                                (item, idxChip) => (
                                  <TagPill
                                    key={idxChip}
                                    icon={chipIconFor(
                                      "about",
                                      item
                                    )}
                                    label={item}
                                    brand={brand}
                                    variant={
                                      DEFAULT_TAG_STYLE
                                    }
                                    radius={
                                      DEFAULT_RADIUS
                                    }
                                    size="small"
                                  />
                                )
                              )}
                            </Box>
                          </Box>
                        )}

                        {topUser?.interests?.length >
                          0 && (
                          <Box sx={{ mt: 1.25 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                mb: 0.6,
                                color: "#0f172a",
                              }}
                            >
                              Interests
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.6,
                              }}
                            >
                              {topUser.interests.map(
                                (item, idxChip) => (
                                  <TagPill
                                    key={idxChip}
                                    icon={chipIconFor(
                                      "interests",
                                      item
                                    )}
                                    label={item}
                                    brand={brand}
                                    variant={
                                      DEFAULT_TAG_STYLE
                                    }
                                    radius={
                                      DEFAULT_RADIUS
                                    }
                                    size="small"
                                  />
                                )
                              )}
                            </Box>
                          </Box>
                        )}

                        {topUser?.lookingFor
                          ?.length > 0 && (
                          <Box sx={{ mt: 1.25 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                mb: 0.6,
                                color: "#0f172a",
                              }}
                            >
                              Looking for
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.6,
                              }}
                            >
                              {topUser.lookingFor.map(
                                (item, idxChip) => (
                                  <TagPill
                                    key={idxChip}
                                    icon={chipIconFor(
                                      "looking",
                                      item
                                    )}
                                    label={item}
                                    brand={brand}
                                    variant={
                                      DEFAULT_TAG_STYLE
                                    }
                                    radius={
                                      DEFAULT_RADIUS
                                    }
                                    size="small"
                                  />
                                )
                              )}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </Box>

        {/* hint under card */}
        <Box
          sx={{
            mt: 1.5,
            maxWidth: 520,
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            ← Swipe left = Pass
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            ❤️ Swipe right = Like
          </Typography>
        </Box>

        {/* Picks carousel */}
        <PicksCoverflow users={filtered} brand={brand} />

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
