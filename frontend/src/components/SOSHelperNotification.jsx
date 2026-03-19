// SOSHelperNotification.jsx - Component shown to helpers when someone needs help
// This component displays the incoming SOS request and helper navigation screen
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  Shield,
  Navigation,
  MapPin,
  CheckCircle,
  Check,
  X,
} from 'lucide-react';

// SOS Helper States
export const HELPER_STATE = {
  INCOMING: 'incoming',      // Request just received
  ACCEPTED: 'accepted',      // Helper accepted, navigating
  APPROACHING: 'approaching', // Helper getting closer
  ARRIVED: 'arrived',        // Helper arrived, waiting for confirmation
  CONFIRMED: 'confirmed',    // Requester confirmed help
  CANCELLED: 'cancelled',    // Helper or requester cancelled
};

/**
 * SOSHelperNotification Component
 * 
 * Props:
 * - open: boolean - Whether the notification is visible
 * - onClose: function - Called when notification is closed
 * - requester: object - { name, age, photo, tagline, verified }
 * - location: object - { address, lat, lng, distance }
 * - onAccept: function - Called when helper accepts
 * - onDecline: function - Called when helper declines
 * - onCancel: function - Called when helper cancels after accepting
 * - onNavigate: function - Called when helper clicks navigate
 * - helperState: string - Current state of the helper flow
 * - rewardPoints: number - Points earned for helping
 */
