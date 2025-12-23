import React from 'react';
import './index.css';
import './pages/global-theme.css';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Typography, Box, IconButton, Tooltip } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Settings, CircleUser } from 'lucide-react';
import LandingPage from './components/LandingPage';
import Registration from './components/Registration';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import RegistrationSuccess from './components/RegistrationSuccess';
import ProfileCardDemo from './components/ProfileCardDemo';
import Home from './components/Home';
import TabNavigation from './components/TabNavigation';
import ChatScreen from './pages/ChatScreen';
import MatchesScreen from './pages/MatchesScreen';
import ExploreScreen from './pages/ExploreScreen';
import ProfileSettings from './pages/ProfileSettings';
import EventsByCategory from './pages/EventsByCategory';
import AddEvent from './pages/AddEvent';
import NearbyScreen from './pages/NearbyScreen';

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
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong.
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
            {String(this.state.error)}
          </Typography>
          {this.state.error?.stack && (
            <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', display: 'block', mb: 1 }}>
              {this.state.error.stack}
            </Typography>
          )}
          {this.state.info?.componentStack && (
            <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', display: 'block' }}>
              {this.state.info.componentStack}
            </Typography>
          )}
        </Box>
      );
    }
    return this.props.children;
  }
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideTabBarPrefixes = [
    '/register',
    '/login',
    '/registration-success',
    '/landing',
    '/profile/',
  ];
  const hideByFlag = (typeof document !== 'undefined') && document.body && document.body.dataset && document.body.dataset.hideTabBar === 'true';
  const showTabBar = !hideTabBarPrefixes.some((prefix) => location.pathname.startsWith(prefix)) && !hideByFlag;
  const showHeader = !hideByFlag; // hide header when splash sets the flag

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
          {/* Right actions: Profile + Settings (swapped targets) */}
          <Box sx={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 0.5 }}>
            <Tooltip title="Settings">
              <IconButton size="small" onClick={() => navigate('/profile-settings')}>
                <CircleUser size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Profile">
              <IconButton size="small" onClick={() => navigate('/profile')}>
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
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile-demo" element={<ProfileCardDemo />} />
            <Route path="/explore" element={<ExploreScreen />} />
            <Route path="/matches" element={<MatchesScreen />} />
            <Route path="/chat" element={<ChatScreen />} />
            <Route path="/nearby" element={<NearbyScreen />} />
            <Route path="/scan" element={<NearbyScreen />} />
            <Route path="/discover" element={<NearbyScreen />} />
            {/* Events */}
            <Route path="/events/new" element={<AddEvent />} />
            <Route path="/events" element={<EventsByCategory />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
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
      <Router>
        <AppShell />
      </Router>
    </ThemeProvider>
  );
}

export default App;
