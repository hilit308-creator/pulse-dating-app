/**
 * NotificationSettingsScreen - Detailed Notification Settings
 * 
 * Includes:
 * - Match notifications
 * - Message notifications
 * - Quiet hours
 * - Smart notifications
 * - Lock-screen actions
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Switch,
  Chip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  Heart,
  MessageCircle,
  Clock,
  Zap,
  Smartphone,
  ThumbsUp,
  Reply,
  X,
  AlarmClock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const NotificationSettingsScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Notification settings
  const [matchNotif, setMatchNotif] = useState('always');
  const [messageNotif, setMessageNotif] = useState('always');
  
  // Quiet hours
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietDays, setQuietDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [quietStart, setQuietStart] = useState('23:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  
  // Smart notifications
  const [smartNotifications, setSmartNotifications] = useState(true);
  
  // Lock-screen actions
  const [lockScreenEnabled, setLockScreenEnabled] = useState(true);
  const [lockScreenActions, setLockScreenActions] = useState({
    likeBack: true,
    reply: true,
    ignore: true,
    remindLater: false,
  });

  const handleBack = () => navigate(-1);

  const toggleQuietDay = (day) => {
    if (quietDays.includes(day)) {
      setQuietDays(quietDays.filter(d => d !== day));
    } else {
      setQuietDays([...quietDays, day]);
    }
  };

  const SettingRow = ({ icon: Icon, title, subtitle, children }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        py: 2,
        px: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
        <Icon size={20} color="#64748b" style={{ marginTop: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
              {subtitle}
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
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowLeft size={22} color="#1a1a2e" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {t('notifications')}
        </Typography>
      </Box>

      <Box sx={{ pt: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Notification Types */}
          <Box sx={{ px: 2, mb: 1 }}>
            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              {t('notifications')}
            </Typography>
          </Box>
          <Box sx={{ backgroundColor: '#f8fafc', mx: 2, borderRadius: '16px', mb: 3 }}>
            <SettingRow icon={Heart} title={t('matches')} subtitle={t('matchNotifications')}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={matchNotif}
                  onChange={(e) => setMatchNotif(e.target.value)}
                  sx={{ borderRadius: '8px', fontSize: '0.875rem' }}
                >
                  <MenuItem value="always">Always</MenuItem>
                  <MenuItem value="visible">Only when visible</MenuItem>
                  <MenuItem value="selected">Selected times</MenuItem>
                  <MenuItem value="never">Never</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>
            <Divider sx={{ mx: 2 }} />
            <SettingRow icon={MessageCircle} title={t('chat')} subtitle={t('messageNotifications')}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={messageNotif}
                  onChange={(e) => setMessageNotif(e.target.value)}
                  sx={{ borderRadius: '8px', fontSize: '0.875rem' }}
                >
                  <MenuItem value="always">Always</MenuItem>
                  <MenuItem value="matches">From matches only</MenuItem>
                  <MenuItem value="active">Active hours only</MenuItem>
                  <MenuItem value="never">Never</MenuItem>
                </Select>
              </FormControl>
            </SettingRow>
          </Box>

          {/* Quiet Hours */}
          <Box sx={{ px: 2, mb: 1 }}>
            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              {t('quietHours')}
            </Typography>
          </Box>
          <Box sx={{ backgroundColor: '#f8fafc', mx: 2, borderRadius: '16px', mb: 3, overflow: 'hidden' }}>
            <SettingRow icon={Clock} title={t('quietHours')} subtitle={t('noNotificationsDuringSetTimes')}>
              <Switch
                checked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
                }}
              />
            </SettingRow>
            
            {quietHoursEnabled && (
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5, pl: 4.5 }}>
                  Days
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2, pl: 4.5 }}>
                  {DAYS.map((day) => (
                    <Chip
                      key={day}
                      label={day}
                      size="small"
                      onClick={() => toggleQuietDay(day)}
                      sx={{
                        backgroundColor: quietDays.includes(day) ? '#6C5CE7' : 'rgba(0,0,0,0.06)',
                        color: quietDays.includes(day) ? '#fff' : '#64748b',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        '&:hover': {
                          backgroundColor: quietDays.includes(day) ? '#5b4cdb' : 'rgba(0,0,0,0.1)',
                        },
                      }}
                    />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, pl: 4.5 }}>
                  <TextField
                    label="From"
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    sx={{ flex: 1 }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                  <TextField
                    label="To"
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    sx={{ flex: 1 }}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Box>
              </Box>
            )}
          </Box>

          {/* Smart Notifications */}
          <Box sx={{ px: 2, mb: 1 }}>
            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              {t('smartNotifications')}
            </Typography>
          </Box>
          <Box sx={{ backgroundColor: '#f8fafc', mx: 2, borderRadius: '16px', mb: 3 }}>
            <SettingRow 
              icon={Zap} 
              title={t('smartNotifications')} 
              subtitle={t('pulseLearns')}
            >
              <Switch
                checked={smartNotifications}
                onChange={(e) => setSmartNotifications(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
                }}
              />
            </SettingRow>
          </Box>

          {/* Lock-Screen Actions */}
          <Box sx={{ px: 2, mb: 1 }}>
            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              Lock-Screen Actions
            </Typography>
          </Box>
          <Box sx={{ backgroundColor: '#f8fafc', mx: 2, borderRadius: '16px', overflow: 'hidden' }}>
            <SettingRow 
              icon={Smartphone} 
              title="Enable lock-screen actions" 
              subtitle="Quick actions without opening the app"
            >
              <Switch
                checked={lockScreenEnabled}
                onChange={(e) => setLockScreenEnabled(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
                }}
              />
            </SettingRow>
            
            {lockScreenEnabled && (
              <>
                <Divider sx={{ mx: 2 }} />
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Box sx={{ pl: 4.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      { key: 'likeBack', icon: ThumbsUp, label: 'Like back' },
                      { key: 'reply', icon: Reply, label: 'Reply' },
                      { key: 'ignore', icon: X, label: 'Ignore' },
                      { key: 'remindLater', icon: AlarmClock, label: 'Remind me later' },
                    ].map((action) => (
                      <Box
                        key={action.key}
                        onClick={() => setLockScreenActions({
                          ...lockScreenActions,
                          [action.key]: !lockScreenActions[action.key],
                        })}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: lockScreenActions[action.key] ? 'rgba(108,92,231,0.08)' : 'transparent',
                          '&:hover': {
                            backgroundColor: lockScreenActions[action.key] ? 'rgba(108,92,231,0.12)' : 'rgba(0,0,0,0.03)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <action.icon size={16} color={lockScreenActions[action.key] ? '#6C5CE7' : '#94a3b8'} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: lockScreenActions[action.key] ? '#6C5CE7' : '#64748b',
                              fontWeight: lockScreenActions[action.key] ? 500 : 400,
                            }}
                          >
                            {action.label}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '4px',
                            backgroundColor: lockScreenActions[action.key] ? '#6C5CE7' : 'transparent',
                            border: lockScreenActions[action.key] ? 'none' : '2px solid rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {lockScreenActions[action.key] && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </Box>

          {/* Info */}
          <Box sx={{ mt: 3, mx: 2, p: 2, backgroundColor: '#f8fafc', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              💡 Lock-screen actions help you respond quickly without opening the app, reducing interruptions.
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default NotificationSettingsScreen;
