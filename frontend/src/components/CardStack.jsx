// src/components/CardStack.jsx
import React, { useMemo, useState } from 'react';
import SwipeCard from './SwipeCard';
import { Box } from '@mui/material';

export default function CardStack({ profiles = [], onSwipeRight, onSwipeLeft, onMutualLike }) {
  const [index, setIndex] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const current = profiles[index % Math.max(profiles.length || 1, 1)];
  const next = profiles.length ? profiles[(index + 1) % profiles.length] : null;

  const handleNextPhoto = (dir) => {
    if (!current?.photos?.length) return;
    const total = current.photos.length;
    setPhotoIdx((i) => (i + dir + total) % total);
  };

  const onSwiped = (dir, profile) => {
    if (dir === 'right') onSwipeRight && onSwipeRight(profile);
    else onSwipeLeft && onSwipeLeft(profile);
    setIndex((i) => (i + 1) % Math.max(profiles.length, 1));
    setPhotoIdx(0);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 480, mx: 'auto' }}>
      {next && (
        <Box aria-hidden sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, pointerEvents: 'none', transform: 'scale(0.96) translateY(10px)', opacity: 0.92, filter: 'saturate(0.9)' }}>
          <SwipeCard profile={next} photoIndex={0} onNextPhoto={() => {}} onSwiped={() => {}} />
        </Box>
      )}
      {current && (
        <SwipeCard profile={current} photoIndex={photoIdx} onNextPhoto={handleNextPhoto} onSwiped={onSwiped} />
      )}
    </Box>
  );
}
