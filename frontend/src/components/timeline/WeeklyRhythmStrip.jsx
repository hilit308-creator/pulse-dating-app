/**
 * WeeklyRhythmStrip.jsx
 * V4: Premium + Event Promotion
 * 
 * Design goals:
 * - Mature, premium aesthetic (no childish colors)
 * - Event tiles with images, clickable, navigate to event page
 * - Rhythm tiles minimal, non-clickable
 * - Max 6 tiles
 * - CTA tile if no events
 * 
 * Placement: After last photo, before Decision Zone
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import WeeklyRhythmTile from './WeeklyRhythmTile';
import WeeklyRhythmEventTile from './WeeklyRhythmEventTile';

// Time context labels
const timeLabels = {
  weekday_mornings: 'Weekday mornings',
  weekday_afternoons: 'Weekday afternoons',
  midweek_evenings: 'Midweek evenings',
  late_nights: 'Late nights',
  weekends: 'Weekends',
  tonight: 'Tonight',
  tomorrow: 'Tomorrow',
  this_weekend: 'This weekend',
  next_week: 'Next week',
  flexible: 'Flexible',
  custom: null,
};

// CTA Tile for discovering events
const DiscoverEventsTile = ({ index, isVisible, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      minWidth: 220,
      maxWidth: 260,
      height: 140,
      borderRadius: '22px',
      padding: '18px',
      backgroundColor: '#FAFAFA',
      border: '1px dashed #D1D5DB',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      flexShrink: 0,
      cursor: 'pointer',
      // Animation
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
      transition: `opacity 300ms ease-out ${index * 60}ms, transform 300ms ease-out ${index * 60}ms, background-color 150ms ease`,
      '&:hover': {
        backgroundColor: '#F3F4F6',
      },
    }}
  >
    <Calendar size={24} color="#9CA3AF" strokeWidth={1.5} />
    <Typography
      sx={{
        fontSize: 14,
        color: '#374151',
        fontWeight: 500,
        mt: 1.5,
        mb: 0.5,
      }}
    >
      Find events this week
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography
        sx={{
          fontSize: 12,
          color: '#9CA3AF',
        }}
      >
        See what's happening nearby
      </Typography>
      <ArrowRight size={12} color="#9CA3AF" />
    </Box>
  </Box>
);

const WeeklyRhythmStrip = ({ user, viewerIsMatch = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  // Get rhythm data
  const userRhythm = user?.userRhythm || user?.weeklyRhythm;
  const legacyRhythm = user?.weeklyTimeline;
  
  // Visibility settings
  const visibility = userRhythm?.visibility || 'everyone';
  const shouldHide = visibility === 'hidden' || (visibility === 'matches' && !viewerIsMatch);
  
  // Get items from different sources
  let events = userRhythm?.events || []; // Event attendance (highest priority)
  let recurring = userRhythm?.recurring || []; // Manual recurring
  let upcoming = userRhythm?.upcoming || []; // Upcoming items
  
  // Legacy support
  if (legacyRhythm && Array.isArray(legacyRhythm) && recurring.length === 0) {
    recurring = legacyRhythm.map((item, i) => ({
      id: `legacy-${i}`,
      label: item.activity || item.label,
      frequency: item.day || item.frequency || 'flexible',
      customText: item.day,
      type: 'rhythm',
    }));
  }
  
  // Mark item types
  const eventItems = events.map(item => ({ 
    ...item, 
    type: 'event',
    timeLabel: item.timeLabel || timeLabels[item.dateType] || 'Upcoming',
  }));
  
  const upcomingItems = upcoming.map(item => ({
    ...item,
    type: item.source === 'event' ? 'event' : 'rhythm',
    timeLabel: item.timeLabel || timeLabels[item.dateType] || item.dateType,
  }));
  
  const recurringItems = recurring.map(item => ({
    ...item,
    type: 'rhythm',
    timeLabel: item.customText || timeLabels[item.frequency] || item.frequency,
  }));
  
  // V4 Ordering: Events first (soonest), then recurring
  // Max 6 items total
  const allItems = [
    ...eventItems,
    ...upcomingItems.filter(i => i.type === 'event'),
    ...recurringItems,
    ...upcomingItems.filter(i => i.type === 'rhythm'),
  ].slice(0, 6);
  
  const hasItems = allItems.length > 0;
  const hasEventItems = allItems.some(item => item.type === 'event');
  
  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Early return after hooks
  // Hide completely if no data OR visibility is hidden
  if (shouldHide || !hasItems) return null;
  
  return (
    <Box
      ref={containerRef}
      sx={{
        py: 4,
        mb: 2, // 48-64px breathing space before Decision Zone
      }}
    >
      {/* Section Header */}
      <Box sx={{ px: 3, mb: 3 }}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1a1a2e',
            mb: 0.5,
          }}
        >
          My weekly rhythm
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            color: '#9ca3af',
          }}
        >
          A glimpse into my usual week
        </Typography>
      </Box>
      
      {/* Horizontal Scroll Strip - only shown if hasItems (checked above) */}
      <Box
        sx={{
          display: 'flex',
          gap: '20px',
          overflowX: 'auto',
          overflowY: 'hidden',
          px: 3,
          pb: 1,
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          // Hide scrollbar but keep functionality
          '&::-webkit-scrollbar': {
            height: 0,
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          // Touch scroll optimization
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {allItems.map((item, index) => (
          <Box
            key={item.id || index}
            sx={{
              scrollSnapAlign: 'start',
            }}
          >
            {item.type === 'event' ? (
              <WeeklyRhythmEventTile
                item={item}
                index={index}
                isVisible={isVisible}
              />
            ) : (
              <WeeklyRhythmTile
                item={item}
                index={index}
                isVisible={isVisible}
              />
            )}
          </Box>
        ))}
        {/* CTA tile if no event items */}
        {!hasEventItems && (
          <Box sx={{ scrollSnapAlign: 'start' }}>
            <DiscoverEventsTile
              index={allItems.length}
              isVisible={isVisible}
              onClick={() => navigate('/events')}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default WeeklyRhythmStrip;
