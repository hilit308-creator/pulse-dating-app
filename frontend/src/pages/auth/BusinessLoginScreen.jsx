/**
 * BusinessLoginScreen - Business Owner Entry
 * 
 * Purpose: Allow business owners to log in and manage their business presence on Pulse
 * Separate from regular user login
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

const BusinessLoginScreen = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    navigate('/auth/welcome');
  };

  const validateForm = () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    setError('');
    return true;
  };

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    trackEvent('business_login_attempt');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock success - in real app would validate credentials
      trackEvent('business_login_success');
      
      // Navigate to business dashboard or events management
      navigate('/events', { replace: true });
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      trackEvent('business_login_error', { error: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [email, password, navigate]);

  const handleCreateBusinessAccount = () => {
    trackEvent('business_signup_clicked');
    // For now, show alert - in real app would navigate to business registration
    alert('Business registration coming soon! Contact support@pulse.app to get started.');
  };

  const handleForgotPassword = () => {
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
        }}
      >
        <IconButton onClick={handleBack}>
          <ArrowLeft size={24} color="#1a1a2e" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 3,
          pt: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon & Title */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Building2 size={32} color="white" />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#1a1a2e',
                mb: 1,
              }}
            >
              Business Login
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: '#64748b' }}
            >
              Manage your business presence on Pulse
            </Typography>
          </Box>

          {/* Error message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: '12px' }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Email */}
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}
              >
                Business email
              </Typography>
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@business.com"
                InputProps={{
                  startAdornment: (
                    <Mail size={20} color="#94a3b8" style={{ marginRight: 12 }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                  },
                }}
              />
            </Box>

            {/* Password */}
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                InputProps={{
                  startAdornment: (
                    <Lock size={20} color="#94a3b8" style={{ marginRight: 12 }} />
                  ),
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#94a3b8" />
                      ) : (
                        <Eye size={20} color="#94a3b8" />
                      )}
                    </IconButton>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                  },
                }}
              />
            </Box>

            {/* Forgot password */}
            <Box sx={{ textAlign: 'right' }}>
              <Link
                component="button"
                onClick={handleForgotPassword}
                sx={{
                  color: '#6C5CE7',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Login button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={isLoading}
              sx={{
                py: 1.75,
                mt: 1,
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                boxShadow: '0 4px 20px rgba(108,92,231,0.4)',
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Log in'
              )}
            </Button>
          </Box>

          {/* Create account */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Don't have a business account?{' '}
              <Link
                component="button"
                onClick={handleCreateBusinessAccount}
                sx={{
                  color: '#6C5CE7',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Register your business
              </Link>
            </Typography>
          </Box>

          {/* Info box */}
          <Box
            sx={{
              mt: 4,
              p: 2.5,
              borderRadius: '12px',
              backgroundColor: 'rgba(108,92,231,0.05)',
              border: '1px solid rgba(108,92,231,0.1)',
            }}
          >
            <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 600, mb: 1 }}>
              Business accounts include:
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.8 }}>
              • Create and manage events{'\n'}
              • Business visibility on the map{'\n'}
              • Analytics dashboard{'\n'}
              • Connect with nearby customers
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default BusinessLoginScreen;
