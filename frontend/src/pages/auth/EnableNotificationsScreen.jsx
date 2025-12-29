import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Bell, MessageCircle, Shield, Sparkles } from 'lucide-react';
import { useAuth, PERMISSION_STATE } from '../../context/AuthContext';
import OnboardingHeader from '../../components/OnboardingHeader';

const EnableNotificationsScreen = () => {
  const navigate = useNavigate();
  const { updatePermission, updateOnboardingStep } = useAuth();
  
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    updateOnboardingStep('notifications');
  }, [updateOnboardingStep]);

  const requestNotificationPermission = async () => {
    setIsRequesting(true);
    
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        updatePermission('notifications', PERMISSION_STATE.DENIED);
        updateOnboardingStep('onboarding');
        navigate('/auth/onboarding');
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        updatePermission('notifications', PERMISSION_STATE.GRANTED);
      } else if (permission === 'denied') {
        updatePermission('notifications', PERMISSION_STATE.DENIED);
      } else {
        updatePermission('notifications', PERMISSION_STATE.NOT_NOW);
      }
      
      // Continue regardless of result
      updateOnboardingStep('onboarding');
      navigate('/auth/onboarding');
    } catch (error) {
      console.error('Notification permission error:', error);
      updatePermission('notifications', PERMISSION_STATE.DENIED);
      updateOnboardingStep('onboarding');
      navigate('/auth/onboarding');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleEnableNotifications = () => {
    requestNotificationPermission();
  };

  const handleNotNow = () => {
    updatePermission('notifications', PERMISSION_STATE.NOT_NOW);
    updateOnboardingStep('onboarding');
    navigate('/auth/onboarding');
  };

  const handleBack = () => {
    navigate('/auth/location');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header with Progress */}
      <OnboardingHeader
        currentStep="notifications"
        onBack={handleBack}
        showSkip={false}
      />

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 3,
          pt: 4,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '28px',
              background: 'linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(251,146,60,0.15) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              position: 'relative',
            }}
          >
            <Bell size={48} color="#F43F5E" />
            {/* Notification badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#F43F5E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid white',
              }}
            >
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                }}
              >
                3
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1a1a2e',
              mb: 2,
              textAlign: 'center',
            }}
          >
            Enable notifications
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              mb: 5,
              textAlign: 'center',
              maxWidth: 320,
              mx: 'auto',
            }}
          >
            Get notified about nearby interactions and important updates.
          </Typography>

          {/* Benefits */}
          <Stack spacing={2.5} sx={{ mb: 6, maxWidth: 340, mx: 'auto' }}>
            <BenefitItem
              icon={<Sparkles size={22} />}
              iconColor="#F43F5E"
              iconBg="rgba(244,63,94,0.1)"
              title="Nearby interactions"
              description="Know when someone nearby interacts with you"
            />
            <BenefitItem
              icon={<MessageCircle size={22} />}
              iconColor="#F43F5E"
              iconBg="rgba(244,63,94,0.1)"
              title="New messages"
              description="Never miss a message from your matches"
            />
            <BenefitItem
              icon={<Shield size={22} />}
              iconColor="#F43F5E"
              iconBg="rgba(244,63,94,0.1)"
              title="Safety updates"
              description="Important account and safety notifications"
            />
          </Stack>

          {/* No spam notice */}
          <Box
            sx={{
              backgroundColor: 'rgba(34,197,94,0.1)',
              borderRadius: '12px',
              p: 2,
              mb: 4,
              maxWidth: 340,
              mx: 'auto',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#16a34a',
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              🚫 No spam or promotional notifications
            </Typography>
          </Box>
        </motion.div>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Buttons */}
        <Box sx={{ pb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleEnableNotifications}
                disabled={isRequesting}
                sx={{
                  py: 1.75,
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #F43F5E 0%, #fb923c 100%)',
                  boxShadow: '0 4px 20px rgba(244,63,94,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #e11d48 0%, #f97316 100%)',
                  },
                }}
              >
                Enable notifications
              </Button>

              <Button
                fullWidth
                variant="text"
                size="large"
                onClick={handleNotNow}
                sx={{
                  py: 1.5,
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  color: '#64748b',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                Not now
              </Button>
            </Stack>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

// Benefit item component
const BenefitItem = ({ icon, iconColor, iconBg, title, description }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: '12px',
        backgroundColor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: '#1a1a2e',
          mb: 0.25,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#64748b',
          fontSize: '0.8rem',
        }}
      >
        {description}
      </Typography>
    </Box>
  </Box>
);

export default EnableNotificationsScreen;
