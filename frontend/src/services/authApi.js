/**
 * Mock Auth API Service
 * Simulates backend authentication endpoints
 * Replace with real API calls when backend is ready
 */

// Simulated delay for realistic UX
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock storage for verification codes (in real app, this is server-side)
const mockOtpStorage = new Map();

// Rate limiting simulation
const rateLimitStorage = new Map();
const MAX_OTP_REQUESTS = 3;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_VERIFY_ATTEMPTS = 5;

// Generate random 6-digit code
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate mock tokens
const generateTokens = () => ({
  accessToken: `mock_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  refreshToken: `mock_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
});

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
 * POST /auth/otp/request
 */
export const requestOtp = async (phoneE164) => {
  await delay(800 + Math.random() * 400); // Simulate network delay
  
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
  
  // Generate and store OTP
  const otp = generateOtp();
  const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  
  mockOtpStorage.set(verificationId, {
    phone: phoneE164,
    otp,
    expiresAt,
    attempts: 0,
  });
  
  // In development, log the OTP for testing
  console.log(`[Mock OTP] Code for ${phoneE164}: ${otp}`);
  
  return {
    verificationId,
    expiresInSec: 300, // 5 minutes
    resendInSec: 30,
  };
};

/**
 * Verify OTP
 * POST /auth/otp/verify
 */
export const verifyOtp = async (verificationId, code) => {
  await delay(600 + Math.random() * 300);
  
  const record = mockOtpStorage.get(verificationId);
  
  if (!record) {
    throw {
      code: 'expired_code',
      message: 'Verification code expired. Please request a new one.',
    };
  }
  
  // Check rate limit for verification attempts
  const rateCheck = checkRateLimit(record.phone, 'verify');
  if (!rateCheck.allowed) {
    throw {
      code: 'too_many_attempts',
      message: `Too many attempts. Try again in ${rateCheck.waitTime} seconds.`,
      retryAfter: rateCheck.waitTime,
    };
  }
  
  // Check expiration
  if (Date.now() > record.expiresAt) {
    mockOtpStorage.delete(verificationId);
    throw {
      code: 'expired_code',
      message: 'Verification code expired. Please request a new one.',
    };
  }
  
  // Verify code
  if (record.otp !== code) {
    record.attempts++;
    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      mockOtpStorage.delete(verificationId);
      throw {
        code: 'too_many_attempts',
        message: 'Too many incorrect attempts. Please request a new code.',
      };
    }
    throw {
      code: 'wrong_code',
      message: 'Incorrect code. Please try again.',
      attemptsRemaining: MAX_VERIFY_ATTEMPTS - record.attempts,
    };
  }
  
  // Success - clean up and return tokens
  mockOtpStorage.delete(verificationId);
  
  // Check if user exists (mock - always new user for now)
  const isNewUser = true;
  
  return {
    ...generateTokens(),
    user: {
      id: `user_${Date.now()}`,
      phoneE164: record.phone,
      onboardingStatus: isNewUser ? 'NOT_STARTED' : 'COMPLETED',
    },
  };
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

// Mock users database for login simulation
const mockUsersDb = new Map([
  ['testuser', { 
    id: 'user_1234567890',
    username: 'testuser',
    email: 'test@pulse.app',
    password: 'password123', // In real app, this would be hashed
    phoneE164: '+972501234567',
    firstName: 'Test',
    onboardingStatus: 'COMPLETED',
  }],
  ['demo', { 
    id: 'user_0987654321',
    username: 'demo',
    email: 'demo@pulse.app',
    password: 'demo123',
    phoneE164: '+972509876543',
    firstName: 'Demo',
    onboardingStatus: 'COMPLETED',
  }],
]);

// Also index by email for lookup
const mockUsersByEmail = new Map([
  ['test@pulse.app', 'testuser'],
  ['demo@pulse.app', 'demo'],
]);

// Login verification storage (for secondary OTP)
const loginVerificationStorage = new Map();

/**
 * Login with Password (Primary Authentication)
 * POST /auth/login
 * 
 * Returns:
 * - On success: { requiresOtp: boolean, verificationId?: string, user?: object }
 * - On failure: throws error
 */
