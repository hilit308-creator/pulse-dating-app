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
    gender: "female",
    city: "Tel Aviv",
    distance: 0.6,
    profession: "Product Designer",
    tagline: "Here for the rooftop event tonight 🌃",
    interests: ["Design", "Yoga", "Music", "Coffee"],
    matchDistance: 0.18,
    likesYou: true,
    verified: true,
    base: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    aboutMe: ["170 cm", "Sometimes drinks", "Likes pets"],
    lookingFor: ["A life partner", "Confidence", "Openness", "Optimism"],
  },
  {
    id: 2,
    name: "Noa",
    age: 29,
    gender: "female",
    city: "Givatayim",
    distance: 0.9,
    profession: "Data Scientist",
    tagline: "Just moved to the neighborhood 🏠",
    interests: ["Hiking", "Books", "Cooking", "Wine"],
    matchDistance: 0.22,
    likesYou: false,
    verified: true,
    base: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    aboutMe: ["165 cm", "Rarely drinks", "Wants kids"],
    lookingFor: ["Kindness", "Curiosity", "Humor"],
  },
  {
    id: 3,
    name: "Lior",
    age: 26,
    gender: "female",
    city: "Tel Aviv",
    distance: 1.2,
    profession: "UX Researcher",
    tagline: "Working from the coffee shop nearby ☕",
    interests: ["Photography", "Art", "Pilates", "Music"],
    matchDistance: 0.28,
    likesYou: true,
    verified: false,
    base: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    aboutMe: ["168 cm", "Doesn't smoke", "Likes pets"],
    lookingFor: ["Openness", "Humor", "Stability"],
  },
  {
    id: 4,
    name: "Dana",
    age: 30,
    gender: "female",
    city: "Ramat Gan",
    distance: 0.4,
    profession: "Product Manager",
    tagline: "Training for the TLV marathon 🏃‍♀️",
    interests: ["Running", "Tech", "Travel", "Yoga"],
    matchDistance: 0.12,
    likesYou: false,
    verified: true,
    base: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
    aboutMe: ["172 cm", "Sometimes drinks", "No kids"],
    lookingFor: ["Ambition", "Loyalty", "Positivity"],
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
  contextLine: user.tagline || user.profession || 'Looking for genuine connections',
  chips: [
    ...(user.aboutMe || []).slice(0, 2).map(label => ({ label, type: 'factual' })),
    ...(user.interests || []).slice(0, 1).map(label => ({ label, type: 'hobby' })),
  ].slice(0, 3),
  isVerified: user.verified || false,
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
  
  // tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  
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
          <QuickAction
            brand={brand}
            onClick={() => navigate("/matches?mode=likesMe")}
            icon={<ThumbsUp size={18} />}
            label="Likes Me"
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
                  <CloseIcon size={16} />
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
            </Box>
          ) : (
            <UserCard
              user={transformToUserCardModel(topUser)}
              onLike={(user) => {
                // Record like and move to next
                if (topUser?.id != null) {
                  setLikedUsers((arr) =>
                    arr.includes(topUser.id) ? arr : [...arr, topUser.id]
                  );
                }
                setDeckIndex((i) => i + 1);
              }}
              onPass={(user) => {
                // Record pass and move to next
                if (topUser?.id != null) {
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
              hasLocationPermission={true}
            />
          )}
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
                When you both like each other, it's a match!
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
