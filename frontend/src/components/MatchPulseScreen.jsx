/**
 * MatchPulseScreen - "It's a Match" Match Moment
 * 
 * Visual Language (from spec):
 * - Heartbeat animation
 * - Flowing path lines (symbolizing crossed routes)
 * - Calm, emotional, not celebratory
 * 
 * Copy:
 * - Primary: "You're in sync"
 * - Secondary: "Something real can happen now"
 * 
 * Buttons:
 * - Primary: "Start the Pulse"
 * - Secondary: "Later"
 */

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Clock } from 'lucide-react';
import { getEmpowermentMessage } from '../services/EmpowermentEngine';

// Heartbeat animation keyframes
const heartbeatVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.15, 1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 0.5,
      ease: "easeInOut",
    },
  },
};

// Pulse ring animation
const pulseRingVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: [0.8, 1.5, 2],
    opacity: [0.6, 0.3, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeOut",
    },
  },
};

// Flowing path animation
const pathVariants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 2,
      ease: "easeInOut",
    },
  },
};

// Content fade in
const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.5,
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

/**
 * FlowingPaths - SVG background with crossed path lines
 */
function FlowingPaths() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="pathGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="pathGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Path 1 - Left to center */}
        <motion.path
          d="M -50 400 Q 100 350 200 300 Q 300 250 200 200"
          fill="none"
          stroke="url(#pathGradient1)"
          strokeWidth="2"
          strokeLinecap="round"
          variants={pathVariants}
          initial="initial"
          animate="animate"
        />
        
        {/* Path 2 - Right to center */}
        <motion.path
          d="M 450 200 Q 350 250 200 300 Q 100 350 200 400"
          fill="none"
          stroke="url(#pathGradient2)"
          strokeWidth="2"
          strokeLinecap="round"
          variants={pathVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: '0.3s' }}
        />
      </svg>
    </Box>
  );
}

/**
 * HeartbeatIcon - Animated heart with pulse rings
 */
function HeartbeatIcon() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 120,
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Pulse rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          variants={pulseRingVariants}
          initial="initial"
          animate="animate"
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '2px solid #6C5CE7',
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
      
      {/* Heart icon */}
      <motion.div
        variants={heartbeatVariants}
        initial="initial"
        animate="animate"
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(108,92,231,0.4)',
        }}
      >
        <Heart size={36} color="white" fill="white" />
      </motion.div>
    </Box>
  );
}

/**
 * MatchPulseScreen Component
 * 
 * @param {Object} props
 * @param {Object} props.match - Match data { id, name, photo, ... }
 * @param {Object} props.currentUser - Current user data
 * @param {function} props.onStartChat - Called when user clicks "Start the Pulse"
 * @param {function} props.onLater - Called when user clicks "Later"
 * @param {Object} [props.userSignals] - Optional behavior signals for empowerment
 */
export default function MatchPulseScreen({
  match,
  currentUser,
  onStartChat,
  onLater,
  userSignals = {},
}) {
  const [empowermentText, setEmpowermentText] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Get empowerment message on mount
  useEffect(() => {
    if (match?.id) {
      const { text } = getEmpowermentMessage(match.id, userSignals);
      setEmpowermentText(text);
    }
  }, [match?.id, userSignals]);

  const handleStartChat = () => {
    setIsVisible(false);
    setTimeout(() => {
      onStartChat?.(match);
    }, 300);
  };

  const handleLater = () => {
    setIsVisible(false);
    setTimeout(() => {
      onLater?.(match);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8f7ff 100%)',
              position: 'relative',
              overflow: 'hidden',
              px: 3,
            }}
          >
            {/* Flowing path background */}
            <FlowingPaths />

            {/* Main content */}
            <motion.div
              variants={contentVariants}
              initial="initial"
              animate="animate"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 1,
              }}
            >
              {/* Profile photos */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Avatar
                  src={currentUser?.photo}
                  sx={{
                    width: 64,
                    height: 64,
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Box sx={{ mx: -1, zIndex: 1 }}>
                  <HeartbeatIcon />
                </Box>
                <Avatar
                  src={match?.photo || match?.photos?.[0]}
                  sx={{
                    width: 64,
                    height: 64,
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              </Box>

              {/* Title */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#1a1a2e',
                  textAlign: 'center',
                  mb: 1,
                }}
              >
                It's a Match
              </Typography>

              {/* Subtitle */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  mb: 1,
                }}
              >
                You're in sync
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#64748b',
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                Something real can happen now
              </Typography>

              {/* Match name */}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: '#1a1a2e',
                  mb: 4,
                }}
              >
                You and {match?.name || match?.firstName} matched!
              </Typography>

              {/* Action buttons */}
              <Box sx={{ width: '100%', maxWidth: 320 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleStartChat}
                  startIcon={<MessageCircle size={20} />}
                  sx={{
                    py: 1.75,
                    borderRadius: '16px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    boxShadow: '0 8px 24px rgba(108,92,231,0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                      boxShadow: '0 12px 32px rgba(108,92,231,0.5)',
                    },
                  }}
                >
                  Start the Pulse
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  size="large"
                  onClick={handleLater}
                  startIcon={<Clock size={18} />}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: '16px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: '#64748b',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  Later
                </Button>
              </Box>

              {/* Empowerment message */}
              {empowermentText && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 4,
                    color: '#94a3b8',
                    textAlign: 'center',
                    maxWidth: 280,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {empowermentText}
                </Typography>
              )}
            </motion.div>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
