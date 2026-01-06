/**
 * AccessibilityScreen - Accessibility Settings
 * 
 * Settings to make the app more accessible for users with different needs
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Switch,
  Slider,
  Button,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  ArrowLeft,
  Type,
  Eye,
  Volume2,
  Vibrate,
  Moon,
  Contrast,
  MousePointer,
  MessageSquare,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AccessibilityScreen = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Load settings from localStorage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pulse_accessibility_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse accessibility settings');
      }
    }
    return {
      fontSize: 100, // percentage
      highContrast: false,
      reduceMotion: false,
      screenReaderOptimized: false,
      largerTouchTargets: false,
      hapticFeedback: true,
      autoPlayVideos: true,
      showCaptions: false,
      darkMode: false,
      boldText: false,
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pulse_accessibility_settings', JSON.stringify(settings));
    
    // Apply settings to the document
    document.documentElement.style.fontSize = `${settings.fontSize}%`;
    
    // Bold text
    if (settings.boldText) {
      document.body.style.fontWeight = '600';
    } else {
      document.body.style.fontWeight = '';
    }
    
    // High contrast
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Reduce motion
    if (settings.reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    
    // Dark mode
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.backgroundColor = '#1a1a2e';
      document.body.style.color = '#f8fafc';
    } else {
      document.body.classList.remove('dark-mode');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
    
    // Larger touch targets
    if (settings.largerTouchTargets) {
      document.body.classList.add('larger-touch-targets');
    } else {
      document.body.classList.remove('larger-touch-targets');
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSnackbar({ open: true, message: 'Setting updated' });
  };

  const resetToDefaults = () => {
    const defaults = {
      fontSize: 100,
      highContrast: false,
      reduceMotion: false,
      screenReaderOptimized: false,
      largerTouchTargets: false,
      hapticFeedback: true,
      autoPlayVideos: true,
      showCaptions: false,
      darkMode: false,
      boldText: false,
    };
    setSettings(defaults);
    setSnackbar({ open: true, message: 'Settings reset to defaults' });
  };

  const SettingRow = ({ icon: Icon, title, description, children }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2,
        px: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <Icon size={20} color="#64748b" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {description}
            </Typography>
          )}
        </Box>
      </Box>
      {children}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fff', pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 10,
        }}
      >
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowLeft size={22} color="#1a1a2e" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {t('accessibility')}
        </Typography>
      </Box>

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Vision Section */}
        <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 600, px: 1 }}>
          {t('vision')}
        </Typography>
        <Box sx={{ backgroundColor: '#f8fafc', borderRadius: '16px', mb: 3 }}>
          <SettingRow icon={Type} title={t('textSize')} description={`${settings.fontSize}%`}>
            <Box sx={{ width: 120 }}>
              <Slider
                size="small"
                value={settings.fontSize}
                min={80}
                max={150}
                step={10}
                onChange={(e, v) => updateSetting('fontSize', v)}
                sx={{ color: '#6C5CE7' }}
              />
            </Box>
          </SettingRow>
          <Divider sx={{ mx: 2 }} />
          
          <SettingRow icon={Type} title={t('boldText')} description="">
            <Switch
              size="small"
              checked={settings.boldText}
              onChange={(e) => updateSetting('boldText', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
              }}
            />
          </SettingRow>
          <Divider sx={{ mx: 2 }} />

          <SettingRow icon={Contrast} title={t('highContrast')} description="">
            <Switch
              size="small"
              checked={settings.highContrast}
              onChange={(e) => updateSetting('highContrast', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
              }}
            />
          </SettingRow>
          <Divider sx={{ mx: 2 }} />

          <SettingRow icon={Moon} title={t('darkMode')} description="">
            <Switch
              size="small"
              checked={settings.darkMode}
              onChange={(e) => updateSetting('darkMode', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
              }}
            />
          </SettingRow>
        </Box>

        {/* Motion Section */}
        <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 600, px: 1 }}>
          {t('motionInteraction')}
        </Typography>
        <Box sx={{ backgroundColor: '#f8fafc', borderRadius: '16px', mb: 3 }}>
          <SettingRow icon={Sparkles} title={t('reduceMotion')} description="">
            <Switch
              size="small"
              checked={settings.reduceMotion}
              onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
              }}
            />
          </SettingRow>
          <Divider sx={{ mx: 2 }} />

          <SettingRow icon={MousePointer} title={t('largerTouchTargets')} description="">
            <Switch
              size="small"
              checked={settings.largerTouchTargets}
              onChange={(e) => updateSetting('largerTouchTargets', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
              }}
            />
          </SettingRow>
          <Divider sx={{ mx: 2 }} />

          <SettingRow icon={Vibrate} title={t('hapticFeedback')} description="">
            <Switch
              size="small"
              checked={settings.hapticFeedback}
              onChange={(e) => updateSetting('hapticFeedback', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
              }}
            />
          </SettingRow>
        </Box>

        {/* Audio & Media Section */}
        <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 600, px: 1 }}>
          {t('audioMedia')}
        </Typography>
        <Box sx={{ backgroundColor: '#f8fafc', borderRadius: '16px', mb: 3 }}>
          <SettingRow icon={Eye} title={t('screenReaderOptimized')} description="">
            <Switch
              size="small"
              checked={settings.screenReaderOptimized}
              onChange={(e) => updateSetting('screenReaderOptimized', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
              }}
            />
          </SettingRow>
          <Divider sx={{ mx: 2 }} />

          <SettingRow icon={MessageSquare} title={t('showCaptions')} description="">
            <Switch
              size="small"
              checked={settings.showCaptions}
              onChange={(e) => updateSetting('showCaptions', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
              }}
            />
          </SettingRow>
          <Divider sx={{ mx: 2 }} />

          <SettingRow icon={Volume2} title={t('autoPlayVideos')} description="">
            <Switch
              size="small"
              checked={settings.autoPlayVideos}
              onChange={(e) => updateSetting('autoPlayVideos', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
              }}
            />
          </SettingRow>
        </Box>

        {/* Reset Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<RotateCcw size={18} />}
          onClick={resetToDefaults}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748b',
            borderColor: '#e2e8f0',
            '&:hover': {
              borderColor: '#94a3b8',
              backgroundColor: '#f8fafc',
            },
          }}
        >
          {t('resetToDefaults')}
        </Button>

        {/* Info */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '12px' }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            💡 These settings are saved locally and will persist across sessions. Some settings may require an app restart to take full effect.
          </Typography>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default AccessibilityScreen;
