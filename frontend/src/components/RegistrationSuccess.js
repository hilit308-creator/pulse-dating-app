import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { motion } from 'framer-motion';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ff4081 0%, #3f51b5 100%)',
        color: 'white',
        textAlign: 'center',
        padding: 3,
      }}
    >
      <motion.div
  initial={{ opacity: 0, scale: 0.85 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.7, ease: 'easeOut' }}
>
  <Box className="profile-card" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 6, px: 4, boxShadow: '0 0 32px 8px #6FE7FF, 0 0 18px 2px #FF4FD8', border: '2px solid #A259FF', maxWidth: 420, margin: 'auto' }}>
    <motion.div
      initial={{ scale: 0.8, filter: 'brightness(1)' }}
      animate={{ scale: [1, 1.18, 1], filter: ['brightness(1)', 'brightness(1.4)', 'brightness(1)'] }}
      transition={{ repeat: Infinity, duration: 1.7, ease: 'easeInOut' }}
      style={{ marginBottom: 12 }}
    >
      <Favorite sx={{ fontSize: 80, color: 'url(#neon-gradient)', filter: 'drop-shadow(0 0 16px #FF4FD8)' }} />
    </motion.div>
    <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#A259FF', fontWeight: 800, textShadow: '0 0 12px #6FE7FF' }}>
      Awesome! You've successfully signed up
    </Typography>
    <Typography variant="h5" sx={{ mb: 4, color: '#FF4FD8', fontWeight: 600 }}>
      — now you're closer than ever to your match!
    </Typography>
    <CircularProgress
      size={30}
      thickness={4}
      sx={{ color: '#6FE7FF', opacity: 0.85, filter: 'drop-shadow(0 0 8px #FF4FD8)' }}
    />
  </Box>
</motion.div>
    </Box>
  );
};

export default RegistrationSuccess;
