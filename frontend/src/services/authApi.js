/**
 * Auth API Service
 * Real backend authentication endpoints
 */

import { API_URL } from '../config/api';

// Simulated delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Rate limiting (client-side tracking)
const rateLimitStorage = new Map();
const MAX_OTP_REQUESTS = 3;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_VERIFY_ATTEMPTS = 5;

// Check rate limit
const checkRateLimit = (phone, type) => {
  const key = `${type}_${phone}`;
  const now = Date.now();
  const record = rateLimitStorage.get(key) || { count: 0, firstAttempt: now };
  
  // Reset if window expired
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    rateLimitStorage.set(key, { count: 1, firstAttempt: now });
    return { allowed: true };
  }
  
  const maxAttempts = type === 'request' ? MAX_OTP_REQUESTS : MAX_VERIFY_ATTEMPTS;
  if (record.count >= maxAttempts) {
    const waitTime = Math.ceil((RATE_LIMIT_WINDOW - (now - record.firstAttempt)) / 1000);
    return { allowed: false, waitTime };
  }
  
  record.count++;
  rateLimitStorage.set(key, record);
  return { allowed: true };
};

// Validate phone number (E.164 format)
const validatePhone = (phone) => {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  // Check E.164 format: + followed by 7-15 digits
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  return e164Regex.test(cleaned);
};

// Format phone for display (masked)
export const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.length < 8) return cleaned;
  // Show first 4 and last 2 digits
  return `${cleaned.slice(0, 4)} XX-XXX-${cleaned.slice(-2)}`;
};

/**
 * Request OTP
 * POST /api/auth/otp/request
 */
