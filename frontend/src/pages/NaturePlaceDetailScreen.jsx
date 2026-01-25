// NaturePlaceDetailScreen.jsx — Nature Place Detail Page
// Full page view for nature places with trails, equipment, fees, and invite functionality

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Check,
  MessageCircle,
  Share2,
  Heart,
  Bookmark,
  BookmarkCheck,
  Navigation,
  Star,
} from "lucide-react";
import useGestureMessagesStore from '../store/gestureMessagesStore';
import useChatStore from '../store/chatStore';

// Real matches from chat - these are the actual matches the user has
const AGENT_ID = "pulse-agent";

export default function NaturePlaceDetailScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const [place, setPlace] = useState(location.state?.place || null);
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [inviteSent, setInviteSent] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  
  // Saved places state
  const [isSaved, setIsSaved] = useState(false);
  
  // User rating state
  const [userRating, setUserRating] = useState(0);
  
  // Real matches from chat store
  const [realMatches, setRealMatches] = useState([]);
  
  // Load real matches from localStorage (same as ChatScreen uses)
  useEffect(() => {
    try {
      // Get chats from gesture chats store
      const gestureChats = useChatStore.getState().gestureChats;
      const gestureMatches = Object.values(gestureChats)
        .filter(chat => chat.matchId !== AGENT_ID)
        .map(chat => ({
          id: chat.matchId,
          name: chat.user?.name || 'Unknown',
          photoUrl: chat.user?.photoUrl || '',
        }));
      
      // Also include demo chats (hardcoded matches that exist in ChatScreen)
      const demoMatches = [
        { id: 4, name: "Liza", photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=256&q=80" },
        { id: 5, name: "Gali", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80" },
        { id: 6, name: "Shani", photoUrl: "/liza_1.jpg" },
        { id: 7, name: "Noa", photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80" },
      ];
      
      // Combine and dedupe by id
      const allMatches = [...demoMatches];
      gestureMatches.forEach(gm => {
        if (!allMatches.some(m => m.id === gm.id)) {
          allMatches.push(gm);
        }
      });
      
      setRealMatches(allMatches);
    } catch (e) {
      console.error("Error loading matches:", e);
    }
  }, []);
  
  // Check if place is saved on mount
  useEffect(() => {
    if (place) {
      try {
        const savedPlaces = JSON.parse(localStorage.getItem("saved_places") || "[]");
        const saved = savedPlaces.some(p => p.id === place.id || String(p.id) === String(place.id));
        setIsSaved(saved);
      } catch (e) {
        console.error("Error checking saved places:", e);
      }
    }
  }, [place]);

  // If no place in state, we could fetch it (for now just show error)
  useEffect(() => {
    if (!place && id) {
      // In production, fetch place by ID
      console.log('Place not found in state, ID:', id);
    }
  }, [place, id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleInviteMatch = () => {
    if (selectedMatch && place) {
      // Create a place invite message for chat (matches ChatScreen's expected format)
      const inviteMessage = {
        id: Date.now(),
        from: 'me',
        type: 'place_invite',
        text: `Hey ${selectedMatch.name}! 🌿 I found this amazing place and thought of you - want to check it out together?`,
        timestamp: Date.now(),
        status: 'sent',
        reactions: {},
        place: {
          id: place.id,
          name: place.name,
          image: place.image,
          location: place.location,
          type: 'Nature & Parks',
          entryFee: place.natureDetails?.entryFee?.free ? 'Free entry' : `₪${place.natureDetails?.entryFee?.adult}/person`,
          maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.location)}`,
        },
      };
      
      // Save to localStorage for ChatScreen to pick up
      try {
        const pendingInvites = JSON.parse(localStorage.getItem("pending_place_invites") || "[]");
        pendingInvites.push({
          matchId: selectedMatch.id,
          message: inviteMessage,
          userInfo: {
            id: selectedMatch.id,
            name: selectedMatch.name,
            photoUrl: selectedMatch.photoUrl,
          },
        });
        localStorage.setItem("pending_place_invites", JSON.stringify(pendingInvites));
      } catch (e) {
        console.error("Error saving invite:", e);
      }
      
      setInviteSent(true);
    }
  };

  const handleWhatsAppInvite = () => {
    if (!place) return;
    const message = encodeURIComponent(
      `Hey! 🌿 Want to explore ${place.name} together?\n\n` +
      `📍 ${place.location}\n` +
      `${place.natureDetails?.entryFee?.free ? '✅ Free entry!' : `💰 Entry: ₪${place.natureDetails?.entryFee?.adult}/person`}\n\n` +
      `Let me know if you're interested! 🥾`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleNavigate = () => {
    if (!place) return;
    const query = encodeURIComponent(place.name + ' ' + place.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleSaveToggle = () => {
    if (!place) return;
    
    try {
      const savedPlaces = JSON.parse(localStorage.getItem("saved_places") || "[]");
      
      if (isSaved) {
        // Remove from saved
        const updated = savedPlaces.filter(p => p.id !== place.id && String(p.id) !== String(place.id));
        localStorage.setItem("saved_places", JSON.stringify(updated));
        setIsSaved(false);
        setToast({ open: true, message: 'Removed from saved', severity: 'info' });
      } else {
        // Add to saved
        const newSavedPlace = {
          id: place.id,
          name: place.name,
          category: place.category,
          location: place.location,
          image: place.image,
          natureDetails: place.natureDetails,
          pulseRating: place.pulseRating,
          vibes: place.vibes,
        };
        savedPlaces.push(newSavedPlace);
        localStorage.setItem("saved_places", JSON.stringify(savedPlaces));
        setIsSaved(true);
        setToast({ open: true, message: 'Saved! ✓', severity: 'success' });
      }
      
      // Auto-hide toast
      setTimeout(() => setToast(prev => ({ ...prev, open: false })), 2000);
    } catch (e) {
      console.error("Error saving place:", e);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return { bg: '#dcfce7', color: '#16a34a' };
      case 'Moderate': return { bg: '#fef3c7', color: '#d97706' };
      case 'Challenging': return { bg: '#fee2e2', color: '#dc2626' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  if (!place || !place.natureDetails) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
        p: 3,
      }}>
        <Typography variant="h6" sx={{ color: '#64748b' }}>Place not found</Typography>
        <Button variant="contained" onClick={handleBack}>Go Back</Button>
      </Box>
    );
  }

  const details = place.natureDetails;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#fff',
      pb: 12, // Space for bottom nav
    }}>
      {/* Hero Image with Back Button */}
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={place.image}
          alt={place.name}
          sx={{ 
            width: '100%', 
            height: 220, 
            objectFit: 'cover',
          }}
        />
        {/* Gradient Overlay */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)',
        }} />
        
        {/* Entry Fee Badge */}
        <Chip
          label={details.entryFee?.free ? '✅ Free Entry' : `₪${details.entryFee?.adult}/person`}
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            bgcolor: details.entryFee?.free ? 'rgba(34,197,94,0.95)' : 'rgba(108,92,231,0.95)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.8rem',
            height: 32,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        />

        {/* Rating Badge */}
        <Box sx={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          bgcolor: 'rgba(255,255,255,0.95)',
          borderRadius: '8px',
          px: 1.5,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <Typography sx={{ fontSize: '1rem' }}>⭐</Typography>
          <Typography sx={{ fontWeight: 700, color: '#1a1a2e' }}>{place.pulseRating}</Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2, pt: 2 }}>
        {/* Title & Location */}
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.5 }}>
          {place.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <MapPin size={16} color="#64748b" />
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {place.location}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>·</Typography>
          <Clock size={16} color="#64748b" />
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Best time: {details.bestTime}
          </Typography>
        </Box>
        
        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Navigation size={18} />}
            onClick={handleNavigate}
            sx={{
              flex: 1,
              py: 1.25,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Navigate
          </Button>
          <IconButton
            onClick={handleSaveToggle}
            sx={{ 
              bgcolor: isSaved ? 'rgba(108,92,231,0.1)' : '#f1f5f9', 
              borderRadius: '12px',
              width: 48,
              height: 48,
              transition: 'all 0.2s',
            }}
          >
            {isSaved ? (
              <BookmarkCheck size={22} color="#6C5CE7" />
            ) : (
              <Bookmark size={22} color="#64748b" />
            )}
          </IconButton>
          <IconButton
            onClick={handleWhatsAppInvite}
            sx={{ 
              bgcolor: '#f1f5f9', 
              borderRadius: '12px',
              width: 48,
              height: 48,
            }}
          >
            <Share2 size={22} color="#64748b" />
          </IconButton>
        </Box>

        {/* About Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>📖</span> About
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>
            {details.about}
          </Typography>
        </Box>

        {/* Trails Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>🥾</span> Trails & Routes
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {details.trails.map((trail, idx) => (
              <Box
                key={idx}
                sx={{
                  bgcolor: '#f8fafc',
                  borderRadius: '14px',
                  p: 2,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {trail.name}
                  </Typography>
                  <Chip
                    label={trail.difficulty}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: getDifficultyColor(trail.difficulty).bg,
                      color: getDifficultyColor(trail.difficulty).color,
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 600, mb: 0.5 }}>
                  {trail.distance} · {trail.duration}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {trail.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Equipment Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>🎒</span> Don't Forget to Bring
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {details.equipment.map((item, idx) => (
              <Chip
                key={idx}
                label={item}
                sx={{
                  bgcolor: '#fef3c7',
                  color: '#92400e',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  height: 32,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Entry Fee Details */}
        <Box sx={{ 
          mb: 3, 
          bgcolor: details.entryFee?.free ? '#f0fdf4' : '#faf5ff', 
          borderRadius: '14px', 
          p: 2,
          border: details.entryFee?.free ? '1px solid #bbf7d0' : '1px solid #e9d5ff',
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>💰</span> Entry Fee
          </Typography>
          {details.entryFee?.free ? (
            <Typography variant="body1" sx={{ color: '#16a34a', fontWeight: 600 }}>
              Free entry! {details.entryFee.note}
            </Typography>
          ) : (
            <>
              <Typography variant="body1" sx={{ color: '#6C5CE7', fontWeight: 700, mb: 0.5 }}>
                Adult: ₪{details.entryFee.adult} · Child: ₪{details.entryFee.child}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {details.entryFee.note}
              </Typography>
            </>
          )}
        </Box>

        {/* Facilities */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>🏛️</span> Facilities
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>
            {details.facilities.join(' • ')}
          </Typography>
        </Box>

        {/* Invite Section */}
        <Box sx={{ 
          bgcolor: '#f8fafc', 
          borderRadius: '16px', 
          p: 2,
          border: '1px solid #e2e8f0',
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>💜</span> Invite Someone to Join
          </Typography>
          
          {!showInviteSection ? (
            <Button
              fullWidth
              variant="contained"
              onClick={() => setShowInviteSection(true)}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              }}
            >
              🥾 Find a Hiking Partner
            </Button>
          ) : inviteSent ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                bgcolor: '#dcfce7', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5,
              }}>
                <Check size={30} color="#22c55e" />
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                Invite Sent! 🌿
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                Continue chatting to plan your adventure
              </Typography>
              {/* Success Toast Message */}
              <Box
                sx={{
                  bgcolor: '#22c55e',
                  color: '#fff',
                  px: 2.5,
                  py: 1,
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  mb: 2,
                }}
              >
                ✓ Invite sent to {selectedMatch?.name}!
              </Box>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/chat')}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Go to Chat
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                Invite a Pulse match to explore together
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {realMatches.map((match) => (
                  <Box
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.25,
                      borderRadius: '12px',
                      border: selectedMatch?.id === match.id ? '2px solid #6C5CE7' : '1px solid #e2e8f0',
                      bgcolor: selectedMatch?.id === match.id ? 'rgba(108,92,231,0.08)' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Avatar src={match.photoUrl} sx={{ width: 44, height: 44 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>{match.name}</Typography>
                    {selectedMatch?.id === match.id && (
                      <Check size={20} color="#6C5CE7" />
                    )}
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleWhatsAppInvite}
                  startIcon={<MessageCircle size={18} />}
                  sx={{
                    py: 1,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#25D366',
                    color: '#25D366',
                  }}
                >
                  WhatsApp
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleInviteMatch}
                  disabled={!selectedMatch}
                  sx={{
                    py: 1,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    '&:disabled': { background: '#e2e8f0', color: '#94a3b8' },
                  }}
                >
                  Send Invite
                </Button>
              </Box>
            </>
          )}
        </Box>

        {/* Rating Section - at very bottom */}
        <Box sx={{ 
          bgcolor: '#faf5ff', 
          borderRadius: '16px', 
          p: 2, 
          mt: 3,
          border: '1px solid #e9d5ff',
        }}>
          {/* Pulse Members Rating - First */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
              Pulse Members Rating
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: '2.5rem', color: '#6C5CE7', fontWeight: 800, lineHeight: 1 }}>
                {place.pulseRating || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                / 5
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Based on {place.pulseReviews || 0} reviews
            </Typography>
          </Box>
          
          {/* User Rating - Second */}
          <Box sx={{ 
            bgcolor: '#fff', 
            borderRadius: '12px', 
            p: 1.5,
            textAlign: 'center',
          }}>
            <Typography variant="body2" sx={{ color: '#1a1a2e', fontWeight: 600, mb: 1 }}>
              {userRating > 0 ? 'Your Rating' : 'Rate this place'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                  key={star}
                  onClick={() => {
                    setUserRating(star);
                    setToast({ open: true, message: `Thanks for rating! ⭐`, severity: 'success' });
                    setTimeout(() => setToast(prev => ({ ...prev, open: false })), 2000);
                  }}
                  sx={{ 
                    p: 0.5,
                    transition: 'transform 0.15s',
                    '&:hover': { 
                      bgcolor: 'transparent',
                      transform: 'scale(1.2)',
                    },
                  }}
                >
                  <Star
                    size={32}
                    fill={star <= userRating ? '#6C5CE7' : 'none'}
                    color="#6C5CE7"
                    strokeWidth={star <= userRating ? 0 : 1.5}
                  />
                </IconButton>
              ))}
            </Box>
            {userRating === 0 && (
              <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
                Tap a star to rate
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Toast - Centered */}
      {toast.open && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              bgcolor: toast.severity === 'success' ? '#22c55e' : '#6C5CE7',
              color: '#fff',
              px: 3,
              py: 1.5,
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            {toast.message}
          </Box>
        </Box>
      )}
    </Box>
  );
}
