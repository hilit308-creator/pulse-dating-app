// ChatScreen.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
  useCallback,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Popper,
  Popover,
  Menu,
  MenuItem,
  Avatar,
  Fade,
  Drawer,
  Grid,
  Modal,
  Chip,
  InputBase,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import { useLanguage } from '../context/LanguageContext';
import { ChatPointsStickyBanner } from '../components/PointsPromoBanner';
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  Search,
  MoreVertical,
  Smile,
  Plus,
  Mic,
  Paperclip,
  Camera,
  Check,
  CheckCheck,
  CornerUpRight,
  Wand2,
  Stars,
  MessageCircleQuestion,
  HeartHandshake,
  Shield,
  Users,
  MapPin,
  MessageCircle,
  UserPlus,
  X,
  Navigation,
  AlertTriangle,
  Lock,
  Minimize2,
  HelpCircle,
  User,
  Settings,
  BarChart2,
} from "lucide-react";
// Chat Gates - ready for integration when needed
// import ChatGateBanner from "../components/ChatGateBanner";
// import { BLOCK_REASONS, getComposerPlaceholder } from "../services/ChatGateService";

// AI First Message - Per spec section 9
import AiFirstMessage from "../components/AiFirstMessage";

// Video/Voice Call Modal
import VideoCallModal from "../components/VideoCallModal";

// Camera Modal
import CameraModal from "../components/CameraModal";

// Gesture messages store
import useGestureMessagesStore from '../store/gestureMessagesStore';
import useChatStore from '../store/chatStore';
import useEventInvitesStore from '../store/eventInvitesStore';
import { useAuth } from "../context/AuthContext";
import { useMeeting, MEETING_STATE as GLOBAL_MEETING_STATE, SOS_STATE as GLOBAL_SOS_STATE } from "../context/MeetingContext";

/* ----------------- helpers ----------------- */
const fmtHM = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtMS = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(s % 60)
    .toString()
    .padStart(2, "0")}`;
};

const isSameDay = (a, b) => {
  const da = new Date(a),
    db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

/**
 * Event Countdown Text - Per spec section 8
 * Returns: "3 days to go", "Tomorrow", "Today it's happening"
 */
const getEventCountdownText = (eventDate) => {
  if (!eventDate) return null;
  
  const now = new Date();
  const event = new Date(eventDate);
  const diffMs = event.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return "Today it's happening 🎉";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `${diffDays} days to go`;
  return null; // Don't show for events more than a week away
};

// ✓/✓✓/כחול (סימולציה) + מחיקה נעלמת (TTL)
function scheduleDeliveryFlow(updateMsg, disappearAfterMs) {
  setTimeout(() => updateMsg({ status: "delivered" }), 900);
  setTimeout(() => updateMsg({ status: "read" }), 2500);
  if (disappearAfterMs > 0) {
    setTimeout(
      () =>
        updateMsg({
          type: "deleted",
          text: "This message was deleted (disappearing)",
          audioUrl: null,
        }),
      disappearAfterMs
    );
  }
}

// Link preview בסיסי
const URL_RE = /(https?:\/\/[^\s]+)/i;
const hostOf = (u) => {
  try {
    return new URL(u).host.replace(/^www\./, "");
  } catch {
    return u;
  }
};

const invitePrimaryCtaSx = {
  borderRadius: 999,
  px: 1.75,
  fontWeight: 800,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
  boxShadow: '0 8px 18px rgba(108,92,231,0.32)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5B4BD5 0%, #9B4DEB 100%)',
    boxShadow: '0 10px 22px rgba(108,92,231,0.42)',
  },
};

const inviteSecondaryCtaSx = {
  borderRadius: 999,
  px: 1.5,
  fontWeight: 700,
  textTransform: 'none',
  borderColor: 'rgba(108,92,231,0.45)',
  color: '#6C5CE7',
  background: 'rgba(108,92,231,0.05)',
  '&:hover': {
    borderColor: 'rgba(108,92,231,0.7)',
    background: 'rgba(108,92,231,0.08)',
  },
};

const inviteNeutralCtaSx = {
  borderRadius: 999,
  px: 1.25,
  fontWeight: 700,
  textTransform: 'none',
  color: '#111827',
  background: 'rgba(17,24,39,0.04)',
  '&:hover': {
    background: 'rgba(17,24,39,0.07)',
  },
};

/* --------- Agent API Configuration --------- */
const AGENT_URL = "http://localhost:5000";

async function fetchAgentSuggestions({ chat, triggerType, currentDraft }) {
  const messages = (chat?.messages || []).slice(-30).map(m => ({
    id: m.id,
    from: m.from, // "me" | "them"
    text: m.text || "",
    ts: m.timestamp || Date.now(),
  }));

  const payload = {
    request_id: String(Date.now()),
    mode: "dating",
    user_id: "me",
    chat_id: String(chat?.matchId),
    counterparty_id: String(chat?.user?.id),
    messages,
    context: {
      trigger_type: triggerType,
      current_draft: currentDraft || "",
      social_load: { active_chats: 1, is_primary: true },
    },
    preferences: {}
  };

  const res = await fetch(`${AGENT_URL}/agent/suggest`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("agent_failed");
  return await res.json();
}

async function sendAgentFeedback({ traceId, action, suggestionText, finalText }) {
  try {
    await fetch(`${AGENT_URL}/agent/feedback`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        trace_id: traceId,
        action,
        suggestion_text: suggestionText,
        final_text: finalText,
        timestamp: Date.now(),
      }),
    });
  } catch (e) {
    console.warn("Agent feedback failed:", e);
  }
}

/* --------- Demo data (כולל “שוחח עם AI” + “Therapist Bot”) --------- */
const DEFAULT_DISAPPEARING_SECONDS = 7200; // ← שעתיים ברירת־מחדל

// Pulse spec: Connection source types
const CONNECTION_SOURCE = {
  NEARBY: 'nearby',
  EVENT: 'event',
  MATCH: 'match',
  BUSINESS: 'business',
};

// Meeting Time + SOS Constants (Locked Copy - Do Not Change)
const MEETING_STATE = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
};

const SOS_STATE = {
  NONE: 'none',
  SEARCHING: 'searching',
  HELPER_FOUND: 'helper_found',
  HELPER_APPROACHING: 'helper_approaching',
  HELPER_ARRIVED: 'helper_arrived',
};

const SOS_TIMEOUT_SEARCH = 90000; // 90 seconds
const SOS_TIMEOUT_PROGRESS = 180000; // 3 minutes

// Meeting contacts storage key
const MEETING_CONTACTS_KEY = 'pulse_meeting_contacts';

// Unified Agent ID - single bot for both coach and therapist modes
const AGENT_ID = "pulse-agent";

const AGENT_ROW = {
  matchId: AGENT_ID,
  user: {
    id: AGENT_ID,
    name: "Pulse | Coach",
    age: "",
    photoUrl: "",
  },
  user24hPhoto: null,
  messages: [
    {
      id: 1,
      from: "them",
      type: "text",
      text:
        "Hey! 👋 I'm here for you.\n\n" +
        "💬 Need help crafting a message? Just describe the situation.\n" +
        "💙 Want to talk about something on your mind? I'm here to listen.\n\n" +
        "How can I help?",
      timestamp: Date.now() - 120000,
      status: "read",
      reactions: {},
    },
  ],
  lastSentAt: Date.now() - 120000,
  status: "active",
  pinned: true,
  muted: false,
  themeColor: "#F0F7FF",
  disappearingSeconds: DEFAULT_DISAPPEARING_SECONDS,
  isAgent: true, // Flag to identify this as the unified agent
};

// Legacy aliases for backwards compatibility during refactor
const THERAPIST_ID = AGENT_ID;
const THERAPY_ROW = AGENT_ROW;
const AI_ADVISOR_ROW = AGENT_ROW;

const demoChats = [
  {
    matchId: 1,
    user: {
      id: 1,
      name: "Maya",
      age: 27,
      photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80",
      interests: ["Design", "Yoga", "Music", "Coffee"],
    },
    user24hPhoto: null,
    connectionSource: CONNECTION_SOURCE.SWIPE,
    quickVibe: "You both love design",
    unreadCount: 1,
    blocked: false,
    messages: [
      {
        id: 11,
        from: "them",
        type: "text",
        text: "Hey! I found this amazing pottery workshop and thought it would be fun to do together 🎨",
        timestamp: Date.now() - 1 * 60 * 60 * 1000,
        status: "delivered",
        reactions: {},
        replyTo: null,
      },
    ],
    lastSentAt: Date.now() - 1 * 60 * 60 * 1000,
    status: "active",
    pinned: false,
    muted: false,
    themeColor: "#ECE5DD",
    disappearingSeconds: DEFAULT_DISAPPEARING_SECONDS,
  },
  {
    matchId: 4,
    user: {
      id: 4,
      name: "Liza",
      age: 28,
      photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=256&q=80",
    },
    user24hPhoto: null,
    connectionSource: CONNECTION_SOURCE.NEARBY,
    quickVibe: "You both love traveling",
    unreadCount: 1,
    blocked: false,
    messages: [
      {
        id: 41,
        from: "them",
        type: "text",
        text: "Hey! Would love to grab coffee and chat about travel 🌍",
        timestamp: Date.now() - 3 * 60 * 60 * 1000,
        status: "delivered",
        reactions: {},
        replyTo: null,
      },
    ],
    lastSentAt: Date.now() - 3 * 60 * 60 * 1000,
    status: "active",
    pinned: false,
    muted: false,
    themeColor: "#ECE5DD",
    disappearingSeconds: DEFAULT_DISAPPEARING_SECONDS,
  },
  {
    matchId: 5,
    user: {
      id: 5,
      name: "Gali",
      age: 25,
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      interests: ["Art", "Music", "Photography"],
    },
    user24hPhoto: null,
    connectionSource: CONNECTION_SOURCE.EVENT,
    eventName: "Art Night @ TLV",
    quickVibe: "Same taste in art",
    // Event Countdown - Per spec section 8
    sharedEvent: {
      id: 1,
      name: "Art Night @ TLV",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    unreadCount: 0,
    blocked: false,
    isNewMatch: true, // Show AI first message
    messages: [
      {
        id: 51,
        from: "them",
        type: "text",
        text: "Love your vibe! Want to check out the new art gallery? ✨",
        timestamp: Date.now() - 7 * 60 * 60 * 1000,
        status: "read",
        reactions: {},
        replyTo: null,
      },
    ],
    lastSentAt: Date.now() - 7 * 60 * 60 * 1000,
    status: "active",
    pinned: false,
    muted: false,
    themeColor: "#ECE5DD",
    disappearingSeconds: DEFAULT_DISAPPEARING_SECONDS,
  },
  {
    matchId: 6,
    user: {
      id: 6,
      name: "Shani",
      age: 24,
      photoUrl: "/liza_1.jpg",
    },
    user24hPhoto: null,
    connectionSource: CONNECTION_SOURCE.NEARBY,
    quickVibe: "Both night people",
    unreadCount: 2,
    blocked: false,
    messages: [
      {
        id: 61,
        from: "them",
        type: "text",
        text: "Hey! Just got back from the most amazing photoshoot 📸",
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        status: "delivered",
        reactions: {},
        replyTo: null,
      },
      {
        id: 62,
        from: "them",
        type: "text",
        text: "Want to grab brunch this weekend? I know the perfect spot! 🥞",
        timestamp: Date.now() - 1.5 * 60 * 60 * 1000,
        status: "read",
        reactions: {},
        replyTo: null,
      },
    ],
    lastSentAt: Date.now() - 1.5 * 60 * 60 * 1000,
    status: "active",
    pinned: false,
    muted: false,
    themeColor: "#ECE5DD",
    disappearingSeconds: DEFAULT_DISAPPEARING_SECONDS,
  },
  {
    matchId: 7,
    user: {
      id: 7,
      name: "Yael",
      age: 26,
      photoUrl: "/gali_1.jpg",
    },
    connectionSource: CONNECTION_SOURCE.MATCH,
    quickVibe: "You both enjoy dancing",
    unreadCount: 0,
    blocked: false,
    user24hPhoto: null,
    messages: [
      {
        id: 71,
        from: "them",
        type: "text",
        text: "Your profile caught my eye! Love your style 😎",
        timestamp: Date.now() - 10 * 60 * 60 * 1000,
        status: "read",
        reactions: {},
        replyTo: null,
      },
    ],
    lastSentAt: Date.now() - 10 * 60 * 60 * 1000,
    status: "active",
    pinned: false,
    muted: false,
    themeColor: "#ECE5DD",
    disappearingSeconds: DEFAULT_DISAPPEARING_SECONDS,
  },
];

/* ================== Voice bubble player ================== */
function VoicePlayer({ url, durationMs }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secLeft, setSecLeft] = useState(Math.floor((durationMs || 0) / 1000));
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      const dur = a.duration || 1;
      setProgress(a.currentTime / dur);
      setSecLeft(Math.max(0, Math.ceil(dur - a.currentTime)));
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
      setSecLeft(Math.floor(a.duration || 0));
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 260 }}>
      <audio ref={audioRef} src={url} preload="metadata" hidden />
      <IconButton
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        size="small"
        onClick={() => {
          const a = audioRef.current;
          if (!a) return;
          if (playing) {
            a.pause();
            setPlaying(false);
          } else {
            a.play();
            setPlaying(true);
          }
        }}
        sx={{
          bgcolor: "#6C5CE7",
          color: "#fff",
          width: 32,
          height: 32,
          "&:hover": { bgcolor: "#5B4BD1" },
        }}
      >
        {playing ? "❚❚" : "▶"}
      </IconButton>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ height: 4, bgcolor: "rgba(108, 92, 231, 0.2)", borderRadius: 999 }}>
          <Box
            sx={{
              width: `${Math.round(progress * 100)}%`,
              height: 4,
              borderRadius: 999,
              bgcolor: "#6C5CE7",
            }}
          />
        </Box>
      </Box>
      <IconButton
        aria-label="Playback speed"
        size="small"
        onClick={() => setRate((r) => (r === 1 ? 1.5 : r === 1.5 ? 2 : 1))}
        sx={{ fontSize: 12 }}
        title="Playback speed"
      >
        {rate}x
      </IconButton>
      <Typography
        variant="caption"
        sx={{ color: "#6B7280", width: 40, textAlign: "right" }}
        aria-live="polite"
      >
        {`${Math.floor(secLeft / 60)
          .toString()
          .padStart(2, "0")}:${Math.floor(secLeft % 60)
          .toString()
          .padStart(2, "0")}`}
      </Typography>
    </Box>
  );
}

/* ================== Link Preview ================== */
function LinkPreview({ url }) {
  const host = hostOf(url);
  return (
    <Box
      sx={{
        mt: 0.5,
        p: 1,
        border: "1px solid #E5E7EB",
        borderRadius: 2,
        bgcolor: "#fff",
      }}
      role="group"
      aria-label={`Link preview ${host}`}
    >
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {host}
      </Typography>
      <Typography variant="caption" sx={{ color: "#6B7280" }}>
        {url}
      </Typography>
    </Box>
  );
}

/* --- useReactionPopper (רשימת אימוג'י מהירה) --- */
function useReactionPopper() {
  const anchorsMap = useRef(new Map()); // msgId -> HTMLElement
  const [state, setState] = useState({
    open: false,
    anchorEl: null,
    msgId: null,
  });

  const registerAnchor = useCallback(
    (msgId) => (node) => {
      if (node) anchorsMap.current.set(msgId, node);
      else anchorsMap.current.delete(msgId);
    },
    []
  );

  const openFor = useCallback((msgId) => {
    const el =
      anchorsMap.current.get(msgId) ||
      document.getElementById(`msg-${msgId}`);
    if (!el) return;
    setState({ open: true, anchorEl: el, msgId });
  }, []);

  const close = useCallback(
    () => setState({ open: false, anchorEl: null, msgId: null }),
    []
  );

  return { registerAnchor, openFor, close, ...state };
}

/* ================== Chat bubble ================== */
function ChatBubble({
  msg,
  isMe,
  onDoubleLike,
  onLongPressStart,
  onOpenActions,
  onEventInviteAccept,
  onEventInviteDecline,
  onEventInviteOfferPay,
  onWorkshopInviteRespond,
}) {
  const bg = isMe ? "#F3F0FF" : "#FFFFFF";
  const tailSide = isMe ? "right" : "left";
  const reactionEntries = Object.entries(msg.reactions || {}).filter(
    ([, c]) => c > 0
  );
  const match = (msg.text || "").match(URL_RE);

  return (
    <Box
      id={`msg-${msg.id}`}
      onDoubleClickCapture={onDoubleLike}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenActions(e.currentTarget, msg.id);
      }}
      onMouseDown={(e) => {
        const t = setTimeout(() => onLongPressStart(e.currentTarget, msg.id), 420);
        e.currentTarget._lp = t;
      }}
      onMouseUp={(e) => {
        if (e.currentTarget._lp) clearTimeout(e.currentTarget._lp);
      }}
      onMouseLeave={(e) => {
        if (e.currentTarget._lp) clearTimeout(e.currentTarget._lp);
      }}
      onTouchStart={(e) => {
        const t = setTimeout(() => onLongPressStart(e.currentTarget, msg.id), 420);
        e.currentTarget._lp = t;
      }}
      onTouchEnd={(e) => {
        if (e.currentTarget._lp) clearTimeout(e.currentTarget._lp);
      }}
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
      }}
    >
      <Box
        sx={{
          position: "relative",
          px: 2,
          py: 1.25,
          bgcolor: bg,
          borderRadius: 3,
          borderTopRightRadius: isMe ? 4 : 12,
          borderTopLeftRadius: isMe ? 12 : 4,
          maxWidth: "min(85vw, 320px)",
          minWidth: 60,
          boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
          opacity: msg.type === "deleted" ? 0.7 : 1,
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            [tailSide]: -6,
            width: 0,
            height: 0,
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            ...(isMe
              ? { borderLeft: `6px solid ${bg}` }
              : { borderRight: `6px solid ${bg}` }),
          },
        }}
        role="group"
        aria-label={isMe ? "Your message" : "Their message"}
      >
        {/* Reply header */}
        {msg.replyTo && (
          <Box
            sx={{
              mb: 0.5,
              px: 1,
              py: 0.5,
              borderLeft: "3px solid #6C5CE7",
              bgcolor: "#F5F3FF",
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: "#555" }}>
              Reply to {msg.replyTo.from === "me" ? "You" : msg.replyTo.from}:{" "}
              {(msg.replyTo.text || "[media]").slice(0, 70)}
            </Typography>
          </Box>
        )}

        {/* Content */}
        {msg.type === "deleted" ? (
          <Typography sx={{ fontStyle: "italic", color: "#6B7280" }}>
            {msg.text}
          </Typography>
        ) : msg.type === "voice" ? (
          <VoicePlayer url={msg.audioUrl} durationMs={msg.durationMs} />
        ) : msg.type === "image" ? (
          <Box sx={{ mt: 0.25 }}>
            <img
              src={msg.imageUrl}
              alt="attachment"
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
            {msg.text && <Typography sx={{ mt: 0.5 }}>{msg.text}</Typography>}
          </Box>
        ) : msg.type === "place_invite" ? (
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              bgcolor: msg.from === "me" ? "rgba(236,72,153,0.08)" : "#fff",
              border: "1px solid rgba(236,72,153,0.15)",
              minWidth: 200,
              maxWidth: 280,
            }}
          >
            {msg.place?.image && (
              <img src={msg.place.image} alt={msg.place.name} style={{ width: "100%", borderRadius: 12, marginBottom: 12 }} />
            )}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ 
                width: 40, height: 40, borderRadius: '12px', 
                bgcolor: 'rgba(236,72,153,0.15)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {msg.place?.type === 'cafe' && <span style={{ fontSize: 20 }}>☕</span>}
                {msg.place?.type === 'bar' && <span style={{ fontSize: 20 }}>🍷</span>}
                {msg.place?.type === 'restaurant' && <span style={{ fontSize: 20 }}>🍽️</span>}
                {msg.place?.type === 'park' && <span style={{ fontSize: 20 }}>🌳</span>}
                {msg.place?.type === 'museum' && <span style={{ fontSize: 20 }}>🏛️</span>}
                {(!msg.place?.type || msg.place?.type === 'other' || msg.place?.type === 'place') && <MapPin size={20} color="#EC4899" />}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem', lineHeight: 1.3 }}>
                  {msg.place?.name || "Place"}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25 }}>
                  {msg.place?.type && msg.place.type !== 'other' && msg.place.type !== 'place' 
                    ? msg.place.type.charAt(0).toUpperCase() + msg.place.type.slice(1) 
                    : 'Place'}
                  {typeof msg.place?.distance === "number" && ` • ${msg.place.distance.toFixed(1)} km away`}
                </Typography>
              </Box>
            </Box>
            {msg.text && (
              <Typography variant="body2" sx={{ color: '#475569', mt: 1.5, fontStyle: 'italic' }}>
                "{msg.text}"
              </Typography>
            )}
            {msg.place?.maps && (
              <Button 
                size="small" 
                variant="outlined" 
                href={msg.place.maps} 
                target="_blank" 
                rel="noreferrer" 
                startIcon={<Navigation size={14} />}
                sx={{ 
                  mt: 1.5, 
                  borderRadius: 2, 
                  borderColor: 'rgba(236,72,153,0.3)',
                  color: '#EC4899',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#EC4899',
                    bgcolor: 'rgba(236,72,153,0.08)',
                  },
                }}
              >
                Open in Maps
              </Button>
            )}
          </Box>
        ) : msg.type === "contact" ? (
          <Box
            sx={{ p: 1, border: "1px solid #e5e7eb", borderRadius: 2, bgcolor: "#fff" }}
          >
            <Typography sx={{ fontWeight: 700 }}>{msg.contact?.name}</Typography>
            <Typography variant="body2" sx={{ color: "#555" }}>
              {msg.contact?.phone}
            </Typography>
          </Box>
        ) : msg.type === "location" ? (
          <Box
            sx={{ p: 1, border: "1px solid #e5e7eb", borderRadius: 2, bgcolor: "#fff" }}
          >
            <Typography sx={{ fontWeight: 700 }}>Location</Typography>
            <Typography variant="body2" sx={{ color: "#555" }}>
              {msg.location?.lat.toFixed(5)}, {msg.location?.lng.toFixed(5)}
            </Typography>
            <a
              href={`https://maps.google.com/?q=${msg.location?.lat},${msg.location?.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Open map
            </a>
          </Box>
        ) : msg.type === "poll" ? (
          <Box
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              bgcolor: msg.from === "me" ? "rgba(108,92,231,0.08)" : "#fff",
              border: "1px solid rgba(108,92,231,0.15)",
              minWidth: 200,
              maxWidth: 280,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <BarChart2 size={18} color="#6C5CE7" />
              <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>
                {msg.poll.question}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(msg.poll.options || []).map((opt, i) => (
                <Button
                  key={i}
                  size="small"
                  variant={msg.poll.voted === i ? "contained" : "outlined"}
                  onClick={() => msg.onVote?.(i) || null}
                  sx={{ 
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    borderRadius: 2,
                    py: 1,
                    px: 2,
                    textTransform: 'none',
                    fontWeight: msg.poll.voted === i ? 600 : 400,
                    bgcolor: msg.poll.voted === i ? '#6C5CE7' : 'transparent',
                    borderColor: 'rgba(108,92,231,0.3)',
                    color: msg.poll.voted === i ? '#fff' : '#1a1a2e',
                    '&:hover': {
                      bgcolor: msg.poll.voted === i ? '#5A4BD8' : 'rgba(108,92,231,0.08)',
                      borderColor: '#6C5CE7',
                    },
                  }}
                >
                  {opt}
                </Button>
              ))}
            </Box>
            {msg.poll.votes > 0 && (
              <Typography variant="caption" sx={{ color: '#64748b', mt: 1.5, display: 'block' }}>
                {msg.poll.votes} vote{msg.poll.votes > 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        ) : msg.type === "gesture" && msg.gestureType === "event_invite" ? (
          <Box sx={{ mt: 0.25 }}>
            <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", mb: 1 }}>
              {msg.text}
            </Typography>
            {!!msg.gestureDetails?.paidByInviter && (
              <Typography variant="caption" sx={{ color: "#6C5CE7", display: "block", mb: 1 }}>
                Ticket included — they’ll pay for you
              </Typography>
            )}
            <Box 
              sx={{ 
                border: "1px solid rgba(17,24,39,0.10)", 
                borderRadius: 3, 
                bgcolor: "#fff",
                overflow: "hidden",
                boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                cursor: "pointer",
              }}
              onClick={() => window.location.href = `/events/${msg.gestureDetails?.eventId}`}
            >
              {msg.gestureDetails?.eventCover && (
                <img 
                  src={msg.gestureDetails.eventCover} 
                  alt={msg.gestureDetails.eventTitle} 
                  style={{ width: "100%", height: 140, objectFit: "cover" }} 
                />
              )}
              <Box sx={{ p: 1.5 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>
                  🎉 {msg.gestureDetails?.eventTitle}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6b7280", display: 'block', mt: 0.5 }}>
                  {msg.gestureDetails?.eventDate} {msg.gestureDetails?.eventTime && `• ${msg.gestureDetails.eventTime}`}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6b7280", display: 'block' }}>
                  📍 {msg.gestureDetails?.eventVenue}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    sx={{ ...inviteSecondaryCtaSx, fontSize: '0.75rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/events/${msg.gestureDetails?.eventId}`;
                    }}
                  >
                    View Event
                  </Button>

                  {!isMe && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ ...invitePrimaryCtaSx, fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventInviteAccept?.(msg);
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        color="inherit"
                        sx={{ ...inviteNeutralCtaSx, fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventInviteDecline?.(msg);
                        }}
                      >
                        Decline
                      </Button>
                    </>
                  )}

                  {isMe && !msg.gestureDetails?.paidByInviter && (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ ...inviteSecondaryCtaSx, fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventInviteOfferPay?.(msg);
                      }}
                    >
                      Buy for +1
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        ) : msg.type === "workshop_invite" ? (
          <Box sx={{ mt: 0.25 }}>
            <Box 
              sx={{ 
                border: "1px solid rgba(17,24,39,0.10)", 
                borderRadius: 3, 
                bgcolor: "#fff",
                overflow: "hidden",
                boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
              }}
            >
              {msg.workshop?.cover && (
                <img 
                  src={msg.workshop.cover} 
                  alt={msg.workshop.title} 
                  style={{ width: "100%", height: 120, objectFit: "cover" }} 
                />
              )}
              <Box sx={{ p: 1.5 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>
                  {msg.text}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6b7280", display: 'block', mt: 0.5 }}>
                  {msg.workshop?.date} • {msg.workshop?.time}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6b7280", display: 'block' }}>
                  📍 {msg.workshop?.venue}
                </Typography>

                {/* Show status if already responded */}
                {msg.inviteStatus === 'accepted' && (
                  <Box sx={{ 
                    mt: 1, 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(108,92,231,0.1)', 
                    border: '1px solid rgba(108,92,231,0.3)' 
                  }}>
                    <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 700 }}>
                      ✅ Accepted
                    </Typography>
                  </Box>
                )}
                {msg.inviteStatus === 'declined' && (
                  <Box sx={{ 
                    mt: 1, 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(107,114,128,0.08)', 
                    border: '1px solid rgba(107,114,128,0.2)' 
                  }}>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600, mb: 0.5 }}>
                      Maybe next time 💭
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      sx={{ 
                        color: '#6C5CE7', 
                        textTransform: 'none', 
                        fontSize: '0.75rem',
                        p: 0,
                        minWidth: 'auto',
                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onWorkshopInviteRespond?.(msg.id, 'accepted');
                      }}
                    >
                      Actually, I'd love to join! ✨
                    </Button>
                  </Box>
                )}

                {/* Show buttons only if not yet responded */}
                {!msg.inviteStatus && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      sx={{ ...inviteSecondaryCtaSx, fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // View workshop details - for demo just show alert
                        alert(`Workshop: ${msg.workshop?.title}\nDate: ${msg.workshop?.date}\nTime: ${msg.workshop?.time}\nVenue: ${msg.workshop?.venue}`);
                      }}
                    >
                      View Event
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ ...invitePrimaryCtaSx, fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Accept workshop invite - update message status
                        onWorkshopInviteRespond?.(msg.id, 'accepted');
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      color="inherit"
                      sx={{ ...inviteNeutralCtaSx, fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Decline workshop invite - update message status
                        onWorkshopInviteRespond?.(msg.id, 'declined');
                      }}
                    >
                      Decline
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <>
            <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {msg.text}
            </Typography>
            {match && <LinkPreview url={match[0]} />}
          </>
        )}

        {/* Footer row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 0.5,
            mt: 0.75,
            pt: 0.5,
          }}
        >
          {msg.starred && <span title="Starred">⭐</span>}
          <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.7rem", whiteSpace: "nowrap" }}>
            {fmtHM(msg.timestamp)}
            {msg.edited && " · edited"}
          </Typography>
          {/* Pulse spec: No "seen" status - only show sent/delivered */}
          {isMe && msg.status === "delivered" ? (
            <CheckCheck size={16} />
          ) : isMe && msg.status === "sent" ? (
            <Check size={16} />
          ) : null}
        </Box>

        {/* Reactions bubble */}
        {reactionEntries.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: -12,
              right: isMe ? 8 : "auto",
              left: isMe ? "auto" : 8,
              bgcolor: "#fff",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              px: 0.5,
              py: "2px",
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              fontSize: 12,
              transform: "translateY(100%)",
              pointerEvents: "none",
            }}
          >
            {reactionEntries.map(([emo, count]) => (
              <Box
                key={emo}
                sx={{ display: "flex", alignItems: "center", gap: 0.25 }}
              >
                <span style={{ fontSize: 14 }}>{emo}</span>
                {count > 1 && (
                  <span style={{ fontSize: 11, color: "#555" }}>{count}</span>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ================== Emoji picker (Bottom Sheet) ================== */
// Simple emoji grid - avoiding emoji-mart issues with Web Components
const COMMON_EMOJIS = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍",
  "🥰", "😘", "😗", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫",
  "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌",
  "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️", "💕", "💞",
  "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👋", "🖐️", "✋", "🖖",
  "👏", "🙌", "👐", "🤲", "🤝", "🙏", "💪", "🦾", "🦿", "🦵", "🦶", "👂",
  "🔥", "⭐", "🌟", "✨", "💫", "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🎯",
];

function EmojiBottomSheet({ open, onClose, onPick }) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ zIndex: 9999 }}
      PaperProps={{
        sx: { 
          height: 'auto',
          maxHeight: '40vh',
          borderTopLeftRadius: 16, 
          borderTopRightRadius: 16,
          mb: 7,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ p: 1.5, pb: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box
          sx={{
            width: 36,
            height: 4,
            bgcolor: "#ddd",
            borderRadius: 999,
            mx: "auto",
            mb: 1,
            flexShrink: 0,
          }}
        />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, flexShrink: 0 }}>
          Choose an emoji
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(8, 1fr)', 
          gap: 0.5,
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
        }}>
          {COMMON_EMOJIS.map((emoji, i) => (
            <Button
              key={i}
              onClick={() => { onPick(emoji); onClose(); }}
              sx={{ 
                minWidth: 0, 
                fontSize: 24, 
                p: 0.75,
                borderRadius: 1,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
              }}
            >
              {emoji}
            </Button>
          ))}
        </Box>
      </Box>
    </Drawer>
  );
}

