/**
 * DecisionZone.jsx
 * Like/Pass buttons at bottom of Profile Timeline
 * Large centered buttons with generous whitespace
 * Includes Undo button to go back to previous profile
 */

import React from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { X, Heart, Undo2 } from 'lucide-react';

const DecisionZone = ({ onLike, onPass, onUndo, canUndo, hideUndo, userName }) => {
  // Scroll to top instantly (no animation) for seamless profile transition
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleLike = () => {
    onLike?.();
    // Small delay to let the new profile render, then scroll
    requestAnimationFrame(() => {
      scrollToTop();
    });
  };

  const handlePass = () => {
    onPass?.();
    requestAnimationFrame(() => {
      scrollToTop();
    });
  };

  const handleUndo = () => {
    onUndo?.();
    requestAnimationFrame(() => {
      scrollToTop();
    });
  };

  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        bgcolor: '#fff',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <Typography
        sx={{
          fontSize: 14,
          color: '#9ca3af',
          fontWeight: 500,
        }}
      >
        What do you think?
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: hideUndo ? 6 : 4 }}>
        {/* Undo Button - smaller, to the left (hidden in Today's Picks profile view) */}
        {!hideUndo && (
          <Tooltip title="Go back" placement="top">
            <span>
              <IconButton
                onClick={handleUndo}
                disabled={!canUndo}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#fff',
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  opacity: canUndo ? 1 : 0.4,
                  '&:hover': {
                    bgcolor: '#f9fafb',
                    transform: canUndo ? 'scale(1.05)' : 'none',
                  },
                  '&:disabled': {
                    bgcolor: '#f9fafb',
                    border: '2px solid #f3f4f6',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Undo2 size={22} color={canUndo ? '#6b7280' : '#d1d5db'} strokeWidth={2} />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {/* Pass Button */}
        <IconButton
          onClick={handlePass}
          sx={{
            width: 72,
            height: 72,
            bgcolor: '#fff',
            border: '2px solid #fee2e2',
            boxShadow: '0 4px 12px rgba(239,68,68,0.15)',
            '&:hover': {
              bgcolor: '#fef2f2',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <X size={32} color="#ef4444" strokeWidth={2.5} />
        </IconButton>
        
        {/* Like Button */}
        <IconButton
          onClick={handleLike}
          sx={{
            width: 72,
            height: 72,
            bgcolor: '#fff',
            border: '2px solid #dcfce7',
            boxShadow: '0 4px 12px rgba(34,197,94,0.15)',
            '&:hover': {
              bgcolor: '#f0fdf4',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <Heart size={32} color="#22c55e" strokeWidth={2.5} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default DecisionZone;
