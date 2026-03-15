/**
 * UserDetailsScreen - Full profile view for a user
 * 
 * Route: /user/:id
 * Opens when user double-taps a card on Home
 * Back button returns to previous screen (Home)
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import ReportDialog from '../components/ReportDialog';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  User,
  Ruler,
  MapPin,
  Briefcase,
  GraduationCap,
  Dumbbell,
  Wine,
  Cigarette,
  Baby,
  Star,
  Vote,
  Globe,
  Home,
  MoreVertical,
  Flag,
  Ban,
  Sparkles,
  Music,
  Languages,
  HeartHandshake,
  Users,
  MessageCircle,
} from 'lucide-react';
import useHomeDeckStore from '../store/homeDeckStore';
import { DEMO_ATTENDEES } from './EventsByCategory';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return null;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

const getLikedProfiles = () => {
  try {
    const raw = localStorage.getItem('pulse_profile_likes');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const addLikedProfile = (id, meta = {}) => {
  try {
    const key = String(id);
    const arr = getLikedProfiles();
    const next = arr.some((x) => String(x?.id ?? x) === key)
      ? arr
      : [{ id: key, ts: Date.now(), ...meta }, ...arr];
    localStorage.setItem('pulse_profile_likes', JSON.stringify(next));
    window.dispatchEvent(new Event('pulse:profile_likes_changed'));
  } catch {
    // ignore
  }
};

// Transform API response to match frontend user model
const transformApiUser = (apiUser) => {
  // Parse JSON strings if needed (interests, hobbies may be stored as JSON strings)
  const parseJsonField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch {
      // If not JSON, split by comma
      return field.split(',').map(s => s.trim()).filter(Boolean);
    }
  };

  return {
    id: apiUser.id,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name || '',
    age: apiUser.age,
    gender: apiUser.gender,
    location: apiUser.residence,
    hometown: apiUser.place_of_origin,
    lookingFor: apiUser.looking_for,
    relationshipType: apiUser.relationship_type,
    interests: parseJsonField(apiUser.interests),
    hobbies: parseJsonField(apiUser.hobbies),
    favoriteSongs: parseJsonField(apiUser.favorite_songs),
    approachPreferences: apiUser.approach_preferences,
    customApproach: apiUser.custom_approach,
    photos: apiUser.photos || [],
    isActive: apiUser.is_active,
    lastActive: apiUser.last_active,
    latitude: apiUser.latitude,
    longitude: apiUser.longitude,
    // Additional profile fields
    bio: apiUser.bio,
    jobTitle: apiUser.job_title,
    education: apiUser.education,
    height: apiUser.height,
    zodiac: apiUser.zodiac,
    languages: apiUser.languages || [],
    causes: apiUser.causes || [],
    qualities: apiUser.qualities || [],
    prompts: apiUser.prompts || [],
    drinking: apiUser.drinking,
    smoking: apiUser.smoking,
    children: apiUser.children,
    religion: apiUser.religion,
    politics: apiUser.politics,
  };
};

export default function UserDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get source (todays_picks, discover, etc.) to handle actions appropriately
  const source = location.state?.from || sessionStorage.getItem('pulse_profile_source') || 'discover';

  const stateProfile = location.state?.profile;
  
  // Get store actions for like/pass
  const { addLikedUser, addPassedUser } = useHomeDeckStore();
  
  // Use location.state as preview data, but always fetch full profile
  const previewUser = location.state?.user || null;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  
  // Safety actions state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    // Validate ID before fetching
    if (!id || id === 'undefined') {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }

    const isNumericId = /^\d+$/.test(String(id));
    const isDemoId = !isNumericId;

    // If we navigated here without state and this is a demo/non-numeric ID,
    // resolve from DEMO_ATTENDEES so the profile spec stays consistent everywhere.
    if (!previewUser && !stateProfile && isDemoId) {
      const demo = (DEMO_ATTENDEES || []).find((a) => String(a.id) === String(id));
      if (demo) {
        setUser((prev) => ({
          ...(prev || {}),
          id: demo.id,
          firstName: demo.name,
          lastName: '',
          age: demo.age,
          gender: demo.gender,
          isMatch: !!demo.isMatch,
          likesYou: !!demo.likesYou,
          bio: demo.bio || '',
          photos: demo.photos?.length ? demo.photos : demo.photo ? [demo.photo] : [],
          primaryPhotoUrl: demo.photo,
          interests: demo.interests || [],
          hobbies: demo.hobbies || [],
          lookingFor: demo.lookingFor || ['New connections'],
          location: demo.location,
          jobTitle: demo.jobTitle || 'Member',
          education: demo.education || '—',
          height: demo.height || 170,
          zodiac: demo.zodiac,
          languages: demo.languages || ['Hebrew', 'English'],
          causes: demo.causes || ['Community'],
          qualities: demo.qualities || ['Kindness'],
          prompts: demo.prompts || [{ question: 'I geek out on...', answer: 'Live events and good vibes.' }],
          favoriteSongs: demo.favoriteSongs || ['Chill Vibes'],
          drinking: demo.drinking || 'Socially',
          smoking: demo.smoking || 'Never',
          children: demo.children || 'Not sure',
          religion: demo.religion || 'Secular',
          politics: demo.politics || 'Center',
        }));
        setLoading(false);
        setError(null);
        return;
      }
    }

    // Prefer Home-style payload (state.user). If absent, fall back to state.profile.
    const preview = previewUser || null;
    if (preview) {
      const rawLookingFor = preview.lookingFor;
      const lookingForArr = Array.isArray(rawLookingFor)
        ? rawLookingFor
        : rawLookingFor
          ? [rawLookingFor]
          : [];

      const rawPhotos = preview.photos;
      const photos = Array.isArray(rawPhotos)
        ? rawPhotos
        : preview.primaryPhotoUrl
          ? [preview.primaryPhotoUrl]
          : [];

      setUser((prev) => ({
        ...(prev || {}),
        id: preview.id ?? preview.userId ?? preview.user_id,
        firstName: preview.firstName || preview.name,
        lastName: preview.lastName || '',
        age: preview.age,
        gender: preview.gender,
        bio: preview.bio,
        photos,
        primaryPhotoUrl: preview.primaryPhotoUrl,
        interests: preview.interests || [],
        hobbies: preview.hobbies || [],
        lookingFor: lookingForArr,
        location: preview.location,
        jobTitle: preview.jobTitle,
        education: preview.education,
        height: preview.height,
        zodiac: preview.zodiac || preview.starSign,
        causes: preview.causes || (isDemoId ? ['Community'] : []),
        qualities: preview.qualities || (isDemoId ? ['Kindness'] : []),
        prompts: preview.prompts || (isDemoId ? [{ question: 'I geek out on...', answer: 'Live events and good vibes.' }] : []),
        favoriteSongs: preview.favoriteSongs,
        spotifyPlaylists: preview.spotifyPlaylists,
        languages: preview.languages || (isDemoId ? ['Hebrew', 'English'] : []),
        drinking: preview.drinking || (isDemoId ? 'Socially' : undefined),
        smoking: preview.smoking || (isDemoId ? 'Never' : undefined),
        children: (preview.children || preview.kids) || (isDemoId ? 'Not sure' : undefined),
        religion: preview.religion || (isDemoId ? 'Secular' : undefined),
        politics: preview.politics || (isDemoId ? 'Center' : undefined),
        // Match-related fields
        likesYou: preview.likesYou,
        isMatch: preview.isMatch,
      }));
      setLoading(false);
      setError(null);
    } else if (stateProfile) {
      const rawLookingFor = stateProfile.lookingFor;
      const lookingForArr = Array.isArray(rawLookingFor)
        ? rawLookingFor
        : rawLookingFor
          ? [rawLookingFor]
          : ['New connections'];

      const rawPhotos = stateProfile.photos;
      const photos = Array.isArray(rawPhotos)
        ? rawPhotos
        : stateProfile.photo
          ? [stateProfile.photo]
          : [];

      setUser((prev) => ({
        ...(prev || {}),
        id: stateProfile.id,
        firstName: stateProfile.name,
        lastName: '',
        age: stateProfile.age,
        gender: stateProfile.gender,
        bio: stateProfile.bio,
        photos,
        interests: stateProfile.interests || [],
        hobbies: stateProfile.hobbies || [],
        lookingFor: lookingForArr,
        location: stateProfile.location || stateProfile.city || '',
        jobTitle: stateProfile.jobTitle || stateProfile.profession || 'Member',
        education: stateProfile.education || '—',
        height: stateProfile.height || 170,
        zodiac: stateProfile.zodiac || stateProfile.starSign,
        causes: stateProfile.causes || (isDemoId ? ['Community'] : []),
        qualities: stateProfile.qualities || (isDemoId ? ['Kindness'] : []),
        prompts: stateProfile.prompts || (isDemoId ? [{ question: 'I geek out on...', answer: 'Live events and good vibes.' }] : []),
        favoriteSongs: stateProfile.favoriteSongs,
        spotifyPlaylists: stateProfile.spotifyPlaylists,
        languages: stateProfile.languages || (isDemoId ? ['Hebrew', 'English'] : []),
        drinking: stateProfile.drinking || (isDemoId ? 'Socially' : undefined),
        smoking: stateProfile.smoking || (isDemoId ? 'Never' : undefined),
        children: stateProfile.children || stateProfile.kids || (isDemoId ? 'Not sure' : undefined),
        religion: stateProfile.religion || (isDemoId ? 'Secular' : undefined),
        politics: stateProfile.politics || (isDemoId ? 'Center' : undefined),
        // Match-related fields
        likesYou: stateProfile.likesYou,
        isMatch: stateProfile.isMatch,
      }));
      setLoading(false);
      setError(null);
    }

    // Demo-only profiles (non-numeric IDs) do not exist in backend DB; don't fetch.
    if ((previewUser || stateProfile) && !isNumericId) {
      setLoading(false);
      return;
    }
    
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          throw new Error('User not found');
        }
        const data = await response.json();
        const fullUser = transformApiUser(data);
        console.log('[UserDetails] Fetched user from API:', fullUser.id, fullUser.firstName);
        
        // Prefer API data as source of truth, but keep any preview-only fields as fallback
        setUser((prev) => ({
          ...(prev || {}),
          ...fullUser,
        }));
      } catch (err) {
        // If fetch fails but we have preview data, keep showing it
        if (!previewUser && !stateProfile) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id, previewUser, stateProfile]);
  
  const photos = useMemo(() => {
    if (user?.photos?.length) return user.photos;
    if (user?.primaryPhotoUrl) return [user.primaryPhotoUrl];
    return [];
  }, [user]);

  const currentPhoto = photos[photoIndex] || photos[0];
  const distanceText = formatDistance(user?.distanceMeters);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = useCallback(async () => {
    if (!user?.id) return;
    
    console.log('[UserDetails] Like user:', user.id, 'source:', source);

    // Persist immediately so other screens can reflect status outside the card.
    addLikedProfile(user.id, { source });
    
    // Add to liked users in store (optimistic UI update)
    addLikedUser(user.id);
    
    // Get current user ID from auth context or localStorage
    const currentUserId = localStorage.getItem('pulse_user_id');

    // Check if this will be a match (they already liked us)
    const willBeMatch = user?.likesYou || user?.isMatch;
    console.log('[UserDetails] willBeMatch:', willBeMatch, 'likesYou:', user?.likesYou, 'isMatch:', user?.isMatch);

    // Helper to show match popup
    const showMatchPopup = (matchId) => {
      console.log('[UserDetails] Triggering match popup for:', user.firstName || user.name);
      sessionStorage.removeItem('pulse_profile_source');
      try {
        window.dispatchEvent(
          new CustomEvent('pulse:show_match', {
            detail: {
              match: {
                id: user.id,
                name: user.firstName || user.name,
                firstName: user.firstName || user.name,
                photo: user.primaryPhotoUrl || user.photo,
                photos: user.photos,
                matchId: matchId,
              },
            },
          })
        );
      } catch {
        // ignore
      }
    };

    // Demo-only profiles (non-numeric IDs) do not exist in backend DB; don't call API.
    const isNumericLikedId = /^\d+$/.test(String(user.id));
    if (!isNumericLikedId) {
      if (willBeMatch) {
        showMatchPopup();
        return;
      }
      sessionStorage.removeItem('pulse_profile_source');
      navigate(-1);
      return;
    }
    
    // Send like to server for persistence and match creation
    let apiMatch = false;
    let apiMatchId = null;
    try {
      const response = await fetch(`${API_URL}/api/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liker_id: currentUserId ? parseInt(currentUserId) : 1, // Demo fallback
          liked_id: user.id,
          source: source,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[UserDetails] Like response:', data);
        apiMatch = data.isMatch;
        apiMatchId = data.matchId;
      } else {
        console.log('[UserDetails] API failed with status:', response.status);
      }
    } catch (err) {
      console.error('[UserDetails] Failed to send like to server:', err);
    }
    
    // Show match if API says it's a match OR if local data indicates they liked us
    if (apiMatch || willBeMatch) {
      console.log('[UserDetails] It\'s a match! matchId:', apiMatchId);
      showMatchPopup(apiMatchId);
      return;
    }
    
    // If from Today's Picks, dismiss the pick (removes from Today's Picks UI)
    if (source === 'todays_picks') {
      try {
        await fetch(`${API_URL}/api/todays-picks/${user.id}/dismiss`, { method: 'POST' });
        console.log('[UserDetails] Dismissed Today\'s Pick:', user.id);
      } catch (err) {
        console.error('[UserDetails] Failed to dismiss pick:', err);
      }
    }
    
    // Clear source and navigate back
    sessionStorage.removeItem('pulse_profile_source');
    navigate(-1);
  }, [user?.id, source, addLikedUser, navigate]);

  const handlePass = useCallback(async () => {
    if (!user?.id) return;
    
    console.log('[UserDetails] Pass user:', user.id, 'source:', source);
    
    // Add to passed users in store
    addPassedUser(user.id);
    
    // If from Today's Picks, dismiss the pick (removes from Today's Picks UI)
    if (source === 'todays_picks') {
      try {
        await fetch(`${API_URL}/api/todays-picks/${user.id}/dismiss`, { method: 'POST' });
        console.log('[UserDetails] Dismissed Today\'s Pick:', user.id);
      } catch (err) {
        console.error('[UserDetails] Failed to dismiss pick:', err);
      }
    }
    
    // Clear source and navigate back
    sessionStorage.removeItem('pulse_profile_source');
    navigate(-1);
  }, [user?.id, source, addPassedUser, navigate]);

  // Safety actions handlers
  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleReportSubmit = useCallback(async (reportData) => {
    if (!user?.id) return;
    
    const currentUserId = localStorage.getItem('pulse_user_id');
    
    try {
      await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporter_id: currentUserId ? parseInt(currentUserId) : 1,
          reported_id: user.id,
          reason: reportData.reason,
          note: reportData.note,
        }),
      });
      console.log('[UserDetails] Reported user:', user.id);
      
      // Also block the user after reporting
      addPassedUser(user.id);
      setReportDialogOpen(false);
      setSnack({ open: true, msg: 'Report submitted. Thank you for helping keep Pulse safe.', severity: 'success' });
      sessionStorage.removeItem('pulse_profile_source');
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error('[UserDetails] Failed to report:', err);
      setSnack({ open: true, msg: 'Failed to submit report. Please try again.', severity: 'error' });
    }
  }, [user?.id, addPassedUser, navigate]);

  const handleBlock = useCallback(async () => {
    if (!user?.id) return;
    
    const currentUserId = localStorage.getItem('pulse_user_id');
    
    // Add to blocked users in localStorage for Settings page
    const blockedUser = {
      id: user.id,
      name: user.firstName || user.name || 'User',
      photo: user.photos?.[0] || user.photoUrl || '',
      source: 'profile',
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
    
    try {
      await fetch(`${API_URL}/api/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocker_id: currentUserId ? parseInt(currentUserId) : 1,
          blocked_id: user.id,
        }),
      });
      console.log('[UserDetails] Blocked user:', user.id);
      
      // Add to passed users so they don't appear anywhere
      addPassedUser(user.id);
      setBlockDialogOpen(false);
      sessionStorage.removeItem('pulse_profile_source');
      navigate(-1);
    } catch (err) {
      console.error('[UserDetails] Failed to block:', err);
      // Still remove from UI even if API fails
      addPassedUser(user.id);
      setBlockDialogOpen(false);
      navigate(-1);
    }
  }, [user?.id, addPassedUser, navigate]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', pt: 10 }}>
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', pt: 10 }}>
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="outlined" onClick={handleBack}>Go Back</Button>
      </Box>
    );
  }

  // User not found
  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', pt: 10 }}>
        <Typography sx={{ mb: 2 }}>User not found</Typography>
        <Button variant="outlined" onClick={handleBack}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#fff',
        pb: 10, // Space for bottom nav
      }}
    >
      {/* Header with back button and menu */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          pt: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          zIndex: 100,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)',
        }}
      >
        <IconButton
          onClick={handleBack}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'rgba(255,255,255,0.9)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          <ArrowLeft size={20} />
        </IconButton>
        
        {/* Safety menu button */}
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'rgba(255,255,255,0.9)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          <MoreVertical size={20} />
        </IconButton>
      </Box>

      {/* Safety Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { handleMenuClose(); setReportDialogOpen(true); }}>
          <ListItemIcon><Flag size={18} color="#ef4444" /></ListItemIcon>
          <ListItemText>Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setBlockDialogOpen(true); }}>
          <ListItemIcon><Ban size={18} color="#64748b" /></ListItemIcon>
          <ListItemText>Block</ListItemText>
        </MenuItem>
      </Menu>

      {/* Photo Section */}
      <Box sx={{ position: 'relative', width: '100%', height: '50vh', minHeight: 350 }}>
        <Box
          component="img"
          src={currentPhoto}
          alt={user.firstName}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
          }}
        />
        
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Photo indicators */}
        {photos.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              top: 70, // Below header
              left: 16,
              right: 16,
              display: 'flex',
              gap: 0.5,
              zIndex: 10,
            }}
          >
            {photos.map((_, i) => (
              <Box
                key={i}
                onClick={() => setPhotoIndex(i)}
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </Box>
        )}

        {/* Photo navigation */}
        {photos.length > 1 && (
          <>
            <IconButton
              onClick={() => setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 44,
                height: 44,
                bgcolor: 'rgba(255,255,255,0.9)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#fff' },
              }}
            >
              <ChevronLeft size={24} />
            </IconButton>
            <IconButton
              onClick={() => setPhotoIndex((prev) => (prev + 1) % photos.length)}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 44,
                height: 44,
                bgcolor: 'rgba(255,255,255,0.9)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#fff' },
              }}
            >
              <ChevronRight size={24} />
            </IconButton>
          </>
        )}
      </Box>

      {/* Action Buttons - Undo / X / Like */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          py: 2,
          px: 3,
          bgcolor: '#fff',
        }}
      >
        {/* Dislike / X button */}
        <IconButton
          onClick={handlePass}
          sx={{
            width: 64,
            height: 64,
            bgcolor: '#fff',
            border: '2px solid #ef4444',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
            '&:hover': { bgcolor: '#fef2f2' },
          }}
        >
          <X size={32} color="#ef4444" />
        </IconButton>

        {/* Like / Heart button */}
        <IconButton
          onClick={handleLike}
          sx={{
            width: 64,
            height: 64,
            bgcolor: '#22c55e',
            border: '2px solid #22c55e',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
            '&:hover': { bgcolor: '#16a34a' },
          }}
        >
          <Heart size={32} color="#fff" fill="#fff" />
        </IconButton>
      </Box>

      {/* Profile Details */}
      <Box sx={{ p: 3, pb: 6 }}>
        {/* Name and age */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {user.firstName}{user.lastName ? ` ${user.lastName}` : ''}, {user.age}
        </Typography>
        {distanceText && (
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            {distanceText} away
          </Typography>
        )}

        {/* Bio */}
        {user.bio && (
          <Typography sx={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7, mb: 3 }}>
            {user.bio}
          </Typography>
        )}

        {/* Looking For */}
        {((Array.isArray(user.lookingFor) && user.lookingFor.length > 0) || (!Array.isArray(user.lookingFor) && !!user.lookingFor)) && (
          <Box sx={{ mb: 2.5, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
            <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>Looking for</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
              {(Array.isArray(user.lookingFor) ? user.lookingFor : [user.lookingFor]).join(', ')}
            </Typography>
          </Box>
        )}

        {/* Interests */}
        {user.interests?.length > 0 && (
          <Box sx={{ mb: 2.5, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
            <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1 }}>Interests</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {user.interests.map((item, i) => (
                <Chip 
                  key={i} 
                  label={typeof item === 'string' ? item : item.label} 
                  size="small" 
                  sx={{ bgcolor: '#f3f4f6', color: '#374151', fontSize: 12 }} 
                />
              ))}
            </Box>
          </Box>
        )}

        {/* My Details - Grid Layout */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', mb: 2 }}>My Details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
            {user.height && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Ruler size={16} color="#64748b" />
                <Box>
                  <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>Height</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{user.height} cm</Typography>
                </Box>
              </Box>
            )}
            {user.jobTitle && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Briefcase size={16} color="#64748b" />
                <Box>
                  <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>Work</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{user.jobTitle}</Typography>
                </Box>
              </Box>
            )}
            {user.education && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <GraduationCap size={16} color="#64748b" />
                <Box>
                  <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>Education</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{user.education}</Typography>
                </Box>
              </Box>
            )}
            {user.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <MapPin size={16} color="#64748b" />
                <Box>
                  <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>Location</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{user.location}</Typography>
                </Box>
              </Box>
            )}
            {user.zodiac && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Sparkles size={16} color="#64748b" />
                <Box>
                  <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>Zodiac</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{user.zodiac}</Typography>
                </Box>
              </Box>
            )}
            {user.languages?.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Languages size={16} color="#64748b" />
                <Box>
                  <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>Languages</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{(Array.isArray(user.languages) ? user.languages : [user.languages]).slice(0, 2).join(', ')}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Lifestyle */}
        {(user.drinking || user.smoking || user.children || user.religion) && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', mb: 2 }}>Lifestyle</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {user.drinking && (
                <Chip icon={<Wine size={14} />} label={user.drinking} size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e' }} />
              )}
              {user.smoking && (
                <Chip icon={<Cigarette size={14} />} label={user.smoking} size="small" sx={{ bgcolor: '#f3f4f6', color: '#374151' }} />
              )}
              {user.children && (
                <Chip icon={<Baby size={14} />} label={user.children} size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af' }} />
              )}
              {user.religion && (
                <Chip icon={<Star size={14} />} label={user.religion} size="small" sx={{ bgcolor: '#ede9fe', color: '#5b21b6' }} />
              )}
              {user.politics && (
                <Chip icon={<Vote size={14} />} label={user.politics} size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b' }} />
              )}
            </Box>
          </Box>
        )}

        {/* Prompts */}
        {user.prompts?.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>Prompts</Typography>
            {user.prompts.map((prompt, i) => (
              <Box key={i} sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography sx={{ fontSize: 12, color: '#64748b', mb: 0.5 }}>{prompt.question}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{prompt.answer}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Causes & Communities */}
        {user.causes?.length > 0 && (
          <Box sx={{ mb: 2.5, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
            <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1 }}>Causes & Communities</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {user.causes.map((cause, i) => (
                <Chip 
                  key={i} 
                  icon={<HeartHandshake size={12} />}
                  label={typeof cause === 'string' ? cause : cause.label} 
                  size="small" 
                  sx={{ bgcolor: '#fef3c7', color: '#92400e', fontSize: 12 }} 
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Qualities I Value */}
        {user.qualities?.length > 0 && (
          <Box sx={{ mb: 2.5, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
            <Typography sx={{ fontSize: 12, color: '#64748b', mb: 1 }}>Qualities I Value</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {user.qualities.map((quality, i) => (
                <Chip 
                  key={i} 
                  icon={<Star size={12} />}
                  label={typeof quality === 'string' ? quality : quality.label} 
                  size="small" 
                  sx={{ bgcolor: '#ede9fe', color: '#5b21b6', fontSize: 12 }} 
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Spotify / Favorite Music with Album Art */}
        {(user.favoriteSongs?.length > 0 || user.spotifyPlaylists?.length > 0) && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Music size={16} color="#1DB954" /> Favorite Music
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {(user.favoriteSongs || user.spotifyPlaylists || []).map((song, i) => {
                const songName = typeof song === 'string' ? song : song.name;
                const artistName = typeof song === 'object' ? song.artist : null;
                const customImage = typeof song === 'object' ? song.image : null;
                // Demo album art based on song name
                const albumArts = {
                  'Shape of You': 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
                  'Blinding Lights': 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
                  'Levitating': 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946',
                  'Bad Guy': 'https://i.scdn.co/image/ab67616d0000b27350a3147b4edd7701a876c6ce',
                  'Watermelon Sugar': 'https://i.scdn.co/image/ab67616d0000b27377fdcfda6535601aff081b6a',
                  'Stay': 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a',
                };
                const albumArt = customImage || albumArts[songName] || `https://picsum.photos/seed/${songName}/120/120`;
                
                return (
                  <Box key={i} sx={{ minWidth: 100, textAlign: 'center' }}>
                    <Box
                      component="img"
                      src={albumArt}
                      alt={songName}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        objectFit: 'cover',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        mb: 1,
                      }}
                    />
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#374151', lineHeight: 1.2 }}>
                      {songName}
                    </Typography>
                    {artistName && (
                      <Typography sx={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.2 }}>
                        {artistName}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* Report Dialog */}
      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        onSubmit={handleReportSubmit}
        userName={user?.firstName || 'this user'}
      />

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Block Dialog */}
      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Block {user.firstName}?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {user.firstName} will no longer be able to see your profile or contact you. 
            They won't be notified that you blocked them.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setBlockDialogOpen(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button onClick={handleBlock} variant="contained" color="error">
            Block
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
