/**
 * UserProfileScreen - MVP User Profile
 * 
 * Spec:
 * - Purpose: View & edit basic identity info (NOT a dating card)
 * - Editable: First name, Date of birth, Gender, Show me preference
 * - Display: Avatar, Name, Age, Location (city/region only)
 * - NO: Bio, multiple photos, "About me", interests
 * 
 * This is an IDENTITY profile, not a MATCHING profile.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MapPin, Calendar, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Gender options
const GENDER_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

// Show me options
const SHOW_ME_OPTIONS = [
  { value: '', label: 'Everyone' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
];

// Calculate age from date of birth
const calculateAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const UserProfileScreen = () => {
  const navigate = useNavigate();
  const { user, updateUser, accessToken } = useAuth();
  
  // Form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [showMe, setShowMe] = useState(user?.showMePreference || '');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [isDirty, setIsDirty] = useState(false);

  // Track page view
  useEffect(() => {
    trackEvent('profile_viewed');
  }, []);

  // Check if form has changes
  useEffect(() => {
    const hasChanges = 
      firstName !== (user?.firstName || '') ||
      dateOfBirth !== (user?.dateOfBirth || '') ||
      gender !== (user?.gender || '') ||
      showMe !== (user?.showMePreference || '');
    setIsDirty(hasChanges);
  }, [firstName, dateOfBirth, gender, showMe, user]);

  const handleBack = () => {
    navigate(-1);
  };

  // Validation
  const validateForm = () => {
    // Name: min 2 chars
    if (!firstName || firstName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    // DOB: not in future
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (dob > new Date()) {
        setError('Date of birth cannot be in the future');
        return false;
      }

      // Age < 18: block
      const age = calculateAge(dateOfBirth);
      if (age !== null && age < 18) {
        setError('You must be at least 18 years old');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      // Update local state
      updateUser({
        firstName: firstName.trim(),
        dateOfBirth,
        gender,
        showMePreference: showMe,
      });

      trackEvent('profile_updated');
      setSnack({ open: true, message: 'Profile updated', severity: 'success' });
      setIsDirty(false);
    } catch (err) {
      setSnack({ open: true, message: "Couldn't save changes", severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [firstName, dateOfBirth, gender, showMe, updateUser]);

  // Computed values
  const age = calculateAge(dateOfBirth);
  const location = user?.location || 'Tel Aviv'; // Mock location

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
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 10,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#1a1a2e' }}
        >
          Your profile
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: 3, py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Profile Card - Display Only */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
              p: 3,
              backgroundColor: '#f8fafc',
              borderRadius: '20px',
            }}
          >
            {/* Avatar */}
            <Avatar
              sx={{
                width: 100,
                height: 100,
                fontSize: '2.5rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                mb: 2,
              }}
            >
              {getInitials(firstName)}
            </Avatar>

            {/* Name & Age */}
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}
            >
              {firstName || 'Your Name'}{user?.lastName ? ` ${user.lastName}` : ''}{age ? `, ${age}` : ''}
            </Typography>

            {/* Location */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
              <MapPin size={16} />
              <Typography variant="body2">{location}</Typography>
            </Box>
          </Box>

          {/* Editable Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* First Name */}
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <User size={18} color="#6C5CE7" />
                First name
              </Typography>
              <TextField
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                error={!!error && error.includes('Name')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                  },
                }}
              />
            </Box>

            {/* Date of Birth */}
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Calendar size={18} color="#6C5CE7" />
                Date of birth
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                error={!!error && (error.includes('Date') || error.includes('18'))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                  },
                }}
              />
            </Box>

            {/* Gender */}
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Users size={18} color="#6C5CE7" />
                Gender (optional)
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  {GENDER_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Show Me */}
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Users size={18} color="#6C5CE7" />
                Show me (optional)
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={showMe}
                  onChange={(e) => setShowMe(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  {SHOW_ME_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {error}
              </Alert>
            )}
          </Box>
        </motion.div>
      </Box>

      {/* Save Button - Fixed at bottom */}
      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              px: 3,
              py: 3,
              backgroundColor: '#fff',
              borderTop: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={isLoading}
              sx={{
                py: 1.75,
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
                'Save changes'
              )}
            </Button>
          </Box>
        </motion.div>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ borderRadius: '12px' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfileScreen;
