/**
 * SetNewPasswordScreen - Create New Password
 * 
 * Spec:
 * - Title: "Create a new password"
 * - Inputs: New password, Confirm password
 * - Rules: min 6 characters, both fields must match
 * - CTA: Save password
 * - Success: Navigate to success screen
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { setNewPassword, apiCall } from '../../services/authApi';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

const SetNewPasswordScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get verification ID from navigation state
  const { verificationId } = location.state || {};
  
  const [newPassword, setNewPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({ field: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if no verification ID
  React.useEffect(() => {
    if (!verificationId) {
      navigate('/auth/forgot-password');
    }
  }, [verificationId, navigate]);

  // Password validation rules
  const passwordRules = [
    { label: 'At least 6 characters', met: newPassword.length >= 6 },
    { label: 'Passwords match', met: newPassword && confirmPassword && newPassword === confirmPassword },
  ];

  const isFormValid = newPassword.length >= 6 && confirmPassword.length >= 6 && newPassword === confirmPassword;

  const validateForm = () => {
    if (!newPassword) {
      setFieldError({ field: 'newPassword', message: 'Please enter a new password' });
      return false;
    }
    
    if (newPassword.length < 6) {
      setFieldError({ field: 'newPassword', message: 'Password must be at least 6 characters' });
      return false;
    }
    
    if (!confirmPassword) {
      setFieldError({ field: 'confirmPassword', message: 'Please confirm your password' });
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setFieldError({ field: 'confirmPassword', message: 'Passwords do not match' });
      return false;
    }
    
    setFieldError({ field: '', message: '' });
    return true;
  };

  const handleSavePassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    setFieldError({ field: '', message: '' });
    
    try {
      await apiCall(setNewPassword, verificationId, newPassword, confirmPassword);
      
      trackEvent('password_reset_success');
      
      // Navigate to success screen
      navigate('/auth/password-reset-success', { replace: true });
    } catch (err) {
      if (err.code === 'validation_error') {
        setFieldError({ field: err.field, message: err.message });
      } else if (err.code === 'session_expired') {
        setError(err.message || 'Session expired. Please start over.');
        setTimeout(() => navigate('/auth/forgot-password'), 2000);
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
    navigate('/auth/forgot-password');
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
          New Password
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
            <Lock size={28} color="#6C5CE7" />
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
            Create a new password
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            Your new password must be different from previously used passwords
          </Typography>

          {/* New Password field */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
              }}
            >
              New password
            </Typography>
            <TextField
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPasswordValue(e.target.value);
                setError('');
                setFieldError({ field: '', message: '' });
              }}
              placeholder="Enter new password"
              autoComplete="new-password"
              error={fieldError.field === 'newPassword'}
              helperText={fieldError.field === 'newPassword' ? fieldError.message : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      sx={{ color: '#64748b' }}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': {
                    borderColor: fieldError.field === 'newPassword' ? '#ef4444' : 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldError.field === 'newPassword' ? '#ef4444' : '#6C5CE7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldError.field === 'newPassword' ? '#ef4444' : '#6C5CE7',
                  },
                },
              }}
            />
          </Box>

          {/* Confirm Password field */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
              }}
            >
              Confirm password
            </Typography>
            <TextField
              fullWidth
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
                setFieldError({ field: '', message: '' });
              }}
              placeholder="Confirm new password"
              autoComplete="new-password"
              error={fieldError.field === 'confirmPassword'}
              helperText={fieldError.field === 'confirmPassword' ? fieldError.message : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: '#64748b' }}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': {
                    borderColor: fieldError.field === 'confirmPassword' ? '#ef4444' : 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldError.field === 'confirmPassword' ? '#ef4444' : '#6C5CE7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldError.field === 'confirmPassword' ? '#ef4444' : '#6C5CE7',
                  },
                },
              }}
            />
          </Box>

          {/* Password rules */}
          <Box sx={{ mb: 3 }}>
            {passwordRules.map((rule, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <Check 
                  size={16} 
                  color={rule.met ? '#10b981' : '#94a3b8'} 
                  strokeWidth={rule.met ? 3 : 2}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: rule.met ? '#10b981' : '#94a3b8',
                    fontSize: '0.8rem',
                  }}
                >
                  {rule.label}
                </Typography>
              </Box>
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
                    mb: 3, 
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

        {/* Save password button */}
        <Box sx={{ pb: 4 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSavePassword}
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
              'Save password'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SetNewPasswordScreen;
