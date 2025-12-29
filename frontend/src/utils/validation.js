// Validation utilities for onboarding forms

// Phone number validation
export const validatePhone = (phoneNumber, countryCode = '+972') => {
  const digits = phoneNumber.replace(/\D/g, '');
  
  if (!digits) {
    return { valid: false, error: 'Please enter your phone number' };
  }
  
  // Israeli numbers should be 9-10 digits
  if (countryCode === '+972') {
    if (digits.length < 9 || digits.length > 10) {
      return { valid: false, error: 'Invalid phone number' };
    }
  } else {
    // Generic validation: at least 7 digits
    if (digits.length < 7) {
      return { valid: false, error: 'Invalid phone number' };
    }
  }
  
  return { valid: true, error: null };
};

// OTP validation
export const validateOtp = (otp, length = 6) => {
  const code = Array.isArray(otp) ? otp.join('') : otp;
  
  if (!code || code.length !== length) {
    return { valid: false, error: 'Please enter the complete verification code' };
  }
  
  if (!/^\d+$/.test(code)) {
    return { valid: false, error: 'Code must contain only numbers' };
  }
  
  return { valid: true, error: null };
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  const trimmed = name?.trim() || '';
  
  if (!trimmed) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: `${fieldName} must be less than 50 characters` };
  }
  
  // Check for invalid characters
  if (!/^[a-zA-Z\u0590-\u05FF\s'-]+$/.test(trimmed)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }
  
  return { valid: true, error: null };
};

// Date of birth validation
export const validateDateOfBirth = (dateOfBirth, minAge = 18, maxAge = 100) => {
  if (!dateOfBirth) {
    return { valid: false, error: 'Date of birth is required' };
  }
  
  const dob = new Date(dateOfBirth);
  const today = new Date();
  
  // Check if valid date
  if (isNaN(dob.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  // Check if in the future
  if (dob > today) {
    return { valid: false, error: 'Date of birth cannot be in the future' };
  }
  
  // Calculate age
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  if (age < minAge) {
    return { valid: false, error: `You must be at least ${minAge} years old`, age };
  }
  
  if (age > maxAge) {
    return { valid: false, error: 'Invalid date of birth', age };
  }
  
  return { valid: true, error: null, age };
};

// Bio validation
export const validateBio = (bio, maxLength = 500) => {
  const trimmed = bio?.trim() || '';
  
  if (trimmed.length > maxLength) {
    return { valid: false, error: `Bio must be less than ${maxLength} characters` };
  }
  
  return { valid: true, error: null };
};

// Interests validation
export const validateInterests = (interests, minCount = 3, maxCount = 10) => {
  if (!Array.isArray(interests)) {
    return { valid: false, error: 'Invalid interests format' };
  }
  
  if (interests.length < minCount) {
    return { valid: false, error: `Please select at least ${minCount} interests` };
  }
  
  if (interests.length > maxCount) {
    return { valid: false, error: `You can select up to ${maxCount} interests` };
  }
  
  return { valid: true, error: null };
};

// Photos validation
export const validatePhotos = (photos, minCount = 2, maxCount = 6) => {
  if (!Array.isArray(photos)) {
    return { valid: false, error: 'Invalid photos format' };
  }
  
  const validPhotos = photos.filter(p => p !== null);
  
  if (validPhotos.length < minCount) {
    return { valid: false, error: `Please upload at least ${minCount} photos` };
  }
  
  if (validPhotos.length > maxCount) {
    return { valid: false, error: `You can upload up to ${maxCount} photos` };
  }
  
  return { valid: true, error: null };
};

// Email validation (for future use)
export const validateEmail = (email) => {
  const trimmed = email?.trim() || '';
  
  if (!trimmed) {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true, error: null };
};

// Height validation
export const validateHeight = (height, minCm = 100, maxCm = 250) => {
  const value = parseInt(height, 10);
  
  if (isNaN(value)) {
    return { valid: false, error: 'Invalid height' };
  }
  
  if (value < minCm || value > maxCm) {
    return { valid: false, error: `Height must be between ${minCm}cm and ${maxCm}cm` };
  }
  
  return { valid: true, error: null };
};

// Prompt answer validation
export const validatePromptAnswer = (answer, maxLength = 250) => {
  const trimmed = answer?.trim() || '';
  
  if (!trimmed) {
    return { valid: false, error: 'Answer is required' };
  }
  
  if (trimmed.length > maxLength) {
    return { valid: false, error: `Answer must be less than ${maxLength} characters` };
  }
  
  return { valid: true, error: null };
};

// Generic required field validation
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && !value.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  return { valid: true, error: null };
};

// Combine multiple validations
export const combineValidations = (...validations) => {
  for (const validation of validations) {
    if (!validation.valid) {
      return validation;
    }
  }
  return { valid: true, error: null };
};

// Form validation helper
export const validateForm = (fields) => {
  const errors = {};
  let isValid = true;
  
  for (const [fieldName, { value, validators }] of Object.entries(fields)) {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        errors[fieldName] = result.error;
        isValid = false;
        break;
      }
    }
  }
  
  return { isValid, errors };
};