export const loginWithPassword = async (usernameOrEmail, password) => {
  await delay(800 + Math.random() * 400);
  
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
  
  // Normalize input
  const normalizedInput = usernameOrEmail.toLowerCase().trim();
  
  // Find user by username or email
  let username = normalizedInput;
  if (normalizedInput.includes('@')) {
    username = mockUsersByEmail.get(normalizedInput);
  }
  
  const user = mockUsersDb.get(username);
  
  // User not found
  if (!user) {
    throw {
      code: 'user_not_found',
      message: 'No account found with these details',
    };
  }
  
  // Check password
  if (user.password !== password) {
    throw {
      code: 'invalid_credentials',
      message: 'Incorrect username or password',
    };
  }
  
  // Check if secondary verification is needed
  // For MVP, we'll require OTP on every login (can be changed to conditional)
  const requiresOtp = true; // In production: check device, IP, etc.
  
  if (requiresOtp) {
    // Generate OTP for login verification
    const otp = generateOtp();
    const verificationId = `login_verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    loginVerificationStorage.set(verificationId, {
      userId: user.id,
      phone: user.phoneE164,
      otp,
      expiresAt,
      attempts: 0,
    });
    
    // Log OTP for testing
    console.log(`[Mock Login OTP] Code for ${user.phoneE164}: ${otp}`);
    
    return {
      requiresOtp: true,
      verificationId,
      maskedPhone: formatPhoneForDisplay(user.phoneE164),
      expiresInSec: 300,
      resendInSec: 30,
    };
  }
  
  // Direct login without OTP
  return {
    requiresOtp: false,
    ...generateTokens(),
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phoneE164: user.phoneE164,
      firstName: user.firstName,
      onboardingStatus: user.onboardingStatus,
    },
  };
};

/**
 * Verify Login OTP (Secondary Authentication)
 * POST /auth/login/verify
 */
export const verifyLoginOtp = async (verificationId, code) => {
  await delay(600 + Math.random() * 300);
  
  const record = loginVerificationStorage.get(verificationId);
  
  if (!record) {
    throw {
      code: 'expired_code',
      message: 'Verification code expired. Please log in again.',
    };
  }
  
  // Check rate limit
  const rateCheck = checkRateLimit(record.phone, 'login_verify');
  if (!rateCheck.allowed) {
    throw {
      code: 'too_many_attempts',
      message: `Too many attempts. Try again in ${rateCheck.waitTime} seconds.`,
      retryAfter: rateCheck.waitTime,
    };
  }
  
  // Check expiration
  if (Date.now() > record.expiresAt) {
    loginVerificationStorage.delete(verificationId);
    throw {
      code: 'expired_code',
      message: 'Verification code expired. Please log in again.',
    };
  }
  
  // Verify code
  if (record.otp !== code) {
    record.attempts++;
    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      loginVerificationStorage.delete(verificationId);
      throw {
        code: 'too_many_attempts',
        message: 'Too many incorrect attempts. Please log in again.',
      };
    }
    throw {
      code: 'wrong_code',
      message: 'Incorrect code. Please try again.',
      attemptsRemaining: MAX_VERIFY_ATTEMPTS - record.attempts,
    };
  }
  
  // Success - find user and generate tokens
  loginVerificationStorage.delete(verificationId);
  
  // Find user by ID
  let foundUser = null;
  for (const user of mockUsersDb.values()) {
    if (user.id === record.userId) {
      foundUser = user;
      break;
    }
  }
  
  if (!foundUser) {
    throw {
      code: 'user_not_found',
      message: 'User not found. Please try again.',
    };
  }
  
  return {
    ...generateTokens(),
    user: {
      id: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      phoneE164: foundUser.phoneE164,
      firstName: foundUser.firstName,
      onboardingStatus: foundUser.onboardingStatus,
    },
  };
};

/**
 * Resend Login OTP
 * POST /auth/login/resend-otp
 */
export const resendLoginOtp = async (verificationId) => {
  await delay(600 + Math.random() * 300);
  
  const record = loginVerificationStorage.get(verificationId);
  
  if (!record) {
    throw {
      code: 'session_expired',
      message: 'Session expired. Please log in again.',
    };
  }
  
  // Check rate limit
  const rateCheck = checkRateLimit(record.phone, 'login_request');
  if (!rateCheck.allowed) {
    throw {
      code: 'rate_limited',
      message: `Too many attempts. Try again in ${rateCheck.waitTime} seconds.`,
      retryAfter: rateCheck.waitTime,
    };
  }
  
  // Generate new OTP
  const newOtp = generateOtp();
  record.otp = newOtp;
  record.expiresAt = Date.now() + 5 * 60 * 1000;
  record.attempts = 0;
  
  console.log(`[Mock Login OTP Resend] Code for ${record.phone}: ${newOtp}`);
  
  return {
    success: true,
    expiresInSec: 300,
    resendInSec: 30,
  };
};

// Password reset verification storage
const passwordResetStorage = new Map();

/**
 * Request Password Reset by Phone
 * POST /auth/forgot-password/phone
 * For existing users only
 */
export const requestPasswordResetByPhone = async (phoneE164) => {
  await delay(800 + Math.random() * 400);
  
  if (!phoneE164 || !validatePhone(phoneE164)) {
    throw {
      code: 'invalid_phone',
      message: 'Invalid phone number',
    };
  }
  
  // Check rate limit
  const rateCheck = checkRateLimit(phoneE164, 'reset_request');
  if (!rateCheck.allowed) {
    throw {
      code: 'rate_limited',
      message: `Too many attempts. Try again in ${rateCheck.waitTime} seconds.`,
      retryAfter: rateCheck.waitTime,
    };
  }
  
  // Find user by phone
  let foundUser = null;
  for (const user of mockUsersDb.values()) {
    if (user.phoneE164 === phoneE164) {
      foundUser = user;
      break;
    }
  }
  
  if (!foundUser) {
    throw {
      code: 'user_not_found',
      message: 'No account found with this phone number',
    };
  }
  
  // Generate OTP
  const otp = generateOtp();
  const verificationId = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = Date.now() + 5 * 60 * 1000;
  
  passwordResetStorage.set(verificationId, {
    userId: foundUser.id,
    phone: phoneE164,
    otp,
    expiresAt,
    attempts: 0,
    verified: false,
  });
  
  console.log(`[Mock Password Reset OTP] Code for ${phoneE164}: ${otp}`);
  
  return {
    verificationId,
    maskedPhone: formatPhoneForDisplay(phoneE164),
    expiresInSec: 300,
    resendInSec: 30,
  };
};

/**
 * Verify Password Reset OTP
 * POST /auth/forgot-password/verify
 */
export const verifyPasswordResetOtp = async (verificationId, code) => {
  await delay(600 + Math.random() * 300);
  
  const record = passwordResetStorage.get(verificationId);
  
  if (!record) {
    throw {
      code: 'expired_code',
      message: 'Verification code expired. Please request a new one.',
    };
  }
  
  // Check rate limit
  const rateCheck = checkRateLimit(record.phone, 'reset_verify');
  if (!rateCheck.allowed) {
    throw {
      code: 'too_many_attempts',
      message: `Too many attempts. Try again in ${rateCheck.waitTime} seconds.`,
      retryAfter: rateCheck.waitTime,
    };
  }
  
  // Check expiration
  if (Date.now() > record.expiresAt) {
    passwordResetStorage.delete(verificationId);
    throw {
      code: 'expired_code',
      message: 'Verification code expired. Please request a new one.',
    };
  }
  
  // Verify code
  if (record.otp !== code) {
    record.attempts++;
    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      passwordResetStorage.delete(verificationId);
      throw {
        code: 'too_many_attempts',
        message: 'Too many incorrect attempts. Please request a new code.',
      };
    }
    throw {
      code: 'wrong_code',
      message: 'Incorrect code. Please try again.',
      attemptsRemaining: MAX_VERIFY_ATTEMPTS - record.attempts,
    };
  }
  
  // Mark as verified (allows setting new password)
  record.verified = true;
  record.expiresAt = Date.now() + 10 * 60 * 1000; // 10 more minutes to set password
  
  return {
    success: true,
    verificationId,
  };
};

/**
 * Resend Password Reset OTP
 * POST /auth/forgot-password/resend
 */
export const resendPasswordResetOtp = async (verificationId) => {
  await delay(600 + Math.random() * 300);
  
  const record = passwordResetStorage.get(verificationId);
  
  if (!record) {
    throw {
      code: 'session_expired',
      message: 'Session expired. Please start over.',
    };
  }
  
  // Check rate limit
  const rateCheck = checkRateLimit(record.phone, 'reset_request');
  if (!rateCheck.allowed) {
    throw {
      code: 'rate_limited',
      message: `Too many attempts. Try again in ${rateCheck.waitTime} seconds.`,
      retryAfter: rateCheck.waitTime,
    };
  }
  
  // Generate new OTP
  const newOtp = generateOtp();
  record.otp = newOtp;
  record.expiresAt = Date.now() + 5 * 60 * 1000;
  record.attempts = 0;
  record.verified = false;
  
  console.log(`[Mock Password Reset OTP Resend] Code for ${record.phone}: ${newOtp}`);
  
  return {
    success: true,
    expiresInSec: 300,
    resendInSec: 30,
  };
};

/**
 * Set New Password
 * POST /auth/forgot-password/set
 */
export const setNewPassword = async (verificationId, newPassword, confirmPassword) => {
  await delay(600 + Math.random() * 300);
  
  const record = passwordResetStorage.get(verificationId);
  
  if (!record || !record.verified) {
    throw {
      code: 'session_expired',
      message: 'Session expired. Please start over.',
    };
  }
  
  // Check expiration
  if (Date.now() > record.expiresAt) {
    passwordResetStorage.delete(verificationId);
    throw {
      code: 'session_expired',
      message: 'Session expired. Please start over.',
    };
  }
  
  // Validate password
  if (!newPassword || newPassword.length < 6) {
    throw {
      code: 'validation_error',
      message: 'Password must be at least 6 characters',
      field: 'newPassword',
    };
  }
  
  if (newPassword !== confirmPassword) {
    throw {
      code: 'validation_error',
      message: 'Passwords do not match',
      field: 'confirmPassword',
    };
  }
  
  // Find and update user password (mock)
  for (const [username, user] of mockUsersDb.entries()) {
    if (user.id === record.userId) {
      user.password = newPassword;
      console.log(`[Mock] Password updated for user: ${username}`);
      break;
    }
  }
  
  // Clean up
  passwordResetStorage.delete(verificationId);
  
  return {
    success: true,
    message: 'Your password has been updated',
  };
};

/**
 * Delete Account
 * DELETE /users/me
 */
export const deleteAccount = async (accessToken) => {
  await delay(800 + Math.random() * 400);
  
  if (!accessToken) {
    throw {
      code: 'unauthorized',
      message: 'Please log in to continue.',
    };
  }
  
  // In real app, would delete user data from database
  // For mock, just return success
  console.log('[Mock] Account deleted');
  
  return {
    success: true,
    message: 'Your account has been deleted',
  };
};

/**
 * Request Password Reset (legacy - by username/email)
 * POST /auth/forgot-password
 */
export const requestPasswordReset = async (usernameOrEmail) => {
  await delay(800 + Math.random() * 400);
  
  if (!usernameOrEmail || usernameOrEmail.trim().length < 3) {
    throw {
      code: 'validation_error',
      message: 'Please enter a valid username or email',
    };
  }
  
  const normalizedInput = usernameOrEmail.toLowerCase().trim();
  
  let username = normalizedInput;
  if (normalizedInput.includes('@')) {
    username = mockUsersByEmail.get(normalizedInput);
  }
  
  const user = mockUsersDb.get(username);
  
  // Always return success to prevent user enumeration
  // In real app, only send OTP if user exists
  if (user) {
    const otp = generateOtp();
    console.log(`[Mock Password Reset OTP] Code for ${user.phoneE164}: ${otp}`);
  }
  
  return {
    success: true,
    message: 'If an account exists, a verification code has been sent.',
  };
};

/**
 * Login with Phone Number (Alternative Login)
 * POST /auth/login/phone
 * Only for existing users
 */
export const loginWithPhone = async (phoneE164) => {
  await delay(800 + Math.random() * 400);
  
  if (!phoneE164 || !validatePhone(phoneE164)) {
    throw {
      code: 'invalid_phone',
      message: 'Invalid phone number',
    };
  }
  
  // Find user by phone
  let foundUser = null;
  for (const user of mockUsersDb.values()) {
    if (user.phoneE164 === phoneE164) {
      foundUser = user;
      break;
    }
  }
  
  if (!foundUser) {
    throw {
      code: 'user_not_found',
      message: 'No account found with this phone number',
    };
  }
  
  // Generate OTP
  const otp = generateOtp();
  const verificationId = `phone_login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = Date.now() + 5 * 60 * 1000;
  
  loginVerificationStorage.set(verificationId, {
    userId: foundUser.id,
    phone: phoneE164,
    otp,
    expiresAt,
    attempts: 0,
    type: 'phone_login',
  });
  
  console.log(`[Mock Phone Login OTP] Code for ${phoneE164}: ${otp}`);
  
  return {
    verificationId,
    maskedPhone: formatPhoneForDisplay(phoneE164),
    expiresInSec: 300,
    resendInSec: 30,
  };
};

/**
 * Confirm Age (complete onboarding)
 * POST /users/me/confirm-age
 */
export const confirmAge = async (accessToken) => {
  await delay(300);
  
  if (!accessToken) {
    throw {
      code: 'unauthorized',
      message: 'Please log in to continue.',
    };
  }
  
  return {
    onboardingStatus: 'COMPLETED',
  };
};

/**
 * Get Current User
 * GET /users/me
 */
export const getCurrentUser = async (accessToken) => {
  await delay(400);
  
  if (!accessToken) {
    throw {
      code: 'unauthorized',
      message: 'Please log in to continue.',
    };
  }
  
  // Return mock user data from localStorage if exists
  const storedUser = localStorage.getItem('pulse_user');
  if (storedUser) {
    return {
      user: JSON.parse(storedUser),
      onboardingStatus: localStorage.getItem('pulse_onboarding_state') || 'NOT_STARTED',
    };
  }
  
  throw {
    code: 'not_found',
    message: 'User not found.',
  };
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
