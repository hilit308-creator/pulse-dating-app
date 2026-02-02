/**
 * AccountScreen - Account Management Hub
 * 
 * Location: Settings ← Account
 * Position: Top of Settings screen, before Profile & Visibility
 * 
 * Purpose:
 * - Manage sign-in methods and account backup
 * - Clear understanding of how user is identified in system
 * - Prevent account lockout or access loss
 * 
 * Sections (only 2):
 * 1. Email Address
 * 2. Connected Accounts
 * 
 * ❗ Critical Rules:
 * - At least one sign-in method must be active at all times
 * - Verified email counts as sign-in method
 * - Google/Apple count as sign-in methods
 * - No state where user locks themselves out
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  Link2,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Google Icon SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Apple Icon SVG
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="#000000">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const AccountScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Email state
  // eslint-disable-next-line no-unused-vars
  const [emailStatus, setEmailStatus] = useState(() => {
    // Load from localStorage or user object
    const saved = localStorage.getItem('pulse_email_status');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse email status');
      }
    }
    return {
      email: user?.email || null,
      verified: user?.emailVerified || false,
      pending: false,
    };
  });
  
  // Connected accounts state
  // eslint-disable-next-line no-unused-vars
  const [connectedAccounts, setConnectedAccounts] = useState(() => {
    const saved = localStorage.getItem('pulse_connected_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter to only Google and Apple per spec
        return parsed.filter(acc => acc.id === 'google' || acc.id === 'apple');
      } catch (e) {
        console.error('Failed to parse connected accounts');
      }
    }
    return [
      { id: 'google', name: 'Google', connected: false },
      { id: 'apple', name: 'Apple', connected: false },
    ];
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Calculate active sign-in methods count
  const activeSignInMethods = React.useMemo(() => {
    let count = 0;
    if (emailStatus.verified) count++;
    connectedAccounts.forEach(acc => {
      if (acc.connected) count++;
    });
    return count;
  }, [emailStatus.verified, connectedAccounts]);

  // Get email status text
  const getEmailStatusText = () => {
    if (!emailStatus.email) {
      return t('noEmailAdded') || 'No email address added';
    }
    if (emailStatus.pending) {
      return t('notVerified') || 'Not verified';
    }
    if (emailStatus.verified) {
      return t('verified') || 'Verified';
    }
    return t('notVerified') || 'Not verified';
  };

  // Get email status icon
  const getEmailStatusIcon = () => {
    if (!emailStatus.email) {
      return <AlertCircle size={16} color="#94a3b8" />;
    }
    if (emailStatus.pending) {
      return <Clock size={16} color="#f59e0b" />;
    }
    if (emailStatus.verified) {
      return <Check size={16} color="#22c55e" />;
    }
    return <AlertCircle size={16} color="#f59e0b" />;
  };

  // Get connected accounts count text
  // eslint-disable-next-line no-unused-vars
  const getConnectedAccountsText = () => {
    const connectedCount = connectedAccounts.filter(acc => acc.connected).length;
    if (connectedCount === 0) {
      return t('noAccountsConnected') || 'No accounts connected';
    }
    return `${connectedCount} ${connectedCount === 1 ? t('accountConnected') || 'account connected' : t('accountsConnected') || 'accounts connected'}`;
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Section container component
  const SectionContainer = ({ children }) => (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        mb: 2.5,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {children}
    </Box>
  );

  // Menu item component
  const MenuItem = ({ icon: Icon, label, statusText, statusIcon, onClick }) => (
    <Button
      fullWidth
      onClick={onClick}
      sx={{
        justifyContent: 'space-between',
        py: 2,
        px: 2,
        textTransform: 'none',
        color: '#1a1a2e',
        '&:hover': {
          backgroundColor: 'rgba(0,0,0,0.03)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} color="#64748b" />
        </Box>
        <Box sx={{ textAlign: 'left' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: '#1a1a2e',
            }}
          >
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
            {statusIcon}
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {statusText}
            </Typography>
          </Box>
        </Box>
      </Box>
      <ChevronRight size={18} color="#94a3b8" />
    </Button>
  );

  // Provider row component for connected accounts preview
  const ProviderPreview = ({ icon: IconComponent, name, connected }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 0.75,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {IconComponent}
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: '#64748b',
          fontWeight: 500,
          flex: 1,
        }}
      >
        {name}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: connected ? '#22c55e' : '#94a3b8',
          fontWeight: 500,
        }}
      >
        {connected ? (t('connected') || 'Connected') : (t('notConnected') || 'Not connected')}
      </Typography>
    </Box>
  );

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
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {t('account') || 'Account'}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: 2, pt: 2, overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* ═══════════════════════════════════════════════════════════════
              1. EMAIL ADDRESS
          ═══════════════════════════════════════════════════════════════ */}
          <SectionContainer>
            <MenuItem
              icon={Mail}
              label={t('emailAddress') || 'Email address'}
              statusText={getEmailStatusText()}
              statusIcon={getEmailStatusIcon()}
              onClick={() => navigate('/settings/account/email')}
            />
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              2. CONNECTED ACCOUNTS
          ═══════════════════════════════════════════════════════════════ */}
          <SectionContainer>
            <Button
              fullWidth
              onClick={() => navigate('/settings/account/connected-accounts')}
              sx={{
                justifyContent: 'space-between',
                py: 2,
                px: 2,
                textTransform: 'none',
                color: '#1a1a2e',
                flexDirection: 'column',
                alignItems: 'stretch',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.03)',
                },
              }}
            >
              {/* Header row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Link2 size={20} color="#64748b" />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: '#1a1a2e',
                    }}
                  >
                    {t('connectedAccounts') || 'Connected accounts'}
                  </Typography>
                </Box>
                <ChevronRight size={18} color="#94a3b8" />
              </Box>

              {/* Provider list */}
              <Box sx={{ pl: 7 }}>
                <ProviderPreview
                  icon={<GoogleIcon />}
                  name="Google"
                  connected={connectedAccounts.find(a => a.id === 'google')?.connected || false}
                />
                <ProviderPreview
                  icon={<AppleIcon />}
                  name="Apple"
                  connected={connectedAccounts.find(a => a.id === 'apple')?.connected || false}
                />
              </Box>
            </Button>
          </SectionContainer>

          {/* Info text */}
          <Box sx={{ px: 1, mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                lineHeight: 1.5,
              }}
            >
              {t('accountSecurityInfo') || 
                'Keep at least one sign-in method active to ensure you can always access your account.'}
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ borderRadius: '12px' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountScreen;
