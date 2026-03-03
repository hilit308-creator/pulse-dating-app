/**
 * IntroLineSection.jsx
 * Short intro line - one sentence max
 * Derived from first sentence of bio or dedicated field
 * Creates emotional continuity before filtering
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

const IntroLineSection = ({ user }) => {
  // Get intro line from tagline or first sentence of bio
  let introLine = null;
  
  if (user?.introLine) {
    introLine = user.introLine;
  } else if (user?.bio) {
    // Extract first sentence
    const firstSentence = user.bio.split(/[.!?]/)[0];
    introLine = firstSentence.length > 100 ? firstSentence.slice(0, 100) + '...' : firstSentence;
  }
  
  // Don't render if tagline is already shown in hero
  if (!introLine || user?.tagline) return null;

  return (
    <Box sx={{ px: 3, py: 4 }}>
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
