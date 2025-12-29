/**
 * ForgotPasswordScreen - Request Password Reset
 * 
 * Spec:
 * - Entry: Login screen → "Forgot your password?"
 * - Entry: Account Settings → "Change password"
 * - Input: Phone number (read-only if user is logged in)
 * - CTA: Send code
 * - Error: "No account found with this phone number"
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  IconButton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requestPasswordResetByPhone, apiCall } from '../../services/authApi';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Country codes
const COUNTRY_CODES = [
  { code: '+972', country: 'IL', flag: '🇮🇱', name: 'Israel' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
];

const ForgotPasswordScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  
  // Get initial phone from navigation state (from login screen)
  const initialPhone = location.state?.phone || '';
  const fromAccountSettings = location.state?.fromAccountSettings || false;
  
  const [countryCode, setCountryCode] = useState('+972');
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Track page view
  React.useEffect(() => {
    trackEvent('reset_password_started', { fromAccountSettings });
  }, [fromAccountSettings]);

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    
    if (countryCode === '+972') {
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}`;
    }
    
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
    
    if (countryCode === '+972') {
      if (digits.length < 9 || digits.length > 10) {
        setError('Invalid phone number');
        return false;
      }
    } else {
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
    
    try {
      const fullPhone = getFullPhoneNumber();
      const result = await apiCall(requestPasswordResetByPhone, fullPhone);
      
      trackEvent('otp_sent', { type: 'password_reset' });
      
      // Navigate to OTP verification
      navigate('/auth/reset-password-otp', {
        state: {
          verificationId: result.verificationId,
          maskedPhone: result.maskedPhone,
          expiresInSec: result.expiresInSec,
          resendInSec: result.resendInSec,
        },
      });
    } catch (err) {
      if (err.code === 'user_not_found') {
        setError('No account found with this phone number');
      } else if (err.code === 'rate_limited') {
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
    if (fromAccountSettings) {
      navigate('/account-settings');
    } else {
      navigate('/auth/login');
    }
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
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 2,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowLeft size={24} color="#1a1a2e" />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1a1a2e',
          }}
        >
          Reset Password
        </Typography>
      </Box>

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
            <KeyRound size={28} color="#6C5CE7" />
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
            Reset your password
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            We'll send a verification code to your phone
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

export default ForgotPasswordScreen;
