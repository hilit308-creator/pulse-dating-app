import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Music, Check, X, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://pulse-dating-backend.onrender.com';

const SpotifyConnect = ({ userId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [topArtists, setTopArtists] = useState([]);

  // Check connection status on mount
  useEffect(() => {
    checkSpotifyStatus();
    
    // Handle OAuth callback result
    const spotifyParam = searchParams.get('spotify');
    if (spotifyParam === 'connected') {
      setShowSuccess(true);
      setIsConnected(true);
      // Clean up URL
      searchParams.delete('spotify');
      setSearchParams(searchParams, { replace: true });
      // Fetch top artists
      fetchTopArtists();
    } else if (spotifyParam === 'error') {
      const reason = searchParams.get('reason') || 'unknown';
      setError(`Failed to connect Spotify: ${reason}`);
      // Clean up URL
      searchParams.delete('spotify');
      searchParams.delete('reason');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const checkSpotifyStatus = async () => {
    try {
      const token = localStorage.getItem('pulse_access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/spotify/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
        if (data.connected) {
          fetchTopArtists();
        }
      }
    } catch (err) {
      console.error('Failed to check Spotify status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopArtists = async () => {
    try {
      const token = localStorage.getItem('pulse_access_token');
      const response = await fetch(`${API_URL}/api/spotify/top-artists?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopArtists(data.artists || []);
      }
    } catch (err) {
      console.error('Failed to fetch top artists:', err);
    }
  };

  const handleConnect = () => {
    if (!userId) {
      setError('Please log in to connect Spotify');
      return;
    }
    
    setIsConnecting(true);
    // Redirect to backend Spotify auth endpoint
    window.location.href = `${API_URL}/auth/spotify?user_id=${userId}`;
  };

  const handleDisconnect = async () => {
    try {
      const token = localStorage.getItem('pulse_access_token');
      const response = await fetch(`${API_URL}/api/spotify/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsConnected(false);
        setTopArtists([]);
      } else {
        setError('Failed to disconnect Spotify');
      }
    } catch (err) {
      setError('Failed to disconnect Spotify');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Checking Spotify connection...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: isConnected ? 'rgba(29, 185, 84, 0.1)' : 'rgba(0,0,0,0.02)',
        border: '1px solid',
        borderColor: isConnected ? 'rgba(29, 185, 84, 0.3)' : 'rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#1DB954',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Music size={20} color="#fff" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
            Spotify
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {isConnected ? 'Connected' : 'Share your music taste'}
          </Typography>
        </Box>
        {isConnected && (
          <Check size={20} color="#1DB954" />
        )}
      </Box>

      {/* Connected state - show top artists */}
      {isConnected && topArtists.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>
            Your top artists:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {topArtists.slice(0, 5).map((artist) => (
              <Box
                key={artist.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: 'rgba(29, 185, 84, 0.15)',
                }}
              >
                {artist.imageUrl && (
                  <Box
                    component="img"
                    src={artist.imageUrl}
                    alt={artist.name}
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {artist.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Action button */}
      {isConnected ? (
        <Button
          variant="outlined"
          size="small"
          onClick={handleDisconnect}
          startIcon={<X size={16} />}
          sx={{
            borderColor: 'rgba(0,0,0,0.2)',
            color: '#64748b',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#ef4444',
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
            },
          }}
        >
          Disconnect
        </Button>
      ) : (
        <Button
          variant="contained"
          size="small"
          onClick={handleConnect}
          disabled={isConnecting}
          startIcon={isConnecting ? <CircularProgress size={16} color="inherit" /> : <ExternalLink size={16} />}
          sx={{
            backgroundColor: '#1DB954',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#1aa34a',
            },
          }}
        >
          {isConnecting ? 'Connecting...' : 'Connect Spotify'}
        </Button>
      )}

      {/* Error alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ mt: 2, borderRadius: 1 }}
        >
          {error}
        </Alert>
      )}

      {/* Success snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Spotify connected successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SpotifyConnect;
