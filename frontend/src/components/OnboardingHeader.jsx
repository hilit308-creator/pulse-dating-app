import React from 'react';
import { Box, IconButton, Button, LinearProgress, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth, ONBOARDING_STEPS } from '../context/AuthContext';

const OnboardingHeader = ({ 
  currentStep,
  onBack, 
  onSkip, 
  showSkip = true,
  showProgress = true,
  backLabel,
  skipLabel = 'Skip',
}) => {
  const { getOnboardingProgress } = useAuth();
  const progress = getOnboardingProgress(currentStep);
  const stepIndex = ONBOARDING_STEPS.indexOf(currentStep);
  const totalSteps = ONBOARDING_STEPS.length;

  return (
    <Box>
      {/* Progress Bar */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ px: 2, pt: 1.5 }}>
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
                  transition: 'transform 0.4s ease',
                },
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                Step {stepIndex + 1} of {totalSteps}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6C5CE7', fontWeight: 600, fontSize: '0.7rem' }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
          </Box>
        </motion.div>
      )}

      {/* Navigation */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          pt: showProgress ? 1 : 2,
        }}
      >
        {onBack ? (
          <IconButton onClick={onBack} sx={{ mr: 1 }}>
            <ArrowLeft size={24} color="#1a1a2e" />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}
        
        {backLabel && (
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {backLabel}
          </Typography>
        )}
        
        <Box sx={{ flex: 1 }} />
        
        {showSkip && onSkip && (
          <Button
            onClick={onSkip}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            {skipLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default OnboardingHeader;
