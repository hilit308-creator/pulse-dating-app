/**
 * ErrorBoundary - Global error handling for React components
 * 
 * Catches JavaScript errors anywhere in child component tree,
 * logs those errors, and displays a fallback UI.
 */

import React, { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to analytics/monitoring service
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    
    // TODO: Send to error tracking service (e.g., Sentry)
    // errorTrackingService.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            backgroundColor: '#f8fafc',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              backgroundColor: 'rgba(239,68,68,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <AlertTriangle size={40} color="#ef4444" />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
            {this.props.title || 'Something went wrong'}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: '#64748b', mb: 4, maxWidth: 300 }}
          >
            {this.props.message || "We're sorry, but something unexpected happened. Please try again."}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={this.handleRetry}
              startIcon={<RefreshCw size={18} />}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: '12px',
                backgroundColor: '#6C5CE7',
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#5b4cdb',
                },
              }}
            >
              Try Again
            </Button>

            <Button
              onClick={this.handleGoHome}
              startIcon={<Home size={18} />}
              variant="outlined"
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: '12px',
                borderColor: '#e2e8f0',
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                },
              }}
            >
              Go Home
            </Button>
          </Box>

          {/* Show error details in development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                backgroundColor: 'rgba(239,68,68,0.05)',
                borderRadius: '12px',
                maxWidth: 500,
                textAlign: 'left',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: '#ef4444', fontFamily: 'monospace', display: 'block' }}
              >
                {this.state.error.toString()}
              </Typography>
              {this.state.errorInfo && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                    fontFamily: 'monospace',
                    display: 'block',
                    mt: 1,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.65rem',
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * Screen-level error boundary with compact UI
 */
export const ScreenErrorBoundary = ({ children, screenName }) => (
  <ErrorBoundary
    title={`Error in ${screenName || 'this screen'}`}
    message="This section encountered an error. Try refreshing or go back."
  >
    {children}
  </ErrorBoundary>
);

/**
 * Component-level error boundary with minimal UI
 */
export const ComponentErrorBoundary = ({ children, fallback }) => (
  <ErrorBoundary
    fallback={
      fallback || (
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            backgroundColor: 'rgba(239,68,68,0.05)',
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: '#ef4444' }}>
            Failed to load this section
          </Typography>
        </Box>
      )
    }
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
