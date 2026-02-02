import React from 'react';
import { Box } from '@mui/material';
import { Check } from 'lucide-react';
import { SOS_STATE } from '../context/MeetingContext';

/**
 * MeetingStatusIcon - Visual status indicator for meeting state
 * 
 * Shows two people connected by a line that changes based on state:
 * - Meeting in progress: solid line (purple, calm, static)
 * - SOS searching: dotted line + soft pulse animation
 * - Helper found: line starts filling (progress fill)
 * - Helper approaching: line almost complete + gentle motion
 * - Helper arrived: completed line + subtle check
 */
function MeetingStatusIcon({ sosState = SOS_STATE.NONE, size = 32 }) {
  const iconSize = size;
  const personSize = iconSize * 0.35;
  const lineWidth = iconSize * 0.3;
  const lineHeight = 3;
  
  // Calculate fill percentage based on SOS state
  const getFillPercentage = () => {
    switch (sosState) {
      case SOS_STATE.NONE:
        return 100; // Full solid line
      case SOS_STATE.SEARCHING:
        return 0; // Dotted, no fill
      case SOS_STATE.HELPER_FOUND:
        return 30; // Starting to fill
      case SOS_STATE.HELPER_APPROACHING:
        return 75; // Almost complete
      case SOS_STATE.HELPER_ARRIVED:
        return 100; // Complete
      default:
        return 100;
    }
  };

  const fillPercentage = getFillPercentage();
  const isSearching = sosState === SOS_STATE.SEARCHING;
  const isApproaching = sosState === SOS_STATE.HELPER_APPROACHING;
  const hasArrived = sosState === SOS_STATE.HELPER_ARRIVED;

  return (
    <Box
      sx={{
        position: 'relative',
        width: iconSize,
        height: iconSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.2)',
        // Pulse animation for searching state
        ...(isSearching && {
          animation: 'meetingIconPulse 2s ease-in-out infinite',
        }),
        // Gentle motion for approaching state
        ...(isApproaching && {
          animation: 'meetingIconGentleMove 1.5s ease-in-out infinite',
        }),
        // Confirmation animation for arrived state
        ...(hasArrived && {
          animation: 'meetingIconConfirm 0.5s ease-out',
        }),
        '@keyframes meetingIconPulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: 1,
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: 0.85,
          },
        },
        '@keyframes meetingIconGentleMove': {
          '0%, 100%': {
            transform: 'translateX(0)',
          },
          '50%': {
            transform: 'translateX(2px)',
          },
        },
        '@keyframes meetingIconConfirm': {
          '0%': {
            transform: 'scale(0.95)',
          },
          '50%': {
            transform: 'scale(1.1)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
      }}
    >
      {/* Left Person */}
      <Box
        sx={{
          position: 'absolute',
          left: iconSize * 0.12,
          width: personSize,
          height: personSize,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Head */}
        <Box
          sx={{
            width: personSize * 0.5,
            height: personSize * 0.5,
            borderRadius: '50%',
            bgcolor: '#fff',
            mb: 0.25,
          }}
        />
        {/* Body */}
        <Box
          sx={{
            width: personSize * 0.7,
            height: personSize * 0.5,
            borderRadius: '50% 50% 0 0',
            bgcolor: '#fff',
          }}
        />
      </Box>

      {/* Connecting Line */}
      <Box
        sx={{
          position: 'absolute',
          width: lineWidth,
          height: lineHeight,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'rgba(255,255,255,0.3)',
          borderRadius: lineHeight / 2,
          overflow: 'hidden',
          // Dotted effect for searching
          ...(isSearching && {
            background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 3px, transparent 3px, transparent 6px)',
          }),
        }}
      >
        {/* Fill Progress */}
        {!isSearching && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${fillPercentage}%`,
              bgcolor: '#fff',
              borderRadius: lineHeight / 2,
              transition: 'width 0.5s ease-out',
            }}
          />
        )}
      </Box>

      {/* Right Person */}
      <Box
        sx={{
          position: 'absolute',
          right: iconSize * 0.12,
          width: personSize,
          height: personSize,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Head */}
        <Box
          sx={{
            width: personSize * 0.5,
            height: personSize * 0.5,
            borderRadius: '50%',
            bgcolor: '#fff',
            mb: 0.25,
          }}
        />
        {/* Body */}
        <Box
          sx={{
            width: personSize * 0.7,
            height: personSize * 0.5,
            borderRadius: '50% 50% 0 0',
            bgcolor: '#fff',
          }}
        />
      </Box>

      {/* Check mark for arrived state */}
      {hasArrived && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            bgcolor: '#fff',
            borderRadius: '50%',
            width: 14,
            height: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        >
          <Check size={10} color="#6C5CE7" strokeWidth={3} />
        </Box>
      )}
    </Box>
  );
}

export default MeetingStatusIcon;
