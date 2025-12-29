/**
 * GlobalErrorBanner - System-wide Error Handler
 * 
 * Spec:
 * - No internet: Banner "No internet connection"
 * - Internal error: Toast "Something went wrong. Please try again."
 * - Rate limit: Inline error + disable CTA
 * - Server error: Generic error
 * - No leak rule: No stack traces, error codes, internal info
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Box, Typography, Snackbar, Alert, Slide } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Error types
export const ERROR_TYPE = {
  NO_INTERNET: 'no_internet',
  SERVER_ERROR: 'server_error',
  GENERIC_ERROR: 'generic_error',
};

// Context for global error handling
const GlobalErrorContext = createContext(null);

export function GlobalErrorProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(!navigator.onLine);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      // Show reconnected toast
      setToast({
        open: true,
        message: 'Back online',
        severity: 'success',
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      trackEvent('global_error_shown', { type: 'no_internet' });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show error toast
  const showError = useCallback((message = 'Something went wrong. Please try again.', severity = 'error') => {
    trackEvent('global_error_shown', { type: 'toast', severity });
    setToast({ open: true, message, severity });
  }, []);

  // Close toast
  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, open: false }));
  }, []);

  // Handle API error
  const handleApiError = useCallback((error) => {
    if (!error) return;
    
    // Don't show error toast for auth errors (handled by SessionExpiredModal)
    if (error.code === 'unauthorized' || error.code === 'unauthenticated') {
      return;
    }
    
    // No internet
    if (error.code === 'no_internet' || !navigator.onLine) {
      setShowOfflineBanner(true);
      return;
    }
    
    // Rate limit - don't show toast (handled inline)
    if (error.code === 'rate_limited') {
      return;
    }
    
    // Validation errors - don't show toast (handled inline)
    if (error.code === 'validation_error') {
      return;
    }
    
    // Generic server error
    showError(error.message || 'Something went wrong. Please try again.');
  }, [showError]);

  const value = {
    isOnline,
    showError,
    handleApiError,
    closeToast,
  };

  return (
    <GlobalErrorContext.Provider value={value}>
      {children}
      
      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
            }}
          >
            <Box
              sx={{
                backgroundColor: '#1a1a2e',
                color: '#fff',
                py: 1.5,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
              }}
            >
              <WifiOff size={18} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                No internet connection. Please check your connection.
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
        sx={{ mb: 8 }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: '12px',
            fontWeight: 500,
            '& .MuiAlert-icon': {
              alignItems: 'center',
            },
          }}
          icon={toast.severity === 'error' ? <AlertCircle size={20} /> : undefined}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </GlobalErrorContext.Provider>
  );
}

export function useGlobalError() {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
}
