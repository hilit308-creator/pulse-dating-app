/**
 * UserProfilePage.jsx
 * Full profile view using ProfileTimeline (same layout as Home page)
 * 
 * Route: /user/:id
 * Opens when user clicks on Today's Picks or any profile card
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { ProfileTimeline } from '../components/timeline';
import SwipeWrapper, { SwipeLabels } from '../components/SwipeWrapper';
import useHomeDeckStore from '../store/homeDeckStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Transform user data to ProfileTimeline format
const transformToUserCardModel = (user) => ({
  id: user.id,
  userId: String(user.id),
  firstName: user.firstName || user.name,
  age: user.age,
  distanceMeters: user.distanceMeters || (user.distance ? user.distance * 1000 : null),
  primaryPhotoUrl: user.primaryPhotoUrl || user.photoUrl || (user.photos && user.photos[0]) || '',
  photos: user.photos || [user.primaryPhotoUrl || user.photoUrl].filter(Boolean),
  liveStatus: user.liveStatus || user.tagline || null,
  primaryRole: user.profession || user.jobTitle || null,
  topInterests: user.interests?.slice(0, 3).map(interest => ({
    label: typeof interest === 'string' ? interest : interest.label,
    icon: null
  })) || null,
  contextLine: user.tagline || user.profession || user.bio || 'Looking for genuine connections',
  height: user.height != null ? String(user.height) : null,
  drinking: user.drinking,
  professionalField: user.professionalField,
  isVerified: user.verified || false,
  isMatch: user.isMatch || false,
  likesYou: user.likesYou || false,
  bio: user.bio || user.tagline || '',
  occupation: user.profession || user.jobTitle,
  education: user.education,
  gender: user.gender,
  location: user.location || user.city,
  hometown: user.hometown,
  interests: user.interests,
  lookingFor: user.lookingFor,
  qualities: user.qualities,
  causes: user.causes,
  exercise: user.exercise,
  smoking: user.smoking,
  kids: user.kids || user.children,
  starSign: user.starSign || user.zodiac,
  politics: user.politics,
  languages: user.languages,
  spotifyPlaylists: user.spotifyPlaylists || user.favoriteSongs,
  userRhythm: user.userRhythm,
  weeklyRhythm: user.weeklyRhythm,
  weeklyTimeline: user.weeklyTimeline,
  _original: user,
});

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data from navigation state or fetch from API
  const stateUser = location.state?.user || location.state?.profile || null;
  const [user, setUser] = useState(stateUser);
  const [loading, setLoading] = useState(!stateUser);
  const [error, setError] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0); // Track swipe offset for labels
  // Match popup - dispatch global event to show MatchPulseScreen (same as Home page)
  const showMatchPopup = useCallback((matchedUser) => {
    try {
      window.dispatchEvent(
        new CustomEvent('pulse:show_match', {
          detail: {
            match: {
              id: matchedUser.id,
              name: matchedUser.firstName || matchedUser.name,
              firstName: matchedUser.firstName || matchedUser.name,
              photo: matchedUser.photos?.[0] || matchedUser.photoUrl,
              photos: matchedUser.photos,
            },
            copy: {
              title: "It's a Match",
              subtitle: "You're in sync",
              description: 'Something real can happen now',
              matchedLine: `You and ${matchedUser.firstName || matchedUser.name} matched!`,
              primaryCta: 'Send a message',
              secondaryCta: 'Keep swiping',
            },
          },
        })
      );
    } catch {
      // ignore
    }
  }, []);
  
  // Get store actions for like/pass
  const {
    addLikedUser,
    addPassedUser,
    addSwipeHistory,
    addLikedProfile,
    removeLikedProfile,
    addMutualMatch,
  } = useHomeDeckStore();

  // Fetch user from API if not provided in state
  useEffect(() => {
    if (stateUser) {
      setUser(stateUser);
      setLoading(false);
      return;
    }

    if (!id || id === 'undefined') {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/${id}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data.user || data);
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, stateUser]);

  // Handle like action
  const handleLike = useCallback(async () => {
    if (!user?.id) return;

    const willBeMatch = user.likesYou || user.isMatch;
    
    addSwipeHistory({ userId: user.id, action: 'like', index: 0 });
    addLikedUser(user.id);
    
    // Add to YOU LIKE tab (will be removed if it becomes a match)
    if (!willBeMatch) {
      addLikedProfile({
        id: user.id,
        name: user.firstName || user.name,
        age: user.age,
        distance: user.distance,
        city: user.city || user.location,
        photoUrl: user.photos?.[0] || user.photoUrl || '',
        photos: user.photos || [],
        verified: user.verified,
        interests: user.interests || [],
        profession: user.profession || user.jobTitle,
        tagline: user.tagline || user.bio,
        aboutMe: user.aboutMe || [],
        lookingFor: user.lookingFor || [],
        status: 'you_liked',
      });
    }
    
    // Send like to server
    const currentUserId = localStorage.getItem('pulse_user_id');
    let apiMatch = false;
    try {
      const response = await fetch(`${API_URL}/api/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liker_id: currentUserId ? parseInt(currentUserId) : 1,
          liked_id: user.id,
          source: location.state?.from || 'profile',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        apiMatch = data.isMatch;
      }
    } catch (err) {
      console.error('Failed to send like:', err);
    }
    
    // Handle match
    if (apiMatch || willBeMatch) {
      removeLikedProfile(user.id);
      addMutualMatch({
        id: user.id,
        name: user.firstName || user.name,
        age: user.age,
        distance: user.distance,
        city: user.city || user.location,
        photoUrl: user.photos?.[0] || user.photoUrl || '',
        photos: user.photos || [],
        verified: user.verified,
        interests: user.interests || [],
        profession: user.profession || user.jobTitle,
        tagline: user.tagline || user.bio,
        aboutMe: user.aboutMe || [],
        lookingFor: user.lookingFor || [],
      });
      // Show "It's a Match" popup using global event (same design as Home page)
      showMatchPopup(user);
      // Navigate back after showing popup
      setTimeout(() => navigate(-1), 100);
    } else {
      // Go back to previous screen
      navigate(-1);
    }
  }, [user, addSwipeHistory, addLikedUser, addLikedProfile, removeLikedProfile, addMutualMatch, navigate, location.state?.from, showMatchPopup]);

  // Handle pass action
  const handlePass = useCallback(() => {
    if (!user?.id) return;
    
    addSwipeHistory({ userId: user.id, action: 'pass', index: 0 });
    addPassedUser(user.id);
    
    // Go back to previous screen
    navigate(-1);
  }, [user, addSwipeHistory, addPassedUser, navigate]);

  // Transform user for ProfileTimeline
  const transformedUser = useMemo(() => {
    if (!user) return null;
    return transformToUserCardModel(user);
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: '#fff',
      }}>
        Loading...
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: '#fff',
        flexDirection: 'column',
        gap: 2,
      }}>
        <Box sx={{ fontSize: 48 }}>😕</Box>
        <Box sx={{ color: '#64748b' }}>{error || 'Profile not found'}</Box>
      </Box>
    );
  }

  return (
    <>
      {/* Swipe Labels - NOPE/LIKE */}
      <SwipeLabels swipeOffset={swipeOffset} />
      
      <Box
        sx={{
          width: '100%',
          maxWidth: '520px',
          mx: 'auto',
          bgcolor: '#fff',
          boxShadow: { xs: 'none', md: '0 0 40px rgba(0,0,0,0.08)' },
          minHeight: '100vh',
        }}
      >
        <SwipeWrapper
          onSwipeRight={handleLike}
          onSwipeLeft={handlePass}
          onOffsetChange={setSwipeOffset}
        >
          <Box sx={{ pointerEvents: 'auto' }}>
            <ProfileTimeline
              user={transformedUser}
              onLike={handleLike}
              onPass={handlePass}
              onUndo={null}
              canUndo={false}
              hideUndo={true}
            />
          </Box>
        </SwipeWrapper>
      </Box>
    </>
  );
}
