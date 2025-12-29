import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Users } from 'lucide-react';
import { useAuth, ONBOARDING_STATE } from '../../context/AuthContext';
import { updateProfile, apiCall } from '../../services/authApi';
import OnboardingHeader from '../../components/OnboardingHeader';

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { accessToken, updateUser, updateOnboardingState, updateOnboardingStep, saveOnboardingData } = useAuth();
  
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    updateOnboardingStep('onboarding');
  }, [updateOnboardingStep]);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [showMe, setShowMe] = useState('Everyone');
  
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Calculate max date (18 years ago)
  const getMaxDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split('T')[0];
  };

  // Calculate min date (100 years ago)
  const getMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    return date.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const errors = {};
    
    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await apiCall(updateProfile, accessToken, {
        firstName: firstName.trim(),
        dateOfBirth,
        gender: gender || null,
        showMePreference: showMe,
      });
      
      // Update user in context
      updateUser({
        ...result.user,
        computedAge: result.computedAge,
      });
      
      // Update onboarding state
      updateOnboardingState(ONBOARDING_STATE.BASIC_DETAILS_DONE);
      
      // Navigate to age confirmation
      updateOnboardingStep('age-confirmation');
      navigate('/auth/age-confirmation', {
        state: { computedAge: result.computedAge },
      });
    } catch (err) {
      if (err.code === 'validation_error') {
        setFieldErrors({ [err.field]: err.message });
      } else if (err.code === 'no_internet') {
        setError('No internet connection. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/auth/notifications');
  };

  const isFormValid = firstName.trim().length >= 2 && dateOfBirth;

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
        currentStep="onboarding"
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
          pt: 3,
          pb: 2,
          overflowY: 'auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              backgroundColor: 'rgba(108,92,231,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <User size={28} color="#6C5CE7" />
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1a1a2e',
              mb: 1,
            }}
          >
            Let's set up your profile
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            This helps people recognize you nearby
          </Typography>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: '12px',
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* First Name */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <User size={16} />
              First name *
            </Typography>
            <TextField
              fullWidth
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setFieldErrors({ ...fieldErrors, firstName: '' });
              }}
              placeholder="Your first name"
              error={!!fieldErrors.firstName}
              helperText={fieldErrors.firstName}
              inputProps={{ maxLength: 30 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': {
                    borderColor: fieldErrors.firstName ? '#ef4444' : 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldErrors.firstName ? '#ef4444' : '#6C5CE7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldErrors.firstName ? '#ef4444' : '#6C5CE7',
                  },
                },
              }}
            />
          </Box>

          {/* Date of Birth */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Calendar size={16} />
              Date of birth *
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={dateOfBirth}
              onChange={(e) => {
                setDateOfBirth(e.target.value);
                setFieldErrors({ ...fieldErrors, dateOfBirth: '' });
              }}
              error={!!fieldErrors.dateOfBirth}
              helperText={fieldErrors.dateOfBirth}
              inputProps={{
                max: getMaxDate(),
                min: getMinDate(),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': {
                    borderColor: fieldErrors.dateOfBirth ? '#ef4444' : 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldErrors.dateOfBirth ? '#ef4444' : '#6C5CE7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldErrors.dateOfBirth ? '#ef4444' : '#6C5CE7',
                  },
                },
              }}
            />
          </Box>

          {/* Gender (Optional) */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Users size={16} />
              Gender
              <Typography
                component="span"
                sx={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.75rem' }}
              >
                (optional)
              </Typography>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['Woman', 'Man', 'Non-binary', 'Prefer not to say'].map((option) => (
                <Button
                  key={option}
                  variant={gender === option ? 'contained' : 'outlined'}
                  onClick={() => setGender(option)}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 2,
                    py: 0.75,
                    fontSize: '0.875rem',
                    ...(gender === option
                      ? {
                          backgroundColor: '#6C5CE7',
                          '&:hover': { backgroundColor: '#5b4cdb' },
                        }
                      : {
                          borderColor: '#e2e8f0',
                          color: '#64748b',
                          '&:hover': {
                            borderColor: '#6C5CE7',
                            backgroundColor: 'rgba(108,92,231,0.05)',
                          },
                        }),
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Show Me (Optional) */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
              }}
            >
              Show me
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['Women', 'Men', 'Everyone'].map((option) => (
                <Button
                  key={option}
                  variant={showMe === option ? 'contained' : 'outlined'}
                  onClick={() => setShowMe(option)}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 2.5,
                    py: 0.75,
                    fontSize: '0.875rem',
                    flex: 1,
                    ...(showMe === option
                      ? {
                          backgroundColor: '#6C5CE7',
                          '&:hover': { backgroundColor: '#5b4cdb' },
                        }
                      : {
                          borderColor: '#e2e8f0',
                          color: '#64748b',
                          '&:hover': {
                            borderColor: '#6C5CE7',
                            backgroundColor: 'rgba(108,92,231,0.05)',
                          },
                        }),
                  }}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* Spacer */}
        <Box sx={{ flex: 1, minHeight: 20 }} />

        {/* Continue button */}
        <Box sx={{ pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleContinue}
            disabled={isLoading || !isFormValid}
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
              '&:disabled': {
                background: '#e2e8f0',
                color: '#94a3b8',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Continue'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingScreen;