/* ================== AI suggestion builder ================== */
function buildAISuggestions({
  toName = "there",
  interests = [],
  lastThem = "",
  tone = "friendly",
  length = "short",
  intent = "open",
}) {
  const topic = interests[0] || "your interests";

  const banks = {
    open: {
      friendly: [
        `Hey ${toName}, how's your day going?`,
        `${toName}, loved your take on ${topic}. Tell me more!`,
        lastThem ? `About "${lastThem.slice(0, 60)}" — I’m curious!` : `What are you up to this week?`,
      ],
      playful: [
        `Okay ${toName}, plot twist: coffee + story swap? 😄`,
        `Serious question: pancakes or waffles?`,
        `If we debated ${topic}, who’d win? 😉`,
      ],
      formal: [
        `Hello ${toName}, I appreciated your interest in ${topic}.`,
        `Would you be open to continuing our conversation later this week?`,
        `If you’re available, I’d be glad to grab a coffee and chat.`,
      ],
      flirty: [
        `Confession time ${toName}: you had me at ${topic}.`,
        `Your vibe is exactly my type. Drinks soon?`,
        `Can we turn this chat into a date? 😉`,
      ],
      confident: [
        `${toName}, let's pick a time—coffee Tue/Wed?`,
        `You + ${topic} + me = great combo. When are you free?`,
        `Let’s make this simple: Wed 19:00?`,
      ],
    },
    followup: {
      friendly: [
        `Circling back on ${topic}—did you end up trying it?`,
        `I kept thinking about what you said on "${lastThem.slice(0, 60)}"`,
        `So… how did ${topic} go?`,
      ],
      playful: [
        `Update me like I’m your favorite podcast 😄`,
        `Cliffhanger alert—what happened with ${topic}?`,
        `Plot twist time?`,
      ],
      formal: [
        `Following up on our chat about ${topic}.`,
        `Were you still interested in continuing that thread?`,
        `Happy to pick it up whenever convenient.`,
      ],
      flirty: [
        `I owe you the story I promised… over a drink?`,
        `Still thinking about your smile when you mentioned ${topic}.`,
        `I’m intrigued. Want to continue this face-to-face?`,
      ],
      confident: [
        `Let’s wrap this: Thu 18:30 at Dizengoff?`,
        `Game plan: you choose ${topic}, I’ll pick the place.`,
        `I’ll book us a spot—what day works?`,
      ],
    },
    invite: {
      friendly: [
        `Coffee at a cozy place near you this week?`,
        `Want to check out that ${topic}-ish spot together?`,
        `Free one evening for a quick drink?`,
      ],
      playful: [
        `Deal: I pick the place, you pick dessert 😄`,
        `Let’s test our ${topic} chemistry IRL 😉`,
        `Winner buys the first round!`,
      ],
      formal: [
        `Would you like to meet for coffee sometime this week?`,
        `If convenient, I’d be glad to meet and continue in person.`,
        `Are you available for a short meetup?`,
      ],
      flirty: [
        `Let’s upgrade this vibe to a date.`,
        `I bet you’re even more fun offline—drink this week?`,
        `You + me + spontaneous plan = yes?`,
      ],
      confident: [
        `Wed 19:30 at Roma Café works for me—join?`,
        `I’ll reserve a table for two Fri 20:00—ok for you?`,
        `Let’s lock it in: Thu 19:00?`,
      ],
    },
    compliment: {
      friendly: [
        `Love how genuine you sound.`,
        `Your energy is really nice to read.`,
        `You have great taste in ${topic}!`,
      ],
      playful: [
        `Careful, that smile could start traffic.`,
        `You’re dangerously charming.`,
        `Certified 10/10 banter.`,
      ],
      formal: [
        `You express yourself very clearly—refreshing to see.`,
        `Your perspective on ${topic} is thoughtful.`,
        `I appreciate your tone—polite yet warm.`,
      ],
      flirty: [
        `You’re exactly my type.`,
        `That photo with ${topic}? Stole the show.`,
        `Hard not to be into you.`,
      ],
      confident: [
        `You stand out. Let’s meet.`,
        `You’re impressive—coffee soon?`,
        `I like your vibe—let’s go out.`,
      ],
    },
    clarify: {
      friendly: [
        `Did you mean ${lastThem ? `"${lastThem.slice(0, 40)}"` : "that"}?`,
        `Tell me more—what’s your take?`,
        `Curious to hear a bit more about that.`,
      ],
      playful: [
        `Translate that into human for me 😄`,
        `Plot hole detected—fill me in?`,
        `Red pill or blue pill?`,
      ],
      formal: [
        `Could you clarify your point?`,
        `Would you mind expanding on that?`,
        `I’d appreciate a bit more context.`,
      ],
      flirty: [
        `I’ll need a better explanation… maybe over drinks.`,
        `Convince me—with your best smile.`,
        `You’ve got my attention. Details?`,
      ],
      confident: [
        `Be specific—what did you mean?`,
        `So bottom line?`,
        `Give me the gist in one sentence.`,
      ],
    },
  };

  let list = (banks[intent]?.[tone] || []).slice(0, 3);
  const mapLen = {
    short: (s) => s,
    medium: (s) => `${s} I’m curious to hear more.`,
    long: (s) =>
      `${s} I enjoyed this and would love to hear more about what you’re into.`,
  };
  return list.map(mapLen[length]);
}

/* ======= Therapist helpers ======= */
const CRISIS_PATTERNS = [
  /suicid/i,
  /kill myself/i,
  /end it/i,
  /self[\s-]?harm/i,
  /i want to die/i,
  /להתאבד|פגיעה עצמית|אני רוצה למות|אין לי למה לחיות/,
];

