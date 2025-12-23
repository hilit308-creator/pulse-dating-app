import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Box, Typography, IconButton } from '@mui/material';
import { Heart, X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

const SCREEN_W = typeof window !== 'undefined' ? window.innerWidth : 400;

/**
 * SwipeCard component with SmoothSwipe behavior
 * Features:
 * - Smooth spring animations with damping: 18
 * - Swipe threshold at 1/3 of screen width
 * - Multi-photo support with indicators
 * - Like/Nope visual feedback
 */
export default function SwipeCard({ profile, onSwiped }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const x = useMotionValue(0);
  const controls = useAnimation();

  // Transform values for visual feedback
  const likeProgress = useTransform(x, (v) => Math.max(0, Math.min(1, v / 120)));
  const nopeProgress = useTransform(x, (v) => Math.max(0, Math.min(1, -v / 120)));
  const rotate = useTransform(x, [-SCREEN_W, 0, SCREEN_W], [-12, 0, 12]);

  const decide = async (dir) => {
    if (!onSwiped) return;
    // SmoothSwipe: throw to +/- screen width with soft spring
    const off = SCREEN_W;
    await controls.start({ 
      x: dir * off, 
      y: (Math.random() - 0.5) * 80, 
      rotate: dir * 25, 
      opacity: 0.98, 
      transition: { type: 'spring', damping: 18 } 
    });
    controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
    onSwiped(dir > 0 ? 'right' : 'left', profile);
  };

  const onDragEnd = async (_, info) => {
    const { offset } = info;
    // SmoothSwipe threshold: move if dragged over a third of the screen
    const thr = SCREEN_W / 3;
    const passRight = offset.x > thr;
    const passLeft = offset.x < -thr;
    if (passRight) return decide(+1);
    if (passLeft) return decide(-1);
    // Snap back with similar damping
    controls.start({ x: 0, rotate: 0, transition: { type: 'spring', damping: 18 } });
  };

  const advancePhoto = (dir) => {
    if (!profile?.photos?.length) return;
    const total = profile.photos.length;
    setImageLoaded(false);
    setPhotoIdx((i) => (i + dir + total) % total);
  };

  const currentSrc = profile?.photos?.length
    ? profile.photos[photoIdx % profile.photos.length]
    : profile?.photoUrl;

  if (!profile) return null;

  return (
    <motion.div
      animate={controls}
      style={{ x, rotate, position: 'relative', zIndex: 2 }}
      drag="x"
      dragElastic={0.18}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={onDragEnd}
      initial={{ scale: 0.985, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
    >
      <Box
        sx={{
          borderRadius: 4,
          background: '#fff',
          boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Photo area */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 5',
            userSelect: 'none',
            bgcolor: '#eee',
          }}
        >
          {!imageLoaded && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg,#eee,#f5f5f5,#eee)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.2s infinite linear',
              }}
            />
          )}

          <img
            src={currentSrc || profile.photoUrl}
            alt={profile.name}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: imageLoaded ? 'block' : 'none',
            }}
          />

          {/* Photo indicators */}
          {profile?.photos?.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                right: 8,
                display: 'flex',
                gap: 0.5,
              }}
            >
              {profile.photos.map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 999,
                    bgcolor: 'rgba(255,255,255,0.35)',
                  }}
                >
                  <Box
                    sx={{
                      width: `${i <= photoIdx ? 100 : 0}%`,
                      height: '100%',
                      borderRadius: 999,
                      bgcolor: '#fff',
                      transition: 'width .25s',
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Navigation arrows */}
          {profile?.photos?.length > 1 && (
            <>
              <IconButton
                onClick={() => advancePhoto(-1)}
                size="small"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 6,
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,.9)',
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <ChevronLeft size={18} />
              </IconButton>

              <IconButton
                onClick={() => advancePhoto(+1)}
                size="small"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 6,
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,.9)',
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <ChevronRight size={18} />
              </IconButton>
            </>
          )}

          {/* Like/Nope indicators */}
          <motion.div
            style={{
              opacity: likeProgress,
              scale: useTransform(likeProgress, [0, 1], [0.9, 2.6]),
              position: 'absolute',
              right: 12,
              top: 12,
              width: 38,
              height: 38,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              zIndex: 5,
            }}
          >
            <Heart color="#22c55e" />
          </motion.div>

          <motion.div
            style={{
              opacity: nopeProgress,
              scale: useTransform(nopeProgress, [0, 1], [0.9, 2.6]),
              position: 'absolute',
              left: 12,
              top: 12,
              width: 38,
              height: 38,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              zIndex: 5,
            }}
          >
            <X color="#ef4444" />
          </motion.div>
        </Box>

        {/* Profile details */}
        <Box sx={{ p: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#0f172a' }}>
            {profile.name}, {profile.age}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569', mt: 0.25 }}>
            <MapPin size={16} />
            <Typography variant="body2">
              {profile.distance < 1
                ? `${Math.round(profile.distance * 1000)} m`
                : `${Math.round(profile.distance * 10) / 10} km`} away
            </Typography>
          </Box>

          {profile.profession && (
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              {profile.profession}
            </Typography>
          )}

          {profile.tagline && (
            <Typography variant="body2" sx={{ color: '#0f172a', mt: 1 }}>
              {profile.tagline}
            </Typography>
          )}
        </Box>
      </Box>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </motion.div>
  );
}
