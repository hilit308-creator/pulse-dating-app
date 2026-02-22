// MeetingInviteMessage.jsx
// Chat message component for meeting invitations with map location and response options
// Per spec: "The invitee must feel: Safe, In control, Free to respond at their pace"

import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Check, X, MessageCircle, Clock, ExternalLink } from 'lucide-react';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Meeting spot marker
const createMeetingSpotIcon = () => new L.DivIcon({
  className: 'meeting-spot-marker',
  html: `<div style="background: linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(108,92,231,0.4); display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Response status types
export const INVITE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  CHAT_FIRST: 'chat_first',
};

// Detect text direction (RTL for Hebrew/Arabic, LTR for English)
function detectTextDirection(text) {
  if (!text) return 'ltr';
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/;
  const firstLetterMatch = text.match(/[a-zA-Z\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/);
  if (firstLetterMatch && rtlRegex.test(firstLetterMatch[0])) {
    return 'rtl';
  }
  return 'ltr';
}

/**
 * MeetingInviteMessage - Displayed in chat when someone sends a meeting invitation
 * Shows map with location, navigation option, and response buttons
 */
export default function MeetingInviteMessage({
  invitation,
  isIncoming, // true if current user received this invitation
  onAccept,
  onDecline,
  onChatFirst,
  onNavigate,
  status = INVITE_STATUS.PENDING,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const { venue, message, person, createdAt } = invitation || {};
  const coordinates = venue?.coordinates || venue?.snapshot?.coordinates;
  const venueName = venue?.name || venue?.snapshot?.name || 'Meeting spot';
  const venueImage = venue?.image || venue?.snapshot?.image;
  const venueWalkTime = venue?.walkTime || venue?.snapshot?.walkTime;
  const venueRating = venue?.pulseRating || venue?.rating || venue?.snapshot?.rating;
  const venueVibe = venue?.vibe || venue?.snapshot?.vibe;
  const isMapPicked = venue?.isMapPicked;

  // Generate navigation URL (Google Maps / Waze)
  const navigationUrl = useMemo(() => {
    if (!coordinates) return null;
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
  }, [coordinates]);

  const wazeUrl = useMemo(() => {
    if (!coordinates) return null;
    return `https://waze.com/ul?ll=${coordinates.lat},${coordinates.lng}&navigate=yes`;
  }, [coordinates]);

  const handleAccept = async () => {
    setIsProcessing(true);
    await onAccept?.(invitation);
    setIsProcessing(false);
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    await onDecline?.(invitation);
    setIsProcessing(false);
  };

  const handleChatFirst = () => {
    onChatFirst?.(invitation);
  };

  const handleNavigate = (url) => {
    window.open(url, '_blank');
    onNavigate?.(invitation);
  };

  // Render based on status
  const renderStatusBadge = () => {
    switch (status) {
      case INVITE_STATUS.ACCEPTED:
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981' }}>
            <Check size={14} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Accepted</Typography>
          </Box>
        );
      case INVITE_STATUS.DECLINED:
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
            <X size={14} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Declined</Typography>
          </Box>
        );
      case INVITE_STATUS.CHAT_FIRST:
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6C5CE7' }}>
            <MessageCircle size={14} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Wants to chat first</Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#f59e0b' }}>
            <Clock size={14} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Pending</Typography>
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 320,
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: isIncoming ? '#fff' : 'rgba(108,92,231,0.08)',
        border: '1px solid',
        borderColor: isIncoming ? 'rgba(0,0,0,0.08)' : 'rgba(108,92,231,0.2)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapPin size={16} color="#6C5CE7" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
              {isIncoming ? 'Meeting invitation' : 'You invited to meet'}
            </Typography>
          </Box>
          {renderStatusBadge()}
        </Box>
        
        {message && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b', 
              fontStyle: 'italic', 
              mt: 1,
              direction: detectTextDirection(message),
              textAlign: detectTextDirection(message) === 'rtl' ? 'right' : 'left',
            }}
          >
            "{message}"
          </Typography>
        )}
      </Box>

      {/* Venue image (for selected venues) */}
      {venueImage && !isMapPicked && (
        <Box sx={{ position: 'relative', height: 140 }}>
          <img
            src={venueImage}
            alt={venueName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Venue info overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              p: 1.5,
              pt: 3,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', mb: 0.25 }}>
              {venueName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {venueWalkTime && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Clock size={12} color="#fff" />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {venueWalkTime}
                  </Typography>
                </Box>
              )}
              {venueRating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ color: '#f59e0b', fontSize: 12 }}>★</Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    {venueRating}
                  </Typography>
                </Box>
              )}
            </Box>
            {venueVibe && (
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                {venueVibe}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Map preview (for custom map-picked spots or as fallback) */}
      {coordinates && (isMapPicked || !venueImage) && (
        <Box sx={{ height: 140, position: 'relative' }}>
          <MapContainer
            center={[coordinates.lat, coordinates.lng]}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[coordinates.lat, coordinates.lng]}
              icon={createMeetingSpotIcon()}
            />
          </MapContainer>
          
          {/* Venue name overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '8px',
              px: 1.5,
              py: 0.75,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <MapPin size={14} color="#6C5CE7" />
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a1a2e', flex: 1 }}>
              {venueName}
            </Typography>
            {isMapPicked && (
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                Custom spot
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Navigation buttons (shown when accepted or for outgoing) */}
      {(status === INVITE_STATUS.ACCEPTED || !isIncoming) && coordinates && (
        <Box sx={{ p: 1.5, pt: 1, display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<Navigation size={14} />}
            onClick={() => handleNavigate(navigationUrl)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              borderRadius: '10px',
              borderColor: '#6C5CE7',
              color: '#6C5CE7',
              py: 0.75,
            }}
          >
            Google Maps
          </Button>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<ExternalLink size={14} />}
            onClick={() => handleNavigate(wazeUrl)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              borderRadius: '10px',
              borderColor: '#3b82f6',
              color: '#3b82f6',
              py: 0.75,
            }}
          >
            Waze
          </Button>
        </Box>
      )}

      {/* Response buttons (only for incoming pending invitations) */}
      {isIncoming && status === INVITE_STATUS.PENDING && (
        <Box sx={{ p: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Accept */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleAccept}
            disabled={isProcessing}
            startIcon={<Check size={16} />}
            sx={{
              py: 1,
              borderRadius: '12px',
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
            }}
          >
            Let's meet! ✨
          </Button>

          {/* Chat first */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleChatFirst}
            disabled={isProcessing}
            startIcon={<MessageCircle size={16} />}
            sx={{
              py: 1,
              borderRadius: '12px',
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#6C5CE7',
              color: '#6C5CE7',
            }}
          >
            I'd prefer to chat first
          </Button>

          {/* Decline */}
          <Button
            fullWidth
            variant="text"
            onClick={handleDecline}
            disabled={isProcessing}
            sx={{
              py: 0.75,
              borderRadius: '10px',
              fontWeight: 500,
              textTransform: 'none',
              color: '#64748b',
              fontSize: '0.9rem',
            }}
          >
            Not right now
          </Button>

          {/* Reassurance */}
          <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center', mt: 0.5 }}>
            All choices are valid — do what feels right
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/**
 * InviteResponseMessage - System message shown after response
 * Different messages for inviter vs invitee based on response type
 */
export function InviteResponseMessage({ responseType, isInviter, personName }) {
  const getMessage = () => {
    if (isInviter) {
      // Messages for the person who sent the invitation
      switch (responseType) {
        case INVITE_STATUS.ACCEPTED:
          return {
            icon: '🎉',
            title: `${personName} accepted!`,
            subtitle: 'Time to meet up! You can both navigate to the meeting spot.',
            color: '#10b981',
          };
        case INVITE_STATUS.DECLINED:
          return {
            icon: '💫',
            title: 'Maybe next time',
            subtitle: `${personName} can't meet right now, but you can still chat anytime.`,
            color: '#64748b',
          };
        case INVITE_STATUS.CHAT_FIRST:
          return {
            icon: '💬',
            title: `${personName} wants to chat first`,
            subtitle: "They're interested but prefer to get to know you better first. Keep the conversation going!",
            color: '#6C5CE7',
          };
        default:
          return null;
      }
    } else {
      // Messages for the person who received the invitation
      switch (responseType) {
        case INVITE_STATUS.ACCEPTED:
          return {
            icon: '✨',
            title: "You're meeting up!",
            subtitle: 'Use the navigation buttons to get to the meeting spot.',
            color: '#10b981',
          };
        case INVITE_STATUS.DECLINED:
          return {
            icon: '👍',
            title: 'No problem',
            subtitle: "You can still chat anytime if you change your mind.",
            color: '#64748b',
          };
        case INVITE_STATUS.CHAT_FIRST:
          return {
            icon: '💬',
            title: 'Great choice',
            subtitle: "Take your time getting to know each other. There's no rush.",
            color: '#6C5CE7',
          };
        default:
          return null;
      }
    }
  };

  const msg = getMessage();
  if (!msg) return null;

  return (
    <Box
      sx={{
        maxWidth: 280,
        p: 2,
        borderRadius: '16px',
        backgroundColor: `${msg.color}10`,
        border: `1px solid ${msg.color}30`,
        textAlign: 'center',
      }}
    >
      <Typography sx={{ fontSize: '1.5rem', mb: 1 }}>{msg.icon}</Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
        {msg.title}
      </Typography>
      <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.4 }}>
        {msg.subtitle}
      </Typography>
    </Box>
  );
}
