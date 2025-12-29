/**
 * SafetyFlow — Pulse Block & Report System
 * 
 * Product Principles (LOCKED):
 * - Quick, clear action
 * - No accusatory language
 * - No interrogation
 * - Full user control
 * - Immediate, clear effect
 * 
 * Safety in Pulse is a basic right — not an event.
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slide,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldAlert,
  Ban,
  Flag,
  CheckCircle,
} from 'lucide-react';

// Report reasons (MVP)
const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Inappropriate messages' },
  { id: 'harassment', label: 'Harassment or pressure' },
  { id: 'fake', label: 'Fake profile' },
  { id: 'unsafe', label: 'Feels unsafe' },
  { id: 'other', label: 'Other' },
];

// Transition for bottom sheet
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * SafetyActionSheet - Entry point menu (Block & Report options)
 */
export function SafetyActionSheet({ open, onClose, onBlock, onReport, userName }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      PaperProps={{
        sx: {
          position: 'fixed',
          bottom: 0,
          m: 0,
          borderRadius: '24px 24px 0 0',
          maxWidth: '100%',
          width: '100%',
          maxHeight: '50vh',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Handle */}
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: '#e2e8f0',
            borderRadius: 2,
            mx: 'auto',
            mb: 3,
          }}
        />

        {/* Options */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Block */}
          <Button
            fullWidth
            onClick={onBlock}
            startIcon={<Ban size={20} />}
            sx={{
              py: 1.75,
              justifyContent: 'flex-start',
              borderRadius: '14px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              color: '#1a1a2e',
              bgcolor: '#f8fafc',
              '&:hover': { bgcolor: '#f1f5f9' },
            }}
          >
            Block user
          </Button>

          {/* Report */}
          <Button
            fullWidth
            onClick={onReport}
            startIcon={<Flag size={20} />}
            sx={{
              py: 1.75,
              justifyContent: 'flex-start',
              borderRadius: '14px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              color: '#ef4444',
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.12)' },
            }}
          >
            Report user
          </Button>
        </Box>

        {/* Cancel */}
        <Button
          fullWidth
          onClick={onClose}
          sx={{
            mt: 2,
            py: 1.5,
            borderRadius: '14px',
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748b',
          }}
        >
          Cancel
        </Button>
      </Box>
    </Dialog>
  );
}

/**
 * BlockConfirmSheet - Block confirmation dialog
 * No "Are you sure?" - just informative, calm, non-judgmental
 */
export function BlockConfirmSheet({ open, onClose, onConfirm, userName }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      PaperProps={{
        sx: {
          position: 'fixed',
          bottom: 0,
          m: 0,
          borderRadius: '24px 24px 0 0',
          maxWidth: '100%',
          width: '100%',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Handle */}
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: '#e2e8f0',
            borderRadius: 2,
            mx: 'auto',
            mb: 3,
          }}
        />

        {/* Icon */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
            }}
          >
            <Ban size={28} color="#ef4444" />
          </Box>
        </Box>

        {/* Title - Informative, not accusatory */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1a1a2e',
            textAlign: 'center',
            mb: 1,
          }}
        >
          Block this user?
        </Typography>

        {/* Body - Calm, informative */}
        <Typography
          variant="body1"
          sx={{
            color: '#64748b',
            textAlign: 'center',
            mb: 3,
          }}
        >
          They won't be able to see or contact you on Pulse.
        </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{
              py: 1.5,
              borderRadius: '14px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#e2e8f0',
              color: '#64748b',
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={onConfirm}
            sx={{
              py: 1.5,
              borderRadius: '14px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' },
            }}
          >
            Block
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

/**
 * ReportFlow - Multi-step report dialog
 */
