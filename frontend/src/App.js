import React from 'react';
import './index.css';
import './pages/global-theme.css';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Typography, Box, IconButton, Tooltip, Button } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Settings, CircleUser } from 'lucide-react';

// Auth
import { AuthProvider, useAuth, ONBOARDING_STATE, PERMISSION_STATE } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
// Activity (Response & Feedback Flow)
import { ActivityProvider } from './context/ActivityContext';
// Notifications System
import { NotificationsProvider } from './context/NotificationsContext';
import InAppNotificationBanner from './components/InAppNotificationBanner';
import {
  WelcomeScreen,
  PhoneInputScreen,
  OtpVerificationScreen,
  EnableLocationScreen,
  EnableNotificationsScreen,
  OnboardingScreen,
  AgeConfirmationScreen,
  PhotosUploadScreen,
  BioScreen,
  InterestsScreen,
  LookingForScreen,
  ProfileDetailsScreen,
  PromptsScreen,
  PhotoVerificationScreen,
  SocialConnectScreen,
  // Login screens (existing users)
  LoginScreen,
  LoginOtpVerificationScreen,
  LoginPhoneScreen,
  BusinessLoginScreen,
  // Password reset screens
  ForgotPasswordScreen,
  ResetPasswordOtpScreen,
  SetNewPasswordScreen,
  PasswordResetSuccessScreen,
} from './pages/auth';
import OAuthCallbackScreen from './pages/auth/OAuthCallbackScreen';

// Legacy components
import LandingPage from './components/LandingPage';
import Registration from './components/Registration';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import RegistrationSuccess from './components/RegistrationSuccess';
import ProfileCardDemo from './components/ProfileCardDemo';
import Home from './components/Home';
import Home1Screen from './pages/Home1Screen';
import HomeScreen from './pages/HomeScreen';
import BusinessPage from './pages/BusinessPage';
import TabNavigation from './components/TabNavigation';
import ChatScreen from './pages/ChatScreen';
import MatchesScreen from './pages/MatchesScreen';
import ExploreScreen from './pages/ExploreScreen';
import ProfileSettings from './pages/ProfileSettingsV2';
import EventsByCategory from './pages/EventsByCategory';
import AddEvent from './pages/AddEvent';
import NearbyScreen from './pages/NearbyScreen';
import ViewNearbyPeopleScreen from './pages/ViewNearbyPeopleScreen';
import EventPreviewScreen from './pages/EventPreviewScreen';
import ActivityResponseScreen from './pages/ActivityResponseScreen';
import AccountSettingsScreen from './pages/AccountSettingsScreen';
import UserProfileScreen from './pages/UserProfileScreen';
import PermissionsScreen from './pages/PermissionsScreen';
import BusinessUpgradeScreen from './pages/BusinessUpgradeScreen';
import MyEventsScreen from './pages/MyEventsScreen';
import EventAttendeesScreen from './pages/EventAttendeesScreen';
import LocationVisibilityScreen from './pages/LocationVisibilityScreen';
import TimeVisibilityScreen from './pages/TimeVisibilityScreen';
import ContactsVisibilityScreen from './pages/ContactsVisibilityScreen';
import NotificationSettingsScreen from './pages/NotificationSettingsScreen';
import ChatScreenNew from './pages/ChatScreenNew';
import BlockedUsersScreen from './pages/BlockedUsersScreen';
import AccessibilityScreen from './pages/AccessibilityScreen';
import HelpCenterScreen from './pages/HelpCenterScreen';
import SafetyTipsScreen from './pages/SafetyTipsScreen';
import CommunityGuidelinesScreen from './pages/CommunityGuidelinesScreen';
import PrivacyPolicyScreen from './pages/PrivacyPolicyScreen';
import TermsOfServiceScreen from './pages/TermsOfServiceScreen';
import ConnectedAccountsScreen from './pages/ConnectedAccountsScreen';
import SubscriptionsScreen from './pages/SubscriptionsScreen';
import AccountScreen from './pages/AccountScreen';
import EmailEditScreen from './pages/EmailEditScreen';
import PointsHubScreen from './pages/PointsHubScreen';
import LikesYouScreen from './pages/LikesYouScreen';
import AdminDashboard from './pages/AdminDashboard';

