// API Base URL configuration for CRA
// In production: set REACT_APP_API_BASE_URL=https://pulse-dating-backend.onrender.com
// In local dev: defaults to localhost:5000

const defaultLocal = 'http://localhost:5000';
export const API_BASE = (process.env.REACT_APP_API_BASE_URL || defaultLocal).replace(/\/$/, '');
