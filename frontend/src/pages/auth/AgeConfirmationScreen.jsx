import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Calendar, ArrowLeft } from 'lucide-react';
import { useAuth, ONBOARDING_STATE } from '../../context/AuthContext';
import { confirmAge, apiCall } from '../../services/authApi';
import OnboardingHeader from '../../components/OnboardingHeader';

const AgeConfirmationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, user, updateOnboardingState, updateOnboardingStep } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateOnboardingStep('age-confirmation');
  }, [updateOnboardingStep]);
  const [error, setError] = useState('');
  
  // Get computed age from navigation state or calculate from user data
  const computedAge = location.state?.computedAge || calculateAge(user?.dateOfBirth);
  const isUnderage = computedAge < 18;

  function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  const handleConfirm = async () => {
    if (isUnderage) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await apiCall(confirmAge, accessToken);
      
      // Continue to photos upload
      updateOnboardingStep('photos');
      navigate('/auth/photos');
    } catch (err) {
      if (err.code === 'no_internet') {
        setError('No internet connection. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDateOfBirth = () => {
    navigate('/auth/onboarding');
  };

  // Underage screen
  if (isUnderage) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            py: 4,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center' }}
          >
            {/* Warning icon */}
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '28px',
                backgroundColor: 'rgba(239,68,68,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
              }}
            >
              <AlertTriangle size={48} color="#ef4444" />
            </Box>

            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1a1a2e',
                mb: 2,
              }}
            >
              Age Requirement
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                mb: 4,
                maxWidth: 300,
                mx: 'auto',
              }}
            >
              Pulse is available for users 18 years and older.
            </Typography>

            {/* Age display */}
            <Box
              sx={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                borderRadius: '16px',
                p: 3,
                mb: 4,
                maxWidth: 280,
                mx: 'auto',
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#64748b', mb: 1 }}
              >
                Your age
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: '#ef4444',
                }}
              >
                {computedAge}
              </Typography>
            </Box>

            {/* Edit button */}
            <Button
              variant="outlined"
              size="large"
              onClick={handleEditDateOfBirth}
              startIcon={<Calendar size={18} />}
              sx={{
                borderRadius: '14px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderColor: '#6C5CE7',
                color: '#6C5CE7',
                '&:hover': {
                  borderColor: '#5b4cdb',
                  backgroundColor: 'rgba(108,92,231,0.05)',
                },
              }}
            >
              Edit date of birth
            </Button>
          </motion.div>
        </Box>
      </Box>
    );
  }

  // Normal age confirmation screen
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 4,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', width: '100%', maxWidth: 340 }}
        >
          {/* Success icon */}
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '28px',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.15) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
            }}
          >
            <CheckCircle size={48} color="#22c55e" />
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1a1a2e',
              mb: 2,
            }}
          >
            Confirm your age
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            Please confirm that you are {computedAge} years old
          </Typography>

          {/* Age display */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(168,85,247,0.1) 100%)',
              borderRadius: '20px',
              p: 4,
              mb: 4,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: '#64748b', mb: 1 }}
            >
              Your age
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {computedAge}
            </Typography>
          </Box>

          {/* User info */}
          {user?.firstName && (
            <Box
              sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                p: 2,
                mb: 4,
              }}
            >
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Welcome, <strong style={{ color: '#1a1a2e' }}>{user.firstName}{user.lastName ? ` ${user.lastName}` : ''}</strong>! 👋
              </Typography>
            </Box>
          )}

          {/* Error message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: '12px' }}
            >
              {error}
            </Alert>
          )}

          {/* Buttons */}
          <Stack spacing={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleConfirm}
              disabled={isLoading}
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
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Confirm'
              )}
            </Button>

            <Button
              fullWidth
              variant="text"
              size="large"
              onClick={handleEditDateOfBirth}
              startIcon={<ArrowLeft size={18} />}
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
              Edit date of birth
            </Button>
          </Stack>
        </motion.div>
      </Box>
    </Box>
  );
};

export default AgeConfirmationScreen;
