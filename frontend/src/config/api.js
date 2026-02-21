// API Configuration
// All API calls should use this base URL

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// WebSocket URL (convert http(s) to ws(s))
export const getWebSocketUrl = (path = '') => {
  const base = API_URL.replace(/^http/, 'ws');
  return `${base}${path}`;
};