function isCrisis(text = "") {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

function genTherapyReply(userText = "") {
  const base =
    "Thank you for sharing. I'm here to listen. What you're feeling matters. Let's try a small step: ";
  const suggestions = [
    "Try breathing 4-7-8 twice and notice how your body relaxes.",
    "Describe in words what's happening right now (thoughts/feelings/body sensations).",
    "Choose one small action that will help you in the next 15 minutes.",
  ];
  const pick = suggestions[Math.floor(Math.random() * suggestions.length)];
  let reply = `${base}${pick}`;
  if (isCrisis(userText)) {
    reply =
      "I'm sorry to hear things are so difficult right now. If you're in immediate danger or crisis, please reach out to emergency services or a crisis hotline in your area. I'm here for supportive conversation, not as a replacement for professional help or emergency assistance.";
  }
  return reply;
}

function genCoachReply(userText = "") {
  // Extract name from "Tips for chatting with Name (age)" pattern
  const nameMatch = userText.match(/chatting with (\w+)/i) || userText.match(/לשוחח עם (\w+)/);
  const name = nameMatch ? nameMatch[1] : "them";
  
  const tipSets = [
    `Here are some conversation ideas for ${name}:\n\n` +
    `1️⃣ "Hey ${name}! What made you smile today?"\n` +
    `2️⃣ "I noticed you're into [something from their profile] - what's the story?"\n` +
    `3️⃣ "Any fun plans for the weekend?"\n\n` +
    `💡 Tip: Open-ended questions work better than yes/no!`,
    
    `Some approaches that work:\n\n` +
    `🎯 Light opener: "Hey! How's your week going?"\n` +
    `🎯 Something specific: Reference details from their profile\n` +
    `🎯 Light humor: "So who wins the debate about [topic]? 😄"\n\n` +
    `⚡ Remember: Authenticity > Trying to impress`,
    
    `Tips for chatting with ${name}:\n\n` +
    `✨ Start easy - you don't have to be perfect\n` +
    `✨ Ask something you're genuinely curious about\n` +
    `✨ Respond to what they say, don't just ask questions\n\n` +
    `Example: "That sounds interesting! How did you get into that?"`,
  ];
  
  return tipSets[Math.floor(Math.random() * tipSets.length)];
}

/* ================== Main ================== */
export default function ChatScreen() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { matchId: urlMatchId } = useParams();
  const [chats, setChats] = useState([AGENT_ROW, ...demoChats]);
  const [openChat, setOpenChat] = useState(null);
  
  // Helper to open chat and update URL
  const openChatWithNav = useCallback((matchId) => {
    setOpenChat(matchId);
    navigate(`/chat/${matchId}`, { replace: true });
  }, [navigate]);
  
  // Close chat when navigating back to /chat (no matchId in URL)
  useEffect(() => {
    if (location.pathname === '/chat' && openChat !== null) {
      setOpenChat(null);
    }
  }, [location.pathname]);
  const chat = useMemo(
    () => chats.find((c) => c.matchId === openChat),
    [chats, openChat]
  );

  const appendSystemMessageToOpenChat = useCallback(
    (text) => {
      if (!openChat) return;
      const sysMsg = {
        id: `system_${Date.now()}`,
        type: "text",
        from: "me",
        text,
        timestamp: Date.now(),
        status: "sent",
        reactions: {},
      };
      setChats((prev) =>
        prev.map((c) =>
          c.matchId === openChat
            ? {
                ...c,
                messages: [...c.messages, sysMsg],
                lastSentAt: sysMsg.timestamp,
              }
            : c
        )
      );
    },
    [openChat, setChats]
  );

  const handleEventInviteAccept = useCallback(
    (msg) => {
      const { addInvite, acceptInvite } = useEventInvitesStore.getState();
      const invite = addInvite({
        matchId: chat?.user?.id || urlMatchId,
        inviter: { id: chat?.user?.id, name: chat?.user?.name },
        event: {
          id: msg.gestureDetails?.eventId,
          title: msg.gestureDetails?.eventTitle,
          date: msg.gestureDetails?.eventDate,
          time: msg.gestureDetails?.eventTime,
          venue: msg.gestureDetails?.eventVenue,
          cover: msg.gestureDetails?.eventCover,
        },
        paidByInviter: !!msg.gestureDetails?.paidByInviter,
      });
      acceptInvite(invite.id, user ? { id: user.id, name: user.firstName || user.username || user.email } : null);
      appendSystemMessageToOpenChat("✅ You accepted the invite");
    },
    [appendSystemMessageToOpenChat, chat, urlMatchId, user]
  );

  const handleEventInviteDecline = useCallback(
    (msg) => {
      const { addInvite, declineInvite } = useEventInvitesStore.getState();
      const invite = addInvite({
        matchId: chat?.user?.id || urlMatchId,
        inviter: { id: chat?.user?.id, name: chat?.user?.name },
        event: {
          id: msg.gestureDetails?.eventId,
          title: msg.gestureDetails?.eventTitle,
          date: msg.gestureDetails?.eventDate,
          time: msg.gestureDetails?.eventTime,
          venue: msg.gestureDetails?.eventVenue,
          cover: msg.gestureDetails?.eventCover,
        },
        paidByInviter: !!msg.gestureDetails?.paidByInviter,
      });
      declineInvite(invite.id);
      appendSystemMessageToOpenChat("❌ You declined the invite (you can still accept later)");
    },
    [appendSystemMessageToOpenChat, chat, urlMatchId]
  );

  const handleEventInviteOfferPay = useCallback(
    (msg) => {
      if (!openChat) return;
      const newMsg = {
        id: `event_invite_${Date.now()}`,
        type: "gesture",
        gestureType: "event_invite",
        from: "me",
        text: `I can buy your ticket for ${msg.gestureDetails?.eventTitle} too — do you want it?`,
        timestamp: Date.now(),
        status: "sent",
        gestureDetails: {
          ...msg.gestureDetails,
          paidByInviter: true,
        },
        reactions: {},
      };

      setChats((prev) =>
        prev.map((c) =>
          c.matchId === openChat
            ? {
                ...c,
                messages: [...c.messages, newMsg],
                lastSentAt: newMsg.timestamp,
              }
            : c
        )
      );

      // Trigger global flow in demo (represents the recipient getting a new invite offer)
      const { addInvite } = useEventInvitesStore.getState();
      addInvite({
        matchId: chat?.user?.id || urlMatchId,
        inviter: { id: "me", name: "You" },
        event: {
          id: msg.gestureDetails?.eventId,
          title: msg.gestureDetails?.eventTitle,
          date: msg.gestureDetails?.eventDate,
          time: msg.gestureDetails?.eventTime,
          venue: msg.gestureDetails?.eventVenue,
          cover: msg.gestureDetails?.eventCover,
        },
        paidByInviter: true,
      });
    },
    [chat, openChat, setChats, urlMatchId]
  );

  // Handle workshop invite response (accept/decline)
  const handleWorkshopInviteRespond = useCallback(
    (messageId, status) => {
      if (!openChat) return;
      
      setChats((prev) =>
        prev.map((c) =>
          c.matchId === openChat
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId
                    ? { ...m, inviteStatus: status }
                    : m
                ),
              }
            : c
        )
      );

      // Add system message
      const statusText = status === 'accepted' ? '✅ Invite accepted!' : '💭 Maybe another time';
      const sysMsg = {
        id: `sys_${Date.now()}`,
        from: 'system',
        type: 'system',
        text: statusText,
        timestamp: Date.now(),
      };
      setChats((prev) =>
        prev.map((c) =>
          c.matchId === openChat
            ? { ...c, messages: [...c.messages, sysMsg] }
            : c
        )
      );
    },
    [openChat, setChats]
  );
  
  // Auto-open chat if matchId is in URL (e.g., from "Go to Chat" button or GlobalMeetingBar)
  useEffect(() => {
    if (urlMatchId) {
      const matchIdNum = parseInt(urlMatchId, 10);
      // Check if this chat exists - look for exact matchId, numeric matchId, or gesture_matchId
      const foundChat = chats.find(c => 
        c.matchId === matchIdNum || 
        c.matchId === urlMatchId ||
        c.matchId === `gesture_${urlMatchId}` ||
        c.user?.id === matchIdNum ||
        String(c.user?.id) === urlMatchId
      );
      if (foundChat) {
        // Set openChat directly without navigation to avoid loops
        if (openChat !== foundChat.matchId) {
          setOpenChat(foundChat.matchId);
        }
      }
    }
  }, [urlMatchId, chats, openChat]);
  
  // Workshop reminders from localStorage
  const [workshopReminders, setWorkshopReminders] = useState([]);
  
  // Load workshop reminders on mount
  useEffect(() => {
    const reminders = JSON.parse(localStorage.getItem("workshop_reminders") || "[]");
    setWorkshopReminders(reminders);
  }, []);
  
  // Get workshop reminder for current chat
  const currentWorkshopReminder = useMemo(() => {
    if (!chat || chat.matchId === AGENT_ID) return null;
    return workshopReminders.find(r => r.matchId === chat.matchId || r.matchId === chat.user?.id);
  }, [chat, workshopReminders]);
  
  // Calculate countdown for workshop
  const getWorkshopCountdown = useCallback((dateStr) => {
    if (!dateStr) return null;
    const workshopDate = new Date(dateStr);
    const now = new Date();
    const diffMs = workshopDate - now;
    if (diffMs < 0) return 'Already passed';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${mins}m`;
  }, []);
  
  // Gesture messages from Explore screen
  const gestureMessages = useGestureMessagesStore((state) => state.gestureMessages);
  const recipientUsers = useGestureMessagesStore((state) => state.recipientUsers);
  const clearMessagesForUser = useGestureMessagesStore((state) => state.clearMessagesForUser);
  
  // Persisted gesture chats
  const gestureChats = useChatStore((state) => state.gestureChats);
  const addGestureChat = useChatStore((state) => state.addGestureChat);
  
  // Load persisted gesture chats on mount
  useEffect(() => {
    const persistedChats = Object.values(gestureChats);
    if (persistedChats.length > 0) {
      setChats(prevChats => {
        // Add persisted chats that don't already exist
        const newChats = persistedChats.filter(
          pc => !prevChats.some(c => c.matchId === pc.matchId)
        );
        if (newChats.length > 0) {
          return [...newChats, ...prevChats];
        }
        return prevChats;
      });
    }
  }, []); // Only run on mount
  
  // Load pending place invites from localStorage (runs once on mount)
  useEffect(() => {
    try {
      const pendingInvitesRaw = localStorage.getItem("pending_place_invites");
      if (!pendingInvitesRaw) return;
      
      const pendingInvites = JSON.parse(pendingInvitesRaw);
      if (!Array.isArray(pendingInvites) || pendingInvites.length === 0) return;
      
      // Clear immediately to prevent re-processing
      localStorage.removeItem("pending_place_invites");
      
      // Filter valid invites only (must have message with text and place)
      const validInvites = pendingInvites.filter(invite => 
        invite?.message?.text && invite?.message?.place && invite?.matchId
      );
      
      if (validInvites.length === 0) return;
      
      setChats(prevChats => {
        let updatedChats = [...prevChats];
        
        validInvites.forEach(invite => {
          const chatIndex = updatedChats.findIndex(c => 
            c.matchId === invite.matchId || 
            c.user?.id === invite.matchId || 
            String(c.user?.id) === String(invite.matchId)
          );
          
          if (chatIndex !== -1) {
            const existingChat = updatedChats[chatIndex];
            // Check if message already exists by id
            const messageExists = existingChat.messages.some(m => m.id === invite.message.id);
            if (!messageExists) {
              updatedChats[chatIndex] = {
                ...existingChat,
                messages: [...existingChat.messages, invite.message],
                lastSentAt: invite.message.timestamp,
              };
            }
          }
        });
        
        return updatedChats;
      });
    } catch (e) {
      console.error("Error loading pending invites:", e);
      localStorage.removeItem("pending_place_invites");
    }
  }, []);

  // Load pending event invites from localStorage (runs once on mount)
  useEffect(() => {
    try {
      const pendingInvitesRaw = localStorage.getItem("pending_event_invites");
      if (!pendingInvitesRaw) return;

      const pendingInvites = JSON.parse(pendingInvitesRaw);
      if (!Array.isArray(pendingInvites) || pendingInvites.length === 0) return;

      // Clear immediately to prevent re-processing
      localStorage.removeItem("pending_event_invites");

      const validInvites = pendingInvites.filter(
        (invite) => invite?.message?.text && invite?.matchId
      );

      if (validInvites.length === 0) return;

      setChats((prevChats) => {
        let updatedChats = [...prevChats];

        validInvites.forEach((invite) => {
          const chatIndex = updatedChats.findIndex(
            (c) =>
              c.matchId === invite.matchId ||
              c.user?.id === invite.matchId ||
              String(c.user?.id) === String(invite.matchId)
          );

          if (chatIndex !== -1) {
            const existingChat = updatedChats[chatIndex];
            const messageExists = existingChat.messages.some(
              (m) => m.id === invite.message.id
            );
            if (!messageExists) {
              updatedChats[chatIndex] = {
                ...existingChat,
                messages: [...existingChat.messages, invite.message],
                lastSentAt: invite.message.timestamp,
              };
            }
          } else if (invite.user) {
            const newChat = {
              matchId: `gesture_${invite.matchId}`,
              user: {
                id: invite.user.id,
                name: invite.user.name,
                age: invite.user.age || "",
                photoUrl: invite.user.photoUrl || "https://via.placeholder.com/150",
              },
              user24hPhoto: null,
              connectionSource: "nearby",
              quickVibe: "Event invite",
              unreadCount: 1,
              blocked: false,
              messages: [invite.message],
              lastSentAt: invite.message.timestamp,
              status: "active",
              pinned: false,
              muted: false,
              themeColor: "#ECE5DD",
              disappearingSeconds: 7200,
            };
            updatedChats = [newChat, ...updatedChats];
          }
        });

        return updatedChats;
      });
    } catch (e) {
      console.error("Error loading pending event invites:", e);
      localStorage.removeItem("pending_event_invites");
    }
  }, []);

  // Load generic pending chat messages from localStorage (runs once on mount)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pending_chat_messages");
      if (!raw) return;

      const pending = JSON.parse(raw);
      if (!Array.isArray(pending) || pending.length === 0) return;

      localStorage.removeItem("pending_chat_messages");

      setChats((prevChats) => {
        let updatedChats = [...prevChats];

        pending.forEach((item) => {
          if (!item?.matchId || !item?.message?.id) return;

          const chatIndex = updatedChats.findIndex(
            (c) =>
              c.matchId === item.matchId ||
              c.user?.id === item.matchId ||
              String(c.user?.id) === String(item.matchId)
          );
          if (chatIndex === -1) return;

          const existingChat = updatedChats[chatIndex];
          const messageExists = existingChat.messages.some(
            (m) => m.id === item.message.id
          );
          if (messageExists) return;

          updatedChats[chatIndex] = {
            ...existingChat,
            messages: [...existingChat.messages, item.message],
            lastSentAt: item.message.timestamp,
          };
        });

        return updatedChats;
      });
    } catch (e) {
      console.error("Error loading pending chat messages:", e);
      localStorage.removeItem("pending_chat_messages");
    }
  }, []);

  // Load pending workshop invite messages from localStorage (runs once on mount)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pending_workshop_invite_messages");
      if (!raw) return;

      const pending = JSON.parse(raw);
      if (!Array.isArray(pending) || pending.length === 0) return;

      localStorage.removeItem("pending_workshop_invite_messages");

      setChats((prevChats) => {
        let updatedChats = [...prevChats];

        pending.forEach((item) => {
          if (!item?.matchId || !item?.message?.id) return;

          const chatIndex = updatedChats.findIndex(
            (c) =>
              c.matchId === item.matchId ||
              c.user?.id === item.matchId ||
              String(c.user?.id) === String(item.matchId)
          );
          if (chatIndex === -1) return;

          const existingChat = updatedChats[chatIndex];
          const messageExists = existingChat.messages.some(
            (m) => m.id === item.message.id
          );
          if (messageExists) return;

          updatedChats[chatIndex] = {
            ...existingChat,
            messages: [...existingChat.messages, item.message],
            lastSentAt: item.message.timestamp,
          };
        });

        return updatedChats;
      });
    } catch (e) {
      console.error("Error loading pending workshop invite messages:", e);
      localStorage.removeItem("pending_workshop_invite_messages");
    }
  }, []);
  
  // Load gesture messages into chats when they arrive
  useEffect(() => {
    const recipientIds = Object.keys(gestureMessages);
    if (recipientIds.length === 0) return;
    
    // Track chats to persist and messages to clear
    const chatsToPersist = [];
    const messagesToClear = [];
    
    setChats(prevChats => {
      let updatedChats = [...prevChats];
      
      recipientIds.forEach(recipientId => {
        const messages = gestureMessages[recipientId];
        if (!messages || messages.length === 0) return;
        
        const chatIndex = updatedChats.findIndex(c => String(c.user?.id) === String(recipientId));
        
        if (chatIndex !== -1) {
          // Add messages to existing chat
          const existingChat = updatedChats[chatIndex];
          const newMessages = messages.filter(
            gm => !existingChat.messages.some(m => m.id === gm.id)
          );
          if (newMessages.length > 0) {
            const updatedChat = {
              ...existingChat,
              messages: [...existingChat.messages, ...newMessages],
              lastSentAt: Math.max(existingChat.lastSentAt || 0, ...newMessages.map(m => m.timestamp)),
            };
            updatedChats[chatIndex] = updatedChat;
            if (updatedChat.matchId && typeof updatedChat.matchId === 'string' && updatedChat.matchId.startsWith('gesture_')) {
              chatsToPersist.push(updatedChat);
            }
            messagesToClear.push(recipientId);
          }
        } else {
          // Create new chat for this person
          const userInfo = recipientUsers[recipientId];
          if (userInfo) {
            const newChat = {
              matchId: `gesture_${recipientId}`,
              user: {
                id: userInfo.id,
                name: userInfo.name,
                age: userInfo.age || '',
                photoUrl: userInfo.photoUrl || 'https://via.placeholder.com/150',
              },
              user24hPhoto: null,
              connectionSource: 'nearby',
              quickVibe: 'Sweet Gesture sent',
              unreadCount: 0,
              blocked: false,
              messages: messages,
              lastSentAt: Math.max(...messages.map(m => m.timestamp)),
              status: 'active',
              pinned: false,
              muted: false,
              themeColor: '#ECE5DD',
              disappearingSeconds: 7200,
            };
            updatedChats = [newChat, ...updatedChats];
            chatsToPersist.push(newChat);
            messagesToClear.push(recipientId);
          }
        }
      });
      
      return updatedChats;
    });
    
    // Persist chats and clear messages after state update (in next tick)
    if (chatsToPersist.length > 0 || messagesToClear.length > 0) {
      setTimeout(() => {
        chatsToPersist.forEach(chat => addGestureChat(chat));
        messagesToClear.forEach(id => clearMessagesForUser(id));
      }, 0);
    }
  }, [gestureMessages, recipientUsers, clearMessagesForUser, addGestureChat]);

  // Pulse spec: Sort tabs state
  const [chatListSort, setChatListSort] = useState('active');

  const sortedChats = useMemo(() => {
    // Filter out blocked chats
    let filtered = chats.filter(c => !c.blocked);
    
    // Apply sort based on tab
    if (chatListSort === 'new') {
      // New connections: chats with 1 or fewer messages, sorted by date
      return [...filtered].sort((a, b) => {
        const aNew = a.messages.length <= 1;
        const bNew = b.messages.length <= 1;
        if (aNew && !bNew) return -1;
        if (!aNew && bNew) return 1;
        return (b.lastSentAt || 0) - (a.lastSentAt || 0);
      });
    }
    
    // Active: default sort (pinned first, then by date)
    return [...filtered].sort(
      (a, b) =>
        (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
        (b.lastSentAt || 0) - (a.lastSentAt || 0)
    );
  }, [chats, chatListSort]);

  // Note: Removed body overflow manipulation - it was causing scroll issues on other pages
  // The ChatScreen now uses its own container with overflow control

  // --- Stories state (שמירה לתאימות) ---
  const currentUserPhotoUrl =
    "https://randomuser.me/api/portraits/men/75.jpg";
  const [own24hPhoto, setOwn24hPhoto] = useState(null);
  const fileInputRef = useRef(null);
  const [viewStory, setViewStory] = useState({
    open: false,
    photo: null,
    user: null,
  });
  const [viewProfile, setViewProfile] = useState({ open: false, user: null });

  // Get global meeting context (must be before useMemo that uses it)
  const globalMeeting = useMeeting();

  // ==================== Meeting Time + SOS State ====================
  // Check URL param on initial render to prevent flickering - use lazy initializer
  const shouldShowMeetingOnLoad = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('showMeeting') === 'true' && globalMeeting.meetingState === GLOBAL_MEETING_STATE.ACTIVE;
  })();
  
  // Track if we're waiting for meeting screen to load (to prevent flickering)
  const [waitingForMeetingScreen, setWaitingForMeetingScreen] = useState(shouldShowMeetingOnLoad);
  
  const [meetingState, setMeetingState] = useState(() => 
    shouldShowMeetingOnLoad ? MEETING_STATE.ACTIVE : MEETING_STATE.INACTIVE
  );
  const [meetingWith, setMeetingWith] = useState(() =>
    shouldShowMeetingOnLoad ? globalMeeting.meetingWith : null
  ); // The user we're meeting with
  const [meetingStartTime, setMeetingStartTime] = useState(() =>
    shouldShowMeetingOnLoad ? (globalMeeting.meetingStartTime || Date.now()) : null
  );
  const [showMeetingScreen, setShowMeetingScreen] = useState(shouldShowMeetingOnLoad);
  
  // Meeting contacts (in-app circles)
  const [meetingContacts, setMeetingContacts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(MEETING_CONTACTS_KEY) || '[]');
    } catch { return []; }
  });
  const [contactsNotifiedThisMeeting, setContactsNotifiedThisMeeting] = useState([]);
  
  // Location sharing state
  const [locationSharing, setLocationSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const locationWatchRef = useRef(null);
  
  // SOS State
  const [sosState, setSosState] = useState(SOS_STATE.NONE);
  const [sosRequestId, setSosRequestId] = useState(null);
  const [sosHelper, setSosHelper] = useState(null);
  const [sosHelperDistance, setSosHelperDistance] = useState(null);
  const sosTimeoutRef = useRef(null);
  
  // Modals
  const [showContactsSetupModal, setShowContactsSetupModal] = useState(false);
  const [showEndMeetingConfirm, setShowEndMeetingConfirm] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [showQuickAddContact, setShowQuickAddContact] = useState(false);
  const [showMeetingHelpDialog, setShowMeetingHelpDialog] = useState(false);
  const [showSafetySummary, setShowSafetySummary] = useState(false);
  const [meetingEndedWith, setMeetingEndedWith] = useState(null); // Store who we met with for Safety Summary
  const [showContactNotifyModal, setShowContactNotifyModal] = useState(false);
  const [contactToNotify, setContactToNotify] = useState(null); // Contact pending confirmation

  // Poll dialog state
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Place invite dialog state
  const [showPlaceInviteDialog, setShowPlaceInviteDialog] = useState(false);
  const [placeInviteName, setPlaceInviteName] = useState('');
  const [placeInviteType, setPlaceInviteType] = useState('cafe');
  const [placeInviteDistance, setPlaceInviteDistance] = useState('0.5');
  const [placeInviteMessage, setPlaceInviteMessage] = useState('');
  const [placeInviteMaps, setPlaceInviteMaps] = useState('');

  // Save meeting contacts to localStorage
  useEffect(() => {
    localStorage.setItem(MEETING_CONTACTS_KEY, JSON.stringify(meetingContacts));
  }, [meetingContacts]);

  // Location tracking during meeting
  useEffect(() => {
    if (meetingState === MEETING_STATE.ACTIVE && locationSharing) {
      if (navigator.geolocation) {
        locationWatchRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setCurrentLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: Date.now(),
            });
          },
          (err) => console.warn('Location error:', err),
          { enableHighAccuracy: true, maximumAge: 10000 }
        );
      }
    }
    return () => {
      if (locationWatchRef.current) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
    };
  }, [meetingState, locationSharing]);

  // Sync local showMeetingScreen with global context
  useEffect(() => {
    if (globalMeeting.showMeetingScreen && globalMeeting.meetingState === GLOBAL_MEETING_STATE.ACTIVE) {
      // If global context says to show meeting screen and we're in the right chat
      // Compare matchId loosely (could be number or string)
      const globalMatchId = globalMeeting.meetingWith?.matchId;
      const chatMatchId = chat?.matchId;
      const isMatchingChat = chat && (
        globalMatchId === chatMatchId || 
        String(globalMatchId) === String(chatMatchId)
      );
      
      if (isMatchingChat) {
        console.log('[ChatScreen] Syncing meeting screen from global context');
        setShowMeetingScreen(true);
        setMeetingState(MEETING_STATE.ACTIVE);
        setMeetingWith(chat.user);
        if (!meetingStartTime) {
          setMeetingStartTime(globalMeeting.meetingStartTime || Date.now());
        }
      }
    }
  }, [globalMeeting.showMeetingScreen, globalMeeting.meetingState, globalMeeting.meetingWith, chat, meetingStartTime, globalMeeting.meetingStartTime]);

  // Also sync when chat loads and global meeting is active
  useEffect(() => {
    if (chat && globalMeeting.meetingState === GLOBAL_MEETING_STATE.ACTIVE && globalMeeting.showMeetingScreen) {
      const globalMatchId = globalMeeting.meetingWith?.matchId;
      const chatMatchId = chat.matchId;
      if (globalMatchId === chatMatchId || String(globalMatchId) === String(chatMatchId)) {
        console.log('[ChatScreen] Chat loaded, showing meeting screen');
        setShowMeetingScreen(true);
        setMeetingState(MEETING_STATE.ACTIVE);
        setMeetingWith(chat.user);
        if (!meetingStartTime) {
          setMeetingStartTime(globalMeeting.meetingStartTime || Date.now());
        }
      }
    }
  }, [chat, globalMeeting.showMeetingScreen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle showMeeting URL parameter from GlobalMeetingBar click
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('showMeeting') === 'true' && chat && globalMeeting.meetingState === GLOBAL_MEETING_STATE.ACTIVE) {
      const globalMatchId = globalMeeting.meetingWith?.matchId;
      const chatMatchId = chat.matchId;
      if (globalMatchId === chatMatchId || String(globalMatchId) === String(chatMatchId)) {
        console.log('[ChatScreen] URL param showMeeting=true, opening meeting screen');
        setShowMeetingScreen(true);
        setMeetingState(MEETING_STATE.ACTIVE);
        setMeetingWith(chat.user);
        setWaitingForMeetingScreen(false); // Meeting screen is now ready
        if (!meetingStartTime) {
          setMeetingStartTime(globalMeeting.meetingStartTime || Date.now());
        }
        // Clean up URL param
        navigate(`/chat/${chat.matchId}`, { replace: true });
      }
    }
  }, [location.search, chat, globalMeeting.meetingState, globalMeeting.meetingWith, globalMeeting.meetingStartTime, navigate]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Clear waiting state when chat opens (in case meeting screen doesn't load)
  useEffect(() => {
    if (openChat && waitingForMeetingScreen) {
      // Give a small delay to allow meeting screen to render first
      const timer = setTimeout(() => {
        setWaitingForMeetingScreen(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [openChat, waitingForMeetingScreen]);

  // Start Meeting handler
  const handleStartMeeting = useCallback(() => {
    if (!chat || chat.matchId === AGENT_ID) return;
    
    // Check if meeting contacts are set up
    if (meetingContacts.length === 0) {
      setShowContactsSetupModal(true);
      return;
    }
    
    // Atomic state update - Meeting starts immediately
    setMeetingState(MEETING_STATE.ACTIVE);
    setMeetingWith(chat.user);
    setMeetingStartTime(Date.now());
    setLocationSharing(true);
    setShowMeetingScreen(true);
    setContactsNotifiedThisMeeting([]);
    
    // Update global meeting context so bar shows on all pages
    globalMeeting.startMeeting({ ...chat.user, matchId: chat.matchId });
  }, [chat, meetingContacts, globalMeeting]);

  // Continue without contacts (WhatsApp only)
  const handleContinueWithoutContacts = useCallback(() => {
    if (!chat) return;
    setShowContactsSetupModal(false);
    setMeetingState(MEETING_STATE.ACTIVE);
    setMeetingWith(chat.user);
    setMeetingStartTime(Date.now());
    setLocationSharing(true);
    setShowMeetingScreen(true);
    setContactsNotifiedThisMeeting([]);
    
    // Update global meeting context
    globalMeeting.startMeeting({ ...chat.user, matchId: chat.matchId });
  }, [chat, globalMeeting]);

  // End Meeting handler
  const handleEndMeeting = useCallback(() => {
    // If SOS is active, show confirmation
    if (sosState !== SOS_STATE.NONE) {
      setShowEndMeetingConfirm(true);
      return;
    }
    
    // End meeting immediately
    performEndMeeting();
  }, [sosState]);

  const performEndMeeting = useCallback(() => {
    // Cancel any active SOS
    if (sosState !== SOS_STATE.NONE) {
      cancelSOS();
    }
    
    // Stop location sharing
    setLocationSharing(false);
    if (locationWatchRef.current) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    
    // Store who we met with for Safety Summary
    setMeetingEndedWith(meetingWith);
    
    // Reset meeting state
    setMeetingState(MEETING_STATE.INACTIVE);
    setMeetingWith(null);
    setMeetingStartTime(null);
    setShowMeetingScreen(false);
    setShowEndMeetingConfirm(false);
    setContactsNotifiedThisMeeting([]);
    setCurrentLocation(null);
    
    // End global meeting context
    globalMeeting.endMeeting();
    
    // Show Safety Summary (as per spec section 10)
    setShowSafetySummary(true);
  }, [sosState, meetingWith, globalMeeting]);

  // SOS Handlers - Per corrected spec:
  // - One helper only (first accept wins)
  // - Cancel SOS doesn't end Meeting
  // - Timeouts: 90s helper disappears without heartbeat → auto re-scan
  //            3min no progress (distance not decreasing) → auto re-scan
  const triggerSOS = useCallback(() => {
    if (meetingState !== MEETING_STATE.ACTIVE) return;
    
    const requestId = `sos_${Date.now()}`;
    setSosRequestId(requestId);
    setSosState(SOS_STATE.SEARCHING);
    setSosHelper(null);
    setSosHelperDistance(null);
    
    // Demo: find helper after 5s (in production this would be real helper matching)
    sosTimeoutRef.current = setTimeout(() => {
      simulateHelperFound();
    }, 5000);
  }, [meetingState]);

  const simulateHelperFound = useCallback(() => {
    setSosState(SOS_STATE.HELPER_FOUND);
    const helper = {
      id: 'helper_1',
      name: 'Sarah',
      distance: 0.8,
      eta: '3 min',
      lastHeartbeat: Date.now(),
    };
    setSosHelper(helper);
    setSosHelperDistance(0.8);
    
    // Per spec: Helper timeout - 90s without heartbeat/location → auto re-scan
    // Per spec: Progress timeout - 3min without distance decrease → auto re-scan
    // (In production, these would be real network checks)
    
    // Simulate helper approaching (with distance decreasing)
    setTimeout(() => {
      setSosState(SOS_STATE.HELPER_APPROACHING);
      setSosHelperDistance(0.4);
      setSosHelper(prev => prev ? { ...prev, lastHeartbeat: Date.now() } : null);
    }, 3000);
    
    // Simulate helper arrived
    setTimeout(() => {
      setSosState(SOS_STATE.HELPER_ARRIVED);
      setSosHelperDistance(0);
      setSosHelper(prev => prev ? { ...prev, lastHeartbeat: Date.now() } : null);
    }, 8000);
  }, []);

  const cancelSOS = useCallback(() => {
    if (sosTimeoutRef.current) {
      clearTimeout(sosTimeoutRef.current);
      sosTimeoutRef.current = null;
    }
    setSosState(SOS_STATE.NONE);
    setSosRequestId(null);
    setSosHelper(null);
    setSosHelperDistance(null);
  }, []);

  // Notify contact (in-app) - Show confirmation modal first (per spec section 5)
  const handleContactCircleClick = useCallback((contact) => {
    if (contactsNotifiedThisMeeting.includes(contact.id)) return;
    
    // Show confirmation modal with message preview and location notice
    setContactToNotify(contact);
    setShowContactNotifyModal(true);
  }, [contactsNotifiedThisMeeting]);

  // State for contact notification success message
  const [contactNotifySuccess, setContactNotifySuccess] = useState(null);

  // Confirm and send notification to contact
  const confirmNotifyContact = useCallback(() => {
    if (!contactToNotify) return;
    
    // Mark as notified
    setContactsNotifiedThisMeeting(prev => [...prev, contactToNotify.id]);
    
    // In real app: send notification with location
    console.log(`Notifying ${contactToNotify.name} with location:`, currentLocation);
    
    // Close modal and show success message
    setShowContactNotifyModal(false);
    setContactNotifySuccess(`Update sent to ${contactToNotify.name}. Your location is now shared.`);
    setContactToNotify(null);
    
    // Auto-clear success message after 4s
    setTimeout(() => setContactNotifySuccess(null), 4000);
  }, [contactToNotify, currentLocation]);

  // Share via WhatsApp
  const shareViaWhatsApp = useCallback(() => {
    const meetingPersonName = meetingWith?.name || 'someone';
    const locationUrl = currentLocation 
      ? `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`
      : '';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const message = `Hey! 👋
I'm heading out to meet ${meetingPersonName} from Pulse.

📍 Location: ${locationUrl || 'Not available yet'}
🕐 Time: ${timeStr}
📅 Date: ${dateStr}

If you don't hear from me within 2 hours, please reach out! 💜`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, [currentLocation, meetingWith]);

  const handleOwnStoryClick = () => fileInputRef.current?.click();
  const handleOwnPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setOwn24hPhoto(reader.result);
    reader.readAsDataURL(file);
  };
  const handleUserStoryClick = (matchId) => {
    const c = chats.find((x) => x.matchId === matchId);
    if (c?.user24hPhoto)
      setViewStory({ open: true, photo: c.user24hPhoto, user: c.user });
  };

  // compose
  const [input, setInput] = useState("");
  const [replyDraft, setReplyDraft] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  // menus
  const [menuEl, setMenuEl] = useState(null);

  // attach menu
  const [attachMenu, setAttachMenu] = useState(null);
  const imageInputRef = useRef(null);
  const fileAttachInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [toolIndex, setToolIndex] = useState(1); // 0=AI, 1=emoji, 2=camera
  const getToolColor = (i) => (i === 0 ? "#4B3DB6" : i === 1 ? "#B45309" : "#BE185D");
  const getToolBg = (i) =>
    i === 0
      ? "rgba(108, 92, 231, 0.14)"
      : i === 1
        ? "rgba(245, 158, 11, 0.14)"
        : "rgba(236, 72, 153, 0.14)";
  const getToolBorder = (i) =>
    i === 0
      ? "rgba(108, 92, 231, 0.18)"
      : i === 1
        ? "rgba(245, 158, 11, 0.22)"
        : "rgba(236, 72, 153, 0.22)";
  const getToolBgHover = (i) =>
    i === 0
      ? "rgba(108, 92, 231, 0.18)"
      : i === 1
        ? "rgba(245, 158, 11, 0.18)"
        : "rgba(236, 72, 153, 0.18)";

  // reactions popper
  const reactPop = useReactionPopper();

  // message actions menu
  const [msgMenu, setMsgMenu] = useState({
    open: false,
    anchorEl: null,
    msgId: null,
  });
  const openMsgActions = (anchorEl, msgId) =>
    setMsgMenu({ open: true, anchorEl, msgId });
  const closeMsgActions = () =>
    setMsgMenu({ open: false, anchorEl: null, msgId: null });

  // emoji bottom sheet
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiMode, setEmojiMode] = useState("compose"); // "compose" | "react"
  const [emojiTargetMsg, setEmojiTargetMsg] = useState(null);

  // search in chat
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const matches = useMemo(
    () =>
      searchQ
        ? chat?.messages
            ?.filter((m) =>
              (m.text || "").toLowerCase().includes(searchQ.toLowerCase())
            )
            .map((m) => m.id) || []
        : [],
    [searchQ, chat]
  );
  
  // Navigate to search result
  const navigateToSearchResult = useCallback((index) => {
    if (matches.length === 0) return;
    const safeIndex = Math.max(0, Math.min(index, matches.length - 1));
    setSearchIndex(safeIndex);
    const msgId = matches[safeIndex];
    const msgElement = document.getElementById(`msg-${msgId}`);
    if (msgElement) {
      msgElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight effect
      msgElement.style.transition = 'background-color 0.3s';
      msgElement.style.backgroundColor = 'rgba(108, 92, 231, 0.3)';
      setTimeout(() => {
        msgElement.style.backgroundColor = '';
      }, 1500);
    }
  }, [matches]);
  
  // Auto-navigate when search query changes
  useEffect(() => {
    if (matches.length > 0 && searchQ) {
      setSearchIndex(0);
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const msgId = matches[0];
        const msgElement = document.getElementById(`msg-${msgId}`);
        if (msgElement) {
          msgElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          msgElement.style.transition = 'background-color 0.3s';
          msgElement.style.backgroundColor = 'rgba(108, 92, 231, 0.3)';
          setTimeout(() => {
            msgElement.style.backgroundColor = '';
          }, 1500);
        }
      }, 100);
    }
  }, [matches.length, searchQ]);

  // typing / recording indicators
  const [typing, setTyping] = useState(false);
  const [theirRecording, setTheirRecording] = useState(false);

  // calls
  const [call, setCall] = useState(null);
  const startCall = (type) => setCall({ type, with: chat?.user });
  const endCall = () => setCall(null);

  // gallery
  const [gallery, setGallery] = useState({ open: false, images: [] });
  
  // report user popup
  const [reportPopup, setReportPopup] = useState({ open: false, reason: '', details: '' });
  const openGallery = () =>
    setGallery({
      open: true,
      images:
        chat?.messages.filter((m) => m.type === "image").map((m) => m.imageUrl) ||
        [],
    });

  // smart replies בסיסיות
  const [smart, setSmart] = useState([]);
  useEffect(() => {
    const last = chat?.messages.slice(-1)[0];
    if (!last || last.from !== "them") return setSmart([]);
    const txt = (last.text || "").toLowerCase();
    const base = [];
    if (/coffee|drink|beer/.test(txt))
      base.push("Sounds great ☕️", "Where were you thinking?");
    if (/hey|hi|hello/.test(txt)) base.push("Hey! how’s your day going?", "Hi! 😊");
    base.push("Tell me more!", "Love that");
    setSmart(base.slice(0, 3));
  }, [chat?.messages?.length]);

  // scrolling / footer height
  const scrollRef = useRef(null);
  const footerRef = useRef(null);
  const [footerH, setFooterH] = useState(56);
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    setFooterH(Math.ceil(el.getBoundingClientRect().height));
    const ro = new ResizeObserver(([e]) =>
      setFooterH(Math.ceil(e.contentRect.height))
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [openChat]);
  const scrollToBottom = (behavior = "auto") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };
  
  // Check if user is near bottom (within 150px)
  const isNearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  };
  
  // Track if user scrolled up
  const [showNewMsgIndicator, setShowNewMsgIndicator] = useState(false);
  const prevMsgCount = useRef(chat?.messages?.length || 0);
  const initialScrollDoneRef = useRef(false);
  const initialScrollFooterHRef = useRef(0);
  const openChatAtRef = useRef(0);
  
  // Scroll to bottom when opening chat - with delay to ensure DOM is ready
  useEffect(() => {
    if (openChat) {
      setShowNewMsgIndicator(false);
      initialScrollDoneRef.current = false;
      initialScrollFooterHRef.current = 0;
      openChatAtRef.current = Date.now();
    }
  }, [openChat]);
  
  useEffect(() => {
    if (!openChat) return;
    const count = chat?.messages?.length || 0;
    if (!count) return;
    if (!footerH) return;

    const withinInitialWindow = Date.now() - openChatAtRef.current < 900;
    const footerChangedSinceInitial =
      initialScrollFooterHRef.current && initialScrollFooterHRef.current !== footerH;
    const shouldRescrollForFooterChange = withinInitialWindow && footerChangedSinceInitial;

    if (initialScrollDoneRef.current && !shouldRescrollForFooterChange) return;
    setShowNewMsgIndicator(false);
    requestAnimationFrame(() => {
      scrollToBottom("auto");
      requestAnimationFrame(() => scrollToBottom("auto"));
      setTimeout(() => scrollToBottom("auto"), 80);
    });
    initialScrollDoneRef.current = true;
    initialScrollFooterHRef.current = footerH;
  }, [openChat, chat?.messages?.length, footerH]);
  
  // Smart scroll: only auto-scroll if user is near bottom
  useEffect(() => {
    if (!openChat) return;
    const newCount = chat?.messages?.length || 0;
    if (newCount > prevMsgCount.current) {
      if (isNearBottom()) {
        scrollToBottom("smooth");
      } else {
        // User scrolled up, show indicator
        setShowNewMsgIndicator(true);
      }
    }
    prevMsgCount.current = newCount;
  }, [chat?.messages?.length, openChat]);
  
  // Hide indicator when user scrolls to bottom
  const handleScroll = useCallback(() => {
    if (isNearBottom()) {
      setShowNewMsgIndicator(false);
    }
  }, []);

  /* -------- Message mutations helpers -------- */
  const updateMessageById = (id, patch) =>
    setChats((prev) =>
      prev.map((c) =>
        c.matchId !== openChat
          ? c
          : {
              ...c,
              messages: c.messages.map((m) =>
                m.id === id
                  ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) }
                  : m
              ),
            }
      )
    );

  const pushMessage = (text, extra = {}) => {
    const id = Date.now();
    setChats((prev) =>
      prev.map((c) =>
        c.matchId !== openChat
          ? c
          : {
              ...c,
              messages: [
                ...c.messages,
                {
                  id,
                  from: "me",
                  type: "text",
                  text,
                  timestamp: Date.now(),
                  status: "sent",
                  reactions: {},
                  ...extra,
                },
              ],
              lastSentAt: Date.now(),
            }
      )
    );
    const disappearAfterMs = (chat?.disappearingSeconds ?? DEFAULT_DISAPPEARING_SECONDS) * 1000;
    const update = (patch) => updateMessageById(id, patch);
    scheduleDeliveryFlow(update, disappearAfterMs);
    if (navigator?.vibrate) navigator.vibrate(8);
    return id;
  };

  const toggleHeart = (msgId) => {
    setChats((prev) =>
      prev.map((c) =>
        c.matchId !== openChat
          ? c
          : {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id !== msgId) return m;
                const r = { ...(m.reactions || {}) };
                r["❤️"] = (r["❤️"] || 0) ? 0 : 1;
                return { ...m, reactions: r };
              }),
            }
      )
    );
  };
  const addReaction = (msgId, emo) => {
    setChats((prev) =>
      prev.map((c) =>
        c.matchId !== openChat
          ? c
          : {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id !== msgId) return m;
                const r = { ...(m.reactions || {}) };
                r[emo] = (r[emo] || 0) + 1;
                return { ...m, reactions: r };
              }),
            }
      )
    );
  };

  const deleteForEveryone = (id) =>
    updateMessageById(id, {
      type: "deleted",
      text: "This message was deleted",
      audioUrl: null,
    });

  // media / files / location / contact / poll / place invite
  const sendImage = (file) => {
    const id = Date.now();
    const url = URL.createObjectURL(file);
    setChats((prev) =>
      prev.map((c) =>
        c.matchId !== openChat
          ? c
          : {
              ...c,
              messages: [
                ...c.messages,
                {
                  id,
                  from: "me",
                  type: "image",
                  imageUrl: url,
                  text: "",
                  timestamp: Date.now(),
                  status: "sent",
                  reactions: {},
                },
              ],
              lastSentAt: Date.now(),
            }
      )
    );
    const disappearAfterMs = (chat?.disappearingSeconds ?? DEFAULT_DISAPPEARING_SECONDS) * 1000;
    const update = (patch) => updateMessageById(id, patch);
    scheduleDeliveryFlow(update, disappearAfterMs);
  };
  const sendFile = (file) => pushMessage(`[file] ${file.name}`);
  const shareLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const id = Date.now();
        setChats((prev) =>
          prev.map((c) =>
            c.matchId !== openChat
              ? c
              : {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      id,
                      from: "me",
                      type: "location",
                      location: {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                      },
                      timestamp: Date.now(),
                      status: "sent",
                      reactions: {},
                    },
                  ],
                  lastSentAt: Date.now(),
                }
          )
        );
        const disappearAfterMs = (chat?.disappearingSeconds ?? DEFAULT_DISAPPEARING_SECONDS) * 1000;
        const update = (patch) => updateMessageById(id, patch);
        scheduleDeliveryFlow(update, disappearAfterMs);
      },
      () => alert("Location permission denied")
    );
  };
  const shareContact = async () => {
    const name = prompt("Contact name");
    if (!name) return;
    const phone = prompt("Phone");
    if (!phone) return;
    pushMessage("", {
      type: "contact",
      contact: { name, phone },
    });
  };
  // Open Poll dialog
  const openPollDialog = () => {
    setPollQuestion('');
    setPollOptions(['', '']);
    setShowPollDialog(true);
  };

  // Submit Poll
  const submitPoll = () => {
    const q = pollQuestion.trim();
    if (!q) return;
    const opts = pollOptions.map(s => s.trim()).filter(Boolean);
    if (opts.length < 2) return;
    
    const id = Date.now();
    setChats((prev) =>
      prev.map((c) =>
        c.matchId !== openChat
          ? c
          : {
              ...c,
              messages: [
                ...c.messages,
                {
                  id,
                  from: "me",
                  type: "poll",
                  poll: { question: q, options: opts },
                  timestamp: Date.now(),
                  status: "sent",
                  reactions: {},
                },
              ],
              lastSentAt: Date.now(),
            }
      )
    );
    updateMessageById(id, {
      onVote: (i) =>
        updateMessageById(id, (m) => ({
          poll: { ...m.poll, voted: i, votes: (m.poll?.votes || 0) + 1 },
        })),
    });
    const disappearAfterMs = (chat?.disappearingSeconds ?? DEFAULT_DISAPPEARING_SECONDS) * 1000;
    const update = (patch) => updateMessageById(id, patch);
    scheduleDeliveryFlow(update, disappearAfterMs);
    setShowPollDialog(false);
  };

  // Open Place Invite dialog
  const openPlaceInviteDialog = () => {
    setPlaceInviteName('');
    setPlaceInviteType('cafe');
    setPlaceInviteDistance('0.5');
    setPlaceInviteMessage('');
    setPlaceInviteMaps('');
    setShowPlaceInviteDialog(true);
  };

  // Submit Place Invite
  const submitPlaceInvite = () => {
    const name = placeInviteName.trim();
    if (!name) return;
    
    const id = Date.now();
    setChats((prev) =>
      prev.map((c) =>
        c.matchId !== openChat
          ? c
          : {
              ...c,
              messages: [
                ...c.messages,
                {
                  id,
                  from: "me",
                  type: "place_invite",
                  text: placeInviteMessage.trim(),
                  place: { 
                    name, 
                    type: placeInviteType, 
                    distance: Number(placeInviteDistance) || 0.5, 
                    maps: placeInviteMaps.trim() 
                  },
                  timestamp: Date.now(),
                  status: "sent",
                  reactions: {},
                },
              ],
              lastSentAt: Date.now(),
            }
      )
    );
    const disappearAfterMs = (chat?.disappearingSeconds ?? DEFAULT_DISAPPEARING_SECONDS) * 1000;
    const update = (patch) => updateMessageById(id, patch);
    scheduleDeliveryFlow(update, disappearAfterMs);
    setShowPlaceInviteDialog(false);
  };

  /* ================== AI: state & prefs ================== */
  const [aiAnchor, setAiAnchor] = useState(null);
  const [aiTone, setAiTone] = useState("friendly");
  const [aiLen, setAiLen] = useState("short");
  const [aiIntent, setAiIntent] = useState("open");
  const [aiActiveGroup, setAiActiveGroup] = useState(null);
  const [aiShowOptions, setAiShowOptions] = useState(false);

  useEffect(() => {
    if (aiAnchor) return;
    setAiActiveGroup(null);
    setAiShowOptions(false);
  }, [aiAnchor]);
  const [aiRemember, setAiRemember] = useState(false);
  const [aiOptions, setAiOptions] = useState([]);

  useEffect(() => {
    if (!chat?.matchId) return;
    const t = localStorage.getItem(`ai_tone_${chat.matchId}`) || localStorage.getItem("ai_tone") || "friendly";
    const l = localStorage.getItem(`ai_len_${chat.matchId}`) || localStorage.getItem("ai_len") || "short";
    const i = localStorage.getItem(`ai_intent_${chat.matchId}`) || localStorage.getItem("ai_intent") || "open";
    setAiTone(t); setAiLen(l); setAiIntent(i);
    setAiRemember(Boolean(localStorage.getItem(`ai_tone_${chat.matchId}`) || localStorage.getItem(`ai_len_${chat.matchId}`) || localStorage.getItem(`ai_intent_${chat.matchId}`)));
  }, [chat?.matchId]);

  const [agentTraceId, setAgentTraceId] = useState(null);
  const typingTimerRef = useRef(null);

  const computeAI = useCallback(async (triggerType = "button_click") => {
    if (!chat) return;
    if (chat.matchId === AGENT_ID) return; // Agent chat has its own system

    try {
      const out = await fetchAgentSuggestions({
        chat,
        triggerType,
        currentDraft: input,
      });

      if (out.action === "abstain") {
        setAiOptions([]);
        setAgentTraceId(null);
        return;
      }

      setAgentTraceId(out?.meta?.decision_trace_id || null);
      setAiOptions(
        (out.suggestions || []).map((s) => s.text)
      );
    } catch (e) {
      console.warn("Agent API failed, falling back to local:", e);
      // Fallback to local suggestions
      const knowns = (() => {
        try {
          const mm = JSON.parse(localStorage.getItem("matches_demo") || "[]");
          const ll = JSON.parse(localStorage.getItem("likes_demo") || "[]");
          const hit = [...mm, ...ll].find(
            (x) => x.id === chat?.matchId || x.name === chat?.user?.name
          );
          return hit || {};
        } catch {
          return {};
        }
      })();

      const toName = knowns?.name || chat?.user?.name || "there";
      const interests = knowns?.interests || [];
      const last = chat?.messages?.slice(-1)[0];
      const lastThem = last?.from === "them" ? (last.text || "") : "";
      const list = buildAISuggestions({
        toName,
        interests,
        lastThem,
        tone: aiTone,
        length: aiLen,
        intent: aiIntent,
      });
      setAiOptions(list);
      setAgentTraceId(null);
    }
  }, [chat, input, aiTone, aiLen, aiIntent]);

  // Track if user just sent a message (to calm down Agent)
  const [userJustSent, setUserJustSent] = useState(false);
  const lastThemMsgRef = useRef(null);

  // Detect new incoming message
  useEffect(() => {
    if (!chat?.messages?.length) return;
    const lastMsg = chat.messages[chat.messages.length - 1];
    if (lastMsg?.from === "them" && lastMsg.id !== lastThemMsgRef.current) {
      lastThemMsgRef.current = lastMsg.id;
      setUserJustSent(false); // Reset - new message from them, Agent can suggest again
    }
  }, [chat?.messages]);

  // Debounce: fetch suggestions on typing pause (850ms)
  // Only if: there's a recent message from "them" AND user hasn't just sent their own message
  useEffect(() => {
    if (!chat) return;
    if (!input?.trim()) return;
    if (chat.matchId === AGENT_ID) return; // Agent chat has its own system
    if (userJustSent) return; // Agent calms down after user sends

    // Check if there's a recent message from them to respond to
    const lastMsg = chat.messages?.[chat.messages.length - 1];
    const hasRecentThemMessage = lastMsg?.from === "them";
    if (!hasRecentThemMessage) return; // Only suggest after incoming message

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      computeAI("typing_pause");
    }, 850);

    return () => clearTimeout(typingTimerRef.current);
  }, [input, chat?.matchId, chat?.messages?.length, userJustSent]);

  const persistIfNeeded = useCallback(
    (tone, len, intent) => {
      if (!chat?.matchId) return;
      if (aiRemember) {
        if (tone) localStorage.setItem(`ai_tone_${chat.matchId}`, tone);
        if (len) localStorage.setItem(`ai_len_${chat.matchId}`, len);
        if (intent) localStorage.setItem(`ai_intent_${chat.matchId}`, intent);
      } else {
        if (tone) localStorage.setItem("ai_tone", tone);
        if (len) localStorage.setItem("ai_len", len);
        if (intent) localStorage.setItem("ai_intent", intent);
      }
    },
    [aiRemember, chat?.matchId]
  );

  /* ======= Agent state ======= */
  const isAgentChat = chat?.matchId === AGENT_ID;
  const [showCrisis, setShowCrisis] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  
  // Agent mode per chat: "auto" | "coach" | "therapist"
  const [agentModes, setAgentModes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agent_modes") || "{}");
    } catch { return {}; }
  });
  
  const getAgentMode = (chatId) => agentModes[chatId] || "auto";
  const setAgentMode = (chatId, mode) => {
    const updated = { ...agentModes, [chatId]: mode };
    setAgentModes(updated);
    localStorage.setItem("agent_modes", JSON.stringify(updated));
  };

  // Call unified Agent API with new contract
  const callAgentAPI = async (userMessage, trigger = "after_incoming_message") => {
    try {
      const messages = (chat?.messages || []).slice(-30).map(m => ({
        id: m.id,
        from: m.from,
        text: m.text || "",
        ts: m.timestamp || Date.now(),
      }));
      // Add the new message
      messages.push({ id: Date.now(), from: "me", text: userMessage, ts: Date.now() });

      const mode = getAgentMode(chat?.matchId); // Get saved mode for this chat

      const res = await fetch(`${AGENT_URL}/agent/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "me",
          chat_id: String(chat?.matchId),
          trigger,
          mode, // "auto" | "coach" | "therapist"
          draft_text: userMessage,
          messages,
        }),
      });
      
      if (!res.ok) throw new Error("agent_failed");
      return await res.json();
    } catch (e) {
      console.warn("Agent API failed:", e);
      return null;
    }
  };

  /* ======= SEND ======= */
  const handleSend = () => {
    if (input.startsWith("/")) {
      const cmd = input.trim();
      if (cmd === "/greet") {
        setInput("Hey! 😊"); return;
      }
      if (cmd === "/shrug") {
        setInput("¯\\_(ツ)_/¯"); return;
      }
      if (cmd.startsWith("/me ")) {
        setInput(`*${cmd.slice(4)}*`); return;
      }
    }
    if (!input.trim() && !editDraft) return;

    if (editDraft) {
      updateMessageById(editDraft.id, { text: input.trim(), edited: true });
      setEditDraft(null);
      setInput("");
      return;
    }

    const extra = replyDraft ? { replyTo: { ...replyDraft } } : {};
    const userMessage = input.trim();
    const sentId = pushMessage(userMessage, extra);
    
    // Agent calms down after user sends their own message
    setUserJustSent(true);
    setAiOptions([]); // Clear suggestions after sending

    // Unified Agent response (handles both therapist and coach modes)
    console.log("[DEBUG] handleSend - isAgentChat:", isAgentChat, "matchId:", chat?.matchId, "AGENT_ID:", AGENT_ID);
    if (isAgentChat) {
      console.log("[DEBUG] Calling callAgentAPI...");
      // Call unified Agent API with new contract
      callAgentAPI(userMessage, "after_incoming_message").then((res) => {
        console.log("[DEBUG] callAgentAPI response:", res);
        if (!res) return;
        
        // Handle crisis flag - show banner
        if (res.crisis_flag) {
          setShowCrisis(true);
        }
        
        // Handle no_op - no response needed
        if (res.decision === "no_op") {
          return;
        }
        
        let responseText;
        const payload = res.payload || {};
        
        if (res.mode_used === "therapist" && payload.reply_text) {
          // Therapist mode - empathetic reply
          responseText = payload.reply_text;
        } else if (res.decision === "suggest" && payload.suggestions?.length > 0) {
          // Coach mode - format suggestions
          const sug = payload.suggestions;
          responseText = "Here are some ideas:\n\n" + 
            sug.map((s, i) => `${i + 1}️⃣ "${s.text}"`).join("\n\n") +
            "\n\n💡 Click Regenerate for more options";
        } else {
          // Fallback
          responseText = "I'm here to help. Tell me more about what's going on?";
        }

        setChats((prev) =>
          prev.map((c) =>
            c.matchId !== AGENT_ID
              ? c
              : {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      id: Date.now() + 1,
                      from: "them",
                      type: "text",
                      text: responseText,
                      timestamp: Date.now(),
                      status: "read",
                      reactions: {},
                      agentMode: res.mode_used,
                      agentState: res.state,
                    },
                  ],
                  lastSentAt: Date.now(),
                }
          )
        );
      });
    }

    setReplyDraft(null);
    setInput("");
  };

  /* -------- Recording (press & hold) -------- */
  const [recActive, setRecActive] = useState(false);
  const [recMs, setRecMs] = useState(0);
  const mrRef = useRef(null);
  const chunksRef = useRef([]);
  const recTimerRef = useRef(null);
  const streamRef = useRef(null);

  const pendingSendRef = useRef(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      pendingSendRef.current = false;
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        // Only create and send blob if pendingSend is true (not cancelled)
        if (pendingSendRef.current && chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mime });
          const url = URL.createObjectURL(blob);
          sendVoiceMessage(url);
        }
        chunksRef.current = [];
        pendingSendRef.current = false;
      };
      mr.start();
      mrRef.current = mr;
      setRecActive(true);
      setRecMs(0);
      recTimerRef.current = setInterval(() => setRecMs((v) => v + 100), 100);
      setTheirRecording(true); // סימולציה
      setTimeout(() => setTheirRecording(false), 2000);
    } catch {
      alert("Microphone permission required");
    }
  };

  const cancelRecording = () => {
    clearInterval(recTimerRef.current);
    setRecActive(false);
    setRecMs(0);
    pendingSendRef.current = false;
    try {
      if (mrRef.current && mrRef.current.state !== "inactive") mrRef.current.stop();
    } catch {}
    mrRef.current = null;
  };

  // Helper to actually send the voice message (called from onstop)
  const sendVoiceMessage = (audioUrl) => {
    const durationMs = recMs;
    const id = Date.now();
    setChats((prev) =>
      prev.map((c) =>
        c.matchId !== openChat
          ? c
          : {
              ...c,
              messages: [
                ...c.messages,
                {
                  id,
                  from: "me",
                  type: "voice",
                  audioUrl,
                  durationMs,
                  timestamp: Date.now(),
                  status: "sent",
                  reactions: {},
                },
              ],
              lastSentAt: Date.now(),
            }
      )
    );
    const disappearAfterMs = (chat?.disappearingSeconds ?? DEFAULT_DISAPPEARING_SECONDS) * 1000;
    const update = (patch) => updateMessageById(id, patch);
    scheduleDeliveryFlow(update, disappearAfterMs);
    setRecMs(0);
  };

  const stopAndSendRecording = () => {
    clearInterval(recTimerRef.current);
    setRecActive(false);
    pendingSendRef.current = true; // Signal onstop to send the message
    try {
      if (mrRef.current && mrRef.current.state !== "inactive") mrRef.current.stop();
    } catch {}
    mrRef.current = null;
  };

  /* ================== LIST VIEW ================== */
  // If waiting for meeting screen to load from URL param, show blank screen
  if (waitingForMeetingScreen && !openChat) {
    return (
      <Box sx={{ 
        height: "calc(100vh - 56px)", 
        bgcolor: "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Loading state while waiting for chat to open */}
      </Box>
    );
  }
  
  if (!openChat) {
    return (
      <Box 
        sx={{ 
          height: "calc(100vh - 56px)",
          bgcolor: "#fff",
          position: "relative",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          /* Hide scrollbar but allow scrolling */
          scrollbarWidth: "none", /* Firefox */
          msOverflowStyle: "none", /* IE/Edge */
          "&::-webkit-scrollbar": { display: "none" }, /* Chrome/Safari */
        }}
      >
        {/* Meeting bar is now global - rendered in GlobalMeetingBar component */}

        {/* Header - Fixed at top */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #eee",
            bgcolor: "#fff",
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {t('chats')}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            {t('startConversation')}
          </Typography>
          
          {/* Pulse spec: Sort tabs - Purple style like date pill */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            <Chip 
              label={t('online')} 
              onClick={() => setChatListSort('active')}
              sx={{ 
                fontWeight: '600 !important',
                bgcolor: chatListSort === 'active' ? 'rgba(108, 92, 231, 0.14) !important' : 'rgba(108, 92, 231, 0.08) !important',
                color: '#4B3DB6 !important',
                border: chatListSort === 'active' ? '1.5px solid rgba(108, 92, 231, 0.4) !important' : '1px solid rgba(108, 92, 231, 0.18) !important',
                '&:hover': { bgcolor: 'rgba(108, 92, 231, 0.18) !important' },
              }}
            />
            <Chip 
              label={t('newMatch')} 
              onClick={() => setChatListSort('new')}
              sx={{ 
                fontWeight: '600 !important',
                bgcolor: chatListSort === 'new' ? 'rgba(108, 92, 231, 0.14) !important' : 'rgba(108, 92, 231, 0.08) !important',
                color: '#4B3DB6 !important',
                border: chatListSort === 'new' ? '1.5px solid rgba(108, 92, 231, 0.4) !important' : '1px solid rgba(108, 92, 231, 0.18) !important',
                '&:hover': { bgcolor: 'rgba(108, 92, 231, 0.18) !important' },
              }}
            />
          </Box>
        </Box>

        {/* Chat List (כולל כפתורי “בקש AI” ו“תמיכה”) */}
        <Box sx={{ pt: 1, flex: 1, overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", "&::-webkit-scrollbar": { display: "none" } }}>
          {sortedChats.map((c) => (
            <Box
              key={c.matchId}
              sx={{
                position: "relative",
                overflow: "hidden",
                "&:hover .row-actions": { opacity: 1, transform: "translateX(0)" },
              }}
            >
              {/* פעולה מהירה: AI Coach + Support */}
              <Box
                className="row-actions"
                sx={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translate(16px, -50%)",
                  transition: "all .2s",
                  display: "flex",
                  gap: 0.5,
                  zIndex: 1,
                  opacity: 0,
                }}
              >
                {/* Ask AI */}
                <Tooltip title="Ask AI for suggestions">
                  <IconButton
                    aria-label="Ask AI"
                    onClick={(e) => {
                      e.stopPropagation();
                      openChatWithNav(AI_ADVISOR_ROW.matchId);
                      setTimeout(() => {
                        const id = Date.now();
                        const mention = `${c.user.name}${c.user.age ? ` (${c.user.age})` : ""}`;
                        const ctx = `User asked: Tips for chatting with ${mention}.`;
                        setChats((prev) =>
                          prev.map((row) =>
                            row.matchId === AI_ADVISOR_ROW.matchId
                              ? {
                                  ...row,
                                  messages: [
                                    ...row.messages,
                                    {
                                      id,
                                      from: "me",
                                      type: "text",
                                      text: ctx,
                                      timestamp: Date.now(),
                                      status: "sent",
                                      reactions: {},
                                    },
                                  ],
                                  lastSentAt: Date.now(),
                                }
                              : row
                          )
                        );
                      }, 0);
                    }}
                    size="small"
                    sx={{ bgcolor: "#EEF2FF" }}
                  >
                    <Stars size={18} />
                  </IconButton>
                </Tooltip>

                {/* Support / Therapist */}
                <Tooltip title="Open supportive chat">
                  <IconButton
                    aria-label="Support chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      openChatWithNav(THERAPIST_ID);
                      setTimeout(() => {
                        const id = Date.now();
                        const msg = `Sometimes I feel anxious when chatting with ${c.user.name}. Can we figure out a tiny step that would help?`;
                        setChats((prev) =>
                          prev.map((row) =>
                            row.matchId === THERAPIST_ID
                              ? {
                                  ...row,
                                  messages: [
                                    ...row.messages,
                                    {
                                      id,
                                      from: "me",
                                      type: "text",
                                      text: msg,
                                      timestamp: Date.now(),
                                      status: "sent",
                                      reactions: {},
                                    },
                                  ],
                                  lastSentAt: Date.now(),
                                }
                              : row
                          )
                        );
                      }, 0);
                    }}
                    size="small"
                    sx={{ bgcolor: "#EAFBF3" }}
                  >
                    <HeartHandshake size={18} />
                  </IconButton>
                </Tooltip>

                {/* Pin/Mute */}
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChats((p) =>
                      p.map((x) =>
                        x.matchId === c.matchId ? { ...x, pinned: !x.pinned } : x
                      )
                    );
                  }}
                >
                  {c.pinned ? "Unpin" : "Pin"}
                </Button>
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChats((p) =>
                      p.map((x) =>
                        x.matchId === c.matchId ? { ...x, muted: !x.muted } : x
                      )
                    );
                  }}
                >
                  {c.muted ? "Unmute" : "Mute"}
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 2,
                  py: 1.25,
                  borderBottom: "1px solid #f1f1f1",
                  cursor: "pointer",
                  bgcolor: "#fff",
                  "&:hover": { bgcolor: "#fafafa" },
                }}
                onClick={() => openChatWithNav(c.matchId)}
                role="button"
                aria-label={`Open chat with ${c.user.name}`}
              >
                <Avatar
                  src={c.user.photoUrl}
                  onClick={(e) => {
                    e.stopPropagation();
                    c.user24hPhoto ? handleUserStoryClick(c.matchId) : openChatWithNav(c.matchId);
                  }}
                  sx={{
                    width: 48,
                    height: 48,
                    border:
                      c.matchId === THERAPIST_ID
                        ? "2.5px solid #0ea5e9"
                        : c.matchId === -999
                        ? "2.5px solid #6D28D9"
                        : c.user24hPhoto
                        ? "2.5px solid #d72660"
                        : "2.5px solid #222",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    transition: "border 0.2s, box-shadow 0.3s",
                    boxShadow: c.user24hPhoto ? "0 0 0 0 rgba(215,38,96,0.45)" : "none",
                    "&:hover": {
                      boxShadow: c.user24hPhoto ? "0 0 0 6px rgba(215,38,96,0.15)" : "none",
                    },
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography noWrap sx={{ fontWeight: 700 }}>
                      {c.user.name}{c.user.age ? `, ${c.user.age}` : ""}
                    </Typography>
                    {c.pinned && <span style={{ fontSize: 12 }}>📌</span>}
                    {c.muted && <span style={{ fontSize: 12 }}>🔕</span>}
                    {/* Pulse spec: Connection source badge - Purple style */}
                    {c.connectionSource && (
                      <Chip
                        size="small"
                        label={c.connectionSource === CONNECTION_SOURCE.EVENT ? (c.eventName || 'Event') : c.connectionSource}
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          bgcolor: 'rgba(108, 92, 231, 0.14) !important',
                          color: '#4B3DB6 !important',
                          border: '1px solid rgba(108, 92, 231, 0.18) !important',
                          '& .MuiChip-label': {
                            color: '#4B3DB6 !important',
                          },
                        }}
                      />
                    )}
                  </Box>
                  <Typography noWrap variant="body2" sx={{ color: "#6B7280" }}>
                    {c.messages.length
                      ? c.messages[c.messages.length - 1].text || "[media]"
                      : c.matchId === -999
                      ? "היועץ שלך לשיחה חכמה ומהירה"
                      : c.matchId === THERAPIST_ID
                      ? "Supportive, non-clinical chat"
                      : "No messages yet"}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                    {c.lastSentAt ? fmtHM(c.lastSentAt) : ""}
                  </Typography>
                  {/* Pulse spec: Unread indicator */}
                  {c.unreadCount > 0 && (
                    <Box sx={{
                      bgcolor: '#6C5CE7',
                      color: '#fff',
                      borderRadius: '50%',
                      minWidth: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}>
                      {c.unreadCount}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Stories Modal */}
        <Modal
          open={viewStory.open}
          onClose={() => setViewStory({ open: false, photo: null, user: null })}
        >
          <Fade in={viewStory.open}>
            <Box
              sx={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: 3,
                p: 2,
                minWidth: 260,
                textAlign: "center",
              }}
            >
              {viewStory.photo && (
                <img
                  src={viewStory.photo}
                  alt="24h Story"
                  style={{
                    maxWidth: 340,
                    maxHeight: 420,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                />
              )}
              <Typography variant="h6" sx={{ mb: 1 }}>
                {viewStory.user?.name}'s Story
              </Typography>
              <Button
                variant="contained"
                onClick={() =>
                  setViewStory({ open: false, photo: null, user: null })
                }
              >
                {t('close')}
              </Button>
            </Box>
          </Fade>
        </Modal>

        {/* Points Promo Sticky Banner */}
        <ChatPointsStickyBanner />
      </Box>
    );
  }

  /* ================== CHAT VIEW ================== */
  const presenceLabel =
    chat.status === "active" ? "online" : `last seen ${fmtHM(chat.lastSentAt)}`;
  const doodleBg = `url("data:image/svg+xml,%3Csvg width='180' height='180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23EDEDED'%3E%3Ccircle cx='10' cy='10' r='1.2'/%3E%3Ccircle cx='90' cy='30' r='1.2'/%3E%3Ccircle cx='160' cy='80' r='1.2'/%3E%3Ccircle cx='40' cy='130' r='1.2'/%3E%3Ccircle cx='120' cy='160' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <Box 
      sx={{ 
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 56px)",
        bgcolor: "#fff",
      }}
    >
      {/* In-chat header - fixed below main app header */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          top: 56,
          zIndex: 1400,
          display: "flex",
          flexDirection: "column",
          px: 1.5,
          py: 1,
          borderBottom: "1px solid #E5E7EB",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* First row: Avatar, Name, Icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            src={chat.user.photoUrl}
            sx={{ 
              width: 36, 
              height: 36, 
              flexShrink: 0,
              cursor: "pointer",
              border: "2px solid #fff",
              boxShadow: "0 2px 8px rgba(108, 92, 231, 0.15)",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 4px 12px rgba(108, 92, 231, 0.25)"
              }
            }}
            onClick={() => setViewProfile({ open: true, user: chat.user })}
          />
          <Box
            sx={{ flex: 1, minWidth: 0, cursor: "pointer" }}
            onClick={() => setViewProfile({ open: true, user: chat.user })}
          >
            <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2, color: "#1F2937" }}>
              {chat.user.name}{chat.user.age ? `, ${chat.user.age}` : ""}
            </Typography>
            {/* Pulse spec: Quick vibe line or softer presence */}
            {chat.quickVibe ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 5, height: 5, minWidth: 5, minHeight: 5, borderRadius: "50%", bgcolor: "#6C5CE7", flexShrink: 0, animation: "subtlePulse 2s ease-in-out infinite" }} />
                <Typography variant="caption" noWrap sx={{ color: "#6C5CE7", fontWeight: 600, fontSize: "0.7rem" }}>
                  {chat.quickVibe}
                </Typography>
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: "#9CA3AF", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: 0.5 }}>
                {chat.matchId === AGENT_ID
                  ? "online"
                  : "Recently active"} {/* Pulse spec: softer presence without exact time */}
                {typing && chat.matchId !== AGENT_ID && (
                  <>
                    <span>·</span>
                    <span style={{ color: "#6C5CE7", fontWeight: 600 }}>typing…</span>
                  </>
                )}
              </Typography>
            )}
          </Box>
          {chat.matchId !== AGENT_ID && (
            <>
              <IconButton 
                aria-label="Video call" 
                onClick={() => startCall("video")}
                sx={{
                  bgcolor: "rgba(108, 92, 231, 0.08)",
                  color: "#6C5CE7",
                  width: 32,
                  height: 32,
                  p: 0,
                  transition: "all 0.2s ease",
                  "&:hover": { 
                    bgcolor: "rgba(108, 92, 231, 0.15)",
                  }
                }}
              >
                <Video size={16} />
              </IconButton>
              <IconButton 
                aria-label="Voice call" 
                onClick={() => startCall("voice")}
                sx={{
                  bgcolor: "rgba(108, 92, 231, 0.08)",
                  color: "#6C5CE7",
                  width: 32,
                  height: 32,
                  p: 0,
                  transition: "all 0.2s ease",
                  "&:hover": { 
                    bgcolor: "rgba(108, 92, 231, 0.15)",
                  }
                }}
              >
                <Phone size={16} />
              </IconButton>
              {/* Start Meeting Button - Only in 1-on-1 chats, visible label per spec */}
              {meetingState === MEETING_STATE.INACTIVE && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Users size={12} />}
                  onClick={handleStartMeeting}
                  aria-label="Start Meeting"
                  sx={{
                    background: 'linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    textTransform: 'none',
                    borderRadius: 14,
                    px: 1,
                    py: 0.25,
                    minWidth: 'auto',
                    height: 26,
                    boxShadow: '0 2px 8px rgba(128, 90, 213, 0.25)',
                    border: 'none',
                    whiteSpace: 'nowrap',
                    '& .MuiButton-startIcon': { mr: 0.25 },
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #B794F4 0%, #9F7AEA 100%)',
                    },
                  }}
                >
                  Start Meeting
                </Button>
              )}
            </>
          )}
          <Box sx={{ position: 'relative' }}>
            <IconButton 
              aria-label="More" 
              onClick={(e) => setMenuEl(menuEl ? null : e.currentTarget)}
              sx={{
                bgcolor: menuEl ? "rgba(108, 92, 231, 0.12)" : "rgba(0,0,0,0.04)",
                color: menuEl ? "#6C5CE7" : "#6B7280",
                width: 32,
                height: 32,
                p: 0,
                flexShrink: 0,
                transition: "all 0.2s ease",
                "&:hover": { 
                  bgcolor: "rgba(0,0,0,0.08)",
                  color: "#1F2937",
                }
              }}
            >
              <MoreVertical size={16} />
            </IconButton>
            {/* Inline dropdown menu */}
            {menuEl && (
              <>
                <Box 
                  onClick={() => setMenuEl(null)}
                  sx={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    mt: 0.5,
                    bgcolor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    minWidth: 160,
                    py: 0.5,
                    zIndex: 9999,
                  }}
                >
                <MenuItem onClick={() => { setSearchOpen(true); setMenuEl(null); }}>
                  <Search size={16} style={{ marginRight: 8 }} />
                  Search in chat
                </MenuItem>
                {chat.matchId !== AGENT_ID && (
                  <>
                    <MenuItem onClick={() => { openGallery(); setMenuEl(null); }}>
                      Media gallery
                    </MenuItem>
                    <Divider sx={{ my: 0.25 }} />
                  </>
                )}
                <MenuItem onClick={() => {
                  if (window.confirm('Are you sure you want to clear all messages in this chat?')) {
                    setChats(prev => prev.map(c => c.matchId === openChat ? { ...c, messages: [] } : c));
                  }
                  setMenuEl(null);
                }}>
                  Clear chat
                </MenuItem>
                <MenuItem onClick={() => {
                  if (window.confirm('Are you sure you want to delete this chat? This cannot be undone.')) {
                    setChats(prev => prev.filter(c => c.matchId !== openChat));
                    setOpenChat(null);
                    navigate('/chat', { replace: true });
                  }
                  setMenuEl(null);
                }}>
                  Delete chat
                </MenuItem>
                {chat.matchId !== AGENT_ID && (
                  <>
                    <Divider sx={{ my: 0.25 }} />
                    <MenuItem onClick={() => {
                      setChats(prev => prev.map(c => c.matchId === openChat ? { ...c, muted: !c.muted } : c));
                      setMenuEl(null);
                    }}>
                      {chat.muted ? 'Unmute chat' : 'Mute chat'}
                    </MenuItem>
                    <MenuItem 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to block this user?')) {
                          const blockedUser = {
                            id: chat.user?.id || chat.matchId,
                            name: chat.user?.name || 'Unknown',
                            photoUrl: chat.user?.photoUrl || '',
                            blockedAt: Date.now(),
                          };
                          try {
                            const existing = JSON.parse(localStorage.getItem('pulse_blocked_users') || '[]');
                            if (!existing.some(u => u.id === blockedUser.id)) {
                              localStorage.setItem('pulse_blocked_users', JSON.stringify([...existing, blockedUser]));
                            }
                          } catch {}
                          setChats(prev => prev.filter(c => c.matchId !== openChat));
                          setOpenChat(null);
                          navigate('/chat', { replace: true });
                        }
                        setMenuEl(null);
                      }}
                      sx={{ color: '#dc2626' }}
                    >
                      Block user
                    </MenuItem>
                    <MenuItem 
                      onClick={() => {
                        setReportPopup({ open: true, reason: '', details: '' });
                        setMenuEl(null);
                      }}
                      sx={{ color: '#dc2626' }}
                    >
                      Report user
                    </MenuItem>
                  </>
                )}
                </Box>
            </>
          )}
          </Box>
        </Box>
        {/* Second row: Countdown badges (if any) */}
        {(chat.sharedEvent || currentWorkshopReminder) && (
          <Box sx={{ display: "flex", gap: 0.75, mt: 0.75, ml: 5.5 }}>
            {/* Event Countdown Capsule - Per spec section 8 */}
            {chat.sharedEvent && (
              <Chip
                size="small"
                label={getEventCountdownText(chat.sharedEvent.date)}
                sx={{
                  height: 22,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  color: '#fff',
                  borderRadius: '11px',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}
            {/* Workshop Countdown Capsule */}
            {currentWorkshopReminder && (
              <Chip
                size="small"
                icon={<Box sx={{ fontSize: '0.6rem', ml: 0.25 }}>🎨</Box>}
                label={`${getWorkshopCountdown(currentWorkshopReminder.workshopDate)}`}
                sx={{
                  height: 22,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #a855f7 0%, #6C5CE7 100%)',
                  color: '#fff',
                  borderRadius: '11px',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </Box>
        )}
      </Box>
      <Box sx={{ height: 56 }} />

      {/* Workshop Reminder Banner */}
      {currentWorkshopReminder && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            top: 112, // Below header
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            background: 'linear-gradient(135deg, rgba(168,85,247,0.95) 0%, rgba(108,92,231,0.95) 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(108,92,231,0.3)',
          }}
        >
          <Box sx={{ fontSize: '1.2rem' }}>🎨</Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.75rem' }}>
              {currentWorkshopReminder.workshopName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.65rem' }}>
              {new Date(currentWorkshopReminder.workshopDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {currentWorkshopReminder.workshopTime} · {currentWorkshopReminder.workshopLocation}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '8px', px: 1.5, py: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.85rem', display: 'block' }}>
              {getWorkshopCountdown(currentWorkshopReminder.workshopDate)}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.55rem', opacity: 0.8 }}>
              until workshop
            </Typography>
          </Box>
        </Box>
      )}

      {/* Meeting bar is now global - rendered in GlobalMeetingBar component */}

      {/* Search bar - compact, fixed below in-chat header */}
      {searchOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 130,
            left: 0,
            right: 0,
            zIndex: 1450,
            bgcolor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            gap: 0.5,
            alignItems: "center",
            px: 1,
            py: 0.75,
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <Search size={16} color="#9CA3AF" />
          <TextField
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            size="small"
            placeholder="Search…"
            aria-label="Search in chat"
            autoFocus
            sx={{ flex: 1, '& .MuiInputBase-input': { py: 0.5, fontSize: '0.875rem' } }}
          />
          {matches.length > 0 && (
            <>
              <IconButton 
                size="small" 
                onClick={() => navigateToSearchResult(searchIndex - 1)}
                disabled={searchIndex <= 0}
                sx={{ p: 0.5 }}
              >
                <ArrowLeft size={16} />
              </IconButton>
              <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
                {searchIndex + 1}/{matches.length}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => navigateToSearchResult(searchIndex + 1)}
                disabled={searchIndex >= matches.length - 1}
                sx={{ p: 0.5 }}
              >
                <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
              </IconButton>
            </>
          )}
          {matches.length === 0 && searchQ && (
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              0
            </Typography>
          )}
          <IconButton size="small" onClick={() => { setSearchOpen(false); setSearchQ(''); }} sx={{ p: 0.5 }}>
            <X size={16} />
          </IconButton>
        </Box>
      )}

      {/* Crisis banner */}
      {chat.matchId === AGENT_ID && showCrisis && (
        <Alert
          severity="error"
          sx={{ mx: 1.25, mt: 1, mb: 0, border: "1px solid #fecaca" }}
          action={
            <Button color="inherit" size="small" onClick={() => setHelpOpen(true)}>
              Get help
            </Button>
          }
        >
          אם את/ה בסכנה מיידית או במשבר חריף — פנה/י לעזרה דחופה באזורך. השיחה כאן היא תומכת ולא-קלינית.
        </Alert>
      )}

      {/* Messages wrapper - fixed height, scrollable */}
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          position: 'fixed',
          top: 112,
          left: 0,
          right: 0,
          bottom: footerH + 56,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 1.25,
          pt: 1,
          pb: `24px`,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          backgroundColor: chat.themeColor || "#ECE5DD",
        }}
      >
        <Box sx={{ pt: 0 }}>
          {/* Unified Agent Panel */}
          {chat.matchId === AGENT_ID && (
            <Box sx={{ mt: 2, mb: 1, p: 1.5, bgcolor: "#F0F7FF", border: "1px solid #E0E7FF", borderRadius: 2 }}>
              {/* Mode Selector */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    💬 Pulse | Coach
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                  {[
                    { key: "auto", label: "🔄 Auto" },
                    { key: "coach", label: "📝 Coach" },
                    { key: "therapist", label: "💙 Support" },
                  ].map((m) => (
                    <Chip
                      key={m.key}
                      size="small"
                      label={m.label}
                      variant="outlined"
                      onClick={() => setAgentMode(chat.matchId, m.key)}
                      sx={{ 
                        fontWeight: getAgentMode(chat.matchId) === m.key ? 700 : 400,
                        cursor: "pointer",
                        bgcolor: getAgentMode(chat.matchId) === m.key ? '#6C5CE7 !important' : 'rgba(108, 92, 231, 0.08) !important',
                        borderColor: getAgentMode(chat.matchId) === m.key ? '#6C5CE7 !important' : 'rgba(108, 92, 231, 0.3) !important',
                        color: getAgentMode(chat.matchId) === m.key ? '#fff !important' : '#6C5CE7 !important',
                        '& .MuiChip-label': {
                          color: getAgentMode(chat.matchId) === m.key ? '#fff !important' : '#6C5CE7 !important',
                        },
                        '&:hover': {
                          bgcolor: getAgentMode(chat.matchId) === m.key ? '#5B4BD5 !important' : 'rgba(108, 92, 231, 0.15) !important',
                          borderColor: '#6C5CE7 !important',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
              
              {/* Quick actions based on current mode */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5, justifyContent: "center", alignItems: "center" }}>
                {getAgentMode(chat.matchId) !== "therapist" && [
                  { k: "📝 Draft message", v: "Help me write a message to..." },
                  { k: "💡 Tips", v: "What should I write when I want to..." },
                ].map((o) => (
                  <Chip 
                    key={o.k} 
                    size="small" 
                    label={o.k} 
                    onClick={() => setInput(o.v)} 
                    variant="outlined"
                    sx={{
                      bgcolor: 'rgba(108, 92, 231, 0.08) !important',
                      borderColor: 'rgba(108, 92, 231, 0.3) !important',
                      color: '#6C5CE7 !important',
                      '& .MuiChip-label': {
                        color: '#6C5CE7 !important',
                      },
                      '&:hover': {
                        bgcolor: 'rgba(108, 92, 231, 0.15) !important',
                        borderColor: '#6C5CE7 !important',
                      },
                    }}
                  />
                ))}
                {getAgentMode(chat.matchId) !== "coach" && [
                  { k: "💙 Need to talk", v: "I'm struggling right now, need to talk..." },
                  { k: "🌬️ Breathing", v: "Help me calm down" },
                ].map((o) => (
                  <Chip 
                    key={o.k} 
                    size="small" 
                    label={o.k} 
                    onClick={() => setInput(o.v)} 
                    variant="outlined"
                    sx={{
                      bgcolor: 'rgba(108, 92, 231, 0.08) !important',
                      borderColor: 'rgba(108, 92, 231, 0.3) !important',
                      color: '#6C5CE7 !important',
                      '& .MuiChip-label': {
                        color: '#6C5CE7 !important',
                      },
                      '&:hover': {
                        bgcolor: 'rgba(108, 92, 231, 0.15) !important',
                        borderColor: '#6C5CE7 !important',
                      },
                    }}
                  />
                ))}
                <Button 
                  size="small" 
                  sx={{ 
                    color: '#6C5CE7',
                    '&:hover': { bgcolor: 'rgba(108, 92, 231, 0.08)' },
                  }} 
                  onClick={() => setHelpOpen(true)}
                >
                  🆘 Help
                </Button>
              </Box>
              
              <Typography variant="caption" sx={{ display: "block", color: "#6b7280", textAlign: "center" }}>
                {getAgentMode(chat.matchId) === "auto" && "I automatically detect what you need."}
                {getAgentMode(chat.matchId) === "coach" && "Coach mode - help with crafting messages."}
                {getAgentMode(chat.matchId) === "therapist" && "Support mode - supportive conversation. In emergencies, seek professional help."}
              </Typography>
            </Box>
          )}

          {/* AI First Message - Per spec section 9 */}
          {chat.isNewMatch && chat.matchId !== AGENT_ID && chat.messages.length <= 1 && (
            <AiFirstMessage
              matchName={chat.user?.name || 'there'}
              sharedInterests={chat.user?.interests || []}
              onToneSelect={(suggestion) => setInput(suggestion)}
            />
          )}

          {chat.messages.map((m, i, arr) => {
            const prev = arr[i - 1];
            const dayBreak = !prev || !isSameDay(prev.timestamp, m.timestamp);
            return (
              <Fade in key={m.id} timeout={180}>
                <div>
                  {dayBreak && (
                    <Box sx={{ my: 1.5, textAlign: "center" }}>
                      <Chip
                        size="small"
                        label={new Date(m.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        sx={{
                          bgcolor: "rgba(108, 92, 231, 0.14) !important",
                          color: "#4B3DB6 !important",
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 'auto',
                          py: 0.5,
                          border: "1px solid rgba(108, 92, 231, 0.18) !important",
                          '& .MuiChip-label': { 
                            color: '#4B3DB6 !important',
                            px: 1.5,
                            whiteSpace: 'nowrap',
                          },
                        }}
                      />
                    </Box>
                  )}
                  <ChatBubble
                    msg={m}
                    isMe={m.from === "me"}
                    onDoubleLike={() => toggleHeart(m.id)}
                    onLongPressStart={(anchorEl) => reactPop.openFor(m.id)}
                    onOpenActions={openMsgActions}
                    onEventInviteAccept={handleEventInviteAccept}
                    onEventInviteDecline={handleEventInviteDecline}
                    onEventInviteOfferPay={handleEventInviteOfferPay}
                    onWorkshopInviteRespond={handleWorkshopInviteRespond}
                  />
                </div>
              </Fade>
            );
          })}
        </Box>
      </Box>

      {/* Recording bar */}
      {recActive && (
        <Box
          sx={{
            position: "sticky",
            bottom: footerH,
            zIndex: 11,
            px: 2,
            py: 1,
            bgcolor: "#fff",
            borderTop: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#F44336",
              boxShadow: "0 0 0 0 rgba(244,67,54,0.6)",
              animation: "pulseDot 1.2s ease-out infinite",
            }}
          />
          <Typography sx={{ fontWeight: 700 }}>Recording…</Typography>
          <Box sx={{ fontVariantNumeric: "tabular-nums", color: "#666" }}>
            {fmtMS(recMs)}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: 0.5,
              ml: 1,
              mr: "auto",
              height: 16,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 3,
                  bgcolor: "#4CAF50",
                  animation: `bar${i % 4} 1s ease-in-out ${i * 0.06}s infinite`,
                }}
              />
            ))}
          </Box>
          <Button onClick={cancelRecording}>Cancel</Button>
          <Button variant="contained" onClick={stopAndSendRecording}>
            Send
          </Button>
        </Box>
      )}

      {/* New messages indicator */}
      {showNewMsgIndicator && (
        <Box
          onClick={() => {
            scrollToBottom("smooth");
            setShowNewMsgIndicator(false);
          }}
          sx={{
            position: "fixed",
            bottom: footerH + 70,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1600,
            bgcolor: "#6C5CE7",
            color: "#fff",
            px: 2,
            py: 0.75,
            borderRadius: 20,
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(108, 92, 231, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            "&:hover": { bgcolor: "#5B4ED1" },
          }}
        >
          <ArrowLeft size={14} style={{ transform: "rotate(-90deg)" }} />
          New messages
        </Box>
      )}

      {/* Composer - fixed at bottom, above tab bar */}
      <Box
        ref={footerRef}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 56,
          zIndex: 1500,
          backgroundColor: chat.themeColor || "#ECE5DD",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          px: 2,
          pt: replyDraft || editDraft ? 0.75 : 1,
          pb: 1,
        }}
      >
        {/* Smart replies - compact row above input */}
        {chat.matchId !== AGENT_ID && smart.length > 0 && (
          <Box sx={{ 
            display: "flex", 
            gap: 0.5, 
            flexWrap: "nowrap",
            overflowX: "auto",
            mb: 0.75,
            pb: 0.5,
            mx: -0.5,
            px: 0.5,
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}>
            {smart.map((s, i) => (
              <Chip 
                key={i} 
                label={s} 
                size="small"
                onClick={() => setInput(s)}
                sx={{
                  background: "none !important",
                  backgroundImage: "none !important",
                  bgcolor: "rgba(108, 92, 231, 0.12) !important",
                  color: "#4B3DB6 !important",
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 28,
                  px: 1,
                  borderRadius: 14,
                  boxShadow: "none !important",
                  border: "1px solid rgba(108, 92, 231, 0.15) !important",
                  flexShrink: 0,
                  '& .MuiChip-label': { color: '#4B3DB6 !important', px: 0.75 },
                  '&:hover': {
                    bgcolor: "rgba(108, 92, 231, 0.18) !important",
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* Reply banner */}
        {replyDraft && (
          <Box
            sx={{
              mb: 0.5,
              px: 1,
              py: 0.5,
              bgcolor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CornerUpRight size={16} />
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Replying to {replyDraft.from === "me" ? "You" : replyDraft.from}: {replyDraft.text}
            </Typography>
            <Button size="small" onClick={() => setReplyDraft(null)}>
              Cancel
            </Button>
          </Box>
        )}

        {/* Edit banner */}
        {editDraft && (
          <Box
            sx={{
              mb: 0.5,
              px: 1,
              py: 0.5,
              bgcolor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ flex: 1 }}>
              Editing: {editDraft.text.slice(0, 64)}
            </Typography>
            <Button size="small" onClick={() => setEditDraft(null)}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                if (!input.trim()) return;
                updateMessageById(editDraft.id, { text: input.trim(), edited: true });
                setEditDraft(null);
                setInput("");
              }}
            >
              Save
            </Button>
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {/* Attach menu trigger - toggles open/close */}
          <IconButton
            aria-label="Open attachments"
            size="small"
            onClick={(e) => setAttachMenu(prev => prev?.open ? null : { open: true, anchor: e.currentTarget })}
            sx={{
              bgcolor: "rgba(108, 92, 231, 0.08)",
              color: "#6C5CE7",
              width: 36,
              height: 36,
              p: 0,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(108, 92, 231, 0.15)",
                transform: "rotate(45deg)",
              }
            }}
          >
            <Plus size={18} />
          </IconButton>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              bgcolor: "#fff",
              borderRadius: 24,
              border: "2px solid #E5E7EB",
              py: 0.5,
              px: 0.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.2s ease",
              "&:focus-within": {
                borderColor: "#6C5CE7",
                boxShadow: "0 4px 16px rgba(108, 92, 231, 0.15)",
              }
            }}
          >
            {/* Triangle tool selector: AI on top, emoji and camera below */}
            <Box sx={{ position: "relative", width: 52, height: 40, ml: 0.5, flexShrink: 0 }}>
              <IconButton
                aria-label={toolIndex === 0 ? "AI Suggestions" : toolIndex === 1 ? "Open emoji" : "Take photo"}
                size="small"
                onClick={(e) => {
                  if (toolIndex === 0) {
                    if (aiAnchor) {
                      setAiAnchor(null);
                      return;
                    }
                    setAiAnchor(e.currentTarget);
                    setAiOptions([]);
                    setAiShowOptions(false);
                    return;
                  }
                  if (toolIndex === 1) {
                    if (emojiOpen) {
                      setEmojiOpen(false);
                      return;
                    }
                    setEmojiMode("compose");
                    setEmojiOpen(true);
                    return;
                  }
                  setCameraOpen((v) => !v);
                }}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: getToolBg(toolIndex),
                  color: getToolColor(toolIndex),
                  width: 30,
                  height: 30,
                  boxShadow: "none",
                  border: `1px solid ${getToolBorder(toolIndex)}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: getToolBgHover(toolIndex),
                  }
                }}
              >
                {toolIndex === 0 ? <Wand2 size={16} /> : toolIndex === 1 ? <Smile size={16} /> : <Camera size={16} />}
              </IconButton>

              <IconButton
                aria-label={toolIndex === 0 ? "Open emoji" : toolIndex === 1 ? "Take photo" : "AI Suggestions"}
                size="small"
                onClick={() => setToolIndex((toolIndex + 1) % 3)}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  color: "#6B7280",
                  bgcolor: "transparent",
                  border: "1px solid #E5E7EB",
                  borderRadius: 999,
                  opacity: 0.7,
                  width: 22,
                  height: 22,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    opacity: 1,
                    bgcolor: "rgba(17, 24, 39, 0.04)",
                  }
                }}
              >
                {toolIndex === 0 ? <Smile size={12} /> : toolIndex === 1 ? <Camera size={12} /> : <Wand2 size={12} />}
              </IconButton>

              <IconButton
                aria-label={toolIndex === 0 ? "Take photo" : toolIndex === 1 ? "AI Suggestions" : "Open emoji"}
                size="small"
                onClick={() => setToolIndex((toolIndex + 2) % 3)}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  color: "#6B7280",
                  bgcolor: "transparent",
                  border: "1px solid #E5E7EB",
                  borderRadius: 999,
                  opacity: 0.7,
                  width: 22,
                  height: 22,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    opacity: 1,
                    bgcolor: "rgba(17, 24, 39, 0.04)",
                  }
                }}
              >
                {toolIndex === 0 ? <Camera size={12} /> : toolIndex === 1 ? <Wand2 size={12} /> : <Smile size={12} />}
              </IconButton>
            </Box>

            <InputBase
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={chat.matchId === AGENT_ID ? "Ask me anything…" : "Type a message"}
              multiline
              maxRows={4}
              fullWidth
              sx={{ 
                mx: 1,
                fontSize: "0.95rem",
                '& .MuiInputBase-input': {
                  py: 0.5,
                  '&::placeholder': {
                    color: '#9CA3AF',
                    opacity: 1,
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === " " && input.startsWith("/")) {
                  const cmd = input.trim();
                  if (cmd === "/greet") { setInput("Hey! 😊"); e.preventDefault(); return; }
                  if (cmd === "/shrug") { setInput("¯\\_(ツ)_/¯"); e.preventDefault(); return; }
                  if (cmd.startsWith("/me ")) { setInput(`*${cmd.slice(4)}*`); e.preventDefault(); return; }
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              aria-label="Message input"
            />

            <IconButton 
              aria-label="Send" 
              size="small" 
              onClick={handleSend}
              sx={{
                color: "#6C5CE7",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "#5B4BC4",
                  transform: "scale(1.1) rotate(-15deg)",
                }
              }}
            >
              <Send size={20} />
            </IconButton>
          </Box>

          {/* Mic: Press & Hold with stable recording indicator */}
          <Box sx={{ position: "relative" }}>
            {recActive && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  mb: 0.5,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: "#DC2626",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff" }} />
                {Math.floor(recMs / 1000)}s
              </Box>
            )}
            <Tooltip title={recActive ? "" : "Hold to record"} placement="top">
              <IconButton
                aria-label="Voice message"
                sx={{
                  background: recActive 
                    ? "linear-gradient(135deg, #6C5CE7 0%, #5B4BC4 100%)"
                    : "linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)",
                  color: "#fff",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  boxShadow: recActive 
                    ? "0 4px 12px rgba(108, 92, 231, 0.5)"
                    : "0 4px 12px rgba(128, 90, 213, 0.3)",
                  border: "none",
                  transition: "all 0.2s ease",
                  "&:hover": { 
                    background: recActive
                      ? "linear-gradient(135deg, #7C6DF7 0%, #6C5CE7 100%)"
                      : "linear-gradient(135deg, #B794F4 0%, #9F7AEA 100%)",
                    boxShadow: "0 6px 16px rgba(108, 92, 231, 0.5)",
                    transform: "scale(1.05)",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  startRecording();
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  if (recActive) stopAndSendRecording();
                }}
                onMouseLeave={() => {
                  if (recActive) cancelRecording();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startRecording();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  if (recActive) stopAndSendRecording();
                }}
              >
                <Mic size={22} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Attachments popper */}
      {attachMenu?.open && attachMenu?.anchor && document.body.contains(attachMenu.anchor) && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <Box
            onClick={() => setAttachMenu(null)}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1600,
              bgcolor: 'transparent',
            }}
          />
          <Popper
            open={true}
            anchorEl={attachMenu.anchor}
            placement="top-start"
            modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
            sx={{ zIndex: 1601 }}
          >
            <Box sx={{ 
              p: 1.5, 
              bgcolor: "#fff", 
              border: "1px solid #E5E7EB", 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
              display: "flex", 
              flexWrap: "wrap",
              gap: 1,
              maxWidth: 280,
            }}>
              <Button size="small" variant="outlined" sx={{ borderRadius: 2, fontSize: '0.75rem' }} onClick={() => { imageInputRef.current?.click(); setAttachMenu(null); }}>📷 Photo</Button>
              <Button size="small" variant="outlined" sx={{ borderRadius: 2, fontSize: '0.75rem' }} onClick={() => { fileAttachInputRef.current?.click(); setAttachMenu(null); }}>📎 File</Button>
              <Button size="small" variant="outlined" sx={{ borderRadius: 2, fontSize: '0.75rem' }} onClick={() => { shareLocation(); setAttachMenu(null); }}>📍 Location</Button>
              <Button size="small" variant="outlined" sx={{ borderRadius: 2, fontSize: '0.75rem' }} onClick={() => { shareContact(); setAttachMenu(null); }}>👤 Contact</Button>
              <Button size="small" variant="outlined" sx={{ borderRadius: 2, fontSize: '0.75rem' }} onClick={() => { openPollDialog(); setAttachMenu(null); }}>📊 Poll</Button>
              <Button size="small" variant="outlined" sx={{ borderRadius: 2, fontSize: '0.75rem' }} onClick={() => { openPlaceInviteDialog(); setAttachMenu(null); }}>🏠 Place</Button>
            </Box>
          </Popper>
        </>
      )}

      {/* Reactions bar */}
      <Popper
        open={reactPop.open}
        anchorEl={reactPop.anchorEl}
        placement="top"
        disablePortal
        modifiers={[{ name: "offset", options: { offset: [0, -12] } }]}
        container={scrollRef.current}
        sx={{ zIndex: 20 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            bgcolor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 999,
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            px: 1,
            py: 0.5,
          }}
        >
          {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emo) => (
            <Button
              key={emo}
              onClick={() => {
                addReaction(reactPop.msgId, emo);
                reactPop.close();
              }}
              sx={{ minWidth: 0, fontSize: 22, p: 0.5 }}
            >
              {emo}
            </Button>
          ))}
          <Button
            onClick={() => {
              setEmojiMode("react");
              setEmojiTargetMsg(reactPop.msgId);
              setEmojiOpen(true);
              reactPop.close();
            }}
            sx={{ minWidth: 0, px: 1, py: 0.25, border: "1px solid #e5e7eb", borderRadius: 999 }}
          >
            +
          </Button>
        </Box>
      </Popper>

      {/* Message actions menu */}
      <Popper
        open={msgMenu.open}
        anchorEl={msgMenu.anchorEl}
        placement="top"
        disablePortal
        modifiers={[{ name: "offset", options: { offset: [0, -8] } }]}
        container={scrollRef.current}
        sx={{ zIndex: 22 }}
      >
        <Box
          sx={{
            display: "flex",
            p: 0.5,
            bgcolor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            boxShadow: 3,
            gap: 0.5,
          }}
        >
          <Button
            size="small"
            onClick={() => {
              const m = chat.messages.find((x) => x.id === msgMenu.msgId);
              setReplyDraft({ id: m.id, text: m.text || "[media]", from: m.from });
              closeMsgActions();
            }}
          >
            Reply
          </Button>
          {(() => {
            const m = chat.messages.find((x) => x.id === msgMenu.msgId);
            const allowEdit = m?.from === "me" && Date.now() - m.timestamp < 15 * 60 * 1000 && m?.type === "text";
            return (
              allowEdit && (
                <Button
                  size="small"
                  onClick={() => {
                    setEditDraft({ id: m.id, text: m.text });
                    setInput(m.text);
                    closeMsgActions();
                  }}
                >
                  Edit
                </Button>
              )
            );
          })()}
          {(() => {
            const m = chat.messages.find((x) => x.id === msgMenu.msgId);
            const allowDel = m?.from === "me" && Date.now() - m.timestamp < 2 * 60 * 1000 && m?.type !== "deleted";
            return (
              allowDel && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    deleteForEveryone(m.id);
                    closeMsgActions();
                  }}
                >
                  Delete for everyone
                </Button>
              )
            );
          })()}
          <Button
            size="small"
            onClick={() => {
              const m = chat.messages.find((x) => x.id === msgMenu.msgId);
              updateMessageById(m.id, { starred: !m.starred });
              closeMsgActions();
            }}
          >
            {chat.messages.find((x) => x.id === msgMenu.msgId)?.starred ? "Unstar" : "Star"}
          </Button>
        </Box>
      </Popper>

      {/* Emoji bottom sheet */}
      <EmojiBottomSheet
        open={emojiOpen}
        onClose={() => setEmojiOpen(false)}
        onPick={(emoji) => {
          if (emojiMode === "compose") setInput((v) => v + emoji);
          else if (emojiMode === "react" && emojiTargetMsg) addReaction(emojiTargetMsg, emoji);
          setEmojiTargetMsg(null);
          setEmojiOpen(false);
        }}
      />

      {/* Video/Voice Call Modal */}
      <VideoCallModal
        open={!!call}
        onClose={endCall}
        callType={call?.type}
        remoteUser={call?.with}
        onCallEnd={endCall}
      />

      {/* Camera Modal */}
      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => {
          sendImage(file);
          setCameraOpen(false);
        }}
      />

      {/* Media Gallery */}
      <Modal open={gallery.open} onClose={() => setGallery({ open: false, images: [] })} sx={{ zIndex: 9999 }}>
        <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,.95)", p: 3, overflow: "auto", zIndex: 9999 }}>
          {/* Close button */}
          <IconButton
            onClick={() => setGallery({ open: false, images: [] })}
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.15)",
              zIndex: 10000,
              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
            }}
          >
            <X size={24} />
          </IconButton>
          
          {/* Title */}
          <Typography variant="h6" sx={{ color: "#fff", mb: 3, textAlign: "center" }}>
            Media Gallery
          </Typography>
          
          {gallery.images.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh" }}>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem" }}>
                No media in this chat yet
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", mt: 1 }}>
                Photos and videos you share will appear here
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {gallery.images.map((src, i) => (
                <Grid key={i} item xs={6} sm={4} md={3}>
                  <img src={src} alt="" style={{ width: "100%", borderRadius: 8 }} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Modal>

      {/* Report User Modal */}
      <Modal open={reportPopup.open} onClose={() => setReportPopup({ open: false, reason: '', details: '' })}>
        <Box sx={{ bgcolor: "#fff", borderRadius: 3, width: 320, maxWidth: "90vw", maxHeight: "70vh", overflowY: "auto", p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: "#1a1a1a", fontSize: "1.1rem" }}>
              Report User
            </Typography>
            <Typography sx={{ mb: 1.5, color: "#666", fontSize: "0.85rem" }}>
              Why are you reporting {chat?.user?.name || "this user"}?
            </Typography>
            
            {/* Report reasons */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 1.5 }}>
              {[
                { value: "inappropriate", label: "Inappropriate content" },
                { value: "harassment", label: "Harassment or bullying" },
                { value: "fake", label: "Fake profile / Catfishing" },
                { value: "spam", label: "Spam or scam" },
                { value: "other", label: "Other" },
              ].map((option) => (
                <Box
                  key={option.value}
                  onClick={() => setReportPopup(prev => ({ ...prev, reason: option.value }))}
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    border: reportPopup.reason === option.value ? "2px solid #6C5CE7" : "1px solid #E5E7EB",
                    bgcolor: reportPopup.reason === option.value ? "rgba(108, 92, 231, 0.08)" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": { bgcolor: "rgba(108, 92, 231, 0.05)" },
                  }}
                >
                  <Typography sx={{ fontSize: "0.85rem", color: reportPopup.reason === option.value ? "#6C5CE7" : "#333" }}>
                    {option.label}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            {/* Additional details */}
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Additional details (optional)"
              value={reportPopup.details}
              onChange={(e) => setReportPopup(prev => ({ ...prev, details: e.target.value }))}
              sx={{ mb: 1.5 }}
              size="small"
            />
            
            {/* Buttons */}
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                size="small"
                onClick={() => setReportPopup({ open: false, reason: '', details: '' })}
                sx={{ color: "#666" }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={!reportPopup.reason}
                onClick={() => {
                  alert('Report submitted. Thank you for helping keep Pulse safe.');
                  setReportPopup({ open: false, reason: '', details: '' });
                }}
                sx={{
                  bgcolor: "#dc2626",
                  "&:hover": { bgcolor: "#b91c1c" },
                  "&:disabled": { bgcolor: "#fca5a5" },
                }}
              >
                Submit
              </Button>
            </Box>
        </Box>
      </Modal>

      {/* Profile modal */}
      <Modal open={viewProfile.open} onClose={() => setViewProfile({ open: false, user: null })}>
        <Box sx={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", bgcolor: "rgba(0,0,0,.6)" }}>
          <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, minWidth: 300 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar src={viewProfile.user?.photoUrl} />
              <Typography variant="h6">
                {viewProfile.user?.name}{viewProfile.user?.age ? `, ${viewProfile.user?.age}` : ""}
              </Typography>
            </Box>
            <Button sx={{ mt: 1 }} onClick={() => setViewProfile({ open: false, user: null })}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Therapist help modal */}
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)}>
        <Box sx={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", bgcolor: "rgba(0,0,0,.45)", p: 2 }}>
          <Box sx={{ bgcolor: "#fff", p: 2, borderRadius: 2, maxWidth: 420 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Help resources
            </Typography>
            <Typography variant="body2" sx={{ color: "#374151", mb: 1 }}>
              אם יש סכנה מיידית — פנו למספר החירום המקומי שלכם. אפשר גם ליצור קשר עם קו סיוע במשבר במדינה שלכם, או אדם קרוב שתוכלו לדבר איתו עכשיו.
            </Typography>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              השיחה כאן היא תמיכה כללית בלבד ואינה תחליף לטיפול מקצועי.
            </Typography>
            <Box sx={{ textAlign: "right", mt: 1 }}>
              <Button onClick={() => setHelpOpen(false)}>Close</Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* AI suggestions popover */}
      <Popover
        open={Boolean(aiAnchor) && aiAnchor && document.body.contains(aiAnchor)}
        anchorEl={aiAnchor}
        onClose={() => setAiAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        marginThreshold={24}
        sx={{ zIndex: 1601 }}
        PaperProps={{
          sx: {
            p: 1,
            bgcolor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            boxShadow: 3,
            minWidth: 280,
            maxWidth: 'min(520px, calc(100vw - 24px))',
            maxHeight: 'min(540px, calc(100vh - 220px))',
            overflowY: 'auto',
            overflowX: 'hidden',
            mt: 1,
          },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>AI Suggestions</Typography>
            <Button size="small" onClick={() => setAiAnchor(null)}>Close</Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 0.5, mb: 0.5 }}>
            <Box
              onClick={() => setAiActiveGroup((g) => (g === 'intent' ? null : 'intent'))}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                py: 0.75,
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
                bgcolor: aiActiveGroup === 'intent' ? 'rgba(108, 92, 231, 0.06)' : '#fff',
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                Intent
              </Typography>
              <Chip
                size="small"
                label={aiIntent}
                sx={{
                  bgcolor: 'rgba(108, 92, 231, 0.14) !important',
                  color: '#4B3DB6 !important',
                  border: '1px solid rgba(108, 92, 231, 0.18) !important',
                  fontWeight: 700,
                  '& .MuiChip-label': { color: '#4B3DB6 !important' },
                }}
              />
            </Box>

            {aiActiveGroup === 'intent' && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, px: 0.5, pb: 0.5 }}>
                {["open","followup","invite","compliment","clarify"].map((k) => (
                  <Chip
                    key={k}
                    size="small"
                    label={k}
                    onClick={() => {
                      setAiIntent(k);
                      persistIfNeeded(null, null, k);
                      setAiShowOptions(true);
                      computeAI("settings_change");
                      setAiActiveGroup(null);
                    }}
                    sx={{
                      bgcolor: (aiIntent === k ? 'rgba(108, 92, 231, 0.22)' : 'rgba(108, 92, 231, 0.12)') + ' !important',
                      color: '#4B3DB6 !important',
                      border: '1px solid rgba(108, 92, 231, 0.18) !important',
                      fontWeight: 700,
                      '& .MuiChip-label': { color: '#4B3DB6 !important' },
                    }}
                  />
                ))}
              </Box>
            )}

            <Box
              onClick={() => setAiActiveGroup((g) => (g === 'tone' ? null : 'tone'))}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                py: 0.75,
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
                bgcolor: aiActiveGroup === 'tone' ? 'rgba(108, 92, 231, 0.06)' : '#fff',
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                Tone
              </Typography>
              <Chip
                size="small"
                label={aiTone}
                sx={{
                  bgcolor: 'rgba(108, 92, 231, 0.14) !important',
                  color: '#4B3DB6 !important',
                  border: '1px solid rgba(108, 92, 231, 0.18) !important',
                  fontWeight: 700,
                  '& .MuiChip-label': { color: '#4B3DB6 !important' },
                }}
              />
            </Box>

            {aiActiveGroup === 'tone' && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, px: 0.5, pb: 0.5 }}>
                {["friendly","playful","formal","flirty","confident"].map((t) => (
                  <Chip
                    key={t}
                    size="small"
                    label={t}
                    onClick={() => {
                      setAiTone(t);
                      persistIfNeeded(t, null, null);
                      setAiShowOptions(true);
                      computeAI("settings_change");
                      setAiActiveGroup(null);
                    }}
                    sx={{
                      bgcolor: (aiTone === t ? 'rgba(108, 92, 231, 0.22)' : 'rgba(108, 92, 231, 0.12)') + ' !important',
                      color: '#4B3DB6 !important',
                      border: '1px solid rgba(108, 92, 231, 0.18) !important',
                      fontWeight: 700,
                      '& .MuiChip-label': { color: '#4B3DB6 !important' },
                    }}
                  />
                ))}
              </Box>
            )}

            <Box
              onClick={() => setAiActiveGroup((g) => (g === 'length' ? null : 'length'))}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                py: 0.75,
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
                bgcolor: aiActiveGroup === 'length' ? 'rgba(108, 92, 231, 0.06)' : '#fff',
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                Length
              </Typography>
              <Chip
                size="small"
                label={aiLen}
                sx={{
                  bgcolor: 'rgba(108, 92, 231, 0.14) !important',
                  color: '#4B3DB6 !important',
                  border: '1px solid rgba(108, 92, 231, 0.18) !important',
                  fontWeight: 700,
                  '& .MuiChip-label': { color: '#4B3DB6 !important' },
                }}
              />
            </Box>

            {aiActiveGroup === 'length' && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, px: 0.5, pb: 0.5 }}>
                {["short","medium","long"].map((l) => (
                  <Chip
                    key={l}
                    size="small"
                    label={l}
                    onClick={() => {
                      setAiLen(l);
                      persistIfNeeded(null, l, null);
                      setAiShowOptions(true);
                      computeAI("settings_change");
                      setAiActiveGroup(null);
                    }}
                    sx={{
                      bgcolor: (aiLen === l ? 'rgba(108, 92, 231, 0.22)' : 'rgba(108, 92, 231, 0.12)') + ' !important',
                      color: '#4B3DB6 !important',
                      border: '1px solid rgba(108, 92, 231, 0.18) !important',
                      fontWeight: 700,
                      '& .MuiChip-label': { color: '#4B3DB6 !important' },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <FormControlLabel
            sx={{ ml: 0.5, mb: 0.75 }}
            control={<Checkbox size="small" checked={aiRemember} onChange={(e)=> {
              const v = e.target.checked; setAiRemember(v);
              if (v && chat?.matchId) {
                localStorage.setItem(`ai_tone_${chat.matchId}`, aiTone);
                localStorage.setItem(`ai_len_${chat.matchId}`, aiLen);
                localStorage.setItem(`ai_intent_${chat.matchId}`, aiIntent);
              }
              if (!v && chat?.matchId) {
                localStorage.removeItem(`ai_tone_${chat.matchId}`);
                localStorage.removeItem(`ai_len_${chat.matchId}`);
                localStorage.removeItem(`ai_intent_${chat.matchId}`);
              }
            }} />}
            label={<Typography variant="caption" sx={{ color: '#64748b' }}>Remember for this chat</Typography>}
          />

          {aiShowOptions && (
            <Box sx={{ display: 'grid', gap: 0.5 }}>
              {aiOptions.map((s, i) => (
                <Box key={i} sx={{ p: 1, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>{s}</Typography>
                  <Button size="small" onClick={() => {
                    setInput(s);
                    setAiAnchor(null);
                    if (agentTraceId) {
                      sendAgentFeedback({ traceId: agentTraceId, action: "inserted", suggestionText: s });
                    }
                  }} sx={{ borderRadius: 999 }}>
                    Insert
                  </Button>
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
            <Button size="small" onClick={() => { setAiShowOptions(true); computeAI('regen'); }}>{aiShowOptions ? 'Regenerate' : 'Generate'}</Button>
          </Box>
        </Box>
      </Popover>

      {/* ==================== Meeting Time Screen ==================== */}
      {showMeetingScreen && meetingState === MEETING_STATE.ACTIVE && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            outline: 'none',
            zIndex: 100000,
          }}
        >
          {/* Header Bar */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            px: 2, 
            py: 1,
            bgcolor: '#fff',
            borderBottom: '1px solid #E5E7EB',
            flexShrink: 0,
          }}>
            <IconButton 
              onClick={() => {
                setShowMeetingScreen(false);
                // Navigate back to previous page if we came from another page
                if (globalMeeting.previousPath && globalMeeting.previousPath !== location.pathname) {
                  navigate(globalMeeting.previousPath);
                  globalMeeting.setPreviousPath(null);
                }
              }} 
              size="small" 
              sx={{ 
                color: '#6C5CE7',
                bgcolor: 'rgba(108, 92, 231, 0.1)',
                '&:hover': { bgcolor: 'rgba(108, 92, 231, 0.2)' },
              }}
            >
              <Minimize2 size={18} />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6C5CE7', boxShadow: '0 0 6px #6C5CE7' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>Meeting Time</Typography>
            </Box>
            <Button 
              variant="text" 
              size="small" 
              onClick={handleEndMeeting} 
              sx={{ 
                fontWeight: 600, 
                fontSize: '0.8rem', 
                minWidth: 'auto',
                color: '#DC2626 !important',
                '&:hover': {
                  bgcolor: 'rgba(220, 38, 38, 0.1)',
                },
              }}
            >
              END
            </Button>
          </Box>

          {/* Meeting Quick Actions Block - At top, below header */}
          <Box sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', px: 1.5, pt: 3, pb: 10, overflowY: 'auto' }}>
            <Box sx={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              {/* 1. Meeting Status with motivational message */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 1, 
                width: '100%', 
                p: 2.5, 
                background: 'linear-gradient(135deg, #F3F0FF 0%, #E9E4FF 100%)',
                borderRadius: 3, 
                border: '2px solid #C4B5FD',
                boxShadow: '0 4px 16px rgba(108, 92, 231, 0.15)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #6C5CE7 0%, #8B7CF7 50%, #6C5CE7 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s linear infinite',
                },
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '200% 0' },
                  '100%': { backgroundPosition: '-200% 0' },
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7CF7 100%)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(108, 92, 231, 0.4)',
                    border: '2px solid rgba(255,255,255,0.9)',
                  }}>
                    <Users size={18} color="#fff" />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4C1D95', fontSize: '1.1rem' }}>
                    Meeting with {meetingWith?.name} ✓
                  </Typography>
                </Box>
                {/* Encouraging copy - rotates through messages */}
                <Typography variant="body2" sx={{ color: '#5B21B6', fontStyle: 'italic', textAlign: 'center', fontWeight: 500, fontSize: '0.9rem' }}>
                  {(() => {
                    const messages = [
                      "✨ Be yourself, stay safe, and enjoy the moment",
                      "💜 This is a moment to pause and stay present",
                      "🌟 The meeting happens at your pace, without pressure",
                      "💫 We're here in the background so you can feel safe",
                    ];
                    // Use meeting start time to pick a consistent message
                    const index = meetingStartTime ? Math.floor((meetingStartTime / 1000) % messages.length) : 0;
                    return messages[index];
                  })()}
                </Typography>
              </Box>

              {/* Explanation Line - per spec */}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#6B7280', 
                  textAlign: 'center', 
                  fontSize: '0.75rem', 
                  lineHeight: 1.4,
                  px: 2,
                  mb: 1,
                }}
              >
                Good to know - the buttons below are available at any time. There's no need to use them unless you want to.
              </Typography>

              {/* 2. Quick Actions */}
              <Box sx={{ width: '100%' }}>
                <Typography variant="overline" sx={{ 
                  color: '#6B7280', 
                  fontWeight: 700, 
                  letterSpacing: 1.5, 
                  fontSize: '0.65rem', 
                  display: 'block', 
                  textAlign: 'center', 
                  mb: 1.5,
                  textTransform: 'uppercase',
                }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {/* In-App Contact Circles */}
              {meetingContacts.map((contact) => (
                <Box
                  key={contact.id}
                  onClick={() => handleContactCircleClick(contact)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 1.25,
                    borderRadius: 2.5,
                    bgcolor: '#fff',
                    boxShadow: contactsNotifiedThisMeeting.includes(contact.id) 
                      ? '0 0 0 3px #6C5CE7, 0 4px 16px rgba(108, 92, 231, 0.3)' 
                      : '0 4px 12px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: contactsNotifiedThisMeeting.includes(contact.id)
                        ? '0 0 0 3px #6C5CE7, 0 8px 24px rgba(108, 92, 231, 0.4)'
                        : '0 8px 20px rgba(0,0,0,0.12)',
                    },
                    '&:active': { transform: 'translateY(-2px) scale(0.98)' },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 0.75,
                      boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
                      border: '2px solid rgba(255,255,255,0.9)',
                    }}
                  >
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
                      {contact.name.charAt(0).toUpperCase()}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, textAlign: 'center', color: '#1F2937', fontSize: '0.7rem', lineHeight: 1.2 }}>
                    {contact.name.length > 6 ? contact.name.slice(0, 6) + '…' : contact.name}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: contactsNotifiedThisMeeting.includes(contact.id) ? '#6C5CE7' : '#9CA3AF', 
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    mt: 0.25,
                  }}>
                    {contactsNotifiedThisMeeting.includes(contact.id) ? '✓ Notified' : 'Notify'}
                  </Typography>
                </Box>
              ))}

              {/* WhatsApp Circle */}
              <Box
                onClick={shareViaWhatsApp}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1.25,
                  borderRadius: 2.5,
                  bgcolor: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  },
                  '&:active': { transform: 'translateY(-2px) scale(0.98)' },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8B7CF7 0%, #6C5CE7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 0.75,
                    boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
                    border: '2px solid rgba(255,255,255,0.9)',
                  }}
                >
                  <MessageCircle size={20} color="#fff" />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '0.7rem', lineHeight: 1.2 }}>
                  Share
                </Typography>
              </Box>

              {/* Support Chat Circle */}
              <Box
                onClick={() => {
                  setShowMeetingScreen(false);
                  openChatWithNav(AGENT_ID);
                  setTimeout(() => {
                    setChats((prev) =>
                      prev.map((c) =>
                        c.matchId !== AGENT_ID
                          ? c
                          : {
                              ...c,
                              messages: [
                                ...c.messages,
                                {
                                  id: Date.now() + 1,
                                  from: "them",
                                  type: "text",
                                  text: "I'm here with you. What would help right now?",
                                  timestamp: Date.now(),
                                  status: "read",
                                  reactions: {},
                                },
                              ],
                              lastSentAt: Date.now(),
                            }
                      )
                    );
                  }, 300);
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1.25,
                  borderRadius: 2.5,
                  bgcolor: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  },
                  '&:active': { transform: 'translateY(-2px) scale(0.98)' },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #9F7AEA 0%, #6C5CE7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 0.75,
                    boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
                    border: '2px solid rgba(255,255,255,0.9)',
                  }}
                >
                  <HeartHandshake size={20} color="#fff" />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '0.7rem', lineHeight: 1.2 }}>
                  Support
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.65rem', fontWeight: 600, mt: 0.25 }}>
                  Chat
                </Typography>
              </Box>

              {/* Quick Add Contact */}
              <Box
                onClick={() => setShowQuickAddContact(true)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1.25,
                  borderRadius: 2.5,
                  bgcolor: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '2px dashed #D1D5DB',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                    borderColor: '#6C5CE7',
                  },
                  '&:active': { transform: 'translateY(-2px) scale(0.98)' },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 0.75,
                    border: '2px solid #E5E7EB',
                  }}
                >
                  <UserPlus size={20} color="#6B7280" />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, textAlign: 'center', color: '#1F2937', fontSize: '0.7rem', lineHeight: 1.2 }}>
                  Add
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.65rem', fontWeight: 600, mt: 0.25 }}>
                  Contact
                </Typography>
                </Box>
              </Box>
              </Box>

              {/* 3. Need Support */}
              <Box onClick={() => setShowMeetingHelpDialog(true)} sx={{ width: '100%', p: 1, borderRadius: 2, bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { bgcolor: '#F3F4F6' } }}>
                <Shield size={18} color="#6B7280" />
                <Typography variant="caption" sx={{ color: '#6B7280', flex: 1 }}>Need support? Tap for help</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>→</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ==================== Meeting Help Dialog ==================== */}
      <Dialog
        open={showMeetingHelpDialog}
        onClose={() => setShowMeetingHelpDialog(false)}
        sx={{ zIndex: 100001 }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 0,
            maxWidth: 320,
            width: '90%',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5, pt: 2, textAlign: 'center', fontSize: '1.05rem' }}>
          🛡️ Meeting Support
        </DialogTitle>
        <DialogContent sx={{ py: 1, px: 2.5 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 22, mb: 0.25 }}>🆘</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.85rem' }}>
                Emergency SOS
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                Tap the shield icon to alert your emergency contacts
              </Typography>
            </Box>
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 22, mb: 0.25 }}>💬</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.85rem' }}>
                Support Chat
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                Chat with our support team anytime
              </Typography>
            </Box>
            <Box sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: 22, mb: 0.25 }}>📍</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.85rem' }}>
                Share Location
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                Your contacts can see your location during the meeting
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, pt: 0.5, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setShowMeetingHelpDialog(false);
              triggerSOS();
            }}
            sx={{
              py: 1,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              background: '#DC2626',
              '&:hover': { background: '#B91C1C' },
            }}
          >
            🆘 Activate SOS
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setShowMeetingHelpDialog(false)}
            sx={{
              py: 1,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderColor: '#6C5CE7',
              color: '#6C5CE7',
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== Missing Contacts Setup Modal ==================== */}
      <Modal 
        open={showContactsSetupModal} 
        onClose={() => setShowContactsSetupModal(false)}
        sx={{ zIndex: 9999 }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: '#fff',
            borderRadius: 2,
            p: 2,
            maxWidth: 300,
            width: 'calc(100% - 32px)',
            textAlign: 'center',
            outline: 'none',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: 24,
          }}
        >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: '#F3E8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5,
              }}
            >
              <Users size={20} color="#6C5CE7" />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Want to set up meeting contacts?
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', mb: 1.5, display: 'block', fontSize: '0.7rem', lineHeight: 1.3 }}>
              You haven't set up meeting contacts for sharing via Pulse yet.
              You can continue and share via WhatsApp, or set it up now.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Button
                variant="contained"
                fullWidth
                size="small"
                onClick={() => {
                  setShowContactsSetupModal(false);
                  setShowQuickAddContact(true);
                }}
                sx={{ borderRadius: 999, py: 0.75, fontSize: '0.8rem' }}
              >
                Set up now
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                onClick={handleContinueWithoutContacts}
                sx={{ borderRadius: 999, py: 0.75, fontSize: '0.8rem' }}
              >
                Continue
              </Button>
            </Box>
          </Box>
      </Modal>

      {/* ==================== Quick Add Contact Modal ==================== */}
      <Modal 
        open={showQuickAddContact} 
        onClose={() => setShowQuickAddContact(false)}
        sx={{ zIndex: 100001 }}
      >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: '#fff',
              borderRadius: 2,
              p: 2,
              maxWidth: 320,
              width: 'calc(100% - 32px)',
              outline: 'none',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: 24,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Add Meeting Contact
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', mb: 2, display: 'block' }}>
              Add someone who can receive your location during meetings.
            </Typography>
            <TextField
              id="contact-name"
              label="Contact Name"
              fullWidth
              size="small"
              sx={{ mb: 1.5 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const name = e.target.value.trim();
                  if (name) {
                    const newContact = {
                      id: `contact_${Date.now()}`,
                      name,
                      addedAt: Date.now(),
                    };
                    setMeetingContacts(prev => [...prev, newContact]);
                    setShowQuickAddContact(false);
                    // If we came from setup modal, start the meeting
                    if (meetingState === MEETING_STATE.INACTIVE && chat) {
                      setTimeout(() => handleStartMeeting(), 100);
                    }
                  }
                }
              }}
            />
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                onClick={() => setShowQuickAddContact(false)}
                sx={{ borderRadius: 999, py: 0.75, fontSize: '0.8rem' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                size="small"
                onClick={() => {
                  const input = document.getElementById('contact-name');
                  const name = input?.value?.trim();
                  if (name) {
                    const newContact = {
                      id: `contact_${Date.now()}`,
                      name,
                      addedAt: Date.now(),
                    };
                    setMeetingContacts(prev => [...prev, newContact]);
                    setShowQuickAddContact(false);
                    if (meetingState === MEETING_STATE.INACTIVE && chat) {
                      setTimeout(() => handleStartMeeting(), 100);
                    }
                  }
                }}
                sx={{ borderRadius: 999, py: 0.75, fontSize: '0.8rem' }}
              >
                Add
              </Button>
            </Box>
          </Box>
      </Modal>

      {/* ==================== End Meeting Confirmation (During SOS) ==================== */}
      <Modal open={showEndMeetingConfirm} onClose={() => setShowEndMeetingConfirm(false)} sx={{ zIndex: 100001 }}>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(0,0,0,0.5)',
            p: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 3,
              p: 3,
              maxWidth: 360,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <AlertTriangle size={28} color="#DC2626" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              An SOS request is active
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Are you sure you want to end the meeting? This will also cancel your SOS request.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setShowEndMeetingConfirm(false)}
                sx={{ borderRadius: 999, py: 1.5 }}
              >
                Continue SOS
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={performEndMeeting}
                sx={{ borderRadius: 999, py: 1.5 }}
              >
                End Meeting and Cancel SOS
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* ==================== Safety Summary (After Meeting Ends) ==================== */}
      <Modal open={showSafetySummary} onClose={() => setShowSafetySummary(false)} sx={{ zIndex: 100001 }}>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(0,0,0,0.5)',
            p: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 3,
              p: 3,
              maxWidth: 380,
              width: '100%',
              textAlign: 'center',
            }}
          >
            {/* Header Icon */}
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Check size={32} color="#6C5CE7" />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Meeting ended
            </Typography>
            
            {meetingEndedWith && (
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
                Your meeting with <strong>{meetingEndedWith.name}</strong> has ended.
                We hope everything went well.
              </Typography>
            )}

            {/* Options */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              {/* AI Coach Option */}
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MessageCircle size={18} />}
                onClick={() => {
                  setShowSafetySummary(false);
                  openChatWithNav(AGENT_ID);
                  // Send supportive message
                  setTimeout(() => {
                    setChats((prev) =>
                      prev.map((c) =>
                        c.matchId !== AGENT_ID
                          ? c
                          : {
                              ...c,
                              messages: [
                                ...c.messages,
                                {
                                  id: Date.now() + 1,
                                  from: "them",
                                  type: "text",
                                  text: `How did it go? I'm here if you want to share or talk about your meeting with ${meetingEndedWith?.name || 'your date'}.`,
                                  timestamp: Date.now(),
                                  status: "read",
                                  reactions: {},
                                },
                              ],
                              lastSentAt: Date.now(),
                            }
                      )
                    );
                  }, 300);
                }}
                sx={{

                  borderRadius: 999,
                  py: 1.5,
                  borderColor: '#E5E7EB',
                  color: '#374151',
                  '&:hover': { borderColor: '#6C5CE7', bgcolor: '#F5F3FF' },
                }}
              >
                Talk to AI Coach
              </Button>

              {/* Block Option */}
              {meetingEndedWith && (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<X size={18} />}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to block ${meetingEndedWith.name}?`)) {
                      // Find and block the chat
                      setChats(prev => prev.map(c => 
                        c.user?.id === meetingEndedWith.id ? { ...c, blocked: true } : c
                      ));
                      setShowSafetySummary(false);
                      setMeetingEndedWith(null);
                    }
                  }}
                  sx={{

                    borderRadius: 999,
                    py: 1.5,
                    borderColor: '#FEE2E2',
                    color: '#DC2626',
                    '&:hover': { borderColor: '#DC2626', bgcolor: '#FEF2F2' },
                  }}
                >
                  Block {meetingEndedWith.name}
                </Button>
              )}

              {/* Report Option */}
              {meetingEndedWith && (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AlertTriangle size={18} />}
                  onClick={() => {
                    alert('Report submitted. Thank you for helping keep Pulse safe.');
                    setShowSafetySummary(false);
                    setMeetingEndedWith(null);
                  }}
                  sx={{

                    borderRadius: 999,
                    py: 1.5,
                    borderColor: '#FEE2E2',
                    color: '#DC2626',
                    '&:hover': { borderColor: '#DC2626', bgcolor: '#FEF2F2' },
                  }}
                >
                  Report {meetingEndedWith.name}
                </Button>
              )}
            </Box>

            {/* Close Button */}
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setShowSafetySummary(false);
                setMeetingEndedWith(null);
              }}
              sx={{ borderRadius: 999, py: 1.5 }}
            >
              Done
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* ==================== Contact Notification Confirmation Modal (Spec Section 5) ==================== */}
      <Modal 
        open={showContactNotifyModal} 
        onClose={() => {
          setShowContactNotifyModal(false);
          setContactToNotify(null);
        }}
        sx={{ zIndex: 100001 }}
      >
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(0,0,0,0.5)',
            p: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: 3,
              p: 3,
              maxWidth: 380,
              width: '100%',
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#6C5CE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
                  {contactToNotify?.name?.charAt(0).toUpperCase()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Notify {contactToNotify?.name}?
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Meeting contact
                </Typography>
              </Box>
            </Box>

            {/* Message Preview */}
            <Box
              sx={{
                p: 2,
                bgcolor: '#F9FAFB',
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                mb: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, display: 'block', mb: 1 }}>
                Message preview:
              </Typography>
              <Typography variant="body2" sx={{ color: '#374151' }}>
                "I'm on a meeting through Pulse and wanted to let you know. You can see my live location while the meeting is active."
              </Typography>
            </Box>

            {/* Location Notice */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 2,
                bgcolor: '#F5F3FF',
                borderRadius: 2,
                border: '1px solid rgba(108, 92, 231, 0.18)',
              }}
            >
              <MapPin size={20} color="#6C5CE7" style={{ marginTop: 2, flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4B3DB6', mb: 0.5 }}>
                  Location sharing
                </Typography>
                <Typography variant="caption" sx={{ color: '#6C5CE7' }}>
                  Your live location will be shared with {contactToNotify?.name} until the meeting ends. 
                  Location is visible only to this contact and cannot be forwarded.
                </Typography>
              </Box>
            </Box>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setShowContactNotifyModal(false);
                  setContactToNotify(null);
                }}
                sx={{ borderRadius: 999, py: 1.5 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={confirmNotifyContact}
                sx={{ borderRadius: 999, py: 1.5 }}
              >
                Send notification
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Contact Notification Success Snackbar */}
      <Snackbar
        open={!!contactNotifySuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: 120, zIndex: 99999 }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            width: '100%',
            bgcolor: '#10B981',
            color: '#fff',
            '& .MuiAlert-icon': { color: '#fff' },
          }}
        >
          {contactNotifySuccess}
        </Alert>
      </Snackbar>

      {/* ==================== Poll Creation Dialog ==================== */}
      <Dialog
        open={showPollDialog}
        onClose={() => setShowPollDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 36, height: 36, borderRadius: '10px', 
            bgcolor: 'rgba(108,92,231,0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <BarChart2 size={20} color="#6C5CE7" />
          </Box>
          Create Poll
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Poll Question"
              placeholder="What do you want to ask?"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Options (2-5)
            </Typography>
            
            {pollOptions.map((opt, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[idx] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
                {pollOptions.length > 2 && (
                  <IconButton 
                    size="small" 
                    onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                    sx={{ color: '#ef4444' }}
                  >
                    <X size={16} />
                  </IconButton>
                )}
              </Box>
            ))}
            
            {pollOptions.length < 5 && (
              <Button
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => setPollOptions([...pollOptions, ''])}
                sx={{ alignSelf: 'flex-start', color: '#6C5CE7' }}
              >
                Add option
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ pt: 2, px: 3, pb: 2 }}>
          <Button 
            onClick={() => setShowPollDialog(false)} 
            sx={{ color: '#64748b', borderRadius: '12px', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitPoll}
            disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
            sx={{
              bgcolor: '#6C5CE7',
              '&:hover': { bgcolor: '#5A4BD8' },
              borderRadius: '12px',
              fontWeight: 600,
            }}
          >
            Send Poll
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== Place Invite Dialog ==================== */}
      <Dialog
        open={showPlaceInviteDialog}
        onClose={() => setShowPlaceInviteDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 36, height: 36, borderRadius: '10px', 
            bgcolor: 'rgba(236,72,153,0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <MapPin size={20} color="#EC4899" />
          </Box>
          Invite to a Place
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Place Name"
              placeholder="e.g. Café Roma"
              value={placeInviteName}
              onChange={(e) => setPlaceInviteName(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={placeInviteType}
                label="Type"
                onChange={(e) => setPlaceInviteType(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="cafe">☕ Café</MenuItem>
                <MenuItem value="bar">🍷 Bar</MenuItem>
                <MenuItem value="restaurant">🍽️ Restaurant</MenuItem>
                <MenuItem value="park">🌳 Park</MenuItem>
                <MenuItem value="museum">🏛️ Museum</MenuItem>
                <MenuItem value="other">📍 Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              size="small"
              label="Distance (km)"
              type="number"
              value={placeInviteDistance}
              onChange={(e) => setPlaceInviteDistance(e.target.value)}
              inputProps={{ step: 0.1, min: 0 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            
            <TextField
              fullWidth
              size="small"
              label="Message (optional)"
              placeholder="I found this amazing spot!"
              value={placeInviteMessage}
              onChange={(e) => setPlaceInviteMessage(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            
            <TextField
              fullWidth
              size="small"
              label="Google Maps Link (optional)"
              placeholder="https://maps.google.com/..."
              value={placeInviteMaps}
              onChange={(e) => setPlaceInviteMaps(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ pt: 2, px: 3, pb: 2 }}>
          <Button 
            onClick={() => setShowPlaceInviteDialog(false)} 
            sx={{ color: '#64748b', borderRadius: '12px', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitPlaceInvite}
            disabled={!placeInviteName.trim()}
            sx={{
              bgcolor: '#EC4899',
              '&:hover': { bgcolor: '#DB2777' },
              borderRadius: '12px',
              fontWeight: 600,
            }}
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>

      {/* keyframes */}
      <Box
        sx={{
          "@keyframes pulseDot": {
            "0%": { boxShadow: "0 0 0 0 rgba(244,67,54,0.6)" },
            "70%": { boxShadow: "0 0 0 12px rgba(244,67,54,0)" },
            "100%": { boxShadow: "0 0 0 0 rgba(244,67,54,0)" },
          },
          "@keyframes bar0": { "0%,100%": { height: 4 }, "50%": { height: 16 } },
          "@keyframes bar1": { "0%,100%": { height: 6 }, "50%": { height: 14 } },
          "@keyframes bar2": { "0%,100%": { height: 8 }, "50%": { height: 12 } },
          "@keyframes bar3": { "0%,100%": { height: 10 }, "50%": { height: 10 } },
          "@keyframes pulseGlow": {
            "0%": { opacity: 0.9, transform: "scale(1)" },
            "50%": { opacity: 0.6, transform: "scale(1.05)" },
            "100%": { opacity: 0.9, transform: "scale(1)" },
          },
          "@keyframes smoothMove": {
            "0%": { transform: "translateX(0)" },
            "50%": { transform: "translateX(2px)" },
            "100%": { transform: "translateX(0)" },
          },
          "@keyframes subtlePulse": {
            "0%": { opacity: 0.6, transform: "scale(1)" },
            "50%": { opacity: 0.9, transform: "scale(1.1)" },
            "100%": { opacity: 0.6, transform: "scale(1)" },
          },
          "@keyframes pulse": {
            "0%": { opacity: 1 },
            "50%": { opacity: 0.5 },
            "100%": { opacity: 1 },
          },
        }}
      />
      {/* inputs for attachments */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) sendImage(f);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) sendImage(f);
          e.target.value = "";
        }}
      />
      <input
        ref={fileAttachInputRef}
        type="file"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) sendFile(f);
          e.target.value = "";
        }}
      />
    </Box>
  );
}
