import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Stack,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Collapse,
  Autocomplete,
  Badge,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  MenuItem,
  Select,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  MapPin,
  Calendar,
  Plus,
  SlidersHorizontal,
  CalendarClock,
  Sun,
  Music,
  Map as MapIcon,
  List as ListIcon,
  LocateFixed,
  Heart,
  Wine,
  PartyPopper,
  Users,
  TreePine,
  Mic2,
  MessageCircle,
  UserPlus,
  Sparkles,
  Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ----------------------------- Mock data --------------------------------- */
// Vibe types per Pulse spec
const VIBE_TYPES = ['Chill', 'Social', 'Flirty', 'Deep', 'Energetic'];

// Demo people going to events
const DEMO_ATTENDEES = [
  { id: "a1", name: "Maya", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", isMatch: true },
  { id: "a2", name: "Noam", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", isMatch: true },
  { id: "a3", name: "Amit", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", isMatch: false },
  { id: "a4", name: "Shira", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", isMatch: false },
  { id: "a5", name: "Yoni", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", isMatch: false },
];

const EVENTS = [
  { id: "lp1", title: "Summer Festival", category: "large", price: 149, date: "2025-07-23", time: "16:00", venue: "Central Park", country: "USA", region: "New York", coords: { lat: 40.7812, lng: -73.9665 }, cover: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1600&auto=format&fit=crop", videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-at-a-concert-4248-large.mp4", tags: ["Outdoor", "Live Music", "Dancing"], blurb: "All-day stages, food trucks and fireworks.", details: "Multiple stages, 40+ artists, VIP lounge, family area, and late-night DJ set.", badges: ["Verified"], hostedBy: "NYC Events Co.", capacity: 5000, whoFor: "Music lovers, festival goers, anyone looking for a fun summer day", vibe: "Energetic", attendees: ["a1", "a3", "a5"] },
  { id: "lp2", title: "Mega Dance Night", category: "large", price: 99, date: "2025-06-12", time: "21:00", venue: "Sky Dome", country: "USA", region: "Metro", coords: { lat: 40.7306, lng: -73.9352 }, cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop", videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-in-a-club-4819-large.mp4", tags: ["DJ", "Dancing", "Drinks"], blurb: "Top DJs with immersive light show.", details: "Doors 21:00 • Main act 23:30 • Dress code: casual chic.", badges: ["18+"], hostedBy: "NightLife Productions", capacity: 2000, whoFor: "EDM fans, night owls, people who love to dance", vibe: "Energetic", attendees: ["a2", "a4"] },
  { id: "sp1", title: "Private Loft Party", category: "small", price: 60, date: "2025-05-30", time: "20:00", venue: "Maple St. 123", country: "USA", region: "Uptown", coords: { lat: 40.7644, lng: -73.9747 }, cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop", tags: ["Social", "Drinks"], blurb: "Intimate house vibes, 80 guests max.", details: "BYOB, rooftop chill zone, quiet room available.", badges: ["New"], hostedBy: "The Loft Collective", capacity: 80, whoFor: "People seeking intimate connections in a relaxed setting", vibe: "Flirty", attendees: ["a1", "a2"] },
  { id: "sp2", title: "Acoustic Night", category: "small", price: 45, date: "2025-06-18", time: "20:30", venue: "Indie Bar", country: "USA", region: "City Center", coords: { lat: 40.741, lng: -73.9897 }, cover: "https://images.unsplash.com/photo-1464375117522-1311dd6d0cd2?q=80&w=1600&auto=format&fit=crop", tags: ["Live Music", "Social"], blurb: "Unplugged sets & candlelight atmosphere.", details: "Limited seating • First set at 20:30 • Open mic at 22:30.", hostedBy: "Indie Sessions", capacity: 50, whoFor: "Music appreciators, acoustic lovers, creative souls", vibe: "Chill", attendees: ["a3"] },
  { id: "tw1", title: "Night Food Market", category: "twist", price: 0, date: "2025-09-07", time: "18:00", venue: "Downtown Plaza", country: "USA", region: "Downtown", coords: { lat: 40.7128, lng: -74.006 }, cover: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1600&auto=format&fit=crop", videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-people-walking-by-a-food-stand-at-night-4401-large.mp4", tags: ["Outdoor", "Social"], blurb: "Global cuisines, live demos, indie bands.", details: "30+ vendors, vegan options, chef talks, tasting bracelets available.", badges: ["Family"], hostedBy: "Foodies United", capacity: 1000, whoFor: "Food enthusiasts, social butterflies, anyone hungry", vibe: "Social", attendees: ["a1", "a4", "a5"] },
  { id: "tw2", title: "Museum Late Hours", category: "twist", price: 30, date: "2025-08-15", time: "19:00", venue: "City Museum", country: "USA", region: "Museum District", coords: { lat: 40.7794, lng: -73.9632 }, cover: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=1600&auto=format&fit=crop", tags: ["Talks", "Social"], blurb: "Special curation + ambient DJ set.", details: "Guided tours every hour • Café open till midnight.", hostedBy: "City Museum", capacity: 300, whoFor: "Art lovers, curious minds, those seeking deeper conversations", vibe: "Deep", attendees: ["a2", "a3"] },
  { id: "spx1", title: "Tennis Tournament", category: "sports", price: 70, date: "2025-06-05", time: "10:00", venue: "Grand Arena", country: "USA", region: "Sports Park", coords: { lat: 40.8296, lng: -73.9262 }, cover: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1600&auto=format&fit=crop", tags: ["Outdoor", "Social"], blurb: "Quarterfinals • Center court seats available.", details: "Gates 10:00 • No outside drinks • Family bundle discounts.", hostedBy: "Sports League", capacity: 800, whoFor: "Sports fans, tennis enthusiasts", vibe: "Energetic", attendees: [] },
  { id: "spx2", title: "Sunset 5K Run", category: "sports", price: 35, date: "2025-06-22", time: "19:00", venue: "Beachfront", country: "USA", region: "Beach", coords: { lat: 40.583, lng: -73.8283 }, cover: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop", tags: ["Outdoor", "Social"], blurb: "Scenic route along the coast, medals for finishers.", details: "Packet pickup from 16:00 • Start 19:00 • Hydration stations.", hostedBy: "Run Club", capacity: 500, whoFor: "Runners, fitness lovers, sunset chasers", vibe: "Energetic", attendees: ["a5"] },
];

/* --------------------------- Tabs meta -------------------------------- */
const BASE_TABS = [
  { key: "all", label: "All" },
  { key: "large", label: "Large Parties" },
  { key: "small", label: "Small / Private" },
  { key: "twist", label: "Events with a Twist" },
  { key: "sports", label: "Sports" },
];
const EXTRA_TABS = [
  { key: "saved", label: "Saved" },
  { key: "purchased", label: "Purchased" },
];
const ALL_TABS = [...BASE_TABS, ...EXTRA_TABS];

/* ------------------------- Utils ---------------------------- */
function Row({ icon: Icon, children }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
      <Icon size={16} aria-hidden />
      <Typography variant="body2" noWrap>{children}</Typography>
    </Stack>
  );
}
const fmtDate = (s) => new Date(s).toLocaleDateString();

// Pulse-style date format: "Thu · May 30 · 21:00"
const fmtPulseDate = (dateStr, time = "21:00") => {
  const d = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]} · ${months[d.getMonth()]} ${d.getDate()} · ${time}`;
};

// Check if event is happening today
const isHappeningTonight = (dateStr) => isSameYMD(new Date(dateStr), new Date());

// Pulse spec: 30 days window, 15-25 events max
const EVENTS_WINDOW_DAYS = 30;
const EVENTS_MAX_COUNT = 25;

// Filter events within 30 days window
const isWithin30Days = (dateStr) => {
  const eventDate = new Date(dateStr);
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + EVENTS_WINDOW_DAYS);
  return eventDate >= today && eventDate <= thirtyDaysLater;
};

// Vibe icons mapping
const VIBE_ICONS = {
  'Live Music': { icon: Music, color: '#dc2626' },
  'Drinks': { icon: Wine, color: '#7c3aed' },
  'Dancing': { icon: PartyPopper, color: '#ec4899' },
  'Social': { icon: Users, color: '#0ea5e9' },
  'Outdoor': { icon: TreePine, color: '#16a34a' },
  'DJ': { icon: Mic2, color: '#f59e0b' },
  'Talks': { icon: MessageCircle, color: '#6366f1' },
};

// "Good Match" copy options
const GOOD_MATCH_COPY = [
  "Looks like your kind of evening.",
  "Feels very… you.",
  "Matches your usual energy.",
  "Your vibe tends to show up here.",
];
const isSameYMD = (d1, d2) => d1.getFullYear()===d2.getFullYear() && d1.getMonth()===d2.getMonth() && d1.getDate()===d2.getDate();
const isWeekend = (d) => { const day = d.getDay(); return day === 5 || day === 6; };
const haversineKm = (a, b) => {
  if (!a || !b) return Infinity;
  const R = 6371, dLat=((b.lat-a.lat)*Math.PI)/180, dLng=((b.lng-a.lng)*Math.PI)/180;
  const lat1=(a.lat*Math.PI)/180, lat2=(b.lat*Math.PI)/180;
  const c = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2*R*Math.atan2(Math.sqrt(c), Math.sqrt(1-c));
};
// טקסט לכתובת
const eventAddress = (ev) => [ev.venue, ev.region, ev.country].filter(Boolean).join(", ");
// Google Maps: רשימה (עד 9 נק')
function buildGoogleMapsUrl(list, userLocation) {
  const maxPts = 9;
  const addrs = list.slice(0, maxPts).map(eventAddress).filter(Boolean);
  if (!addrs.length) return null;
  const dest = encodeURIComponent(addrs[0]);
  const waypoints = addrs.length > 1 ? `&waypoints=${encodeURIComponent(addrs.slice(1).join("|"))}` : "";
  const origin = userLocation ? `&origin=${encodeURIComponent(`${userLocation.lat},${userLocation.lng}`)}` : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}${origin}${waypoints}`;
}
// Google Maps: אירוע ראשי + יתר האירועים
function buildMapsUrlWithPrimary(primary, allEvents, userLocation) {
  const others = allEvents.filter((e) => e.id !== primary.id);
  const ordered = [primary, ...others];
  return buildGoogleMapsUrl(ordered, userLocation);
}
// Google Calendar template URL (add directly)
function googleCalendarUrl(ev) {
  const start = new Date(ev.date + "T20:00:00");
  const end   = new Date(ev.date + "T23:00:00");
  const pad = (n) => String(n).padStart(2,"0");
  const toUTC = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const dates = `${toUTC(start)}/${toUTC(end)}`;
  const base  = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const params = [
    `text=${encodeURIComponent(ev.title)}`,
    `details=${encodeURIComponent(ev.details || "")}`,
    `location=${encodeURIComponent(eventAddress(ev))}`,
    `dates=${dates}`,
  ].join("&");
  return `${base}&${params}`;
}

/* ----------------------------- Event Card (Pulse Spec) -------------------------------- */
function EventCard({ ev, onBuy, onToggleFav, isFav, onOpenCalendar, onOpenMaps, distanceKm, onInvitePlus1, showGoodMatch, onViewDetails }) {
  const [open, setOpen] = useState(false);
  
  // Status badge logic
  const getStatusBadge = () => {
    if (isHappeningTonight(ev.date)) return { label: "Happening tonight", color: "#dc2626", bg: "rgba(220,38,38,0.1)" };
    if (ev.soldOut) return { label: "Sold out", color: "#6b7280", bg: "rgba(107,114,128,0.1)" };
    if (ev.price === 0) return { label: "Free", color: "#16a34a", bg: "rgba(22,163,74,0.1)" };
    return { label: "Paid", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" };
  };
  const status = getStatusBadge();

  // Get vibe icons for this event
  const vibeIcons = (ev.tags || []).filter(tag => VIBE_ICONS[tag]).slice(0, 4);

  return (
    <Card elevation={0} sx={{ borderRadius: 3, boxShadow: "0 8px 30px rgba(0,0,0,0.06)", overflow: "hidden", bgcolor: "#fff", position: "relative" }}>
      {/* Save button */}
      <IconButton
        aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
        onClick={(e) => { e.stopPropagation(); onToggleFav?.(ev.id); }}
        size="small"
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 2, bgcolor: isFav ? "primary.main" : "rgba(255,255,255,0.9)", color: isFav ? "#fff" : "text.primary", "&:hover": { bgcolor: isFav ? "primary.dark" : "white" }, boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}
      >
        <Heart size={16} />
      </IconButton>

      {/* Status badge */}
      <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 2, px: 1, py: 0.25, borderRadius: "6px", bgcolor: status.bg, color: status.color, fontSize: "0.7rem", fontWeight: 600 }}>
        {status.label}
      </Box>

      {/* "Good Match for You" badge - subtle hint */}
      {showGoodMatch && (
        <Box sx={{ position: "absolute", top: 44, left: 8, zIndex: 2, px: 1, py: 0.25, borderRadius: "6px", bgcolor: "rgba(108,92,231,0.1)", color: "#6C5CE7", fontSize: "0.65rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 0.5 }}>
          <Sparkles size={10} />
          {GOOD_MATCH_COPY[Math.floor(Math.random() * GOOD_MATCH_COPY.length)]}
        </Box>
      )}

      <CardActionArea onClick={() => onViewDetails ? onViewDetails(ev) : setOpen((v) => !v)}>
        {/* Video loop (muted) or cover image per Pulse spec */}
        {ev.videoUrl ? (
          <Box sx={{ height: 180, overflow: 'hidden', position: 'relative' }}>
            <video
              src={ev.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              poster={ev.cover}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        ) : (
          ev.cover && <CardMedia component="img" height="180" image={ev.cover} alt={ev.title} loading="lazy" style={{ objectFit: "cover" }} />
        )}
        <CardContent sx={{ pb: 1 }}>
          {/* Title */}
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }} noWrap>{ev.title}</Typography>

          {/* Pulse-style date: Thu · May 30 · 21:00 */}
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {fmtPulseDate(ev.date, ev.time || "20:00")}
          </Typography>

          {/* Location (general only - city/region per spec) */}
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
            {ev.region || ev.venue}
            {typeof distanceKm === "number" && isFinite(distanceKm) && ` · ${distanceKm.toFixed(1)} km`}
          </Typography>

          {/* Vibe icons (descriptive, not filters per spec) */}
          {vibeIcons.length > 0 && (
            <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
              {vibeIcons.map((tag) => {
                const vibe = VIBE_ICONS[tag];
                const Icon = vibe.icon;
                return (
                  <Box key={tag} sx={{ display: "flex", alignItems: "center", gap: 0.25, color: vibe.color, fontSize: "0.7rem" }}>
                    <Icon size={12} />
                    <span>{tag}</span>
                  </Box>
                );
              })}
            </Stack>
          )}

          {/* Regular tags for non-vibe tags */}
          {!!ev.tags?.filter(t => !VIBE_ICONS[t]).length && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.75 }} flexWrap="wrap">
              {ev.tags.filter(t => !VIBE_ICONS[t]).slice(0, 3).map((t) => <Chip key={t} size="small" label={t} sx={{ fontSize: "0.65rem" }} />)}
            </Stack>
          )}

          <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 1.25 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{ev.details}</Typography>
          </Collapse>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
        <Stack spacing={1} sx={{ width: "100%" }}>
          <Stack direction="row" spacing={1}>
            {/* Primary CTA - context dependent */}
            <Button 
              size="small" 
              variant="contained" 
              fullWidth 
              onClick={() => onBuy(ev)}
              disabled={ev.soldOut}
            >
              {ev.soldOut ? "SOLD OUT" : ev.price === 0 ? "JOIN" : "BUY TICKET"}
            </Button>
          </Stack>
          <Stack direction="row" spacing={1}>
            {/* +1 (Bring someone) - always visible per spec */}
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={<UserPlus size={14} />}
              onClick={(e) => { e.stopPropagation(); onInvitePlus1?.(ev); }}
              sx={{ flex: 1, fontSize: "0.7rem" }}
            >
              +1
            </Button>
            <Button size="small" variant="outlined" onClick={() => onOpenCalendar?.(ev)} sx={{ minWidth: 'auto', px: 1.5 }}>
              <Calendar size={14} />
            </Button>
            <Button size="small" variant="outlined" onClick={() => onOpenMaps?.(ev)} sx={{ minWidth: 'auto', px: 1.5 }}>
              <MapPin size={14} />
            </Button>
          </Stack>
        </Stack>
      </CardActions>
    </Card>
  );
}

/* -------------------------- Category Section ----------------------------- */
function CategorySection({ title, events, onBuy, favs, onToggleFav, onOpenCalendar, userLocation, onOpenMaps, onInvitePlus1, onViewDetails }) {
  // "Good Match" badge shows on ~30% of events, randomly - must be before early return
  const goodMatchIds = useMemo(() => {
    if (!events?.length) return new Set();
    const shuffled = [...events].sort(() => Math.random() - 0.5);
    return new Set(shuffled.slice(0, Math.ceil(events.length * 0.3)).map(e => e.id));
  }, [events]);

  if (!events?.length) return null;
  
  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>{title}</Typography>
      </Stack>
      <Grid container spacing={2}>
        {events.map((ev) => {
          const distanceKm = userLocation && ev.coords ? haversineKm(userLocation, ev.coords) : undefined;
          return (
            <Grid key={ev.id} item xs={12} sm={6} md={4}>
              <EventCard
                ev={ev}
                onBuy={onBuy}
                onToggleFav={onToggleFav}
                isFav={favs.has(ev.id)}
                onOpenCalendar={onOpenCalendar}
                onOpenMaps={(primary) => onOpenMaps(primary)}
                distanceKm={distanceKm}
                onInvitePlus1={onInvitePlus1}
                showGoodMatch={goodMatchIds.has(ev.id)}
                onViewDetails={onViewDetails}
              />
            </Grid>
          );
        })}
      </Grid>
      <Divider sx={{ mt: 3 }} />
    </Box>
  );
}

/* ------------------------ Swipe Deck (Purchased) ------------------------- */
function SwipeDeck({ users, onLike, onSkip }) {
  const [deck, setDeck] = useState(users || []);
  useEffect(() => setDeck(users || []), [users]);

  const handleSwipe = (u, dir) => {
    setDeck((d) => d.filter((x) => x.id !== u.id));
    dir === "right" ? onLike?.(u) : onSkip?.(u);
  };

  // מציגים 3 עליונות בלבד לשכבות יפות
  const top = deck.slice(0, 3);

  return (
    <Box sx={{ position: "relative", height: 360 }}>
      {top.map((u, i) => {
        const isTop = i === 0;
        const z = 10 - i;
        const yOffset = i * 10;
        return (
          <motion.div
            key={u.id}
            drag={isTop ? "x" : false}
            dragElastic={0.2}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              const power = Math.abs(info.offset.x) + Math.abs(info.velocity.x);
              const dir = info.offset.x > 0 ? "right" : "left";
              if (power > 160) {
                handleSwipe(u, dir);
              }
            }}
            whileTap={{ scale: isTop ? 1.02 : 1 }}
            style={{
              position: "absolute",
              inset: 0,
              y: yOffset,
              zIndex: z,
            }}
          >
            <Card
              sx={{
                height: 340,
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>{u.name}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>{u.bio}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Attends: {(u.eventIds || []).map((id)=>EVENTS.find(e=>e.id===id)?.title).filter(Boolean).join(", ")}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, display: "flex", justifyContent: "space-between" }}>
                <Button variant="outlined" color="inherit" onClick={() => handleSwipe(u, "left")}>Skip</Button>
                <Button variant="contained" onClick={() => handleSwipe(u, "right")}>Like</Button>
              </CardActions>
            </Card>
          </motion.div>
        );
      })}
      {deck.length === 0 && (
        <Alert severity="success" sx={{ position: "absolute", inset: 0, m: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          No more people – come back later!
        </Alert>
      )}
    </Box>
  );
}

/* --------------------------- Purchase Dialog ----------------------------- */
function TicketPurchaseDialog({ open, onClose, event, onPurchased }) {
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("in_app");
  const [err, setErr] = useState("");

  const price = Number(event?.price || 0);
  const total = Math.max(1, Number(qty || 1)) * price;

  const confirm = () => {
    if (!name.trim()) return setErr("Please enter the buyer name.");
    if (!email.trim() || !email.includes("@")) return setErr("Please enter a valid email.");
    setErr("");
    onPurchased?.(event?.id);
    onClose?.({ ok: true, eventId: event.id, qty, name, email, method, total });
  };

  return (
    <Dialog open={open} onClose={() => onClose?.(null)} fullWidth maxWidth="xs">
      <DialogTitle>Purchase Tickets</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{event?.title}</Typography>
          <Typography variant="body2">Price per ticket: ₪{price.toFixed(2)}</Typography>
          <TextField label="Buyer name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Email for receipt" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <TextField label="Quantity" type="number" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} inputProps={{ min: 1 }} fullWidth />
          <Stack>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Payment method</Typography>
            <RadioGroup row value={method} onChange={(e) => setMethod(e.target.value)} name="payment">
              <FormControlLabel value="in_app" control={<Radio />} label="In-App" />
              <FormControlLabel value="bit" control={<Radio />} label="Bit" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </Stack>
          {!!err && <Alert severity="error">{err}</Alert>}
          <Divider />
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Total</Typography>
            <Typography sx={{ fontWeight: 900 }}>₪{total.toFixed(2)}</Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose?.(null)} color="inherit">Cancel</Button>
        <Button onClick={confirm} variant="contained">Pay Now</Button>
      </DialogActions>
    </Dialog>
  );
}

