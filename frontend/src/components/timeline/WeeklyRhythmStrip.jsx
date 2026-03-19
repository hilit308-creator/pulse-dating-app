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
import { loadPlans, deletePlan } from '../QuickPlanModal';
import { EVENTS } from '../../pages/EventsByCategory';

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

const WeeklyRhythmStrip = ({ user, viewerIsMatch = false, isPreview = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [storedPlans, setStoredPlans] = useState(() => loadPlans()); // Load plans as state
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  // Get rhythm data
  const userRhythm = user?.userRhythm || user?.weeklyRhythm;
  const legacyRhythm = user?.weeklyTimeline;
  
  // Handle delete plan item
  const handleDeletePlan = (item) => {
    // Extract plan ID from item.id (format: "plan-{planId}")
    if (item.id && item.id.startsWith('plan-')) {
      const planIdStr = item.id.replace('plan-', '');
      const planId = parseInt(planIdStr, 10); // Convert to number since plan.id is Date.now()
      deletePlan(planId);
      // Reload plans from localStorage to update UI
      setStoredPlans(loadPlans());
    }
  };
  
  // Check privacy toggle from Settings
  const RHYTHM_VISIBILITY_KEY = 'pulse.weeklyRhythmVisibility';
  const isRhythmHiddenByUser = (() => {
    try {
      const stored = localStorage.getItem(RHYTHM_VISIBILITY_KEY);
      return stored === 'false';
    } catch {
      return false;
    }
  })();
  
  // Visibility settings - always show in preview mode
  const visibility = userRhythm?.visibility || 'everyone';
  const shouldHide = !isPreview && (isRhythmHiddenByUser || visibility === 'hidden' || (visibility === 'matches' && !viewerIsMatch));
  
  // Get items from different sources
  let events = userRhythm?.events || []; // Event attendance (highest priority)
  let recurring = userRhythm?.recurring || []; // Manual recurring
  let upcoming = userRhythm?.upcoming || []; // Upcoming items
  
  // Load user's registered events from localStorage (synced with MyEventsScreen)
  const purchasedEventIds = (() => {
    try {
      const raw = localStorage.getItem("event_purchased");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();
  
  // Helper to check if event date has passed
  const isEventPast = (dateStr) => {
    if (!dateStr) return false;
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only, not time
    return eventDate < today;
  };
  
  // Convert purchased events to event items for display (filter out past events)
  const purchasedEventItems = purchasedEventIds
    .map(eventId => EVENTS.find(e => e.id === eventId))
    .filter(Boolean)
    .filter(event => !isEventPast(event.date)) // Remove past events
    .map(event => ({
      id: `event-${event.id}`,
      title: event.title,
      venue: event.venue,
      date: event.date,
      time: event.time,
      cover: event.cover,
      type: 'event',
      timeLabel: event.time ? `${event.date} · ${event.time}` : event.date,
    }));
  
  // Merge purchased events with existing events (avoid duplicates)
  const existingEventIds = new Set(events.map(e => e.id));
  const newPurchasedEvents = purchasedEventItems.filter(e => !existingEventIds.has(e.id));
  events = [...events, ...newPurchasedEvents];
  
  // Also filter out past events from all events
  events = events.filter(e => !isEventPast(e.date));
  
  // Add stored plans from QuickPlanModal
  const planItems = storedPlans.map(plan => {
    // Format display based on plan type
    let displayLabel = plan.place;
    let displayTime = plan.time;
    
    if (plan.isRecurring && plan.days && plan.timeOfDayLabel) {
      // Format: "Dance at Havana" with "Tue • Thu evenings"
      const dayLabels = plan.days
        .map(id => {
          const dayMap = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
          return dayMap[id] || id;
        })
        .join(' • ');
      displayTime = `${dayLabels} ${plan.timeOfDayLabel.toLowerCase()}s`;
    }
    
    return {
      id: `plan-${plan.id}`,
      label: displayLabel,
      emoji: plan.emoji || '📍',
      timeLabel: displayTime,
      type: plan.isRecurring ? 'rhythm' : 'rhythm',
      isRecurring: plan.isRecurring,
      // Include location data for matching
      latitude: plan.latitude,
      longitude: plan.longitude,
      address: plan.address,
    };
  });
  
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
  
  // V4 Ordering: Plans first, then recurring, then events at the end
  // Max 5 items total (per spec)
  const allItems = [
    ...planItems.filter(p => !p.isRecurring), // One-time plans
    ...recurringItems,
    ...planItems.filter(p => p.isRecurring), // Recurring plans
    ...upcomingItems.filter(i => i.type === 'rhythm'),
    ...eventItems, // Events at the end
    ...upcomingItems.filter(i => i.type === 'event'),
  ].slice(0, 5);
  
  const hasItems = allItems.length > 0 || storedPlans.length > 0;
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
                isPreview={isPreview}
                onDelete={handleDeletePlan}
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
