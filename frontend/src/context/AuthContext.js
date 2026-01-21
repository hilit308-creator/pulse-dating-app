import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// E2E Test bypass - ONLY enabled via env flag, never in production
const E2E_AUTH_BYPASS = process.env.REACT_APP_E2E_AUTH_BYPASS === 'true';

// Test user for E2E bypass
const E2E_TEST_USER = {
  id: 999,
  email: 'e2e-test@pulse.app',
  firstName: 'E2E',
  lastName: 'TestUser',
  phone: '+1234567890',
  onboardingStatus: 'COMPLETED',
  role: 'user',
};

// Admin emails - these users get admin role automatically
const ADMIN_EMAILS = [
  'lironi217@gmail.com',
];

// Auth States
export const AUTH_STATE = {
  LOGGED_OUT: 'LOGGED_OUT',
  OTP_SENT: 'OTP_SENT',
  LOGGED_IN: 'LOGGED_IN',
};

// Onboarding States
export const ONBOARDING_STATE = {
  NOT_STARTED: 'NOT_STARTED',
  BASIC_DETAILS_DONE: 'BASIC_DETAILS_DONE',
  COMPLETED: 'COMPLETED',
};

// Permission States
export const PERMISSION_STATE = {
  UNKNOWN: 'UNKNOWN',
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
  NOT_NOW: 'NOT_NOW',
};

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'pulse_access_token',
  REFRESH_TOKEN: 'pulse_refresh_token',
  USER: 'pulse_user',
  ONBOARDING_STATE: 'pulse_onboarding_state',
  ONBOARDING_STEP: 'pulse_onboarding_step',
  ONBOARDING_DATA: 'pulse_onboarding_data',
  PERMISSIONS: 'pulse_permissions',
  VERIFICATION_ID: 'pulse_verification_id',
  PHONE: 'pulse_phone',
};

