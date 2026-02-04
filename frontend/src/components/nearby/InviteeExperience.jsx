// InviteeExperience.jsx
// Per spec: "The invitee must feel: Safe, In control, Free to respond at their pace"
// Accept / Decline / Chat first are equal choices
// Chat always resumes regardless of action

import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Wine, MessageCircle, Check, Clock, Shield } from 'lucide-react';

// Detect text direction (RTL for Hebrew/Arabic, LTR for English)
function detectTextDirection(text) {
  if (!text) return 'ltr';
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/;
  const firstLetterMatch = text.match(/[a-zA-Z\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/);
  if (firstLetterMatch && rtlRegex.test(firstLetterMatch[0])) {
    return 'rtl';
  }
  return 'ltr';
}

/**
 * InviteeExperience - Receiving an invitation
 * 
 * Per spec principles:
 * - All responses are equal (Accept/Decline/Chat)
 * - Chat is never blocked
 * - Silence is not punished
 * - Decline is normalized
 * - System must never imply obligation or signal disappointment
 */
export default function InviteeExperience({
  isOpen,
  onClose,
  invitation,
  onAccept,
  onDecline,
  onChatFirst,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  if (!isOpen || !invitation) return null;

  const { type, person, venue, message, expiresIn } = invitation;
  const isDrinkInvitation = type === 'drink';

  const handleAccept = async () => {
    setSelectedAction('accept');
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onAccept(invitation);
    setIsProcessing(false);
  };

  const handleDecline = async () => {
    setSelectedAction('decline');
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onDecline(invitation);
    setIsProcessing(false);
  };

  const handleChatFirst = () => {
    onChatFirst(invitation);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          padding: 16,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{ width: '100%', maxWidth: 380 }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
          >
            {/* Close button - always accessible, no guilt */}
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': { backgroundColor: '#fff' },
              }}
              size="small"
            >
              <X size={18} color="#64748b" />
            </IconButton>

            {/* Header with photo */}
            <Box
              sx={{
                position: 'relative',
                height: 180,
                overflow: 'hidden',
              }}
            >
              <img
                src={person?.photos?.[0]}
                alt={person?.firstName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 100,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                }}
              />
              {/* Invitation type badge */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  backgroundColor: isDrinkInvitation ? 'rgba(108,92,231,0.95)' : 'rgba(255,255,255,0.95)',
                }}
              >
                {isDrinkInvitation ? (
                  <>
                    <Wine size={14} color="#fff" />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#fff' }}>
                      Drink invitation
                    </Typography>
                  </>
                ) : (
                  <>
                    <MessageCircle size={14} color="#6C5CE7" />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6C5CE7' }}>
                      Meeting suggestion
                    </Typography>
                  </>
                )}
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
              {/* From who */}
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                {person?.firstName} {isDrinkInvitation ? 'invited you for a drink' : 'wants to meet up'}
              </Typography>

              {/* Venue if specified */}
              {venue && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                  <MapPin size={16} color="#6C5CE7" />
                  <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
                    {venue.name} · {venue.walkTime}
                  </Typography>
                </Box>
              )}

              {/* Message */}
              {message && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    mb: 3,
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#1a1a2e', 
                      fontStyle: 'italic',
                      direction: detectTextDirection(message),
                      textAlign: detectTextDirection(message) === 'rtl' ? 'right' : 'left',
                    }}
                  >
                    "{message}"
                  </Typography>
                </Box>
              )}

              {/* What accepting means - transparent */}
              {isDrinkInvitation && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.15)',
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Shield size={16} color="#10b981" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#10b981' }}>
                      What this means
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {person?.firstName} has offered to treat you. If you accept and meet up, 
                    they'll cover the first round. No obligation beyond that.
                  </Typography>
                </Box>
              )}

              {/* Actions - ALL EQUAL per spec */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Accept */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAccept}
                  disabled={isProcessing}
                  startIcon={selectedAction === 'accept' && isProcessing ? null : <Check size={18} />}
                  sx={{
                    py: 1.5,
                    borderRadius: '14px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    },
                  }}
                >
                  {selectedAction === 'accept' && isProcessing ? 'Accepting...' : (
                    isDrinkInvitation ? 'Accept invitation' : 'Sounds good!'
                  )}
                </Button>

                {/* Chat first - equally valid */}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleChatFirst}
                  disabled={isProcessing}
                  startIcon={<MessageCircle size={18} />}
                  sx={{
                    py: 1.5,
                    borderRadius: '14px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: '#6C5CE7',
                    color: '#6C5CE7',
                    '&:hover': {
                      borderColor: '#5b4cdb',
                      backgroundColor: 'rgba(108,92,231,0.04)',
                    },
                  }}
                >
                  Chat first
                </Button>

                {/* Decline - normalized, not shameful */}
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleDecline}
                  disabled={isProcessing}
                  sx={{
                    py: 1.25,
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    color: '#64748b',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  {selectedAction === 'decline' && isProcessing ? 'Got it' : 'Not right now'}
                </Button>
              </Box>

              {/* Expiration - protection, not pressure */}
              {expiresIn && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 2 }}>
                  <Clock size={14} color="#94a3b8" />
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Expires in {expiresIn} — no pressure, just keeps things fresh
                  </Typography>
                </Box>
              )}

              {/* Reassurance - per spec: no guilt */}
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 2,
                  color: '#94a3b8',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}
              >
                All choices are valid — do what feels right for you
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * DeclineConfirmation - Shown after declining
 * Per spec: "A decline is completion, not abandonment"
 * Normalizes non-alignment, no guilt signals
 */
export function DeclineConfirmation({ isOpen, onClose, person }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 320 }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '20px',
              p: 3,
              textAlign: 'center',
            }}
          >
            {/* Neutral icon - not sad, not celebratory */}
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Check size={28} color="#64748b" />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
              No problem
            </Typography>

            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              {person?.firstName} won't be notified of the reason. 
              You can still chat anytime if you change your mind.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              onClick={onClose}
              sx={{
                py: 1.25,
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: '#1a1a2e',
                '&:hover': {
                  backgroundColor: '#0f172a',
                },
              }}
            >
              Continue
            </Button>
          </Box>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
