/**
 * PlaylistSection.jsx
 * Horizontal scroll of playlists/albums
 * Shows real Spotify data when connected, or "Connect Spotify" CTA
 * Subtle, elegant design matching profile settings style
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Music, Link2 } from 'lucide-react';

const PlaylistSection = ({ user, isOwnProfile = false }) => {
  const playlists = user?.favoriteMusic || user?.spotifyPlaylists || [];
  const isSpotifyConnected = user?.spotifyConnected || playlists.length > 0;
  
  // If viewing someone else's profile and they have no Spotify data, hide section
  if (!isOwnProfile && playlists.length === 0) return null;
  
  // If own profile and not connected, show connect CTA
  if (isOwnProfile && !isSpotifyConnected) {
    return (
      <Box sx={{ py: 3.5, px: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2.5,
            borderRadius: '16px',
            backgroundColor: '#f8fafc',
            border: '1px dashed #e2e8f0',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: '#1DB954',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Music size={24} color="#fff" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#1f2937' }}>
              Connect Spotify
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
              Show others what you're listening to
            </Typography>
          </Box>
          <Link2 size={18} color="#9ca3af" />
        </Box>
      </Box>
    );
  }
  
  if (playlists.length === 0) return null;

  return (
    <Box sx={{ py: 3.5 }}>
      <Box sx={{ px: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
            }}
          >
            My soundtrack
          </Typography>
          {isSpotifyConnected && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: '#1DB954',
                color: '#fff',
                fontSize: 9,
                fontWeight: 600,
                px: 0.75,
                py: 0.25,
                borderRadius: '4px',
              }}
            >
              <Music size={10} />
              Spotify
            </Box>
          )}
        </Box>
        <Typography
          sx={{
            fontSize: 13,
            color: '#6B7280',
          }}
        >
          What {user?.firstName || 'she'}'s listening to
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto', 
          px: 3,
          pb: 1,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {playlists.map((item, i) => (
          <Box key={i} sx={{ minWidth: 100, textAlign: 'center', flexShrink: 0 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                bgcolor: '#f3f4f6',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                mb: 1,
                mx: 'auto',
              }}
            >
              {item.image ? (
                <Box 
                  component="img" 
                  src={item.image} 
                  alt={item.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: '#f0fdf4',
                  }}
                >
                  <Music size={28} color="#1DB954" />
                </Box>
              )}
            </Box>
            <Typography 
              sx={{ fontSize: 11, fontWeight: 500, color: '#374151', lineHeight: 1.2 }} 
              noWrap
            >
              {item.name || item}
            </Typography>
            {item.artist && (
              <Typography 
                sx={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.2 }} 
                noWrap
              >
                {item.artist}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PlaylistSection;
