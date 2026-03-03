/**
 * MoreDetailsAccordion.jsx
 * Collapsible section for additional details
 * Contains: Drinking, Smoking, Kids, Exercise, Causes, Zodiac, etc.
 */

import React, { useState } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { ChevronDown, ChevronUp, Wine, Cigarette, Baby, Dumbbell, Star, Heart } from 'lucide-react';

const MoreDetailsAccordion = ({ user }) => {
  const [expanded, setExpanded] = useState(true); // Always expanded by default

  const details = [
    { key: 'drinking', icon: Wine, label: 'Drinking', value: user.drinking },
    { key: 'smoking', icon: Cigarette, label: 'Smoking', value: user.smoking },
    { key: 'kids', icon: Baby, label: 'Kids', value: user.kids },
    { key: 'exercise', icon: Dumbbell, label: 'Exercise', value: user.exercise },
    { key: 'starSign', icon: Star, label: 'Zodiac', value: user.starSign },
    { key: 'causes', icon: Heart, label: 'Causes', value: Array.isArray(user.causes) ? user.causes.join(', ') : user.causes },
  ];

  const visibleDetails = details.filter(d => d.value);

  if (visibleDetails.length === 0) return null;

  return (
    <Box sx={{ px: 3, py: 3 }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          py: 1,
          '&:hover': { opacity: 0.8 },
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: '#374151',
          }}
        >
          More details
        </Typography>
        {expanded ? (
          <ChevronUp size={20} color="#6B7280" />
        ) : (
          <ChevronDown size={20} color="#6B7280" />
        )}
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {visibleDetails.map((detail) => {
            const IconComponent = detail.icon;
            return (
              <Box
                key={detail.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <IconComponent size={16} color="#9ca3af" strokeWidth={1.5} />
                <Typography sx={{ fontSize: 13, color: '#6B7280' }}>
                  <span style={{ fontWeight: 500 }}>{detail.label}:</span> {detail.value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
};

export default MoreDetailsAccordion;
