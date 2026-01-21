/**
 * LikesYouScreen - See Who Likes You (Gated Feature)
 * 
 * 🔒 LOCKED RULES:
 * - Duration: 10 minutes
 * - Cost: 80 points
 * - Server is source of truth for gate state
 * - No data leakage when locked (blur + null fields)
 * - Immediate refetch after activation
 * 
 * States:
 * - Locked: Blurred cards + CTA
 * - Unlocked: Clear cards + timer
 * - Premium: Always unlocked
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Lock,
  Crown,
  Coins,
  Clock,
  X,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CardSkeleton } from '../components/SkeletonLoading';
import PageHelpButton from '../components/PageHelpButton';
import { getPageHelpContent } from '../config/pageHelpContent';

// Analytics helper
const trackEvent = (event, data = {}) => {
  console.log('[LikesYou Analytics]', event, data);
};

// Mock data for development
const MOCK_LIKES = [
  { userId: 'u_1', likedAt: Date.now() - 3600000 },
  { userId: 'u_2', likedAt: Date.now() - 7200000 },
  { userId: 'u_3', likedAt: Date.now() - 10800000 },
  { userId: 'u_4', likedAt: Date.now() - 14400000 },
  { userId: 'u_5', likedAt: Date.now() - 18000000 },
];

const MOCK_REVEALED_DATA = {
  u_1: { name: 'Sarah', age: 28, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', distance: 1500 },
  u_2: { name: 'Emma', age: 25, photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200', distance: 2300 },
  u_3: { name: 'Maya', age: 27, photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200', distance: 800 },
  u_4: { name: 'Noa', age: 24, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', distance: 3200 },
  u_5: { name: 'Yael', age: 26, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', distance: 1800 },
};

/**
 * Blurred Like Card (Locked State)
 */
const BlurredLikeCard = ({ onClick }) => {
  const { t } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        onClick={onClick}
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3/4',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#e2e8f0',
          cursor: 'pointer',
        }}
      >
        {/* Blurred placeholder */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
            filter: 'blur(20px)',
          }}
        />
        
        {/* Lock icon overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <EyeOff size={24} color="#ffffff" />
          </Box>
        </Box>
        
        {/* Bottom gradient */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
          }}
        />
        
        {/* Hidden info placeholder */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
          }}
        >
          <Box
            sx={{
              width: '60%',
              height: 16,
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.3)',
              mb: 1,
            }}
          />
          <Box
            sx={{
              width: '40%',
              height: 12,
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
          />
        </Box>
      </Box>
    </motion.div>
  );
};

/**
 * Revealed Like Card (Unlocked State)
 */
const RevealedLikeCard = ({ userId, data, onLike, onPass }) => {
  const { t } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3/4',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#f1f5f9',
        }}
      >
        {/* Photo */}
        <Box
          component="img"
          src={data.photo}
          alt={data.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        
        {/* Bottom gradient */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          }}
        />
        
        {/* Info */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 60,
            left: 12,
            right: 12,
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            {data.name}, {data.age}
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            {(data.distance / 1000).toFixed(1)} km away
          </Typography>
        </Box>
        
        {/* Action buttons */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            display: 'flex',
            gap: 1,
          }}
        >
          <Button
            onClick={() => onPass(userId)}
            sx={{
              flex: 1,
              py: 1,
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              backdropFilter: 'blur(8px)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <X size={18} />
          </Button>
          <Button
            onClick={() => onLike(userId)}
            sx={{
              flex: 1,
              py: 1,
              borderRadius: '10px',
              backgroundColor: '#6C5CE7',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#5b4cdb',
              },
            }}
          >
            <Heart size={18} />
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
};

/**
 * Timer Banner
 */
const TimerBanner = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      
      if (remaining === 0) {
        setTimeLeft('00:00');
        return;
      }
      
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        py: 1,
        px: 2,
        backgroundColor: 'rgba(108,92,231,0.1)',
        borderRadius: '12px',
      }}
    >
      <Eye size={16} color="#6C5CE7" />
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: '#6C5CE7',
        }}
      >
        {t('activeNow') || 'Active now'} · {timeLeft}
      </Typography>
    </Box>
  );
};

/**
 * Main LikesYouScreen Component
 */
