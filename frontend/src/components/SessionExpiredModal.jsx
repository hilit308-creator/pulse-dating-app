/**
 * SessionExpiredModal - Session Expired Handler
 * 
 * Spec:
 * - Trigger: API returns 401/403, Token invalid/expired
 * - Text: "Your session has expired. Please log in again."
 * - CTA: Log in
 * - Redirect to Login screen
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

const SessionExpiredModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (open) {
      trackEvent('session_expired_shown');
    }
  }, [open]);

  const handleLogin = () => {
    // Clear session
    logout();
    
    // Close modal
    if (onClose) onClose();
    
    // Navigate to login
    navigate('/auth/login', { replace: true });
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}} // Prevent closing by clicking outside
      PaperProps={{
        sx: {
          borderRadius: '20px',
          p: 1,
          maxWidth: 340,
          textAlign: 'center',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'rgba(251,191,36,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <AlertCircle size={32} color="#f59e0b" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Session Expired
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Your session has expired. Please log in again.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            py: 1.5,
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            fontWeight: 600,
          }}
        >
          Log in
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpiredModal;
