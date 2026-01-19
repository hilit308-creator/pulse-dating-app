import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Avatar, IconButton
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useAuth } from '../context/AuthContext';

const zodiacSigns = [
  { name: 'Aries', icon: '♈' },
  { name: 'Taurus', icon: '♉' },
  { name: 'Gemini', icon: '♊' },
  { name: 'Cancer', icon: '♋' },
  { name: 'Leo', icon: '♌' },
  { name: 'Virgo', icon: '♍' },
  { name: 'Libra', icon: '♎' },
  { name: 'Scorpio', icon: '♏' },
  { name: 'Sagittarius', icon: '♐' },
  { name: 'Capricorn', icon: '♑' },
  { name: 'Aquarius', icon: '♒' },
  { name: 'Pisces', icon: '♓' },
];
const politicsOptions = [
  'Liberal', 'Moderate', 'Conservative', 'Apolitical', 'Prefer not to say'
];
const allLanguages = ['English', 'Hebrew', 'French', 'Spanish', 'Russian', 'Arabic', 'German', 'Chinese', 'Japanese', 'Italian'];

export default function ProfileExtras() {
  const { user } = useAuth();
  
  // Star Sign - load from user
  const [starSign, setStarSign] = useState(user?.starSign || '');
  const [starSignDialog, setStarSignDialog] = useState(false);
  // Politics - load from user
  const [politics, setPolitics] = useState(user?.politics || '');
  const [politicsDialog, setPoliticsDialog] = useState(false);
  // Languages - load from user
  const [languages, setLanguages] = useState(user?.languages || []);
  const [languageDialog, setLanguageDialog] = useState(false);
  const [languageInput, setLanguageInput] = useState('');
  // Connected accounts - load from user
  const [instagramConnected, setInstagramConnected] = useState(user?.instagramConnected || false);
  const [instagramUsername, setInstagramUsername] = useState(user?.instagramUsername || '');
  const [spotifyConnected, setSpotifyConnected] = useState(user?.spotifyConnected || false);

  // Update state when user data changes
  useEffect(() => {
    if (user) {
      setStarSign(user.starSign || '');
      setPolitics(user.politics || '');
      setLanguages(user.languages || []);
      setInstagramConnected(user.instagramConnected || false);
      setInstagramUsername(user.instagramUsername || '');
      setSpotifyConnected(user.spotifyConnected || false);
    }
  }, [user]);

  // Handlers
  const handleAddLanguage = () => {
    if (languageInput && !languages.includes(languageInput) && languages.length < 5) {
      setLanguages([...languages, languageInput]);
      setLanguageInput('');
    }
  };
  const handleDeleteLanguage = (lang) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Star Sign */}
      <Box sx={{ bgcolor: '#faf9fa', borderRadius: 3, border: '1px solid #eee', p: 2, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ fontSize: 24 }}>
              {zodiacSigns.find(z => z.name === starSign)?.icon || '♈'}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>Star sign</Typography>
              <Typography variant="body2" sx={{ color: '#888' }}>{starSign}</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setStarSignDialog(true)}><ArrowForwardIosIcon fontSize="small" /></IconButton>
        </Stack>
      </Box>
      {/* Politics */}
      <Box sx={{ bgcolor: '#faf9fa', borderRadius: 3, border: '1px solid #eee', p: 2, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontWeight: 600 }}>Politics</Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>{politics}</Typography>
          </Box>
          <IconButton onClick={() => setPoliticsDialog(true)}><ArrowForwardIosIcon fontSize="small" /></IconButton>
        </Stack>
      </Box>
      {/* Languages */}
      <Box sx={{ bgcolor: '#faf9fa', borderRadius: 3, border: '1px solid #eee', p: 2, mb: 3 }}>
        <Typography sx={{ fontWeight: 600, mb: 0.3 }}>Languages</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
          {languages.map(lang => (
            <Chip key={lang} label={lang} icon={<LanguageIcon />} sx={{ borderRadius: 2, bgcolor: '#f5f5f5', fontWeight: 500 }} onDelete={() => handleDeleteLanguage(lang)} />
          ))}
        </Stack>
        <Button variant="outlined" fullWidth onClick={() => setLanguageDialog(true)} sx={{ justifyContent: 'space-between', borderRadius: 2, textTransform: 'none', fontWeight: 500, bgcolor: '#fff', pr: 1 }} endIcon={<ArrowForwardIosIcon fontSize="small" />}>
          Add language
        </Button>
      </Box>
      {/* Connected Accounts - Instagram & Spotify */}
      <Box sx={{ bgcolor: '#faf9fa', borderRadius: 3, border: '1px solid #eee', p: 2 }}>
        <Typography sx={{ fontWeight: 600, mb: 2 }}>Connected accounts</Typography>
        
        {/* Instagram */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          bgcolor: '#fff',
          border: '1px solid #eee',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: 2, 
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Instagram</Typography>
              <Typography variant="caption" sx={{ color: instagramConnected ? '#1db954' : '#888' }}>
                {instagramConnected ? `@${instagramUsername}` : 'Not connected'}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              if (instagramConnected) {
                setInstagramConnected(false);
                setInstagramUsername('');
              } else {
                window.open('https://www.instagram.com/', '_blank');
              }
            }}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 500,
              background: instagramConnected ? '#fff' : 'linear-gradient(45deg, #f09433, #dc2743)',
              color: instagramConnected ? '#dc2743' : '#fff',
              border: instagramConnected ? '1px solid #dc2743' : 'none',
              '&:hover': {
                background: instagramConnected ? '#fff5f5' : 'linear-gradient(45deg, #e08323, #cc1733)',
                border: instagramConnected ? '1px solid #dc2743' : 'none',
              }
            }}
          >
            {instagramConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </Box>

        {/* Spotify */}
        <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>Show off your favorite music</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <MusicNoteIcon sx={{ color: '#1db954', mr: 1 }} />
          <Button
            variant={spotifyConnected ? 'contained' : 'outlined'}
            color={spotifyConnected ? 'success' : 'inherit'}
            startIcon={spotifyConnected ? <CheckCircleIcon /> : <MusicNoteIcon />}
            onClick={() => {
              // Try to open Spotify app, fallback to web
              const spotifyAppUrl = 'spotify://';
              const spotifyWebUrl = 'https://open.spotify.com/';
              const timeout = setTimeout(() => {
                window.open(spotifyWebUrl, '_blank');
              }, 700);
              window.location = spotifyAppUrl;
              // If the app opens, clear the timeout
              window.addEventListener('blur', () => clearTimeout(timeout), { once: true });
            }}
            sx={{ borderRadius: 2, fontWeight: 500, textTransform: 'none', bgcolor: spotifyConnected ? '#e8f5e9' : '#fff' }}
          >
            {spotifyConnected ? 'Spotify connected' : 'Connect my Spotify'}
          </Button>
        </Box>
        <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
          Show your top Spotify artists on your profile and allow the app to highlight who you have in common with others
        </Typography>
        <Stack direction="row" spacing={1}>
          {[1,2,3,4,5].map((_,i) => (
            <Box key={i} sx={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: '50%', border: '2px dashed #ddd' }}>
              <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#f2f2f2" />
                <path d="M32 33c5.5 0 10-4.5 10-10s-4.5-10-10-10-10 4.5-10 10 4.5 10 10 10zm0 4c-6.6 0-20 3.3-20 10v3a1 1 0 001 1h38a1 1 0 001-1v-3c0-6.7-13.4-10-20-10z" fill="#2e2e2e" />
              </svg>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Star Sign Dialog */}
      <Dialog 
        open={starSignDialog} 
        onClose={() => setStarSignDialog(false)} 
        PaperProps={{ sx: { borderRadius: 3, minWidth: 320, maxWidth: 400, m: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Select your star sign</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 1,
            maxHeight: '50vh',
            overflowY: 'auto',
          }}>
            {zodiacSigns.map(sign => (
              <Box
                key={sign.name}
                onClick={() => {
                  setStarSign(sign.name);
                  setStarSignDialog(false);
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: starSign === sign.name ? '2px solid #6C5CE7' : '1px solid #e2e8f0',
                  bgcolor: starSign === sign.name ? 'rgba(108,92,231,0.1)' : '#fff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#6C5CE7',
                    bgcolor: 'rgba(108,92,231,0.05)',
                  },
                }}
              >
                <Typography sx={{ fontSize: 28, color: '#6C5CE7' }}>{sign.icon}</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 500, mt: 0.5 }}>{sign.name}</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
      {/* Politics Dialog */}
      <Dialog open={politicsDialog} onClose={() => setPoliticsDialog(false)}>
        <DialogTitle>Select your political leaning</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Politics"
            value={politics}
            onChange={e => setPolitics(e.target.value)}
            sx={{ mt: 2 }}
          >
            {politicsOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPoliticsDialog(false)}>Done</Button>
        </DialogActions>
      </Dialog>
      {/* Language Dialog */}
      <Dialog open={languageDialog} onClose={() => setLanguageDialog(false)}>
        <DialogTitle>Add a language</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Language"
            value={languageInput}
            onChange={e => setLanguageInput(e.target.value)}
            sx={{ mt: 2 }}
          >
            {allLanguages.filter(l => !languages.includes(l)).map(lang => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddLanguage} disabled={!languageInput || languages.length >= 5}>Add</Button>
          <Button onClick={() => setLanguageDialog(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