/* --------------------------- +1 Invite Dialog (Pulse Spec) ----------------------------- */
function PlusOneInviteDialog({ open, onClose, event, matches = [], purchased }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const isPurchased = purchased?.has(event?.id);
  
  const sendInvite = () => {
    if (!selectedMatch) return;
    // In real app, this would send through internal messaging
    onClose?.({ sent: true, matchId: selectedMatch, eventId: event?.id });
  };

  return (
    <Dialog open={open} onClose={() => onClose?.(null)} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800 }}>
        Invite someone to {event?.title}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          {isPurchased 
            ? "I'm already going — want to come with me?"
            : "Thinking of going to this — want to join?"}
        </Typography>
        
        {matches.length === 0 ? (
          <Alert severity="info">
            You don't have any matches yet. Start connecting with people first!
          </Alert>
        ) : (
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Select a match to invite:</Typography>
            {matches.map((m) => (
              <Box 
                key={m.id}
                onClick={() => setSelectedMatch(m.id)}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: selectedMatch === m.id ? "2px solid #6C5CE7" : "1px solid #e5e7eb",
                  bgcolor: selectedMatch === m.id ? "rgba(108,92,231,0.05)" : "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#e5e7eb" }} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{m.name}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>{m.bio}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose?.(null)} color="inherit">Cancel</Button>
        <Button 
          onClick={sendInvite} 
          variant="contained" 
          disabled={!selectedMatch}
          startIcon={<UserPlus size={16} />}
        >
          Send Invite
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* --------------------------- Event Details Dialog (Pulse Spec) ----------------------------- */
function EventDetailsDialog({ open, onClose, event, purchased, onBuy, onInvitePlus1, onSave, isSaved }) {
  if (!event) return null;
  
  const isPurchased = purchased?.has(event.id);
  const eventAttendees = (event.attendees || []).map(id => DEMO_ATTENDEES.find(a => a.id === id)).filter(Boolean);
  // Sort: matches first per spec
  const sortedAttendees = [...eventAttendees].sort((a, b) => (b.isMatch ? 1 : 0) - (a.isMatch ? 1 : 0));
  
  const vibeColors = {
    Chill: '#0ea5e9',
    Social: '#22c55e', 
    Flirty: '#ec4899',
    Deep: '#8b5cf6',
    Energetic: '#f59e0b',
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      {/* Hero - Video or Image */}
      <Box sx={{ position: 'relative' }}>
        {event.videoUrl ? (
          <video
            src={event.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            poster={event.cover}
            style={{ width: '100%', height: 220, objectFit: 'cover' }}
          />
        ) : (
          <Box
            component="img"
            src={event.cover}
            alt={event.title}
            sx={{ width: '100%', height: 220, objectFit: 'cover' }}
          />
        )}
        <IconButton 
          onClick={onClose} 
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)' }}
        >
          <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 2 }}>
        {/* Title & Date */}
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>{event.title}</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {fmtPulseDate(event.date, event.time || "20:00")}
        </Typography>
        
        {/* Location (general only per spec) */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, color: 'text.secondary' }}>
          <MapPin size={16} />
          <Typography variant="body2">{event.region || event.venue}</Typography>
        </Stack>

        {/* Neighborhood-level map per Pulse spec (zoom 14 = neighborhood level) */}
        {event.coords && (
          <Box sx={{ mt: 1.5, borderRadius: 2, overflow: 'hidden', height: 120 }}>
            <iframe
              title="Event location"
              width="100%"
              height="120"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.coords.lng-0.02},${event.coords.lat-0.01},${event.coords.lng+0.02},${event.coords.lat+0.01}&layer=mapnik&marker=${event.coords.lat},${event.coords.lng}`}
            />
          </Box>
        )}

        {/* Vibe badge */}
        {event.vibe && (
          <Chip 
            label={event.vibe}
            size="small"
            sx={{ 
              mt: 1.5, 
              bgcolor: `${vibeColors[event.vibe]}15`,
              color: vibeColors[event.vibe],
              fontWeight: 600,
            }}
          />
        )}

        <Divider sx={{ my: 2 }} />

        {/* Description */}
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {event.details || event.blurb}
        </Typography>

        {/* Event Info */}
        <Stack spacing={1.5}>
          {event.hostedBy && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Hosted by</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{event.hostedBy}</Typography>
            </Box>
          )}
          
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Price</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {event.price === 0 ? 'Free' : `₪${event.price}`}
              </Typography>
            </Box>
            {event.capacity && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Capacity</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{event.capacity} people</Typography>
              </Box>
            )}
          </Stack>

          {/* Who's it for (informational only per spec) */}
          {event.whoFor && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Who's it for</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                {event.whoFor}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* People Going - visible only after joining per spec */}
        {isPurchased && sortedAttendees.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              People you might enjoy meeting first
            </Typography>
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
              {sortedAttendees.map((attendee) => (
                <Box key={attendee.id} sx={{ textAlign: 'center', minWidth: 70 }}>
                  <Box
                    component="img"
                    src={attendee.photo}
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: attendee.isMatch ? '2px solid #6C5CE7' : '2px solid #e5e7eb',
                    }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    {attendee.name}
                  </Typography>
                  {attendee.isMatch && (
                    <Typography variant="caption" sx={{ color: '#6C5CE7', fontSize: '0.6rem' }}>
                      Match
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
        {/* Primary CTA */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => { onBuy?.(event); onClose(); }}
          disabled={event.soldOut || isPurchased}
          sx={{ fontWeight: 700 }}
        >
          {isPurchased ? "You're going! ✓" : event.soldOut ? "SOLD OUT" : event.price === 0 ? "JOIN" : "BUY TICKET"}
        </Button>
        
        {/* Secondary CTAs */}
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <Button
            variant="outlined"
            startIcon={<Heart size={16} />}
            onClick={() => onSave?.(event.id)}
            sx={{ flex: 1 }}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share2 size={16} />}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: event.title,
                  text: `Check out ${event.title} on ${fmtPulseDate(event.date, event.time || "20:00")}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            sx={{ flex: 1 }}
          >
            Share
          </Button>
          <Button
            variant="outlined"
            startIcon={<UserPlus size={16} />}
            onClick={() => { onInvitePlus1?.(event); onClose(); }}
            sx={{ flex: 1 }}
          >
            +1
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------- Main Page -------------------------------- */
export default function EventsByCategory() {
  const [tab, setTab] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(null); // New: for Event Details dialog
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  
  // +1 Invite dialog state
  const [plusOneEvent, setPlusOneEvent] = useState(null);

  // סינון/מיון - Pulse spec: chronological order only (closest first)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState("date_asc"); // Changed to chronological (closest first) per Pulse spec

  // פילטרים מהירים
  const [quickToday, setQuickToday] = useState(false);
  const [quickWeekend, setQuickWeekend] = useState(false);
  const [quickFree, setQuickFree] = useState(false);
  const [quickNear, setQuickNear] = useState(false);
  const [quickOutdoor, setQuickOutdoor] = useState(false);
  const [quickLive, setQuickLive] = useState(false);

  // מועדפים
  const [favs, setFavs] = useState(() => {
    try { const raw = localStorage.getItem("event_favs"); return new Set(raw ? JSON.parse(raw) : []); }
    catch { return new Set(); }
  });
  useEffect(() => { localStorage.setItem("event_favs", JSON.stringify(Array.from(favs))); }, [favs]);
  const toggleFav = (id) => setFavs((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // רכישות
  const [purchased, setPurchased] = useState(() => {
    try { const raw = localStorage.getItem("event_purchased"); return new Set(raw ? JSON.parse(raw) : []); }
    catch { return new Set(); }
  });
  useEffect(() => { localStorage.setItem("event_purchased", JSON.stringify(Array.from(purchased))); }, [purchased]);

  // התאמות/מאצים (דמו)
  const [prefGender, setPrefGender] = useState("any"); // 'any' | 'female' | 'male'
  const [matches, setMatches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("event_matches") || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem("event_matches", JSON.stringify(matches)); }, [matches]);

  // מיקום
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [snack, setSnack] = useState("");
  useEffect(() => {
    if (quickNear && !userLocation) {
      if (!navigator.geolocation) setGeoError("Geolocation is not supported by your browser.");
      else {
        navigator.geolocation.getCurrentPosition(
          (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoError(""); },
          (err) => { setGeoError(err.message || "Could not get your location."); setQuickNear(false); },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        );
      }
    }
  }, [quickNear, userLocation]);

  const theme = useTheme();
  const navigate = useNavigate();

  // קיבוץ לקטגוריות
  const dataByCat = useMemo(() => {
    const group = { large: [], small: [], twist: [], sports: [] };
    for (const ev of EVENTS) group[ev.category]?.push(ev);
    return group;
  }, []);

  // נגזרות לטופס
  const allTags = useMemo(() => { const s=new Set(); EVENTS.forEach((e)=>(e.tags||[]).forEach((t)=>s.add(t))); return Array.from(s).sort(); }, []);
  const allCountries = useMemo(() => { const s=new Set(EVENTS.map((e)=>e.country).filter(Boolean)); return Array.from(s).sort(); }, []);
  const allRegions = useMemo(() => { const s=new Set(EVENTS.map((e)=>e.region).filter(Boolean)); return Array.from(s).sort(); }, []);
  const priceBounds = useMemo(() => { const prices=EVENTS.map((e)=>Number(e.price||0)); return { min: Math.min(...prices), max: Math.max(...prices) }; }, []);

  const isFiltered = useMemo(() => (
    (selectedCategories && selectedCategories.length > 0) ||
    (selectedTags && selectedTags.length > 0) || country || region ||
    searchText.trim() || dateFrom || dateTo || priceMin || priceMax ||
    quickToday || quickWeekend || quickFree || quickNear || quickOutdoor || quickLive
  ), [selectedCategories, selectedTags, country, region, searchText, dateFrom, dateTo, priceMin, priceMax, quickToday, quickWeekend, quickFree, quickNear, quickOutdoor, quickLive]);

  // סינון+מיון - Pulse spec: 30 days window, max 25 events
  const visible = useMemo(() => {
    // מקור לפי טאב (כולל saved/purchased)
    let base;
    if (tab === "saved") base = EVENTS.filter((ev) => favs.has(ev.id));
    else if (tab === "purchased") base = EVENTS.filter((ev) => purchased.has(ev.id));
    else {
      // Apply 30 days window filter for regular tabs (not saved/purchased)
      const filtered30Days = EVENTS.filter((ev) => isWithin30Days(ev.date));
      base = tab === "all" ? filtered30Days : filtered30Days.filter((ev) => ev.category === tab);
    }

    if (selectedCategories.length > 0) {
      const set = new Set(selectedCategories);
      base = base.filter((ev) => set.has(ev.category));
    }
    if (selectedTags.length > 0) {
      const set = new Set(selectedTags.map((t) => t.toLowerCase()));
      base = base.filter((ev) => (ev.tags || []).map((t)=>String(t).toLowerCase()).some((t)=>set.has(t)));
    }
    if (country) base = base.filter((ev) => (ev.country || "").toLowerCase() === country.toLowerCase());
    if (region)  base = base.filter((ev) => (ev.region  || "").toLowerCase() === region.toLowerCase());

    const q = searchText.trim().toLowerCase();
    if (q) base = base.filter((ev) => ev.title.toLowerCase().includes(q) || (ev.venue||"").toLowerCase().includes(q) || (ev.tags||[]).some((t)=>String(t).toLowerCase().includes(q)) || (ev.region||"").toLowerCase().includes(q) || (ev.country||"").toLowerCase().includes(q));

    const toDate = (s) => (s ? new Date(s + "T00:00:00") : null);
    const fromD = toDate(dateFrom); const toD = toDate(dateTo);
    if (fromD) base = base.filter((ev) => new Date(ev.date) >= fromD);
    if (toD)   base = base.filter((ev) => new Date(ev.date) <= toD);

    const pMin = priceMin !== "" ? Number(priceMin) : null;
    const pMax = priceMax !== "" ? Number(priceMax) : null;
    if (pMin !== null) base = base.filter((ev) => Number(ev.price || 0) >= pMin);
    if (pMax !== null) base = base.filter((ev) => Number(ev.price || 0) <= pMax);
    if (quickFree) base = base.filter((ev) => Number(ev.price || 0) === 0);

    if (quickOutdoor) base = base.filter((ev) => (ev.tags || []).map((t)=>String(t).toLowerCase()).includes("outdoor"));
    if (quickLive)    base = base.filter((ev) => (ev.tags || []).map((t)=>String(t).toLowerCase()).includes("live music"));

    if (quickToday)   base = base.filter((ev) => isSameYMD(new Date(ev.date), new Date()));
    if (quickWeekend) base = base.filter((ev) => isWeekend(new Date(ev.date)));

    if (quickNear && userLocation) {
      base = base.filter((ev) => ev.coords)
        .map((ev) => ({ ev, d: haversineKm(userLocation, ev.coords) }))
        .filter(({ d }) => d <= 25)
        .sort((a, b) => a.d - b.d)
        .map(({ ev }) => ev);
    }

    const by = {
      date_desc: (a, b) => new Date(b.date) - new Date(a.date),
      date_asc:  (a, b) => new Date(a.date) - new Date(b.date),
      price_low: (a, b) => Number(a.price||0) - Number(b.price||0),
      price_high:(a, b) => Number(b.price||0) - Number(a.price||0),
      title_az:  (a, b) => a.title.localeCompare(b.title),
    }[sortBy] || ((a,b)=>0);

    // Pulse spec: max 25 events (15-25 range)
    return base.sort(by).slice(0, EVENTS_MAX_COUNT);
  }, [tab, favs, purchased, selectedCategories, selectedTags, country, region, searchText, dateFrom, dateTo, priceMin, priceMax, sortBy, quickToday, quickWeekend, quickFree, quickNear, quickOutdoor, quickLive, userLocation]);

  const openBuy = (ev) => setSelectedEvent(ev);
  const closeBuy = (result) => {
    setSelectedEvent(null);
    if (result?.ok) { console.log("ORDER", result); setSnack("Order placed successfully."); }
  };
  const markPurchased = (eventId) => setPurchased((prev) => new Set(prev).add(eventId));

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (selectedCategories.length) c++;
    if (selectedTags.length) c++;
    if (country) c++;
    if (region) c++;
    if (searchText.trim()) c++;
    if (dateFrom || dateTo) c++;
    if (priceMin !== "" || priceMax !== "") c++;
    if (quickToday) c++;
    if (quickWeekend) c++;
    if (quickFree) c++;
    if (quickNear) c++;
    if (quickOutdoor) c++;
    if (quickLive) c++;
    return c;
  }, [selectedCategories, selectedTags, country, region, searchText, dateFrom, dateTo, priceMin, priceMax, quickToday, quickWeekend, quickFree, quickNear, quickOutdoor, quickLive]);

  const clearFilters = () => {
    setSelectedCategories([]); setSelectedTags([]); setCountry(""); setRegion("");
    setSearchText(""); setDateFrom(""); setDateTo(""); setPriceMin(""); setPriceMax("");
    setSortBy("date_desc"); setQuickToday(false); setQuickWeekend(false); setQuickFree(false);
    setQuickNear(false); setQuickOutdoor(false); setQuickLive(false);
  };

  // Toggle map (לפי הדרישה: פותח גוגל-מאפס עם כל האירועים)
  const openAllEventsInMaps = () => {
    const url = buildGoogleMapsUrl(EVENTS, userLocation);
    if (!url) return setSnack("No events to open in Google Maps.");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // פתיחת קלנדר (הוספה ישירה)
  const openCalendar = (ev) => {
    window.open(googleCalendarUrl(ev), "_blank", "noopener,noreferrer");
  };

  // כפתור המפה בכל כרטיס – האירוע + כל היתר
  const openMapsForEvent = (primary) => {
    const url = buildMapsUrlWithPrimary(primary, EVENTS, userLocation);
    if (!url) return setSnack("Couldn't build map URL.");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Saved/Purchased datasets
  const savedList = EVENTS.filter((ev) => favs.has(ev.id));
  const purchasedList = EVENTS.filter((ev) => purchased.has(ev.id));

  // דמו "אנשים שתפגשו" (בממשק Purchased)
  const DEMO_USERS = [
    { id: "u2", name: "Noam",  gender: "male",   bio: "EDM, runs, sushi",   eventIds: ["lp2","spx2"] },
    { id: "u3", name: "Maya",  gender: "female", bio: "Acoustic nights 🎸", eventIds: ["sp2"] },
    { id: "u4", name: "Amit",  gender: "male",   bio: "Food markets 😋",    eventIds: ["tw1"] },
  ];
  const suggestedUsers = DEMO_USERS.filter((u) => (prefGender==="any" ? true : u.gender===prefGender));
  const likeUser = (u) => setMatches((arr) => Array.from(new Set([...arr, u.id])));
  const skipUser = (u) => setMatches((arr) => arr.filter((id) => id !== u.id));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f7f8", pb: 10 }}>
      {/* Header */}
      <Box sx={{ position: "sticky", top: 0, zIndex: 10, bgcolor: "#f7f7f8", borderBottom: "1px solid #eee" }}>
        <Container maxWidth="lg" sx={{ py: 1.25 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>Events</Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <ToggleButtonGroup
                exclusive size="small" value={viewMode}
                onChange={(_, v) => v && setViewMode(v)}
                aria-label="View mode"
              >
                <ToggleButton value="list" aria-label="List view">
                  <ListIcon size={16} style={{ marginRight: 6 }} /> List
                </ToggleButton>
                <ToggleButton
                  value="map" aria-label="Map view"
                  onClick={openAllEventsInMaps} // פותח גוגל מאפס עם כל האירועים
                >
                  <MapIcon size={16} style={{ marginRight: 6 }} /> Map
                </ToggleButton>
              </ToggleButtonGroup>

              <Badge color="primary" badgeContent={activeFilterCount} invisible={activeFilterCount === 0}>
                <Button variant="outlined" startIcon={<SlidersHorizontal size={16} />} onClick={() => setFiltersOpen(true)}>
                  Filter & Sort
                </Button>
              </Badge>

              {/* הכפתור "Favorites on Map" בכותרת הוסר לפי בקשה */}

              <Button startIcon={<Plus size={16} />} onClick={() => navigate("/events/new")} variant="contained">
                Create Event
              </Button>
            </Stack>
          </Stack>

          {/* Tabs */}
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ mt: 1, "& .MuiTab-root": { fontWeight: 700, textTransform: "none" }, "& .MuiTabs-indicator": { height: 3 } }}>
            {ALL_TABS.map((c) => <Tab key={c.key} value={c.key} label={c.label} />)}
          </Tabs>

          {/* Quick filter chips */}
          <Stack direction="row" spacing={1} sx={{ mt: 1, pb: 1, flexWrap: "wrap" }}>
            <Chip icon={<CalendarClock size={14} />} label="Today" color={quickToday ? "primary" : "default"} variant={quickToday ? "filled" : "outlined"} onClick={() => setQuickToday((v) => !v)} />
            <Chip icon={<CalendarClock size={14} />} label="Weekend" color={quickWeekend ? "primary" : "default"} variant={quickWeekend ? "filled" : "outlined"} onClick={() => setQuickWeekend((v) => !v)} />
            <Chip label="Free" color={quickFree ? "primary" : "default"} variant={quickFree ? "filled" : "outlined"} onClick={() => setQuickFree((v) => !v)} />
            <Chip icon={<LocateFixed size={14} />} label="Near me" color={quickNear ? "primary" : "default"} variant={quickNear ? "filled" : "outlined"} onClick={() => setQuickNear((v) => !v)} />
            <Chip icon={<Sun size={14} />} label="Outdoor" color={quickOutdoor ? "primary" : "default"} variant={quickOutdoor ? "filled" : "outlined"} onClick={() => setQuickOutdoor((v) => !v)} />
            <Chip icon={<Music size={14} />} label="Live Music" color={quickLive ? "primary" : "default"} variant={quickLive ? "filled" : "outlined"} onClick={() => setQuickLive((v) => !v)} />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 2 }}>
        {geoError && <Alert severity="warning" sx={{ mb: 2 }}>{geoError}</Alert>}

        {/* Purchased tab עם החלקות */}
        {tab === "purchased" && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mr: 1 }}>Your Tickets</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>({purchasedList.length})</Typography>
            </Stack>
            {purchasedList.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>You haven’t bought tickets yet.</Alert>
            ) : (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {purchasedList.map((ev) => (
                  <Grid key={ev.id} item xs={12} sm={6} md={4}>
                    <EventCard
                      ev={ev}
                      onBuy={() => {}}
                      onToggleFav={toggleFav}
                      isFav={favs.has(ev.id)}
                      onOpenCalendar={openCalendar}
                      onOpenMaps={openMapsForEvent}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>People you might meet</Typography>
              <Select size="small" value={prefGender} onChange={(e) => setPrefGender(e.target.value)} sx={{ minWidth: 140 }}>
                <MenuItem value="any">Any</MenuItem>
                <MenuItem value="female">Women</MenuItem>
                <MenuItem value="male">Men</MenuItem>
              </Select>
            </Stack>

            <SwipeDeck
              users={suggestedUsers}
              onLike={(u) => likeUser(u)}
              onSkip={(u) => skipUser(u)}
            />

            {!!matches.length && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Matches: {matches.length}. (Saved locally)
              </Alert>
            )}
          </Box>
        )}

        {/* Saved tab */}
        {tab === "saved" && (
          <>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Saved</Typography>
              <Button size="small" variant="outlined" startIcon={<MapIcon size={14} />} onClick={()=>{
                const url = buildGoogleMapsUrl(savedList, userLocation);
                if (!url) return setSnack("No favorites to open.");
                window.open(url, "_blank", "noopener,noreferrer");
              }}>
                Open favorites in Google Maps
              </Button>
            </Stack>
            {savedList.length === 0 ? (
              <Alert severity="info">You have no saved events yet.</Alert>
            ) : (
              <Grid container spacing={2}>
                {savedList.map((ev) => (
                  <Grid key={ev.id} item xs={12} sm={6} md={4}>
                    <EventCard
                      ev={ev}
                      onBuy={openBuy}
                      onToggleFav={toggleFav}
                      isFav={favs.has(ev.id)}
                      onOpenCalendar={openCalendar}
                      onOpenMaps={openMapsForEvent}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* יתר הטאבים (all/קטגוריות) */}
        {tab !== "saved" && tab !== "purchased" && (
          isFiltered ? (
            visible.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>Nothing scheduled right now — new events are added regularly.</Alert>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {visible.map((ev, idx) => {
                  const distanceKm = userLocation && ev.coords ? haversineKm(userLocation, ev.coords) : undefined;
                  return (
                    <Grid key={ev.id} item xs={12} sm={6} md={4}>
                      <EventCard
                        ev={ev}
                        onBuy={openBuy}
                        onToggleFav={toggleFav}
                        isFav={favs.has(ev.id)}
                        onOpenCalendar={openCalendar}
                        onOpenMaps={openMapsForEvent}
                        distanceKm={distanceKm}
                        onInvitePlus1={(ev) => setPlusOneEvent(ev)}
                        showGoodMatch={idx % 3 === 0}
                        onViewDetails={(ev) => setEventDetailsOpen(ev)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )
          ) : tab === "all" ? (
            <>
              <CategorySection title="Large Parties" events={dataByCat.large} onBuy={openBuy} favs={favs} onToggleFav={toggleFav} onOpenCalendar={openCalendar} userLocation={userLocation} onOpenMaps={openMapsForEvent} onInvitePlus1={(ev) => setPlusOneEvent(ev)} onViewDetails={(ev) => setEventDetailsOpen(ev)} />
              <CategorySection title="Small / Private" events={dataByCat.small} onBuy={openBuy} favs={favs} onToggleFav={toggleFav} onOpenCalendar={openCalendar} userLocation={userLocation} onOpenMaps={openMapsForEvent} onInvitePlus1={(ev) => setPlusOneEvent(ev)} onViewDetails={(ev) => setEventDetailsOpen(ev)} />
              <CategorySection title="Events with a Twist" events={dataByCat.twist} onBuy={openBuy} favs={favs} onToggleFav={toggleFav} onOpenCalendar={openCalendar} userLocation={userLocation} onOpenMaps={openMapsForEvent} onInvitePlus1={(ev) => setPlusOneEvent(ev)} onViewDetails={(ev) => setEventDetailsOpen(ev)} />
              <CategorySection title="Sports" events={dataByCat.sports} onBuy={openBuy} favs={favs} onToggleFav={toggleFav} onOpenCalendar={openCalendar} userLocation={userLocation} onOpenMaps={openMapsForEvent} onInvitePlus1={(ev) => setPlusOneEvent(ev)} onViewDetails={(ev) => setEventDetailsOpen(ev)} />
            </>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {(tab === "all" ? EVENTS : EVENTS.filter((ev)=>ev.category===tab)).map((ev) => (
                <Grid key={ev.id} item xs={12} sm={6} md={4}>
                  <EventCard
                    ev={ev}
                    onBuy={openBuy}
                    onToggleFav={toggleFav}
                    isFav={favs.has(ev.id)}
                    onOpenCalendar={openCalendar}
                    onOpenMaps={openMapsForEvent}
                    onViewDetails={(ev) => setEventDetailsOpen(ev)}
                  />
                </Grid>
              ))}
            </Grid>
          )
        )}
      </Container>

      {/* רכישת כרטיסים */}
      <TicketPurchaseDialog open={!!selectedEvent} onClose={closeBuy} event={selectedEvent} onPurchased={markPurchased} />

      {/* +1 Invite Dialog */}
      <PlusOneInviteDialog 
        open={!!plusOneEvent} 
        onClose={(result) => {
          setPlusOneEvent(null);
          if (result?.sent) setSnack("Invite sent!");
        }} 
        event={plusOneEvent}
        matches={DEMO_USERS}
        purchased={purchased}
      />

      {/* Event Details Dialog */}
      <EventDetailsDialog
        open={!!eventDetailsOpen}
        onClose={() => setEventDetailsOpen(null)}
        event={eventDetailsOpen}
        purchased={purchased}
        onBuy={openBuy}
        onInvitePlus1={(ev) => setPlusOneEvent(ev)}
        onSave={toggleFav}
        isSaved={eventDetailsOpen ? favs.has(eventDetailsOpen.id) : false}
      />

      {/* דיאלוג סינון/מיון */}
      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Filter & Sort</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField label="Search (title, venue, tag, region, country)" value={searchText} onChange={(e) => setSearchText(e.target.value)} fullWidth />
            <Autocomplete multiple options={BASE_TABS.filter((c)=>c.key!=="all").map((c)=>c.key)} value={selectedCategories} onChange={(_, val) => setSelectedCategories(val)}
              renderTags={(value, getTagProps) => value.map((opt, i) => <Chip variant="outlined" label={BASE_TABS.find((c)=>c.key===opt)?.label || opt} {...getTagProps({ index: i })} key={opt} />)}
              renderInput={(params) => <TextField {...params} label="Categories" placeholder="Pick one or more" />} />
            <Autocomplete multiple options={allTags} value={selectedTags} onChange={(_, val) => setSelectedTags(val)}
              renderTags={(value, getTagProps) => value.map((opt, i) => <Chip variant="outlined" label={opt} {...getTagProps({ index: i })} key={opt} />)}
              renderInput={(params) => <TextField {...params} label="Tags" placeholder="EDM, Outdoor, Acoustic…" />} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Autocomplete options={allCountries} value={country || null} onChange={(_, val) => setCountry(val || "")} renderInput={(p) => <TextField {...p} label="Country" placeholder="All" />} sx={{ flex: 1 }} clearOnEscape />
              <Autocomplete options={allRegions} value={region || null} onChange={(_, val) => setRegion(val || "")} renderInput={(p) => <TextField {...p} label="Region / Area" placeholder="All" />} sx={{ flex: 1 }} clearOnEscape />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="From date" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} sx={{ flex: 1 }} InputLabelProps={{ shrink: true }} />
              <TextField label="To date" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} sx={{ flex: 1 }} InputLabelProps={{ shrink: true }} />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label={`Min price (₪${priceBounds.min})`} type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} sx={{ flex: 1 }} inputProps={{ min: 0 }} />
              <TextField label={`Max price (₪${priceBounds.max})`} type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} sx={{ flex: 1 }} inputProps={{ min: 0 }} />
            </Stack>
            <Stack>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>Sort by</Typography>
              <RadioGroup row value={sortBy} onChange={(e) => setSortBy(e.target.value)} name="sortby">
                <FormControlLabel value="date_desc" control={<Radio />} label="Date (newest first)" />
                <FormControlLabel value="date_asc"  control={<Radio />} label="Date (oldest first)" />
                <FormControlLabel value="price_low" control={<Radio />} label="Price (low → high)" />
                <FormControlLabel value="price_high"control={<Radio />} label="Price (high → low)" />
                <FormControlLabel value="title_az"  control={<Radio />} label="Title (A → Z)" />
              </RadioGroup>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setFiltersOpen(false) || clearFilters()}>Clear</Button>
          <Button variant="contained" onClick={() => setFiltersOpen(false)}>Apply</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}
