/**
 * VisibilityStatusIndicator - Shows current visibility status
 * 
 * 🔒 IMPORTANT: This component only DISPLAYS server state.
 * It does NOT calculate visibility - server is source of truth.
 * 
 * Usage:
 * <VisibilityStatusIndicator 
 *   status={{ isVisible: true, reason: 'VISIBLE', nextChangeAt: '...' }}
 *   compact={false}
 * />
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Eye, EyeOff, Clock, MapPin, Pause, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { VISIBILITY_REASONS, getVisibilityStatusDisplay, formatTimeUntil } from '../services/VisibilityService';

const VisibilityStatusIndicator = ({ 
  status, 
  compact = false,
  showNextChange = true,
  onClick,
}) => {
  const { t, language } = useLanguage();
  const lang = language === 'עברית' ? 'he' : 'en';
  
  // Get display info based on reason
  const displayInfo = getVisibilityStatusDisplay(status?.reason || VISIBILITY_REASONS.VISIBLE, lang);
  
  // Get icon based on reason
  const getIcon = () => {
    const size = compact ? 14 : 18;
    const color = displayInfo.color;
    
    switch (status?.reason) {
      case VISIBILITY_REASONS.VISIBLE:
        return <Eye size={size} color={color} />;
      case VISIBILITY_REASONS.PAUSED:
        return <Pause size={size} color={color} />;
      case VISIBILITY_REASONS.OUTSIDE_TIME:
        return <Clock size={size} color={color} />;
      case VISIBILITY_REASONS.OUTSIDE_LOCATION:
      case VISIBILITY_REASONS.GPS_UNAVAILABLE:
        return <MapPin size={size} color={color} />;
      case VISIBILITY_REASONS.SYSTEM_BLOCKED:
        return <AlertCircle size={size} color={color} />;
      default:
        return <EyeOff size={size} color={color} />;
    }
  };

  // Format next change time
  const nextChangeText = status?.nextChangeAt 
    ? formatTimeUntil(new Date(status.nextChangeAt))
    : null;

  if (compact) {
    return (
      <Box
        onClick={onClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 0.5,
          borderRadius: '20px',
          backgroundColor: `${displayInfo.color}15`,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s',
          '&:hover': onClick ? {
            backgroundColor: `${displayInfo.color}25`,
          } : {},
        }}
      >
        {/* Status dot */}
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: displayInfo.color,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: displayInfo.color,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        >
          {status?.isVisible 
            ? (t('visible') || 'Visible') 
            : (t('hidden') || 'Hidden')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 2,
        borderRadius: '12px',
        backgroundColor: `${displayInfo.color}10`,
        border: `1px solid ${displayInfo.color}30`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          backgroundColor: `${displayInfo.color}20`,
        } : {},
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          backgroundColor: `${displayInfo.color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {getIcon()}
      </Box>

      {/* Text */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#1a1a2e',
          }}
        >
          {displayInfo.message}
        </Typography>
        
        {showNextChange && nextChangeText && !status?.isVisible && (
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.25,
            }}
          >
            <Clock size={12} />
            {t('visibleIn') || 'Visible in'} {nextChangeText}
          </Typography>
        )}
      </Box>

      {/* Status dot */}
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: displayInfo.color,
          boxShadow: `0 0 8px ${displayInfo.color}60`,
        }}
      />
    </Box>
  );
};

/**
 * Mini indicator for header/navigation
 */
export const VisibilityDot = ({ isVisible, size = 8 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: isVisible ? '#22c55e' : '#ef4444',
      boxShadow: `0 0 ${size / 2}px ${isVisible ? '#22c55e' : '#ef4444'}60`,
    }}
  />
);

/**
 * Badge for settings items
 */
export const VisibilityBadge = ({ reason, language = 'en' }) => {
  const displayInfo = getVisibilityStatusDisplay(reason, language);
  
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: '6px',
        backgroundColor: `${displayInfo.color}15`,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: displayInfo.color,
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color: displayInfo.color,
          fontWeight: 500,
          fontSize: '0.65rem',
          textTransform: 'uppercase',
        }}
      >
        {reason === VISIBILITY_REASONS.VISIBLE ? 'ON' : 'OFF'}
      </Typography>
    </Box>
  );
};

export default VisibilityStatusIndicator;
