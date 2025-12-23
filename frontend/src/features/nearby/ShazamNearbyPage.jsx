import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Slider,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
} from "@mui/material";
import {
  RefreshCw,
  Search,
  Heart,
  X as CloseIcon,
  Star,
  RotateCcw,
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
  ChevronLeft,
  MapPin,
  ChevronRight,
} from "lucide-react";

// Demo users
const demoUsers = [
  {
    id: 1,
    name: "Maya",
    age: 27,
    distance: 0.6,
    profession: "Product Designer",
    tagline: "Coffee, cats, and cozy playlists ☕️🐱",
    interests: ["Design", "Yoga", "Music"],
    gender: "female",
    photoUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541534401786-2077eed87a72?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520763185298-1b434c919102?q=80&w=1200&auto=format&fit=crop",
    ],
    aboutMe: ["170 cm", "Sometimes drinks", "Likes pets"],
    lookingFor: ["A life partner", "Confidence", "Openness", "Optimism"],
  },
  {
    id: 2,
    name: "Noa",
    age: 29,
    distance: 0.9,
    profession: "Data Scientist",
    tagline: "Trader Joes snacks connoisseur",
    interests: ["Hiking", "Books", "Cooking"],
    gender: "female",
    photoUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
    ],
    aboutMe: ["165 cm", "Rarely drinks", "Wants kids"],
    lookingFor: ["Kindness", "Curiosity", "Humor"],
  },
  {
    id: 3,
    name: "Adam",
    age: 31,
    distance: 0.4,
    profession: "iOS Developer",
    tagline: "Dark mode everything",
    interests: ["Running", "Tech", "Travel"],
    gender: "male",
    photoUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1200&auto=format&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1200&auto=format&fit=crop",
    ],
    aboutMe: ["182 cm", "Sometimes drinks", "Doesn't have kids"],
    lookingFor: ["Ambition", "Loyalty", "Positivity"],
  },
];

const SAFE_TOP = "calc(env(safe-area-inset-top, 0px) + var(--app-top-nav-height, 56px))";
const SAFE_BOTTOM = "calc(env(safe-area-inset-bottom, 0px) + var(--app-bottom-nav-height, 72px))";