// Global components
import { GlobalErrorProvider } from './components/GlobalErrorBanner';
import SessionExpiredModal from './components/SessionExpiredModal';

const theme = createTheme({
  palette: {
    primary: { main: '#ff4081' },
    secondary: { main: '#3f51b5' },
  },
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('App ErrorBoundary caught:', error, info);
    this.setState({ info });
  }
  handleRetry = () => {
    this.setState({ hasError: false, error: null, info: null });
  };
  handleGoHome = () => {
    window.location.href = '/home';
  };
  render() {
    if (this.state.hasError) {
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
              fontSize: 40,
            }}
          >
            ⚠️
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 4, maxWidth: 300 }}>
            We're sorry, but something unexpected happened. Please try again.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={this.handleRetry}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: '12px',
                backgroundColor: '#6C5CE7',
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#5b4cdb' },
              }}
            >
              Try Again
            </Button>
            <Button
              onClick={this.handleGoHome}
              variant="outlined"
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: '12px',
                borderColor: '#e2e8f0',
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { borderColor: '#cbd5e1', backgroundColor: 'rgba(0,0,0,0.02)' },
              }}
            >
              Go Home
            </Button>
          </Box>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box sx={{ mt: 4, p: 2, backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: '12px', maxWidth: 500, textAlign: 'left' }}>
              <Typography variant="caption" sx={{ color: '#ef4444', fontFamily: 'monospace', display: 'block' }}>
                {String(this.state.error)}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }
    return this.props.children;
  }
}

// Protected Route wrapper - redirects to auth if not logged in
function ProtectedRoute({ children }) {
  const { isLoggedIn, isOnboardingComplete, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth/welcome" state={{ from: location }} replace />;
  }

  if (!isOnboardingComplete) {
    return <Navigate to="/auth/onboarding" replace />;
  }

  return children;
}

// Smart Home Route - shows Home with tutorial modal for new users
function SmartHomeRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = React.useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = React.useState(() => {
    return localStorage.getItem('pulse_tutorial_seen') === 'true';
  });
  const [hasSeenWelcome, setHasSeenWelcome] = React.useState(() => {
    return sessionStorage.getItem('pulse_welcome_seen') === 'true';
  });
  
  // Check for redirect after login
  React.useEffect(() => {
    const redirectPath = sessionStorage.getItem('pulse_redirect_after_login');
    if (redirectPath) {
      sessionStorage.removeItem('pulse_redirect_after_login');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);
  
  // Check if user is new (first time using the app)
  const isNewUser = user?.isNewUser ?? !user?.lastLoginAt;
  
  // Show welcome popup on login (once per session)
  React.useEffect(() => {
    if (!hasSeenWelcome) {
      setShowWelcomePopup(true);
    }
  }, [hasSeenWelcome]);
  
  // Show tutorial automatically for new users who haven't seen it
  React.useEffect(() => {
    if (isNewUser && !hasSeenTutorial && !showWelcomePopup) {
      setShowTutorial(true);
    }
  }, [isNewUser, hasSeenTutorial, showWelcomePopup]);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    localStorage.setItem('pulse_tutorial_seen', 'true');
  };

  const handleOpenTutorial = () => {
    setShowTutorial(true);
  };

  const handleCloseWelcome = () => {
    setShowWelcomePopup(false);
    setHasSeenWelcome(true);
    sessionStorage.setItem('pulse_welcome_seen', 'true');
  };
  
  return (
    <>
      <Home onOpenTutorial={handleOpenTutorial} />
      <TutorialModal open={showTutorial} onClose={handleCloseTutorial} />
      <WelcomePopup open={showWelcomePopup} onClose={handleCloseWelcome} />
    </>
  );
}

