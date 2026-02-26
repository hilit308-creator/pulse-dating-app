import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { verifyOtp, requestOtp, apiCall, formatPhoneForDisplay } from '../../services/authApi';
import OnboardingHeader from '../../components/OnboardingHeader';

const OTP_LENGTH = 6;

const OtpVerificationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verificationId, phoneNumber, loginSuccess, resetToPhoneInput, updateOnboardingStep } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(location.state?.resendInSec || 30);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef([]);

  // Redirect if no verification ID
  useEffect(() => {
    if (!verificationId) {
      navigate('/auth/phone');
    } else {
      updateOnboardingStep('otp');
    }
  }, [verificationId, navigate, updateOnboardingStep]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Auto-verify when all digits entered
  useEffect(() => {
    const code = otp.join('');
    if (code.length === OTP_LENGTH && !otp.includes('')) {
      handleVerify();
    }
  }, [otp]);

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    
    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus last filled input or last input
      const lastIndex = Math.min(pastedData.length, OTP_LENGTH) - 1;
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the complete verification code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await apiCall(verifyOtp, verificationId, code);
      
      // Login success
      loginSuccess(
        { accessToken: result.accessToken, refreshToken: result.refreshToken },
        result.user
      );
      
      // Navigate to password creation if user doesn't have password yet
      if (!result.user.hasPassword) {
        updateOnboardingStep('password');
        navigate('/auth/create-password');
      } else {
        // User already has password, go to location permissions
        updateOnboardingStep('location');
        navigate('/auth/location');
      }
    } catch (err) {
      if (err.code === 'wrong_code') {
        setError(err.message);
        // Clear OTP and focus first input
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else if (err.code === 'expired_code') {
        setError(err.message);
      } else if (err.code === 'too_many_attempts') {
        setError(err.message);
      } else if (err.code === 'no_internet') {
        setError('No internet connection. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    
    setIsResending(true);
    setError('');
    
    try {
      const result = await apiCall(requestOtp, phoneNumber);
      
      // Reset timer
      setResendTimer(result.resendInSec || 30);
      setCanResend(false);
      
      // Clear OTP
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      if (err.code === 'rate_limited') {
        setError(err.message);
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeNumber = () => {
    resetToPhoneInput();
    navigate('/auth/phone');
  };

  const handleBack = () => {
    resetToPhoneInput();
    navigate('/auth/phone');
  };

  const isComplete = otp.every(digit => digit !== '');

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
        currentStep="otp"
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
            <Shield size={28} color="#6C5CE7" />
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
            Enter verification code
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            We sent a code to {formatPhoneForDisplay(phoneNumber)}
          </Typography>

          {/* OTP Input */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              justifyContent: 'center',
              mb: 3,
            }}
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: 48,
                    height: 56,
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    border: `2px solid ${error ? '#ef4444' : digit ? '#6C5CE7' : '#e2e8f0'}`,
                    borderRadius: 12,
                    outline: 'none',
                    backgroundColor: digit ? 'rgba(108,92,231,0.05)' : '#f8fafc',
                    transition: 'all 0.2s ease',
                    color: '#1a1a2e',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6C5CE7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(108,92,231,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = digit ? '#6C5CE7' : '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </motion.div>
            ))}
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

          {/* Resend code */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {canResend ? (
              <Button
                variant="text"
                onClick={handleResend}
                disabled={isResending}
                sx={{
                  color: '#6C5CE7',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                {isResending ? (
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                ) : null}
                Resend code
              </Button>
            ) : (
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Resend code in {resendTimer}s
              </Typography>
            )}
          </Box>

          {/* Change number link */}
          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              onClick={handleChangeNumber}
              sx={{
                color: '#64748b',
                fontSize: '0.875rem',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Wrong number? Change it
            </Link>
          </Box>
        </motion.div>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Verify button */}
        <Box sx={{ pb: 4 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleVerify}
            disabled={isLoading || !isComplete}
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
              'Verify'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default OtpVerificationScreen;
