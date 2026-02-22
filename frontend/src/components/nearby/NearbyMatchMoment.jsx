// NearbyMatchMoment.jsx
// Per spec: "A signal that something could happen now — not that it should."
// This is an invitation, not a gate. No pressure, no urgency.

import React, { useMemo } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import { sanitizeNoProximityText } from '../../utils/pulseMagic';

const EMPOWERMENT_LINES = [
  'If it feels right, a simple hello is enough.',
  'You can keep it light — one message can start something real.',
  'No pressure. If you’re curious, say hi.',
  'Small step: send a warm hello.',
  'If you want, start with one easy question.',
];

function hashToIndex(value, mod) {
  const str = String(value ?? '0');
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % mod;
}

/**
 * NearbyMatchMoment - Calm invitation when proximity + match detected
 * 
 * Per spec principles:
 * - Encouragement over urgency (no countdowns, no "last chance")
 * - Optionality is real (declining has no penalty)
 * - This screen must feel like an invitation, not a gate
 */
export default function NearbyMatchMoment({ 
  person, 
  isOpen, 
  onClose, 
  onStartChat, 
  onContinueBrowsing 
}) {
  const aboutMomentSafe = useMemo(
    () => sanitizeNoProximityText(person?.aboutMoment),
    [person?.aboutMoment]
  );

  const empowermentLine = useMemo(
    () => EMPOWERMENT_LINES[hashToIndex(person?.id, EMPOWERMENT_LINES.length)],
    [person?.id]
  );

  if (!isOpen || !person) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 360 }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            {/* Close button - always accessible */}
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
              <IconButton
                onClick={onClose}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': { backgroundColor: '#fff' },
                }}
                size="small"
              >
                <X size={18} color="#64748b" />
              </IconButton>
            </Box>

            {/* Photo */}
            <Box
              sx={{
                width: '100%',
                height: 200,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <img
                src={person.photos?.[0]}
                alt={person.firstName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Gradient overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
                }}
              />
              {/* Nearby indicator - soft, not urgent */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                }}
              >
                <MapPin size={14} color="#6C5CE7" />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#6C5CE7' }}>
                  Right now
                </Typography>
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3, textAlign: 'center' }}>
              {/* Soft sparkle icon */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(168,85,247,0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Sparkles size={24} color="#6C5CE7" />
              </Box>

              {/* Name and context - warm, not pushy */}
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                It's a Pulse
              </Typography>
              
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                {aboutMomentSafe || empowermentLine}
              </Typography>

              {/* Shared interests - connection points */}
              {person.tags && person.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, mb: 3 }}>
                  {person.tags.slice(0, 3).map((tag, i) => (
                    <Box
                      key={i}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 999,
                        backgroundColor: 'rgba(108,92,231,0.08)',
                        border: '1px solid rgba(108,92,231,0.15)',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
                        {tag}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Actions - both choices are equal and valid */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Primary: Start chat - but not pushy */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={onStartChat}
                  startIcon={<MessageCircle size={18} />}
                  sx={{
                    py: 1.5,
                    borderRadius: '14px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    boxShadow: '0 4px 16px rgba(108,92,231,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                    },
                  }}
                >
                  Say hello
                </Button>

                {/* Secondary: Continue browsing - equally valid */}
                <Button
                  fullWidth
                  variant="text"
                  onClick={onContinueBrowsing}
                  sx={{
                    py: 1.25,
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    color: '#64748b',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  Keep browsing
                </Button>
              </Box>

              {/* Reassurance text - per spec: no pressure */}
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 2,
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                }}
              >
                No pressure — you can always connect later
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