export const requestOtp = async (phoneE164) => {
  // Validate phone
  if (!phoneE164 || !validatePhone(phoneE164)) {
    throw {
      code: 'invalid_phone',
      message: 'Invalid phone number. Please enter a valid phone number.',
    };
  }
  
  // Check rate limit
  const rateCheck = checkRateLimit(phoneE164, 'request');
  if (!rateCheck.allowed) {
    throw {
      code: 'rate_limited',
      message: `Too many attempts. Try again in ${rateCheck.waitTime} seconds.`,
      retryAfter: rateCheck.waitTime,
    };
  }
  
  try {
    const response = await fetch(`${API_URL}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneE164 }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw {
        code: data.error || 'request_failed',
        message: data.message || 'Failed to send OTP',
      };
    }
    
    console.log('[OTP] Request sent successfully');
    return data;
  } catch (error) {
    if (error.code) throw error;
    throw {
      code: 'network_error',
      message: 'Network error. Please try again.',
    };
  }
};

/**
 * Verify OTP
 * POST /api/auth/otp/verify
 */
export const verifyOtp = async (verificationId, code) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationId, code }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw {
        code: data.error || 'verification_failed',
        message: data.message || 'Verification failed',
      };
    }
    
    console.log('[OTP] Verification successful, got JWT');
    return data;
  } catch (error) {
    if (error.code) throw error;
    throw {
      code: 'network_error',
      message: 'Network error. Please try again.',
    };
  }
};

/**
 * Update Profile
 * PATCH /users/me
 */
export const updateProfile = async (accessToken, profileData) => {
  await delay(500 + Math.random() * 300);
  
  if (!accessToken) {
    throw {
      code: 'unauthorized',
      message: 'Please log in to continue.',
    };
  }
  
  const { firstName, dateOfBirth, gender, showMePreference } = profileData;
  
  // Validate required fields
  if (!firstName || firstName.trim().length < 2) {
    throw {
      code: 'validation_error',
      message: 'First name must be at least 2 characters.',
      field: 'firstName',
    };
  }
  
  if (!dateOfBirth) {
    throw {
      code: 'validation_error',
      message: 'Date of birth is required.',
      field: 'dateOfBirth',
    };
  }
  
  // Calculate age
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  // Determine onboarding status
  const onboardingStatus = firstName && dateOfBirth ? 'BASIC_DETAILS_DONE' : 'NOT_STARTED';
  
  return {
    user: {
      firstName: firstName.trim(),
      dateOfBirth,
      gender: gender || null,
      showMePreference: showMePreference || 'Everyone',
    },
    computedAge: age,
    onboardingStatus,
  };
};

// ============================================
// LOGIN FLOW (Existing Users Only)
// ============================================

/**
 * Login with Password (Primary Authentication)
 * POST /api/auth/login
 * 
 * Returns:
 * - On success: { requiresOtp: boolean, accessToken?: string, refreshToken?: string, user?: object }
 * - On failure: throws error
 */
export const loginWithPassword = async (usernameOrEmail, password) => {
  // Validate inputs
  if (!usernameOrEmail || usernameOrEmail.trim().length < 3) {
    throw {
      code: 'validation_error',
      message: 'Please enter a valid username or email',
      field: 'usernameOrEmail',
    };
  }
  
  if (!password || password.length < 6) {
    throw {
      code: 'validation_error',
      message: 'Password must be at least 6 characters',
      field: 'password',
    };
  }
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw {
        code: data.error || 'login_failed',
        message: data.message || 'Login failed',
      };
    }
    
    console.log('[Auth] Login successful, got JWT');
    return data;
  } catch (error) {
    if (error.code) throw error;
    throw {
      code: 'network_error',
      message: 'Network error. Please try again.',
    };
  }
};

/**
 * Verify Login OTP (Secondary Authentication)
 * POST /api/auth/login/verify - Not implemented in backend yet
 * For now, login returns JWT directly without OTP
 */
export const verifyLoginOtp = async (verificationId, code) => {
  // Backend login doesn't require secondary OTP, so this is a no-op
  // Kept for compatibility with existing UI flow
  throw {
    code: 'not_implemented',
    message: 'Secondary OTP not required - use direct login',
  };
};

/**
 * Resend Login OTP - Not implemented with real backend
 */
export const resendLoginOtp = async (verificationId) => {
  throw {
    code: 'not_implemented',
    message: 'Resend OTP not implemented',
  };
};

/**
 * Request Password Reset by Phone - Stub for now
 */
export const requestPasswordResetByPhone = async (phoneE164) => {
  throw {
    code: 'not_implemented',
    message: 'Password reset not implemented yet',
  };
};

/**
 * Verify Password Reset OTP - Stub
 */
export const verifyPasswordResetOtp = async (verificationId, code) => {
  throw { code: 'not_implemented', message: 'Not implemented' };
};

/**
 * Resend Password Reset OTP - Stub
 */
export const resendPasswordResetOtp = async (verificationId) => {
  throw { code: 'not_implemented', message: 'Not implemented' };
};

/**
 * Set New Password - Stub
 */
export const setNewPassword = async (verificationId, newPassword, confirmPassword) => {
  throw { code: 'not_implemented', message: 'Not implemented' };
};

/**
 * Delete Account - Stub
 */
export const deleteAccount = async (accessToken) => {
  throw { code: 'not_implemented', message: 'Not implemented' };
};

/**
 * Request Password Reset - Stub
 */
export const requestPasswordReset = async (usernameOrEmail) => {
  throw { code: 'not_implemented', message: 'Not implemented' };
};

/**
 * Login with Phone Number - Stub
 */
export const loginWithPhone = async (phoneE164) => {
  throw { code: 'not_implemented', message: 'Not implemented' };
};

/**
 * Confirm Age (complete onboarding)
 */
export const confirmAge = async (accessToken) => {
  if (!accessToken) {
    throw { code: 'unauthorized', message: 'Please log in to continue.' };
  }
  return { onboardingStatus: 'COMPLETED' };
};

/**
 * Get Current User
 */
export const getCurrentUser = async (accessToken) => {
  if (!accessToken) {
    throw { code: 'unauthorized', message: 'Please log in to continue.' };
  }
  
  const storedUser = localStorage.getItem('pulse_user');
  if (storedUser) {
    return {
      user: JSON.parse(storedUser),
      onboardingStatus: localStorage.getItem('pulse_onboarding_state') || 'NOT_STARTED',
    };
  }
  
  throw { code: 'not_found', message: 'User not found.' };
};

/**
 * Check network connectivity
 */
export const checkConnection = () => {
  return navigator.onLine;
};

/**
 * Wrapper for API calls with error handling
 */
export const apiCall = async (apiFunction, ...args) => {
  // Check connection first
  if (!checkConnection()) {
    throw {
      code: 'no_internet',
      message: 'No internet connection. Please check your connection and try again.',
    };
  }
  
  try {
    return await apiFunction(...args);
  } catch (error) {
    // If it's already a formatted error, rethrow
    if (error.code) {
      throw error;
    }
    // Otherwise, wrap in generic error
    throw {
      code: 'server_error',
      message: 'Something went wrong. Please try again.',
      originalError: error,
    };
  }
};

export default {
  requestOtp,
  verifyOtp,
  updateProfile,
  confirmAge,
  getCurrentUser,
  formatPhoneForDisplay,
  checkConnection,
  apiCall,
  // Login flow
  loginWithPassword,
  verifyLoginOtp,
  resendLoginOtp,
  requestPasswordReset,
  loginWithPhone,
  // Password reset flow
  requestPasswordResetByPhone,
  verifyPasswordResetOtp,
  resendPasswordResetOtp,
  setNewPassword,
  // Account management
  deleteAccount,
};
