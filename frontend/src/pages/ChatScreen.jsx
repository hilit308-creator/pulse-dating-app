// ChatScreen.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
  useCallback,
} from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Popper,
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
  Divider,
  Tooltip,
  Alert,
} from "@mui/material";
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
} from "lucide-react";

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

/* --------- Demo data (כולל “שוחח עם AI” + “Therapist Bot”) --------- */
const DEFAULT_DISAPPEARING_SECONDS = 7200; // ← שעתיים ברירת־מחדל

const THERAPIST_ID = "bot-therapy";

const THERAPY_ROW = {
  matchId: THERAPIST_ID,
  user: {
    id: THERAPIST_ID,
    name: "Therapist Bot",
    age: "",
    photoUrl: "",
  },
  user24hPhoto: null,
  messages: [
    {
      id: 9001,
      from: "them",
      type: "text",
      text:
        "היי, אני כאן לשיחה תומכת ולא-קלינית. כתבי/ה מה מרגישים עכשיו ונחשוב יחד על צעד קטן שיעזור. במצב חירום — פנו מיד לעזרה דחופה באזורכם.",
      timestamp: Date.now() - 10 * 60 * 1000,
      status: "read",
      reactions: {},
    },
  ],
  lastSentAt: Date.now() - 10 * 60 * 1000,
  status: "active",
  pinned: true,
  muted: false,
  themeColor: "#EEF6FF",
  disappearingSeconds: DEFAULT_DISAPPEARING_SECONDS,
  therapist: true,
};

const AI_ADVISOR_ROW = {
  matchId: -999,
  user: {
    id: -999,
    name: "AI Coach",
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
        "אני כאן לעזור לך לנסח הודעות חכמות ומהירות בהתאם למי שמולך. בחר יעד שיחה משמאל או שלח לי הקשר קצר 😄",
      timestamp: Date.now() - 120000,
      status: "read",
      reactions: {},
    },
  ],
  lastSentAt: Date.now() - 120000,
  status: "active",
  pinned: true,
  muted: false,
  themeColor: "#F7F7FE",
  disappearingSeconds: DEFAULT_DISAPPEARING_SECONDS,
};

