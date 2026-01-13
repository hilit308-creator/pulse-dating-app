import React, { useState } from 'react';
import {
  Box, Typography, Button, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Avatar, IconButton
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const zodiacSigns = [
  { name: 'Aries', icon: '🐏' },        // Ram
  { name: 'Taurus', icon: '🐂' },       // Bull
  { name: 'Gemini', icon: '👯' },       // Twins
  { name: 'Cancer', icon: '🦀' },       // Crab
  { name: 'Leo', icon: '🦁' },          // Lion
  { name: 'Virgo', icon: '👩' },        // Maiden
  { name: 'Libra', icon: '⚖️' },        // Scales
  { name: 'Scorpio', icon: '🦂' },      // Scorpion
  { name: 'Sagittarius', icon: '🏹' },  // Archer
  { name: 'Capricorn', icon: '🐐' },    // Goat
  { name: 'Aquarius', icon: '🏺' },     // Water Bearer
  { name: 'Pisces', icon: '🐟' },       // Fish
];
const politicsOptions = [
  'Liberal', 'Moderate', 'Conservative', 'Apolitical', 'Prefer not to say'
];
const allLanguages = ['English', 'Hebrew', 'French', 'Spanish', 'Russian', 'Arabic', 'German', 'Chinese', 'Japanese', 'Italian'];

export default function ProfileExtras() {
  // Star Sign
  const [starSign, setStarSign] = useState('Taurus');
  const [starSignDialog, setStarSignDialog] = useState(false);
  // Politics
  const [politics, setPolitics] = useState('Moderate');
  const [politicsDialog, setPoliticsDialog] = useState(false);
  // Languages
  const [languages, setLanguages] = useState(['English', 'Hebrew']);
  const [languageDialog, setLanguageDialog] = useState(false);
  const [languageInput, setLanguageInput] = useState('');
  // Spotify
  const [spotifyConnected, setSpotifyConnected] = useState(false);

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
              <Typography variant="caption" sx={{ color: '#888' }}>Not connected</Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              window.open('https://www.instagram.com/', '_blank');
            }}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 500,
              background: 'linear-gradient(45deg, #f09433, #dc2743)',
              color: '#fff',
              border: 'none',
              '&:hover': {
                background: 'linear-gradient(45deg, #e08323, #cc1733)',
                border: 'none',
              }
            }}
          >
            Connect
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
      <Dialog open={starSignDialog} onClose={() => setStarSignDialog(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 320 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Select your star sign</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Star sign"
            value={starSign}
            onChange={e => setStarSign(e.target.value)}
            sx={{ mt: 2 }}
          >
            {zodiacSigns.map(sign => (
              <MenuItem key={sign.name} value={sign.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box component="span" sx={{ fontSize: 20, width: 28 }}>{sign.icon}</Box>
                <span>{sign.name}</span>
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStarSignDialog(false)} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Done</Button>
        </DialogActions>
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
