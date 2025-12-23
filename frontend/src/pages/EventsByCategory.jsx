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
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ----------------------------- Mock data --------------------------------- */
const EVENTS = [
  { id: "lp1", title: "Summer Festival", category: "large", price: 149, date: "2025-07-23", venue: "Central Park", country: "USA", region: "New York", coords: { lat: 40.7812, lng: -73.9665 }, cover: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1600&auto=format&fit=crop", tags: ["Outdoor", "Live Music"], blurb: "All-day stages, food trucks and fireworks.", details: "Multiple stages, 40+ artists, VIP lounge, family area, and late-night DJ set.", badges: ["Verified"] },
  { id: "lp2", title: "Mega Dance Night", category: "large", price: 99, date: "2025-06-12", venue: "Sky Dome", country: "USA", region: "Metro", coords: { lat: 40.7306, lng: -73.9352 }, cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop", tags: ["EDM", "Party"], blurb: "Top DJs with immersive light show.", details: "Doors 21:00 • Main act 23:30 • Dress code: casual chic.", badges: ["18+"] },
  { id: "sp1", title: "Private Loft Party", category: "small", price: 60, date: "2025-05-30", venue: "Maple St. 123", country: "USA", region: "Uptown", coords: { lat: 40.7644, lng: -73.9747 }, cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop", tags: ["Invite-only", "Loft"], blurb: "Intimate house vibes, 80 guests max.", details: "BYOB, rooftop chill zone, quiet room available.", badges: ["New"] },
  { id: "sp2", title: "Acoustic Night", category: "small", price: 45, date: "2025-06-18", venue: "Indie Bar", country: "USA", region: "City Center", coords: { lat: 40.741, lng: -73.9897 }, cover: "https://images.unsplash.com/photo-1464375117522-1311dd6d0cd2?q=80&w=1600&auto=format&fit=crop", tags: ["Acoustic", "Cozy", "Live Music"], blurb: "Unplugged sets & candlelight atmosphere.", details: "Limited seating • First set at 20:30 • Open mic at 22:30." },
  { id: "tw1", title: "Night Food Market", category: "twist", price: 0, date: "2025-09-07", venue: "Downtown", country: "USA", region: "Downtown", coords: { lat: 40.7128, lng: -74.006 }, cover: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1600&auto=format&fit=crop", tags: ["Street Food", "Market", "Outdoor"], blurb: "Global cuisines, live demos, indie bands.", details: "30+ vendors, vegan options, chef talks, tasting bracelets available.", badges: ["Family"] },
  { id: "tw2", title: "Museum Late Hours", category: "twist", price: 30, date: "2025-08-15", venue: "City Museum", country: "USA", region: "Museum District", coords: { lat: 40.7794, lng: -73.9632 }, cover: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=1600&auto=format&fit=crop", tags: ["Exhibit", "Art"], blurb: "Special curation + ambient DJ set.", details: "Guided tours every hour • Café open till midnight." },
  { id: "spx1", title: "Tennis Tournament", category: "sports", price: 70, date: "2025-06-05", venue: "Grand Arena", country: "USA", region: "Sports Park", coords: { lat: 40.8296, lng: -73.9262 }, cover: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1600&auto=format&fit=crop", tags: ["Tennis", "Competition", "Outdoor"], blurb: "Quarterfinals • Center court seats available.", details: "Gates 10:00 • No outside drinks • Family bundle discounts." },
  { id: "spx2", title: "Sunset 5K Run", category: "sports", price: 35, date: "2025-06-22", venue: "Beachfront", country: "USA", region: "Beach", coords: { lat: 40.583, lng: -73.8283 }, cover: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop", tags: ["Run", "Outdoor"], blurb: "Scenic route along the coast, medals for finishers.", details: "Packet pickup from 16:00 • Start 19:00 • Hydration stations." },
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

/* ----------------------------- Event Card -------------------------------- */
function EventCard({ ev, onBuy, onToggleFav, isFav, onOpenCalendar, onOpenMaps, distanceKm }) {
  const [open, setOpen] = useState(false);
  return (
    <Card elevation={0} sx={{ borderRadius: 3, boxShadow: "0 8px 30px rgba(0,0,0,0.06)", overflow: "hidden", bgcolor: "#fff", position: "relative" }}>
      <IconButton
        aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
        onClick={(e) => { e.stopPropagation(); onToggleFav?.(ev.id); }}
        size="small"
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 2, bgcolor: isFav ? "primary.main" : "rgba(255,255,255,0.9)", color: isFav ? "#fff" : "text.primary", "&:hover": { bgcolor: isFav ? "primary.dark" : "white" }, boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}
      >
        <Heart size={16} />
      </IconButton>

      <CardActionArea onClick={() => setOpen((v) => !v)}>
        {ev.cover && <CardMedia component="img" height="180" image={ev.cover} alt={ev.title} loading="lazy" style={{ objectFit: "cover" }} />}
        <CardContent sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 900 }} noWrap>{ev.title}</Typography>
            <Typography variant="body2">{ev.price === 0 ? "Free" : `₪${ev.price}`}</Typography>
          </Stack>

          {!!ev.badges?.length && (
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: "wrap" }}>
              {ev.badges.map((b) => <Chip key={b} size="small" variant="outlined" label={b} />)}
            </Stack>
          )}

          {ev.blurb && <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }} noWrap>{ev.blurb}</Typography>}

          <Stack spacing={0.5} sx={{ mt: 0.75 }}>
            <Row icon={MapPin}>
              {ev.venue}
              {typeof distanceKm === "number" && isFinite(distanceKm) && (<>&nbsp;•&nbsp;{distanceKm.toFixed(1)} km</>)}
            </Row>
            <Row icon={Calendar}>{fmtDate(ev.date)}</Row>
          </Stack>

          {!!ev.tags?.length && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
              {ev.tags.slice(0, 3).map((t) => <Chip key={t} size="small" label={t} />)}
              {ev.tags.length > 3 && <Chip size="small" variant="outlined" label={`+${ev.tags.length - 3}`} />}
            </Stack>
          )}

          <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 1.25 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{ev.details}</Typography>
          </Collapse>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
          <Button size="small" variant="contained" fullWidth onClick={() => onBuy(ev)}>GET TICKETS</Button>
          <Button size="small" variant="outlined" onClick={() => onOpenCalendar?.(ev)}>Calendar</Button>
          <Button size="small" variant="outlined" startIcon={<MapPin size={14} />} onClick={() => onOpenMaps?.(ev)}>Map</Button>
        </Stack>
      </CardActions>
    </Card>
  );
}