const demoChats = [
  {
    matchId: 4,
    user: {
      id: 4,
      name: "Liza",
      age: 28,
      photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=256&q=80",
    },
    user24hPhoto: null,
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
    },
    user24hPhoto: null,
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
          bgcolor: "#25D366",
          color: "#fff",
          width: 32,
          height: 32,
          "&:hover": { bgcolor: "#20bd5b" },
        }}
      >
        {playing ? "❚❚" : "▶"}
      </IconButton>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ height: 4, bgcolor: "#D9FDD3", borderRadius: 999 }}>
          <Box
            sx={{
              width: `${Math.round(progress * 100)}%`,
              height: 4,
              borderRadius: 999,
              bgcolor: "#128C7E",
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
}) {
  const bg = isMe ? "#DCF8C6" : "#FFFFFF";
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
          px: 1.5,
          py: 1,
          bgcolor: bg,
          borderRadius: 3,
          borderTopRightRadius: isMe ? 4 : 12,
          borderTopLeftRadius: isMe ? 12 : 4,
          maxWidth: 360,
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
              borderLeft: "3px solid #7aa6ff",
              bgcolor: "#f6f7fb",
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
          <Box sx={{ mt: 0.25, p: 1, border: "1px solid #e5e7eb", borderRadius: 2, bgcolor: "#fff" }}>
            {msg.place?.image && (
              <img src={msg.place.image} alt={msg.place.name} style={{ width: "100%", borderRadius: 8, marginBottom: 8 }} />
            )}
            <Typography sx={{ fontWeight: 800 }}>{msg.place?.name || "Place"}</Typography>
            {msg.text && (
              <Typography variant="body2" sx={{ color: "#555", mt: 0.25 }}>
                {msg.text}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              {msg.place?.type ? `${msg.place.type} • ` : ""}
              {typeof msg.place?.distance === "number" ? `${msg.place.distance.toFixed(1)} km` : ""}
            </Typography>
            {msg.place?.maps && (
              <Box sx={{ mt: 0.75 }}>
                <Button size="small" variant="outlined" href={msg.place.maps} target="_blank" rel="noreferrer" sx={{ borderRadius: 999 }}>
                  Open map
                </Button>
              </Box>
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
            sx={{ p: 1, border: "1px solid #e5e7eb", borderRadius: 2, bgcolor: "#fff" }}
          >
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
              {msg.poll.question}
            </Typography>
            {(msg.poll.options || []).map((opt, i) => (
              <Button
                key={i}
                size="small"
                variant={msg.poll.voted === i ? "contained" : "outlined"}
                onClick={() =>
                  msg.onVote?.(i) || null
                }
                sx={{ mr: 0.5, mb: 0.5 }}
              >
                {opt}
              </Button>
            ))}
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
            mt: 0.25,
          }}
        >
          {msg.starred && <span title="Starred">⭐</span>}
          <Typography variant="caption" sx={{ color: "#6B7280" }}>
            {fmtHM(msg.timestamp)}
            {msg.edited && " · edited"}
          </Typography>
          {isMe &&
            (msg.status === "read" ? (
              <CheckCheck size={16} color="#53BDEB" />
            ) : msg.status === "delivered" ? (
              <CheckCheck size={16} />
            ) : (
              <Check size={16} />
            ))}
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
const EmojiMart = React.lazy(() =>
  import("@emoji-mart/react").catch(() => ({ default: null }))
);
const emojiDataPromise = () =>
  import("@emoji-mart/data").catch(() => ({ default: null }));

function EmojiBottomSheet({ open, onClose, onPick }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let m = true;
    emojiDataPromise().then((mod) => {
      if (m) setData(mod?.default || null);
    });
    return () => {
      m = false;
    };
  }, []);

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: { height: 360, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 4,
            bgcolor: "#ddd",
            borderRadius: 999,
            mx: "auto",
            mb: 1,
          }}
        />
        <Suspense
          fallback={<Typography sx={{ p: 2, color: "#777" }}>Loading emoji…</Typography>}
        >
          {EmojiMart && data ? (
            <EmojiMart
              data={data}
              onEmojiSelect={(e) => {
                const sym = e.native || e.shortcodes || "";
                onPick(sym);
              }}
              theme="light"
              previewPosition="none"
              searchPosition="top"
              navPosition="top"
              perLine={8}
              emojiSize={22}
            />
          ) : (
            <Grid container spacing={0.5}>
              {[
                "😀","😁","😂","🤣","😊","😍","😘","🤗","🥰","😉","😎","🤔",
                "😅","😭","😡","👍","👎","🙏","👏","💪","🔥","💯","✨","🎉",
                "🥳","😴","😇","🤤","🤯","🤝",
              ].map((e, i) => (
                <Grid item xs={2} key={i}>
                  <Button
                    onClick={() => onPick(e)}
                    sx={{ minWidth: 0, fontSize: 22, p: 0.5 }}
                  >
                    {e}
                  </Button>
                </Grid>
              ))}
            </Grid>
          )}
        </Suspense>
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
    "תודה ששיתפת. אני כאן להקשיב. מה שאת/ה מרגיש/ה חשוב. נוכל לנסות צעד קטן מידי: ";
  const suggestions = [
    "לנשום 4-7-8 פעמיים ולהרגיש איך הגוף נרגע.",
    "לתאר במילים מה קורה לי עכשיו (מחשבות/רגשות/תחושות גוף).",
    "לבחור פעולה קטנה אחת שתיטיב איתי ב־15 הדקות הקרובות.",
  ];
  const pick = suggestions[Math.floor(Math.random() * suggestions.length)];
  let reply = `${base}${pick}`;
  if (isCrisis(userText)) {
    reply =
      "מצטער/ת לשמוע שזה כל כך קשה עכשיו. אם יש סכנה מיידית או תחושת משבר, חשוב לפנות לעזרה דחופה באזורך (חירום/מוקד משברי/אדם קרוב). אני כאן לשיחה תומכת, לא במקום טיפול או סיוע חירום.";
  }
  return reply;
}