// All onboarding steps in order
export const ONBOARDING_STEPS = [
  'phone',
  'otp', 
  'location',
  'notifications',
  'onboarding',
  'age-confirmation',
  'photos',
  'bio',
  'interests',
  'looking-for',
  'details',
  'prompts',
  'verify-photo',
  'social-connect',
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Auth state
  const [authState, setAuthState] = useState(AUTH_STATE.LOGGED_OUT);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  
  // Onboarding state
  const [onboardingState, setOnboardingState] = useState(ONBOARDING_STATE.NOT_STARTED);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState('phone');
  const [onboardingData, setOnboardingData] = useState({});
  
  // Permissions state
  const [permissions, setPermissions] = useState({
    location: PERMISSION_STATE.UNKNOWN,
    notifications: PERMISSION_STATE.UNKNOWN,
    att: PERMISSION_STATE.UNKNOWN, // iOS App Tracking Transparency
  });
  
  // OTP flow state
  const [verificationId, setVerificationId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = () => {
      try {
        // E2E Auth Bypass - auto-login as test user
        if (E2E_AUTH_BYPASS) {
          console.log('[Auth] E2E_AUTH_BYPASS enabled - auto-login as test user');
          setAccessToken('e2e-test-token');
          setRefreshToken('e2e-test-refresh-token');
          setUser(E2E_TEST_USER);
          setAuthState(AUTH_STATE.LOGGED_IN);
          setOnboardingState(ONBOARDING_STATE.COMPLETED);
          setIsLoading(false);
          return; // Skip normal auth flow
        }

        const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedOnboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
        const storedPermissions = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
        const storedVerificationId = localStorage.getItem(STORAGE_KEYS.VERIFICATION_ID);
        const storedPhone = localStorage.getItem(STORAGE_KEYS.PHONE);

        if (storedToken) {
          setAccessToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setAuthState(AUTH_STATE.LOGGED_IN);
        } else if (storedVerificationId) {
          setVerificationId(storedVerificationId);
          setPhoneNumber(storedPhone || '');
          setAuthState(AUTH_STATE.OTP_SENT);
        }

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Auto-assign admin role for specific emails
          if (parsedUser?.email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(parsedUser.email.toLowerCase())) {
            parsedUser.role = 'admin';
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsedUser));
          }
          setUser(parsedUser);
        }

        if (storedOnboarding) {
          setOnboardingState(storedOnboarding);
        }

        const storedOnboardingStep = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STEP);
        if (storedOnboardingStep) {
          setCurrentOnboardingStep(storedOnboardingStep);
        }

        const storedOnboardingData = localStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
        if (storedOnboardingData) {
          setOnboardingData(JSON.parse(storedOnboardingData));
        }

        if (storedPermissions) {
          setPermissions(JSON.parse(storedPermissions));
        }
      } catch (err) {
        console.error('Error loading persisted auth state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedState();
  }, []);

  // Persist state changes
  const persistState = useCallback((key, value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value);
      }
    } catch (err) {
      console.error('Error persisting state:', err);
    }
  }, []);

  // Set OTP sent state
  const setOtpSent = useCallback((verificationIdValue, phone) => {
    setVerificationId(verificationIdValue);
    setPhoneNumber(phone);
    setAuthState(AUTH_STATE.OTP_SENT);
    persistState(STORAGE_KEYS.VERIFICATION_ID, verificationIdValue);
    persistState(STORAGE_KEYS.PHONE, phone);
  }, [persistState]);

  // Login success
  const loginSuccess = useCallback((tokens, userData) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUser(userData);
    setAuthState(AUTH_STATE.LOGGED_IN);
    setVerificationId(null);
    
    // Determine onboarding state from user data
    const onboardingStatus = userData?.onboardingStatus || ONBOARDING_STATE.NOT_STARTED;
    setOnboardingState(onboardingStatus);

    // Persist
    persistState(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    persistState(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    persistState(STORAGE_KEYS.USER, userData);
    persistState(STORAGE_KEYS.ONBOARDING_STATE, onboardingStatus);
    persistState(STORAGE_KEYS.VERIFICATION_ID, null);
    persistState(STORAGE_KEYS.PHONE, null);
  }, [persistState]);

  // Update user profile
  const updateUser = useCallback((userData) => {
    setUser(prev => {
      const updated = { ...prev, ...userData };
      persistState(STORAGE_KEYS.USER, updated);
      return updated;
    });
  }, [persistState]);

  // Update onboarding state
  const updateOnboardingState = useCallback((state) => {
    setOnboardingState(state);
    persistState(STORAGE_KEYS.ONBOARDING_STATE, state);
  }, [persistState]);

  // Update current onboarding step
  const updateOnboardingStep = useCallback((step) => {
    setCurrentOnboardingStep(step);
    persistState(STORAGE_KEYS.ONBOARDING_STEP, step);
  }, [persistState]);

  // Save onboarding data (partial profile data during onboarding)
  const saveOnboardingData = useCallback((data) => {
    setOnboardingData(prev => {
      const updated = { ...prev, ...data };
      persistState(STORAGE_KEYS.ONBOARDING_DATA, updated);
      return updated;
    });
  }, [persistState]);

  // Get next onboarding step
  const getNextStep = useCallback((currentStep) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < ONBOARDING_STEPS.length - 1) {
      return ONBOARDING_STEPS[currentIndex + 1];
    }
    return null;
  }, []);

  // Get previous onboarding step
  const getPreviousStep = useCallback((currentStep) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      return ONBOARDING_STEPS[currentIndex - 1];
    }
    return null;
  }, []);

  // Get onboarding progress (0-100)
  const getOnboardingProgress = useCallback((step) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(step);
    if (currentIndex >= 0) {
      return ((currentIndex + 1) / ONBOARDING_STEPS.length) * 100;
    }
    return 0;
  }, []);

  // Clear onboarding data on completion
  const completeOnboarding = useCallback(() => {
    // Merge onboarding data into user
    setUser(prev => {
      const updated = { ...prev, ...onboardingData };
      persistState(STORAGE_KEYS.USER, updated);
      return updated;
    });
    
    // Update state
    setOnboardingState(ONBOARDING_STATE.COMPLETED);
    persistState(STORAGE_KEYS.ONBOARDING_STATE, ONBOARDING_STATE.COMPLETED);
    
    // Clear onboarding-specific data
    setOnboardingData({});
    setCurrentOnboardingStep('phone');
    persistState(STORAGE_KEYS.ONBOARDING_DATA, null);
    persistState(STORAGE_KEYS.ONBOARDING_STEP, null);
  }, [onboardingData, persistState]);

  // Update permissions
  const updatePermission = useCallback((permissionType, state) => {
    setPermissions(prev => {
      const updated = { ...prev, [permissionType]: state };
      persistState(STORAGE_KEYS.PERMISSIONS, updated);
      return updated;
    });
  }, [persistState]);

  // Logout
  const logout = useCallback(() => {
    setAuthState(AUTH_STATE.LOGGED_OUT);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setOnboardingState(ONBOARDING_STATE.NOT_STARTED);
    setVerificationId(null);
    setPhoneNumber('');
    setError(null);

    // Clear storage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset to phone input (from OTP screen)
  const resetToPhoneInput = useCallback(() => {
    setAuthState(AUTH_STATE.LOGGED_OUT);
    setVerificationId(null);
    persistState(STORAGE_KEYS.VERIFICATION_ID, null);
  }, [persistState]);

  const value = {
    // State
    authState,
    accessToken,
    user,
    onboardingState,
    currentOnboardingStep,
    onboardingData,
    permissions,
    verificationId,
    phoneNumber,
    isLoading,
    error,
    
    // Computed
    isLoggedIn: authState === AUTH_STATE.LOGGED_IN,
    isOtpSent: authState === AUTH_STATE.OTP_SENT,
    isOnboardingComplete: onboardingState === ONBOARDING_STATE.COMPLETED,
    hasLocationPermission: permissions.location === PERMISSION_STATE.GRANTED,
    onboardingProgress: getOnboardingProgress(currentOnboardingStep),
    
    // Actions
    setOtpSent,
    loginSuccess,
    updateUser,
    updateOnboardingState,
    updateOnboardingStep,
    saveOnboardingData,
    getNextStep,
    getPreviousStep,
    getOnboardingProgress,
    completeOnboarding,
    updatePermission,
    logout,
    setError,
    clearError,
    resetToPhoneInput,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
