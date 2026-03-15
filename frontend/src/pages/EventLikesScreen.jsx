/**
 * EventLikesScreen - Shows people who liked you and are attending the event
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
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  MapPin,
  MessageCircle,
  Heart,
  Flag,
  X,
  Ban,
} from 'lucide-react';
import { EVENTS, DEMO_ATTENDEES } from './EventsByCategory';
import ReportDialog from '../components/ReportDialog';

// Demo fallback likes (shown when no real data available)
// All profiles in "Interested in You" have liked the user - clicking "Like Back" triggers match celebration!
const DEMO_FALLBACK_LIKES = [
  {
    id: 201,
    name: "Amit",
    age: 28,
    distance: 1.3,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Booked a weekend trip the same day.",
    interests: ["Food markets", "Gym", "Podcasts"],
    aboutMe: ["181 cm", "Sometimes", "Never smoker"],
    lookingFor: ["Casual"],
    likedAt: "2 hours ago",
  },
  {
    id: 202,
    name: "Yoni",
    age: 29,
    distance: 1.8,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Turning ideas into reality.",
    interests: ["Startups", "Travel", "Wine"],
    aboutMe: ["183 cm", "I drink sometimes", "Never smoker"],
    lookingFor: ["Relationship"],
    likedAt: "5 hours ago",
  },
  {
    id: 203,
    name: "Daniel",
    age: 27,
    distance: 2.5,
    city: "Ramat Gan",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Board games and good company.",
    interests: ["Board games", "Hiking", "Tech meetups"],
    aboutMe: ["176 cm", "Socially", "Never smoker"],
    lookingFor: ["New friends"],
    likedAt: "1 day ago",
  },
  {
    id: 204,
    name: "Oren",
    age: 31,
    distance: 0.8,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Coffee first, then we talk.",
    interests: ["Coffee", "Photography", "Jazz"],
    aboutMe: ["179 cm", "Rarely", "Non-smoker"],
    lookingFor: ["Relationship"],
    likedAt: "3 hours ago",
  },
  {
    id: 205,
    name: "Noam",
    age: 26,
    distance: 3.2,
    city: "Herzliya",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Always up for an adventure.",
    interests: ["Hiking", "Camping", "Rock climbing"],
    aboutMe: ["185 cm", "Socially", "Never smoker"],
    lookingFor: ["Casual"],
    likedAt: "6 hours ago",
  },
  {
    id: 206,
    name: "Liza",
    age: 28,
    distance: 1.5,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Looking forward to the event! 🎉",
    interests: ["Travel", "Photography", "Wine", "Art"],
    aboutMe: ["172 cm", "Social drinker"],
    lookingFor: ["Relationship"],
    likedAt: "3 days ago",
  },
  {
    id: 207,
    name: "Gali",
    age: 25,
    distance: 0.9,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Art lover & coffee addict ☕",
    interests: ["Art", "Coffee", "Museums", "Reading"],
    aboutMe: ["165 cm", "Non-smoker"],
    lookingFor: ["New connections"],
    likedAt: "5 hours ago",
  },
  {
    id: 208,
    name: "Tamar",
    age: 26,
    distance: 2.3,
    city: "Herzliya",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Beach vibes & good energy 🌊",
    interests: ["Beach", "Surfing", "Yoga", "Cooking"],
    aboutMe: ["168 cm", "Active lifestyle"],
    lookingFor: ["Something casual"],
    likedAt: "1 day ago",
  },
];

// Transform DEMO_ATTENDEES to likes format (non-matches who "liked" you)
const transformAttendeeToLike = (attendee, index) => ({
  id: attendee.id,
  name: attendee.name,
  age: attendee.age,
  distance: Math.random() * 3 + 0.5,
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
  likedAt: index === 0 ? "2 hours ago" : index === 1 ? "5 hours ago" : "1 day ago",
});

// Event Like Card Component - Similar to Matches but with Like indicator
function EventLikeCard({ profile, onLikeBack, onPass, onReport, onBlock }) {
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
          border: "2px solid rgba(240,147,251,0.3)",
          transition: "all 0.2s ease",
          display: "flex",
          flexDirection: "row",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(240,147,251,0.2)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Left side - Details */}
        <CardContent sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Like indicator */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            mb: 1,
            color: '#f093fb',
            fontSize: 12,
            fontWeight: 600,
          }}>
            <Heart size={14} fill="#f093fb" />
            Liked you {profile.likedAt}
          </Box>

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

          {/* Actions - Like Back is primary */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              size="small"
              onClick={() => onLikeBack?.(profile)}
              startIcon={<Heart size={16} />}
              sx={{
                flex: 1,
                borderRadius: "10px",
                py: 0.75,
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                "&:hover": { background: "linear-gradient(135deg, #e879f9 0%, #f43f5e 100%)" },
              }}
            >
              Like Back
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

const EventLikesScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;
  
  // Get interested people passed from navigation state
  const passedInterestedPeople = location.state?.interestedPeople;

  // State for removed profiles (passed/liked back)
  const [removedIds, setRemovedIds] = useState(new Set());
  
  // State for match celebration
  const [matchCelebration, setMatchCelebration] = useState(null);

  // Get likes from navigation state or synced EVENTS data, fallback to demo
  // "Interested in You" = people with interestedInYou: true
  const eventLikes = useMemo(() => {
    // First priority: use interested people passed from navigation
    if (passedInterestedPeople?.length > 0) {
      return passedInterestedPeople.map((a, i) => transformAttendeeToLike(a, i));
    }
    
    // Second priority: fetch from EVENTS data
    if (!event?.id) return DEMO_FALLBACK_LIKES;
    
    // Find the full event data from EVENTS
    const fullEvent = EVENTS.find(e => String(e.id) === String(event.id));
    if (!fullEvent?.attendees?.length) return DEMO_FALLBACK_LIKES;
    
    // Get attendees who have interestedInYou: true (they liked you but you haven't matched yet)
    const likeAttendees = fullEvent.attendees
      .map(id => DEMO_ATTENDEES.find(a => a.id === id))
      .filter(a => a && a.interestedInYou && !a.isMatch) // interestedInYou = people who liked you
      .map((a, i) => transformAttendeeToLike(a, i));
    
    // If no likes found, show demo fallback
    return likeAttendees.length > 0 ? likeAttendees : DEMO_FALLBACK_LIKES;
  }, [event?.id, passedInterestedPeople]);

  // Get blocked users from localStorage
  const blockedUserIds = useMemo(() => {
    try {
      const blocked = JSON.parse(localStorage.getItem('pulse_blocked_users') || '[]');
      return new Set(blocked.map(u => u.id));
    } catch {
      return new Set();
    }
  }, []);

  // Get already matched users from localStorage (profiles we already liked back)
  const matchedUserIds = useMemo(() => {
    try {
      const matches = JSON.parse(localStorage.getItem('pulse_matches') || '[]');
      return new Set(matches.map(m => m.id));
    } catch {
      return new Set();
    }
  }, []);

  // Filter out removed profiles, blocked users, AND already matched users
  const visibleLikes = useMemo(() => {
    return eventLikes.filter(p => 
      !removedIds.has(p.id) && 
      !blockedUserIds.has(p.id) && 
      !matchedUserIds.has(p.id)
    );
  }, [eventLikes, removedIds, blockedUserIds, matchedUserIds]);

  const handleLikeBack = (profile) => {
    console.log('Liked back:', profile.name);
    // Remove from list
    setRemovedIds(prev => new Set([...prev, profile.id]));
    
    // Save new match to localStorage for MatchesScreen
    try {
      const existingMatches = JSON.parse(localStorage.getItem('pulse_matches') || '[]');
      const newMatch = {
        id: profile.id,
        odid: profile.id,
        name: profile.name,
        age: profile.age,
        photoUrl: profile.photoUrl || profile.photos?.[0],
        photos: profile.photos,
        tagline: profile.tagline,
        interests: profile.interests,
        aboutMe: profile.aboutMe,
        lookingFor: profile.lookingFor,
        matchedAt: new Date().toISOString(),
        fromEvent: event?.title,
      };
      // Avoid duplicates
      if (!existingMatches.find(m => m.id === profile.id)) {
        existingMatches.unshift(newMatch);
        localStorage.setItem('pulse_matches', JSON.stringify(existingMatches));
      }
    } catch (e) {
      console.error('Failed to save match:', e);
    }
    
    // Show global match popup (same design as Home page)
    // ALWAYS show match for Interested in You - they already liked us!
    try {
      window.dispatchEvent(
        new CustomEvent('pulse:show_match', {
          detail: {
            match: {
              id: profile.id,
              name: profile.name,
              firstName: profile.name,
              photo: profile.photoUrl || profile.photos?.[0],
              photos: profile.photos,
            },
            copy: {
              title: "It's a Match",
              subtitle: "You're in sync",
              description: 'Something real can happen now',
              matchedLine: `You and ${profile.name} matched!`,
              primaryCta: 'Send a message',
              secondaryCta: 'Keep swiping',
            },
            onChat: () => {
              navigate(`/chat/${profile.id}`, { 
                state: { 
                  profile, 
                  matchName: profile.name,
                  matchPhoto: profile.photoUrl || profile.photos?.[0],
                  fromEvent: event, 
                  isNewMatch: true 
                } 
              });
            },
            onLater: () => {
              // Stay on current screen
            },
          },
        })
      );
    } catch (e) {
      console.error('Failed to show match popup:', e);
      // Fallback: use local celebration
      setMatchCelebration(profile);
    }
  };
  
  const handleCloseCelebration = () => {
    const profile = matchCelebration;
    setMatchCelebration(null);
    // Navigate to chat after closing celebration
    navigate(`/chat/${profile.id}`, { 
      state: { 
        profile, 
        matchName: profile.name,
        matchPhoto: profile.photoUrl || profile.photos?.[0],
        fromEvent: event, 
        isNewMatch: true 
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
    setRemovedIds(prev => new Set([...prev, reportTarget.id]));
    setReportOpen(false);
    setReportTarget(null);
    setSnack({ open: true, msg: 'Report submitted. Thank you for helping keep Pulse safe.', severity: 'success' });
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
          <Heart size={20} color="#f093fb" fill="#f093fb" />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
            Interested in You
          </Typography>
        </Box>
        {event && (
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {event.title} • {visibleLikes.length} people liked you
          </Typography>
        )}
      </Box>

      {/* Info banner */}
      <Box sx={{ 
        mx: 2, 
        mt: 2, 
        p: 2, 
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(240,147,251,0.1) 0%, rgba(245,87,108,0.1) 100%)',
        border: '1px solid rgba(240,147,251,0.2)',
      }}>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: 13 }}>
          💡 These people are attending the same event and have already liked your profile. Like them back to match!
        </Typography>
      </Box>

      {/* Likes List */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {visibleLikes.map((profile) => (
          <EventLikeCard
            key={profile.id}
            profile={profile}
            onLikeBack={handleLikeBack}
            onPass={handlePass}
            onReport={handleReport}
            onBlock={handleBlock}
          />
        ))}
      </Box>

      {/* Empty state */}
      {visibleLikes.length === 0 && (
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
          <Heart size={64} color="#cbd5e1" />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: '#1a1a2e' }}>
            No likes yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
            Check back closer to the event!
          </Typography>
        </Box>
      )}

      {/* Match Celebration Overlay */}
      {matchCelebration && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: 'linear-gradient(135deg, rgba(102,126,234,0.95) 0%, rgba(118,75,162,0.95) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
          }}
          onClick={handleCloseCelebration}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                mb: 3,
              }}
            >
              <img
                src={matchCelebration.photoUrl || matchCelebration.photos?.[0]}
                alt={matchCelebration.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 800,
                textAlign: 'center',
                mb: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              It's a Match! 🎉
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                textAlign: 'center',
                mb: 4,
              }}
            >
              You and {matchCelebration.name} liked each other
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<MessageCircle size={20} />}
              onClick={handleCloseCelebration}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                backgroundColor: 'white',
                color: '#667eea',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
              }}
            >
              Send a Message
            </Button>
          </motion.div>

          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              mt: 3,
            }}
          >
            Tap anywhere to continue
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

export default EventLikesScreen;