/* ================== Main ================== */
export default function ChatScreen() {
  const [chats, setChats] = useState([THERAPY_ROW, AI_ADVISOR_ROW, ...demoChats]);
  const [openChat, setOpenChat] = useState(null);
  const chat = useMemo(
    () => chats.find((c) => c.matchId === openChat),
    [chats, openChat]
  );

  const sortedChats = useMemo(() => {
    return [...chats].sort(
      (a, b) =>
        (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
        (b.lastSentAt || 0) - (a.lastSentAt || 0)
    );
  }, [chats]);

  useEffect(() => {
    if (typeof document !== "undefined" && document.body) {
      document.body.dataset.hideTabBar = openChat ? "true" : "false";
    }
    return () => {
      if (typeof document !== "undefined" && document.body) {
        delete document.body.dataset.hideTabBar;
      }
    };
  }, [openChat]);

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

  // typing / recording indicators
  const [typing, setTyping] = useState(false);
  const [theirRecording, setTheirRecording] = useState(false);

  // calls
  const [call, setCall] = useState(null);
  const startCall = (type) => setCall({ type, with: chat?.user });
  const endCall = () => setCall(null);

  // gallery
  const [gallery, setGallery] = useState({ open: false, images: [] });
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
    if (!footerRef.current) return;
    const ro = new ResizeObserver(([e]) =>
      setFooterH(Math.ceil(e.contentRect.height))
    );
    ro.observe(footerRef.current);
    return () => ro.disconnect();
  }, []);
  const scrollToBottom = (behavior = "auto") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };
  useEffect(() => {
    if (openChat) scrollToBottom("auto");
  }, [openChat]);
  useEffect(() => {
    if (openChat) scrollToBottom("smooth");
  }, [chat?.messages?.length, footerH]);

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
  const createPoll = async () => {
    const q = prompt("Poll question");
    if (!q) return;
    const opts = prompt("Comma separated options (2-5)")
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);
    if (!opts || opts.length < 2) return;
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
  };
  const createPlaceInvite = async () => {
    const name = prompt("Place name");
    if (!name) return;
    const type = prompt("Type (cafe/bar/restaurant)") || "place";
    const distanceKm = Number(prompt("Distance in km (e.g. 0.6)") || "0.6");
    const text = prompt("Message (optional)") || "";
    const maps = prompt("Google Maps URL (optional)") || "";
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
                  text,
                  place: { name, type, distance: distanceKm, maps },
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

  /* ================== AI: state & prefs ================== */
  const [aiAnchor, setAiAnchor] = useState(null);
  const [aiTone, setAiTone] = useState("friendly");
  const [aiLen, setAiLen] = useState("short");
  const [aiIntent, setAiIntent] = useState("open");
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

  const computeAI = useCallback(() => {
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
  }, [chat?.matchId, chat?.user?.name, chat?.messages, aiTone, aiLen, aiIntent]);

  useEffect(() => {
    if (!chat) return;
    computeAI();
  }, [computeAI]);

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

  /* ======= Therapist state ======= */
  const isAIChat = chat?.matchId === AI_ADVISOR_ROW.matchId;
  const isTherapy = chat?.matchId === THERAPIST_ID;
  const [showCrisis, setShowCrisis] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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
    const sentId = pushMessage(input.trim(), extra);

    if (isTherapy) {
      const crisis = isCrisis(input);
      if (crisis) setShowCrisis(true);
      setTimeout(() => {
        setChats((prev) =>
          prev.map((c) =>
            c.matchId !== THERAPIST_ID
              ? c
              : {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      id: Date.now() + 1,
                      from: "them",
                      type: "text",
                      text: genTherapyReply(input),
                      timestamp: Date.now(),
                      status: "read",
                      reactions: {},
                      replyTo: { id: sentId, from: "me", text: input },
                    },
                  ],
                  lastSentAt: Date.now(),
                }
          )
        );
      }, 700);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
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
    try {
      if (mrRef.current && mrRef.current.state !== "inactive") mrRef.current.stop();
    } catch {}
    mrRef.current = null;
    chunksRef.current = [];
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const stopAndSendRecording = () => {
    clearInterval(recTimerRef.current);
    setRecActive(false);
    try {
      if (mrRef.current && mrRef.current.state !== "inactive") mrRef.current.stop();
    } catch {}
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
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
                  audioUrl: url,
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

    mrRef.current = null;
    chunksRef.current = [];
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecMs(0);
  };

  /* ================== LIST VIEW ================== */
  if (!openChat) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", bgcolor: "#fff" }}>
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #eee",
            position: "sticky",
            top: 0,
            bgcolor: "#fff",
            zIndex: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Your chats
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            Choose who you want to chat with
          </Typography>
        </Box>

        {/* Chat List (כולל כפתורי “בקש AI” ו“תמיכה”) */}
        <Box sx={{ flex: 1, overflowY: "auto", pt: 1 }}>
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
                      setOpenChat(AI_ADVISOR_ROW.matchId);
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
                      setOpenChat(THERAPIST_ID);
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
                onClick={() => setOpenChat(c.matchId)}
                role="button"
                aria-label={`Open chat with ${c.user.name}`}
              >
                <Avatar
                  src={c.user.photoUrl}
                  onClick={(e) => {
                    e.stopPropagation();
                    c.user24hPhoto ? handleUserStoryClick(c.matchId) : setOpenChat(c.matchId);
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
                  <Typography noWrap sx={{ fontWeight: 700 }}>
                    {c.user.name}{c.user.age ? `, ${c.user.age}` : ""} {c.pinned && "📌"} {c.muted && "🔕"}
                  </Typography>
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
                <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                  {c.lastSentAt ? fmtHM(c.lastSentAt) : ""}
                </Typography>
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
                Close
              </Button>
            </Box>
          </Fade>
        </Modal>
      </Box>
    );
  }

  /* ================== CHAT VIEW ================== */
  const presenceLabel =
    chat.status === "active" ? "online" : `last seen ${fmtHM(chat.lastSentAt)}`;
  const doodleBg = `url("data:image/svg+xml,%3Csvg width='180' height='180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23EDEDED'%3E%3Ccircle cx='10' cy='10' r='1.2'/%3E%3Ccircle cx='90' cy='30' r='1.2'/%3E%3Ccircle cx='160' cy='80' r='1.2'/%3E%3Ccircle cx='40' cy='130' r='1.2'/%3E%3Ccircle cx='120' cy='160' r='1.2'/%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", bgcolor: "#fff" }}>
      {/* In-chat header */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          top: 56,
          zIndex: 1400,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.25,
          py: 1,
          borderBottom: "1px solid #E5E7EB",
          background: "#fff",
        }}
      >
        <IconButton onClick={() => setOpenChat(null)} aria-label="Back">
          <ArrowLeft />
        </IconButton>
        <Avatar
          src={chat.user.photoUrl}
          sx={{ width: 36, height: 36, mx: 1, cursor: "pointer" }}
          onClick={() => setViewProfile({ open: true, user: chat.user })}
        />
        <Box
          sx={{ flex: 1, minWidth: 0, cursor: "pointer" }}
          onClick={() => setViewProfile({ open: true, user: chat.user })}
        >
          <Typography noWrap sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            {chat.user.name}{chat.user.age ? `, ${chat.user.age}` : ""}
          </Typography>
          <Typography variant="caption" sx={{ color: "#6B7280" }}>
            {chat.matchId === AI_ADVISOR_ROW.matchId
              ? "coach online"
              : chat.matchId === THERAPIST_ID
              ? "support online"
              : presenceLabel}
            {typing && chat.matchId !== AI_ADVISOR_ROW.matchId && chat.matchId !== THERAPIST_ID && " · typing…"}
          </Typography>
        </Box>
        {chat.matchId !== AI_ADVISOR_ROW.matchId && chat.matchId !== THERAPIST_ID && (
          <>
            <IconButton aria-label="Video call" onClick={() => startCall("video")}>
              <Video />
            </IconButton>
            <IconButton aria-label="Voice call" onClick={() => startCall("voice")}>
              <Phone />
            </IconButton>
          </>
        )}
        <IconButton aria-label="Search" onClick={() => setSearchOpen((v) => !v)}>
          <Search />
        </IconButton>
        <IconButton aria-label="More" onClick={(e) => setMenuEl(e.currentTarget)}>
          <MoreVertical />
        </IconButton>
      </Box>
      <Box sx={{ height: 56 }} />

      {/* Search bar */}
      {searchOpen && (
        <Box
          sx={{
            px: 1.25,
            py: 1,
            borderBottom: "1px solid #E5E7EB",
            bgcolor: "#fff",
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <TextField
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            fullWidth
            size="small"
            placeholder="Search in chat…"
            aria-label="Search in chat"
          />
          <Chip label={`${matches.length}`} />
        </Box>
      )}

      <Menu
        anchorEl={menuEl}
        open={Boolean(menuEl)}
        onClose={() => setMenuEl(null)}
        keepMounted
      >
        {chat.matchId !== AI_ADVISOR_ROW.matchId && chat.matchId !== THERAPIST_ID && (
          <>
            <MenuItem
              onClick={() => {
                const color =
                  prompt("Enter theme color (hex / css)", chat.themeColor || "#ECE5DD") ||
                  chat.themeColor;
                setChats((prev) =>
                  prev.map((c) => (c.matchId === openChat ? { ...c, themeColor: color } : c))
                );
                setMenuEl(null);
              }}
            >
              Set chat color
            </MenuItem>
            <MenuItem
              onClick={() => {
                const ttl =
                  Number(
                    prompt("Disappearing messages (seconds, 0=off)", `${chat.disappearingSeconds || 0}`)
                  ) || 0;
                setChats((prev) =>
                  prev.map((c) =>
                    c.matchId === openChat ? { ...c, disappearingSeconds: ttl } : c
                  )
                );
                setMenuEl(null);
              }}
            >
              Disappearing messages…
            </MenuItem>
            <MenuItem
              onClick={() => {
                openGallery();
                setMenuEl(null);
              }}
            >
              Media gallery
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem onClick={() => setMenuEl(null)}>Clear chat</MenuItem>
        <MenuItem onClick={() => setMenuEl(null)}>Delete chat</MenuItem>
      </Menu>

      {/* Crisis banner */}
      {chat.matchId === THERAPIST_ID && showCrisis && (
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

      {/* Messages */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.25,
          backgroundImage: doodleBg,
          backgroundColor: chat.themeColor || "#ECE5DD",
          backgroundBlendMode: "multiply",
          pb: `calc(${footerH}px + var(--app-bottom-nav-height, 64px) + env(safe-area-inset-bottom, 0px))`,
          scrollPaddingBottom: `calc(${footerH}px + var(--app-bottom-nav-height, 64px) + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        {/* Quick Coach */}
        {chat.matchId === AI_ADVISOR_ROW.matchId && (
          <Box sx={{ mt: 1, mb: 1, p: 1, bgcolor: "#F8FAFF", border: "1px solid #E5E7EB", borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Quick Coach
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {["open", "followup", "invite", "compliment", "clarify"].map((k) => (
                <Chip
                  key={k}
                  size="small"
                  label={k}
                  color={aiIntent === k ? "primary" : "default"}
                  onClick={() => {
                    setAiIntent(k); persistIfNeeded(null, null, k); computeAI();
                  }}
                />
              ))}
              <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
              {["friendly", "playful", "formal", "flirty", "confident"].map((t) => (
                <Chip
                  key={t}
                  size="small"
                  label={t}
                  color={aiTone === t ? "primary" : "default"}
                  onClick={() => {
                    setAiTone(t); persistIfNeeded(t, null, null); computeAI();
                  }}
                />
              ))}
              <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
              {["short", "medium", "long"].map((l) => (
                <Chip
                  key={l}
                  size="small"
                  label={l}
                  color={aiLen === l ? "primary" : "default"}
                  onClick={() => {
                    setAiLen(l); persistIfNeeded(null, l, null); computeAI();
                  }}
                />
              ))}
              <FormControlLabel
                sx={{ ml: 1 }}
                control={
                  <Checkbox
                    size="small"
                    checked={aiRemember}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setAiRemember(v);
                      if (!chat?.matchId) return;
                      if (v) {
                        localStorage.setItem(`ai_tone_${chat.matchId}`, aiTone);
                        localStorage.setItem(`ai_len_${chat.matchId}`, aiLen);
                        localStorage.setItem(`ai_intent_${chat.matchId}`, aiIntent);
                      } else {
                        localStorage.removeItem(`ai_tone_${chat.matchId}`);
                        localStorage.removeItem(`ai_len_${chat.matchId}`);
                        localStorage.removeItem(`ai_intent_${chat.matchId}`);
                      }
                    }}
                  />
                }
                label={<Typography variant="caption" sx={{ color: "#64748b" }}>Remember for this chat</Typography>}
              />
            </Box>
            <Box sx={{ mt: 1, display: "grid", gap: 0.5 }}>
              {aiOptions.map((s, i) => (
                <Box key={i} sx={{ p: 1, border: "1px solid #e5e7eb", borderRadius: 1, bgcolor: "#fff" }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>{s}</Typography>
                  <Button size="small" onClick={() => setInput(s)} sx={{ borderRadius: 999 }} startIcon={<MessageCircleQuestion size={16} />}>
                    Insert
                  </Button>
                </Box>
              ))}
              <Box sx={{ textAlign: "right" }}>
                <Button size="small" onClick={computeAI}>Regenerate</Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* Therapist quick panel */}
        {chat.matchId === THERAPIST_ID && (
          <Box sx={{ mt: 1, mb: 1, p: 1, bgcolor: "#F6FEF9", border: "1px solid #D1FAE5", borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Support tools (non-clinical)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {[
                { k: "Check-in", v: "Right now I feel… (emotion / body sensation). The urge is… and I want to choose a tiny step that helps me feel 1% better." },
                { k: "Grounding 5-4-3-2-1", v: "Let’s try grounding: 5 things I see… 4 I can touch… 3 I hear… 2 I smell… 1 I taste." },
                { k: "Reframe", v: "A helpful thought I can try: (Even if X happens, I can Y). Another possible perspective is…" },
                { k: "Plan step", v: "Tiny step for next 10–15 min: (water / short walk / music / message a friend / shower / stretch)." },
                { k: "Breathing 4-7-8", v: "Inhale 4 • Hold 7 • Exhale 8 — repeat x2 and notice where the body softens." },
              ].map((o) => (
                <Chip key={o.k} size="small" label={o.k} onClick={() => setInput(o.v)} />
              ))}
              <Button size="small" sx={{ ml: "auto" }} onClick={() => setHelpOpen(true)}>
                Help resources
              </Button>
            </Box>
            <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "#6b7280" }}>
              איני מטפל/ת מוסמך/ת. אם יש סכנה מיידית — פנו לעזרה דחופה באזורכם.
            </Typography>
          </Box>
        )}

        {chat.messages.map((m, i, arr) => {
          const prev = arr[i - 1];
          const dayBreak = !prev || !isSameDay(prev.timestamp, m.timestamp);
          return (
            <Fade in key={m.id} timeout={180}>
              <div>
                {dayBreak && (
                  <Box sx={{ my: 1.5, textAlign: "center" }}>
                    <Chip size="small" label={new Date(m.timestamp).toLocaleDateString()} />
                  </Box>
                )}
                <ChatBubble
                  msg={m}
                  isMe={m.from === "me"}
                  onDoubleLike={() => toggleHeart(m.id)}
                  onLongPressStart={(anchorEl) => reactPop.openFor(m.id)}
                  onOpenActions={openMsgActions}
                />
              </div>
            </Fade>
          );
        })}
      </Box>

      {/* Smart replies */}
      {chat.matchId !== AI_ADVISOR_ROW.matchId && chat.matchId !== THERAPIST_ID && smart.length > 0 && (
        <Box sx={{ px: 1.25, py: 0.75, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {smart.map((s, i) => (
            <Chip key={i} label={s} onClick={() => setInput(s)} />
          ))}
        </Box>
      )}

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

      {/* Composer */}
      <Box
        ref={footerRef}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom:
            "calc(env(safe-area-inset-bottom, 0px) + var(--app-bottom-nav-height, 64px))",
          zIndex: 1500,
          bgcolor: "#F0F2F5",
          borderTop: "1px solid #E5E7EB",
          px: 1,
          pt: replyDraft || editDraft ? 0.5 : 1,
          pb: `calc(1rem + env(safe-area-inset-bottom, 0px))`,
        }}
      >
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Attach menu trigger */}
          <IconButton
            aria-label="Open attachments"
            onClick={(e) => setAttachMenu({ open: true, anchor: e.currentTarget })}
          >
            <Plus />
          </IconButton>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              bgcolor: "#fff",
              borderRadius: 999,
              border: "1px solid #E5E7EB",
            }}
          >
            <Tooltip title="Emoji">
              <IconButton
                aria-label="Open emoji"
                size="small"
                onClick={() => {
                  setEmojiMode("compose");
                  setEmojiOpen(true);
                }}
              >
                <Smile size={18} />
              </IconButton>
            </Tooltip>

            <Tooltip title="AI Suggestions">
              <IconButton
                aria-label="AI Suggestions"
                size="small"
                onClick={(e) => {
                  setAiAnchor(e.currentTarget);
                  computeAI();
                }}
              >
                <Wand2 size={18} />
              </IconButton>
            </Tooltip>

            <InputBase
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                chat.matchId === AI_ADVISOR_ROW.matchId
                  ? "Write context or pick a suggestion…"
                  : chat.matchId === THERAPIST_ID
                  ? "Share what’s on your mind…"
                  : "Type a message"
              }
              multiline
              maxRows={4}
              fullWidth
              sx={{ mx: 1 }}
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

            <Tooltip title="Attach file">
              <IconButton aria-label="Attach file" size="small" onClick={() => fileAttachInputRef.current?.click()}>
                <Paperclip size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Attach image">
              <IconButton
                aria-label="Attach image"
                size="small"
                onClick={() => imageInputRef.current?.click()}
              >
                <Camera size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Send">
              <IconButton aria-label="Send" size="small" onClick={handleSend}>
                <Send size={18} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Mic: Press & Hold */}
          <Tooltip title="Hold to record">
            <IconButton
              aria-label="Voice message"
              sx={{
                bgcolor: "#00A884",
                color: "#fff",
                width: 42,
                height: 42,
                borderRadius: "50%",
                "&:hover": { bgcolor: "#01966f" },
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
              <Mic size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Attachments popper */}
      <Popper
        open={Boolean(attachMenu?.open)}
        anchorEl={attachMenu?.anchor}
        placement="top-start"
        modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
        sx={{ zIndex: 22 }}
      >
        <Box sx={{ p: 1, bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 2, boxShadow: 3, display: "flex", gap: 1 }}>
          <Button size="small" onClick={() => { imageInputRef.current?.click(); setAttachMenu(null); }}>Photo/Video</Button>
          <Button size="small" onClick={() => { fileAttachInputRef.current?.click(); setAttachMenu(null); }}>File</Button>
          <Button size="small" onClick={() => { shareLocation(); setAttachMenu(null); }}>Location</Button>
          <Button size="small" onClick={() => { shareContact(); setAttachMenu(null); }}>Contact</Button>
          <Button size="small" onClick={() => { createPoll(); setAttachMenu(null); }}>Poll</Button>
          <Button size="small" onClick={() => { createPlaceInvite(); setAttachMenu(null); }}>Place invite</Button>
        </Box>
      </Popper>

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

      {/* Calls modal */}
      <Modal open={!!call} onClose={endCall}>
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(0,0,0,.6)",
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "#111",
              color: "#fff",
              minWidth: 280,
              textAlign: "center",
            }}
          >
            <Typography sx={{ mb: 1 }}>
              {call?.type === "video" ? "Video" : "Voice"} call with {call?.with?.name}
            </Typography>
            <Button onClick={endCall} variant="contained" color="error">
              End
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Media Gallery */}
      <Modal open={gallery.open} onClose={() => setGallery({ open: false, images: [] })}>
        <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,.8)", p: 3, overflow: "auto" }}>
          <Grid container spacing={2}>
            {gallery.images.map((src, i) => (
              <Grid key={i} item xs={6} sm={4} md={3}>
                <img src={src} alt="" style={{ width: "100%", borderRadius: 8 }} />
              </Grid>
            ))}
          </Grid>
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
      <Popper
        open={Boolean(aiAnchor)}
        anchorEl={aiAnchor}
        placement="top-start"
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
        sx={{ zIndex: 22 }}
      >
        <Box sx={{ p: 1, bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: 2, boxShadow: 3, minWidth: 280 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>AI Suggestions</Typography>
            <Button size="small" onClick={() => setAiAnchor(null)}>Close</Button>
          </Box>

          <Box sx={{ mb: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {["open","followup","invite","compliment","clarify"].map((k)=>(
              <Chip key={k} size="small" label={k} onClick={() => { setAiIntent(k); persistIfNeeded(null,null,k); computeAI(); }} color={aiIntent===k?'primary':'default'} />
            ))}
          </Box>

          <Box sx={{ mb: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {["friendly","playful","formal","flirty","confident"].map((t)=>(
              <Chip key={t} size="small" label={t} onClick={() => { setAiTone(t); persistIfNeeded(t,null,null); computeAI(); }} color={aiTone===t?'primary':'default'} />
            ))}
          </Box>

          <Box sx={{ mb: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {["short","medium","long"].map((l)=>(
              <Chip key={l} size="small" label={l} onClick={() => { setAiLen(l); persistIfNeeded(null,l,null); computeAI(); }} color={aiLen===l?'primary':'default'} />
            ))}
            <FormControlLabel
              sx={{ ml: 0.5 }}
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
          </Box>

          <Box sx={{ display: 'grid', gap: 0.5 }}>
            {aiOptions.map((s, i) => (
              <Box key={i} sx={{ p: 1, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>{s}</Typography>
                <Button size="small" onClick={() => { setInput(s); setAiAnchor(null); }} sx={{ borderRadius: 999 }}>
                  Insert
                </Button>
              </Box>
            ))}
          </Box>

          <Box sx={{ textAlign: 'right', mt: 0.5 }}>
            <Button size="small" onClick={computeAI}>Regenerate</Button>
          </Box>
        </Box>
      </Popper>

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
