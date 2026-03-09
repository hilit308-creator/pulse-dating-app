import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { requestOtp, apiCall } from '../../services/authApi';
import OnboardingHeader from '../../components/OnboardingHeader';

// Country codes
const COUNTRY_CODES = [
  { code: '+972', country: 'IL', flag: '🇮🇱', name: 'Israel' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
];

const PhoneInputScreen = () => {
  const navigate = useNavigate();
  const { setOtpSent, setError: setAuthError, updateOnboardingStep } = useAuth();
  const { t } = useLanguage();
  
  const [countryCode, setCountryCode] = useState('+972');

  useEffect(() => {
    updateOnboardingStep('phone');
  }, [updateOnboardingStep]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format for Israeli numbers
    if (countryCode === '+972') {
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}`;
    }
    
    // Generic formatting
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError('');
  };

  const getFullPhoneNumber = () => {
    const digits = phoneNumber.replace(/\D/g, '');
    // Remove leading 0 for Israeli numbers
    const cleanDigits = countryCode === '+972' && digits.startsWith('0') 
      ? digits.slice(1) 
      : digits;
    return `${countryCode}${cleanDigits}`;
  };

  const validatePhone = () => {
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (!digits) {
      setError('Please enter your phone number');
      return false;
    }
    
    // Israeli numbers should be 9-10 digits
    if (countryCode === '+972') {
      if (digits.length < 9 || digits.length > 10) {
        setError('Invalid phone number');
        return false;
      }
    } else {
      // Generic validation: at least 7 digits
      if (digits.length < 7) {
        setError('Invalid phone number');
        return false;
      }
    }
    
    return true;
  };

  const handleSendCode = async () => {
    if (!validatePhone()) return;
    
    setIsLoading(true);
    setError('');
    
    // DEV MODE: Skip OTP when running locally without backend
    const isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    try {
      const fullPhone = getFullPhoneNumber();
      
      if (isDevMode) {
        // Dev mode: simulate OTP sent and go directly to OTP screen
        console.log('[DEV MODE] Skipping real OTP, use code: 123456');
        setOtpSent('dev-verification-id', fullPhone);
        updateOnboardingStep('otp');
        navigate('/auth/otp', { 
          state: { 
            resendInSec: 60,
            expiresInSec: 300,
            devMode: true,
          } 
        });
        return;
      }
      
      const result = await apiCall(requestOtp, fullPhone);
      
      // Store verification ID and navigate to OTP screen
      setOtpSent(result.verificationId, fullPhone);
      updateOnboardingStep('otp');
      navigate('/auth/otp', { 
        state: { 
          resendInSec: result.resendInSec,
          expiresInSec: result.expiresInSec,
        } 
      });
    } catch (err) {
      if (err.code === 'rate_limited') {
        setError(err.message);
      } else if (err.code === 'invalid_phone') {
        setError('Invalid phone number');
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
    navigate('/auth/welcome');
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);

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
        currentStep="phone"
        onBack={handleBack}
        showSkip={false}
        showProgress={true}
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
            <Phone size={28} color="#6C5CE7" />
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
            Enter your phone number
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            We'll send you a one-time code to verify your number
          </Typography>

          {/* Phone input */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            {/* Country code selector */}
            <FormControl sx={{ minWidth: 100 }}>
              <Select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0,0,0,0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6C5CE7',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6C5CE7',
                  },
                }}
                renderValue={(value) => {
                  const country = COUNTRY_CODES.find(c => c.code === value);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{country?.flag}</span>
                      <span>{value}</span>
                    </Box>
                  );
                }}
              >
                {COUNTRY_CODES.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                      <span style={{ color: '#64748b', marginLeft: 'auto' }}>{country.code}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Phone number input */}
            <TextField
              fullWidth
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="50-123-4567"
              type="tel"
              autoFocus
              error={!!error}
              inputProps={{
                maxLength: 12,
                style: { fontSize: '1.1rem' },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': {
                    borderColor: error ? '#ef4444' : 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: error ? '#ef4444' : '#6C5CE7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: error ? '#ef4444' : '#6C5CE7',
                  },
                },
              }}
            />
          </Box>

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
                    mb: 2, 
                    borderRadius: '12px',
                    '& .MuiAlert-message': { fontSize: '0.875rem' },
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Send code button */}
        <Box sx={{ pb: 4 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSendCode}
            disabled={isLoading || !phoneNumber}
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
              'Send code'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PhoneInputScreen;