/* -------------------------- Category Section ----------------------------- */
function CategorySection({ title, events, onBuy, favs, onToggleFav, onOpenCalendar, userLocation, onOpenMaps }) {
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

/* ------------------------------- Main Page -------------------------------- */
export default function EventsByCategory() {
  const [tab, setTab] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  // סינון/מיון
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

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

  // סינון+מיון
  const visible = useMemo(() => {
    // מקור לפי טאב (כולל saved/purchased)
    let base;
    if (tab === "saved") base = EVENTS.filter((ev) => favs.has(ev.id));
    else if (tab === "purchased") base = EVENTS.filter((ev) => purchased.has(ev.id));
    else base = tab === "all" ? EVENTS.slice() : EVENTS.filter((ev) => ev.category === tab);

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

    return base.sort(by);
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
              <Alert severity="info" sx={{ mt: 2 }}>No events match your filters.</Alert>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {visible.map((ev) => {
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
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )
          ) : tab === "all" ? (
            <>
              <CategorySection title="Large Parties" events={dataByCat.large} onBuy={openBuy} favs={favs} onToggleFav={toggleFav} onOpenCalendar={openCalendar} userLocation={userLocation} onOpenMaps={openMapsForEvent} />
              <CategorySection title="Small / Private" events={dataByCat.small} onBuy={openBuy} favs={favs} onToggleFav={toggleFav} onOpenCalendar={openCalendar} userLocation={userLocation} onOpenMaps={openMapsForEvent} />
              <CategorySection title="Events with a Twist" events={dataByCat.twist} onBuy={openBuy} favs={favs} onToggleFav={toggleFav} onOpenCalendar={openCalendar} userLocation={userLocation} onOpenMaps={openMapsForEvent} />
              <CategorySection title="Sports" events={dataByCat.sports} onBuy={openBuy} favs={favs} onToggleFav={toggleFav} onOpenCalendar={openCalendar} userLocation={userLocation} onOpenMaps={openMapsForEvent} />
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
                  />
                </Grid>
              ))}
            </Grid>
          )
        )}
      </Container>

      {/* רכישת כרטיסים */}
      <TicketPurchaseDialog open={!!selectedEvent} onClose={closeBuy} event={selectedEvent} onPurchased={markPurchased} />

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
