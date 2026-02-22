/**
 * EmailEditScreen - Email Address Management
 * 
 * API Contract: /v1/settings/account/email
 * 
 * Purpose:
 * - Add/update email address
 * - Verify ownership via code
 * - Display clear status: none / pending / verified
 * 
 * Flow:
 * 1. User enters email → PUT /v1/settings/account/email
 * 2. System sends code, email saved as Pending
 * 3. User enters code → POST /v1/settings/account/email/verify
 * 4. On success: status → Verified, toast "Email address verified successfully"
 * 
 * 🔒 Locked Rules:
 * - Immediate apply (no save buttons)
 * - Updating verified email ALWAYS requires re-verification
 * - Previous verified email remains active until new email verified
 * 
 * API Error Codes:
 * - INVALID_EMAIL (400): "Please enter a valid email address."
 * - VERIFICATION_THROTTLED (429): "Please wait before requesting a new code."
 * - INCORRECT_CODE (409): "The verification code is incorrect"
 * - CODE_EXPIRED (410): "This code has expired. Please request a new one."
 * - EMAIL_MISMATCH (409): "This code does not match the pending email."
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Send,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Email validation regex
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const EmailEditScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Email state
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState({
    verified: false,
    pending: false,
  });
  
  // Verification flow state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSentAt, setCodeSentAt] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  // Loading and error states
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load saved email status on mount
  useEffect(() => {
    const saved = localStorage.getItem('pulse_email_status');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEmail(parsed.email || '');
        setOriginalEmail(parsed.email || '');
        setEmailStatus({
          verified: parsed.verified || false,
          pending: parsed.pending || false,
        });
      } catch (e) {
        console.error('Failed to parse email status');
      }
    } else if (user?.email) {
      setEmail(user.email);
      setOriginalEmail(user.email);
      setEmailStatus({
        verified: user.emailVerified || false,
        pending: false,
      });
    }
  }, [user]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleBack = () => {
    navigate(-1);
  };

  // Send verification code
  const handleSendCode = useCallback(async () => {
    if (!email || !isValidEmail(email)) {
      setError(t('invalidEmail') || 'Please enter a valid email address');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      // Simulate API call to send verification code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, this would call the backend API
      // const response = await api.sendEmailVerificationCode(email);
      
      setShowVerification(true);
      setCodeSentAt(Date.now());
      setResendCountdown(60); // 60 seconds before resend allowed
      
      // Save pending status
      const newStatus = {
        email,
        verified: false,
        pending: true,
      };
      localStorage.setItem('pulse_email_status', JSON.stringify(newStatus));
      setEmailStatus({ verified: false, pending: true });
      
      trackEvent('account_email_code_sent', { email });
      
      setSnackbar({
        open: true,
        message: t('verificationCodeSent') || 'Verification code sent to your email',
        severity: 'success',
      });
    } catch (err) {
      setError(t('failedToSendCode') || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [email, t]);

  // Verify code
  const handleVerifyCode = useCallback(async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError(t('enterVerificationCode') || 'Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification logic
      // In production: const response = await api.verifyEmailCode(email, verificationCode);
      
      // Simulate different scenarios based on code
      if (verificationCode === '0000') {
        // Simulate expired code
        throw { type: 'expired' };
      } else if (verificationCode === '9999') {
        // Simulate wrong code
        throw { type: 'invalid' };
      }
      
      // Success - any other code
      const newStatus = {
        email,
        verified: true,
        pending: false,
      };
      localStorage.setItem('pulse_email_status', JSON.stringify(newStatus));
      
      trackEvent('account_email_verified', { email });
      
      // API Contract: toast "Email address verified successfully"
      setSnackbar({
        open: true,
        message: t('emailVerifiedSuccess') || 'Email address verified successfully',
        severity: 'success',
      });
      
      // Auto-return to settings after short delay
      setTimeout(() => {
        navigate(-1);
      }, 1500);
      
    } catch (err) {
      // API Contract error codes
      if (err?.type === 'expired' || err?.code === 'CODE_EXPIRED') {
        // 410 CODE_EXPIRED
        setError(t('codeExpired') || 'This code has expired. Please request a new one.');
      } else if (err?.type === 'invalid' || err?.code === 'INCORRECT_CODE') {
        // 409 INCORRECT_CODE
        setError(t('codeIncorrect') || 'The verification code is incorrect');
      } else if (err?.code === 'EMAIL_MISMATCH') {
        // 409 EMAIL_MISMATCH
        setError(t('emailMismatch') || 'This code does not match the pending email.');
      } else {
        setError(t('verificationFailed') || 'Verification failed. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  }, [email, verificationCode, navigate, t]);

  // Resend code
  const handleResendCode = useCallback(async () => {
    if (resendCountdown > 0) return;
    
    setIsSending(true);
    setError('');
    setVerificationCode('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCodeSentAt(Date.now());
      setResendCountdown(60);
      
      setSnackbar({
        open: true,
        message: t('newCodeSent') || 'New verification code sent',
        severity: 'success',
      });
    } catch (err) {
      setError(t('failedToSendCode') || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [resendCountdown, t]);

  // Check if email has changed
  const emailChanged = email !== originalEmail;
  const canSendCode = email && isValidEmail(email) && (emailChanged || !emailStatus.verified);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 1.5,
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {t('emailAddress') || 'Email address'}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: 2, pt: 3, overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Current status indicator */}
          {emailStatus.verified && !emailChanged && (
            <Alert
              severity="success"
              icon={<Check size={18} />}
              sx={{ mb: 3, borderRadius: '12px' }}
            >
              {t('emailVerified') || 'Your email address is verified'}
            </Alert>
          )}

          {emailStatus.pending && !emailChanged && (
            <Alert
              severity="warning"
              icon={<AlertCircle size={18} />}
              sx={{ mb: 3, borderRadius: '12px' }}
            >
              {t('emailPendingVerification') || 'Your email is pending verification'}
            </Alert>
          )}

          {/* Email input section */}
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              p: 3,
              mb: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Mail size={20} color="#6C5CE7" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {t('yourEmailAddress') || 'Your email address'}
              </Typography>
            </Box>

            <TextField
              fullWidth
              type="email"
              placeholder={t('enterEmail') || 'Enter your email address'}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                // Reset verification state when email changes
                if (showVerification && e.target.value !== email) {
                  setShowVerification(false);
                  setVerificationCode('');
                }
              }}
              disabled={isVerifying}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                },
              }}
            />

            {/* Error message */}
            {error && !showVerification && (
              <Typography
                variant="caption"
                sx={{ color: '#ef4444', mt: 1, display: 'block' }}
              >
                {error}
              </Typography>
            )}

            {/* Send verification code button */}
            {!showVerification && (
              <Button
                fullWidth
                variant="contained"
                onClick={handleSendCode}
                disabled={!canSendCode || isSending}
                startIcon={isSending ? <CircularProgress size={18} color="inherit" /> : <Send size={18} />}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  '&:disabled': {
                    background: '#e2e8f0',
                    color: '#94a3b8',
                  },
                }}
              >
                {isSending
                  ? (t('sending') || 'Sending...')
                  : (t('sendVerificationCode') || 'Send verification code')}
              </Button>
            )}
          </Box>

          {/* Verification code section */}
          <AnimatePresence>
            {showVerification && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    p: 3,
                    mb: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5 }}>
                    {t('verificationCode') || 'Verification code'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                    {t('enterCodeSentTo') || 'Enter the code we sent to'} {email}
                  </Typography>

                  <TextField
                    fullWidth
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => {
                      // Only allow numbers, max 6 digits
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerificationCode(val);
                      setError('');
                    }}
                    disabled={isVerifying}
                    inputProps={{
                      style: { 
                        letterSpacing: '0.5em', 
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                      },
                      maxLength: 6,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                      },
                    }}
                  />

                  {/* Error message */}
                  {error && (
                    <Typography
                      variant="caption"
                      sx={{ color: '#ef4444', mt: 1, display: 'block' }}
                    >
                      {error}
                    </Typography>
                  )}

                  {/* Verify button */}
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleVerifyCode}
                    disabled={!verificationCode || verificationCode.length < 4 || isVerifying}
                    startIcon={isVerifying ? <CircularProgress size={18} color="inherit" /> : <Check size={18} />}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      '&:disabled': {
                        background: '#e2e8f0',
                        color: '#94a3b8',
                      },
                    }}
                  >
                    {isVerifying
                      ? (t('verifying') || 'Verifying...')
                      : (t('verify') || 'Verify')}
                  </Button>

                  {/* Resend code */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      size="small"
                      onClick={handleResendCode}
                      disabled={resendCountdown > 0 || isSending}
                      startIcon={<RefreshCw size={14} />}
                      sx={{
                        textTransform: 'none',
                        color: resendCountdown > 0 ? '#94a3b8' : '#6C5CE7',
                        fontWeight: 500,
                      }}
                    >
                      {resendCountdown > 0
                        ? `${t('resendCodeIn') || 'Resend code in'} ${resendCountdown}s`
                        : (t('resendCode') || 'Resend code')}
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info text */}
          <Box sx={{ px: 1, mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                lineHeight: 1.5,
              }}
            >
              {t('emailVerificationInfo') ||
                'A verified email address helps secure your account and allows you to recover access if needed.'}
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ borderRadius: '12px' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailEditScreen;
