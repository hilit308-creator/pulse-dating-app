// NearbyScreen.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Typography, IconButton, Stack, Tooltip, Slider, Checkbox,
  FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Paper
} from "@mui/material";
import {
  motion, AnimatePresence, useMotionValue, useTransform, useAnimation
} from "framer-motion";
import {
  RefreshCw, Search, Heart, X as CloseIcon, ChevronLeft, ChevronRight, MapPin,
  Ruler, Wine, Baby, PawPrint, Info, HeartHandshake, Shield, DoorOpen, Sun,
  HelpCircle, Smile, Pizza, Umbrella, Tent
} from "lucide-react";
import UserAvatarButton from "../components/UserAvatarButton";
import { alpha } from "@mui/material/styles";

/* ------------------------------ Theme & tokens ----------------------------- */
const APP_BG =
  "radial-gradient(1200px 600px at 50% -220px, #eef2f9 0%, transparent 60%)," +
  "radial-gradient(900px 520px at 12% 120%, #edf7f3 0%, transparent 60%)," +
  "linear-gradient(90deg, #fafbff 0%, #f7f8fc 70%, #eff2f9 100%)";

const BOTTOM_NAV_HEIGHT = 64;
const SCAN_DURATION = 1600;
const FOUND_HOLD = 800;

/* ----------------------------- Helper Functions ---------------------------- */
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
    if (t.includes("design")) return <Info size={14} />;
    if (t.includes("yoga")) return <Info size={14} />;
    if (t.includes("music")) return <Info size={14} />;
    if (t.includes("photo")) return <Info size={14} />;
    if (t.includes("art")) return <Info size={14} />;
    if (t.includes("pilates")) return <Info size={14} />;
    return <Info size={14} />;
  }
  return <Info size={14} />;
};

function TagPill({ icon, label, variant = "soft" }) {
  const brand = { primary: "#6C5CE7" };
  const bgSoft = alpha(brand.primary, 0.08);
  const bdSoft = alpha(brand.primary, 0.18);
  
  const variants = {
    soft: {
      bgcolor: bgSoft,
      border: `1px solid ${bdSoft}`,
      color: brand.primary,
    },
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        px: 0.9,
        py: 0.4,
        fontSize: 12,
        gap: 0.6,
        fontWeight: 600,
        ...variants[variant],
      }}
    >
      {icon && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {icon}
        </Box>
      )}
      <span>{label}</span>
    </Box>
  );
}

/* -------------------------------- Demo data -------------------------------- */
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

const demoUsers = [
  {
    id: 1, name: "Maya", age: 27, gender: "female", distance: 0.6,
    profession: "Product Designer", tagline: "Coffee, cats, and cozy playlists ☕️🐱",
    interests: ["Design", "Yoga", "Music"], likesYou: true, matchDistance: 0.18,
    base: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    aboutMe: ["170 cm", "Sometimes drinks", "Likes pets"],
    lookingFor: ["A life partner", "Confidence", "Openness", "Optimism"],
    city: "Tel Aviv"
  },
  {
    id: 3, name: "Lior", age: 26, gender: "female", distance: 1.2,
    profession: "UX Researcher", tagline: "Designing with empathy",
    interests: ["Photography", "Art", "Pilates"], likesYou: true, matchDistance: 0.28,
    base: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    aboutMe: ["168 cm", "Doesn't smoke", "Likes pets"],
    lookingFor: ["Openness", "Humor", "Stability"],
    city: "Givatayim"
  },
].map((u) => {
  const photos = personPhotos(u.base);
  return { ...u, photos, photoUrl: photos[0] };
});

