import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OnboardingHeader from '../../components/OnboardingHeader';

const API_URL = process.env.REACT_APP_API_URL || 'https://pulse-dating-backend.onrender.com';

const CreatePasswordScreen = () => {
  const navigate = useNavigate();
  const { updateOnboardingStep } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateOnboardingStep('password');
  }, [updateOnboardingStep]);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#e2e8f0' };
    
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      digit: /[0-9]/.test(pwd),
      special: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(pwd),
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score <= 1) return { score: 20, label: 'Weak', color: '#ef4444', checks };
    if (score === 2) return { score: 40, label: 'Fair', color: '#f97316', checks };
    if (score === 3) return { score: 60, label: 'Good', color: '#eab308', checks };
    if (score === 4) return { score: 80, label: 'Strong', color: '#22c55e', checks };
    return { score: 100, label: 'Very Strong', color: '#10b981', checks };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isFormValid = strength.score >= 40 && passwordsMatch;

  const handleSetPassword = async () => {
    if (!isFormValid) return;
    
    setIsLoading(true);
    setError('');
    
    // DEV MODE: Skip API call when running locally
    const isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevMode) {
      console.log('[DEV MODE] Skipping password API, continuing to location');
      // Store password locally for dev mode
      localStorage.setItem('pulse_dev_password', password);
      updateOnboardingStep('location');
      navigate('/auth/location');
      setIsLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('pulse_access_token');
      
      const response = await fetch(`${API_URL}/api/auth/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === 'weak_password') {
          setError(data.message);
        } else if (data.error === 'unauthorized') {
          setError('Session expired. Please sign up again.');
          navigate('/auth/phone');
        } else {
          setError(data.message || 'Failed to set password');
        }
        return;
      }
      
      // Success - continue to location permissions
      updateOnboardingStep('location');
      navigate('/auth/location');
    } catch (err) {
      console.error('Set password error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/auth/otp');
  };

  const RequirementItem = ({ met, text }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      {met ? (
        <Check size={14} color="#22c55e" />
      ) : (
        <X size={14} color="#94a3b8" />
      )}
      <Typography
        variant="caption"
        sx={{ color: met ? '#22c55e' : '#94a3b8' }}
      >
        {text}
      </Typography>
    </Box>
  );

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
        currentStep="password"
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
            Create a password
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            This will be used to log in to your account
          </Typography>

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
              }}
              placeholder="Enter your password"
              autoFocus
              autoComplete="new-password"
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6C5CE7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6C5CE7',
                  },
                },
              }}
            />
          </Box>

          {/* Password strength indicator */}
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Password strength
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: strength.color, fontWeight: 600 }}
                  >
                    {strength.label}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={strength.score}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: strength.color,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Requirements checklist */}
              <Box sx={{ mb: 3, pl: 1 }}>
                <RequirementItem met={strength.checks?.length} text="At least 8 characters" />
                <RequirementItem met={strength.checks?.upper} text="One uppercase letter" />
                <RequirementItem met={strength.checks?.lower} text="One lowercase letter" />
                <RequirementItem met={strength.checks?.digit} text="One number" />
                <RequirementItem met={strength.checks?.special} text="One special character" />
              </Box>
            </motion.div>
          )}

          {/* Confirm password field */}
          <Box sx={{ mb: 2 }}>
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
              }}
              placeholder="Confirm your password"
              autoComplete="new-password"
              error={confirmPassword && !passwordsMatch}
              helperText={confirmPassword && !passwordsMatch ? "Passwords don't match" : ''}
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
                    borderColor: confirmPassword && !passwordsMatch ? '#ef4444' : 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: confirmPassword && !passwordsMatch ? '#ef4444' : '#6C5CE7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: confirmPassword && !passwordsMatch ? '#ef4444' : '#6C5CE7',
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

        {/* Continue button */}
        <Box sx={{ pb: 4 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSetPassword}
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

export default CreatePasswordScreen;
