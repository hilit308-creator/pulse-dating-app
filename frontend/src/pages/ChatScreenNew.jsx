// ChatScreenNew.jsx - Clean implementation per Pulse Chat Spec
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  TextField,
  Button,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputBase,
  Fade,
} from "@mui/material";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Smile,
  Wand2,
  HeartHandshake,
  Sparkles,
  X as CloseIcon,
  MapPin,
  Calendar,
  Heart,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════════════════════
// CONNECTION SOURCE TYPES
// ═══════════════════════════════════════════════════════════════
const CONNECTION_SOURCE = {
  NEARBY: 'nearby',
  EVENT: 'event',
  MATCH: 'match',
  BUSINESS: 'business',
};

const getSourceBadge = (source) => {
  switch (source) {
    case CONNECTION_SOURCE.NEARBY:
      return { icon: <MapPin size={10} />, label: 'Nearby', color: '#16a34a', bg: 'rgba(34,197,94,0.12)' };
    case CONNECTION_SOURCE.EVENT:
      return { icon: <Calendar size={10} />, label: 'Event', color: '#9333ea', bg: 'rgba(168,85,247,0.12)' };
    case CONNECTION_SOURCE.MATCH:
      return { icon: <Heart size={10} />, label: 'Match', color: '#dc2626', bg: 'rgba(239,68,68,0.12)' };
    case CONNECTION_SOURCE.BUSINESS:
      return { icon: <Building2 size={10} />, label: 'Business', color: '#2563eb', bg: 'rgba(59,130,246,0.12)' };
    default:
      return null;
  }
};

