import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

// Define all onboarding steps
export const ONBOARDING_STEPS = [
  { id: 'phone', label: 'Phone', path: '/auth/phone' },
  { id: 'otp', label: 'Verify', path: '/auth/otp' },
  { id: 'location', label: 'Location', path: '/auth/location' },
  { id: 'notifications', label: 'Notifications', path: '/auth/notifications' },
  { id: 'onboarding', label: 'Basic Info', path: '/auth/onboarding' },
  { id: 'age-confirmation', label: 'Age', path: '/auth/age-confirmation' },
  { id: 'photos', label: 'Photos', path: '/auth/photos' },
  { id: 'bio', label: 'Bio', path: '/auth/bio' },
  { id: 'interests', label: 'Interests', path: '/auth/interests' },
  { id: 'looking-for', label: 'Goals', path: '/auth/looking-for' },
  { id: 'details', label: 'Details', path: '/auth/details' },
  { id: 'prompts', label: 'Prompts', path: '/auth/prompts' },
  { id: 'verify-photo', label: 'Verify', path: '/auth/verify-photo' },
  { id: 'social-connect', label: 'Connect', path: '/auth/social-connect' },
];

const OnboardingProgress = ({ currentStep, showLabel = false }) => {
  const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep);
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / ONBOARDING_STEPS.length) * 100 : 0;

  return (
    <Box sx={{ width: '100%', px: 2, pt: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ position: 'relative' }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(108,92,231,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                background: 'linear-gradient(90deg, #6C5CE7 0%, #a855f7 100%)',
              },
            }}
          />
          
          {showLabel && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                Step {currentIndex + 1} of {ONBOARDING_STEPS.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6C5CE7', fontWeight: 600, fontSize: '0.7rem' }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
          )}
        </Box>
      </motion.div>
    </Box>
  );
};

export default OnboardingProgress;
