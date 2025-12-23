import React, { useState } from 'react';
import {
  Box, Typography, Button, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Avatar, IconButton
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
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
          <Box>
            <Typography sx={{ fontWeight: 600 }}>Star sign</Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>{starSign}</Typography>
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
      {/* Connected Accounts - Spotify */}
      <Box sx={{ bgcolor: '#faf9fa', borderRadius: 3, border: '1px solid #eee', p: 2 }}>
        <Typography sx={{ fontWeight: 600, mb: 0.3 }}>Connected accounts</Typography>
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
      <Dialog open={starSignDialog} onClose={() => setStarSignDialog(false)}>
        <DialogTitle>Select your star sign</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Star sign"
            value={starSign}
            onChange={e => setStarSign(e.target.value)}
            sx={{ mt: 2 }}
          >
            {zodiacSigns.map(sign => <MenuItem key={sign} value={sign}>{sign}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStarSignDialog(false)}>Done</Button>
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
