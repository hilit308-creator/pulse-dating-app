/**
 * IntroLineSection.jsx
 * Short intro line - one sentence max
 * Derived from first sentence of bio or dedicated field
 * Creates emotional continuity before filtering
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

const IntroLineSection = ({ user }) => {
  // Get the first prompt (main intro)
  const firstPrompt = user?.prompts?.[0];
  
  // Only show intro line if user has explicitly set one (from prompts)
  // Don't auto-generate from bio - user must fill a prompt to have an intro line
  const introLine = firstPrompt?.answer || user?.introLine || null;
  const introTopic = firstPrompt?.prompt || null;
  
  // Don't render if no intro line or if tagline is already shown in hero
  if (!introLine || user?.tagline) return null;

  return (
    <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
      {introTopic && (
        <Typography
          sx={{
            fontSize: 13,
            color: '#9ca3af',
            fontWeight: 500,
            mb: 0.5,
          }}
        >
          {introTopic}
        </Typography>
      )}
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
