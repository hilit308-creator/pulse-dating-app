/**
 * ProfileTimeline.jsx
 * Main component that renders one user as a vertical timeline
 * No card borders, no gray boxed blocks, no divider lines
 * 
 * Section Order (STRICT - per spec):
 * 1. Hero (Photo 1 – mandatory)
 * 2. Short Intro Line
 * 3. Photo 2 (mandatory)
 * 4. Quick Facts (always visible)
 * 5. About
 * 6. Lifestyle & Values (always visible)
 * 7. Photo 3 (if exists)
 * 8. My Weekly Rhythm (Pulse signature section)
 * 9. Interests
 * 10. Snapshot (career/background)
 * 11. Playlist (if exists)
 * 12. Additional Photos (distributed if 4–6 exist)
 * 13. Final Photo (if exists)
 * 14. Decision Zone
 */

import React, { useMemo } from 'react';
import { Box, Typography, Chip } from '@mui/material';

import PhotoSection from './PhotoSection';
import TimelineSection from './TimelineSection';
import QuickFactsSection from './QuickFactsSection';
import LifestyleSection from './LifestyleSection';
import IntroLineSection from './IntroLineSection';
import SnapshotSection from './SnapshotSection';
import DecisionZone from './DecisionZone';
import WeeklyRhythmStrip from './WeeklyRhythmStrip';
import PlaylistSection from './PlaylistSection';

const ProfileTimeline = ({ user, onLike, onPass, onUndo, canUndo, hideUndo }) => {
  // Extract photos array
  const photos = useMemo(() => {
    if (!user) return [];
    
    const photoList = [];
    
    // Primary photo
    if (user.primaryPhoto) photoList.push(user.primaryPhoto);
    else if (user.photos?.[0]) photoList.push(user.photos[0]);
    else if (user.base) photoList.push(`${user.base}?w=800&h=1200&fit=crop`);
    
    // Additional photos
    if (user.photos?.length > 1) {
      user.photos.slice(1).forEach(p => photoList.push(p));
    }
    
    return photoList.slice(0, 6); // Max 6 photos
  }, [user]);

  // Get intro line (first sentence of bio or tagline)
  const introLine = useMemo(() => {
    if (user?.tagline) return user.tagline;
    if (user?.bio) {
      const firstSentence = user.bio.split(/[.!?]/)[0];
      return firstSentence.length > 80 ? firstSentence.slice(0, 80) + '...' : firstSentence;
    }
    return null;
  }, [user]);

  // Check if user has weekly rhythm data
  const hasWeeklyRhythm = user?.weeklyRhythm?.length > 0 || user?.weeklyTimeline?.length > 0;
  
  // Check if user has playlists
  const hasPlaylists = user?.favoriteMusic?.length > 0 || user?.spotifyPlaylists?.length > 0;

  if (!user) return null;

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* ===== PHOTO 1 - HERO (mandatory) ===== */}
      <PhotoSection
        src={photos[0]}
        alt={`${user.firstName || user.name} - Main`}
        variant="hero"
        user={{
          name: user.firstName || user.name,
          age: user.age,
          verified: user.verified,
          tagline: user.tagline,
        }}
      />

      {/* ===== 2. SHORT INTRO LINE ===== */}
      <IntroLineSection user={user} />

      {/* ===== 2.5. QUALITIES I VALUE (after intro line, before photo 2) ===== */}
      {user.qualities?.length > 0 && (
        <TimelineSection title="Qualities I value">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {user.qualities.slice(0, 5).map((quality, i) => (
              <Chip
                key={i}
                label={quality}
                size="medium"
                sx={{
                  bgcolor: 'rgba(108, 92, 231, 0.08)',
                  color: '#6C5CE7',
                  fontWeight: 500,
                  fontSize: 13,
                  border: '1px solid rgba(108, 92, 231, 0.2)',
                  '&:hover': { bgcolor: 'rgba(108, 92, 231, 0.12)' },
                }}
              />
            ))}
          </Box>
        </TimelineSection>
      )}

      {/* ===== 3. PHOTO 2 (mandatory) ===== */}
      {photos[1] && (
        <PhotoSection
          src={photos[1]}
          alt={`${user.firstName || user.name} 2`}
        />
      )}

      {/* ===== 4. QUICK FACTS (always visible) ===== */}
      <QuickFactsSection user={user} />

      {/* ===== 5. ABOUT ===== */}
      {user.bio && (
        <TimelineSection title="About me">
          <Typography
            sx={{
              fontSize: 15,
              color: '#374151',
              lineHeight: 1.7,
            }}
          >
            {user.bio}
          </Typography>
        </TimelineSection>
      )}

      {/* ===== 6. PHOTO 3 (if exists) ===== */}
      {photos[2] && (
        <PhotoSection
          src={photos[2]}
          alt={`${user.firstName || user.name} 3`}
        />
      )}

      {/* ===== 7. INTERESTS (moved before Lifestyle for connection-first flow) ===== */}
      {user.interests?.length > 0 && (
        <TimelineSection title={`${user.firstName || 'She'}'s into`}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {user.interests.slice(0, 12).map((interest, i) => (
              <Chip
                key={i}
                label={interest}
                size="medium"
                sx={{
                  bgcolor: 'rgba(108,92,231,0.08)',
                  color: '#6C5CE7',
                  fontWeight: 500,
                  fontSize: 13,
                  border: 'none',
                  '&:hover': { bgcolor: 'rgba(108,92,231,0.12)' },
                }}
              />
            ))}
          </Box>
        </TimelineSection>
      )}

      {/* ===== 8. SNAPSHOT (career/background) ===== */}
      <SnapshotSection user={user} />

      {/* ===== 9. PHOTO 4 (if exists) ===== */}
      {photos[3] && (
        <PhotoSection
          src={photos[3]}
          alt={`${user.firstName || user.name} 4`}
        />
      )}

      {/* ===== 10. LIFESTYLE & VALUES (2-column grid on desktop) - after Photo 4 ===== */}
      <LifestyleSection user={user} />

      {/* ===== 12. PHOTO 5 (if exists) ===== */}
      {photos[4] && (
        <PhotoSection
          src={photos[4]}
          alt={`${user.firstName || user.name} 5`}
        />
      )}

      {/* ===== 13. PLAYLIST (if exists) ===== */}
      {hasPlaylists && <PlaylistSection user={user} />}

      {/* ===== 14. FINAL PHOTO (if exists) ===== */}
      {photos[5] && (
        <PhotoSection
          src={photos[5]}
          alt={`${user.firstName || user.name} 6`}
        />
      )}

      {/* ===== 15. MY WEEKLY RHYTHM (V3: Horizontal Strip - after last photo) ===== */}
      <WeeklyRhythmStrip user={user} viewerIsMatch={user.likesYou || user.isMatch} />

      {/* ===== DECISION ZONE ===== */}
      <DecisionZone
        onLike={onLike}
        onPass={onPass}
        onUndo={onUndo}
        canUndo={canUndo}
        hideUndo={hideUndo}
        userName={user.firstName || user.name}
      />
    </Box>
  );
};

export default ProfileTimeline;