export function ReportFlow({ open, onClose, onSubmit, userName }) {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState('');
  const [blockAsWell, setBlockAsWell] = useState(true); // On by default

  const handleSubmit = useCallback(() => {
    onSubmit({
      reason: selectedReason,
      blockUser: blockAsWell,
    });
    setStep(3); // Go to confirmation
  }, [selectedReason, blockAsWell, onSubmit]);

  const handleClose = useCallback(() => {
    setStep(1);
    setSelectedReason('');
    setBlockAsWell(true);
    onClose();
  }, [onClose]);

  // Auto-close after confirmation
  React.useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(handleClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, handleClose]);

  return (
    <Dialog
      open={open}
      onClose={step < 3 ? handleClose : undefined}
      TransitionComponent={SlideTransition}
      PaperProps={{
        sx: {
          position: 'fixed',
          bottom: 0,
          m: 0,
          borderRadius: '24px 24px 0 0',
          maxWidth: '100%',
          width: '100%',
          maxHeight: '80vh',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Handle */}
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: '#e2e8f0',
            borderRadius: 2,
            mx: 'auto',
            mb: 2,
          }}
        />

        {/* Close button */}
        {step < 3 && (
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            <X size={20} color="#94a3b8" />
          </IconButton>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Reason Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Title - Neutral, not accusatory */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a2e',
                  mb: 2,
                }}
              >
                What's going on?
              </Typography>

              {/* Reason options */}
              <RadioGroup
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                {REPORT_REASONS.map((reason) => (
                  <FormControlLabel
                    key={reason.id}
                    value={reason.id}
                    control={
                      <Radio
                        sx={{
                          '&.Mui-checked': { color: '#6C5CE7' },
                        }}
                      />
                    }
                    label={reason.label}
                    sx={{
                      mb: 1,
                      py: 1,
                      px: 1.5,
                      mx: 0,
                      borderRadius: '12px',
                      bgcolor: selectedReason === reason.id ? 'rgba(108, 92, 231, 0.08)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                      '& .MuiFormControlLabel-label': {
                        fontWeight: 500,
                        color: '#1a1a2e',
                      },
                    }}
                  />
                ))}
              </RadioGroup>

              {/* Continue button */}
              <Button
                fullWidth
                variant="contained"
                disabled={!selectedReason}
                onClick={() => setStep(2)}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: '#6C5CE7',
                  '&:hover': { bgcolor: '#5b4cdb' },
                  '&:disabled': { bgcolor: '#e2e8f0' },
                }}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Block option + Submit */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Icon */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                  }}
                >
                  <Flag size={28} color="#ef4444" />
                </Box>
              </Box>

              {/* Block checkbox - Highly visible, on by default */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f8fafc',
                  borderRadius: '14px',
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={blockAsWell}
                      onChange={(e) => setBlockAsWell(e.target.checked)}
                      sx={{
                        '&.Mui-checked': { color: '#ef4444' },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                        Block this user as well
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Blocking stops all interaction immediately.
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, alignItems: 'flex-start' }}
                />
              </Box>

              {/* Submit button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  py: 1.5,
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: '#ef4444',
                  '&:hover': { bgcolor: '#dc2626' },
                }}
              >
                Submit report
              </Button>

              {/* Back button */}
              <Button
                fullWidth
                onClick={() => setStep(1)}
                sx={{
                  mt: 1,
                  py: 1,
                  textTransform: 'none',
                  color: '#64748b',
                }}
              >
                Back
              </Button>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Box sx={{ textAlign: 'center', py: 3 }}>
                {/* Success icon */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <CheckCircle size={32} color="#10b981" />
                </Box>

                {/* Confirmation copy */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#1a1a2e',
                    mb: 1,
                  }}
                >
                  Thanks for letting us know
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: '#64748b' }}
                >
                  Our team will review this.
                </Typography>

                {/* Block confirmation if selected */}
                {blockAsWell && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: '#f8fafc',
                      borderRadius: '10px',
                      color: '#64748b',
                    }}
                  >
                    You blocked this user. You won't receive messages from them.
                  </Typography>
                )}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Dialog>
  );
}

/**
 * BlockConfirmation - Inline confirmation message (auto-dismiss)
 */
