/**
 * PhotoSection.jsx
 * Full-width photo block for Profile Timeline
 * Supports HERO variant with overlay content
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { BadgeCheck } from 'lucide-react';

const PhotoSection = ({ 
  src, 
  alt,
  variant = 'normal', // 'hero' | 'normal'
  user = null, // For hero overlay: { name, age, verified, tagline }
}) => {
  const isHero = variant === 'hero';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        py: isHero ? 0 : 2,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: isHero ? '100%' : '90%',
          maxWidth: isHero ? 'none' : '90%',
          height: isHero ? { xs: '75vh', sm: '80vh' } : 'auto',
          minHeight: isHero ? 420 : 200,
          maxHeight: isHero ? 720 : '45vh',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        <Box
          component="img"
          src={src}
          alt={alt || 'Profile photo'}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      
      {/* HERO overlay with gradient */}
      {isHero && user && (
        <>
          {/* Bottom gradient for readability */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
          
          {/* Hero content */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 3,
              pb: 1,
            }}
          >
            {/* Name + Age + Verified */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Typography
                sx={{
                  fontSize: { xs: 26, sm: 28 },
                  fontWeight: 700,
                  color: '#fff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {user.name || user.firstName}, {user.age}
              </Typography>
              {user.verified && (
                <BadgeCheck 
                  size={24} 
                  color="#fff" 
                  fill="#6C5CE7"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                />
              )}
            </Box>
            
            {/* Tagline */}
            {user.tagline && (
              <Typography
                sx={{
                  fontSize: { xs: 16, sm: 18 },
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: 500,
                  textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  lineHeight: 1.4,
                }}
              >
                {user.tagline}
              </Typography>
            )}
          </Box>
        </>
      )}
      </Box>
    </Box>
  );
};

export default PhotoSection;
