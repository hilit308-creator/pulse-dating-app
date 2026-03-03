/**
 * WeeklyRhythmEventTile.jsx
 * V5: Image-Based Event tile for Pulse Events promotion
 * Clickable, uses event cover as background with less blur
 * 
 * Visual: Event cover image + blur (2-3px) + white overlay (80-85%)
 * Creates visual hierarchy - events feel more important than recurring
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

// Default event placeholder
const defaultEventImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop&q=80';

const WeeklyRhythmEventTile = ({ item, index, isVisible }) => {
  const navigate = useNavigate();
  
  const timeLabel = item.timeLabel || item.dateType || 'Upcoming';
  const eventName = item.label || item.title || item.eventName;
  const locationShort = item.locationShort || item.venue;
  const eventId = item.eventId || item.id;
  const coverImage = item.eventCoverImage || item.coverImage || defaultEventImage;
  const attendanceStatus = item.attendanceStatus || 'Going';
  
  const handleClick = () => {
    if (eventId) {
      navigate(`/events/${eventId}`);
    } else {
      navigate('/events');
    }
  };
  
  return (
    <Box
      onClick={handleClick}
      sx={{
        minWidth: 240,
        maxWidth: 280,
        height: 150,
        borderRadius: '20px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        cursor: 'pointer',
        // Animation
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
        transition: `opacity 300ms ease-out ${index * 70}ms, transform 300ms ease-out ${index * 70}ms, box-shadow 150ms ease`,
        // Hover effect (elevation only)
        '&:hover': {
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
        },
        '&:active': {
          transform: isVisible ? 'scale(0.98)' : 'translateY(6px)',
        },
      }}
    >
      {/* Background image with less blur (2-3px) for events */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(1px)',
          transform: 'scale(1.05)', // Prevent blur edge artifacts
        }}
      />
      
      {/* White overlay (80-85% opacity - less than recurring for hierarchy) */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
        }}
      />
      
      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 20px',
        }}
      >
        {/* Top row: Time label + Event badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography
            sx={{
              fontSize: 12,
              color: '#6B7280',
              fontWeight: 400,
            }}
          >
            {timeLabel}
          </Typography>
          
          {/* Event badge */}
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #E5E7EB',
              color: '#6B7280',
              fontSize: 10,
              fontWeight: 500,
              px: 1,
              py: 0.25,
              borderRadius: '6px',
            }}
          >
            Event
          </Box>
        </Box>
        
        {/* Center: Event name with calendar icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calendar size={16} color="#6B7280" strokeWidth={1.5} />
          <Typography
            sx={{
              fontSize: 17,
              color: '#1F2937',
              fontWeight: 500,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {eventName}
          </Typography>
        </Box>
        
        {/* Bottom: Location + Going status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {locationShort && (
            <>
              <Typography
                sx={{
                  fontSize: 12,
                  color: '#6B7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {locationShort}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#D1D5DB' }}>·</Typography>
            </>
          )}
          <Typography
            sx={{
              fontSize: 12,
              color: '#6B7280',
              fontWeight: 500,
            }}
          >
            {attendanceStatus}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WeeklyRhythmEventTile;
