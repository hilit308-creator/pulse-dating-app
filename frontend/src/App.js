import React from 'react';
import './index.css';
import './global-theme.css';
import './pages/global-theme.css';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Typography, Box, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Settings, CircleUser, ArrowLeft, HelpCircle, Home as HomeIcon } from 'lucide-react';

// Auth
import { AuthProvider, useAuth, ONBOARDING_STATE, PERMISSION_STATE } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
// Activity (Response & Feedback Flow)
import { ActivityProvider } from './context/ActivityContext';
// Notifications System
import { NotificationsProvider } from './context/NotificationsContext';
import InAppNotificationBanner from './components/InAppNotificationBanner';
import GlobalEventInvitePopups from './components/GlobalEventInvitePopups';
import DevEventInviteDemoButtons from './components/DevEventInviteDemoButtons';
import {
  WelcomeScreen,
  PhoneInputScreen,
  OtpVerificationScreen,
  CreatePasswordScreen,
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
import EventDetailsPage from './pages/EventDetailsPage';

// Legacy components
import LandingPage from './components/LandingPage';
import Registration from './components/Registration';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import RegistrationSuccess from './components/RegistrationSuccess';
import ProfileCardDemo from './components/ProfileCardDemo';
import Home from './components/Home.js';
import Home1Screen from './pages/Home1Screen';
import HomeScreen from './pages/HomeScreen';
import BusinessPage from './pages/BusinessPage';
import TabNavigation from './components/TabNavigation';
import ChatScreen from './pages/ChatScreen';
import MatchesScreen from './pages/MatchesScreen';
import MatchPulseScreen from './components/MatchPulseScreen';
import ExploreScreen from './pages/ExploreScreen';
import NaturePlaceDetailScreen from './pages/NaturePlaceDetailScreen';
import ProfileSettings from './pages/ProfileSettings';
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
import EventMatchesScreen from './pages/EventMatchesScreen';
import EventLikesScreen from './pages/EventLikesScreen';
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
import ReportProblemScreen from './pages/ReportProblemScreen';
import MeetingsSafetyScreen from './pages/MeetingsSafetyScreen';
import MeetingTimeScreen from './pages/MeetingTimeScreen';
import UserDetailsScreen from './pages/UserDetailsScreen';
import UserDetailsScreen2 from './pages/UserDetailsScreen2';
import UserProfilePage from './pages/UserProfilePage';

// Global components
import { GlobalErrorProvider } from './components/GlobalErrorBanner';
import SessionExpiredModal from './components/SessionExpiredModal';
import { getPageHelpContent } from './config/pageHelpContent';
import { MeetingProvider } from './context/MeetingContext';
import GlobalMeetingBar from './components/GlobalMeetingBar';

// Safe area calculations for modals/dialogs
const BOTTOM_NAV_HEIGHT = 56;
const TOP_HEADER_HEIGHT = 56;
const MODAL_VERTICAL_MARGIN = 24; // Consistent margin from top and bottom

// Global overlay z-index - must be above all screen content
const GLOBAL_OVERLAY_ZINDEX = 10000;

const theme = createTheme({
  palette: {
    primary: { main: '#6C5CE7' },
    secondary: { main: '#3f51b5' },
  },
  components: {
    // Remove all focus outlines and purple hover effects globally
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          '&:focus': {
            outline: 'none',
            backgroundColor: 'transparent',
          },
          '&.Mui-focusVisible': {
            outline: 'none',
            boxShadow: 'none',
            backgroundColor: 'transparent',
          },
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.02)',
          },
          '&:hover .MuiCardActionArea-focusHighlight': {
            opacity: 0.02,
          },
          '& .MuiCardActionArea-focusHighlight': {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            outline: 'none',
          },
          '&.Mui-focusVisible': {
            outline: 'none',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': {
            outline: 'none',
          },
          '&.Mui-focusVisible': {
            outline: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          '&:focus': {
            outline: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '&:focus': {
            outline: 'none',
          },
        },
      },
    },
    // Global Modal Vertical Spacing & Centering Rule
    // All dialogs/modals must:
    // 1. Be rendered in app-level overlay portal (above all screen content)
    // 2. Have consistent vertical spacing from top and bottom
    // 3. Be visually centered within the safe viewport
    // 4. Never touch or approach the bottom navigation bar
    // 5. Use internal scrolling if content exceeds available height
    MuiDialog: {
      defaultProps: {
        // Ensure dialogs are rendered at document.body level (portal)
        disablePortal: false,
      },
      styleOverrides: {
        root: {
          // High z-index to sit above all screen content and UI chrome
          zIndex: GLOBAL_OVERLAY_ZINDEX,
          // Container handles centering and safe area padding
          '& .MuiDialog-container': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Safe area: header + margin at top, nav bar + margin at bottom
            paddingTop: `${TOP_HEADER_HEIGHT + MODAL_VERTICAL_MARGIN}px`,
            paddingBottom: `${BOTTOM_NAV_HEIGHT + MODAL_VERTICAL_MARGIN}px`,
            paddingLeft: 16,
            paddingRight: 16,
            boxSizing: 'border-box',
            minHeight: '100vh',
          },
        },
        paper: {
          // Dialog paper is a floating element, not screen-aligned
          maxHeight: `calc(100vh - ${TOP_HEADER_HEIGHT + BOTTOM_NAV_HEIGHT + (MODAL_VERTICAL_MARGIN * 2)}px)`,
          margin: 0, // Container handles spacing
          overflowY: 'auto',
          // Ensure it doesn't stretch to fill container
          width: 'auto',
          maxWidth: 'calc(100% - 32px)',
        },
      },
    },
    MuiModal: {
      defaultProps: {
        // Ensure modals are rendered at document.body level (portal)
        disablePortal: false,
      },
      styleOverrides: {
        root: {
          // High z-index to sit above all screen content and UI chrome
          zIndex: GLOBAL_OVERLAY_ZINDEX,
          // For MUI Modal (used by some custom modals)
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Apply safe area to direct children (modal content)
          '& > .MuiBox-root, & > div:not(.MuiBackdrop-root)': {
            maxHeight: `calc(100vh - ${TOP_HEADER_HEIGHT + BOTTOM_NAV_HEIGHT + (MODAL_VERTICAL_MARGIN * 2)}px)`,
            marginTop: `${TOP_HEADER_HEIGHT + MODAL_VERTICAL_MARGIN}px`,
            marginBottom: `${BOTTOM_NAV_HEIGHT + MODAL_VERTICAL_MARGIN}px`,
            overflowY: 'auto',
          },
        },
      },
    },
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
  const { isLoggedIn, isOnboardingComplete, user } = useAuth();
  const [showHelpDialog, setShowHelpDialog] = React.useState(false);
  const [matchPopup, setMatchPopup] = React.useState(null);

  React.useEffect(() => {
    const onShowMatch = (e) => {
      const match = e?.detail?.match;
      if (!match) return;
      try {
        console.log('[MatchPopup] open', match);
      } catch {
        // ignore
      }
      setMatchPopup({
        match,
        copy: e?.detail?.copy,
        onLater: e?.detail?.onLater,
        onTertiary: e?.detail?.onTertiary,
        onChat: e?.detail?.onChat,
      });
    };

    window.addEventListener('pulse:show_match', onShowMatch);
    return () => window.removeEventListener('pulse:show_match', onShowMatch);
  }, []);

  React.useEffect(() => {
    if (!matchPopup) return;
    const prev = document?.body?.style?.overflow;
    if (document?.body?.style) document.body.style.overflow = 'hidden';
    return () => {
      if (document?.body?.style) document.body.style.overflow = prev || '';
    };
  }, [matchPopup]);
  
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
  
  // Root tabs - no back button needed (chat with specific matchId SHOULD show back button)
  const rootTabs = ['/', '/home', '/home1', '/home2', '/home-swipe', '/home-pulse', '/chat', '/matches', '/nearby', '/events', '/explore'];
  const isRootTab = rootTabs.includes(location.pathname);
  
  // Show tab bar and header only when logged in and onboarding complete
  // Note: hideByFlag only hides TabBar, NOT the main header
  const showTabBar = isLoggedIn && isOnboardingComplete && !isAuthPath && !isProfilePath && !hideByFlag;
  const showHeader = isLoggedIn && isOnboardingComplete && !isAuthPath;
  const showBackButton = showHeader && !isRootTab;
  
  // Get help content based on current route
  const getHelpKeyFromPath = (pathname) => {
    if (pathname === '/' || pathname === '/home' || pathname === '/home1' || pathname === '/home-swipe' || pathname === '/home-pulse') return 'home';
    if (pathname === '/nearby') return 'nearby';
    if (pathname === '/explore') return 'explore';
    if (pathname === '/matches') return 'matches';
    if (pathname === '/chat' || pathname.startsWith('/chat/')) return 'chat';
    if (pathname === '/events' || pathname.startsWith('/events/')) return 'events';
    if (pathname === '/profile' || pathname.startsWith('/profile')) return 'profile';
    if (pathname === '/account-settings' || pathname.startsWith('/settings')) return 'settings';
    if (pathname === '/subscriptions') return 'subscription';
    if (pathname === '/safety-tips' || pathname === '/meetings-safety') return 'safety';
    if (pathname === '/likes-you') return 'likes';
    return 'home'; // default
  };
  
  const helpContent = getPageHelpContent(getHelpKeyFromPath(location.pathname));

  return (
    <div style={{ paddingBottom: showTabBar ? 64 : 0, minHeight: '100vh' }}>
      {!!matchPopup && (
        <MatchPulseScreen
          match={matchPopup.match}
          currentUser={user}
          copy={matchPopup.copy}
          onTertiary={(m) => {
            setMatchPopup(null);
            try {
              matchPopup.onTertiary?.(m);
            } catch {
              // ignore
            }
          }}
          onStartChat={(m) => {
            setMatchPopup(null);
            // Use custom onChat callback if provided (e.g., from EventLikesScreen)
            if (matchPopup.onChat) {
              try {
                matchPopup.onChat(m);
              } catch {
                // Fallback to default navigation
                const matchId = m?.matchId || m?.id;
                if (matchId) navigate(`/chat/${matchId}`);
                else navigate('/chat');
              }
            } else {
              const matchId = m?.matchId || m?.id;
              if (matchId) navigate(`/chat/${matchId}`);
              else navigate('/chat');
            }
          }}
          onLater={() => {
            setMatchPopup(null);
            try {
              matchPopup.onLater?.();
            } catch {
              // ignore
            }
          }}
        />
      )}
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
          {/* Left: Back button (only on non-root screens) */}
          <Box sx={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {showBackButton && (
              <IconButton 
                size="small" 
                onClick={() => {
                  // If in a specific chat, go back to chat list
                  if (location.pathname.startsWith('/chat/')) {
                    navigate('/chat');
                  } else {
                    navigate(-1);
                  }
                }}
                sx={{ 
                  width: 36, 
                  height: 36,
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <ArrowLeft size={20} />
              </IconButton>
            )}
          </Box>
          
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#2e2e2e', letterSpacing: 1.5, userSelect: 'none' }}>
            Pulse
          </Typography>
          
          {/* Right actions: Help + Profile + Settings */}
          <Box sx={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 0.5 }}>
            <Tooltip title="Help">
              <IconButton 
                size="small" 
                onClick={() => setShowHelpDialog(true)}
                sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}
              >
                <HelpCircle size={18} />
              </IconButton>
            </Tooltip>
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
      
      {/* Global Help Dialog - Compact */}
      <Dialog
        open={showHelpDialog}
        onClose={() => setShowHelpDialog(false)}
        sx={{ zIndex: 99999 }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 0,
            maxWidth: 300,
            width: '90%',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5, pt: 2, textAlign: 'center', fontSize: '1.05rem' }}>
          {helpContent.title}
        </DialogTitle>
        <DialogContent sx={{ py: 1, px: 2.5 }}>
          <Box sx={{ textAlign: 'center' }}>
            {helpContent.steps.map((step, index) => (
              <Box key={index} sx={{ mb: index === helpContent.steps.length - 1 ? 0.5 : 1.5 }}>
                {step.emoji && (
                  <Typography sx={{ fontSize: 22, mb: 0.25 }}>
                    {step.emoji}
                  </Typography>
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.85rem' }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {step.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, pt: 0.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowHelpDialog(false)}
            sx={{
              py: 1,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
      <Box>
        <ErrorBoundary>
          <Routes>
            {/* Auth Flow Routes - No protection needed */}
            <Route path="/auth/welcome" element={<WelcomeScreen />} />
            <Route path="/auth/phone" element={<PhoneInputScreen />} />
            <Route path="/auth/otp" element={<OtpVerificationScreen />} />
            <Route path="/auth/create-password" element={<CreatePasswordScreen />} />
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
            <Route path="/home2" element={<Home />} />
            <Route path="/home-swipe" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/home-pulse" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><ExploreScreen /></ProtectedRoute>} />
            <Route path="/nature/:id" element={<ProtectedRoute><NaturePlaceDetailScreen /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><MatchesScreen /></ProtectedRoute>} />
            <Route path="/match-pulse" element={<ProtectedRoute><MatchPulseScreen /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
            <Route path="/chat/:matchId" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
            <Route path="/meeting-time" element={<ProtectedRoute><MeetingTimeScreen /></ProtectedRoute>} />
            <Route path="/nearby" element={<ProtectedRoute><NearbyScreen /></ProtectedRoute>} />
            <Route path="/nearby/people" element={<ProtectedRoute><ViewNearbyPeopleScreen /></ProtectedRoute>} />
            <Route path="/nearby/event" element={<ProtectedRoute><EventPreviewScreen /></ProtectedRoute>} />
            <Route path="/activity-response" element={<ProtectedRoute><ActivityResponseScreen /></ProtectedRoute>} />
            <Route path="/scan" element={<ProtectedRoute><NearbyRoute /></ProtectedRoute>} />
            <Route path="/events/new" element={<ProtectedRoute><AddEvent /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><EventsByCategory /></ProtectedRoute>} />
            <Route path="/my-events" element={<ProtectedRoute><MyEventsScreen /></ProtectedRoute>} />
            <Route path="/events/:id/attendees" element={<ProtectedRoute><EventAttendeesScreen /></ProtectedRoute>} />
            <Route path="/events/:id/matches" element={<ProtectedRoute><EventMatchesScreen /></ProtectedRoute>} />
            <Route path="/events/:id/likes" element={<ProtectedRoute><EventLikesScreen /></ProtectedRoute>} />
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
            <Route path="/settings/report-problem" element={<ProtectedRoute><ReportProblemScreen /></ProtectedRoute>} />
            <Route path="/settings/meetings-safety" element={<ProtectedRoute><MeetingsSafetyScreen /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsScreen /></ProtectedRoute>} />
            <Route path="/points" element={<ProtectedRoute><PointsHubScreen /></ProtectedRoute>} />
            <Route path="/likes-you" element={<ProtectedRoute><LikesYouScreen /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/user/:id" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
            <Route path="/user2/:id" element={<UserDetailsScreen2 />} />
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
              <MeetingProvider>
                <GlobalErrorProvider>
                  <Router>
                    <GlobalMeetingBar />
                    <InAppNotificationBanner />
                    <GlobalEventInvitePopups />
                    <DevEventInviteDemoButtons />
                    <AppShell />
                  </Router>
                </GlobalErrorProvider>
              </MeetingProvider>
            </NotificationsProvider>
          </ActivityProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
