/**
 * SubscriptionPopups - Edge State Popups
 * 
 * Per Spec: Popups for subscription edge cases
 * 
 * Popup Types:
 * - HourEndedPopup: When Pulse Plus Hour ends
 * - BacktrackLimitPopup: After 2 free backtracks
 * - LikesYouPreviewPopup: Soft preview before paywall
 * - SubscriptionExpiredBanner: When subscription expires
 * 
 * Analytics:
 * - popup_impression
 * - popup_action
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Dialog } from '@mui/material';
import { motion } from 'framer-motion';
import { Clock, Undo2, Heart, AlertCircle } from 'lucide-react';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

/**
 * Hour Ended Popup
 * Per Spec: "Your hour just ended"
 */
export const HourEndedPopup = ({ open, onClose, onGetAnotherHour, onViewOptions }) => {
  const navigate = useNavigate();

  const handleGetHour = useCallback(() => {
    trackEvent('popup_action', {
      popup_id: 'hour_ended',
      action: 'get_another_hour',
    });
    onGetAnotherHour?.();
    onClose?.();
  }, [onGetAnotherHour, onClose]);

  const handleViewOptions = useCallback(() => {
    trackEvent('popup_action', {
      popup_id: 'hour_ended',
      action: 'view_options',
    });
    onClose?.();
    navigate('/subscriptions');
  }, [onClose, navigate]);

  const handleNotNow = useCallback(() => {
    trackEvent('popup_action', {
      popup_id: 'hour_ended',
      action: 'not_now',
    });
    onClose?.();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleNotNow}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 3,
          maxWidth: 340,
          textAlign: 'center',
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(168,85,247,0.1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <Clock size={28} color="#6C5CE7" />
      </Box>

      {/* Title */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
        Your hour just ended
      </Typography>

      {/* Body */}
      <Typography sx={{ color: '#64748b', mb: 3 }}>
        Want a little more time — or ready for more control?
      </Typography>

      {/* Actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleGetHour}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Get another hour — ₪5
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleViewOptions}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            borderColor: 'rgba(108,92,231,0.3)',
            color: '#6C5CE7',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          View subscription options
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={handleNotNow}
          sx={{
            py: 1,
            color: '#94a3b8',
            fontWeight: 500,
            textTransform: 'none',
          }}
        >
          Not now
        </Button>
      </Box>
    </Dialog>
  );
};

/**
 * Backtrack Limit Popup
 * Per Spec: "Want to go back?" after 2 free uses
 */
export const BacktrackLimitPopup = ({ open, onClose, onUnlock }) => {
  const navigate = useNavigate();

  const handleUnlock = useCallback(() => {
    trackEvent('popup_action', {
      popup_id: 'backtrack_limit',
      action: 'unlock',
    });
    onClose?.();
    navigate('/subscriptions');
  }, [onClose, navigate]);

  const handleNotNow = useCallback(() => {
    trackEvent('popup_action', {
      popup_id: 'backtrack_limit',
      action: 'not_now',
    });
    onClose?.();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleNotNow}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 3,
          maxWidth: 340,
          textAlign: 'center',
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(168,85,247,0.1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <Undo2 size={28} color="#6C5CE7" />
      </Box>

      {/* Title */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
        Want to go back?
      </Typography>

      {/* Body */}
      <Typography sx={{ color: '#64748b', mb: 3 }}>
        Unlimited Backtrack is part of Pulse Pro.
      </Typography>

      {/* Actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleUnlock}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Unlock Pulse Pro
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={handleNotNow}
          sx={{
            py: 1,
            color: '#94a3b8',
            fontWeight: 500,
            textTransform: 'none',
          }}
        >
          Not now
        </Button>
      </Box>
    </Dialog>
  );
};

/**
 * Likes You Preview Popup
 * Per Spec: "Someone already liked you"
 */
export const LikesYouPreviewPopup = ({ open, onClose, onViewPlus }) => {
  const navigate = useNavigate();

  const handleViewPlus = useCallback(() => {
    trackEvent('popup_action', {
      popup_id: 'likes_you_preview',
      action: 'view_plus',
    });
    onClose?.();
    navigate('/subscriptions');
  }, [onClose, navigate]);

  const handleNotNow = useCallback(() => {
    trackEvent('popup_action', {
      popup_id: 'likes_you_preview',
      action: 'not_now',
    });
    onClose?.();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleNotNow}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 3,
          maxWidth: 340,
          textAlign: 'center',
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(168,85,247,0.1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <Heart size={28} color="#ec4899" />
      </Box>

      {/* Title */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
        Someone already liked you 💜
      </Typography>

      {/* Body */}
      <Typography sx={{ color: '#64748b', mb: 3 }}>
        Pulse Plus lets you see it instantly.
      </Typography>

      {/* Actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleViewPlus}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          View Pulse Plus
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={handleNotNow}
          sx={{
            py: 1,
            color: '#94a3b8',
            fontWeight: 500,
            textTransform: 'none',
          }}
        >
          Not now
        </Button>
      </Box>
    </Dialog>
  );
};

/**
 * Subscription Expired Banner
 * Per Spec: Subtle banner when subscription expires
 */
export const SubscriptionExpiredBanner = ({ planName = 'Pulse Pro', onViewOptions }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    trackEvent('expired_banner_click', {
      plan: planName,
    });
    onViewOptions?.();
    navigate('/subscriptions');
  }, [planName, onViewOptions, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mx: 2,
          my: 1.5,
          px: 2,
          py: 1.5,
          borderRadius: '12px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          cursor: 'pointer',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AlertCircle size={18} color="#ef4444" />
          <Typography sx={{ color: '#1a1a2e', fontWeight: 500, fontSize: '0.9rem' }}>
            Your {planName} has ended.
          </Typography>
        </Box>

        <Button
          size="small"
          sx={{
            minWidth: 'auto',
            px: 1.5,
            py: 0.5,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'none',
          }}
        >
          View options
        </Button>
      </Box>
    </motion.div>
  );
};

export default {
  HourEndedPopup,
  BacktrackLimitPopup,
  LikesYouPreviewPopup,
  SubscriptionExpiredBanner,
};
