import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link2, Instagram, Music, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OnboardingHeader from '../../components/OnboardingHeader';

const API_URL = process.env.REACT_APP_API_URL || 'https://pulse-dating-backend.onrender.com';

const SocialConnectScreen = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateUser, completeOnboarding, updateOnboardingStep, saveOnboardingData, user } = useAuth();
  
  const [instagram, setInstagram] = useState(user?.instagram || '');
  const [spotify, setSpotify] = useState(user?.spotifyTopArtists || []);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [isInstagramDialogOpen, setIsInstagramDialogOpen] = useState(false);
  const [instagramInput, setInstagramInput] = useState('');

  useEffect(() => {
    updateOnboardingStep('social-connect');
    
    // Check for Spotify OAuth callback
    const spotifyParam = searchParams.get('spotify');
    if (spotifyParam === 'connected') {
      // Check for token in URL fragment (hash)
      const hash = window.location.hash;
      if (hash && hash.includes('token=')) {
        const tokenMatch = hash.match(/token=([^&]+)/);
        if (tokenMatch && tokenMatch[1]) {
          const newToken = tokenMatch[1];
          localStorage.setItem('pulse_access_token', newToken);
          console.log('[Spotify] Session restored with new token');
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
      
      setSpotifyConnected(true);
      fetchTopArtists();
      // Clean up URL
      searchParams.delete('spotify');
      setSearchParams(searchParams, { replace: true });
    }
    
    // Check existing Spotify connection
    checkSpotifyStatus();
  }, [updateOnboardingStep]);

  const checkSpotifyStatus = async () => {
    try {
      const token = localStorage.getItem('pulse_access_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/spotify/status`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSpotifyConnected(data.connected);
        if (data.connected) {
          fetchTopArtists();
        }
      }
    } catch (err) {
      console.error('Failed to check Spotify status:', err);
    }
  };

  const fetchTopArtists = async () => {
    try {
      const token = localStorage.getItem('pulse_access_token');
      const response = await fetch(`${API_URL}/api/spotify/top-artists?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Convert to format expected by UI
        const artists = (data.artists || []).map(a => ({
          id: a.id,
          name: a.name,
          image: a.imageUrl || '🎵',
          imageUrl: a.imageUrl,
        }));
        setSpotify(artists);
      }
    } catch (err) {
      console.error('Failed to fetch top artists:', err);
    }
  };

  const handleConnectInstagram = () => {
    setIsInstagramDialogOpen(true);
  };

  const handleSaveInstagram = () => {
    const username = instagramInput.replace('@', '').trim();
    if (username) {
      setInstagram(username);
    }
    setIsInstagramDialogOpen(false);
    setInstagramInput('');
  };

  const handleRemoveInstagram = () => {
    setInstagram('');
  };

  const handleConnectSpotify = () => {
    // Redirect to real Spotify OAuth
    const userId = user?.id;
    if (!userId) {
      console.error('No user ID for Spotify connect');
      return;
    }
    setSpotifyLoading(true);
    // Redirect to backend Spotify auth endpoint with return_to for onboarding
    window.location.href = `${API_URL}/auth/spotify?user_id=${userId}&return_to=/auth/social-connect`;
  };

  const handleRemoveSpotify = async () => {
    try {
      const token = localStorage.getItem('pulse_access_token');
      await fetch(`${API_URL}/api/spotify/disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setSpotify([]);
      setSpotifyConnected(false);
    } catch (err) {
      console.error('Failed to disconnect Spotify:', err);
      setSpotify([]);
      setSpotifyConnected(false);
    }
  };

  const handleContinue = () => {
    saveOnboardingData({
      instagram,
      spotifyTopArtists: spotify,
    });
    updateUser({
      instagram,
      spotifyTopArtists: spotify,
    });
    
    // Mark onboarding as complete
    completeOnboarding();
    
    // Navigate to home
    navigate('/home', { replace: true });
  };

  const handleSkip = () => {
    // Mark onboarding as complete even if skipped
    completeOnboarding();
    navigate('/home', { replace: true });
  };

  const handleBack = () => {
    navigate('/auth/verify-photo');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header with Progress */}
      <OnboardingHeader
        currentStep="social-connect"
        onBack={handleBack}
        onSkip={handleSkip}
        showSkip={true}
      />

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 3,
          pt: 3,
          pb: 2,
          overflowY: 'auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              backgroundColor: 'rgba(236,72,153,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Link2 size={28} color="#ec4899" />
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1a1a2e',
              mb: 1,
            }}
          >
            Connect your accounts
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            Show more of your personality by connecting your social accounts
          </Typography>

          {/* Instagram */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                backgroundColor: instagram ? 'rgba(236,72,153,0.05)' : '#ffffff',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Instagram size={24} color="white" />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                  Instagram
                </Typography>
                {instagram ? (
                  <Typography variant="body2" sx={{ color: '#ec4899' }}>
                    @{instagram}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Show your latest posts
                  </Typography>
                )}
              </Box>
              
              {instagram ? (
                <IconButton
                  onClick={handleRemoveInstagram}
                  size="small"
                  sx={{
                    backgroundColor: '#fee2e2',
                    '&:hover': { backgroundColor: '#fecaca' },
                  }}
                >
                  <X size={16} color="#ef4444" />
                </IconButton>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleConnectInstagram}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    borderColor: '#ec4899',
                    color: '#ec4899',
                    '&:hover': {
                      borderColor: '#db2777',
                      backgroundColor: 'rgba(236,72,153,0.05)',
                    },
                  }}
                >
                  Connect
                </Button>
              )}
            </Box>
          </Box>

          {/* Spotify */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                backgroundColor: spotify.length > 0 ? 'rgba(30,215,96,0.05)' : '#ffffff',
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
                <Music size={24} color="white" />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                  Spotify
                </Typography>
                {spotify.length > 0 ? (
                  <Typography variant="body2" sx={{ color: '#1DB954' }}>
                    {spotify.length} top artists connected
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Share your music taste
                  </Typography>
                )}
              </Box>
              
              {spotifyConnected || spotify.length > 0 ? (
                <IconButton
                  onClick={handleRemoveSpotify}
                  size="small"
                  sx={{
                    backgroundColor: '#fee2e2',
                    '&:hover': { backgroundColor: '#fecaca' },
                  }}
                >
                  <X size={16} color="#ef4444" />
                </IconButton>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleConnectSpotify}
                  disabled={spotifyLoading}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    borderColor: '#1DB954',
                    color: '#1DB954',
                    '&:hover': {
                      borderColor: '#1aa34a',
                      backgroundColor: 'rgba(30,215,96,0.05)',
                    },
                  }}
                >
                  {spotifyLoading ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </Box>
            
            {/* Spotify artists preview */}
            {spotify.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    YOUR TOP ARTISTS
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {spotify.map((artist, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          backgroundColor: 'white',
                          borderRadius: '20px',
                          px: 1.5,
                          py: 0.5,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {artist.imageUrl ? (
                          <img 
                            src={artist.imageUrl} 
                            alt={artist.name}
                            style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span>{artist.image}</span>
                        )}
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {artist.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </motion.div>
            )}
          </Box>

          {/* Info box */}
          <Box
            sx={{
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              p: 2,
              mb: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: '#0369a1' }}>
              💡 Profiles with connected accounts get 40% more matches. Your data is never shared without your permission.
            </Typography>
          </Box>
        </motion.div>

        {/* Spacer */}
        <Box sx={{ flex: 1, minHeight: 20 }} />

        {/* Continue button */}
        <Box sx={{ pb: 2, pt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleContinue}
            sx={{
              py: 1.75,
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              boxShadow: '0 4px 20px rgba(108,92,231,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
              },
            }}
          >
            Finish setup 🎉
          </Button>
        </Box>
      </Box>

      {/* Instagram Dialog */}
      <Dialog
        open={isInstagramDialogOpen}
        onClose={() => setIsInstagramDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            maxWidth: 340,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Connect Instagram
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Enter your Instagram username to show your latest posts on your profile.
          </Typography>
          <TextField
            fullWidth
            value={instagramInput}
            onChange={(e) => setInstagramInput(e.target.value)}
            placeholder="@username"
            autoFocus
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setIsInstagramDialogOpen(false)}
            sx={{ color: '#64748b', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveInstagram}
            disabled={!instagramInput.trim()}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            }}
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SocialConnectScreen;
