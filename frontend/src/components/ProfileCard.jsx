import React, { useRef, useState } from 'react';
import { Box, Typography, Chip, Avatar, Fade } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// Helper: interests as chips
function Interests({ interests }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
      {interests.map((interest, i) => (
        <Chip key={i} label={interest} size="small" sx={{ bgcolor: '#fff8', fontWeight: 500 }} />
      ))}
    </Box>
  );
}

export default function ProfileCard({
  name = '',
  age = '',
  photo = '',
  location = '',
  online = false,
  interests = [],
  bio = '',
}) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef();
  let touchStartY = null;

  // Touch/swipe handlers
  const handleTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (!touchStartY) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    if (diff > 40) setExpanded(true); // Swipe up
    else if (diff < -40) setExpanded(false); // Swipe down
    touchStartY = null;
  };

  // Click outside to collapse
  React.useEffect(() => {
    if (!expanded) return;
    const handleClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [expanded]);

  return (
    <Box
      ref={cardRef}
      sx={{
        width: 340,
        height: 500,
        borderRadius: 5,
        overflow: 'hidden',
        boxShadow: 6,
        position: 'relative',
        background: '#000',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Profile Image */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          background: `url(${photo}) center/cover no-repeat`,
          filter: expanded ? 'blur(1.5px)' : 'none',
          transition: 'filter 0.4s',
        }}
      />
      {/* Caption Overlay */}
      <Fade in={true} timeout={400}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            bgcolor: expanded ? '#fff' : 'rgba(255, 192, 203, 0.85)',
            color: expanded ? '#222' : '#fff',
            p: 3,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            minHeight: expanded ? '90%' : 110,
            maxHeight: expanded ? '98%' : 140,
            boxShadow: expanded ? 8 : 0,
            transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: expanded ? 'flex-start' : 'flex-end',
          }}
        >
          {/* Interests */}
          <Interests interests={interests} />
          {/* Name, Age, Status, Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              {name}, {age}
            </Typography>
            {online && (
              <FiberManualRecordIcon sx={{ color: '#1de782', fontSize: 15, ml: 1 }} />
            )}
            <Typography variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
              {location && <><LocationOnIcon sx={{ fontSize: 17, mr: 0.5 }} />{location}</>}
            </Typography>
          </Box>
          {/* Bio */}
          <Typography
            variant="body2"
            sx={{ mt: 0.5, opacity: expanded ? 1 : 0.9, maxHeight: expanded ? 'none' : 36, overflow: 'hidden', transition: 'color 0.4s' }}
          >
            {bio}
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
}