// Welcome Popup - Shows Home1Screen content in a popup after login
function WelcomePopup({ open, onClose }) {
  if (!open) return null;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: '95%',
          maxWidth: 420,
          maxHeight: '85vh',
          backgroundColor: '#fff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
          color: '#fff',
        }}>
          <Typography sx={{ fontSize: 48, mb: 1 }}>✨</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Welcome to Pulse!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            Swipe with purpose
          </Typography>
        </Box>
        
        {/* Content */}
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          {/* Feature 1 */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '12px',
              background: 'rgba(108,92,231,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Typography sx={{ fontSize: 24 }}>📍</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Discover Nearby
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Find people around you in real-time
              </Typography>
            </Box>
          </Box>
          
          {/* Feature 2 */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '12px',
              background: 'rgba(34,197,94,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Typography sx={{ fontSize: 24 }}>🎉</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Join Events
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Meet new people at local events
              </Typography>
            </Box>
          </Box>
          
          {/* Feature 3 */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '12px',
              background: 'rgba(236,72,153,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Typography sx={{ fontSize: 24 }}>💬</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Real Conversations
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Chat with your matches instantly
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* CTA */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onClose}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Let's Go! 🚀
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// Tutorial Modal - Onboarding/Help screen
function TutorialModal({ open, onClose }) {
  const [step, setStep] = React.useState(0);
  
  const steps = [
    {
      icon: '👋',
      title: 'ברוכים הבאים ל-Pulse!',
      description: 'גלה חיבורים אמיתיים עם אנשים בסביבתך. Pulse מחבר אותך לאנשים קרובים אליך בזמן אמת.',
    },
    {
      icon: '📍',
      title: 'מיקום',
      description: 'Pulse משתמש במיקום שלך כדי להראות לך אנשים בסביבה. המיקום המדויק שלך לעולם לא מוצג.',
    },
    {
      icon: '👆',
      title: 'החלק ימינה או שמאלה',
      description: 'החלק ימינה כדי לעשות לייק, שמאלה כדי לדלג. לחץ על התמונה כדי לראות עוד תמונות.',
    },
    {
      icon: '💬',
      title: 'התאמות וצ\'אט',
      description: 'כשיש לך התאמה, תוכל להתחיל שיחה! כל ההתאמות שלך מחכות לך בטאב "Matches".',
    },
    {
      icon: '🎉',
      title: 'אירועים',
      description: 'גלה אירועים בסביבתך והכר אנשים חדשים. צור אירועים משלך ומשוך אנשים.',
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
      setStep(0);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    onClose();
    setStep(0);
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleSkip}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: '90%',
          maxWidth: 380,
          backgroundColor: '#fff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        }}
      >
        {/* Progress dots */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, pt: 3, pb: 1 }}>
          {steps.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === step ? '#6C5CE7' : 'rgba(108,92,231,0.2)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>

        {/* Content */}
        <Box sx={{ textAlign: 'center', px: 4, py: 4 }}>
          <Typography sx={{ fontSize: 64, mb: 2 }}>{currentStep.icon}</Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1.5 }}
          >
            {currentStep.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#64748b', lineHeight: 1.6, mb: 4 }}
          >
            {currentStep.description}
          </Typography>

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="text"
              onClick={handleSkip}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              דלג
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                flex: 2,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                boxShadow: '0 4px 16px rgba(108,92,231,0.4)',
              }}
            >
              {isLastStep ? 'בואו נתחיל!' : 'הבא'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// Nearby Route - requires location permission
function NearbyRoute() {
  const { hasLocationPermission, updatePermission } = useAuth();
  
  if (!hasLocationPermission) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          backgroundColor: '#ffffff',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '20px',
            backgroundColor: 'rgba(108,92,231,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <CircleUser size={36} color="#6C5CE7" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
          Enable location to see people around you
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3, textAlign: 'center' }}>
          Pulse uses your location to show you people nearby
        </Typography>
        <Box
          component="button"
          onClick={async () => {
            try {
              const result = await new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                  () => resolve('granted'),
                  () => resolve('denied'),
                  { timeout: 10000 }
                );
              });
              if (result === 'granted') {
                updatePermission('location', PERMISSION_STATE.GRANTED);
              }
            } catch (e) {
              console.error(e);
            }
          }}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Enable location
        </Box>
      </Box>
    );
  }
  
  return <NearbyScreen />;
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, isOnboardingComplete } = useAuth();
  
  // Paths where we hide tab bar and header (auth flow)
  const authPaths = [
    '/auth',
    '/register',
    '/login',
    '/registration-success',
    '/landing',
  ];
  
  const hideByFlag = (typeof document !== 'undefined') && document.body && document.body.dataset && document.body.dataset.hideTabBar === 'true';
  const isAuthPath = authPaths.some((prefix) => location.pathname.startsWith(prefix));
  const isProfilePath = location.pathname.startsWith('/profile/');
  
  // Show tab bar and header only when logged in and onboarding complete
  const showTabBar = isLoggedIn && isOnboardingComplete && !isAuthPath && !isProfilePath && !hideByFlag;
  const showHeader = isLoggedIn && isOnboardingComplete && !isAuthPath && !hideByFlag;

  return (
    <div style={{ paddingBottom: showTabBar ? 64 : 0, minHeight: '100vh' }}>
      {/* Permanent Top App Bar */}
      {showHeader && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 2000,
            pointerEvents: 'auto',
            height: 56,
            bgcolor: '#ffffff',
            borderTop: '3px solid #b9e0e2',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#2e2e2e', letterSpacing: 1.5, userSelect: 'none' }}>
            Pulse
          </Typography>
          {/* Right actions: Profile + Settings */}
          <Box sx={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 0.5 }}>
            <Tooltip title="Profile">
              <IconButton size="small" onClick={() => navigate('/profile')}>
                <CircleUser size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton size="small" onClick={() => navigate('/account-settings')}>
                <Settings size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
      {/* Spacer equal to header height to prevent overlap */}
      {showHeader && <Box sx={{ height: 56 }} />}
      <Box>
        <ErrorBoundary>
          <Routes>
            {/* Auth Flow Routes - No protection needed */}
            <Route path="/auth/welcome" element={<WelcomeScreen />} />
            <Route path="/auth/phone" element={<PhoneInputScreen />} />
            <Route path="/auth/otp" element={<OtpVerificationScreen />} />
            <Route path="/auth/location" element={<EnableLocationScreen />} />
            <Route path="/auth/notifications" element={<EnableNotificationsScreen />} />
            <Route path="/auth/onboarding" element={<OnboardingScreen />} />
            <Route path="/auth/photos" element={<PhotosUploadScreen />} />
            <Route path="/auth/bio" element={<BioScreen />} />
            <Route path="/auth/interests" element={<InterestsScreen />} />
            <Route path="/auth/looking-for" element={<LookingForScreen />} />
            <Route path="/auth/details" element={<ProfileDetailsScreen />} />
            <Route path="/auth/prompts" element={<PromptsScreen />} />
            <Route path="/auth/verify-photo" element={<PhotoVerificationScreen />} />
            <Route path="/auth/social-connect" element={<SocialConnectScreen />} />
            <Route path="/auth/age-confirmation" element={<AgeConfirmationScreen />} />
            
            {/* Login Routes (existing users only) */}
            <Route path="/auth/login" element={<LoginScreen />} />
            <Route path="/auth/login-verify" element={<LoginOtpVerificationScreen />} />
            <Route path="/auth/login-phone" element={<LoginPhoneScreen />} />
            <Route path="/auth/business-login" element={<BusinessLoginScreen />} />
            
            {/* Password Reset Routes */}
            <Route path="/auth/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/auth/reset-password-otp" element={<ResetPasswordOtpScreen />} />
            <Route path="/auth/set-new-password" element={<SetNewPasswordScreen />} />
            <Route path="/auth/password-reset-success" element={<PasswordResetSuccessScreen />} />
            
            {/* OAuth Callback Routes */}
            <Route path="/auth/callback/google" element={<OAuthCallbackScreen />} />
            <Route path="/auth/callback/facebook" element={<OAuthCallbackScreen />} />
            <Route path="/auth/callback/apple" element={<OAuthCallbackScreen />} />
            <Route path="/auth/callback/instagram" element={<OAuthCallbackScreen />} />
            
            {/* Protected Routes - Require login + onboarding */}
            <Route path="/" element={<ProtectedRoute><SmartHomeRoute /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><SmartHomeRoute /></ProtectedRoute>} />
            <Route path="/home1" element={<ProtectedRoute><Home1Screen /></ProtectedRoute>} />
            <Route path="/home-swipe" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/home-pulse" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><ExploreScreen /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><MatchesScreen /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
            <Route path="/nearby" element={<ProtectedRoute><NearbyScreen /></ProtectedRoute>} />
            <Route path="/nearby/people" element={<ProtectedRoute><ViewNearbyPeopleScreen /></ProtectedRoute>} />
            <Route path="/nearby/event" element={<ProtectedRoute><EventPreviewScreen /></ProtectedRoute>} />
            <Route path="/activity-response" element={<ProtectedRoute><ActivityResponseScreen /></ProtectedRoute>} />
            <Route path="/scan" element={<ProtectedRoute><NearbyRoute /></ProtectedRoute>} />
            <Route path="/events/new" element={<ProtectedRoute><AddEvent /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><EventsByCategory /></ProtectedRoute>} />
            <Route path="/my-events" element={<ProtectedRoute><MyEventsScreen /></ProtectedRoute>} />
            <Route path="/events/:id/attendees" element={<ProtectedRoute><EventAttendeesScreen /></ProtectedRoute>} />
            <Route path="/business/:id" element={<ProtectedRoute><BusinessPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/account-settings" element={<ProtectedRoute><AccountSettingsScreen /></ProtectedRoute>} />
            <Route path="/user-profile" element={<ProtectedRoute><UserProfileScreen /></ProtectedRoute>} />
            <Route path="/permissions" element={<ProtectedRoute><PermissionsScreen /></ProtectedRoute>} />
            <Route path="/business-upgrade" element={<ProtectedRoute><BusinessUpgradeScreen /></ProtectedRoute>} />
            <Route path="/settings/location-visibility" element={<ProtectedRoute><LocationVisibilityScreen /></ProtectedRoute>} />
            <Route path="/settings/time-visibility" element={<ProtectedRoute><TimeVisibilityScreen /></ProtectedRoute>} />
            <Route path="/settings/contacts-visibility" element={<ProtectedRoute><ContactsVisibilityScreen /></ProtectedRoute>} />
            <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettingsScreen /></ProtectedRoute>} />
            <Route path="/settings/blocked-users" element={<ProtectedRoute><BlockedUsersScreen /></ProtectedRoute>} />
            <Route path="/accessibility" element={<ProtectedRoute><AccessibilityScreen /></ProtectedRoute>} />
            <Route path="/help-center" element={<ProtectedRoute><HelpCenterScreen /></ProtectedRoute>} />
            <Route path="/safety-tips" element={<ProtectedRoute><SafetyTipsScreen /></ProtectedRoute>} />
            <Route path="/community-guidelines" element={<ProtectedRoute><CommunityGuidelinesScreen /></ProtectedRoute>} />
            <Route path="/privacy-policy" element={<ProtectedRoute><PrivacyPolicyScreen /></ProtectedRoute>} />
            <Route path="/terms-of-service" element={<ProtectedRoute><TermsOfServiceScreen /></ProtectedRoute>} />
            <Route path="/settings/account" element={<ProtectedRoute><AccountScreen /></ProtectedRoute>} />
            <Route path="/settings/account/email" element={<ProtectedRoute><EmailEditScreen /></ProtectedRoute>} />
            <Route path="/settings/account/connected-accounts" element={<ProtectedRoute><ConnectedAccountsScreen /></ProtectedRoute>} />
            <Route path="/settings/connected-accounts" element={<ProtectedRoute><ConnectedAccountsScreen /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsScreen /></ProtectedRoute>} />
            <Route path="/points" element={<ProtectedRoute><PointsHubScreen /></ProtectedRoute>} />
            <Route path="/likes-you" element={<ProtectedRoute><LikesYouScreen /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile-demo" element={<ProtectedRoute><ProfileCardDemo /></ProtectedRoute>} />
            
            {/* Legacy routes - redirect to auth */}
            <Route path="/landing" element={<Navigate to="/auth/welcome" replace />} />
            <Route path="/login" element={<Navigate to="/auth/welcome" replace />} />
            <Route path="/register" element={<Navigate to="/auth/welcome" replace />} />
            <Route path="/registration-success" element={<Navigate to="/home" replace />} />
            
            {/* Catch all - redirect based on auth state */}
            <Route path="*" element={<Navigate to={isLoggedIn && isOnboardingComplete ? "/home" : "/auth/welcome"} replace />} />
          </Routes>
        </ErrorBoundary>
        {showTabBar && <TabNavigation />}
      </Box>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AuthProvider>
          <ActivityProvider>
            <NotificationsProvider>
              <GlobalErrorProvider>
                <Router>
                  <InAppNotificationBanner />
                  <AppShell />
                </Router>
              </GlobalErrorProvider>
            </NotificationsProvider>
          </ActivityProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
