// API Configuration
// All API calls should use this base URL

// Production backend URL - SINGLE SOURCE OF TRUTH
const PRODUCTION_API_URL = 'https://pulse-dating-backend.onrender.com';

// Use env var if set, otherwise use production URL in production, localhost in dev
export const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : 'http://localhost:5000');

// Log API URL on startup for debugging
console.log(`[API Config] API_URL=${API_URL}, NODE_ENV=${process.env.NODE_ENV}`);

// WebSocket URL (convert http(s) to ws(s))
export const getWebSocketUrl = (path = '') => {
  const base = API_URL.replace(/^http/, 'ws');
  return `${base}${path}`;
};

/**
 * Update user's location on the backend.
 * Called when user enters Nearby screen or grants location permission.
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} token - JWT auth token
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateUserLocation = async (latitude, longitude, token) => {
  console.log('[updateUserLocation] Called with:', { latitude, longitude, tokenPresent: !!token });
  console.log('[updateUserLocation] API_URL:', API_URL);
  
  if (!token) {
    console.error('[updateUserLocation] No token provided!');
    return { success: false, error: 'no_token' };
  }
  
  const url = `${API_URL}/api/location`;
  console.log('[updateUserLocation] Fetching:', url);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ latitude, longitude }),
    });
    console.log('[updateUserLocation] Response status:', response.status);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error('[updateUserLocation] Request failed:', data);
      return { success: false, error: data.error || 'request_failed' };
    }
    console.log('[updateUserLocation] Success!');
    return { success: true };
  } catch (err) {
    console.error('[updateUserLocation] Network error:', err);
    return { success: false, error: 'network_error' };
  }
};
