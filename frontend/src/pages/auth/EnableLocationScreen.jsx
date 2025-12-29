import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import { MapPin, Eye, EyeOff, Shield, Settings } from 'lucide-react';
import { useAuth, PERMISSION_STATE } from '../../context/AuthContext';
import OnboardingHeader from '../../components/OnboardingHeader';

const EnableLocationScreen = () => {
  const navigate = useNavigate();
  const { updatePermission, updateOnboardingStep } = useAuth();
  
  const [showDeniedDialog, setShowDeniedDialog] = useState(false);

  useEffect(() => {
    updateOnboardingStep('location');
  }, [updateOnboardingStep]);
  const [isRequesting, setIsRequesting] = useState(false);

  const requestLocationPermission = async () => {
    setIsRequesting(true);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        updatePermission('location', PERMISSION_STATE.DENIED);
        setShowDeniedDialog(true);
        return;
      }

      // Request permission
      const result = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve('granted'),
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              resolve('denied');
            } else {
              resolve('error');
            }
          },
          { timeout: 10000 }
        );
      });

      if (result === 'granted') {
        updatePermission('location', PERMISSION_STATE.GRANTED);
        updateOnboardingStep('notifications');
        navigate('/auth/notifications');
      } else {
        updatePermission('location', PERMISSION_STATE.DENIED);
        setShowDeniedDialog(true);
      }
    } catch (error) {
      console.error('Location permission error:', error);
      updatePermission('location', PERMISSION_STATE.DENIED);
      setShowDeniedDialog(true);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleEnableLocation = () => {
    requestLocationPermission();
  };

  const handleNotNow = () => {
    updatePermission('location', PERMISSION_STATE.NOT_NOW);
    updateOnboardingStep('notifications');
    navigate('/auth/notifications');
  };

  const handleOpenSettings = () => {
    // On web, we can't directly open settings, but we can guide the user
    // For native apps, this would use Linking.openSettings()
    alert('Please enable location access in your browser settings, then refresh the page.');
    setShowDeniedDialog(false);
  };

  const handleContinueWithoutLocation = () => {
    setShowDeniedDialog(false);
    updateOnboardingStep('notifications');
    navigate('/auth/notifications');
  };

  const handleBack = () => {
    navigate('/auth/otp');
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
        currentStep="location"
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
              background: 'linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(168,85,247,0.15) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
            }}
          >
            <MapPin size={48} color="#6C5CE7" />
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
            Enable location services
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
            Pulse uses your location to show you people nearby — your exact location is never shown.
          </Typography>

          {/* Benefits */}
          <Stack spacing={2.5} sx={{ mb: 6, maxWidth: 340, mx: 'auto' }}>
            <BenefitItem
              icon={<MapPin size={22} />}
              title="See people around you"
              description="Discover who's nearby in real time"
            />
            <BenefitItem
              icon={<Eye size={22} />}
              title="Control your visibility"
              description="Choose when and where you're visible"
            />
            <BenefitItem
              icon={<Shield size={22} />}
              title="Privacy protected"
              description="Your exact location is never shown to others"
            />
          </Stack>
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
                onClick={handleEnableLocation}
                disabled={isRequesting}
                sx={{
                  py: 1.75,
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  boxShadow: '0 4px 20px rgba(108,92,231,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                  },
                }}
              >
                Enable location
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

      {/* Denied Dialog */}
      <Dialog
        open={showDeniedDialog}
        onClose={() => setShowDeniedDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            maxWidth: 340,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, pb: 1 }}>
          Location access required
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', color: '#64748b' }}
          >
            Pulse needs location access to show you people nearby. You can enable it in your device settings.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleOpenSettings}
            startIcon={<Settings size={18} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Open settings
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={handleContinueWithoutLocation}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: '#64748b',
            }}
          >
            Continue without location
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Benefit item component
const BenefitItem = ({ icon, title, description }) => (
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
        backgroundColor: 'rgba(108,92,231,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6C5CE7',
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

export default EnableLocationScreen;
