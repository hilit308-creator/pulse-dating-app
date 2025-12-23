import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Stack,
  Chip,
  Grid,
  Fade,
  Skeleton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
  Alert,
  CardMedia,
  Popper,
} from "@mui/material";
import {
  Coffee,
  MapPin,
  Gift,
  Send,
  PlusCircle,
  Lightbulb,
  BadgePercent,
  MessageSquarePlus,
  Wand2,
} from "lucide-react";
import UserAvatarButton from "../components/UserAvatarButton";

/* =========================
   Constants
   ========================= */
const QUOTES = [
  "You are one good conversation away from something beautiful.",
  "Look up from your phone and smile – love could be next to you.",
  "Today is a great day to meet someone new.",
  "Your next adventure could start with a hello.",
  "Kindness is magnetic. Smile at someone nearby.",
  "Be bold. Say hi to someone who catches your eye.",
  "The best stories start with a spark of curiosity.",
  "Every day is a new chance for connection.",
  "Trust your vibe. The right people feel it.",
  "A compliment is a great icebreaker.",
];

const PARTNERS = [
  {
    id: 1,
    name: "Cafe Aroma",
    logo: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=facearea&w=640&h=320&q=80",
    type: "cafe",
    offer: "1+1 on coffee",
    distance: 0.5,
    location: "123 Main St",
    open: true,
  },
  {
    id: 2,
    name: "Bar Luna",
    logo: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=facearea&w=640&h=320&q=80",
    type: "bar",
    offer: "Free drink for app users",
    distance: 2.1,
    location: "456 City Ave",
    open: true,
  },
];

// ⬇️ Cozy Corner עם תמונה חדשה מ-Unsplash (כמו שאר התמונות)
const DATE_SPOTS = [
  {
    id: 1,
    name: "Sunset Park",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    type: "outdoor",
    distance: 1.2,
    special: false,
    maps: "https://goo.gl/maps/park",
  },
  {
    id: 2,
    name: "Cozy Corner Cafe",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    type: "cafe",
    distance: 0.7,
    special: true,
    maps: "https://goo.gl/maps/cafe",
  },
];

const MATCHES_NEARBY = [];

const DRINKS = [
  { label: "Coffee ☕", value: "coffee" },
  { label: "Wine 🍷", value: "wine" },
  { label: "Beer 🍺", value: "beer" },
];

/* =========================
   Utility
   ========================= */
const metersOrKm = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);
const PINK_MAIN = "#FF6F61";
const PINK_LIGHT = "#FCA5A5";

/* =========================
   PartnerCard
   ========================= */
function PartnerCard({ p, onInvite }) {
  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 4,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        bgcolor: "#fff",
      }}
      aria-label={`${p.name} partner card`}
    >
      <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 1 }}>
        <Chip
          icon={<BadgePercent size={14} />}
          label="Offer"
          size="small"
          sx={{ fontWeight: 700, bgcolor: "#FFD166" }}
        />
      </Box>

      <CardMedia
        component="img"
        image={p.logo}
        alt={`${p.name} cover`}
        sx={{ height: 160 }}
        loading="lazy"
      />

      <CardContent sx={{ display: "flex", gap: 2, alignItems: "center", pt: 2 }}>
        <Avatar src={p.logo} alt={p.name} sx={{ width: 48, height: 48 }} />
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={700} sx={{ color: "#1A1A1A" }}>
            {p.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#7EC8E3" }}
          >
            <Coffee size={16} /> {p.offer}
          </Typography>
          <Typography variant="caption" sx={{ color: "#8C8C8C" }}>
            {p.distance.toFixed(1)} km • {p.location}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button
          fullWidth
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
            color: "#fff",
            background: `linear-gradient(90deg, ${PINK_MAIN}, ${PINK_LIGHT})`,
          }}
        >
          View Place
        </Button>
        <Button
          onClick={() => onInvite?.({ id: p.id, name: p.name, type: p.type || "place", address: p.location, distance: p.distance, image: p.logo, maps: undefined })}
          startIcon={<MessageSquarePlus aria-hidden />}
          sx={{
            whiteSpace: "nowrap",
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
            border: "1px solid #E5E7EB",
            bgcolor: "#fff",
            color: "#444",
          }}
        >
          Invite
        </Button>
      </CardActions>
    </Card>
  );
}