const DEFAULT_PREFS = { maxDistanceKm: 5, genders: ["male", "female"], ageRange: [18, 60] };
const loadPrefs = () => {
  try {
    const raw = localStorage.getItem("userPrefs");
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
};
const savePrefs = (p) => localStorage.setItem("userPrefs", JSON.stringify(p));

const formatDistance = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${Math.round(km * 10) / 10} km`);

const chipIconFor = (section, text) => {
  const t = (text || "").toLowerCase();
  if (section === "about") {
    if (t.includes("cm") || t.includes("height")) return <Ruler size={14} />;
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

export default function ShazamNearbyPage() {
  const [stage, setStage] = useState("idle"); // idle | scanning | results
  const [progress, setProgress] = useState(0);
  const [foundUsers, setFoundUsers] = useState([]);
  const [prefs, setPrefs] = useState(loadPrefs());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deckIndex, setDeckIndex] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => setPhotoIdx(0), [deckIndex]);

  const filtered = useMemo(() => {
    const { maxDistanceKm, genders, ageRange } = prefs;
    return foundUsers.filter(
      (u) =>
        u.distance <= maxDistanceKm &&
        genders.includes(u.gender) &&
        u.age >= ageRange[0] &&
        u.age <= ageRange[1]
    );
  }, [foundUsers, prefs]);

  const topUser = filtered.length ? filtered[deckIndex % filtered.length] : null;

  const startScan = () => {
    setStage("scanning");
    setFoundUsers([]);
    setProgress(0);

    const shuffled = [...demoUsers].sort(() => Math.random() - 0.5);
    const addOne = (idx) => {
      if (idx >= shuffled.length) return;
      const jitter = Math.max(0.1, Math.random() * 1.2);
      const u = { ...shuffled[idx], distance: Math.round(jitter * 10) / 10 };
      setFoundUsers((prev) => (prev.find((x) => x.id === u.id) ? prev : [...prev, u]));
    };

    const DURATION = 7000;
    const started = Date.now();
    const timer = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - started) / DURATION) * 100));
      setProgress(pct);
    }, 100);

    const finds = [600, 1800, 3200, 4700, 6100];
    const tos = finds.map((ms, i) => setTimeout(() => addOne(i), ms));

    setTimeout(() => {
      clearInterval(timer);
      tos.forEach(clearTimeout);
      setProgress(100);
      setStage("results");
    }, DURATION);
  };

  const decide = (type) => {
    if (!filtered.length) return;
    if (navigator?.vibrate) navigator.vibrate(8);
    setDeckIndex((i) => (i + 1) % Math.max(filtered.length, 1));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (stage !== "results" || !topUser) return;
      if (e.key === "ArrowLeft") decide("left");
      if (e.key === "ArrowRight") decide("right");
      if (e.key === "ArrowUp") decide("super");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, topUser, filtered.length]);

  return (
    <Box sx={{ minHeight: "100vh", background: "#fff", pt: `calc(${SAFE_TOP} + 8px)`, pb: `calc(${SAFE_BOTTOM} + 24px)`, px: 2 }}>
      {stage !== "results" ? (
        <ScanStage onStart={startScan} stage={stage} progress={progress} count={foundUsers.length} />
      ) : (
        <ResultsStage
          topUser={topUser}
          filtered={filtered}
          deckIndex={deckIndex}
          setDeckIndex={setDeckIndex}
          photoIdx={photoIdx}
          setPhotoIdx={setPhotoIdx}
          decide={decide}
          prefs={prefs}
          setPrefs={(p) => {
            setPrefs(p); savePrefs(p);
          }}
          openFilters={() => setFiltersOpen(true)}
          filtersOpen={filtersOpen}
          closeFilters={() => setFiltersOpen(false)}
        />
      )}
    </Box>
  );
}

function ScanStage({ onStart, stage, progress, count }) {
  const scanning = stage === "scanning";
  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: `calc(100vh - ${SAFE_TOP} - ${SAFE_BOTTOM})` }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Find people nearby</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>Bluetooth / GPS • up to 7 seconds</Typography>

        <Box sx={{ position: "relative", width: 220, height: 220, mx: "auto", mb: 2 }}>
          {/* Simple CSS pulse (no framer-motion) */}
          {scanning && <Pulse waves={3} />}
          <button
            onClick={() => !scanning && onStart()}
            disabled={scanning}
            style={{
              width: 160, height: 160, borderRadius: 9999, border: 0,
              background: scanning ? "#1d4ed8" : "#2563eb", color: "#fff",
              boxShadow: "0 20px 50px rgba(37,99,235,0.35)", cursor: scanning ? "default" : "pointer"
            }}
          >
            <Stack alignItems="center" spacing={0.5}>
              <MapPin />
              <Typography sx={{ fontWeight: 800 }}>{scanning ? "Scanning..." : "Scan Nearby"}</Typography>
              <Typography variant="caption" style={{ opacity: 0.9 }}>{scanning ? `${count} found so far` : "Tap to start"}</Typography>
            </Stack>
          </button>
        </Box>

        {scanning ? (
          <Box sx={{ width: 320, maxWidth: "82vw", mx: "auto" }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.8 }}>{progress}% • {count} results</Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>Single scan will run for up to 7 seconds.</Typography>
        )}
      </Box>
    </Box>
  );
}

function Pulse({ waves = 3 }) {
  return (
    <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      {[...Array(waves)].map((_, i) => (
        <span key={i} className="pulse" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
      <style>{`
        .pulse{ position:absolute; width:220px; height:220px; border-radius:9999px; border:3px solid rgba(37,99,235,0.25); transform:scale(0.6); opacity:1; animation:pulse 2.2s infinite ease-out; }
        @keyframes pulse{ 0%{ transform:scale(0.6); opacity:0.9 } 100%{ transform:scale(1.45); opacity:0 } }
      `}</style>
    </Box>
  );
}

function ResultsStage({ topUser, filtered, deckIndex, setDeckIndex, photoIdx, setPhotoIdx, decide, prefs, setPrefs, openFilters, filtersOpen, closeFilters }) {
  const nextUser = filtered.length ? filtered[(deckIndex + 1) % filtered.length] : null;
  const advancePhoto = (dir = 1) => {
    if (!topUser?.photos?.length) return;
    const total = topUser.photos.length;
    setPhotoIdx((i) => (i + dir + total) % total);
  };
  const currentSrc = topUser && (topUser.photos?.length ? topUser.photos[photoIdx % topUser.photos.length] : topUser.photoUrl);

  return (
    <>
      <Box sx={{ pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Explore</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh"><IconButton onClick={() => setDeckIndex((i) => (i + 1) % Math.max(filtered.length, 1))}><RefreshCw /></IconButton></Tooltip>
          <Tooltip title="Filters"><IconButton onClick={openFilters}><Search /></IconButton></Tooltip>
        </Stack>
      </Box>

      {/* Card */}
      <Box sx={{ position: "relative", width: "100%", maxWidth: 440, mx: "auto" }}>
        {nextUser && (
          <Box aria-hidden sx={{ position: "absolute", inset: 0, borderRadius: 3, overflow: "hidden", transform: "scale(0.96) translateY(10px)", opacity: 0.9, background: "#f5f5f5" }}>
            <img src={nextUser.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Box>
        )}

        {topUser && (
          <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden", aspectRatio: "4 / 5", background: "#eee", userSelect: "none" }} aria-label={`${topUser.name}, ${topUser.age}`}>
            <img src={currentSrc || topUser.photoUrl} alt={topUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

            {/* photo tap zones */}
            <Box onClick={() => advancePhoto(-1)} aria-label="Previous photo" style={{ position: "absolute", inset: 0, right: "55%", cursor: "pointer" }} />
            <Box onClick={() => advancePhoto(+1)} aria-label="Next photo" style={{ position: "absolute", inset: 0, left: "55%", cursor: "pointer" }} />

            <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, p: 2, background: "linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.55) 70%)", color: "#fff" }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{topUser.name}, {topUser.age}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>{topUser.profession} • {formatDistance(topUser.distance)} away</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Hints */}
      <Box sx={{ mt: 1.25, display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
        <Chip size="small" label="Left = Pass" />
        <Chip size="small" label="Up = Super Like" />
        <Chip size="small" label="Right = Like" />
      </Box>

      {/* Extra info */}
      {topUser && (
        <Box sx={{ mt: 2, mx: "auto", maxWidth: 440 }}>
          {topUser.tagline && (<Typography variant="body1" sx={{ mb: 1 }}>“{topUser.tagline}”</Typography>)}
          {topUser.aboutMe?.length > 0 && (
            <Section title="About me">
              {topUser.aboutMe.map((item, idx) => (
                <Chip key={idx} icon={chipIconFor("about", item)} label={item} size="small" sx={{ bgcolor: "#F2F4F7", borderRadius: "999px" }} />
              ))}
            </Section>
          )}
          {topUser.interests?.length > 0 && (
            <Section title="Interests">
              {topUser.interests.map((item, idx) => (
                <Chip key={idx} icon={chipIconFor("interests", item)} label={item} size="small" sx={{ bgcolor: "#F2F4F7", borderRadius: "999px" }} />
              ))}
            </Section>
          )}
        </Box>
      )}

      {/* Bottom actions */}
      <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ position: "fixed", left: 0, right: 0, bottom: `calc(${SAFE_BOTTOM} + 12px)`, zIndex: 1400, background: "rgba(255,255,255,0.88)", backdropFilter: "saturate(180%) blur(12px)", borderRadius: 9999, width: "max-content", mx: "auto", px: 1.25, py: 0.75, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}>
        <IconButton aria-label="Rewind last" onClick={() => setDeckIndex((i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1))} disableRipple sx={roundBtn("var(--btn-neutral,#A8A29E)")}>
          <RotateCcw />
        </IconButton>
        <IconButton aria-label="Nope" onClick={() => decide("left")} disabled={!topUser} disableRipple sx={roundBtn("var(--btn-nope,#ef4444)")}>
          <CloseIcon />
        </IconButton>
        <IconButton aria-label="Super Like" onClick={() => decide("super")} disabled={!topUser} disableRipple sx={roundBtn("var(--btn-super,#3b82f6)", true)}>
          <Star />
        </IconButton>
        <IconButton aria-label="Like" onClick={() => decide("right")} disabled={!topUser} disableRipple sx={roundBtn("var(--btn-like,#22c55e)")}>
          <Heart />
        </IconButton>
      </Stack>

      <FiltersDialog
        open={filtersOpen}
        prefs={prefs}
        onClose={closeFilters}
        onSave={(p) => { setPrefs(p); savePrefs(p); closeFilters(); }}
      />
    </>
  );
}

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.6 }}>{title}</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{children}</Box>
    </Box>
  );
}

function roundBtn(color, isStar = false) {
  const size = "clamp(52px, 12vw, 64px)";
  return {
    bgcolor: "#fff",
    width: size,
    height: size,
    borderRadius: "50%",
    border: `3px solid ${color}`,
    boxShadow: "0 8px 18px rgba(0,0,0,0.10)",
    "& svg": { color, width: 24, height: 24 },
    "& .MuiTouchRipple-root": { display: "none" },
    ...(isStar ? { width: "clamp(56px, 14vw, 72px)", height: "clamp(56px, 14vw, 72px)" } : {}),
    "&:disabled": { opacity: 0.5 },
  };
}

function FiltersDialog({ open, onClose, onSave, prefs }) {
  const [local, setLocal] = useState(prefs);
  useEffect(() => setLocal(prefs), [prefs]);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Filters</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mt: 1 }}>Max distance: {local.maxDistanceKm} km</Typography>
        <Slider value={local.maxDistanceKm} onChange={(_, v) => setLocal((p) => ({ ...p, maxDistanceKm: v }))} valueLabelDisplay="auto" step={1} min={1} max={50} />
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Age range: {local.ageRange[0]}–{local.ageRange[1]}</Typography>
        <Slider value={local.ageRange} onChange={(_, v) => setLocal((p) => ({ ...p, ageRange: v }))} valueLabelDisplay="auto" step={1} min={18} max={80} />
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Genders</Typography>
        <Stack direction="row" spacing={2}>
          <FormControlLabel control={<Checkbox checked={local.genders.includes("female")} onChange={(e) => setLocal((p) => ({ ...p, genders: e.target.checked ? Array.from(new Set([...p.genders, "female"])) : p.genders.filter((g) => g !== "female") }))} />} label="Women" />
          <FormControlLabel control={<Checkbox checked={local.genders.includes("male")} onChange={(e) => setLocal((p) => ({ ...p, genders: e.target.checked ? Array.from(new Set([...p.genders, "male"])) : p.genders.filter((g) => g !== "male") }))} />} label="Men" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(local)}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
