/**
 * TimelineSection.jsx
 * Reusable section wrapper for Profile Timeline
 * Provides consistent spacing and styling
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

const TimelineSection = ({ 
  title, 
  subtitle,
  children, 
  spacing = 'normal', // 'normal' | 'compact' | 'large'
  background = 'transparent',
  noPadding = false,
  centered = true, // Whether to center the content
}) => {
  const spacingMap = {
    compact: { py: 2 },
    normal: { py: 3.5 },
    large: { py: 5 },
  };

  return (
    <Box
      sx={{
        ...spacingMap[spacing],
        px: noPadding ? 0 : 3,
        background,
        // V2: Center content with max-width 85%
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: '85%', textAlign: centered ? 'center' : 'left' }}>
      {title && (
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            mb: subtitle ? 0.5 : 2,
          }}
        >
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography
          sx={{
            fontSize: 14,
            color: '#6B7280',
            mb: 2,
          }}
        >
          {subtitle}
        </Typography>
      )}
      {children}
      </Box>
    </Box>
  );
};

export default TimelineSection;
