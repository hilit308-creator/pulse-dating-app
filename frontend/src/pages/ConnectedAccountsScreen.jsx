import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, CircularProgress } from '@mui/material';
import { ArrowLeft, Check, X, Shield, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// OAuth Configuration - Only Google and Apple per spec
// API Contract: /v1/settings/account/providers/{provider}/connect
const OAUTH_CONFIG = {
  google: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    redirectUri: `${window.location.origin}/auth/callback/google`,
    scope: 'email profile',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  },
  apple: {
    clientId: process.env.REACT_APP_APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID',
    redirectUri: `${window.location.origin}/auth/callback/apple`,
    scope: 'email name',
    authUrl: 'https://appleid.apple.com/auth/authorize',
  },
};

// SVG Brand Icons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="#000000">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const getAccountIcon = (id) => {
  switch (id) {
    case 'google': return <GoogleIcon />;
    case 'apple': return <AppleIcon />;
    default: return null;
  }
};

const ConnectedAccountsScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState(() => {
    // Load saved connections from localStorage
    const saved = localStorage.getItem('pulse_connected_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved accounts');
      }
    }
    return [
      { id: 'google', name: 'Google', color: '#4285F4', bgColor: '#E8F0FE', connected: false, email: null, userName: null, profilePic: null },
      { id: 'apple', name: 'Apple', color: '#000000', bgColor: '#F5F5F5', connected: false, email: null, userName: null, profilePic: null },
    ];
  });
  const [disconnectDialog, setDisconnectDialog] = useState({ open: false, account: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [loading, setLoading] = useState(null); // Which account is currently loading
  const [oauthPopup, setOauthPopup] = useState(null);

  // Save accounts to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pulse_connected_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Generate random state for OAuth security
  const generateState = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Open OAuth popup
  const openOAuthPopup = (url, name) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    return window.open(
      url,
      name,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );
  };

  // Handle OAuth callback message from popup
  const handleOAuthMessage = useCallback((event) => {
    // Verify origin for security
    if (event.origin !== window.location.origin) return;
    
    const { type, provider, data, error } = event.data || {};
    
    if (type === 'oauth_success' && data) {
      setAccounts(prev => prev.map(a => 
        a.id === provider 
          ? { 
              ...a, 
              connected: true, 
              email: data.email,
              userName: data.name,
              profilePic: data.picture,
            }
          : a
      ));
      // API Contract: toast "Account connected successfully"
      setSnackbar({ open: true, message: t('accountConnectedSuccess') || 'Account connected successfully' });
      setLoading(null);
    } else if (type === 'oauth_error') {
      setSnackbar({ open: true, message: error || 'Authentication failed. Please try again.' });
      setLoading(null);
    }
  }, []);

  // Listen for OAuth callback messages
  useEffect(() => {
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [handleOAuthMessage]);

  // Check if popup was closed without completing
  useEffect(() => {
    if (!oauthPopup || !loading) return;
    
    const checkPopup = setInterval(() => {
      if (oauthPopup.closed) {
        setLoading(null);
        setOauthPopup(null);
        clearInterval(checkPopup);
      }
    }, 500);
    
    return () => clearInterval(checkPopup);
  }, [oauthPopup, loading]);

  const handleConnect = async (accountId) => {
    const config = OAUTH_CONFIG[accountId];
    if (!config) {
      setSnackbar({ open: true, message: 'Provider not configured' });
      return;
    }

    setLoading(accountId);
    const state = generateState();
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_provider', accountId);

    let authUrl;
    
    switch (accountId) {
      case 'google':
        authUrl = `${config.authUrl}?` + new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          response_type: 'token',
          scope: config.scope,
          state: state,
          prompt: 'select_account',
        }).toString();
        break;
        
      case 'facebook':
        authUrl = `${config.authUrl}?` + new URLSearchParams({
          client_id: config.appId,
          redirect_uri: config.redirectUri,
          response_type: 'token',
          scope: config.scope,
          state: state,
        }).toString();
        break;
        
      case 'apple':
        authUrl = `${config.authUrl}?` + new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          response_type: 'code id_token',
          scope: config.scope,
          state: state,
          response_mode: 'fragment',
        }).toString();
        break;
        
      case 'instagram':
        authUrl = `${config.authUrl}?` + new URLSearchParams({
          client_id: config.appId,
          redirect_uri: config.redirectUri,
          response_type: 'code',
          scope: config.scope,
          state: state,
        }).toString();
        break;
        
      default:
        setLoading(null);
        return;
    }

    const popup = openOAuthPopup(authUrl, `${accountId}_oauth`);
    
    if (popup) {
      setOauthPopup(popup);
    } else {
      setSnackbar({ open: true, message: 'Popup blocked. Please allow popups for this site.' });
      setLoading(null);
    }
  };

  const handleDisconnect = (account) => {
    setDisconnectDialog({ open: true, account });
  };

  // Check if this is the last sign-in method (safety rule)
  const canDisconnect = useCallback((accountId) => {
    // Get email status
    const emailStatus = JSON.parse(localStorage.getItem('pulse_email_status') || '{}');
    const hasVerifiedEmail = emailStatus.verified === true;
    
    // Count connected accounts excluding the one we want to disconnect
    const otherConnectedAccounts = accounts.filter(a => a.connected && a.id !== accountId).length;
    
    // Can disconnect if there's a verified email OR another connected account
    return hasVerifiedEmail || otherConnectedAccounts > 0;
  }, [accounts]);

  const confirmDisconnect = () => {
    const { account } = disconnectDialog;
    
    // Safety check: prevent disconnecting last sign-in method
    // API Contract: 409 CANNOT_DISCONNECT_LAST_METHOD
    if (!canDisconnect(account.id)) {
      setSnackbar({ 
        open: true, 
        message: t('cannotDisconnectLastMethod') || 'To disconnect this account, please set up another sign-in method first (email or another connected account).' 
      });
      setDisconnectDialog({ open: false, account: null });
      // Analytics
      console.log('[Analytics] account_disconnect_blocked', { provider: account.id });
      return;
    }
    
    setAccounts(prev => prev.map(a => 
      a.id === account.id 
        ? { ...a, connected: false, email: null }
        : a
    ));
    setSnackbar({ open: true, message: t('accountDisconnected') || `${account.name} disconnected` });
    setDisconnectDialog({ open: false, account: null });
    // Analytics
    console.log('[Analytics] account_provider_disconnected', { provider: account.id });
  };

  const connectedCount = accounts.filter(a => a.connected).length;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1.5,
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        zIndex: 10,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {t('connectedAccounts')}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2, py: 3 }}>
        <Box sx={{ 
          p: 3, 
          backgroundColor: 'rgba(108,92,231,0.05)', 
          borderRadius: '16px',
          border: '1px solid rgba(108,92,231,0.1)',
          mb: 3,
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5 }}>
            Link your accounts
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Connect social accounts for easier login and to help verify your profile.
          </Typography>
        </Box>

        {/* Connected count */}
        {connectedCount > 0 && (
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2, px: 1 }}>
            {connectedCount} account{connectedCount > 1 ? 's' : ''} connected
          </Typography>
        )}

        {/* Account list */}
        {accounts.map((account) => (
          <Box
            key={account.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              mb: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                backgroundColor: account.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                {getAccountIcon(account.id)}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                  {account.name}
                </Typography>
                {account.connected ? (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Check size={12} /> <Shield size={10} /> Verified
                    </Typography>
                    {account.email && (
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>
                        {account.email}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {t('notConnected')}
                  </Typography>
                )}
              </Box>
            </Box>

            {account.connected ? (
              <Button
                size="small"
                onClick={() => handleDisconnect(account)}
                sx={{
                  textTransform: 'none',
                  color: '#ef4444',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: 'rgba(239,68,68,0.1)' },
                }}
              >
                {t('disconnect')}
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleConnect(account.id)}
                disabled={loading === account.id}
                sx={{
                  textTransform: 'none',
                  borderColor: '#6C5CE7',
                  color: '#6C5CE7',
                  fontWeight: 500,
                  borderRadius: '8px',
                  minWidth: 90,
                  '&:hover': { 
                    backgroundColor: 'rgba(108,92,231,0.1)',
                    borderColor: '#6C5CE7',
                  },
                }}
              >
                {loading === account.id ? (
                  <CircularProgress size={18} sx={{ color: '#6C5CE7' }} />
                ) : (
                  t('connect')
                )}
              </Button>
            )}
          </Box>
        ))}

        {/* Info section */}
        <Box sx={{ mt: 4, px: 1 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
            Connected accounts can be used for quick login. We never post anything without your permission. 
            You can disconnect accounts at any time.
          </Typography>
        </Box>
      </Box>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        open={disconnectDialog.open}
        onClose={() => setDisconnectDialog({ open: false, account: null })}
        PaperProps={{
          sx: { borderRadius: '20px', p: 1, maxWidth: 340 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {t('disconnectAccount') || 'Disconnect account'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {t('disconnectAccountWarning') || 'Disconnecting this account will prevent signing in with it in the future.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={confirmDisconnect}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              py: 1.5,
              backgroundColor: '#ef4444',
              '&:hover': { backgroundColor: '#dc2626' },
            }}
          >
            Disconnect
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setDisconnectDialog({ open: false, account: null })}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: '#64748b',
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ConnectedAccountsScreen;
