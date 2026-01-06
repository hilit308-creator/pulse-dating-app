// ExploreScreen.jsx — Pulse Explore Page
// "לאן שווה לצאת עכשיו?"
// Places worth stepping into - real-time discovery

import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CardMedia,
  Skeleton,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  QrCode,
  Gift,
  Sparkles,
  Music,
  Coffee,
  Wine,
  Users,
  Zap,
  Star,
  ChevronRight,
  X,
  Heart,
  MessageCircle,
  Send,
  Flower2,
} from "lucide-react";
import { useLanguage } from '../context/LanguageContext';

/* =========================
   Constants
   ========================= */
const SAFE_BOTTOM = 'calc(88px + env(safe-area-inset-bottom, 0px))';

// Filter categories - using translation keys
const FILTER_CATEGORIES = [
  { id: 'all', labelKey: 'allPlaces', icon: Sparkles },
  { id: 'bar', labelKey: 'bars', icon: Wine },
  { id: 'cafe', labelKey: 'cafes', icon: Coffee },
  { id: 'live-music', labelKey: 'liveMusic', icon: Music },
  { id: 'chill', labelKey: 'chill', icon: Star },
  { id: 'dance', labelKey: 'dance', icon: Zap },
  { id: 'social', labelKey: 'social', icon: Users },
  { id: 'near-me', labelKey: 'nearMe', icon: MapPin },
];

// Vibe icons mapping
const VIBE_ICONS = {
  chill: { icon: '🌙', label: 'Chill vibes' },
  social: { icon: '👥', label: 'Social' },
  dance: { icon: '💃', label: 'Dance' },
  live: { icon: '🎵', label: 'Live music' },
  romantic: { icon: '🕯️', label: 'Romantic' },
  energetic: { icon: '⚡', label: 'Energetic' },
};

// Mock nearby people for Sweet Gestures
const NEARBY_PEOPLE = [
  {
    id: 1,
    name: "Dana",
    distance: 197,
    unit: "m",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    isOnline: true,
  },
  {
    id: 2,
    name: "Tom",
    distance: 599,
    unit: "m",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    isOnline: true,
  },
  {
    id: 3,
    name: "Sarah",
    distance: 1.0,
    unit: "km",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    isOnline: false,
  },
  {
    id: 4,
    name: "Alex",
    distance: 1.2,
    unit: "km",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    isOnline: true,
  },
  {
    id: 5,
    name: "Maya",
    distance: 1.5,
    unit: "km",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    isOnline: true,
  },
];

// Gesture types for Sweet Gestures
const GESTURE_TYPES = [
  {
    id: 'coffee',
    label: 'Send Coffee',
    icon: Coffee,
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
    shadowColor: 'rgba(255, 107, 107, 0.4)',
  },
  {
    id: 'flower',
    label: 'Send Flower',
    icon: Flower2,
    gradient: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
  },
  {
    id: 'note',
    label: 'Send Note',
    icon: Gift,
    gradient: 'linear-gradient(135deg, #6C5CE7 0%, #a78bfa 100%)',
    shadowColor: 'rgba(108, 92, 231, 0.4)',
  },
  {
    id: 'hi',
    label: 'Say Hi',
    icon: MessageCircle,
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
  },
];

