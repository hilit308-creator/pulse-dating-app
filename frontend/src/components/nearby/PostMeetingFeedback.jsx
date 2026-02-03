// PostMeetingFeedback.jsx
// Per spec: "Close the emotional loop, improve system intelligence, reinforce community contribution"
// Feedback is: Lightweight, Optional, Contextual
// Must never feel like: A review obligation, A performance score, A judgment of the match

import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ThumbsUp, Smile, MapPin, Star } from 'lucide-react';

/**
 * PostMeetingFeedback - Lightweight optional feedback after meeting
 * 
 * Per spec principles:
 * - Close emotional loop
 * - Build collective memory (venue ratings)
 * - Non-judgmental
 * - Optional - can skip entirely
 */
export default function PostMeetingFeedback({
  isOpen,
  onClose,
  meeting,
  onSubmit,
}) {
  const [step, setStep] = useState(1); // 1: How was it? 2: Venue feedback (optional)
  const [meetingFeel, setMeetingFeel] = useState(null);
  const [venueRating, setVenueRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !meeting) return null;

  const { person, venue } = meeting;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    onSubmit({
      meetingFeel,
      venueRating,
      meetingId: meeting.id,
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  // Meeting feel options - non-judgmental, about the experience not the person
  const feelOptions = [
    { id: 'great', icon: Heart, label: 'Great connection', color: '#10b981' },
    { id: 'nice', icon: ThumbsUp, label: 'Nice time', color: '#6C5CE7' },
    { id: 'okay', icon: Smile, label: 'It was okay', color: '#f59e0b' },
  ];

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
          backdropFilter: 'blur(8px)',
          padding: 16,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{ width: '100%', maxWidth: 360 }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            {/* Close button - can skip anytime */}
            <IconButton
              onClick={handleSkip}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.05)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' },
              }}
              size="small"
            >
              <X size={18} color="#64748b" />
            </IconButton>

            <Box sx={{ p: 3 }}>
              {/* Step 1: How was the meeting? */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        mx: 'auto',
                        mb: 2,
                        border: '3px solid #fff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    >
                      <img
                        src={person?.photos?.[0]}
                        alt={person?.firstName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                      How was meeting {person?.firstName}?
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Just for you — helps us improve suggestions
                    </Typography>
                  </Box>

                  {/* Feel options - non-judgmental */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    {feelOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = meetingFeel === option.id;
                      return (
                        <Box
                          key={option.id}
                          onClick={() => setMeetingFeel(option.id)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: '14px',
                            border: '2px solid',
                            borderColor: isSelected ? option.color : 'rgba(0,0,0,0.08)',
                            backgroundColor: isSelected ? `${option.color}10` : '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: isSelected ? option.color : 'rgba(0,0,0,0.15)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: isSelected ? option.color : '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <Icon size={20} color={isSelected ? '#fff' : option.color} />
                          </Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              color: isSelected ? option.color : '#1a1a2e',
                            }}
                          >
                            {option.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => venue ? setStep(2) : handleSubmit()}
                      disabled={!meetingFeel}
                      sx={{
                        py: 1.5,
                        borderRadius: '14px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: meetingFeel 
                          ? 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)'
                          : '#e2e8f0',
                        boxShadow: meetingFeel ? '0 4px 16px rgba(108,92,231,0.3)' : 'none',
                      }}
                    >
                      {venue ? 'Continue' : 'Done'}
                    </Button>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={handleSkip}
                      sx={{
                        py: 1,
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        color: '#94a3b8',
                      }}
                    >
                      Skip
                    </Button>
                  </Box>
                </motion.div>
              )}

              {/* Step 2: Venue feedback (optional) */}
              {step === 2 && venue && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        mx: 'auto',
                        mb: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    >
                      <img
                        src={venue.image}
                        alt={venue.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                      How was {venue.name}?
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Helps the community find great spots
                    </Typography>
                  </Box>

                  {/* Star rating - simple */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconButton
                        key={star}
                        onClick={() => setVenueRating(star)}
                        sx={{
                          p: 1,
                          transition: 'transform 0.2s ease',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      >
                        <Star
                          size={32}
                          color="#f59e0b"
                          fill={venueRating >= star ? '#f59e0b' : 'transparent'}
                        />
                      </IconButton>
                    ))}
                  </Box>

                  {/* Venue info */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      mb: 3,
                    }}
                  >
                    <MapPin size={14} color="#64748b" />
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {venue.name}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      sx={{
                        py: 1.5,
                        borderRadius: '14px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                        boxShadow: '0 4px 16px rgba(108,92,231,0.3)',
                      }}
                    >
                      {isSubmitting ? 'Saving...' : 'Done'}
                    </Button>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={handleSubmit}
                      sx={{
                        py: 1,
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        color: '#94a3b8',
                      }}
                    >
                      Skip venue rating
                    </Button>
                  </Box>
                </motion.div>
              )}

              {/* Privacy note */}
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 2,
                  color: '#94a3b8',
                  textAlign: 'center',
                  fontSize: '0.7rem',
                }}
              >
                Your feedback is private and never shared with {person?.firstName}
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