function SOSHelperNotification({
  open,
  onClose,
  requester = {
    name: 'Liza',
    age: 28,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    tagline: 'Adventure seeker with a passion for discovering new places ✈️',
    verified: true,
  },
  location = {
    address: 'Dizengoff Center, Tel Aviv',
    lat: 32.0753,
    lng: 34.7748,
    distance: 1.2,
  },
  onAccept,
  onDecline,
  onCancel,
  onNavigate,
  helperState = HELPER_STATE.INCOMING,
  rewardPoints = 150,
  embedded = false, // If true, render without Dialog wrapper (for demo preview)
}) {
  // Use prop state directly when embedded (controlled by parent), otherwise use local state
  const [localState, setLocalState] = useState(helperState);
  const currentState = embedded ? helperState : localState;

  // Handle accept
  const handleAccept = () => {
    setLocalState(HELPER_STATE.ACCEPTED);
    onAccept?.();
  };

  // Handle decline
  const handleDecline = () => {
    onDecline?.();
    onClose?.();
  };

  // Handle cancel
  const handleCancel = () => {
    setLocalState(HELPER_STATE.CANCELLED);
    onCancel?.();
  };

  // Handle navigate
  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=walking`;
    window.open(url, '_blank');
    onNavigate?.();
  };

  // Get status message based on state
  const getStatusMessage = () => {
    switch (currentState) {
      case HELPER_STATE.ACCEPTED:
        return '🚶 Head to the location now';
      case HELPER_STATE.APPROACHING:
        return '📍 Getting closer... Keep going!';
      case HELPER_STATE.ARRIVED:
        return `✅ You arrived! Waiting for ${requester.name} to confirm`;
      case HELPER_STATE.CONFIRMED:
        return `💜 Thank you for helping ${requester.name}! You earned ${rewardPoints} points`;
      case HELPER_STATE.CANCELLED:
        return 'Request cancelled';
      default:
        return '';
    }
  };

  // Content to render (shared between dialog and embedded modes)
  const renderContent = () => (
    <>
      {/* Incoming Request View */}
      {currentState === HELPER_STATE.INCOMING && (
          <Box sx={{ p: 2.5 }}>
            {/* Urgent Header */}
            <Box sx={{ 
              display: 'flex', alignItems: 'center', gap: 1, mb: 2,
              p: 1.5, borderRadius: '12px', bgcolor: 'rgba(108, 92, 231, 0.08)',
            }}>
              <Box sx={{ 
                width: 32, height: 32, borderRadius: '50%', 
                bgcolor: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(108, 92, 231, 0.4)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(108, 92, 231, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(108, 92, 231, 0)' },
                },
              }}>
                <Shield size={18} color="#fff" />
              </Box>
              <Typography sx={{ fontWeight: 700, color: '#6C5CE7', fontSize: '0.9rem' }}>
                🚨 Pulse Community Alert
              </Typography>
            </Box>

            {/* Main Message */}
            <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem', mb: 0.5, lineHeight: 1.4 }}>
              A Pulse member needs your help! 💜
            </Typography>
            <Typography variant="body2" sx={{ color: '#374151', mb: 1, lineHeight: 1.5 }}>
              Someone from our community is <strong>{location.distance} km</strong> away from you and needs assistance right now.
            </Typography>
            <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 500, mb: 2.5, fontStyle: 'italic' }}>
              Be the hero. Help a fellow Pulse member and make our community safer together. 🤝
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button 
                fullWidth
                variant="contained" 
                onClick={handleAccept}
                sx={{ 
                  bgcolor: '#6C5CE7', textTransform: 'none', fontWeight: 700,
                  py: 1.5, borderRadius: '12px', fontSize: '1rem',
                  '&:hover': { bgcolor: '#5B4CD6' },
                }}
              >
                🦸 Accept & Help
              </Button>
              <Button 
                fullWidth
                variant="outlined" 
                onClick={handleDecline}
                sx={{ 
                  borderColor: '#94a3b8', color: '#64748b', textTransform: 'none',
                  py: 1.5, borderRadius: '12px', fontWeight: 600,
                }}
              >
                Not now
              </Button>
            </Box>
          </Box>
        )}

        {/* Accepted/Navigation View */}
        {(currentState === HELPER_STATE.ACCEPTED || 
          currentState === HELPER_STATE.APPROACHING ||
          currentState === HELPER_STATE.ARRIVED ||
          currentState === HELPER_STATE.CONFIRMED) && (
          <Box>
            {/* Success Header */}
            <Box sx={{ 
              p: 1.5, bgcolor: '#10B981', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
            }}>
              <CheckCircle size={20} color="#fff" />
              <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                You're on your way to help! 💜
              </Typography>
            </Box>

            <Box sx={{ p: 2.5 }}>
              {/* Profile Preview */}
              <Box sx={{ 
                display: 'flex', alignItems: 'center', gap: 2, mb: 2,
                p: 1.5, borderRadius: '12px', bgcolor: '#f8fafc',
              }}>
                {/* Profile Photo */}
                <Box sx={{ 
                  width: 70, height: 70, borderRadius: '12px', 
                  overflow: 'hidden', flexShrink: 0,
                  border: '3px solid #6C5CE7',
                }}>
                  <img 
                    src={requester.photo}
                    alt={requester.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                {/* Profile Info */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.1rem' }}>
                      {requester.name}, {requester.age}
                    </Typography>
                    {requester.verified && (
                      <Box sx={{ 
                        width: 18, height: 18, borderRadius: '50%', 
                        bgcolor: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        <Check size={12} color="#fff" />
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4 }}>
                    {requester.tagline}
                  </Typography>
                </Box>
              </Box>

              {/* Location Info */}
              <Box sx={{ 
                bgcolor: '#f0fdf4', p: 1.5, borderRadius: '10px', mb: 1.5,
                border: '1px solid #86efac',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <MapPin size={16} color="#10B981" />
                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                    LOCATION
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.95rem' }}>
                  {location.address}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {location.distance} km away from you
                </Typography>
              </Box>

              {/* Navigation Button */}
              <Button
                fullWidth
                variant="contained"
                startIcon={<Navigation size={18} />}
                onClick={handleNavigate}
                sx={{
                  py: 1.5, borderRadius: '10px', textTransform: 'none',
                  fontWeight: 700, fontSize: '0.95rem',
                  bgcolor: '#3B82F6',
                  '&:hover': { bgcolor: '#2563EB' },
                  mb: 1,
                }}
              >
                Navigate with Google Maps
              </Button>

              {/* Cancel Option */}
              {currentState !== HELPER_STATE.CONFIRMED && (
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleCancel}
                  sx={{
                    py: 1, borderRadius: '10px', textTransform: 'none',
                    fontWeight: 600, fontSize: '0.85rem',
                    color: '#94a3b8',
                    '&:hover': { bgcolor: '#f8fafc', color: '#ef4444' },
                  }}
                >
                  I can't help anymore
                </Button>
              )}

              {/* Status */}
              <Box sx={{ 
                mt: 1.5, p: 1.5, borderRadius: '10px', 
                bgcolor: currentState === HELPER_STATE.CONFIRMED ? '#f0fdf4' : '#f8fafc',
                textAlign: 'center',
              }}>
                <Typography sx={{ 
                  color: currentState === HELPER_STATE.CONFIRMED ? '#10B981' : '#64748b',
                  fontSize: '0.85rem', fontWeight: 500,
                }}>
                  {getStatusMessage()}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Cancelled View */}
        {currentState === HELPER_STATE.CANCELLED && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ 
              width: 60, height: 60, borderRadius: '50%', 
              bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
            }}>
              <X size={28} color="#64748b" />
            </Box>
            <Typography sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
              Request Cancelled
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Thank you for being part of the Pulse community. Your willingness to help matters.
            </Typography>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                bgcolor: '#6C5CE7', textTransform: 'none', fontWeight: 600,
                px: 4, py: 1, borderRadius: '10px',
              }}
            >
              Close
            </Button>
          </Box>
        )}
    </>
  );

  // If embedded mode, render content directly without Dialog wrapper
  if (embedded) {
    return (
      <Box sx={{ 
        borderRadius: '16px', 
        overflow: 'hidden',
        border: currentState === HELPER_STATE.INCOMING ? '2px solid #6C5CE7' : '2px solid #10B981',
        bgcolor: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        {renderContent()}
      </Box>
    );
  }

  // Normal dialog mode
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxWidth: 400,
          width: '95%',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

export default SOSHelperNotification;