/* ---------------------------------- Utils ---------------------------------- */
const DEFAULT_PREFS = { maxDistanceKm: 5, genders: ["female"], ageRange: [18, 60] };
const loadPrefs = () => {
  try {
    const raw = localStorage.getItem("userPrefs");
    const base = raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
    base.maxDistanceKm = Math.min(7, base.maxDistanceKm ?? 5);
    return { ...base, genders: ["female"] };
  } catch { return DEFAULT_PREFS; }
};
const savePrefs = (p) => localStorage.setItem("userPrefs", JSON.stringify({ ...p, maxDistanceKm: Math.min(7, p.maxDistanceKm) }));
const formatDistance = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${Math.round(km * 10) / 10} km`);

/* -------------------------- math helpers for SVG --------------------------- */
const toRad = (deg) => ((deg - 90) * Math.PI) / 180;
const pt0 = (r, deg) => ({ x: r * Math.cos(toRad(deg)), y: r * Math.sin(toRad(deg)) });
const arc0 = (r, startDeg, endDeg) => {
  const s = pt0(r, startDeg);
  const e = pt0(r, endDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

/* --------------------------- hooks: element width -------------------------- */
function useElementWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(360);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setW(Math.max(280, Math.min(400, Math.round(width))));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/* -------------------------------- Main screen ------------------------------ */
export default function NearbyScreen() {
  const [containerRef, containerW] = useElementWidth();

  // Radar sizes
  const ringSize = containerW;
  const rOuter = ringSize / 2 - 16;
  const rMid = rOuter - 24;
  const ctaSize = Math.max(170, Math.floor((rMid - 6) * 2));

  const [users, setUsers] = useState(demoUsers);
  const [prefs, setPrefs] = useState(loadPrefs());
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Distance button state
  const [distOpen, setDistOpen] = useState(false);
  const [unit, setUnit] = useState("km"); // "km" | "m"
  const km = Math.min(7, prefs.maxDistanceKm);

  // view: pre → scanning → found → results
  const [view, setView] = useState("pre");
  const timersRef = useRef([]);
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);
  const pushTimer = (id) => timersRef.current.push(id);

  const filtered = useMemo(() => {
    const { maxDistanceKm, genders, ageRange } = prefs;
    return users.filter(
      (u) =>
        u.distance <= Math.min(7, maxDistanceKm) &&
        genders.includes(u.gender) &&
        u.age >= ageRange[0] &&
        u.age <= ageRange[1]
    );
  }, [users, prefs]);

  const baseLive = Math.max(8, filtered.length * 6);
  const [liveNow, setLiveNow] = useState(baseLive);
  useEffect(() => {
    setLiveNow(baseLive);
    const id = setInterval(
      () => setLiveNow((_) => Math.max(5, baseLive + Math.round((Math.random() - 0.5) * 6))),
      5000
    );
    return () => clearInterval(id);
  }, [baseLive]);

  const startScan = () => {
    if (navigator?.vibrate) navigator.vibrate([10, 40, 10]);
    setView("scanning");
    pushTimer(setTimeout(() => setView("found"), SCAN_DURATION));
    pushTimer(setTimeout(() => setView("results"), SCAN_DURATION + FOUND_HOLD));
  };

  // CTA text (English)
  const ctaText = useMemo(() => ({
    over: "PEOPLE RADAR",
    main: "One tap — discover who’s nearby"
  }), []);

  // Refresh resets to pre-scan and shows distance button again
  const handleRefresh = () => {
    timersRef.current.forEach(clearTimeout);
    setView("pre");
    setDistOpen(false);
    setUsers((u) => [...u]);
  };

  // Data for rings
  const topProfessions = useMemo(() => {
    const counts = new Map();
    users.forEach((u) => {
      const k = (u.profession || "").trim();
      if (!k) return; counts.set(k, (counts.get(k) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, count]) => ({ label, count }));
  }, [users]);
  const topInterests = useMemo(() => {
    const counts = new Map();
    users.forEach((u) => (u.interests || []).forEach((i) => {
      const k = (i || "").trim(); if (!k) return;
      counts.set(k, (counts.get(k) || 0) + 1);
    }));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, count]) => ({ label, count }));
  }, [users]);

  return (
    <>
      <UserAvatarButton photoUrl={null} />
      <Box sx={{ position: "fixed", inset: 0, zIndex: 0, background: APP_BG }} />

      <Box
        sx={{
          position: "relative",
          ...(view === "results" 
            ? { minHeight: "100svh", overflowY: "auto", overflowX: "hidden" }
            : { height: "100svh", overflow: "hidden" }
          ),
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          px: 2,
          color: "#0b1324",
        }}
      >
        {/* Header */}
        <Box sx={{ pt: 2, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack>
            <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 1 }}>DISCOVER</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>People around you</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={handleRefresh} sx={{ color: "#2b3848" }}><RefreshCw /></IconButton></Tooltip>
            <Tooltip title="Filters"><IconButton onClick={() => setFiltersOpen(true)} sx={{ color: "#2b3848" }}><Search /></IconButton></Tooltip>
          </Stack>
        </Box>

        {/* Content */}
        <Box ref={containerRef} sx={{ position: "relative", display: "grid", gridTemplateRows: "auto 1fr auto", gap: 6, alignItems: "start" }}>
          {/* Distance button row – only before/during scan */}
          {view !== "results" && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <DistanceControl
                unit={unit}
                valueKm={km}
                onToggleUnit={() => setUnit((u) => (u === "km" ? "m" : "km"))}
                onChangeKm={(v) => {
                  const next = Math.max(0.2, Math.min(7, Number(v) || 0));
                  const np = { ...prefs, maxDistanceKm: next };
                  setPrefs(np); savePrefs(np);
                }}
                open={distOpen}
                setOpen={setDistOpen}
              />
            </Box>
          )}

          {/* Radar / Results */}
          <Box sx={{ 
            position: "relative", 
            display: "grid", 
            placeItems: view !== "results" ? "center" : "start", 
            overflow: view !== "results" ? "hidden" : "auto",
            height: "100%",
            pb: view === "results" ? `calc(${BOTTOM_NAV_HEIGHT}px + 40px)` : 0 
          }}>
            {view !== "results" ? (
              <ScanHero
                onStart={startScan}
                liveNow={liveNow}
                outerItems={topProfessions}
                innerItems={topInterests}
                size={ringSize}
                ctaSize={ctaSize}
                ctaText={ctaText}
                stage={view}
              />
            ) : (
              <ProfilesAfterScan users={filtered} />
            )}
          </Box>

          {/* Bottom spacer for bottom-nav */}
          <Box sx={{ height: `calc(env(safe-area-inset-bottom, 0px) + ${BOTTOM_NAV_HEIGHT * 0.65}px)` }} />
        </Box>
      </Box>

      {/* Filters dialog */}
      <FiltersDialog
        open={filtersOpen}
        prefs={prefs}
        onClose={() => setFiltersOpen(false)}
        onSave={(p) => {
          const fixed = { ...p, genders: ["female"], maxDistanceKm: Math.min(7, p.maxDistanceKm) };
          setPrefs(fixed); savePrefs(fixed); setFiltersOpen(false);
        }}
      />
    </>
  );
}

/* ---------------------------- Scan hero & rings ---------------------------- */
function ScanHero({ onStart, liveNow, outerItems, innerItems, size, ctaSize, ctaText, stage }) {
  return (
    <>
      {/* Radar */}
      <Box sx={{ position: "relative", width: size, height: size, mx: "auto" }}>
        {/* Live badge – moved down so it’s never clipped */}
        <Box
          sx={{
            position: "absolute",
            top: -6,                    // move up a bit more so it sits above the ring
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.2,
            py: 0.6,
            borderRadius: 999,
            bgcolor: "#fff",
            color: "#0b1324",
            border: "1px solid #e6eaf1",
            boxShadow: "0 6px 14px rgba(11,19,36,0.05)",
            zIndex: 3,
          }}
        >
          <span className="live-dot" />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Live now: {liveNow} nearby
          </Typography>
        </Box>

        {/* Rings & arcs */}
        <ProfessionRing outerItems={outerItems} innerItems={innerItems} size={size} />

        {/* FX */}
        <RadarFX size={size} />

        {/* Center CTA */}
        <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
          {stage === "pre" ? (
            <Box
              component={motion.button}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              sx={{
                pointerEvents: "auto",
                width: ctaSize, height: ctaSize, borderRadius: "50%",
                border: "1px solid rgba(0,0,0,0.06)", cursor: "pointer",
                display: "grid", placeItems: "center", color: "#0b1324",
                fontWeight: 900, letterSpacing: 1, textTransform: "none",
                background:
                  "radial-gradient(200px 200px at 30% 30%, #ccfff1 0%, #cfe8ff 60%, #d6d3ff 100%), " +
                  "conic-gradient(from 0deg, rgba(0,163,255,0.20), rgba(44,209,158,0.20), rgba(99,102,241,0.20), rgba(0,163,255,0.20))",
                boxShadow: "0 26px 72px rgba(0,83,166,0.20)",
                backdropFilter: "blur(4px)",
                position: "relative", overflow: "hidden",
              }}
              aria-label="Start scanning"
            >
              <Box sx={{
                position: "absolute", inset: -2, borderRadius: "50%",
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.55), 0 0 0 6px rgba(99,102,241,0.08)"
              }} />
              <Stack alignItems="center" spacing={0.8} sx={{ position: "relative", zIndex: 1, px: 2 }}>
                <Typography variant="overline" sx={{ letterSpacing: 1.8, fontWeight: 900, opacity: 0.9 }}>
                  {ctaText.over}
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: 20, lineHeight: 1.15, textAlign: "center" }}>
                  {ctaText.main}
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box
              sx={{
                width: Math.round(ctaSize * 0.72), height: Math.round(ctaSize * 0.72),
                borderRadius: "50%", display: "grid", placeItems: "center",
                background: "radial-gradient(120px 120px at 30% 30%, rgba(0,163,255,0.22), rgba(44,209,158,0.22))",
                boxShadow: "0 22px 60px rgba(0,163,255,0.20)", color: "#0b1324", fontWeight: 800
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {stage === "scanning" ? "Scanning…" : "Found matches"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Caption + animated stripes */}
      <Box sx={{ mt: 1.6, textAlign: "center" }}>
        <Typography sx={{ color: "#516173" }}>
          Tap to scan and see who's around
        </Typography>
        <LoadingStripes width={Math.round(ctaSize * 0.92)} />
      </Box>

      <style>{`
        .live-dot{ width:8px; height:8px; border-radius:50%; background:#22c55e; position:relative; display:inline-block; }
        .live-dot::after{ content:""; position:absolute; inset:-6px; border-radius:50%; border:2px solid rgba(34,197,94,0.35); animation: pingPulse 1.6s ease-out infinite; }
        @keyframes pingPulse { 0%{ transform: scale(0.6); opacity: 1;} 100%{ transform: scale(1.6); opacity: 0;} }
      `}</style>
    </>
  );
}

/* ----------------------- Radar FX (sector + ripples) ----------------------- */
function RadarFX({ size }) {
  return (
    <>
      <motion.div
        aria-hidden
        style={{
          position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none",
          background:
            "conic-gradient(from 0deg, rgba(99,102,241,.20) 0 12deg, rgba(56,189,248,.20) 12deg 20deg, transparent 20deg 360deg)",
          WebkitMask: "radial-gradient(circle at 50% 50%, transparent 0 56%, black 57% 100%)",
          mask: "radial-gradient(circle at 50% 50%, transparent 0 56%, black 57% 100%)",
          filter: "blur(0.2px)"
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <g transform={`translate(${size / 2} ${size / 2})`}>
          <circle r={size / 2 - 16} fill="none" stroke="rgba(2, 6, 23, 0.10)" strokeWidth="1" strokeDasharray="1 10" />
        </g>
      </svg>
      {[0, 0.6, 1.2].map((d, i) => (
        <motion.span
          key={i}
          style={{ position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none", border: "2px solid rgba(0,163,255,0.16)" }}
          initial={{ scale: 0.7, opacity: 0.7 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 2.6, ease: "easeOut", delay: d }}
        />
      ))}
    </>
  );
}

/* ----------------------------- Rings + labels ------------------------------ */
function ProfessionRing({ outerItems = [], innerItems = [], size = 320 }) {
  const s = size, cx = s / 2, cy = s / 2;
  const rOuter = s / 2 - 16;
  const rMid = rOuter - 24;

  const calcArcSpan = (count) => Math.min(58, 300 / Math.max(count || 1, 1));
  const gapOuter = 360 / Math.max(outerItems.length || 1, 1);
  const gapMid = 360 / Math.max(innerItems.length || 1, 1);
  const spanOuter = calcArcSpan(outerItems.length);
  const spanMid = calcArcSpan(innerItems.length);
  const startOuter = -90 + (gapOuter - spanOuter) / 2;
  const startMid = -90 + (gapMid - spanMid) / 2;

  const outerFont = Math.max(11, Math.min(14, Math.round(s * 0.037)));
  const innerFont = Math.max(10, Math.min(13, Math.round(s * 0.034)));
  const outerDot = Math.max(3, Math.min(5, Math.round(s * 0.012)));
  const innerDot = Math.max(3, Math.min(5, Math.round(s * 0.011)));

  const hotspots = React.useMemo(() => {
    const hash = (str) => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; };
    const items = [];
    outerItems.forEach((p, i) => {
      const baseAngle = startOuter + i * gapOuter + spanOuter / 2;
      const n = Math.min(3, 1 + Math.floor((p.count || 1) / 2));
      for (let k = 0; k < n; k++) {
        const h = hash(p.label + k);
        const jitter = ((h % 30) - 15) * 0.2;
        items.push({ angle: baseAngle + jitter, radius: rOuter - 6 - (h % 6), delay: (h % 1000) / 1000 });
      }
    });
    return items;
  }, [outerItems, rOuter, startOuter, gapOuter, spanOuter]);

  return (
    <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: "visible" }}>
        <g transform={`translate(${cx} ${cy})`}>
          {[rOuter, rMid].map((rad, i) => (
            <circle key={i} cx={0} cy={0} r={rad} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
          ))}
          <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }}>
            {outerItems.map((p, i) => {
              const start = startOuter + i * gapOuter;
              const end = start + spanOuter;
              const id = `arc-out-${i}`;
              const d = arc0(rOuter, start, end);
              const mid = start + spanOuter / 2;
              const dot = pt0(rOuter, mid);
              return (
                <g key={id}>
                  <motion.path d={d} stroke="url(#ringGrad1)" strokeWidth={8} fill="none" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.0, delay: i * 0.06 }} />
                  <circle cx={dot.x} cy={dot.y} r={outerDot} fill="#60a5fa" opacity={0.95} />
                  <defs>
                    <path id={id} d={d} />
                    <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.7" />
                      <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>
                  <text fontSize={outerFont} fontWeight="800" fill="#0b1324"
                        style={{ paintOrder: "stroke", stroke: "rgba(255,255,255,0.9)", strokeWidth: 2, letterSpacing: 0.6 }}>
                    <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{p.label}</textPath>
                  </text>
                </g>
              );
            })}
          </motion.g>
          <motion.g animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 24, ease: "linear" }}>
            {innerItems.map((p, i) => {
              const start = startMid + i * gapMid;
              const end = start + spanMid;
              const id = `arc-in-${i}`;
              const d = arc0(rMid, start, end);
              const mid = start + spanMid / 2;
              const dot = pt0(rMid, mid);
              return (
                <g key={id}>
                  <motion.path d={d} stroke="url(#ringGrad2)" strokeWidth={6} fill="none" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: i * 0.05 }} />
                  <circle cx={dot.x} cy={dot.y} r={innerDot} fill="#a78bfa" opacity={0.95} />
                  <defs>
                    <path id={id} d={d} />
                    <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.65" />
                      <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.65" />
                    </linearGradient>
                  </defs>
                  <text fontSize={innerFont} fontWeight="800" fill="#0b1324"
                        style={{ paintOrder: "stroke", stroke: "rgba(255,255,255,0.9)", strokeWidth: 2, letterSpacing: 0.5 }}>
                    <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{p.label}</textPath>
                  </text>
                </g>
              );
            })}
          </motion.g>
          {/* Hotspots */}
          <g>
            {hotspots.map((h, i) => {
              const p = pt0(h.radius, h.angle);
              return (
                <motion.circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill="#22c55e"
                  initial={{ opacity: 0.2, scale: 0.8 }}
                  animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.25, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: h.delay }}
                />
              );
            })}
          </g>
        </g>
      </svg>
    </Box>
  );
}

/* ------------------------------ Loading stripes ---------------------------- */
function LoadingStripes({ width = 220 }) {
  const line = (w, i, d = 0) => (
    <Box
      key={i}
      sx={{
        height: 8,
        width: w,
        borderRadius: 999,
        background:
          "linear-gradient(90deg, rgba(34,197,94,0.25), rgba(96,165,250,0.25), rgba(139,92,246,0.25))",
        backgroundSize: "200% 100%",
        animation: `shimmer 1.6s linear ${d}s infinite, hue 6s ease-in-out ${d}s infinite`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        willChange: "filter, background-position",
      }}
    />
  );
  return (
    <>
      <Stack spacing={0.9} alignItems="center" sx={{ mt: 1.0 }}>
        {line(Math.round(width * 1.0), 1, 0)}
        {line(Math.round(width * 0.8), 2, 0.12)}
        {line(Math.round(width * 0.62), 3, 0.24)}
      </Stack>
      <style>{`
        @keyframes shimmer{ 0%{ background-position:200% 0;} 100%{ background-position:-200% 0; } }
        @keyframes hue{ 0%,100%{ filter: hue-rotate(0deg); } 50%{ filter: hue-rotate(40deg); } }
      `}</style>
    </>
  );
}

/* --------------------------- Results: profiles deck ------------------------ */
function ProfilesAfterScan({ users }) {
  const [deckIndex, setDeckIndex] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lastAction, setLastAction] = useState("");

  const topUser = users.length ? users[deckIndex % users.length] : null;
  const nextUser = users.length ? users[(deckIndex + 1) % users.length] : null;

  useEffect(() => { setPhotoIdx(0); setImageLoaded(false); }, [deckIndex]);

  const x = useMotionValue(0);
  const controls = useAnimation();
  const RIGHT_FULL = 280;
  const LEFT_FULL  = -280;

  const rightProg = useTransform(x, [0, 60, RIGHT_FULL], [0, 0.25, 1]);
  const leftProg  = useTransform(x, [LEFT_FULL, -60, 0], [1, 0.25, 0]);

  const likeScale   = useTransform(rightProg, [0, 1], [0.8, 3.0]);
  const likeOpacity = useTransform(rightProg, [0, 1], [0, 1]);
  const nopeScale   = useTransform(leftProg,  [0, 1], [0.8, 3.0]);
  const nopeOpacity = useTransform(leftProg,  [0, 1], [0, 1]);
  const rotate      = useTransform(x, [LEFT_FULL, 0, RIGHT_FULL], [-12, 0, 12]);

  const rightGlow = useTransform(rightProg, (p) => `linear-gradient(90deg, rgba(34,197,94,${0.07 * p}) 0%, transparent 30%)`);
  const leftGlow  = useTransform(leftProg,  (p) => `linear-gradient(-90deg, rgba(239,68,68,${0.07 * p}) 0%, transparent 30%)`);

  const controlsThrow = async (dir) => {
    const off = (window.innerWidth || 800) + 240;
    await controls.start({
      x: dir * off, y: (Math.random() - 0.5) * 80, rotate: dir * 25, opacity: 0.95,
      transition: { type: "spring", stiffness: 220, damping: 22 }
    });
    setDeckIndex((i) => (i + 1) % Math.max(users.length, 1));
    controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
  };

  const decide = async (type) => {
    if (!topUser) return;
    setLastAction(type);
    if (type === "right") return controlsThrow(+1);
    if (type === "left")  return controlsThrow(-1);
  };

  const onDragEnd = (_, info) => {
    const { offset, velocity } = info;
    const passRight = offset.x > 140 || velocity.x > 600;
    const passLeft  = offset.x < -140 || velocity.x < -600;
    if (passRight) return decide("right");
    if (passLeft)  return decide("left");
    controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 500, damping: 32 } });
  };

  const advancePhoto = (dir = 1) => {
    if (!topUser?.photos?.length) return;
    const total = topUser.photos.length;
    setImageLoaded(false);
    setPhotoIdx((i) => (i + dir + total) % total);
  };

  const currentSrc = topUser && (topUser.photos?.length ? topUser.photos[photoIdx % topUser.photos.length] : topUser.photoUrl);

  return (
    <>
      <Box sx={{ position: "relative", width: "100%", maxWidth: 480, mx: "auto" }}>
        {nextUser && (
          <Box aria-hidden sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1, pointerEvents: "none",
            transform: "scale(0.96) translateY(10px)", opacity: 0.92, filter: "saturate(0.9)" }}>
            <Box sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.06)", bgcolor: "#f6f7f9",
              width: "100%", aspectRatio: "4 / 5" }}>
              <img src={nextUser.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
            </Box>
          </Box>
        )}

        <AnimatePresence>
          {topUser && (
            <motion.div
              key={topUser.id + "-" + deckIndex}
              animate={controls} style={{ x, rotate, position: "relative", zIndex: 2 }}
              drag="x" dragElastic={0.18} dragConstraints={{ left: 0, right: 0 }} onDragEnd={onDragEnd}
              initial={{ scale: 0.985, opacity: 0 }} exit={{ opacity: 0, y: 40, transition: { duration: 0.25 } }}
            >
              <Box sx={{ borderRadius: 4, background: "#fff", boxShadow: "0 16px 40px rgba(0,0,0,0.10)", overflow: "visible", position:"relative" }}>
                <motion.div style={{ position:"absolute", inset:0, pointerEvents:"none", background: rightGlow, borderRadius: 16 }} />
                <motion.div style={{ position:"absolute", inset:0, pointerEvents:"none", background: leftGlow, borderRadius: 16 }} />

                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "4 / 5",
                    userSelect: "none",
                    bgcolor: "#eee",
                    overflow: "hidden",
                    borderRadius: "16px 16px 0 0",
                  }}
                  aria-label={`${topUser.name}, ${topUser.age}`}
                >
                  {!imageLoaded && (
                    <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#eee,#f5f5f5,#eee)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite linear" }} />
                  )}
                  <img src={currentSrc || topUser.photoUrl} alt={topUser.name} onLoad={() => setImageLoaded(true)} loading="lazy"
                       style={{ width: "100%", height: "100%", objectFit: "cover", display: imageLoaded ? "block" : "none" }}/>

                  {/* top progress bars for multi-photo */}
                  {topUser?.photos?.length > 1 && (
                    <Box sx={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", gap: 0.5 }}>
                      {topUser.photos.map((_, i) => (
                        <Box key={i} sx={{ flex: 1, height: 4, borderRadius: 999, bgcolor: "rgba(255,255,255,0.35)" }}>
                          <Box sx={{ width: `${i <= photoIdx ? 100 : 0}%`, height: "100%", borderRadius: 999, bgcolor: "#fff", transition: "width .25s" }} />
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* bottom dots + arrows */}
                  {topUser?.photos?.length > 1 && (
                    <>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 10,
                          left: 0,
                          right: 0,
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        {topUser.photos.map((_, i) => (
                          <Box
                            key={i}
                            onClick={() => {
                              setImageLoaded(false);
                              setPhotoIdx(i);
                            }}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: 999,
                              cursor: "pointer",
                              bgcolor: i === photoIdx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                            }}
                          />
                        ))}
                      </Box>

                      <IconButton
                        onClick={() => {
                          setImageLoaded(false);
                          advancePhoto(-1);
                        }}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: 6,
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,.9)",
                          "&:hover": { bgcolor: "#fff" },
                        }}
                      >
                        <ChevronLeft size={18} />
                      </IconButton>

                      <IconButton
                        onClick={() => {
                          setImageLoaded(false);
                          advancePhoto(+1);
                        }}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: "50%",
                          right: 6,
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,.9)",
                          "&:hover": { bgcolor: "#fff" },
                        }}
                      >
                        <ChevronRight size={18} />
                      </IconButton>
                    </>
                  )}

                  <motion.div style={{ opacity: likeOpacity, scale: likeScale }} className="like-ind" aria-hidden><Heart /></motion.div>
                  <motion.div style={{ opacity: nopeOpacity, scale: nopeScale }} className="nope-ind" aria-hidden><CloseIcon /></motion.div>

                  <style>{`
                    .like-ind, .nope-ind {
                      position:absolute; width:42px; height:42px; border-radius:999px;
                      display:flex; align-items:center; justify-content:center;
                      background: rgba(255,255,255,0.95); backdrop-filter: blur(6px);
                      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
                    }
                    .like-ind { right:-6px; top:50%; transform:translateY(-50%); }
                    .nope-ind { left:-6px; top:50%; transform:translateY(-50%); }
                    .like-ind svg { color:#22c55e; } .nope-ind svg { color:#ef4444; }
                    @keyframes shimmer{ 0%{ background-position:200% 0;} 100%{ background-position:-200% 0; } }
                  `}</style>
                </Box>

                <Box sx={{ p: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color:"#0f172a" }}>
                    {topUser.name}, {topUser.age}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "#475569", mt: 0.25, flexWrap: "wrap" }}>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                      <MapPin size={16} />
                      <Typography variant="body2">{topUser.city || "Tel Aviv"}</Typography>
                    </Stack>
                    <Typography variant="body2">·</Typography>
                    <Typography variant="body2">{formatDistance(topUser.distance)} away</Typography>
                  </Stack>
                  {topUser.profession && <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>{topUser.profession}</Typography>}
                  {topUser.tagline && <Typography variant="body2" sx={{ color: "#0f172a", mt: 1 }}>{topUser.tagline}</Typography>}

                  {/* About Me section */}
                  {topUser?.aboutMe?.length > 0 && (
                    <Box sx={{ mt: 1.25 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.6, color: "#0f172a" }}>
                        Details
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                        {topUser.aboutMe.map((item, idx) => (
                          <TagPill
                            key={idx}
                            icon={chipIconFor("about", item)}
                            label={item}
                            variant="soft"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Interests section */}
                  {topUser?.interests?.length > 0 && (
                    <Box sx={{ mt: 1.25 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.6, color: "#0f172a" }}>
                        Interests
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                        {topUser.interests.map((item, idx) => (
                          <TagPill
                            key={idx}
                            icon={chipIconFor("interests", item)}
                            label={item}
                            variant="soft"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Looking For section */}
                  {topUser?.lookingFor?.length > 0 && (
                    <Box sx={{ mt: 1.25 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.6, color: "#0f172a" }}>
                        Looking for
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                        {topUser.lookingFor.map((item, idx) => (
                          <TagPill
                            key={idx}
                            icon={chipIconFor("looking", item)}
                            label={item}
                            variant="soft"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Instruction text under card */}
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

      <Box sx={{ position: "absolute", left: -9999, top: "auto", width: 1, height: 1, overflow: "hidden" }} aria-live="polite">
        {lastAction}
      </Box>
    </>
  );
}

/* ------------------------- Distance control (CTA style) -------------------- */
function DistanceControl({ unit, valueKm, onToggleUnit, onChangeKm, open, setOpen }) {
  const valueM = Math.round(valueKm * 1000);
  const safeKm = Math.max(0.2, Math.min(7, Number(valueKm) || 0));
  const label = unit === "km"
    ? `${safeKm.toFixed(safeKm < 10 ? 1 : 0)} km`
    : `${Math.max(100, Math.min(900, valueM))} m`;

  return (
    <Box sx={{ position: "relative" }}>
      <Button
        onClick={() => setOpen((o) => !o)}
        startIcon={<MapPin />}
        sx={{
          borderRadius: 999,
          px: 2.2,
          py: 1.2,
          fontWeight: 900,
          textTransform: "none",
          color: "#0b1324",
          background:
            "radial-gradient(120px 120px at 30% 30%, #ccfff1 0%, #cfe8ff 60%, #d6d3ff 100%), " +
            "linear-gradient(135deg, rgba(0,163,255,0.22), rgba(99,102,241,0.22))",
          boxShadow: "0 16px 42px rgba(0,83,166,0.18)",
          border: "1px solid rgba(0,0,0,0.06)",
          backdropFilter: "blur(3px)",
          "&:hover": { boxShadow: "0 20px 56px rgba(0,83,166,0.22)", background:
            "radial-gradient(120px 120px at 30% 30%, #c6fff0 0%, #c7e2ff 60%, #d1ceff 100%), " +
            "linear-gradient(135deg, rgba(0,163,255,0.28), rgba(99,102,241,0.28))" },
        }}
      >
        Distance • {label}
      </Button>

      <Paper
        elevation={8}
        sx={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: "calc(100% + 10px)",
          width: 340,
          maxWidth: "92vw",
          borderRadius: 3,
          p: 1.6,
          display: open ? "block" : "none",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(2,6,23,0.06)",
          zIndex: 5,
        }}
      >
        <Stack spacing={1.1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: 800 }}>Set range</Typography>
            <Button size="small" onClick={onToggleUnit}
              sx={{ borderRadius: 999, px: 1.4, fontWeight: 800, textTransform: "none" }}>
              {unit === "km" ? "Switch to meters" : "Switch to km"}
            </Button>
          </Stack>

          {unit === "km" ? (
            <Box sx={{ px: 0.5, pt: 1 }}>
              <Slider
                value={Number(safeKm)}
                onChange={(_, v) => onChangeKm(v)}
                step={0.1}
                min={0.2}
                max={7}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v.toFixed(v < 10 ? 1 : 0)} km`}
              />
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Tip: Most users pick 0.5–5 km for best results.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ px: 0.5, pt: 1 }}>
              <Slider
                value={Math.max(100, Math.min(900, valueM))}
                onChange={(_, v) => onChangeKm(Number(v) / 1000)}
                step={50}
                min={100}
                max={900}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v} m`}
              />
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Meters mode is great indoors/events. For city search use km.
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={() => setOpen(false)} sx={{ fontWeight: 800 }}>Done</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

/* ------------------------- Filters dialog (updated max) -------------------- */
function FiltersDialog({ open, onClose, onSave, prefs }) {
  const [local, setLocal] = useState(prefs);
  useEffect(() => setLocal({ ...prefs, maxDistanceKm: Math.min(7, prefs.maxDistanceKm) }), [prefs]);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Filters</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mt: 1 }}>
          Max distance: {local.maxDistanceKm} km
        </Typography>
        <Slider value={local.maxDistanceKm} onChange={(_, v) => setLocal((p) => ({ ...p, maxDistanceKm: Math.min(7, Number(v)) }))} valueLabelDisplay="auto" step={0.1} min={0.2} max={7} />
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Age range: {local.ageRange[0]}–{local.ageRange[1]}
        </Typography>
        <Slider value={local.ageRange} onChange={(_, v) => setLocal((p) => ({ ...p, ageRange: v }))} valueLabelDisplay="auto" step={1} min={18} max={80} />
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Genders</Typography>
        <Stack direction="row" spacing={2}>
          <FormControlLabel control={<Checkbox checked disabled />} label="Women" />
          <FormControlLabel control={<Checkbox disabled />} label="Men" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(local)}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
