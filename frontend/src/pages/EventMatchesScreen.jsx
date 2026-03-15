/**
 * EventMatchesScreen - Shows matches attending an event
 * Uses Matches-style compact profile cards
 * Synced with EventsByCategory - uses EVENTS and DEMO_ATTENDEES data
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  MessageCircle,
  X,
  Heart,
  Flag,
  UserCheck,
  Ban,
} from 'lucide-react';
import { EVENTS, DEMO_ATTENDEES } from './EventsByCategory';
import ReportDialog from '../components/ReportDialog';

// Demo fallback matches (shown when no real data available)
// Unique IDs (301-308) to avoid conflicts with other demo data
const DEMO_FALLBACK_MATCHES = [
  {
    id: 301,
    name: "Maya",
    age: 26,
    distance: 0.9,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Design systems and tiny UX details.",
    interests: ["Live music", "Rooftop sunsets", "Coffee"],
    aboutMe: ["165 cm", "I drink sometimes", "Never smoker"],
    lookingFor: ["Relationship"],
  },
  {
    id: 302,
    name: "Noa",
    age: 25,
    distance: 2.2,
    city: "Ramat Gan",
    photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "I love yoga, I hate coffee, I can surf.",
    interests: ["Beach", "Yoga", "Festivals"],
    aboutMe: ["162 cm", "Rarely", "Never smoker"],
    lookingFor: ["Casual"],
  },
  {
    id: 303,
    name: "Shira",
    age: 28,
    distance: 1.5,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Wine enthusiast & sunset chaser �",
    interests: ["Wine", "Travel", "Music", "Dancing"],
    aboutMe: ["168 cm", "Social drinker"],
    lookingFor: ["New connections"],
  },
  {
    id: 304,
    name: "Yael",
    age: 27,
    distance: 0.7,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Let's grab coffee and talk about life.",
    interests: ["Coffee", "Books", "Art galleries"],
    aboutMe: ["170 cm", "Rarely", "Non-smoker"],
    lookingFor: ["Relationship"],
  },
  {
    id: 305,
    name: "Talia",
    age: 24,
    distance: 3.1,
    city: "Herzliya",
    photoUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Dancing through life 💃",
    interests: ["Dancing", "Fitness", "Cooking"],
    aboutMe: ["163 cm", "Socially", "Never smoker"],
    lookingFor: ["Casual"],
  },
  {
    id: 306,
    name: "Roni",
    age: 29,
    distance: 1.8,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Tech by day, music by night 🎵",
    interests: ["Tech", "Live music", "Startups"],
    aboutMe: ["172 cm", "Sometimes", "Non-smoker"],
    lookingFor: ["Relationship"],
  },
  {
    id: 307,
    name: "Michal",
    age: 26,
    distance: 2.4,
    city: "Ramat Gan",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Nature lover & weekend hiker 🏔️",
    interests: ["Hiking", "Photography", "Camping"],
    aboutMe: ["166 cm", "Rarely", "Never smoker"],
    lookingFor: ["New friends"],
  },
  {
    id: 308,
    name: "Dana",
    age: 27,
    distance: 1.1,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Foodie exploring the city 🍜",
    interests: ["Food", "Restaurants", "Wine bars"],
    aboutMe: ["169 cm", "Social drinker", "Non-smoker"],
    lookingFor: ["Relationship"],
  },
];

// Transform DEMO_ATTENDEES to match card format
const transformAttendeeToMatch = (attendee) => ({
  id: attendee.id,
  name: attendee.name,
  age: attendee.age,
  distance: Math.random() * 3 + 0.5, // Random distance for demo
  city: attendee.location,
  photoUrl: attendee.photo,
  photos: attendee.photos || [attendee.photo],
  tagline: attendee.prompts?.[0]?.answer || `${attendee.hobbies?.slice(0, 2).join(', ')} ✨`,
  interests: attendee.hobbies || [],
  aboutMe: [
    attendee.height ? `${attendee.height} cm` : null,
    attendee.drinking,
    attendee.smoking ? `${attendee.smoking} smoker` : null,
  ].filter(Boolean),
  lookingFor: attendee.lookingFor || [],
});

// Compact Match Card Component - Same style as MatchesScreen
function EventMatchCard({ profile, onChat, onPass, onReport, onBlock }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = profile.photos?.length ? profile.photos : [profile.photoUrl].filter(Boolean);

  const interests = (profile.interests || []).slice(0, 5);
  const aboutMe = (profile.aboutMe || []).slice(0, 3);
  const lookingFor = (profile.lookingFor || []).slice(0, 3);

  const BRAND_PRIMARY = "#6C5CE7";

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    if (tapX < rect.width * 0.3) {
      setPhotoIdx((prev) => Math.max(0, prev - 1));
    } else {
      setPhotoIdx((prev) => Math.min(photos.length - 1, prev + 1));
    }
  };

  const CompactChip = ({ label, variant = "default" }) => (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1,
        py: 0.3,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        bgcolor: variant === "looking" ? "rgba(244,63,94,0.08)" : "#efeaff",
        color: variant === "looking" ? "#f43f5e" : BRAND_PRIMARY,
        border: `1px solid ${variant === "looking" ? "rgba(244,63,94,0.15)" : "rgba(108,92,231,0.2)"}`,
      }}
    >
      {label}
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          overflow: "hidden",
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          bgcolor: "#fff",
          border: "1px solid rgba(0,0,0,0.04)",
          transition: "all 0.2s ease",
          display: "flex",
          flexDirection: "row",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Left side - Details */}
        <CardContent sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Identity line */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {profile.name}, {profile.age}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <MapPin size={14} color="#64748b" />
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                {profile.distance?.toFixed(1)} km
              </Typography>
            </Box>
          </Box>

          {/* Tagline */}
          {profile.tagline && (
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                mb: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile.tagline}
            </Typography>
          )}

          {/* About Me chips */}
          {aboutMe.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
              {aboutMe.map((item, i) => (
                <CompactChip key={i} label={item} />
              ))}
            </Box>
          )}

          {/* Interests */}
          {interests.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
              {interests.map((item, i) => (
                <CompactChip key={i} label={item} />
              ))}
            </Box>
          )}

          {/* Looking For */}
          {lookingFor.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
              {lookingFor.map((item, i) => (
                <CompactChip key={i} label={item} variant="looking" />
              ))}
            </Box>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              size="small"
              onClick={() => onChat?.(profile)}
              startIcon={<MessageCircle size={16} />}
              sx={{
                flex: 1,
                borderRadius: "10px",
                py: 0.75,
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": { background: "linear-gradient(135deg, #5568d3 0%, #6a4296 100%)" },
              }}
            >
              Chat
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onPass?.(profile)}
              sx={{
                borderRadius: "10px",
                py: 0.75,
                minWidth: 60,
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#e5e7eb",
                color: "#64748b",
                "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
              }}
            >
              Pass
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => onReport?.(profile)}
              sx={{ minWidth: 36, p: 0.5, color: "#94a3b8", "&:hover": { color: "#f59e0b", bgcolor: "rgba(245,158,11,0.1)" } }}
              title="Report"
            >
              <Flag size={16} />
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => onBlock?.(profile)}
              sx={{ minWidth: 36, p: 0.5, color: "#94a3b8", "&:hover": { color: "#ef4444", bgcolor: "rgba(239,68,68,0.1)" } }}
              title="Block"
            >
              <Ban size={16} />
            </Button>
          </Stack>
        </CardContent>

        {/* Right side - Photo */}
        <Box
          onClick={handleTap}
          sx={{
            position: "relative",
            width: 140,
            minHeight: 180,
            background: "#F4F6F8",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <img
            src={photos[photoIdx]}
            loading="lazy"
            alt={`${profile.name}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Photo dots */}
          {photos.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              {photos.map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: i === photoIdx ? "#fff" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Card>
    </motion.div>
  );
}

const EventMatchesScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  // Get matches passed from navigation state, or fetch from EVENTS data
  const passedMatches = location.state?.matches;
  
  // Get matches from synced EVENTS data, fallback to demo
  // Also include matches created from "Like Back" in Interested in You (saved to localStorage)
  const eventMatches = useMemo(() => {
    let matches = [];
    
    // First priority: use matches passed from navigation
    if (passedMatches?.length > 0) {
      matches = passedMatches.map(transformAttendeeToMatch);
    } else if (event?.id) {
      // Second priority: fetch from EVENTS data
      const fullEvent = EVENTS.find(e => String(e.id) === String(event.id));
      if (fullEvent?.attendees?.length) {
        // Get attendees who are matches (isMatch: true)
        matches = fullEvent.attendees
          .map(id => DEMO_ATTENDEES.find(a => a.id === id))
          .filter(a => a && a.isMatch)
          .map(transformAttendeeToMatch);
      }
    }
    
    // Also include matches from localStorage (created via Like Back)
    try {
      const savedMatches = JSON.parse(localStorage.getItem('pulse_matches') || '[]');
      // Filter to only matches from this event (if event exists)
      const eventSavedMatches = event?.title 
        ? savedMatches.filter(m => m.fromEvent === event.title)
        : savedMatches;
      
      // Add saved matches that aren't already in the list
      eventSavedMatches.forEach(saved => {
        if (!matches.find(m => m.id === saved.id)) {
          matches.push({
            id: saved.id,
            name: saved.name,
            age: saved.age,
            distance: saved.distance || Math.random() * 3 + 0.5,
            city: saved.city || 'Tel Aviv',
            photoUrl: saved.photoUrl || saved.photos?.[0],
            photos: saved.photos || [saved.photoUrl],
            tagline: saved.tagline,
            interests: saved.interests || [],
            aboutMe: saved.aboutMe || [],
            lookingFor: saved.lookingFor || [],
            matchedAt: saved.matchedAt,
          });
        }
      });
    } catch (e) {
      console.error('Failed to load saved matches:', e);
    }
    
    // If no matches found, show demo fallback
    return matches.length > 0 ? matches : DEMO_FALLBACK_MATCHES;
  }, [event?.id, event?.title, passedMatches]);

  // State for removed profiles (passed/blocked)
  const [removedIds, setRemovedIds] = useState(new Set());

  // Get blocked users from localStorage
  const blockedUserIds = useMemo(() => {
    try {
      const blocked = JSON.parse(localStorage.getItem('pulse_blocked_users') || '[]');
      return new Set(blocked.map(u => u.id));
    } catch {
      return new Set();
    }
  }, []);

  // Filter out removed profiles AND blocked users
  const visibleMatches = useMemo(() => {
    return eventMatches.filter(p => !removedIds.has(p.id) && !blockedUserIds.has(p.id));
  }, [eventMatches, removedIds, blockedUserIds]);

  const handleChat = (profile) => {
    // Navigate to specific chat with this user
    // Use profile.id as matchId for the chat route
    navigate(`/chat/${profile.id}`, { 
      state: { 
        profile,
        matchName: profile.name,
        matchPhoto: profile.photoUrl || profile.photos?.[0],
        fromEvent: event 
      } 
    });
  };

  const handlePass = (profile) => {
    console.log('Passed on:', profile.name);
    // Remove from visible list
    setRemovedIds(prev => new Set([...prev, profile.id]));
    // TODO: Send pass action to backend
  };

  // Report dialog state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  
  // Block confirmation dialog state
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null);

  const handleReport = (profile) => {
    setReportTarget(profile);
    setReportOpen(true);
  };

  const submitReport = (reportData) => {
    if (!reportTarget) return;
    // Remove from visible list
    setRemovedIds(prev => new Set([...prev, reportTarget.id]));
    setReportOpen(false);
    setReportTarget(null);
    setSnack({ open: true, msg: 'Report submitted. Thank you for helping keep Pulse safe.', severity: 'success' });
    // TODO: Send report to backend
  };

  // Open block confirmation dialog
  const handleBlock = (profile) => {
    setBlockTarget(profile);
    setBlockConfirmOpen(true);
  };
  
  // Confirm block action
  const confirmBlock = () => {
    if (!blockTarget) return;
    
    const profile = blockTarget;
    setRemovedIds(prev => new Set([...prev, profile.id]));
    
    // Save to blocked users in localStorage for Settings page
    const blockedUser = {
      id: profile.id,
      name: profile.name || 'User',
      photo: profile.photoUrl || profile.photos?.[0],
      source: 'event',
      blockedAt: new Date().toISOString().split('T')[0],
    };
    try {
      const existing = JSON.parse(localStorage.getItem('pulse_blocked_users') || '[]');
      if (!existing.find(u => u.id === blockedUser.id)) {
        localStorage.setItem('pulse_blocked_users', JSON.stringify([...existing, blockedUser]));
      }
    } catch (e) {
      console.error('Failed to save blocked user to localStorage:', e);
    }
    
    setSnack({ open: true, msg: `${profile.name} has been blocked.`, severity: 'info' });
    setBlockConfirmOpen(false);
    setBlockTarget(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#fafbfc',
        pb: 'calc(88px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 2,
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <UserCheck size={20} color="#667eea" />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
            Event Matches
          </Typography>
        </Box>
        {event && (
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {event.title} • {visibleMatches.length} matches
          </Typography>
        )}
      </Box>

      {/* Matches List */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {visibleMatches.map((profile) => (
          <EventMatchCard
            key={profile.id}
            profile={profile}
            onChat={handleChat}
            onPass={handlePass}
            onReport={handleReport}
            onBlock={handleBlock}
          />
        ))}
      </Box>

      {/* Empty state */}
      {visibleMatches.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
            py: 8,
            textAlign: 'center',
          }}
        >
          <UserCheck size={64} color="#cbd5e1" />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: '#1a1a2e' }}>
            No matches yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
            Check back closer to the event!
          </Typography>
        </Box>
      )}

      {/* Report Dialog */}
      <ReportDialog
        open={reportOpen}
        onClose={() => {
          setReportOpen(false);
          setReportTarget(null);
        }}
        onSubmit={submitReport}
        userName={reportTarget?.name || 'this user'}
      />

      {/* Block Confirmation Dialog */}
      <Dialog
        open={blockConfirmOpen}
        onClose={() => {
          setBlockConfirmOpen(false);
          setBlockTarget(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            maxWidth: 340,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
          Block {blockTarget?.name}?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to block this profile? They won't be able to see you or contact you anymore.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setBlockConfirmOpen(false);
              setBlockTarget(null);
            }}
            sx={{ color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmBlock}
            sx={{
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
            }}
          >
            Block
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: 80, zIndex: 99999 }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventMatchesScreen;
