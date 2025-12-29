/**
 * PasswordResetSuccessScreen - Password Reset Success
 * 
 * Spec:
 * - Message: "Your password has been updated"
 * - CTA: Back to Log in
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

const PasswordResetSuccessScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('password_reset_success_viewed');
  }, []);

  const handleBackToLogin = () => {
    navigate('/auth/login', { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        px: 3,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 340,
        }}
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              boxShadow: '0 12px 40px rgba(16,185,129,0.3)',
            }}
          >
            <CheckCircle size={48} color="white" />
          </Box>
        </motion.div>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#1a1a2e',
            mb: 2,
          }}
        >
          Password updated
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: '#64748b',
            fontSize: '1.1rem',
            lineHeight: 1.6,
            mb: 5,
          }}
        >
          Your password has been updated successfully. You can now log in with your new password.
        </Typography>

        {/* Back to login button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleBackToLogin}
          sx={{
            py: 2,
            borderRadius: '16px',
            fontSize: '1.1rem',
            fontWeight: 700,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            boxShadow: '0 8px 32px rgba(108,92,231,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
            },
          }}
        >
          Back to Log in
        </Button>
      </motion.div>
    </Box>
  );
};

export default PasswordResetSuccessScreen;
