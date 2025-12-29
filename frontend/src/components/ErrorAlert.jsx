import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, WifiOff, RefreshCw, X } from 'lucide-react';

// Error types and their configurations
const ERROR_CONFIGS = {
  no_internet: {
    title: 'No Internet Connection',
    message: 'Please check your connection and try again.',
    icon: WifiOff,
    severity: 'warning',
    retryable: true,
  },
  rate_limited: {
    title: 'Too Many Attempts',
    message: 'Please wait a moment before trying again.',
    icon: AlertCircle,
    severity: 'warning',
    retryable: false,
  },
  validation_error: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    icon: AlertCircle,
    severity: 'error',
    retryable: false,
  },
  server_error: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    icon: AlertCircle,
    severity: 'error',
    retryable: true,
  },
  default: {
    title: 'Error',
    message: 'Something went wrong. Please try again.',
    icon: AlertCircle,
    severity: 'error',
    retryable: true,
  },
};

const ErrorAlert = ({ 
  error, 
  onRetry, 
  onDismiss, 
  showRetry = true,
  showDismiss = true,
  customMessage,
}) => {
  if (!error) return null;

  // Get error config based on error code or type
  const errorCode = typeof error === 'object' ? error.code : 'default';
  const config = ERROR_CONFIGS[errorCode] || ERROR_CONFIGS.default;
  const Icon = config.icon;
  
  // Use custom message if provided, otherwise use error message or config message
  const displayMessage = customMessage || 
    (typeof error === 'object' ? error.message : error) || 
    config.message;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Alert
          severity={config.severity}
          sx={{
            borderRadius: '12px',
            mb: 2,
            '& .MuiAlert-icon': {
              alignItems: 'center',
            },
          }}
          icon={<Icon size={20} />}
          action={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {showRetry && config.retryable && onRetry && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={onRetry}
                  startIcon={<RefreshCw size={14} />}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Retry
                </Button>
              )}
              {showDismiss && onDismiss && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={onDismiss}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <X size={16} />
                </Button>
              )}
            </Box>
          }
        >
          <AlertTitle sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
            {config.title}
          </AlertTitle>
          <Box sx={{ fontSize: '0.8rem' }}>
            {displayMessage}
          </Box>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};

// Simple inline error for form fields
export const FieldError = ({ error }) => {
  if (!error) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <Box
        sx={{
          color: '#ef4444',
          fontSize: '0.75rem',
          mt: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <AlertCircle size={12} />
        {error}
      </Box>
    </motion.div>
  );
};

// Toast-style error notification
export const ErrorToast = ({ error, onDismiss, duration = 5000 }) => {
  React.useEffect(() => {
    if (error && duration) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [error, duration, onDismiss]);

  if (!error) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 80,
        left: 16,
        right: 16,
        zIndex: 1400,
      }}
    >
      <ErrorAlert 
        error={error} 
        onDismiss={onDismiss} 
        showRetry={false}
      />
    </Box>
  );
};

export default ErrorAlert;
