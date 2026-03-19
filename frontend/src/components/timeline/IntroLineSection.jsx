/**
 * IntroLineSection.jsx
 * Short intro line - one sentence max
 * Derived from first sentence of bio or dedicated field
 * Creates emotional continuity before filtering
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

const IntroLineSection = ({ user }) => {
  // Only show intro line if user has explicitly set one (from prompts)
  // Don't auto-generate from bio - user must fill a prompt to have an intro line
  const introLine = user?.introLine || null;
  
  // Don't render if no intro line or if tagline is already shown in hero
  if (!introLine || user?.tagline) return null;

  return (
    <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
      <Typography
        sx={{
          fontSize: 18,
          color: '#374151',
          fontWeight: 400,
          lineHeight: 1.6,
          fontStyle: 'italic',
        }}
      >
        "{introLine}"
      </Typography>
    </Box>
  );
};

export default IntroLineSection;
