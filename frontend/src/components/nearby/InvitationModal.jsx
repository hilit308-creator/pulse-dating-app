// InvitationModal.jsx
// Per spec: Two invitation paths - both must feel equally valid
// A. Invite for a Drink (With Payment) - gesture, not transaction
// B. Suggest Meeting (No Payment) - social initiative without financial framing

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wine, MessageCircle, MapPin, Clock, CreditCard, Shield } from 'lucide-react';
import SuggestedVenues from './SuggestedVenues';
import { getFeatureFlag } from '../../utils/featureFlags';
import { saveMeetingDraft } from '../../utils/nearbyMeetingDrafts';

const PAYMENT_HOLDS_STORAGE_KEY = 'pulse_nearby_payment_holds';

function getPaymentHolds() {
  try {
    const raw = localStorage.getItem(PAYMENT_HOLDS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePaymentHold(hold) {
  try {
    const current = getPaymentHolds();
    localStorage.setItem(PAYMENT_HOLDS_STORAGE_KEY, JSON.stringify([hold, ...current].slice(0, 50)));
  } catch {
    // ignore
  }
}

/**
 * InvitationModal - Two equal paths to suggest meeting
 * 
 * Per spec principles:
 * - Payment represents initiative, not expectation
 * - Pre-authorization is a hold, not a transaction
 * - Both paths must feel equally legitimate
 * - No invisible commitments
 */
export default function InvitationModal({
  isOpen,
  onClose,
  person,
  onSendInvitation,
}) {
  const [selectedPath, setSelectedPath] = useState(null); // 'drink' or 'meet'
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false);

  const venuesEnabled = getFeatureFlag('nearby_phase4_venues', false);
  const paymentsEnabled = getFeatureFlag('nearby_phase6_payments', false);
  const meetingSetupEnabled = getFeatureFlag('nearby_phase7_meeting_setup', false);
  const drinkPathEnabled = paymentsEnabled && venuesEnabled;

  const holdAmountNis = useMemo(() => 60, []);
  const maskedCard = useMemo(() => 'VISA •••• 4242', []);

  useEffect(() => {
    if (!isOpen) return;
    if (selectedPath === 'drink' && !drinkPathEnabled) {
      setSelectedPath(null);
      setSelectedVenue(null);
    }
  }, [isOpen, selectedPath, drinkPathEnabled]);

  if (!isOpen || !person) return null;

  const handleSend = async () => {
    if (selectedPath === 'drink' && paymentsEnabled) {
      setPaymentConfirmOpen(true);
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (meetingSetupEnabled && person?.id != null) {
      saveMeetingDraft(person.id, {
        createdAt: Date.now(),
        type: selectedPath,
        venue: selectedVenue || null,
        paymentHold: null,
        personId: person.id,
      });
    }

    onSendInvitation({
      type: selectedPath,
      venue: selectedVenue,
      message: message || getDefaultMessage(),
      person,
    });
    
    setIsProcessing(false);
    onClose();
  };

  const handleConfirmHoldAndSend = async () => {
    setIsProcessing(true);

    // Simulate pre-auth hold
    await new Promise(resolve => setTimeout(resolve, 650));

    const hold = {
      id: String(Date.now()),
      createdAt: Date.now(),
      status: 'held',
      amountNis: holdAmountNis,
      card: maskedCard,
      venueId: selectedVenue?.id ?? null,
      venueName: selectedVenue?.name ?? null,
      personId: person?.id ?? null,
    };

    savePaymentHold(hold);

    if (meetingSetupEnabled && person?.id != null) {
      saveMeetingDraft(person.id, {
        createdAt: Date.now(),
        type: selectedPath,
        venue: selectedVenue || null,
        paymentHold: hold,
        personId: person.id,
      });
    }

    onSendInvitation({
      type: selectedPath,
      venue: selectedVenue,
      message: message || getDefaultMessage(),
      person,
      paymentHold: hold,
    });

    setIsProcessing(false);
    setPaymentConfirmOpen(false);
    onClose();
  };

  const getDefaultMessage = () => {
    if (selectedPath === 'drink') {
      return selectedVenue 
        ? `Hey! Would you like to grab a drink at ${selectedVenue.name}? My treat 🍷`
        : "Hey! Would you like to grab a drink? My treat 🍷";
    }
    return selectedVenue
      ? `Hey! Want to meet up at ${selectedVenue.name}?`
      : "Hey! Want to meet up sometime?";
  };

  const canSend = selectedPath && (selectedPath === 'meet' || selectedVenue);

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
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          paddingTop: 70,
        }}
        onClick={() => {
          if (paymentConfirmOpen) return;
          onClose();
        }}
      >
        <Dialog
          open={paymentConfirmOpen}
          onClose={() => setPaymentConfirmOpen(false)}
          sx={{ zIndex: 10000 }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#1a1a2e' }}>
            Confirm payment hold
          </DialogTitle>
          <DialogContent sx={{ pt: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              We’ll place a temporary hold of ₪{holdAmountNis} on your card.
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Card: {maskedCard}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 2.5, pb: 2 }}>
            <Button
              variant="text"
              onClick={() => setPaymentConfirmOpen(false)}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmHoldAndSend}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, bgcolor: '#6C5CE7', '&:hover': { bgcolor: '#5a4ee0' } }}
              disabled={isProcessing}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 500 }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              maxHeight: '80vh',
              overflow: 'auto',
              margin: '0 16px',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                position: 'sticky',
                top: 0,
                backgroundColor: '#fff',
                zIndex: 10,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Suggest meeting
              </Typography>
              <IconButton onClick={onClose} size="small">
                <X size={20} color="#64748b" />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2 }}>
              {/* Person info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={person.photos?.[0]}
                    alt={person.firstName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    {person.firstName}
                  </Typography>
                  {!!person.city && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MapPin size={12} color="#6C5CE7" />
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {person.city}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Path selection - both equally valid */}
              {!selectedPath && (
                <>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>
                    How would you like to reach out?
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* Path A: Invite for a Drink */}
                    {drinkPathEnabled && (
                      <Box
                        onClick={() => setSelectedPath('drink')}
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          border: '2px solid rgba(108,92,231,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#6C5CE7',
                            backgroundColor: 'rgba(108,92,231,0.04)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Wine size={18} color="#fff" />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.25 }}>
                              Invite for a drink
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.3 }}>
                              A gesture of initiative — you'll only be charged if they accept and you both show up
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Path B: Suggest Meeting */}
                    <Box
                      onClick={() => setSelectedPath('meet')}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: '2px solid rgba(108,92,231,0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#6C5CE7',
                          backgroundColor: 'rgba(108,92,231,0.04)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            backgroundColor: 'rgba(108,92,231,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <MessageCircle size={18} color="#6C5CE7" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.25 }}>
                            Suggest meeting up
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.3 }}>
                            Social initiative without any financial framing — just a friendly suggestion
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Reassurance */}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 2,
                      color: '#94a3b8',
                      textAlign: 'center',
                    }}
                  >
                    Both options are equally valid — choose what feels right
                  </Typography>
                </>
              )}

              {/* Selected path: Drink invitation */}
              {selectedPath === 'drink' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="text"
                      onClick={() => {
                        setSelectedPath(null);
                        setSelectedVenue(null);
                      }}
                      sx={{ color: '#64748b', textTransform: 'none', mb: 2 }}
                    >
                      ← Back to options
                    </Button>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(108,92,231,0.06)',
                        border: '1px solid rgba(108,92,231,0.15)',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Wine size={18} color="#6C5CE7" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6C5CE7' }}>
                          Invite for a drink
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Select a place and we'll send your invitation. Payment is pre-authorized only — 
                        you're never charged unless they accept and you both arrive.
                      </Typography>
                    </Box>

                    {/* Venue selection - required for drink */}
                    {venuesEnabled && (
                      <SuggestedVenues
                        onSelectVenue={setSelectedVenue}
                        selectedVenue={selectedVenue}
                      />
                    )}
                  </Box>

                  {/* Payment info - transparent */}
                  {selectedVenue && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CreditCard size={16} color="#64748b" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                          Payment hold
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                        ~$15-25 will be held (not charged) until the meeting happens
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Shield size={14} color="#10b981" />
                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                          Released automatically if declined or expired
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}

              {/* Selected path: Suggest meeting */}
              {selectedPath === 'meet' && (
                <>
                  <Button
                    variant="text"
                    onClick={() => {
                      setSelectedPath(null);
                      setSelectedVenue(null);
                    }}
                    sx={{ color: '#64748b', textTransform: 'none', mb: 2 }}
                  >
                    ← Back to options
                  </Button>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(108,92,231,0.06)',
                      border: '1px solid rgba(108,92,231,0.15)',
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MessageCircle size={18} color="#6C5CE7" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6C5CE7' }}>
                        Suggest meeting up
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                      A friendly suggestion to meet — no payment involved. 
                      You can optionally suggest a place or leave it open.
                    </Typography>
                  </Box>

                  {/* Optional venue selection */}
                  {venuesEnabled && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                        Suggest a place? (optional)
                      </Typography>
                      <SuggestedVenues
                        onSelectVenue={setSelectedVenue}
                        selectedVenue={selectedVenue}
                      />
                    </>
                  )}
                </>
              )}

              {/* Message input - when path is selected */}
              {selectedPath && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                    Add a message (optional)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder={getDefaultMessage()}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Box>
              )}

              {/* Send button */}
              {selectedPath && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSend}
                    disabled={!canSend || isProcessing}
                    sx={{
                      py: 1.5,
                      borderRadius: '14px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: canSend 
                        ? 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)'
                        : '#e2e8f0',
                      boxShadow: canSend ? '0 4px 16px rgba(108,92,231,0.3)' : 'none',
                    }}
                  >
                    {isProcessing ? 'Sending...' : (
                      selectedPath === 'drink' 
                        ? 'Send invitation' 
                        : 'Send suggestion'
                    )}
                  </Button>

                  {/* Expiration info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 2 }}>
                    <Clock size={14} color="#94a3b8" />
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {selectedPath === 'drink' 
                        ? 'Invitation expires in 2 hours — protects both of you'
                        : 'They can respond whenever they\'re ready'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
