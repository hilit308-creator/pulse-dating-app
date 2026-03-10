/**
 * PointsBanner - Entry point to Points Hub
 * 
 * Used in:
 * - Home screen (Promo card)
 * - Chat screen (Sticky banner)
 * - Edit Profile (Points banner)
 * - Feature Gate (when blocked)
 * 
 * All entry points lead to /points
 * 
 * Design: Dark theme matching SubscriptionsScreen (nightlife, premium feel)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Coins, Sparkles, ChevronRight, Zap, Gift } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Floating circles animation - same style as PointsHubScreen hero
const FloatingCircles = ({ count = 4 }) => (
  <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {[
      { top: '15%', right: '8%', size: 32 },
      { top: '60%', left: '5%', size: 28 },
      { bottom: '20%', right: '15%', size: 24 },
      { top: '40%', left: '12%', size: 20 },
    ].slice(0, count).map((pos, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 3 + i * 0.5, 
          repeat: Infinity,
          delay: i * 0.3,
        }}
        style={{
          position: 'absolute',
          ...pos,
          width: pos.size,
          height: pos.size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
        }}
      />
    ))}
  </Box>
);

/**
 * Compact banner for inline use (Chat, Home sidebar) - Dark theme
 */
export const PointsBannerCompact = ({ balance = 0, onClick }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const handleClick = () => {
    if (onClick) onClick();
    navigate('/points');
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        background: 'linear-gradient(135deg, #0f0a15 0%, #1a1025 100%)',
        borderRadius: '14px',
        cursor: 'pointer',
        overflow: 'hidden',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        boxShadow: '0 4px 16px rgba(236, 72, 153, 0.2)',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.01)',
          boxShadow: '0 6px 20px rgba(236, 72, 153, 0.3)',
          borderColor: 'rgba(236, 72, 153, 0.5)',
        },
      }}
    >
      {/* Floating circles animation */}
      <FloatingCircles count={3} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'rgba(236, 72, 153, 0.2)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Coins size={20} color="#ec4899" />
        </Box>
        <Box>
          <Typography
            sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}
          >
            {balance} {t('points') || 'Points'}
          </Typography>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}
          >
            {t('boostYourProfile') || 'Boost your profile'}
          </Typography>
        </Box>
      </Box>
      <ChevronRight size={20} color="#ec4899" style={{ position: 'relative', zIndex: 1 }} />
    </Box>
  );
};

/**
 * Promo card for Home screen - Dark theme
 */
export const PointsPromoCard = ({ balance = 0 }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Box
      onClick={() => navigate('/points')}
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0f0a15 0%, #1a1025 100%)',
        borderRadius: '20px',
        p: 3,
        cursor: 'pointer',
        overflow: 'hidden',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        boxShadow: '0 8px 32px rgba(236, 72, 153, 0.2)',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 12px 40px rgba(236, 72, 153, 0.3)',
          borderColor: 'rgba(236, 72, 153, 0.5)',
        },
      }}
    >
      {/* Floating circles animation */}
      <FloatingCircles count={3} />
      
      {/* Background glow */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        right: '10%',
        transform: 'translateY(-50%)',
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />
      
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <Box>
          {/* Badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: '20px',
              background: 'rgba(236, 72, 153, 0.15)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              mb: 1.5,
            }}
          >
            <Sparkles size={12} color="#ec4899" />
            <Typography sx={{ color: '#ec4899', fontSize: '0.7rem', fontWeight: 600 }}>
              PULSE POINTS
            </Typography>
          </Box>
          <Typography
            sx={{ fontWeight: 900, color: '#ffffff', fontSize: '2.5rem', lineHeight: 1, mb: 0.5 }}
          >
            {balance}
          </Typography>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}
          >
            {t('usePointsToBoost') || 'Use points to boost your visibility'}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '16px',
            background: 'rgba(236, 72, 153, 0.2)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Gift size={26} color="#ec4899" />
        </Box>
      </Box>
      
      <Button
        fullWidth
        sx={{
          mt: 2.5,
          py: 1.25,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
          color: '#fff',
          fontWeight: 700,
          textTransform: 'none',
          fontSize: '0.95rem',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 8px 32px rgba(236, 72, 153, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(236, 72, 153, 0.45)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        {t('viewPointsHub') || 'View Points Hub'}
      </Button>
    </Box>
  );
};

/**
 * Sticky banner for Chat screen - Dark theme
 */
export const PointsStickyBanner = ({ balance = 0 }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Box
      onClick={() => navigate('/points')}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 1.5,
        background: 'linear-gradient(135deg, #0f0a15 0%, #1a1025 100%)',
        cursor: 'pointer',
        overflow: 'hidden',
        borderTop: '1px solid rgba(236, 72, 153, 0.3)',
      }}
    >
      {/* Floating circles animation */}
      <FloatingCircles count={3} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
        <Coins size={20} color="#ec4899" />
        <Typography
          sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}
        >
          {t('boostWithPoints') || 'Boost with'} <strong style={{ color: '#ec4899' }}>{balance}</strong> {t('points') || 'points'}
        </Typography>
      </Box>
      <ChevronRight size={18} color="#ec4899" style={{ position: 'relative', zIndex: 1 }} />
    </Box>
  );
};

/**
 * Feature gate banner (when feature is blocked) - Dark theme
 */
export const PointsFeatureGate = ({ 
  feature, 
  cost, 
  onActivate,
  currentBalance = 0 
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const canAfford = currentBalance >= cost;

  return (
    <Box
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0f0a15 0%, #1a1025 100%)',
        borderRadius: '24px',
        p: 4,
        textAlign: 'center',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        boxShadow: '0 8px 32px rgba(236, 72, 153, 0.2)',
        overflow: 'hidden',
      }}
    >
      {/* Floating circles animation */}
      <FloatingCircles count={3} />
      
      {/* Background glow */}
      <Box sx={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
        filter: 'blur(30px)',
      }} />
      
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: 72,
          height: 72,
          borderRadius: '20px',
          background: 'rgba(236, 72, 153, 0.2)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <Coins size={32} color="#ec4899" />
      </Box>
      
      <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1.25rem', mb: 1, position: 'relative', zIndex: 1 }}>
        {t('unlockFeature') || 'Unlock'} {feature}
      </Typography>
      
      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', mb: 3, position: 'relative', zIndex: 1 }}>
        {t('usePointsToUnlock') || 'Use points to unlock this feature temporarily'}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3, position: 'relative', zIndex: 1 }}>
        <Coins size={24} color="#ec4899" />
        <Typography sx={{ fontWeight: 800, color: '#ec4899', fontSize: '1.5rem' }}>
          {cost} {t('pts') || 'pts'}
        </Typography>
      </Box>
      
      {canAfford ? (
        <Button
          fullWidth
          onClick={onActivate}
          sx={{
            py: 1.5,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
            color: '#fff',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 8px 32px rgba(236, 72, 153, 0.35)',
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(236, 72, 153, 0.45)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {t('activateNow') || 'Activate Now'}
        </Button>
      ) : (
        <>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', mb: 2, position: 'relative', zIndex: 1 }}>
            {t('notEnoughPoints') || 'Not enough points'} ({currentBalance}/{cost})
          </Typography>
          <Button
            fullWidth
            onClick={() => navigate('/points')}
            sx={{
              py: 1.5,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 8px 32px rgba(236, 72, 153, 0.35)',
              position: 'relative',
              zIndex: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(236, 72, 153, 0.45)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {t('getMorePoints') || 'Get More Points'}
          </Button>
        </>
      )}
    </Box>
  );
};

export default PointsBannerCompact;
