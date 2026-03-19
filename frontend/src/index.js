import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@mui/material/styles';

// Suppress ResizeObserver loop error (non-critical, common in React apps with animations)
const resizeObserverErr = window.onerror;
window.onerror = (message, ...args) => {
  if (message?.includes?.('ResizeObserver loop')) {
    return true; // Suppress the error
  }
  return resizeObserverErr?.(message, ...args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