// Mock places data (10-20 places only)
const MOCK_PLACES = [
  {
    id: 1,
    name: "Kuli Alma",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
    category: "bar",
    vibes: ['social', 'dance', 'live'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "03:00",
    hasActiveBenefit: true,
    benefit: {
      title: "Happy Hour Extended",
      description: "1+1 on all cocktails until midnight",
      expiresAt: "23:59",
    },
    isNew: false,
  },
  {
    id: 2,
    name: "Cafe Nordoy",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    category: "cafe",
    vibes: ['chill', 'romantic'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "01:00",
    hasActiveBenefit: false,
    benefit: null,
    isNew: true,
  },
  {
    id: 3,
    name: "The Block",
    image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=800&q=80",
    category: "bar",
    vibes: ['dance', 'energetic', 'live'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "05:00",
    hasActiveBenefit: true,
    benefit: {
      title: "Free Entry",
      description: "Show your Pulse app for free entry before 23:00",
      expiresAt: "23:00",
    },
    isNew: false,
  },
  {
    id: 4,
    name: "Cafelix",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    category: "cafe",
    vibes: ['chill', 'social'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "00:00",
    hasActiveBenefit: true,
    benefit: {
      title: "Drink on the house",
      description: "Free espresso with any pastry",
      expiresAt: "18:00",
    },
    isNew: false,
  },
  {
    id: 5,
    name: "Sputnik",
    image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80",
    category: "bar",
    vibes: ['social', 'chill'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "02:00",
    hasActiveBenefit: false,
    benefit: null,
    isNew: false,
  },
  {
    id: 6,
    name: "Pastel",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    category: "live-music",
    vibes: ['live', 'romantic', 'chill'],
    location: "Tel Aviv",
    openNow: false,
    opensAt: "20:00",
    closingTime: "02:00",
    hasActiveBenefit: false,
    benefit: null,
    isNew: true,
  },
  {
    id: 7,
    name: "Beit Maariv",
    image: "https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&w=800&q=80",
    category: "bar",
    vibes: ['dance', 'social', 'energetic'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "04:00",
    hasActiveBenefit: true,
    benefit: {
      title: "1+1 Drinks",
      description: "Buy one get one free on all beers",
      expiresAt: "22:00",
    },
    isNew: false,
  },
  {
    id: 8,
    name: "Anna Loulou",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
    category: "live-music",
    vibes: ['live', 'social', 'chill'],
    location: "Jaffa",
    openNow: true,
    closingTime: "03:00",
    hasActiveBenefit: false,
    benefit: null,
    isNew: false,
  },
  {
    id: 9,
    name: "Teder.fm",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    category: "bar",
    vibes: ['social', 'chill', 'live'],
    location: "Tel Aviv",
    openNow: false,
    opensAt: "19:00",
    closingTime: "02:00",
    hasActiveBenefit: true,
    benefit: {
      title: "Welcome Drink",
      description: "Free welcome shot for Pulse users",
      expiresAt: "21:00",
    },
    isNew: false,
  },
  {
    id: 10,
    name: "Spicehaus",
    image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=800&q=80",
    category: "cafe",
    vibes: ['chill', 'romantic'],
    location: "Tel Aviv",
    openNow: true,
    closingTime: "23:00",
    hasActiveBenefit: false,
    benefit: null,
    isNew: true,
  },
];

/* =========================
   PlaceCard Component
   ========================= */
function PlaceCard({ place, onViewPlace, onSave, onScanQR, onSeeBenefits, isSaved }) {
  const openStatus = place.openNow 
    ? `Open now · until ${place.closingTime}`
    : `Opens at ${place.opensAt}`;
  
  const isClosingSoon = place.openNow && 
    parseInt(place.closingTime) <= 2 && 
    parseInt(place.closingTime) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          mb: 2,
          position: 'relative',
        }}
      >
        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', gap: 1 }}>
          {place.hasActiveBenefit && (
            <Chip
              icon={<Gift size={14} />}
              label="Perk"
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,0.9)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          )}
          {place.isNew && (
            <Chip
              label="New"
              size="small"
              sx={{
                bgcolor: 'rgba(108,92,231,0.9)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>

        {/* Save Button */}
        <IconButton
          onClick={() => onSave(place.id)}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          {isSaved ? (
            <BookmarkCheck size={20} color="#6C5CE7" />
          ) : (
            <Bookmark size={20} color="#64748b" />
          )}
        </IconButton>

        {/* Image */}
        <CardMedia
          component="img"
          height="180"
          image={place.image}
          alt={place.name}
          sx={{ objectFit: 'cover' }}
        />

        {/* Content */}
        <CardContent sx={{ pb: 1 }}>
          {/* Name & Category */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a2e', lineHeight: 1.2 }}>
                {place.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', textTransform: 'capitalize' }}>
                {place.category.replace('-', ' ')}
              </Typography>
            </Box>
          </Box>

          {/* Vibe Icons */}
          <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
            {place.vibes.map((vibe) => (
              <Box
                key={vibe}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(108,92,231,0.08)',
                  px: 1,
                  py: 0.25,
                  borderRadius: '8px',
                }}
              >
                <Typography sx={{ fontSize: '0.85rem' }}>
                  {VIBE_ICONS[vibe]?.icon}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
                  {VIBE_ICONS[vibe]?.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Location & Hours */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MapPin size={14} color="#64748b" />
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {place.location}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Clock size={14} color={isClosingSoon ? '#ef4444' : '#22c55e'} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isClosingSoon ? '#ef4444' : '#22c55e',
                  fontWeight: 600,
                }}
              >
                {isClosingSoon ? 'Closing soon' : openStatus}
              </Typography>
            </Box>
          </Box>

          {/* Benefit Preview */}
          {place.hasActiveBenefit && place.benefit && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                bgcolor: 'rgba(16,185,129,0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Gift size={16} color="#10b981" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#10b981' }}>
                  {place.benefit.title}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {place.benefit.description}
              </Typography>
            </Box>
          )}
        </CardContent>

        {/* CTAs */}
        <CardActions sx={{ px: 2, pb: 2, pt: 0.5, gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => onViewPlace(place)}
            sx={{
              py: 1.25,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            View place
          </Button>
          {place.hasActiveBenefit && (
            <Button
              variant="outlined"
              onClick={() => onSeeBenefits(place)}
              startIcon={<Gift size={16} />}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#10b981',
                color: '#10b981',
                '&:hover': {
                  borderColor: '#059669',
                  bgcolor: 'rgba(16,185,129,0.08)',
                },
              }}
            >
              Perks
            </Button>
          )}
          <IconButton
            onClick={() => onScanQR(place)}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              p: 1.25,
            }}
          >
            <QrCode size={20} color="#64748b" />
          </IconButton>
        </CardActions>
      </Card>
    </motion.div>
  );
}

/* =========================
   QR Scan Dialog
   ========================= */
function QRScanDialog({ open, onClose, place }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          maxWidth: 360,
          width: '100%',
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, pb: 1 }}>
        Scan QR at {place?.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Box
            sx={{
              width: 200,
              height: 200,
              mx: 'auto',
              bgcolor: '#f1f5f9',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #cbd5e1',
              mb: 3,
            }}
          >
            <QrCode size={80} color="#94a3b8" />
          </Box>
          <Typography variant="body1" sx={{ color: '#1a1a2e', fontWeight: 600, mb: 1 }}>
            Point your camera at the QR code
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Look for the Pulse QR code displayed at the venue to unlock benefits
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
          }}
        >
          Open Camera
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* =========================
   Benefits Dialog
   ========================= */
function BenefitsDialog({ open, onClose, place }) {
  if (!place?.benefit) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          maxWidth: 400,
          width: '100%',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          p: 3,
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <Gift size={48} style={{ marginBottom: 8 }} />
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Pulse Perk
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {place?.name}
        </Typography>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
          {place?.benefit?.title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
          {place?.benefit?.description}
        </Typography>

        {/* Terms */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#f8fafc',
            borderRadius: '12px',
            mb: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Terms:
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            • Valid only when physically present at the venue
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            • Must scan QR code to redeem
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            • Expires at {place?.benefit?.expiresAt}
          </Typography>
        </Box>

        {/* Expiry */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#f59e0b' }}>
          <Clock size={16} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Valid until {place?.benefit?.expiresAt} today
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            py: 1.25,
            px: 3,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<QrCode size={18} />}
          sx={{
            py: 1.25,
            px: 3,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: '#10b981',
            '&:hover': { bgcolor: '#059669' },
          }}
        >
          Scan to Redeem
        </Button>
      </DialogActions>
    </Dialog>
  );
}


/* =========================
   Sweet Gestures Section
   ========================= */
function SweetGesturesSection({ people, onSendGesture }) {
  return (
    <Box
      sx={{
        mb: 3,
        p: 2.5,
        background: 'linear-gradient(135deg, rgba(255,107,107,0.08) 0%, rgba(168,85,247,0.08) 50%, rgba(108,92,231,0.08) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(108,92,231,0.12)',
      }}
    >
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF6B6B 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={20} color="#fff" fill="#fff" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e', lineHeight: 1.2 }}>
              Sweet Gestures
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Send something special to someone nearby
            </Typography>
          </Box>
        </Box>
        <Chip
          label="New"
          size="small"
          sx={{
            bgcolor: 'rgba(255,107,107,0.15)',
            color: '#FF6B6B',
            fontWeight: 700,
            fontSize: '0.65rem',
          }}
        />
      </Box>

      {/* People List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {people.map((person, index) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                bgcolor: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {/* Avatar */}
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Box
                  component="img"
                  src={person.avatar}
                  alt={person.name}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    objectFit: 'cover',
                    border: '3px solid #fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                {person.isOnline && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: '#22c55e',
                      border: '3px solid #fff',
                    }}
                  />
                )}
              </Box>

              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                  {person.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MapPin size={12} color="#64748b" />
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {person.distance} {person.unit} away
                  </Typography>
                </Box>
              </Box>

              {/* Gesture Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {GESTURE_TYPES.map((gesture) => {
                  const Icon = gesture.icon;
                  const isMain = gesture.id === 'coffee';
                  return (
                    <motion.div
                      key={gesture.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconButton
                        onClick={() => onSendGesture(person, gesture)}
                        sx={{
                          width: isMain ? 52 : 40,
                          height: isMain ? 52 : 40,
                          borderRadius: isMain ? '16px' : '12px',
                          background: isMain ? gesture.gradient : 'transparent',
                          border: isMain ? 'none' : '1.5px solid #e2e8f0',
                          boxShadow: isMain ? `0 4px 16px ${gesture.shadowColor}` : 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: isMain ? gesture.gradient : 'rgba(108,92,231,0.08)',
                            borderColor: isMain ? 'transparent' : '#6C5CE7',
                          },
                        }}
                      >
                        <Icon 
                          size={isMain ? 22 : 18} 
                          color={isMain ? '#fff' : '#64748b'} 
                        />
                      </IconButton>
                    </motion.div>
                  );
                })}
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>

      {/* View More */}
      <Button
        fullWidth
        endIcon={<ChevronRight size={18} />}
        sx={{
          mt: 2,
          py: 1.25,
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          color: '#6C5CE7',
          bgcolor: 'rgba(108,92,231,0.08)',
          '&:hover': {
            bgcolor: 'rgba(108,92,231,0.15)',
          },
        }}
      >
        See more people nearby
      </Button>
    </Box>
  );
}