// ═══════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════
const initialChats = [
  {
    id: 1,
    user: { id: 1, name: "Liza", age: 28, photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=256&q=80" },
    connectionSource: CONNECTION_SOURCE.NEARBY,
    quickVibe: "You both love traveling",
    unreadCount: 1,
    muted: false,
    blocked: false,
    lastActive: "now",
    messages: [
      { id: 1, from: "them", text: "Hey! Would love to grab coffee and chat about travel 🌍", time: "14:32" },
    ],
  },
  {
    id: 2,
    user: { id: 2, name: "Gali", age: 25, photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80" },
    connectionSource: CONNECTION_SOURCE.EVENT,
    eventName: "Art Night @ TLV",
    quickVibe: "Same taste in art",
    unreadCount: 0,
    muted: false,
    blocked: false,
    lastActive: "recently",
    messages: [
      { id: 1, from: "them", text: "Love your vibe! Want to check out the new art gallery? ✨", time: "12:15" },
    ],
  },
  {
    id: 3,
    user: { id: 3, name: "Shani", age: 24, photo: "/liza_1.jpg" },
    connectionSource: CONNECTION_SOURCE.NEARBY,
    quickVibe: "Both night people",
    unreadCount: 2,
    muted: false,
    blocked: false,
    lastActive: "recently",
    messages: [
      { id: 1, from: "them", text: "Hey! Just got back from the most amazing photoshoot 📸", time: "11:30" },
      { id: 2, from: "them", text: "Want to grab brunch this weekend? I know the perfect spot! 🥞", time: "11:45" },
    ],
  },
  {
    id: 4,
    user: { id: 4, name: "Yael", age: 26, photo: "/gali_1.jpg" },
    connectionSource: CONNECTION_SOURCE.MATCH,
    quickVibe: "You both enjoy dancing",
    unreadCount: 0,
    muted: false,
    blocked: false,
    lastActive: "recently",
    messages: [
      { id: 1, from: "them", text: "Your profile caught my eye! Love your style 😎", time: "09:20" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// AI STYLE SUGGESTIONS
// ═══════════════════════════════════════════════════════════════
const AI_STYLES = [
  { key: 'flirty', label: '💕 Flirty', desc: 'Warm & playful' },
  { key: 'funny', label: '😄 Funny', desc: 'Ice breaker' },
  { key: 'casual', label: '☕ Casual', desc: 'Natural & easy' },
  { key: 'deep', label: '💭 Deep', desc: 'Thoughtful' },
  { key: 'playful', label: '🎲 Playful', desc: 'Curious & light' },
];

const AI_SUGGESTIONS = {
  flirty: [
    "So… is dancing something you're actually good at or just love?",
    "I feel like there's a fun story behind that vibe.",
    "Your energy is exactly my type. Drinks soon?",
  ],
  funny: [
    "Important question: comedy or action — no judgment",
    "Night person? I need details.",
    "Plot twist: I'm actually a morning person pretending to be cool",
  ],
  casual: [
    "Hey, how's your day going?",
    "What made you open Pulse today?",
    "Any fun plans for the weekend?",
  ],
  deep: [
    "What does a good connection mean to you?",
    "What kind of moments feel most 'you'?",
    "What's something you're passionate about that most people don't know?",
  ],
  playful: [
    "Sea or pool — choose wisely.",
    "Perfect date: spontaneous or planned?",
    "If we had to pick a random adventure right now, what would it be?",
  ],
};

const EVENT_SUGGESTIONS = [
  "Are you going tonight?",
  "What caught your attention about this event?",
  "First time at this kind of event?",
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const ChatScreenNew = () => {
  const [chats, setChats] = useState(initialChats);
  const [activeChat, setActiveChat] = useState(null);
  const [sortMode, setSortMode] = useState('active'); // 'active' | 'new'
  const [input, setInput] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiStyle, setAiStyle] = useState('casual');
  const messagesEndRef = useRef(null);

  // Sort and filter chats
  const displayChats = useMemo(() => {
    let filtered = chats.filter(c => !c.blocked);
    if (sortMode === 'new') {
      return [...filtered].sort((a, b) => {
        const aNew = a.messages.length <= 1;
        const bNew = b.messages.length <= 1;
        if (aNew && !bNew) return -1;
        if (!aNew && bNew) return 1;
        return 0;
      });
    }
    return filtered;
  }, [chats, sortMode]);

  const currentChat = chats.find(c => c.id === activeChat);

  // Check if user hasn't sent any messages yet
  const hasUserSentMessage = currentChat?.messages.some(m => m.from === 'me');

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  // Send message
  const handleSend = () => {
    if (!input.trim() || !activeChat) return;
    
    setChats(prev => prev.map(c => 
      c.id === activeChat 
        ? { 
            ...c, 
            messages: [...c.messages, { id: Date.now(), from: 'me', text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
            unreadCount: 0,
          }
        : c
    ));
    setInput('');
    setShowAiPanel(false);
  };

  // Mute chat
  const handleMute = () => {
    setChats(prev => prev.map(c => 
      c.id === activeChat ? { ...c, muted: !c.muted } : c
    ));
    setMenuAnchor(null);
  };

  // Block user
  const handleBlock = () => {
    if (window.confirm(`Block ${currentChat?.user.name}? They won't be able to see or message you.`)) {
      setChats(prev => prev.map(c => 
        c.id === activeChat ? { ...c, blocked: true } : c
      ));
      setActiveChat(null);
    }
    setMenuAnchor(null);
  };

  // Report user
  const handleReport = () => {
    alert(`Report submitted for ${currentChat?.user.name}. Our team will review it.`);
    setMenuAnchor(null);
  };

  // Get AI suggestions based on context
  const getAiSuggestions = () => {
    if (currentChat?.connectionSource === CONNECTION_SOURCE.EVENT) {
      return EVENT_SUGGESTIONS;
    }
    return AI_SUGGESTIONS[aiStyle] || AI_SUGGESTIONS.casual;
  };

  // ═══════════════════════════════════════════════════════════════
  // CHAT LIST VIEW
  // ═══════════════════════════════════════════════════════════════
  if (!activeChat) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', bgcolor: '#fff' }}>
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Your chats</Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 1.5 }}>
            Choose who you want to chat with
          </Typography>
          
          {/* Sort tabs */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['active', 'new'].map((mode) => (
              <Chip
                key={mode}
                label={mode === 'active' ? 'Active' : 'New connections'}
                size="small"
                onClick={() => setSortMode(mode)}
                sx={{
                  backgroundColor: sortMode === mode ? '#6C5CE7' : 'rgba(0,0,0,0.06)',
                  color: sortMode === mode ? '#fff' : '#64748b',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: sortMode === mode ? '#5b4cdb' : 'rgba(0,0,0,0.1)' },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Chat List */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {displayChats.map((chat) => {
            const badge = getSourceBadge(chat.connectionSource);
            return (
              <Box
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#fafafa' },
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                <Avatar src={chat.user.photo} sx={{ width: 52, height: 52 }} />
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography noWrap sx={{ fontWeight: 700 }}>
                      {chat.user.name}, {chat.user.age}
                    </Typography>
                    {badge && (
                      <Box sx={{ 
                        display: 'flex', alignItems: 'center', gap: 0.25,
                        px: 0.6, py: 0.15, borderRadius: '5px', fontSize: '0.55rem', fontWeight: 600,
                        backgroundColor: badge.bg, color: badge.color,
                      }}>
                        {badge.icon}
                        <span style={{ marginLeft: 2 }}>{badge.label}</span>
                      </Box>
                    )}
                    {chat.muted && <span>🔕</span>}
                  </Box>
                  <Typography noWrap variant="body2" sx={{ color: '#6B7280' }}>
                    {chat.messages[chat.messages.length - 1]?.text || 'Say hi 👋'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    {chat.messages[chat.messages.length - 1]?.time || ''}
                  </Typography>
                  {chat.unreadCount > 0 && (
                    <Box sx={{
                      minWidth: 18, height: 18, borderRadius: '9px',
                      backgroundColor: '#6C5CE7', color: '#fff',
                      fontSize: '0.65rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5,
                    }}>
                      {chat.unreadCount}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // CHAT ROOM VIEW
  // ═══════════════════════════════════════════════════════════════
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', bgcolor: '#f5f5f5' }}>
      {/* Chat Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 2, py: 1.25,
        bgcolor: '#fff', borderBottom: '1px solid #eee',
      }}>
        <IconButton onClick={() => setActiveChat(null)} size="small">
          <ArrowLeft size={20} />
        </IconButton>
        
        <Avatar src={currentChat?.user.photo} sx={{ width: 40, height: 40 }} />
        
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {currentChat?.user.name}, {currentChat?.user.age}
          </Typography>
          {/* Softer presence - no exact "last seen" */}
          <Typography variant="caption" sx={{ color: '#6B7280' }}>
            {currentChat?.lastActive === 'now' ? 'Active now' : 'Active recently'}
          </Typography>
        </Box>

        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small">
          <MoreVertical size={20} />
        </IconButton>
      </Box>

      {/* More Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={handleMute}>
          {currentChat?.muted ? '🔔 Unmute chat' : '🔕 Mute chat'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleBlock} sx={{ color: '#ef4444' }}>
          🚫 Block {currentChat?.user.name}
        </MenuItem>
        <MenuItem onClick={handleReport} sx={{ color: '#ef4444' }}>
          🚩 Report {currentChat?.user.name}
        </MenuItem>
      </Menu>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1 }}>
        {/* Quick Vibe Line */}
        {currentChat?.quickVibe && (
          <Box sx={{
            mt: 1, mb: 1.5, mx: 'auto', px: 2, py: 0.75,
            maxWidth: 'fit-content',
            bgcolor: 'rgba(108,92,231,0.1)', borderRadius: '20px',
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <HeartHandshake size={14} color="#6C5CE7" />
            <Typography variant="caption" sx={{ color: '#6C5CE7', fontWeight: 500 }}>
              {currentChat.quickVibe}
            </Typography>
          </Box>
        )}

        {/* Event Context */}
        {currentChat?.connectionSource === CONNECTION_SOURCE.EVENT && currentChat?.eventName && (
          <Box sx={{
            mb: 1.5, mx: 'auto', px: 2, py: 0.75,
            maxWidth: 'fit-content',
            bgcolor: 'rgba(168,85,247,0.1)', borderRadius: '20px',
          }}>
            <Typography variant="caption" sx={{ color: '#9333ea', fontWeight: 500 }}>
              🎉 Met at {currentChat.eventName}
            </Typography>
          </Box>
        )}

        {/* "Need inspiration?" Nudge */}
        {!hasUserSentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Box sx={{
              mt: 2, mb: 2, mx: 'auto', p: 2, maxWidth: 280,
              backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '16px',
              border: '1px solid rgba(108,92,231,0.15)', textAlign: 'center',
            }}>
              <Sparkles size={24} color="#6C5CE7" style={{ marginBottom: 8 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5 }}>
                Need inspiration?
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                AI can help you start the conversation
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Wand2 size={14} />}
                onClick={() => setShowAiPanel(true)}
                sx={{
                  borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  boxShadow: '0 4px 12px rgba(108,92,231,0.3)',
                }}
              >
                Get suggestions
              </Button>
            </Box>
          </motion.div>
        )}

        {/* Messages - NO SEEN INDICATORS */}
        {currentChat?.messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start',
              mb: 1,
            }}
          >
            <Box sx={{
              maxWidth: '75%',
              px: 1.5, py: 1,
              borderRadius: msg.from === 'me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              bgcolor: msg.from === 'me' ? '#6C5CE7' : '#fff',
              color: msg.from === 'me' ? '#fff' : '#1a1a2e',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}>
              <Typography variant="body2">{msg.text}</Typography>
              <Typography variant="caption" sx={{ 
                display: 'block', textAlign: 'right', mt: 0.25,
                color: msg.from === 'me' ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                fontSize: '0.65rem',
              }}>
                {msg.time}
                {/* NO ✓✓ seen indicators per spec */}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* AI Suggestions Panel */}
      <AnimatePresence>
        {showAiPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Box sx={{
              mx: 2, mb: 1, p: 1.5,
              bgcolor: '#fff', borderRadius: '16px',
              border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Wand2 size={16} color="#6C5CE7" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Choose a style</Typography>
                </Box>
                <IconButton size="small" onClick={() => setShowAiPanel(false)}>
                  <CloseIcon size={16} />
                </IconButton>
              </Box>

              {/* Style Chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                {AI_STYLES.map((style) => (
                  <Chip
                    key={style.key}
                    label={style.label}
                    size="small"
                    onClick={() => setAiStyle(style.key)}
                    sx={{
                      backgroundColor: aiStyle === style.key ? '#6C5CE7' : 'rgba(0,0,0,0.06)',
                      color: aiStyle === style.key ? '#fff' : '#374151',
                      fontWeight: 500,
                      '&:hover': { backgroundColor: aiStyle === style.key ? '#5b4cdb' : 'rgba(0,0,0,0.1)' },
                    }}
                  />
                ))}
              </Box>

              {/* Suggestions */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {getAiSuggestions().map((suggestion, i) => (
                  <Button
                    key={i}
                    size="small"
                    variant="outlined"
                    onClick={() => { setInput(suggestion); setShowAiPanel(false); }}
                    sx={{
                      justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none',
                      borderRadius: '10px', borderColor: 'rgba(0,0,0,0.1)', color: '#374151',
                      fontSize: '0.8rem', py: 1,
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2, py: 1.25,
        bgcolor: '#fff', borderTop: '1px solid #eee',
      }}>
        <IconButton size="small" onClick={() => setShowAiPanel(!showAiPanel)}>
          <Wand2 size={20} color={showAiPanel ? '#6C5CE7' : '#6B7280'} />
        </IconButton>
        
        <Box sx={{
          flex: 1, display: 'flex', alignItems: 'center',
          bgcolor: '#f5f5f5', borderRadius: '24px', px: 1.5,
        }}>
          <IconButton size="small">
            <Smile size={20} color="#6B7280" />
          </IconButton>
          <InputBase
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            fullWidth
            sx={{ mx: 1 }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
        </Box>

        <IconButton
          onClick={handleSend}
          disabled={!input.trim()}
          sx={{
            bgcolor: input.trim() ? '#6C5CE7' : 'rgba(0,0,0,0.06)',
            color: input.trim() ? '#fff' : '#9CA3AF',
            '&:hover': { bgcolor: input.trim() ? '#5b4cdb' : 'rgba(0,0,0,0.1)' },
          }}
        >
          <Send size={18} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatScreenNew;