/* =========================
   DateSpotCard
   ========================= */
function DateSpotCard({ spot, onInvite }) {
  return (
    <Card
      sx={{
        minWidth: 260,
        mr: 1,
        borderRadius: 5,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
        bgcolor: "#fff",
        scrollSnapAlign: "start",
      }}
      aria-label={`${spot.name} suggestion`}
    >
      <CardMedia
        component="img"
        image={spot.image}
        alt={`${spot.name} photo`}
        sx={{ height: 160 }}
        loading="lazy"
      />
      <CardContent sx={{ pt: 1.25 }}>
        <Typography sx={{ fontWeight: 800, color: "#1A1A1A" }}>{spot.name}</Typography>
        <Typography variant="body2" sx={{ color: "#7EC8E3" }}>
          {spot.type}
        </Typography>
        <Typography variant="caption" sx={{ color: "#8C8C8C" }}>
          {metersOrKm(spot.distance)} away
        </Typography>
        {spot.special && (
          <Chip
            label="Special Offer"
            size="small"
            sx={{ mt: 1, borderRadius: 999, bgcolor: "#FFE8EF", color: PINK_MAIN, fontWeight: 700 }}
          />
        )}
        <Button
          variant="text"
          size="small"
          startIcon={<MapPin aria-hidden style={{ opacity: 0.6 }} />}
          href={spot.maps}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mt: 1, color: "rgba(0,0,0,0.7)", textTransform: "none", fontWeight: 600 }}
        >
          View on Map
        </Button>
        <Button
          onClick={() => onInvite?.({ id: spot.id, name: spot.name, type: spot.type, distance: spot.distance, image: spot.image, maps: spot.maps })}
          startIcon={<MessageSquarePlus aria-hidden />}
          sx={{ mt: 1, borderRadius: 999, textTransform: "none", fontWeight: 700, border: "1px solid #E5E7EB" }}
        >
          Invite
        </Button>
      </CardContent>
    </Card>
  );
}

/* =========================
   SendDrinkDialog
   ========================= */
