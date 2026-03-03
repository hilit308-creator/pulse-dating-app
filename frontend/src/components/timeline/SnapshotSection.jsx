/**
 * SnapshotSection.jsx
 * Career & Background section
 * Contains: Profession, Education, Languages
 * Vertical list format - no table, no grid
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Briefcase, GraduationCap, Globe } from 'lucide-react';

const SnapshotSection = ({ user }) => {
  const snapshotItems = [
    { 
      key: 'profession', 
      icon: Briefcase, 
      value: user?.profession || user?.jobTitle 
    },
    { 
      key: 'education', 
      icon: GraduationCap, 
      value: user?.education 
    },
    { 
      key: 'languages', 
      icon: Globe, 
      value: user?.languages 
        ? `Speaks ${Array.isArray(user.languages) ? user.languages.join(', ') : user.languages}`
        : null
    },
  ];

  // Filter to only show items with values
  const visibleItems = snapshotItems.filter(item => item.value);

  if (visibleItems.length === 0) return null;

  return (
    <Box sx={{ px: 3, py: 3.5 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          mb: 2.5,
        }}
      >
        Snapshot
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {visibleItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Box 
              key={item.key}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
              }}
            >
              <IconComponent 
                size={18} 
                color="#6B7280"
                strokeWidth={1.5}
              />
              <Typography 
                sx={{ 
                  fontSize: 15, 
                  color: '#374151',
                  fontWeight: 400,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SnapshotSection;
