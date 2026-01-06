/**
 * ChatGateBanner - Shows gate status in chat
 * 
 * 🔒 IMPORTANT: This component only DISPLAYS server state.
 * It does NOT decide if messaging is allowed - server is source of truth.
 * 
 * Shows:
 * - Title (based on blockReason)
 * - Subtitle (explanation)
 * - CTA button (if applicable)
 * 
 * Does NOT show CTA for SYSTEM_BLOCKED (no payment bypass for safety)
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Lock, Crown, Coins, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  BLOCK_REASONS,
  CTA_TYPES,
  getGateDisplayInfo,
  getCTANavigationTarget,
  formatUnlockTimer,
  trackGateEvent,
  GATE_EVENTS,
} from '../services/ChatGateService';

/**
 * Main Gate Banner component
 */
const ChatGateBanner = ({ 
  gateState, 
  threadId,
  onUnlockWithPoints,
  unlockExpiresAt,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = language === 'עברית' ? 'he' : 'en';

  const blockReason = gateState?.blockReason;
  const displayInfo = getGateDisplayInfo(blockReason, lang);
  const canSendMessage = gateState?.canSendMessage;

  // Track gate viewed
  useEffect(() => {
    if (blockReason && !canSendMessage) {
      trackGateEvent(GATE_EVENTS.GATE_VIEWED, {
        thread_id: threadId,
        block_reason: blockReason,
      });
    }
  }, [blockReason, threadId, canSendMessage]);

  // Don't show if messaging is allowed
  if (canSendMessage) return null;

  // Get icon based on block reason
  const getIcon = () => {
    switch (blockReason) {
      case BLOCK_REASONS.SUBSCRIPTION_REQUIRED:
        return <Crown size={24} color="#6C5CE7" />;
      case BLOCK_REASONS.POINTS_FEATURE_REQUIRED:
        return <Coins size={24} color="#6C5CE7" />;
      case BLOCK_REASONS.SYSTEM_BLOCKED:
        return <AlertCircle size={24} color="#ef4444" />;
      default:
        return <Lock size={24} color="#64748b" />;
    }
  };

  // Handle CTA click
  const handleCTAClick = () => {
    trackGateEvent(GATE_EVENTS.CTA_TAPPED, {
      thread_id: threadId,
      cta_type: displayInfo.ctaType,
    });

    if (displayInfo.ctaType === CTA_TYPES.USE_POINTS && onUnlockWithPoints) {
      onUnlockWithPoints();
    } else {
      const target = getCTANavigationTarget(displayInfo.ctaType);
      if (target) {
        navigate(target);
      }
    }
  };

  // Get background color based on block reason
  const getBgColor = () => {
    switch (blockReason) {
      case BLOCK_REASONS.SYSTEM_BLOCKED:
        return 'rgba(239,68,68,0.08)';
      case BLOCK_REASONS.SUBSCRIPTION_REQUIRED:
      case BLOCK_REASONS.POINTS_FEATURE_REQUIRED:
        return 'rgba(108,92,231,0.08)';
      default:
        return 'rgba(100,116,139,0.08)';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        mx: 2,
        my: 2,
        borderRadius: '16px',
        backgroundColor: getBgColor(),
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '14px',
          backgroundColor: blockReason === BLOCK_REASONS.SYSTEM_BLOCKED 
            ? 'rgba(239,68,68,0.15)' 
            : 'rgba(108,92,231,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        {getIcon()}
      </Box>

      {/* Title */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          color: '#1a1a2e',
          mb: 0.5,
        }}
      >
        {displayInfo.title}
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="body2"
        sx={{
          color: '#64748b',
          mb: displayInfo.ctaLabel ? 2 : 0,
          maxWidth: 280,
        }}
      >
        {displayInfo.subtitle}
      </Typography>

      {/* CTA Button (only if has CTA and not SYSTEM_BLOCKED) */}
      {displayInfo.ctaLabel && blockReason !== BLOCK_REASONS.SYSTEM_BLOCKED && (
        <Button
          onClick={handleCTAClick}
          sx={{
            px: 4,
            py: 1.25,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            color: '#ffffff',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.9rem',
            '&:hover': {
              background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
            },
          }}
        >
          {displayInfo.ctaLabel}
        </Button>
      )}
    </Box>
  );
};

/**
 * Compact gate indicator for chat header
 */
export const ChatGateIndicator = ({ gateState }) => {
  if (gateState?.canSendMessage) return null;

  const blockReason = gateState?.blockReason;
  
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: '6px',
        backgroundColor: blockReason === BLOCK_REASONS.SYSTEM_BLOCKED 
          ? 'rgba(239,68,68,0.15)' 
          : 'rgba(108,92,231,0.15)',
      }}
    >
      <Lock size={12} color={blockReason === BLOCK_REASONS.SYSTEM_BLOCKED ? '#ef4444' : '#6C5CE7'} />
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.65rem',
          fontWeight: 600,
          color: blockReason === BLOCK_REASONS.SYSTEM_BLOCKED ? '#ef4444' : '#6C5CE7',
        }}
      >
        Locked
      </Typography>
    </Box>
  );
};

/**
 * Unlock timer display
 */
export const ChatUnlockTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = React.useState('');

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      setTimeLeft(formatUnlockTimer(expiresAt));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt || !timeLeft) return null;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        borderRadius: '8px',
        backgroundColor: 'rgba(34,197,94,0.15)',
      }}
    >
      <Clock size={14} color="#22c55e" />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: '#22c55e',
          fontFamily: 'monospace',
        }}
      >
        {timeLeft}
      </Typography>
    </Box>
  );
};

export default ChatGateBanner;