function SendDrinkDialog({
  open,
  onClose,
  onSend,
  matches,
  drinks,
  sending,
  selectedMatch,
  setSelectedMatch,
  selectedDrink,
  setSelectedDrink,
  message,
  setMessage,
}) {
  const genKnowns = (id) => {
    try {
      const mm = JSON.parse(localStorage.getItem("matches_demo") || "[]");
      const ll = JSON.parse(localStorage.getItem("likes_demo") || "[]");
      const hit = [...mm, ...ll].find((x) => x.id === id);
      return hit || {};
    } catch {
      return {};
    }
  };

  const [aiAnchor, setAiAnchor] = React.useState(null);
  const [aiTone, setAiTone] = React.useState(() => localStorage.getItem(`ai_tone_${selectedMatch}`) || localStorage.getItem('ai_tone') || 'friendly');
  const [aiLen, setAiLen] = React.useState('short');
  const [aiOptions, setAiOptions] = React.useState([]);

  React.useEffect(() => {
    setAiTone(localStorage.getItem(`ai_tone_${selectedMatch}`) || localStorage.getItem('ai_tone') || 'friendly');
  }, [selectedMatch]);

  const computeOptions = (tone = aiTone, len = aiLen) => {
    const p = genKnowns(selectedMatch);
    const name = p?.name || 'there';
    const drinkLabel = drinks.find((d) => d.value === selectedDrink)?.label?.toLowerCase() || 'a drink';
    const path = window.location.pathname;
    const base = {
      friendly: [
        `Hey ${name}, want to grab ${drinkLabel} this week?`,
        `${name}, I know a nice spot nearby for ${drinkLabel}.`,
        `Would you like to meet for ${drinkLabel}?`
      ],
      playful: [
        `${name}, plot twist: ${drinkLabel} on me ☕`,
        `Breaking news: we’re getting ${drinkLabel} and sharing stories 😄`,
        `Quick poll: ${drinkLabel} today or tomorrow?`
      ],
      formal: [
        `Hello ${name}, would you like to have ${drinkLabel} sometime this week?`,
        `If you’re available, we could meet for ${drinkLabel}.`,
        `I’d be glad to check out ${drinkLabel} with you.`
      ]
    }[tone] || [];
    // Route awareness: nudge Explore context
    if (path.includes('/explore')) base[0] = base[0].replace('this week', 'nearby');
    const mapLen = {
      short: (s) => s,
      medium: (s) => `${s} I think we’d get along.`,
      long: (s) => `${s} I enjoyed your profile and would love to spend time getting to know you.`,
    };
    return base.map(mapLen[len]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !sending && selectedMatch && selectedDrink) onSend();
  };

  return (
    <Dialog open={open} onClose={onClose} onKeyDown={handleKeyDown} aria-labelledby="send-drink-title">
      <DialogTitle id="send-drink-title">Send a Drink</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          label="Recipient"
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
          sx={{ my: 1.5 }}
          autoFocus
        >
          {matches.map((m) => (
            <MenuItem value={m.id} key={m.id}>
              {m.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Drink"
          value={selectedDrink}
          onChange={(e) => setSelectedDrink(e.target.value)}
          sx={{ mb: 1.5 }}
        >
          {drinks.map((d) => (
            <MenuItem value={d.value} key={d.value}>
              {d.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={<Wand2 />} onClick={(e) => { setAiAnchor(e.currentTarget); setAiOptions(computeOptions()); }} sx={{ borderRadius: 999 }}>AI Suggest</Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>
          Cancel
        </Button>
        <Button
          onClick={onSend}
          variant="contained"
          disabled={sending || !selectedMatch || !selectedDrink}
          startIcon={!sending ? <Send /> : null}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
            bgcolor: PINK_MAIN,
            "&:hover": { bgcolor: "#ff5b4c" },
          }}
        >
          {sending ? "Sending…" : "Send"}
        </Button>
      </DialogActions>

      {/* AI popover */}
      <Popper open={Boolean(aiAnchor)} anchorEl={aiAnchor} placement="top-start" modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
        sx={{ zIndex: 22 }}>
        <Box sx={{ p: 1, bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: 2, boxShadow: 3, minWidth: 280 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: .5 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>AI Suggestions</Typography>
            <Box>
              <Chip size="small" label="friendly" onClick={() => { setAiTone('friendly'); localStorage.setItem(`ai_tone_${selectedMatch}`,'friendly'); localStorage.setItem('ai_tone','friendly'); setAiOptions(computeOptions('friendly', aiLen)); }} color={aiTone==='friendly'?'primary':'default'} sx={{ mr: .5 }}/>
              <Chip size="small" label="playful" onClick={() => { setAiTone('playful'); localStorage.setItem(`ai_tone_${selectedMatch}`,'playful'); localStorage.setItem('ai_tone','playful'); setAiOptions(computeOptions('playful', aiLen)); }} color={aiTone==='playful'?'primary':'default'} sx={{ mr: .5 }}/>
              <Chip size="small" label="formal" onClick={() => { setAiTone('formal'); localStorage.setItem(`ai_tone_${selectedMatch}`,'formal'); localStorage.setItem('ai_tone','formal'); setAiOptions(computeOptions('formal', aiLen)); }} color={aiTone==='formal'?'primary':'default'}/>
            </Box>
          </Box>
          <Box sx={{ mb: .5 }}>
            <Chip size="small" label="short" onClick={() => { setAiLen('short'); setAiOptions(computeOptions(aiTone,'short')); }} color={aiLen==='short'?'primary':'default'} sx={{ mr: .5 }}/>
            <Chip size="small" label="medium" onClick={() => { setAiLen('medium'); setAiOptions(computeOptions(aiTone,'medium')); }} color={aiLen==='medium'?'primary':'default'} sx={{ mr: .5 }}/>
            <Chip size="small" label="long" onClick={() => { setAiLen('long'); setAiOptions(computeOptions(aiTone,'long')); }} color={aiLen==='long'?'primary':'default'} />
          </Box>
          <Box sx={{ display: 'grid', gap: .5 }}>
            {aiOptions.map((s, i) => (
              <Box key={i} sx={{ p: 1, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ mb: .5 }}>{s}</Typography>
                <Button size="small" onClick={() => { setMessage(s); setAiAnchor(null); }} sx={{ borderRadius: 999 }}>Insert</Button>
              </Box>
            ))}
          </Box>
          <Box sx={{ textAlign: 'right', mt: .5 }}>
            <Button size="small" onClick={() => setAiAnchor(null)}>Close</Button>
          </Box>
        </Box>
      </Popper>
    </Dialog>
  );
}

/* =========================
   InviteToPlaceDialog
   ========================= */
const PRESETS = [
  "Want to check this place out together?",
  "This looks perfect for us. Up for it?",
  "Free tonight to meet here?",
  "Coffee on me at this spot ☕",
];

function InviteToPlaceDialog({ open, onClose, candidates, onSend, place, selectedId, setSelectedId, note, setNote }) {
  const knownsFor = (id) => {
    try {
      const mm = JSON.parse(localStorage.getItem("matches_demo") || "[]");
      const ll = JSON.parse(localStorage.getItem("likes_demo") || "[]");
      return [...mm, ...ll].find((x) => x.id === id) || {};
    } catch { return {}; }
  };

  const [aiAnchor, setAiAnchor] = React.useState(null);
  const [aiTone, setAiTone] = React.useState(() => localStorage.getItem(`ai_tone_${selectedId}`) || localStorage.getItem('ai_tone') || 'friendly');
  const [aiLen, setAiLen] = React.useState('short');
  const [aiOptions, setAiOptions] = React.useState([]);

  React.useEffect(() => {
    setAiTone(localStorage.getItem(`ai_tone_${selectedId}`) || localStorage.getItem('ai_tone') || 'friendly');
  }, [selectedId]);

  const computeOptions = (tone = aiTone, len = aiLen) => {
    const p = knownsFor(selectedId);
    const name = p?.name || 'there';
    const kind = place?.type || 'place';
    const path = window.location.pathname;
    const base = {
      friendly: [
        `Hey ${name}, this ${kind} looks great — want to check it out together?`,
        `${name}, free to meet at ${place?.name}?`,
        `How about ${place?.name} this week?`
      ],
      playful: [
        `${name}, calling it now: ${place?.name} is our new spot 😄`,
        `Adventure idea: we explore ${place?.name} together?`,
        `Vote: ${place?.name} today or tomorrow?`
      ],
      formal: [
        `Hello ${name}, would you like to visit ${place?.name} together?`,
        `If you’re available, we could meet at ${place?.name}.`,
        `I’d be glad to check out ${place?.name} with you.`
      ]
    }[tone] || [];
    if (path.includes('/events')) base[0] = base[0].replace('looks great', 'seems perfect before the event');
    const mapLen = {
      short: (s) => s,
      medium: (s) => `${s} I think you’ll like it.`,
      long: (s) => `${s} It fits our vibe, and I’d love to spend time getting to know you.`,
    };
    return base.map(mapLen[len]);
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="invite-dialog-title">
      <DialogTitle id="invite-dialog-title">Invite to {place?.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
          Pick a match and add a short message.
        </Typography>
        <TextField
          select
          fullWidth
          label="Person"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          sx={{ my: 1.5 }}
          autoFocus
        >
          {candidates.map((m) => (
            <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Message (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {PRESETS.map((p, i) => (
            <Button key={i} size="small" variant="outlined" onClick={() => setNote(p)} sx={{ borderRadius: 999 }}>
              {p}
            </Button>
          ))}
          <Button size="small" startIcon={<Wand2 />} onClick={(e) => { setAiAnchor(e.currentTarget); setAiOptions(computeOptions()); }} sx={{ borderRadius: 999 }}>AI Suggest</Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSend} disabled={!selectedId} startIcon={<Send />}
          sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700, bgcolor: PINK_MAIN, '&:hover': { bgcolor: '#ff5b4c' } }}
        >
          Send Invite
        </Button>
      </DialogActions>

      {/* AI popover */}
      <Popper open={Boolean(aiAnchor)} anchorEl={aiAnchor} placement="top-start" modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]} sx={{ zIndex: 22 }}>
        <Box sx={{ p: 1, bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: 2, boxShadow: 3, minWidth: 280 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: .5 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>AI Suggestions</Typography>
            <Box>
              <Chip size="small" label="friendly" onClick={() => { setAiTone('friendly'); localStorage.setItem(`ai_tone_${selectedId}`,'friendly'); localStorage.setItem('ai_tone','friendly'); setAiOptions(computeOptions('friendly', aiLen)); }} color={aiTone==='friendly'?'primary':'default'} sx={{ mr: .5 }}/>
              <Chip size="small" label="playful" onClick={() => { setAiTone('playful'); localStorage.setItem(`ai_tone_${selectedId}`,'playful'); localStorage.setItem('ai_tone','playful'); setAiOptions(computeOptions('playful', aiLen)); }} color={aiTone==='playful'?'primary':'default'} sx={{ mr: .5 }}/>
              <Chip size="small" label="formal" onClick={() => { setAiTone('formal'); localStorage.setItem(`ai_tone_${selectedId}`,'formal'); localStorage.setItem('ai_tone','formal'); setAiOptions(computeOptions('formal', aiLen)); }} color={aiTone==='formal'?'primary':'default'}/>
            </Box>
          </Box>
          <Box sx={{ mb: .5 }}>
            <Chip size="small" label="short" onClick={() => { setAiLen('short'); setAiOptions(computeOptions(aiTone,'short')); }} color={aiLen==='short'?'primary':'default'} sx={{ mr: .5 }}/>
            <Chip size="small" label="medium" onClick={() => { setAiLen('medium'); setAiOptions(computeOptions(aiTone,'medium')); }} color={aiLen==='medium'?'primary':'default'} sx={{ mr: .5 }}/>
            <Chip size="small" label="long" onClick={() => { setAiLen('long'); setAiOptions(computeOptions(aiTone,'long')); }} color={aiLen==='long'?'primary':'default'} />
          </Box>
          <Box sx={{ display: 'grid', gap: .5 }}>
            {aiOptions.map((s, i) => (
              <Box key={i} sx={{ p: 1, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ mb: .5 }}>{s}</Typography>
                <Button size="small" onClick={() => { setNote(s); setAiAnchor(null); }} sx={{ borderRadius: 999 }}>Insert</Button>
              </Box>
            ))}
          </Box>
          <Box sx={{ textAlign: 'right', mt: .5 }}>
            <Button size="small" onClick={() => setAiAnchor(null)}>Close</Button>
          </Box>
        </Box>
      </Popper>
    </Dialog>
  );
}

/* =========================
   Main Screen
   ========================= */
export default function ExploreScreen() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState("");
  // Invite state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitePlace, setInvitePlace] = useState(null);
  const [inviteToId, setInviteToId] = useState("");
  const [inviteNote, setInviteNote] = useState("");
  const [showSendDrink, setShowSendDrink] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(MATCHES_NEARBY[0]?.id || "");
  const [selectedDrink, setSelectedDrink] = useState(DRINKS[0].value);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [partnersNearby, setPartnersNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, text: "", severity: "success" });
  const [candidates, setCandidates] = useState(MATCHES_NEARBY);
  const [nearbyMatches, setNearbyMatches] = useState([]); // computed from geolocation + candidates

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      const filtered = PARTNERS.filter((p) => p.distance <= 3 && p.open);
      setPartnersNearby(filtered);
      setLoading(false);
    }, 700);
    return () => clearTimeout(id);
  }, []);

  // Load invite candidates from localStorage (matches_demo + likes_demo) with fallback
  useEffect(() => {
    try {
      const mm = JSON.parse(localStorage.getItem("matches_demo") || "[]");
      const ll = JSON.parse(localStorage.getItem("likes_demo") || "[]");
      const all = [...mm, ...ll];
      if (all.length) {
        const mapped = all.map((x) => ({ id: x.id, name: x.name, photoUrl: x.photoUrl }));
        setCandidates(mapped);
        setInviteToId(mapped[0]?.id || "");
      }
    } catch {}
  }, []);

  // Compute location-based suggestions (simulated distances)
  useEffect(() => {
    let watchId = null;
    const compute = (pos) => {
      // Simulate distance by shuffling candidates to varying nearby meters when we have a position
      const base = candidates.length ? candidates : MATCHES_NEARBY;
      const list = base.slice(0, 5).map((m, i) => ({
        ...m,
        // 80–1500 meters randomized, stable-ish per id
        distanceKm: (((m.id * 9301 + i * 97) % 1400) + 100) / 1000, // 0.1–1.5 km
      }));
      setNearbyMatches(list.sort((a, b) => a.distanceKm - b.distanceKm));
    };
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => compute(pos),
        () => compute(null),
        { enableHighAccuracy: true, maximumAge: 15000, timeout: 8000 }
      );
    } else {
      compute(null);
    }
    return () => {
      if (watchId != null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    };
  }, [candidates]);

  const bannerGradient = useMemo(
    () => `linear-gradient(90deg, ${PINK_MAIN}, ${PINK_LIGHT})`,
    []
  );

  const handleSendDrink = useCallback(() => {
    setSending(true);
    const id = setTimeout(() => {
      setSending(false);
      setShowSendDrink(false);
      setMessage("");
      setToast({ open: true, text: "Drink sent! (Simulated)", severity: "success" });
    }, 1200);
    return () => clearTimeout(id);
  }, []);

  const openInvite = useCallback((place) => {
    setInvitePlace(place);
    setInviteOpen(true);
  }, []);

  const sendInvite = useCallback(() => {
    if (!invitePlace || !inviteToId) return;
    // Dispatch a global event that ChatScreen listens to
    window.dispatchEvent(
      new CustomEvent("invite:place", {
        detail: {
          toId: inviteToId,
          place: invitePlace,
          message: inviteNote,
        },
      })
    );
    setInviteOpen(false);
    setInviteNote("");
    setToast({ open: true, text: "Invitation sent!", severity: "success" });
  }, [invitePlace, inviteToId, inviteNote]);

  const openChat = useCallback((id) => {
    // Let ChatScreen know which chat to open
    window.dispatchEvent(new CustomEvent("chat:open", { detail: { toId: id } }));
    navigate("/chat");
  }, [navigate]);

  return (
    <>
      <UserAvatarButton photoUrl={null} />
      <Box sx={{ minHeight: "100vh", background: "#FAFAFA", pb: 10 }}>
        {/* Title */}
        <Box sx={{ pt: 4, pb: 2, textAlign: "center" }}>
          <Typography sx={{ color: "#1A1A1A", fontWeight: 800, fontSize: 24 }}>
            Explore & Connect
          </Typography>
        </Box>

        {/* Daily Boost */}
        <Fade in timeout={900}>
          <Card
            sx={{
              mx: 2,
              mb: 2,
              p: 0,
              overflow: "hidden",
              borderRadius: 4,
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
              background: bannerGradient,
            }}
            aria-label="Daily inspiration"
          >
            <CardContent sx={{ color: "#fff" }}>
              <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}> {quote}</Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  background: "rgba(255,255,255,0.9)",
                  color: "#111",
                  borderRadius: 999,
                  px: 1.25,
                  py: 0.75,
                  width: "fit-content",
                }}
                aria-live="polite"
              >
                <Lightbulb size={16} color={PINK_MAIN} aria-hidden />
                <Typography sx={{ fontSize: 13 }}>Start with a smile today.</Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Partner Offers */}
        <Box sx={{ px: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ color: PINK_MAIN, mb: 1 }}>
            Nearby Offers
          </Typography>

          {loading ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          ) : partnersNearby.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography>No partner cafés found nearby yet. We’re working on it!</Typography>
              <Button
                variant="outlined"
                startIcon={<PlusCircle aria-hidden />}
                sx={{ mt: 2, borderRadius: 999, textTransform: "none", fontWeight: 700 }}
                aria-label="Suggest a place"
              >
                Suggest a Place
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {partnersNearby.map((p) => (
                <Grid item xs={12} sm={6} md={4} key={p.id}>
                  <PartnerCard p={p} onInvite={openInvite} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Send a Drink */}
        {nearbyMatches.length > 0 && (
          <Card
            sx={{
              mx: 2,
              mb: 3,
              borderRadius: 4,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
            }}
            aria-label="Send a gesture"
          >
            <CardContent>
              {nearbyMatches.slice(0, 3).map((m) => (
                <Box key={m.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, py: 1 }}>
                  <Typography sx={{ color: "#1A1A1A", fontSize: 14 }}>
                    <b>{m.name}</b> is {metersOrKm(m.distanceKm)} away — send a sweet gesture?
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={() => {
                        setSelectedMatch(m.id);
                        setShowSendDrink(true);
                      }}
                      startIcon={<Coffee aria-hidden />}
                      sx={{ borderRadius: 999, px: 2, textTransform: "none", fontWeight: 700, color: "#fff", background: `linear-gradient(90deg, ${PINK_MAIN}, ${PINK_LIGHT})` }}
                    >
                      Send Coffee
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedMatch(m.id);
                        setShowSendDrink(true);
                      }}
                      startIcon={<Gift aria-hidden />}
                      sx={{ borderRadius: 999, px: 2, textTransform: "none", fontWeight: 700, border: "1px solid #E5E7EB", bgcolor: "#fff", color: "#666" }}
                    >
                      Send a Note
                    </Button>
                    <Button variant="text" onClick={() => openChat(m.id)} sx={{ textTransform: "none", fontWeight: 700 }}>
                      Say hi
                    </Button>
                  </Stack>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Date Spots */}
        <Box sx={{ px: 2, mt: 4 }}>
          <Typography variant="h6" sx={{ color: PINK_MAIN, mb: 1 }}>
            Suggested Spots for Dates
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            sx={{ overflowX: "auto", pb: 2, scrollSnapType: "x mandatory", px: 0.5 }}
            aria-label="Date spots carousel"
          >
            {DATE_SPOTS.map((spot) => (
              <DateSpotCard key={spot.id} spot={spot} onInvite={openInvite} />
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Invite to place dialog */}
      <InviteToPlaceDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        candidates={candidates}
        onSend={sendInvite}
        place={invitePlace}
        selectedId={inviteToId}
        setSelectedId={setInviteToId}
        note={inviteNote}
        setNote={setInviteNote}
      />

      {/* Dialog */}
      <SendDrinkDialog
        open={showSendDrink}
        onClose={() => setShowSendDrink(false)}
        onSend={handleSendDrink}
        matches={candidates.length ? candidates : MATCHES_NEARBY}
        drinks={DRINKS}
        sending={sending}
        selectedMatch={selectedMatch}
        setSelectedMatch={setSelectedMatch}
        selectedDrink={selectedDrink}
        setSelectedDrink={setSelectedDrink}
        message={message}
        setMessage={setMessage}
      />

      {/* Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%", bgcolor: PINK_MAIN }}
        >
          {toast.text}
        </Alert>
      </Snackbar>
    </>
  );
}