/* =========================
   Gesture Sent Dialog
   ========================= */
function GestureSentDialog({ open, onClose, person, gesture }) {
  if (!person || !gesture) return null;

  const Icon = gesture.icon;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '28px',
          maxWidth: 340,
          width: '100%',
          overflow: 'hidden',
        },
      }}
    >
      {/* Animated Header */}
      <Box
        sx={{
          background: gesture.gradient,
          p: 4,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating particles animation */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: -100, 
              opacity: [0, 1, 0],
              x: Math.sin(i) * 30,
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut"
            }}
            style={{
              position: 'absolute',
              left: `${20 + i * 12}%`,
              bottom: 0,
            }}
          >
            <Sparkles size={16} color="rgba(255,255,255,0.6)" />
          </motion.div>
        ))}
        
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '24px',
              bgcolor: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Icon size={40} color="#fff" />
          </Box>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>
            Gesture Sent! 💫
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            {gesture.label} to {person.name}
          </Typography>
        </motion.div>
      </Box>

      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        {/* Person Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
          <Box
            component="img"
            src={person.avatar}
            alt={person.name}
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              objectFit: 'cover',
            }}
          />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
              {person.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Will be notified soon
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
          {person.name} will receive your sweet gesture and can choose to respond. Keep your fingers crossed! 🤞
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            py: 1.5,
            borderRadius: '14px',
            textTransform: 'none',
            fontWeight: 700,
            background: gesture.gradient,
            boxShadow: `0 4px 16px ${gesture.shadowColor}`,
          }}
        >
          Awesome!
        </Button>
      </DialogActions>
    </Dialog>
  );
}


/* =========================
   Main ExploreScreen
   ========================= */
export default function ExploreScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // State
  const [activeFilter, setActiveFilter] = useState('all');
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showBenefitsDialog, setShowBenefitsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  
  // Sweet Gestures state
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedGesture, setSelectedGesture] = useState(null);
  const [showGestureDialog, setShowGestureDialog] = useState(false);

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter places based on active filter
  const filteredPlaces = useMemo(() => {
    if (activeFilter === 'all') return MOCK_PLACES;
    if (activeFilter === 'near-me') {
      // Would use geolocation in real app
      return MOCK_PLACES.slice(0, 5);
    }
    return MOCK_PLACES.filter(place => place.category === activeFilter);
  }, [activeFilter]);

  // Sort: Open now first, then with benefits, then new, then others
  const sortedPlaces = useMemo(() => {
    return [...filteredPlaces].sort((a, b) => {
      // Open now first
      if (a.openNow && !b.openNow) return -1;
      if (!a.openNow && b.openNow) return 1;
      // Then with benefits
      if (a.hasActiveBenefit && !b.hasActiveBenefit) return -1;
      if (!a.hasActiveBenefit && b.hasActiveBenefit) return 1;
      // Then new
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return 0;
    });
  }, [filteredPlaces]);

  // Handlers
  const handleViewPlace = useCallback((place) => {
    setSelectedPlace(place);
    // Navigate to business page (place detail)
    navigate(`/business/${place.id}`, { state: { place } });
  }, [navigate]);

  const handleSave = useCallback((placeId) => {
    setSavedPlaces(prev => {
      if (prev.includes(placeId)) {
        setToast({ open: true, message: 'Removed from saved', severity: 'info' });
        return prev.filter(id => id !== placeId);
      } else {
        setToast({ open: true, message: 'Saved!', severity: 'success' });
        return [...prev, placeId];
      }
    });
  }, []);

  const handleScanQR = useCallback((place) => {
    setSelectedPlace(place);
    setShowQRDialog(true);
  }, []);

  const handleSeeBenefits = useCallback((place) => {
    setSelectedPlace(place);
    setShowBenefitsDialog(true);
  }, []);

  // Sweet Gestures handler
  const handleSendGesture = useCallback((person, gesture) => {
    setSelectedPerson(person);
    setSelectedGesture(gesture);
    setShowGestureDialog(true);
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', pb: SAFE_BOTTOM }}>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width={120} height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto' }}>
            {[1,2,3,4,5].map(i => (
              <Skeleton key={i} variant="rounded" width={80} height={36} sx={{ borderRadius: '18px', flexShrink: 0 }} />
            ))}
          </Box>
          {[1,2,3].map(i => (
            <Skeleton key={i} variant="rounded" height={320} sx={{ borderRadius: '20px', mb: 2 }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafbfc',
        pb: SAFE_BOTTOM,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          backgroundColor: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a1a2e', mb: 0.5 }}>
          {t('explore')}
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Places worth stepping into
        </Typography>
      </Box>

      {/* Filter Chips - Sticky */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 76,
          zIndex: 9,
          overflowX: 'auto',
          display: 'flex',
          gap: 1,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {FILTER_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeFilter === cat.id;
          return (
            <Chip
              key={cat.id}
              icon={<Icon size={16} />}
              label={t(cat.labelKey)}
              onClick={() => setActiveFilter(cat.id)}
              sx={{
                flexShrink: 0,
                fontWeight: 600,
                borderRadius: '18px',
                bgcolor: isActive ? '#6C5CE7' : '#f1f5f9',
                color: isActive ? '#fff' : '#64748b',
                '& .MuiChip-icon': {
                  color: isActive ? '#fff' : '#64748b',
                },
                '&:hover': {
                  bgcolor: isActive ? '#5b4cdb' : '#e2e8f0',
                },
              }}
            />
          );
        })}
      </Box>

      {/* Places Feed */}
      <Box sx={{ flex: 1, px: 3, py: 2 }}>
        {/* Sweet Gestures Section */}
        <SweetGesturesSection 
          people={NEARBY_PEOPLE} 
          onSendGesture={handleSendGesture} 
        />

        {/* Results count */}
        <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
          {sortedPlaces.length} places {activeFilter !== 'all' && `in ${activeFilter.replace('-', ' ')}`}
        </Typography>

        {/* Place Cards - No infinite scroll */}
        <AnimatePresence mode="popLayout">
          {sortedPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onViewPlace={handleViewPlace}
              onSave={handleSave}
              onScanQR={handleScanQR}
              onSeeBenefits={handleSeeBenefits}
              isSaved={savedPlaces.includes(place.id)}
            />
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {sortedPlaces.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ fontSize: 48, mb: 2 }}>🔍</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
              No places found
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Try a different filter
            </Typography>
          </Box>
        )}

        {/* End of list message */}
        {sortedPlaces.length > 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              That's all for now ✨
            </Typography>
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
              Check back later for more places
            </Typography>
          </Box>
        )}
      </Box>

      {/* QR Scan Dialog */}
      <QRScanDialog
        open={showQRDialog}
        onClose={() => setShowQRDialog(false)}
        place={selectedPlace}
      />

      {/* Benefits Dialog */}
      <BenefitsDialog
        open={showBenefitsDialog}
        onClose={() => setShowBenefitsDialog(false)}
        place={selectedPlace}
      />

      {/* Gesture Sent Dialog */}
      <GestureSentDialog
        open={showGestureDialog}
        onClose={() => setShowGestureDialog(false)}
        person={selectedPerson}
        gesture={selectedGesture}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: '12px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