export function BlockConfirmation({ open, onClose }) {
  // Auto-close after 2.5 seconds
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxWidth: 320,
          p: 3,
        },
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        {/* Success icon */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <CheckCircle size={32} color="#10b981" />
        </Box>

        {/* Confirmation copy - Short, no extra CTA */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: '#1a1a2e',
            mb: 0.5,
          }}
        >
          You blocked this user.
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#64748b' }}
        >
          You won't receive messages from them.
        </Typography>
      </Box>
    </Dialog>
  );
}

/**
 * useSafetyFlow - Hook to manage the entire safety flow
 */
export function useSafetyFlow() {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showBlockSuccess, setShowBlockSuccess] = useState(false);
  const [showReportFlow, setShowReportFlow] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const openSafetyMenu = useCallback((user) => {
    setTargetUser(user);
    setShowActionSheet(true);
  }, []);

  const handleBlock = useCallback(() => {
    setShowActionSheet(false);
    setShowBlockConfirm(true);
  }, []);

  const handleReport = useCallback(() => {
    setShowActionSheet(false);
    setShowReportFlow(true);
  }, []);

  const handleConfirmBlock = useCallback(async () => {
    setShowBlockConfirm(false);
    
    // Execute block action
    // In real app: await api.blockUser(targetUser.id)
    console.log('[Safety] User blocked:', targetUser?.id);
    
    // Show success
    setShowBlockSuccess(true);
  }, [targetUser]);

  const handleSubmitReport = useCallback(async (reportData) => {
    // Execute report action
    // In real app: await api.reportUser(targetUser.id, reportData)
    console.log('[Safety] User reported:', targetUser?.id, reportData);
    
    // If block selected, execute block too
    if (reportData.blockUser) {
      console.log('[Safety] User also blocked');
    }
  }, [targetUser]);

  const closeAll = useCallback(() => {
    setShowActionSheet(false);
    setShowBlockConfirm(false);
    setShowBlockSuccess(false);
    setShowReportFlow(false);
  }, []);

  return {
    // State
    targetUser,
    showActionSheet,
    showBlockConfirm,
    showBlockSuccess,
    showReportFlow,
    
    // Actions
    openSafetyMenu,
    handleBlock,
    handleReport,
    handleConfirmBlock,
    handleSubmitReport,
    closeAll,
    
    // Close handlers
    closeActionSheet: () => setShowActionSheet(false),
    closeBlockConfirm: () => setShowBlockConfirm(false),
    closeBlockSuccess: () => setShowBlockSuccess(false),
    closeReportFlow: () => setShowReportFlow(false),
  };
}

/**
 * SafetyFlowProvider - Complete safety flow component
 * Use this as a wrapper or render alongside your content
 */
export default function SafetyFlowProvider({ children, safetyFlow }) {
  const {
    targetUser,
    showActionSheet,
    showBlockConfirm,
    showBlockSuccess,
    showReportFlow,
    handleBlock,
    handleReport,
    handleConfirmBlock,
    handleSubmitReport,
    closeActionSheet,
    closeBlockConfirm,
    closeBlockSuccess,
    closeReportFlow,
  } = safetyFlow;

  return (
    <>
      {children}

      {/* Safety Action Sheet */}
      <SafetyActionSheet
        open={showActionSheet}
        onClose={closeActionSheet}
        onBlock={handleBlock}
        onReport={handleReport}
        userName={targetUser?.name}
      />

      {/* Block Confirmation */}
      <BlockConfirmSheet
        open={showBlockConfirm}
        onClose={closeBlockConfirm}
        onConfirm={handleConfirmBlock}
        userName={targetUser?.name}
      />

      {/* Block Success */}
      <BlockConfirmation
        open={showBlockSuccess}
        onClose={closeBlockSuccess}
      />

      {/* Report Flow */}
      <ReportFlow
        open={showReportFlow}
        onClose={closeReportFlow}
        onSubmit={handleSubmitReport}
        userName={targetUser?.name}
      />
    </>
  );
}
