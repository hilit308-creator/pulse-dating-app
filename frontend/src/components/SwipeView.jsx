import React, { useState } from 'react';
import { Box, Typography, IconButton, Paper, Popover, MenuItem } from '@mui/material';
import StraightenIcon from '@mui/icons-material/Straighten';

const DISTANCES = [100, 200, 500, 1000];

export default function SwipeView({ profiles = [], userLocation }) {
  const [distance, setDistance] = useState(200);
  const [anchorEl, setAnchorEl] = useState(null);
  const [idx, setIdx] = useState(0);

  // Filter profiles by distance
  const filtered = profiles.filter(
    (p) => typeof p.distance === 'number' && p.distance <= distance
  );
  const profile = filtered[idx] || null;
  const noMore = filtered.length === 0 || idx >= filtered.length;

  // Next/Prev profile (simulate swipe)
  const handleNext = () => setIdx((i) => Math.min(i + 1, filtered.length));
  const handlePrev = () => setIdx((i) => Math.max(i - 1, 0));

  // Reset idx if filter changes
  React.useEffect(() => setIdx(0), [distance, profiles]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Paper className="profile-card" sx={{ position: 'relative', width: 320, height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 3, mb: 2 }}>
        {/* Distance Filter Icon */}
        <IconButton
          sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#fff8', '&:hover': { bgcolor: '#fff' } }}
          onClick={e => setAnchorEl(e.currentTarget)}
        >
          <StraightenIcon />
        </IconButton>
        {/* Profile Card */}
        {noMore ? (
          <Typography sx={{ color: '#888', textAlign: 'center', p: 4 }}>
            No more users in this range 👀<br/>
            <span style={{ fontSize: 14 }}>Try increasing the distance</span>
          </Typography>
        ) : (
          <>
            <Box sx={{ width: 120, height: 120, borderRadius: '50%', bgcolor: '#eee', mb: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {profile.photo ? (
                <img src={profile.photo} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : null}
            </Box>
            <Typography variant="h6">{profile.name}, {profile.age}</Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>{profile.distance} meters away</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 3 }}>
              <IconButton onClick={handlePrev} disabled={idx === 0}>
                ←
              </IconButton>
              <IconButton onClick={handleNext} disabled={idx >= filtered.length - 1}>
                →
              </IconButton>
            </Box>
          </>
        )}
        {/* Distance Filter Popover */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Box sx={{ p: 1 }}>
            {DISTANCES.map(d => (
              <MenuItem key={d} selected={distance === d} onClick={() => { setDistance(d); setAnchorEl(null); }}>
                {d < 1000 ? `${d} meters` : `${d / 1000} km`}
              </MenuItem>
            ))}
          </Box>
        </Popover>
      </Paper>
      <Typography variant="caption" sx={{ color: '#888' }}>Distance filter: {distance < 1000 ? `${distance} meters` : `${distance / 1000} km`}</Typography>
    </Box>
  );
}
