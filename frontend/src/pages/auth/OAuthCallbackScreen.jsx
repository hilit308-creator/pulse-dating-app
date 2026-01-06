/**
 * OAuthCallbackScreen - Handles OAuth redirects from social providers
 * 
 * This page receives the OAuth callback, extracts the token/code,
 * fetches user info, and sends it back to the parent window.
 */

import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Check, X } from 'lucide-react';

const OAuthCallbackScreen = () => {
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Authenticating...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const hash = window.location.hash.substring(1);
      const search = window.location.search.substring(1);
      const params = new URLSearchParams(hash || search);
      
      const accessToken = params.get('access_token');
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      // Check for errors
      if (error) {
        throw new Error(errorDescription || error);
      }

      // Verify state for security
      const savedState = sessionStorage.getItem('oauth_state');
      const provider = sessionStorage.getItem('oauth_provider');
      
      if (state && state !== savedState) {
        throw new Error('State mismatch - possible CSRF attack');
      }

      if (!provider) {
        throw new Error('No provider found in session');
      }

      let userData = null;

      // Handle different providers
      if (accessToken) {
        userData = await fetchUserData(provider, accessToken);
      } else if (code) {
        // For providers that return a code, we'd normally exchange it on the backend
        // For demo purposes, we'll show a message
        setMessage('Authorization code received. Backend integration required.');
        userData = {
          email: `user@${provider}.com`,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        };
      }

      if (userData) {
        // Send success message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth_success',
            provider: provider,
            data: userData,
          }, window.location.origin);
        }
        
        setStatus('success');
        setMessage(`Successfully connected to ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`);
        
        // Close popup after short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      }

    } catch (err) {
      console.error('OAuth error:', err);
      setStatus('error');
      setMessage(err.message || 'Authentication failed');
      
      // Send error to parent
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth_error',
          error: err.message,
        }, window.location.origin);
      }
      
      // Close popup after delay
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  };

  const fetchUserData = async (provider, accessToken) => {
    let userInfoUrl;
    let headers = { Authorization: `Bearer ${accessToken}` };

    switch (provider) {
      case 'google':
        userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
        break;
      case 'facebook':
        userInfoUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`;
        headers = {};
        break;
      case 'instagram':
        userInfoUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;
        headers = {};
        break;
      default:
        return null;
    }

    const response = await fetch(userInfoUrl, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const data = await response.json();
    
    // Normalize the data
    return {
      email: data.email || `${data.username || data.id}@${provider}.com`,
      name: data.name || data.username || 'User',
      picture: data.picture?.data?.url || data.picture || null,
      id: data.id,
    };
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        p: 3,
      }}
    >
      {status === 'processing' && (
        <>
          <CircularProgress size={48} sx={{ color: '#6C5CE7', mb: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
            Connecting...
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
            {message}
          </Typography>
        </>
      )}

      {status === 'success' && (
        <>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(34,197,94,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Check size={32} color="#22c55e" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
            Connected!
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
            {message}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', mt: 2 }}>
            This window will close automatically...
          </Typography>
        </>
      )}

      {status === 'error' && (
        <>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(239,68,68,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <X size={32} color="#ef4444" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
            Connection Failed
          </Typography>
          <Typography variant="body2" sx={{ color: '#ef4444', textAlign: 'center' }}>
            {message}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', mt: 2 }}>
            This window will close automatically...
          </Typography>
        </>
      )}
    </Box>
  );
};

export default OAuthCallbackScreen;
