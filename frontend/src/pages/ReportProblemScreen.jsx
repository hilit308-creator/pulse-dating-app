/**
 * ReportProblemScreen - Report a Problem
 * 
 * Per Spec: Settings → Safety & Trust → Report a problem
 * 
 * Purpose:
 * - Allow users to report app issues, notification problems, location/visibility issues,
 *   account-related issues, and general safety concerns
 * - Simple, non-intimidating, private, with clear user feedback
 * 
 * This is NOT a report about a specific user and NOT a blocking action,
 * but a general support channel.
 * 
 * Core Principle:
 * - All reports are sent to Pulse's dedicated backend server
 * - Reports are stored in an internal system
 * - No emails are sent to individual developers
 * 
 * API Contract: POST /v1/support/report
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Flag,
  Camera,
  X,
  Check,
  Info,
  Upload,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Issue categories per spec
const ISSUE_CATEGORIES = [
  { value: 'app_not_working', label: 'App not working properly' },
  { value: 'notifications', label: 'Notifications issue' },
  { value: 'location_visibility', label: 'Location or visibility issue' },
  { value: 'account_login', label: 'Account & login' },
  { value: 'safety_concern', label: 'Safety concern' },
  { value: 'other', label: 'Other' },
];

const ReportProblemScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  
  // Form state
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [includeAppInfo, setIncludeAppInfo] = useState(true);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleBack = () => {
    navigate(-1);
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // Max 10MB
    );
    
    if (validFiles.length < files.length) {
      setSnackbar({
        open: true,
        message: 'Some files were skipped (only images under 10MB allowed)',
        severity: 'warning',
      });
    }
    
    // Convert to preview URLs
    const newScreenshots = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    
    setScreenshots(prev => [...prev, ...newScreenshots].slice(0, 5)); // Max 5 screenshots
  };

  // Remove screenshot
  const removeScreenshot = (index) => {
    setScreenshots(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Get app info for report
  const getAppInfo = () => {
    return {
      appVersion: '1.0.0',
      os: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString(),
    };
  };

  // Submit report
  const handleSubmit = async () => {
    // Validation
    if (!category) {
      setError(t('selectCategory') || 'Please select a category');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      // Build report payload
      const payload = {
        category,
        description: description.trim(),
        screenshots: screenshots.map(s => s.name),
        appInfo: includeAppInfo ? getAppInfo() : null,
        timestamp: Date.now(),
      };

      // Simulate API call
      // In production: await api.submitReport(payload);
      await new Promise(resolve => setTimeout(resolve, 1500));

      trackEvent('report_problem_submitted', { category });
      
      setSubmitted(true);
      
    } catch (err) {
      if (err?.code === 'no_internet') {
        setError(t('noInternet') || 'Unable to send report. Please check your connection.');
      } else {
        setError(t('reportFailed') || 'Failed to submit report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
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
          }}
        >
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowLeft size={22} color="#1a1a2e" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
            {t('reportProblem') || 'Report a problem'}
          </Typography>
        </Box>

        {/* Success content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            textAlign: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(34,197,94,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Check size={40} color="#22c55e" />
            </Box>
          </motion.div>
          
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
            {t('thanksForLettingUsKnow') || 'Thanks for letting us know'}
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
            {t('reportReceived') || "We've received your report and our team will review it."}
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            {t('done') || 'Done'}
          </Button>
        </Box>
      </Box>
    );
  }

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
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowLeft size={22} color="#1a1a2e" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {t('reportProblem') || 'Report a problem'}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: 2, pt: 3, pb: 4, overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Intro text */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              p: 2,
              backgroundColor: 'rgba(108,92,231,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(108,92,231,0.1)',
              mb: 3,
            }}
          >
            <Flag size={20} color="#6C5CE7" style={{ flexShrink: 0, marginTop: 2 }} />
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {t('reportIntro') || "Something not working as expected? Let us know and we'll look into it."}
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

          {/* Issue Category */}
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              p: 3,
              mb: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 2 }}>
              {t('issueCategory') || 'Issue category'} *
            </Typography>
            
            <FormControl fullWidth size="small">
              <InputLabel>{t('selectCategory') || 'Select a category'}</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label={t('selectCategory') || 'Select a category'}
                sx={{ borderRadius: '12px' }}
              >
                {ISSUE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {t(cat.value) || cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Issue Description */}
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              p: 3,
              mb: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 2 }}>
              {t('issueDescription') || 'Describe the issue'}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={t('describeIssue') || 'Describe the issue you\'re experiencing...'}
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            
            <Typography variant="caption" sx={{ color: '#94a3b8', mt: 1, display: 'block', textAlign: 'right' }}>
              {description.length}/1000
            </Typography>
          </Box>

          {/* Attach Screenshot */}
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              p: 3,
              mb: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 2 }}>
              {t('attachScreenshot') || 'Attach screenshot'} ({t('optional') || 'optional'})
            </Typography>
            
            {/* Screenshot previews */}
            {screenshots.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {screenshots.map((screenshot, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: 80,
                      height: 80,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <img
                      src={screenshot.preview}
                      alt={`Screenshot ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeScreenshot(index)}
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        p: 0.25,
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                      }}
                    >
                      <X size={14} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
            
            <Button
              variant="outlined"
              startIcon={<Camera size={18} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={screenshots.length >= 5}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                borderColor: 'rgba(0,0,0,0.1)',
                color: '#64748b',
              }}
            >
              {t('addScreenshot') || 'Add screenshot'}
            </Button>
            
            {screenshots.length >= 5 && (
              <Typography variant="caption" sx={{ color: '#94a3b8', mt: 1, display: 'block' }}>
                {t('maxScreenshots') || 'Maximum 5 screenshots'}
              </Typography>
            )}
          </Box>

          {/* Include App Info */}
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              p: 3,
              mb: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
                <Info size={20} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {t('includeAppInfo') || 'Include app info'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {t('appInfoHelp') || 'This helps us investigate the issue faster.'}
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={includeAppInfo}
                onChange={(e) => setIncludeAppInfo(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
                }}
              />
            </Box>
          </Box>

          {/* Submit Button */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'rgba(0,0,0,0.1)',
                color: '#64748b',
              }}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting || !category}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                '&:disabled': {
                  background: 'rgba(0,0,0,0.1)',
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('sendReport') || 'Send report'
              )}
            </Button>
          </Box>
        </motion.div>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default ReportProblemScreen;