const LikesYouScreen = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  
  // State
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState([]);
  const [gate, setGate] = useState({ isUnlocked: false, expiresAt: null, source: 'none' });
  const [activating, setActivating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [pointsBalance, setPointsBalance] = useState(150); // Mock

  // Fetch likes data
  const fetchLikesYou = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/likes-you');
      // const data = await response.json();
      
      // Mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLikes(MOCK_LIKES);
      setLoading(false);
      
      trackEvent('likes_you_viewed', { count: MOCK_LIKES.length, isUnlocked: gate.isUnlocked });
    } catch (error) {
      console.error('Failed to fetch likes:', error);
      setLoading(false);
    }
  }, [gate.isUnlocked]);

  useEffect(() => {
    fetchLikesYou();
  }, [fetchLikesYou]);

  // Check for expiry
  useEffect(() => {
    if (!gate.expiresAt) return;

    const checkExpiry = () => {
      if (Date.now() >= gate.expiresAt) {
        setGate({ isUnlocked: false, expiresAt: null, source: 'none' });
        setSnackbar({ open: true, message: t('sessionEnded') || 'Session ended', severity: 'info' });
        trackEvent('likes_you_expired');
      }
    };

    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [gate.expiresAt, t]);

  // Activate with points
  const handleActivate = async () => {
    if (pointsBalance < 80) {
      setSnackbar({ open: true, message: t('notEnoughPoints') || 'Not enough points', severity: 'error' });
      return;
    }

    setActivating(true);
    
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/v1/points/activate', { method: 'POST', body: JSON.stringify({ feature: 'likes_you' }) });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      setGate({ isUnlocked: true, expiresAt, source: 'points' });
      setPointsBalance(prev => prev - 80);
      
      trackEvent('likes_you_activated', { method: 'points' });
      
      // Immediate refetch
      fetchLikesYou();
    } catch (error) {
      setSnackbar({ open: true, message: t('activationFailed') || 'Activation failed', severity: 'error' });
    } finally {
      setActivating(false);
    }
  };

  // Handle like action
  const handleLike = (userId) => {
    trackEvent('likes_you_like', { userId });
    setLikes(prev => prev.filter(l => l.userId !== userId));
    setSnackbar({ open: true, message: t('itsAMatch') || "It's a Match!", severity: 'success' });
  };

  // Handle pass action
  const handlePass = (userId) => {
    trackEvent('likes_you_pass', { userId });
    setLikes(prev => prev.filter(l => l.userId !== userId));
  };

  // Get revealed data (only when unlocked)
  const getRevealedData = (userId) => {
    if (!gate.isUnlocked) return null;
    return MOCK_REVEALED_DATA[userId] || null;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 4 }}>
        {/* Header Skeleton */}
        <Box sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          px: 2,
          py: 1.5,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton disabled sx={{ color: '#e2e8f0' }}>
              <ArrowLeft size={24} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
              {t('likesYou') || 'Likes You'}
            </Typography>
          </Box>
          <PageHelpButton {...getPageHelpContent('likes')} />
        </Box>
        {/* Grid Skeleton */}
        <Box sx={{ px: 2, pt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} height={220} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 4, position: 'relative' }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          px: 2,
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#1a1a2e' }}>
            <ArrowLeft size={24} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
              {t('likesYou') || 'Likes You'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {likes.length} {likes.length === 1 ? 'person' : 'people'}
            </Typography>
          </Box>
          {gate.isUnlocked && gate.expiresAt && (
            <TimerBanner expiresAt={gate.expiresAt} />
          )}
        </Box>
      </Box>

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Locked State CTA */}
        {!gate.isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Box
              sx={{
                p: 3,
                mb: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Heart size={28} color="#ffffff" />
              </Box>
              
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#ffffff',
                  mb: 1,
                }}
              >
                {t('seeWhoLikesYou') || 'See who likes you'}
              </Typography>
              
              <Typography
                sx={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)',
                  mb: 3,
                }}
              >
                {t('unlockFor10Min') || 'Unlock for 10 minutes and see everyone'}
              </Typography>

              <Button
                onClick={handleActivate}
                disabled={activating}
                sx={{
                  width: '100%',
                  py: 1.5,
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  color: '#6C5CE7',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: 16,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(255,255,255,0.5)',
                  },
                }}
              >
                {activating ? (
                  <CircularProgress size={20} sx={{ color: '#6C5CE7' }} />
                ) : (
                  <>
                    <Coins size={18} style={{ marginRight: 8 }} />
                    {t('unlockWith80Points') || 'Unlock with 80 points'}
                  </>
                )}
              </Button>

              <Button
                onClick={() => navigate('/subscriptions')}
                sx={{
                  mt: 1.5,
                  color: 'rgba(255,255,255,0.8)',
                  textTransform: 'none',
                  fontSize: 14,
                }}
              >
                <Crown size={16} style={{ marginRight: 6 }} />
                {t('orGetPremium') || 'Or get Premium for unlimited'}
              </Button>
            </Box>
          </motion.div>
        )}

        {/* Likes Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          <AnimatePresence>
            {likes.map((like) => {
              const revealedData = getRevealedData(like.userId);
              
              return revealedData ? (
                <RevealedLikeCard
                  key={like.userId}
                  userId={like.userId}
                  data={revealedData}
                  onLike={handleLike}
                  onPass={handlePass}
                />
              ) : (
                <BlurredLikeCard
                  key={like.userId}
                  onClick={() => {
                    if (!gate.isUnlocked) {
                      setSnackbar({ 
                        open: true, 
                        message: t('unlockToSee') || 'Unlock to see who likes you', 
                        severity: 'info' 
                      });
                    }
                  }}
                />
              );
            })}
          </AnimatePresence>
        </Box>

        {/* Empty state */}
        {likes.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Heart size={48} color="#cbd5e1" />
            <Typography sx={{ mt: 2, color: '#64748b' }}>
              {t('noLikesYet') || 'No likes yet'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LikesYouScreen;
