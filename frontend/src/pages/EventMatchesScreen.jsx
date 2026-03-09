/**
 * EventMatchesScreen - Shows matches attending an event
 * Uses Matches-style compact profile cards
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
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
} from 'lucide-react';

// Mock matches data for event
const MOCK_EVENT_MATCHES = [
  {
    id: 1,
    name: "Maya",
    age: 27,
    distance: 0.6,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Here for the rooftop event tonight 🌃",
    interests: ["Design", "Yoga", "Music", "Coffee", "Bars"],
    aboutMe: ["170 cm", "Sometimes drinks", "Likes pets"],
    lookingFor: ["Relationship"],
  },
  {
    id: 2,
    name: "Shira",
    age: 26,
    distance: 0.8,
    city: "Tel Aviv",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Always up for an adventure 🌟",
    interests: ["Wine", "Travel", "Music", "Dancing"],
    aboutMe: ["165 cm", "Social drinker"],
    lookingFor: ["New connections"],
  },
  {
    id: 3,
    name: "Noa",
    age: 25,
    distance: 1.2,
    city: "Ramat Gan",
    photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    ],
    tagline: "Creating beautiful things ✨",
    interests: ["Art", "Design", "Photography", "Hiking"],
    aboutMe: ["168 cm", "Non-smoker"],
    lookingFor: ["Something casual"],
  },
];

// Compact Match Card Component - Same style as MatchesScreen
function EventMatchCard({ profile, onChat, onPass }) {
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
              sx={{ minWidth: 36, p: 0.5, color: "#94a3b8" }}
            >
              <Flag size={16} />
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

  const handleChat = (profile) => {
    navigate('/chat/new', { state: { profile, fromEvent: event } });
  };

  const handlePass = (profile) => {
    console.log('Passed on:', profile.name);
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
            {event.title} • {MOCK_EVENT_MATCHES.length} matches
          </Typography>
        )}
      </Box>

      {/* Matches List */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {MOCK_EVENT_MATCHES.map((profile) => (
          <EventMatchCard
            key={profile.id}
            profile={profile}
            onChat={handleChat}
            onPass={handlePass}
          />
        ))}
      </Box>

      {/* Empty state */}
      {MOCK_EVENT_MATCHES.length === 0 && (
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
    </Box>
  );
};

export default EventMatchesScreen;
