// API Configuration
// All API calls should use this base URL

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
  if (!token) {
    return { success: false, error: 'no_token' };
  }
  try {
    const response = await fetch(`${API_URL}/api/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ latitude, longitude }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: data.error || 'request_failed' };
    }
    return { success: true };
  } catch (err) {
    console.error('[updateUserLocation] Error:', err);
    return { success: false, error: 'network_error' };
  }
};
