/**
 * QuickFactsSection.jsx
 * Vertical list with mature outline icons
 * Shows only deal-breaker type items: Location, Looking for, Height, Religion, Politics
 * Always appears after Photo 2
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { MapPin, Heart, Ruler, Church, Vote } from 'lucide-react';

const QuickFactsSection = ({ user }) => {
  const facts = [
    { 
      key: 'location', 
      icon: MapPin, 
      value: user.city || user.location,
      required: true,
    },
    { 
      key: 'lookingFor', 
      icon: Heart, 
      value: Array.isArray(user.lookingFor) ? user.lookingFor.join(', ') : user.lookingFor,
      required: true,
    },
    { 
      key: 'height', 
      icon: Ruler, 
      value: user.height ? (typeof user.height === 'number' ? `${user.height} cm` : user.height) : null,
    },
    { 
      key: 'religion', 
      icon: Church, 
      value: user.religion,
    },
    { 
      key: 'politics', 
      icon: Vote, 
      value: user.politics,
    },
  ];

  // Filter to only show facts that have values
  const visibleFacts = facts.filter(fact => fact.value);

  if (visibleFacts.length === 0) return null;

  return (
    <Box 
      sx={{ 
        py: 3.5,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: '85%', maxWidth: '85%' }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color: '#9ca3af',
            mb: 2,
          }}
        >
          Quick facts
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {visibleFacts.map((fact) => {
            const IconComponent = fact.icon;
            return (
              <Box 
                key={fact.key}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                }}
              >
                <IconComponent 
                  size={16} 
                  color="#9ca3af"
                  strokeWidth={1.5}
                />
                <Typography 
                  sx={{ 
                    fontSize: 14, 
                    color: '#374151',
                    fontWeight: 400,
                  }}
                >
                  {fact.value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default QuickFactsSection;
