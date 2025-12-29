import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, ArrowLeft, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loginWithPassword, apiCall } from '../../services/authApi';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { loginSuccess, setError: setAuthError } = useAuth();
  
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({ field: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const validateForm = () => {
    // Username/Email validation
    if (!usernameOrEmail.trim()) {
      setFieldError({ field: 'usernameOrEmail', message: 'Please enter your username or email' });
      return false;
    }
    if (usernameOrEmail.trim().length < 3) {
      setFieldError({ field: 'usernameOrEmail', message: 'Must be at least 3 characters' });
      return false;
    }

    // Password validation
    if (!password) {
      setFieldError({ field: 'password', message: 'Please enter your password' });
      return false;
    }
    if (password.length < 6) {
      setFieldError({ field: 'password', message: 'Password must be at least 6 characters' });
      return false;
    }

    setFieldError({ field: '', message: '' });
    return true;
  };

  const isFormValid = usernameOrEmail.trim().length >= 3 && password.length >= 6;

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    setFieldError({ field: '', message: '' });
    
    try {
      const result = await apiCall(loginWithPassword, usernameOrEmail.trim(), password);
      
      if (result.requiresOtp) {
        // Navigate to OTP verification for secondary auth
        navigate('/auth/login-verify', {
          state: {
            verificationId: result.verificationId,
            maskedPhone: result.maskedPhone,
            expiresInSec: result.expiresInSec,
            resendInSec: result.resendInSec,
          },
        });
      } else {
        // Direct login success (no OTP required)
        loginSuccess(
          { accessToken: result.accessToken, refreshToken: result.refreshToken },
          result.user
        );
        
        // Navigate based on onboarding status
        if (result.user.onboardingStatus === 'COMPLETED') {
          navigate('/home');
        } else {
          navigate('/auth/onboarding');
        }
      }
    } catch (err) {
      if (err.code === 'user_not_found') {
        setError('No account found with these details');
      } else if (err.code === 'invalid_credentials') {
        setError('Incorrect username or password');
      } else if (err.code === 'validation_error') {
        setFieldError({ field: err.field, message: err.message });
      } else if (err.code === 'no_internet') {
        setError('No internet connection. Please try again.');
      } else if (err.code === 'too_many_attempts') {
        setError(err.message || 'Too many attempts. Please try again later.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/auth/forgot-password', {
      state: { usernameOrEmail: usernameOrEmail.trim() },
    });
  };

  const handleLoginWithPhone = () => {
    navigate('/auth/login-phone');
  };

  const handleBack = () => {
    navigate('/auth/welcome');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isFormValid && !isLoading) {
      handleLogin();
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
          Pulse
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
            <LogIn size={28} color="#6C5CE7" />
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
            Welcome back
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            Log in to your account
          </Typography>

          {/* Username/Email field */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
              }}
            >
              Username or email
            </Typography>
            <TextField
              fullWidth
              value={usernameOrEmail}
              onChange={(e) => {
                setUsernameOrEmail(e.target.value);
                setError('');
                setFieldError({ field: '', message: '' });
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter your username or email"
              autoFocus
              autoComplete="username"
              error={!!fieldError.field && fieldError.field === 'usernameOrEmail'}
              helperText={fieldError.field === 'usernameOrEmail' ? fieldError.message : ''}
              inputProps={{
                style: { fontSize: '1rem' },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': {
                    borderColor: fieldError.field === 'usernameOrEmail' ? '#ef4444' : 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldError.field === 'usernameOrEmail' ? '#ef4444' : '#6C5CE7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldError.field === 'usernameOrEmail' ? '#ef4444' : '#6C5CE7',
                  },
                },
              }}
            />
          </Box>

          {/* Password field */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1a1a2e',
                mb: 1,
              }}
            >
              Password
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
                setFieldError({ field: '', message: '' });
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter your password"
              autoComplete="current-password"
              error={!!fieldError.field && fieldError.field === 'password'}
              helperText={fieldError.field === 'password' ? fieldError.message : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#64748b' }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{
                style: { fontSize: '1rem' },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': {
                    borderColor: fieldError.field === 'password' ? '#ef4444' : 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: fieldError.field === 'password' ? '#ef4444' : '#6C5CE7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: fieldError.field === 'password' ? '#ef4444' : '#6C5CE7',
                  },
                },
              }}
            />
          </Box>

          {/* Forgot password link */}
          <Box sx={{ textAlign: 'right', mb: 3 }}>
            <Link
              component="button"
              onClick={handleForgotPassword}
              sx={{
                color: '#6C5CE7',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Forgot your password?
            </Link>
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

          {/* Login button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
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
              'Log in'
            )}
          </Button>

          {/* Alternative login divider */}
          <Box sx={{ my: 3 }}>
            <Divider>
              <Typography variant="body2" sx={{ color: '#94a3b8', px: 2 }}>
                or
              </Typography>
            </Divider>
          </Box>

          {/* Login with phone button */}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleLoginWithPhone}
            startIcon={<Phone size={20} />}
            sx={{
              py: 1.75,
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#6C5CE7',
              borderWidth: 2,
              color: '#6C5CE7',
              '&:hover': {
                borderWidth: 2,
                borderColor: '#5b4cdb',
                backgroundColor: 'rgba(108,92,231,0.05)',
              },
            }}
          >
            Log in with phone number
          </Button>
        </motion.div>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Don't have account link */}
        <Box sx={{ pb: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Don't have an account?{' '}
            <Link
              component="button"
              onClick={() => navigate('/auth/phone')}
              sx={{
                color: '#6C5CE7',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginScreen;
