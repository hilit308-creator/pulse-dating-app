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

import React, { useState, useCallback } from 'react';
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
import { deleteAccount, apiCall } from '../services/authApi';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

const AccountSettingsScreen = () => {
  const navigate = useNavigate();
  const { logout, accessToken, user } = useAuth();
  
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
  const [language, setLanguage] = useState('English');
  const [units, setUnits] = useState('Metric (km)');
  const [audioTranscription, setAudioTranscription] = useState(false);
  
  // Mock blocked users
  const [blockedUsers] = useState([
    { id: 1, name: 'Alex', avatar: null },
    { id: 2, name: 'Jordan', avatar: null },
  ]);

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
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowLeft size={22} color="#1a1a2e" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          Settings
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
          <SectionHeader icon={User} title="Account" />
          <SectionContainer>
            <MenuItem
              icon={Phone}
              label="Phone number"
              value={user?.phoneE164 || '+972 ••• •••'}
              onClick={() => setShowPhoneDialog(true)}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Mail}
              label="Email"
              value={user?.email || 'Not set'}
              onClick={() => setShowEmailDialog(true)}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={ExternalLink}
              label="Connected accounts"
              sublabel="Google, Apple"
              onClick={() => setSnackbar({ open: true, message: 'Social connections coming soon' })}
            />
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              2. PROFILE & VISIBILITY
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Eye} title="Profile & Visibility" />
          <SectionContainer>
            {/* Visibility Mode */}
            <Box sx={{ py: 1.75, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Eye size={20} color="#64748b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    Visibility Mode
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    When you're present to others
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, pl: 4.5 }}>
                {[
                  { key: 'always', label: 'Always visible' },
                  { key: 'selected_times', label: 'Selected times' },
                  { key: 'selected_places', label: 'Selected places' },
                  { key: 'paused', label: 'Paused' },
                ].map((opt) => (
                  <Chip
                    key={opt.key}
                    label={opt.label}
                    size="small"
                    onClick={() => setVisibilityMode(opt.key)}
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
              label="Location-based visibility"
              sublabel="Areas to hide or show yourself"
              onClick={() => navigate('/settings/location-visibility')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Clock}
              label="Time-based visibility"
              sublabel="Set active hours"
              onClick={() => navigate('/settings/time-visibility')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Users}
              label="Contacts visibility"
              sublabel="Hide from specific contacts"
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
              Your profile is paused. Existing matches & chats still work.
            </Alert>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              3. NOTIFICATIONS
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Bell} title="Notifications" />
          <SectionContainer>
            <MenuItem
              icon={Bell}
              label="Notification settings"
              sublabel="Matches, messages, quiet hours, lock-screen"
              onClick={() => navigate('/settings/notifications')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Heart}
              label="Match notifications"
              value={matchNotifications === 'always' ? 'Always' : 'Custom'}
              onClick={() => navigate('/settings/notifications')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={MessageCircle}
              label="Message notifications"
              value={messageNotifications === 'always' ? 'Always' : 'Custom'}
              onClick={() => navigate('/settings/notifications')}
            />
            <Divider sx={{ mx: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.75, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Clock size={20} color="#64748b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    Quiet hours
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    No notifications during set times
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
                    Smart notifications
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Pulse learns the best time to reach you
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
          <SectionHeader icon={Heart} title="Matching Preferences" />
          <SectionContainer>
            <Box sx={{ py: 1.75, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <User size={20} color="#64748b" />
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    Age range
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
                This helps us suggest more relevant connections.
              </Typography>
            </Box>
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              5. SAFETY & TRUST
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Shield} title="Safety & Trust" />
          <SectionContainer>
            <MenuItem
              icon={UserX}
              label="Blocked users"
              value={blockedUsers.length > 0 ? `${blockedUsers.length}` : '0'}
              onClick={() => navigate('/settings/blocked-users')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Flag}
              label="Report a problem"
              onClick={() => window.open('mailto:support@pulse.dating?subject=Problem%20Report', '_blank')}
            />
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              6. PRIVACY & DATA
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Lock} title="Privacy & Data" />
          <SectionContainer>
            <MenuItem
              icon={Eye}
              label="Profile visibility"
              sublabel="Control what's shown on your profile"
              onClick={() => navigate('/profile')}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Download}
              label="Download my data"
              onClick={() => setShowDataDownloadDialog(true)}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Lock}
              label="Privacy preferences"
              onClick={() => navigate('/settings/location-visibility')}
            />
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              7. APP PREFERENCES
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Settings} title="App Preferences" />
          <SectionContainer>
            <MenuItem
              icon={Globe}
              label="Language"
              value={language}
              onClick={() => setShowLanguageDialog(true)}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={MapPin}
              label="Units of measurement"
              value={units}
              onClick={() => setShowUnitsDialog(true)}
            />
            <Divider sx={{ mx: 2 }} />
            <MenuItem
              icon={Accessibility}
              label="Accessibility"
              onClick={() => setSnackbar({ open: true, message: 'Accessibility settings coming soon' })}
            />
            <Divider sx={{ mx: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.75, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MessageCircle size={20} color="#64748b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    Audio transcription
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Transcribe voice messages
                  </Typography>
                </Box>
              </Box>
              <Switch
                size="small"
                checked={audioTranscription}
                onChange={(e) => setAudioTranscription(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
                }}
              />
            </Box>
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              8. SUBSCRIPTIONS
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={CreditCard} title="Subscriptions" />
          <SectionContainer highlighted>
            <MenuItem
              icon={CreditCard}
              label="Pulse Premium"
              sublabel="Unlock all features"
              onClick={() => navigate('/business-upgrade')}
            />
          </SectionContainer>

          {/* ═══════════════════════════════════════════════════════════════
              9. INVITE & GROWTH
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader icon={Share2} title="Invite & Growth" />
          <SectionContainer>
            <Box sx={{ py: 2, px: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                Pulse works best when people you trust are around.
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
                Share Pulse
              </Button>
            </Box>
            <Divider sx={{ mx: 2 }} />
            {/* Friends Joined Through You */}
            <Box sx={{ py: 2, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Users size={20} color="#64748b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                    Friends joined through you
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    People who signed up with your invite
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
          <SectionHeader icon={HelpCircle} title="Help & Legal" />
          <SectionContainer>
            <MenuItem icon={HelpCircle} label="Help Center" onClick={() => window.open('https://help.pulse.dating', '_blank')} />
            <Divider sx={{ mx: 2 }} />
            <MenuItem icon={Shield} label="Safety Tips" onClick={() => window.open('https://pulse.dating/safety', '_blank')} />
            <Divider sx={{ mx: 2 }} />
            <MenuItem icon={Users} label="Community Guidelines" onClick={() => window.open('https://pulse.dating/guidelines', '_blank')} />
            <Divider sx={{ mx: 2 }} />
            <MenuItem icon={FileText} label="Privacy Policy" onClick={() => window.open('https://pulse.dating/privacy', '_blank')} />
            <Divider sx={{ mx: 2 }} />
            <MenuItem icon={FileText} label="Terms of Service" onClick={() => window.open('https://pulse.dating/terms', '_blank')} />
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
                    Pause account
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Hide without losing connections
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
            <MenuItem icon={LogOut} label="Log out" onClick={handleLogoutClick} />
          </SectionContainer>

          {/* Danger Zone */}
          <SectionHeader icon={AlertTriangle} title="Danger Zone" color="#ef4444" />
          <SectionContainer danger>
            <MenuItem
              icon={Trash2}
              label="Delete account"
              sublabel="This action is permanent"
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
          Log out?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Are you sure you want to log out of your account?
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
            Log out
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
            Cancel
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
            Delete account
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            This action is permanent and cannot be undone. All your data will be deleted.
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
              'Delete account'
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
            Cancel
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
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Language</DialogTitle>
        <DialogContent>
          <RadioGroup value={language} onChange={(e) => setLanguage(e.target.value)}>
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
              setShowLanguageDialog(false);
              setSnackbar({ open: true, message: `Language set to ${language}` });
            }}
            sx={{ borderRadius: '12px', textTransform: 'none', py: 1.5, background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)' }}
          >
            Save
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
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Units of Measurement</DialogTitle>
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
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Download Dialog */}
      <Dialog
        open={showDataDownloadDialog}
        onClose={() => setShowDataDownloadDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Download Your Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Request a copy of your personal data. This includes your profile, matches, messages, and activity.
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            We'll send you an email with a download link within 48 hours.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={() => {
              setShowDataDownloadDialog(false);
              setSnackbar({ open: true, message: 'Data request submitted. Check your email in 48 hours.' });
            }}
            sx={{ borderRadius: '12px', textTransform: 'none', py: 1.5, background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)' }}
          >
            Request Data
          </Button>
          <Button fullWidth variant="text" onClick={() => setShowDataDownloadDialog(false)} sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}>
            Cancel
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
