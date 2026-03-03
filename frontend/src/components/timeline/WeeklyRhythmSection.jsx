/**
 * WeeklyRhythmSection.jsx
 * Pulse signature section - shows user's weekly rhythm
 * V2: Elegant, minimal, editorial design - NOT a system widget
 * 
 * Design goals:
 * - Must not look like a system widget
 * - Must not feel heavy
 * - Must scale from 1 to 5 items elegantly
 * - 80% max-width, centered
 * - 48px top/bottom margin
 * 
 * Data model:
 * userRhythm: {
 *   visibility: "hidden" | "matches" | "everyone",
 *   recurring: [{ id, label, frequency, customText? }],
 *   upcoming: [{ id, label, dateType, source }]
 * }
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Calendar } from 'lucide-react';

// Frequency display labels (normal case, not uppercase)
const frequencyLabels = {
  weekday_mornings: 'Weekday mornings',
  weekday_afternoons: 'Weekday afternoons',
  midweek_evenings: 'Midweek evenings',
  late_nights: 'Late nights',
  weekends: 'Weekends',
  flexible: 'Flexible',
  custom: null, // Will use customText
};

// Date type display labels
const dateTypeLabels = {
  tonight: 'Tonight',
  tomorrow: 'Tomorrow',
  this_weekend: 'This weekend',
  next_week: 'Next week',
  custom: null,
};

const WeeklyRhythmSection = ({ user, viewerIsMatch = false }) => {
  // Get rhythm data from user
  const userRhythm = user?.userRhythm || user?.weeklyRhythm;
  
  // Legacy support: convert old format to new
  const legacyRhythm = user?.weeklyTimeline;
  
  // Determine visibility
  const visibility = userRhythm?.visibility || 'everyone';
  
  // Check visibility rules
  if (visibility === 'hidden') return null;
  if (visibility === 'matches' && !viewerIsMatch) return null;
  
  // Get recurring and upcoming items
  let recurring = userRhythm?.recurring || [];
  let upcoming = userRhythm?.upcoming || [];
  
  // Legacy support: convert old weeklyRhythm array format
  if (legacyRhythm && Array.isArray(legacyRhythm) && recurring.length === 0) {
    recurring = legacyRhythm.map((item, i) => ({
      id: `legacy-${i}`,
      label: item.activity || item.label,
      frequency: item.day || item.frequency || 'flexible',
      customText: item.day,
    }));
  }
  
  // If no items, don't render
  if (recurring.length === 0 && upcoming.length === 0) return null;

  // Combine and limit to 5 items max, chronological order (upcoming first)
  const allItems = [
    ...upcoming.slice(0, 3).map(item => ({ ...item, type: 'upcoming' })),
    ...recurring.slice(0, 5 - Math.min(upcoming.length, 3)).map(item => ({ ...item, type: 'recurring' })),
  ].slice(0, 5);

  const hasMultipleItems = allItems.length > 1;

  return (
    <Box 
      sx={{ 
        py: 6, // 48px top/bottom margin
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: '80%', maxWidth: '80%' }}>
        {/* Section Header */}
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
            mb: 4,
          }}
        >
          A glimpse into my usual week
        </Typography>
        
        {/* Timeline Container */}
        <Box sx={{ position: 'relative', pl: hasMultipleItems ? 3 : 0 }}>
          {/* Vertical timeline line - only show if 2+ items */}
          {hasMultipleItems && (
            <Box
              sx={{
                position: 'absolute',
                left: 2,
                top: 8,
                bottom: 8,
                width: 1,
                bgcolor: '#E8E8E8',
              }}
            />
          )}
        
        {/* Recurring Items */}
        {recurring.map((item, index) => (
          <Box
            key={item.id || index}
            sx={{
              position: 'relative',
              mb: 3,
            }}
          >
            {/* Timeline dot */}
            <Box
              sx={{
                position: 'absolute',
                left: -25,
                top: 4,
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#6C5CE7',
              }}
            />
            
            {/* Frequency label (small) */}
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 0.25,
              }}
            >
              {item.customText || frequencyLabels[item.frequency] || item.frequency}
            </Typography>
            
            {/* Activity label (main) */}
            <Typography
              sx={{
                fontSize: 15,
                color: '#374151',
                fontWeight: 500,
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
        
        {/* Upcoming Items */}
        {upcoming.length > 0 && (
          <>
            {recurring.length > 0 && (
              <Box sx={{ my: 2, borderTop: '1px dashed #E5E7EB', ml: -4, mr: -3 }} />
            )}
            
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: '#6C5CE7',
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 2,
                ml: -4,
              }}
            >
              Coming up
            </Typography>
            
            {upcoming.map((item, index) => (
              <Box
                key={item.id || `upcoming-${index}`}
                sx={{
                  position: 'relative',
                  mb: 3,
                }}
              >
                {/* Timeline dot - different color for upcoming */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: -25,
                    top: 4,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#22c55e',
                  }}
                />
                
                {/* Date type label */}
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    mb: 0.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {dateTypeLabels[item.dateType] || item.dateType}
                  {item.source === 'event' && (
                    <Box
                      component="span"
                      sx={{
                        fontSize: 9,
                        bgcolor: 'rgba(108,92,231,0.1)',
                        color: '#6C5CE7',
                        px: 0.75,
                        py: 0.25,
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      From events
                    </Box>
                  )}
                </Typography>
                
                {/* Activity label */}
                <Typography
                  sx={{
                    fontSize: 15,
                    color: '#374151',
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </>
        )}
        </Box>
      </Box>
    </Box>
  );
};

export default WeeklyRhythmSection;
