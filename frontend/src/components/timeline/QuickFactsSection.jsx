/**
 * QuickFactsSection.jsx
 * Two-column grid layout with mature outline icons
 * Shows My Details + deal-breaker items: Gender, Height, Location, Hometown, Work, Education, Religion, Politics, Star Sign
 * Always appears after Photo 2
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { MapPin, Heart, Ruler, Church, Vote, Star, Home, Briefcase, GraduationCap, User } from 'lucide-react';

const QuickFactsSection = ({ user }) => {
  const facts = [
    { 
      key: 'gender', 
      icon: User, 
      label: 'Gender',
      value: user.gender,
    },
    { 
      key: 'height', 
      icon: Ruler, 
      label: 'Height',
      value: user.height ? (typeof user.height === 'number' ? `${user.height} cm` : user.height) : null,
    },
    { 
      key: 'location', 
      icon: MapPin, 
      label: 'Location',
      value: user.city || user.location,
    },
    { 
      key: 'hometown', 
      icon: Home, 
      label: 'Hometown',
      value: user.hometown,
    },
    { 
      key: 'work', 
      icon: Briefcase, 
      label: 'Work',
      value: user.work || user.jobTitle || (user.company ? `${user.jobTitle || ''} at ${user.company}`.trim() : null),
    },
    { 
      key: 'education', 
      icon: GraduationCap, 
      label: 'Education',
      value: user.education,
    },
    { 
      key: 'lookingFor', 
      icon: Heart, 
      label: 'Looking for',
      value: Array.isArray(user.lookingFor) ? user.lookingFor.join(', ') : user.lookingFor,
    },
    { 
      key: 'religion', 
      icon: Church, 
      label: 'Religion',
      value: user.religion,
    },
    { 
      key: 'politics', 
      icon: Vote, 
      label: 'Politics',
      value: user.politics,
    },
    { 
      key: 'starSign', 
      icon: Star, 
      label: 'Star sign',
      value: user.starSign,
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
      <Box sx={{ width: '90%', maxWidth: '90%' }}>
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
        
        {/* Two-column grid layout */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 1.5,
        }}>
          {visibleFacts.map((fact) => {
            const IconComponent = fact.icon;
            return (
              <Box 
                key={fact.key}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 1,
                  p: 1,
                  borderRadius: '8px',
                  bgcolor: '#f8fafc',
                }}
              >
                <IconComponent 
                  size={16} 
                  color="#9ca3af"
                  strokeWidth={1.5}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <Box>
                  <Typography 
                    sx={{ 
                      fontSize: 11, 
                      color: '#9ca3af',
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}
                  >
                    {fact.label}
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: 13, 
                      color: '#374151',
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {fact.value}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default QuickFactsSection;
