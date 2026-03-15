/**
 * AccountSettingsScreen - Comprehensive Settings Hub
 * 
 * Spec: מסך ה-Settings ב-Pulse אינו לוח בקרה טכני, אלא המשך ישיר של 
 * תחושת השליטה, הביטחון והבחירה של המשתמש.
 * 
 * Sections:
 * 1. Account
 * 2. Profile & Visibility
 * 3. Notifications
 * 4. Matching Preferences
 * 5. Safety & Trust
 * 6. Privacy & Data
 * 7. App Preferences
 * 8. Subscriptions
 * 9. Invite & Growth
 * 10. Help & Legal
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Alert,
  Switch,
  Slider,
  Chip,
  Avatar,
  TextField,
  Snackbar,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  KeyRound,
  LogOut,
  Trash2,
  ChevronRight,
  Coins,
  Circle,
  AlertTriangle,
  User,
  Shield,
  Eye,
  EyeOff,
  Bell,
  Heart,
  Lock,
  Settings,
  CreditCard,
  Share2,
  HelpCircle,
  MapPin,
  Clock,
  Users,
  Pause,
  Phone,
  Mail,
  ExternalLink,
  Download,
  Globe,
  Accessibility,
  FileText,
  MessageCircle,
  UserX,
  Flag,
  Copy,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { deleteAccount, apiCall } from '../services/authApi';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

const AccountSettingsScreen = () => {
  const navigate = useNavigate();
  const { logout, accessToken, user } = useAuth();
  const { language, setLanguage: setGlobalLanguage, t, isRTL } = useLanguage();
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showAgeRangeDialog, setShowAgeRangeDialog] = useState(false);
  const [showBlockedUsersDialog, setShowBlockedUsersDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showUnitsDialog, setShowUnitsDialog] = useState(false);
  const [showDataDownloadDialog, setShowDataDownloadDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  // Loading & error states
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  
  // Settings states
  const [pauseMode, setPauseMode] = useState(user?.pauseMode || false);
  const [visibilityMode, setVisibilityMode] = useState('always'); // always, selected_times, selected_places, paused
  const [ageRange, setAgeRange] = useState([22, 35]);
  const [matchNotifications, setMatchNotifications] = useState('always');
  const [messageNotifications, setMessageNotifications] = useState('always');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [smartNotifications, setSmartNotifications] = useState(true);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [units, setUnits] = useState('Metric (km)');
  const [audioTranscription, setAudioTranscription] = useState(() => {
    const saved = localStorage.getItem('pulse_audio_transcription');
    return saved === 'true';
  });
  
  // Get blocked users from localStorage
  const [blockedUsers, setBlockedUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_blocked_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Refresh blocked users when screen is focused
  useEffect(() => {
    const handleFocus = () => {
      try {
        const saved = localStorage.getItem('pulse_blocked_users');
        setBlockedUsers(saved ? JSON.parse(saved) : []);
      } catch {}
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePauseModeToggle = () => {
    if (!pauseMode) {
      setShowPauseDialog(true);
    } else {
      setPauseMode(false);
      trackEvent('pause_mode_toggled', { enabled: false });
    }
  };

  const handlePauseConfirm = () => {
    setPauseMode(true);
    setShowPauseDialog(false);
    trackEvent('pause_mode_toggled', { enabled: true });
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = useCallback(() => {
    trackEvent('logout_clicked');
    logout();
    navigate('/auth/welcome', { replace: true });
  }, [logout, navigate]);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };
  
  const handleShare = (method) => {
    const shareText = "Join me on Pulse - the dating app that respects your time and space.";
    const shareUrl = "https://pulse.dating/invite/abc123";
    
    if (method === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      trackEvent('invite_link_copied');
    } else if (method === 'native' && navigator.share) {
      navigator.share({ title: 'Pulse', text: shareText, url: shareUrl });
    }
    setShowInviteDialog(false);
  };

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      await apiCall(deleteAccount, accessToken);
      
      trackEvent('account_deleted');
      
      // Logout and redirect
      logout();
      navigate('/auth/welcome', { replace: true });
    } catch (err) {
      if (err.code === 'no_internet') {
        setError('No internet connection. Please try again.');
      } else {
        setError('Failed to delete account. Please try again.');
      }
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  }, [accessToken, logout, navigate]);

  // Menu item component
  const MenuItem = ({ icon: Icon, label, sublabel, onClick, danger = false, value, rightElement }) => (
    <Button
      fullWidth
      onClick={onClick}
      sx={{
        justifyContent: 'space-between',
        py: 1.75,
        px: 2,
        textTransform: 'none',
        color: danger ? '#ef4444' : '#1a1a2e',
        '&:hover': {
          backgroundColor: danger ? 'rgba(239,68,68,0.05)' : 'rgba(0,0,0,0.03)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Icon size={20} color={danger ? '#ef4444' : '#64748b'} />
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: danger ? '#ef4444' : '#1a1a2e',
              textAlign: 'left',
            }}
          >
            {label}
          </Typography>
          {sublabel && (
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', textAlign: 'left' }}>
              {sublabel}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {value && (
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            {value}
          </Typography>
        )}
        {rightElement || <ChevronRight size={18} color={danger ? '#ef4444' : '#94a3b8'} />}
      </Box>
    </Button>
  );

  // Section header component
  const SectionHeader = ({ icon: Icon, title, color = '#94a3b8' }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, mb: 1 }}>
      <Icon size={14} color={color} />
      <Typography
        variant="overline"
        sx={{ color, fontWeight: 600, letterSpacing: 1, fontSize: '0.65rem' }}
      >
        {title}
      </Typography>
    </Box>
  );

  // Section container component
  const SectionContainer = ({ children, danger = false, highlighted = false }) => (
    <Box
      sx={{
        backgroundColor: danger ? 'rgba(239,68,68,0.03)' : highlighted ? 'rgba(108,92,231,0.03)' : '#f8fafc',
        borderRadius: '16px',
        border: danger ? '1px solid rgba(239,68,68,0.1)' : highlighted ? '1px solid rgba(108,92,231,0.1)' : 'none',
        overflow: 'hidden',
        mb: 2.5,
      }}
    >
      {children}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        pb: 4,
        position: 'relative',
      }}
    >
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
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {t('settings')}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: 2, pt: 2, overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Error message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, borderRadius: '12px' }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              1. ACCOUNT
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={User} title={t('account')} />
          <SectionContainer>
            <MenuItem
              icon={KeyRound}
              label={t('account')}
              sublabel={t('emailConnectedAccounts') || 'Email, connected accounts'}
              onClick={() => navigate('/settings/account')}
            />
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              2. PROFILE & VISIBILITY
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Eye} title={t('profileVisibility')} />
          
          {/* Current Visibility Status */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.5,
              mb: 2,
              backgroundColor: pauseMode ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
              borderRadius: '12px',
              border: `1px solid ${pauseMode ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: pauseMode ? '#ef4444' : '#22c55e',
                boxShadow: `0 0 8px ${pauseMode ? '#ef4444' : '#22c55e'}60`,
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500, color: pauseMode ? '#ef4444' : '#22c55e' }}>
              {pauseMode 
                ? (t('pausedHiddenEverywhere') || "Paused — you're hidden everywhere")
                : (t('visibleNow') || 'Visible now')}
            </Typography>
          </Box>
          
          <SectionContainer>
            {/* Visibility Mode */}
            <Box sx={{ py: 1.75, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Eye size={20} color="#64748b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    {t('visibilityMode')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {t('whenYouArePresent')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, pl: 4.5 }}>
                {[
                  { key: 'always', label: t('alwaysVisible') },
                  { key: 'selected_times', label: t('selectedTimes') },
                  { key: 'paused', label: t('paused') },
                ].map((opt) => (
                  <Chip
                    key={opt.key}
                    label={opt.label}
                    size="small"
                    onClick={() => {
                      setVisibilityMode(opt.key);
                      if (opt.key === 'paused') {
                        setPauseMode(true);
                        setSnackbar({ open: true, message: t('profilePaused') });
                      } else {
                        setPauseMode(false);
                        if (opt.key === 'selected_times') {
                          navigate('/settings/time-visibility');
                        } else {
                          setSnackbar({ open: true, message: t('visibilityUpdated') });
                        }
                      }
                    }}
                    sx={{
                      backgroundColor: visibilityMode === opt.key ? '#6C5CE7' : 'rgba(0,0,0,0.06)',
                      color: visibilityMode === opt.key ? '#fff' : '#64748b',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      '&:hover': {
                        backgroundColor: visibilityMode === opt.key ? '#5b4cdb' : 'rgba(0,0,0,0.1)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={MapPin}
              label={t('locationBasedVisibility')}
              sublabel={t('areasToHideOrShow')}
              onClick={() => navigate('/settings/location-visibility')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Clock}
              label={t('timeBasedVisibility')}
              sublabel={t('setActiveHours')}
              onClick={() => navigate('/settings/time-visibility')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Users}
              label={t('contactsVisibility')}
              sublabel={t('hideFromContacts')}
              onClick={() => navigate('/settings/contacts-visibility')}
            />
          </SectionContainer>

          {/* Pause Account Card */}
          {pauseMode && (
            <Alert 
              severity="info" 
              sx={{ mb: 2.5, borderRadius: '12px' }}
              icon={<Pause size={18} />}
            >
              {t('profilePausedInfo')}
            </Alert>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              3. NOTIFICATIONS
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Bell} title={t('notifications')} />
          <SectionContainer>
            <MenuItem
              icon={Bell}
              label={t('notificationSettings')}
              sublabel={t('notificationsSubtitle')}
              onClick={() => navigate('/settings/notifications')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Heart}
              label={t('matchNotifications')}
              value={matchNotifications === 'always' ? 'Always' : 'Custom'}
              onClick={() => navigate('/settings/notifications')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={MessageCircle}
              label={t('messageNotifications')}
              value={messageNotifications === 'always' ? 'Always' : 'Custom'}
              onClick={() => navigate('/settings/notifications')}
            />
            <Divider sx={{ mx: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.75, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Clock size={20} color="#64748b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    {t('quietHours')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {t('noNotificationsDuringSetTimes')}
                  </Typography>
                </Box>
              </Box>
              <Switch
                size="small"
                checked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
                }}
              />
            </Box>
            <Divider sx={{ mx: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.75, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Settings size={20} color="#64748b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    {t('smartNotifications')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {t('pulseLearns')}
                  </Typography>
                </Box>
              </Box>
              <Switch
                size="small"
                checked={smartNotifications}
                onChange={(e) => setSmartNotifications(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
                }}
              />
            </Box>
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              4. MATCHING PREFERENCES
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Heart} title={t('matchingPreferences')} />
          <SectionContainer>
            <Box sx={{ py: 1.75, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <User size={20} color="#64748b" />
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    {t('ageRange')}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
                  {ageRange[0]} - {ageRange[1]}
                </Typography>
              </Box>
              <Box sx={{ px: 1, pl: 4.5 }}>
                <Slider
                  value={ageRange}
                  onChange={(e, newValue) => setAgeRange(newValue)}
                  min={18}
                  max={65}
                  valueLabelDisplay="auto"
                  sx={{
                    color: '#6C5CE7',
                    '& .MuiSlider-thumb': { width: 18, height: 18 },
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', pl: 4.5 }}>
                {t('ageRangeHelp')}
              </Typography>
            </Box>
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              5. MEETINGS & SAFETY
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Shield} title={t('meetingsSafety') || 'Meetings & Safety'} />
          <SectionContainer>
            <MenuItem
              icon={Users}
              label={t('meetingContacts') || 'Meeting Contacts'}
              sublabel={t('meetingContactsSubtitle') || 'Set up contacts for safety during meetings'}
              onClick={() => navigate('/settings/meetings-safety')}
            />
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              6. SAFETY & TRUST
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Shield} title={t('safetyTrust')} />
          <SectionContainer>
            <MenuItem
              icon={UserX}
              label={t('blockedUsers')}
              value={blockedUsers.length > 0 ? `${blockedUsers.length}` : '0'}
              onClick={() => navigate('/settings/blocked-users')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Flag}
              label={t('reportProblem')}
              onClick={() => navigate('/settings/report-problem')}
            />
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              6. PRIVACY & DATA
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Lock} title={t('privacyData')} />
          <SectionContainer>
            <MenuItem
              icon={Eye}
              label={t('profileVisibilityControl')}
              sublabel={t('controlWhatsShown')}
              onClick={() => navigate('/profile')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Download}
              label={t('downloadMyData')}
              sublabel={t('downloadMyDataSubtitle')}
              onClick={() => setShowDataDownloadDialog(true)}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Lock}
              label={t('privacyPreferences')}
              onClick={() => navigate('/settings/location-visibility')}
            />
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              7. APP PREFERENCES
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Settings} title={t('appPreferences')} />
          <SectionContainer>
            <MenuItem
              icon={Globe}
              label={t('language')}
              value={language}
              onClick={() => setShowLanguageDialog(true)}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={MapPin}
              label={t('unitsOfMeasurement')}
              value={units}
              onClick={() => setShowUnitsDialog(true)}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Accessibility}
              label={t('accessibility')}
              onClick={() => navigate('/accessibility')}
            />
            <Divider sx={{ mx: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.75, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MessageCircle size={20} color="#64748b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    {t('audioTranscription')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {t('transcribeVoiceMessages')}
                  </Typography>
                </Box>
              </Box>
              <Switch
                size="small"
                checked={audioTranscription}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setAudioTranscription(newValue);
                  localStorage.setItem('pulse_audio_transcription', newValue.toString());
                  setSnackbar({ open: true, message: newValue ? t('audioTranscriptionEnabled') : t('audioTranscriptionDisabled') });
                }}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
                }}
              />
            </Box>
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              8. SUBSCRIPTIONS & POINTS
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={CreditCard} title={t('subscriptions')} />
          <SectionContainer highlighted>
            <MenuItem
              icon={CreditCard}
              label={t('pulsePremium')}
              sublabel={t('unlockAllFeatures')}
              onClick={() => navigate('/subscriptions')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Coins}
              label={t('yourPoints') || 'Your Points'}
              sublabel={t('boostFeatures') || 'Boost your profile temporarily'}
              onClick={() => navigate('/points')}
            />
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              9. INVITE & GROWTH
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Share2} title={t('inviteGrowth')} />
          <SectionContainer>
            <Box sx={{ py: 2, px: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                {t('pulseWorksBest')}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Share2 size={18} />}
                onClick={() => setShowInviteDialog(true)}
                sx={{
                  py: 1.25,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                }}
              >
                {t('sharePulse')}
              </Button>
            </Box>
            <Divider sx={{ mx: 2 }} />
            {/* Friends Joined Through You */}
            <Box sx={{ py: 2, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Users size={20} color="#64748b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    {t('friendsJoined')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {t('peopleWhoSignedUp')}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: 'rgba(108,92,231,0.1)',
                  borderRadius: '8px',
                }}
              >
                <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
                  3
                </Typography>
              </Box>
            </Box>
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              10. HELP & LEGAL
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={HelpCircle} title={t('helpLegal')} />
          <SectionContainer>
            <MenuItem icon={HelpCircle} label={t('helpCenter')} onClick={() => navigate('/help-center')} />
            <Divider sx={{ mx: 2 }} />
            <MenuItem icon={Shield} label={t('safetyTips')} onClick={() => navigate('/safety-tips')} />
            <Divider sx={{ mx: 2 }} />
            <MenuItem icon={Users} label={t('communityGuidelines')} onClick={() => navigate('/community-guidelines')} />
            <Divider sx={{ mx: 2 }} />
            <MenuItem icon={FileText} label={t('privacyPolicy')} onClick={() => navigate('/privacy-policy')} />
            <Divider sx={{ mx: 2 }} />
            <MenuItem icon={FileText} label={t('termsOfService')} onClick={() => navigate('/terms-of-service')} />
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              ACCOUNT ACTIONS
          ═══════════════════════════════════════════════════════════════ */}
          <SectionContainer>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.75, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Pause size={20} color="#64748b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    {t('pauseAccount')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {t('hideWithoutLosing')}
                  </Typography>
                </Box>
              </Box>
              <Switch
                size="small"
                checked={pauseMode}
                onChange={handlePauseModeToggle}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
                }}
              />
            </Box>
            <Divider sx={{ mx: 2 }} />
            <MenuItem icon={LogOut} label={t('logOut')} onClick={handleLogoutClick} />
          </SectionContainer>

          {/* Danger Zone */}
          <SectionHeader icon={AlertTriangle} title={t('dangerZone')} color="#ef4444" />
          <SectionContainer danger>
            <MenuItem
              icon={Trash2}
              label={t('deleteAccount')}
              sublabel={t('thisActionIsPermanent')}
              onClick={handleDeleteClick}
              danger
            />
          </SectionContainer>

          {/* Version info */}
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
              Pulse v1.0.0
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            maxWidth: 340,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {t('logOutQuestion')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {t('logOutConfirmation')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogoutConfirm}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              py: 1.5,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            {t('logOut')}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowLogoutDialog(false)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: '#64748b',
            }}
          >
            {t('cancel')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => !isDeleting && setShowDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            maxWidth: 340,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: '#ef4444' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AlertTriangle size={24} />
            {t('deleteAccount')}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {t('deleteAccountWarning')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              py: 1.5,
              backgroundColor: '#ef4444',
              '&:hover': {
                backgroundColor: '#dc2626',
              },
            }}
          >
            {isDeleting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('deleteAccount')
            )}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowDeleteDialog(false)}
            disabled={isDeleting}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              color: '#64748b',
            }}
          >
            {t('cancel')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pause Account Dialog */}
      <Dialog
        open={showPauseDialog}
        onClose={() => setShowPauseDialog(false)}
        PaperProps={{
          sx: { borderRadius: '20px', p: 1, maxWidth: 340 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Pause your profile?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Pausing hides your profile without losing existing connections. Your matches and chats will still be available.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handlePauseConfirm}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              py: 1.5,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Pause profile
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowPauseDialog(false)}
            sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Blocked Users Dialog */}
      <Dialog
        open={showBlockedUsersDialog}
        onClose={() => setShowBlockedUsersDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: '20px', p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Blocked Users
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Blocked users can't see or interact with you on Pulse.
          </Typography>
          {blockedUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <UserX size={40} color="#cbd5e1" />
              <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
                No blocked users
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {blockedUsers.map((user) => (
                <Box
                  key={user.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#e2e8f0' }}>
                      {user.name[0]}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user.name}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    sx={{ textTransform: 'none', color: '#6C5CE7' }}
                  >
                    Unblock
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowBlockedUsersDialog(false)}
            sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Friends Dialog */}
      <Dialog
        open={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: '20px', p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Invite Friends
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Pulse works best when people you trust are around.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                window.open('https://wa.me/?text=Join%20me%20on%20Pulse%20-%20https://pulse.dating/invite/abc123', '_blank');
                setShowInviteDialog(false);
              }}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                borderColor: '#25D366',
                color: '#25D366',
                '&:hover': { backgroundColor: 'rgba(37,211,102,0.08)', borderColor: '#25D366' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Box>
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                window.open('sms:?body=Join%20me%20on%20Pulse%20-%20https://pulse.dating/invite/abc123', '_blank');
                setShowInviteDialog(false);
              }}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                borderColor: 'rgba(0,0,0,0.12)',
                color: '#1a1a2e',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <MessageCircle size={18} />
                SMS
              </Box>
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Smartphone size={18} />}
              onClick={() => handleShare('native')}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                borderColor: 'rgba(0,0,0,0.12)',
                color: '#1a1a2e',
              }}
            >
              Share via...
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Copy size={18} />}
              onClick={() => handleShare('copy')}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                borderColor: 'rgba(0,0,0,0.12)',
                color: '#1a1a2e',
              }}
            >
              Copy link
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowInviteDialog(false)}
            sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Phone Number Dialog */}
      <Dialog
        open={showPhoneDialog}
        onClose={() => setShowPhoneDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Phone Number</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Your phone number is used for verification and account recovery.
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={user?.phoneE164 || '+972 ••• •••'}
            disabled
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <Typography variant="caption" sx={{ color: '#94a3b8', mt: 1, display: 'block' }}>
            Contact support to change your phone number.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button fullWidth variant="text" onClick={() => setShowPhoneDialog(false)} sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      <Dialog
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Email Address</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Your email is used for important account notifications.
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter email address"
            defaultValue={user?.email || ''}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setShowEmailDialog(false);
              setSnackbar({ open: true, message: 'Email updated' });
            }}
            sx={{ borderRadius: '12px', textTransform: 'none', py: 1.5, background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)' }}
          >
            Save
          </Button>
          <Button fullWidth variant="text" onClick={() => setShowEmailDialog(false)} sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Language Dialog */}
      <Dialog
        open={showLanguageDialog}
        onClose={() => setShowLanguageDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{t('language')}</DialogTitle>
        <DialogContent>
          <RadioGroup value={tempLanguage} onChange={(e) => setTempLanguage(e.target.value)}>
            {['English', 'עברית', 'Español', 'Français', 'Deutsch'].map((lang) => (
              <FormControlLabel
                key={lang}
                value={lang}
                control={<Radio sx={{ '&.Mui-checked': { color: '#6C5CE7' } }} />}
                label={lang}
                sx={{ py: 0.5, '& .MuiFormControlLabel-label': { fontWeight: 500 } }}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setGlobalLanguage(tempLanguage);
              setShowLanguageDialog(false);
              setSnackbar({ open: true, message: t('languageUpdated') });
            }}
            sx={{ borderRadius: '12px', textTransform: 'none', py: 1.5, background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)' }}
          >
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Units Dialog */}
      <Dialog
        open={showUnitsDialog}
        onClose={() => setShowUnitsDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{t('unitsOfMeasurement')}</DialogTitle>
        <DialogContent>
          <RadioGroup value={units} onChange={(e) => setUnits(e.target.value)}>
            {['Metric (km)', 'Imperial (miles)'].map((unit) => (
              <FormControlLabel
                key={unit}
                value={unit}
                control={<Radio sx={{ '&.Mui-checked': { color: '#6C5CE7' } }} />}
                label={unit}
                sx={{ py: 0.5, '& .MuiFormControlLabel-label': { fontWeight: 500 } }}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setShowUnitsDialog(false);
              setSnackbar({ open: true, message: `Units set to ${units}` });
            }}
            sx={{ borderRadius: '12px', textTransform: 'none', py: 1.5, background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)' }}
          >
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Download Dialog - Professional GDPR Compliant */}
      <Dialog
        open={showDataDownloadDialog}
        onClose={() => setShowDataDownloadDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Download size={20} color="#fff" />
          </Box>
          {t('downloadYourData')}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            {t('downloadDataDescription')}
          </Typography>
          
          {/* Data Categories */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>
            {t('includedData')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            {[
              { icon: User, label: t('profileInfo'), desc: t('profileInfoDesc') },
              { icon: Heart, label: t('matchesLikes'), desc: t('matchesLikesDesc') },
              { icon: MessageCircle, label: t('messagesChats'), desc: t('messagesChatsDesc') },
              { icon: MapPin, label: t('activityLocation'), desc: t('activityLocationDesc') },
            ].map((item, idx) => (
              <Box key={idx} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                p: 1.5, 
                borderRadius: '12px',
                backgroundColor: '#f8fafc'
              }}>
                <Box sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '10px', 
                  backgroundColor: 'rgba(108,92,231,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <item.icon size={18} color="#6C5CE7" />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Format Selection */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
            {t('fileFormat')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip 
              label="JSON" 
              size="small"
              sx={{ 
                backgroundColor: '#6C5CE7', 
                color: '#fff',
                fontWeight: 500,
              }} 
            />
            <Chip 
              label="CSV" 
              size="small"
              variant="outlined"
              sx={{ 
                borderColor: '#e2e8f0',
                color: '#64748b',
                fontWeight: 500,
              }} 
            />
          </Box>

          {/* Processing Time Notice */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            p: 2, 
            borderRadius: '12px',
            backgroundColor: 'rgba(108,92,231,0.05)',
            border: '1px solid rgba(108,92,231,0.1)'
          }}>
            <Clock size={18} color="#6C5CE7" />
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {t('dataRequestTime')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={() => {
              setShowDataDownloadDialog(false);
              setSnackbar({ open: true, message: t('dataRequestSubmitted') });
            }}
            sx={{ 
              borderRadius: '12px', 
              textTransform: 'none', 
              py: 1.5, 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              boxShadow: '0 4px 14px rgba(108,92,231,0.4)',
            }}
          >
            {t('requestMyData')}
          </Button>
          <Button 
            fullWidth 
            variant="text" 
            onClick={() => setShowDataDownloadDialog(false)} 
            sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}
          >
            {t('cancel')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: '12px',
            backgroundColor: '#1a1a2e',
          },
        }}
      />
    </Box>
  );
};

export default AccountSettingsScreen;
