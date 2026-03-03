/**
 * WeeklyRhythmTile.jsx
 * V5: Image-Based Rhythm tile for recurring/manual items
 * Non-clickable, premium visual mood with background imagery
 * 
 * Visual: Background image + blur (4-6px) + white overlay (88-92%)
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

// Activity-to-image mapping for recurring tiles
const activityImages = {
  yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80',
  pilates: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop&q=80',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&q=80',
  workout: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80',
  dance: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&h=400&fit=crop&q=80',
  salsa: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&h=400&fit=crop&q=80',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop&q=80',
  hiking: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop&q=80',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&q=80',
  book: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop&q=80',
  reading: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop&q=80',
  design: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop&q=80',
  meetup: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop&q=80',
  networking: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop&q=80',
  photo: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=400&fit=crop&q=80',
  music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=400&fit=crop&q=80',
  cooking: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&q=80',
};

// Get background image based on activity keywords
const getActivityImage = (activity) => {
  if (!activity) return activityImages.default;
  const lowerActivity = activity.toLowerCase();
  
  for (const [key, url] of Object.entries(activityImages)) {
    if (key !== 'default' && lowerActivity.includes(key)) {
      return url;
    }
  }
  return activityImages.default;
};

const WeeklyRhythmTile = ({ item, index, isVisible }) => {
  const timeLabel = item.timeLabel || item.customText || item.frequency || 'Flexible';
  const activity = item.label || item.title || item.activity;
  const backgroundImage = getActivityImage(activity);
  
  return (
    <Box
      sx={{
        minWidth: 240,
        maxWidth: 280,
        height: 150,
        borderRadius: '20px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        // Animation
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
        transition: `opacity 300ms ease-out ${index * 70}ms, transform 300ms ease-out ${index * 70}ms, box-shadow 150ms ease`,
        // Hover effect (subtle elevation only)
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Background image with blur */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px) saturate(0.85)',
          transform: 'scale(1.1)', // Prevent blur edge artifacts
        }}
      />
      
      {/* White overlay (88-92% opacity) */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
        }}
      />
      
      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        {/* Time label */}
        <Typography
          sx={{
            fontSize: 12,
            color: '#6B7280',
            fontWeight: 400,
            mb: 1,
          }}
        >
          {timeLabel}
        </Typography>
        
        {/* Activity */}
        <Typography
          sx={{
            fontSize: 17,
            color: '#1F2937',
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {activity}
        </Typography>
      </Box>
    </Box>
  );
};

export default WeeklyRhythmTile;
