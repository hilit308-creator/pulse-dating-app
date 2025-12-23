import React from "react";
import { Avatar, IconButton, useTheme, Box } from "@mui/material";
import SettingsIconMonochrome from './SettingsIconMonochrome';

// Props: photoUrl (string), onClick (function), alt (string), size (number, px)
import { useNavigate } from 'react-router-dom';

export default function UserAvatarButton({ photoUrl, onClick, alt = "User avatar", size = 28 }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const handleSettingsClick = () => navigate('/settings');
  const handleClick = onClick || (() => navigate('/profile-settings'));
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, position: 'absolute', top: 16, right: document.dir === 'rtl' ? 'unset' : 16, left: document.dir === 'rtl' ? 16 : 'unset', zIndex: 1200 }}>
      <IconButton
        onClick={handleClick}
        sx={{
          p: 0,
          m: 0,
          width: size + 8,
          height: size + 8,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.7)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          transition: "transform 0.15s, box-shadow 0.18s",
          '&:hover': {
            transform: 'scale(1.08)',
            boxShadow: `0 0 12px 2px ${theme.palette.primary.light}`,
          },
        }}
        aria-label="User profile"
      >
        <Avatar
          src={photoUrl}
          alt={alt}
          sx={{
            width: size,
            height: size,
            bgcolor: "transparent",
            color: "inherit",
            fontSize: size * 0.7,
            p: 0,
          }}
        >
          {!photoUrl && (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="32" fill="#f2f2f2" />
              <path d="M32 33c5.5 0 10-4.5 10-10s-4.5-10-10-10-10 4.5-10 10 4.5 10 10 10zm0 4c-6.6 0-20 3.3-20 10v3a1 1 0 001 1h38a1 1 0 001-1v-3c0-6.7-13.4-10-20-10z" fill="#2e2e2e" />
            </svg>
          )}
        </Avatar>
      </IconButton>
      <IconButton
        onClick={handleSettingsClick}
        sx={{
          p: 0,
          m: 0,
          width: size + 8,
          height: size + 8,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.7)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          transition: "transform 0.15s, box-shadow 0.18s",
          '&:hover': {
            transform: 'scale(1.08)',
            boxShadow: `0 0 12px 2px ${theme.palette.primary.light}`,
          },
        }}
        aria-label="Settings"
      >
        <SettingsIconMonochrome size={size} />
      </IconButton>
    </Box>
  );
}
