/**
 * PermissionsScreen - Permissions Management
 * 
 * Spec:
 * - Purpose: View which permissions are active, manage via OS Settings
 * - NO internal toggles - all changes go through OS
 * - Permissions: Location, Notifications, Camera/Photos (future-proof)
 * - CTA always redirects to OS Settings
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Bell,
  Camera,
  ChevronRight,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth, PERMISSION_STATE } from '../context/AuthContext';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

const PermissionsScreen = () => {
  const navigate = useNavigate();
  const { permissions, updatePermission } = useAuth();
  
  // Permission states
  const [locationStatus, setLocationStatus] = useState(PERMISSION_STATE.UNKNOWN);
  const [notificationStatus, setNotificationStatus] = useState(PERMISSION_STATE.UNKNOWN);
  const [cameraStatus, setCameraStatus] = useState(PERMISSION_STATE.UNKNOWN);

  // Track page view
  useEffect(() => {
    trackEvent('permissions_viewed');
  }, []);

  // Check permissions on mount
  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    // Check location permission
    if (navigator.permissions) {
      try {
        const locationResult = await navigator.permissions.query({ name: 'geolocation' });
        setLocationStatus(
          locationResult.state === 'granted' ? PERMISSION_STATE.GRANTED :
          locationResult.state === 'denied' ? PERMISSION_STATE.DENIED :
          PERMISSION_STATE.UNKNOWN
        );

        // Listen for changes
        locationResult.onchange = () => {
          setLocationStatus(
            locationResult.state === 'granted' ? PERMISSION_STATE.GRANTED :
            locationResult.state === 'denied' ? PERMISSION_STATE.DENIED :
            PERMISSION_STATE.UNKNOWN
          );
        };
      } catch (e) {
        // Permission API not supported for this permission
      }

      // Check notification permission
      if ('Notification' in window) {
        const notifPermission = Notification.permission;
        setNotificationStatus(
          notifPermission === 'granted' ? PERMISSION_STATE.GRANTED :
          notifPermission === 'denied' ? PERMISSION_STATE.DENIED :
          PERMISSION_STATE.UNKNOWN
        );
      }

      // Check camera permission (if available)
      try {
        const cameraResult = await navigator.permissions.query({ name: 'camera' });
        setCameraStatus(
          cameraResult.state === 'granted' ? PERMISSION_STATE.GRANTED :
          cameraResult.state === 'denied' ? PERMISSION_STATE.DENIED :
          PERMISSION_STATE.UNKNOWN
        );
      } catch (e) {
        // Camera permission query not supported
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Open system settings (simulated - actual implementation depends on platform)
  const openSystemSettings = useCallback((permissionType) => {
    trackEvent('permission_manage_clicked', { type: permissionType });
    
    // On web, we can't directly open OS settings
    // Show alert with instructions
    alert(`To manage ${permissionType} permissions:\n\n1. Open your browser settings\n2. Find "Site Settings" or "Permissions"\n3. Look for ${permissionType}\n4. Update the setting for this site`);
  }, []);

  // Request permission (only for ones that can be requested)
  const requestPermission = useCallback(async (type) => {
    trackEvent('permission_manage_clicked', { type });

    if (type === 'location') {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setLocationStatus(PERMISSION_STATE.GRANTED);
        updatePermission('location', PERMISSION_STATE.GRANTED);
      } catch {
        setLocationStatus(PERMISSION_STATE.DENIED);
        openSystemSettings('Location');
      }
    } else if (type === 'notifications') {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationStatus(
          permission === 'granted' ? PERMISSION_STATE.GRANTED :
          permission === 'denied' ? PERMISSION_STATE.DENIED :
          PERMISSION_STATE.UNKNOWN
        );
        if (permission !== 'granted') {
          openSystemSettings('Notifications');
        }
      }
    } else {
      openSystemSettings(type);
    }
  }, [openSystemSettings, updatePermission]);

  // Permission item component
  const PermissionItem = ({ icon: Icon, title, description, status, onManage }) => {
    const isEnabled = status === PERMISSION_STATE.GRANTED;
    
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2.5,
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          mb: 2,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: isEnabled ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
          }}
        >
          <Icon size={24} color={isEnabled ? '#10b981' : '#64748b'} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
              {title}
            </Typography>
            <Chip
              size="small"
              icon={isEnabled ? <CheckCircle size={14} /> : <XCircle size={14} />}
              label={isEnabled ? 'Enabled' : 'Disabled'}
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: isEnabled ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: isEnabled ? '#10b981' : '#ef4444',
                '& .MuiChip-icon': {
                  color: isEnabled ? '#10b981' : '#ef4444',
                },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
            {description}
          </Typography>
        </Box>

        {/* Action button */}
        <Button
          variant="text"
          size="small"
          onClick={onManage}
          endIcon={<ChevronRight size={18} />}
          sx={{
            color: '#6C5CE7',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
          }}
        >
          {isEnabled ? 'Manage' : 'Enable'}
        </Button>
      </Box>
    );
  };

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
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowLeft size={24} color="#1a1a2e" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          Permissions
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: 3, py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Info text */}
          <Typography
            variant="body2"
            sx={{ color: '#64748b', mb: 3, lineHeight: 1.6 }}
          >
            Manage app permissions below. All changes are made through your device settings.
          </Typography>

          {/* Permission Items */}
          <PermissionItem
            icon={MapPin}
            title="Location"
            description="Used to show nearby activity"
            status={locationStatus}
            onManage={() => requestPermission('location')}
          />

          <PermissionItem
            icon={Bell}
            title="Notifications"
            description="Get updates when something happens nearby"
            status={notificationStatus}
            onManage={() => requestPermission('notifications')}
          />

          <PermissionItem
            icon={Camera}
            title="Camera & Photos"
            description="Used for profile photos and verification"
            status={cameraStatus}
            onManage={() => openSystemSettings('Camera')}
          />

          {/* Note */}
          <Box
            sx={{
              mt: 4,
              p: 2,
              backgroundColor: 'rgba(108,92,231,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(108,92,231,0.1)',
            }}
          >
            <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 500 }}>
              Note: Permission changes are handled by your device. Some browsers may require you to manually update settings.
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default PermissionsScreen;
