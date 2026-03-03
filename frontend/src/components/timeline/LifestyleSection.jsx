/**
 * LifestyleSection.jsx
 * Always visible lifestyle & values section (NOT accordion)
 * Contains: Drinking, Smoking, Kids, Exercise, Zodiac, Causes
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Wine, Cigarette, Baby, Dumbbell, Star, Heart } from 'lucide-react';

const LifestyleSection = ({ user }) => {
  const lifestyleItems = [
    { key: 'drinking', icon: Wine, label: 'Drinking', value: user?.drinking },
    { key: 'smoking', icon: Cigarette, label: 'Smoking', value: user?.smoking },
    { key: 'kids', icon: Baby, label: 'Kids', value: user?.kids },
    { key: 'exercise', icon: Dumbbell, label: 'Exercise', value: user?.exercise },
    { key: 'starSign', icon: Star, label: 'Zodiac', value: user?.starSign },
    { key: 'causes', icon: Heart, label: 'Causes', value: Array.isArray(user?.causes) ? user.causes.join(', ') : user?.causes },
  ];

  // Filter to only show items with values
  const visibleItems = lifestyleItems.filter(item => item.value);

  if (visibleItems.length === 0) return null;

  return (
    <Box 
      sx={{ 
        py: 3,
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
          Lifestyle & values
        </Typography>
        
        {/* 2-column grid on desktop, 1-column on mobile */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            columnGap: 3,
            rowGap: 1.5,
          }}
        >
          {visibleItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Box 
                key={item.key}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 1.5,
                  minWidth: 0,
                }}
              >
                <IconComponent 
                  size={16} 
                  color="#9ca3af"
                  strokeWidth={1.5}
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <Typography 
                  sx={{ 
                    fontSize: 14, 
                    color: '#374151',
                    fontWeight: 400,
                    lineHeight: 1.4,
                  }}
                >
                  <Typography component="span" sx={{ color: '#9ca3af', fontSize: 12 }}>
                    {item.label}:
                  </Typography>{' '}
                  {item.value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default LifestyleSection;
