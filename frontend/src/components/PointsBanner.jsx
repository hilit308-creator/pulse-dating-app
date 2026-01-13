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
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Coins, Sparkles, ChevronRight, Zap, Gift } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Compact banner for inline use (Chat, Home sidebar) - VIBRANT STYLE
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
        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
        borderRadius: '14px',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.01)',
          boxShadow: '0 6px 20px rgba(139,92,246,0.45)',
        },
      }}
    >
      {/* Floating sparkles */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: `${20 + i * 30}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.4,
              animation: `sparkle${i} ${2 + i * 0.3}s ease-in-out infinite`,
              '@keyframes sparkle0': { '0%, 100%': { transform: 'translateY(-50%) scale(1)' }, '50%': { transform: 'translateY(-50%) scale(1.3)' } },
              '@keyframes sparkle1': { '0%, 100%': { transform: 'translateY(-50%) scale(1)' }, '50%': { transform: 'translateY(-50%) scale(1.2)' } },
              '@keyframes sparkle2': { '0%, 100%': { transform: 'translateY(-50%) scale(1)' }, '50%': { transform: 'translateY(-50%) scale(1.4)' } },
            }}
          >
            <Sparkles size={10 + i * 2} color="rgba(255,255,255,0.6)" />
          </Box>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <Coins size={20} color="#ffffff" />
        </Box>
        <Box>
          <Typography
            sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}
          >
            {balance} {t('points') || 'Points'}
          </Typography>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }}
          >
            {t('boostYourProfile') || 'Boost your profile'}
          </Typography>
        </Box>
      </Box>
      <ChevronRight size={20} color="#fff" style={{ position: 'relative', zIndex: 1 }} />
    </Box>
  );
};

/**
 * Promo card for Home screen - VIBRANT STYLE
 */
export const PointsPromoCard = ({ balance = 0 }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Box
      onClick={() => navigate('/points')}
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
        borderRadius: '20px',
        p: 3,
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 12px 40px rgba(139,92,246,0.5)',
        },
      }}
    >
      {/* Floating particles */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: `${10 + i * 20}%`,
              top: `${20 + (i % 3) * 25}%`,
              opacity: 0.4,
              animation: `float${i} ${2.5 + i * 0.3}s ease-in-out infinite`,
              '@keyframes float0': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
              '@keyframes float1': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
              '@keyframes float2': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
              '@keyframes float3': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
              '@keyframes float4': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-9px)' } },
            }}
          >
            <Sparkles size={8 + i * 2} color="rgba(255,255,255,0.6)" />
          </Box>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Sparkles size={18} color="#ffffff" />
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.7rem',
              }}
            >
              {t('yourPoints') || 'Your Points'}
            </Typography>
          </Box>
          <Typography
            sx={{ fontWeight: 900, color: '#ffffff', fontSize: '2.5rem', lineHeight: 1, mb: 0.5, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
          >
            {balance}
          </Typography>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}
          >
            {t('usePointsToBoost') || 'Use points to boost your visibility'}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <Gift size={26} color="#ffffff" />
        </Box>
      </Box>
      
      <Button
        fullWidth
        sx={{
          mt: 2.5,
          py: 1.25,
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          fontWeight: 700,
          textTransform: 'none',
          fontSize: '0.95rem',
          border: '1px solid rgba(255,255,255,0.3)',
          position: 'relative',
          zIndex: 1,
          '&:hover': {
            background: 'rgba(255,255,255,0.35)',
          },
        }}
      >
        {t('viewPointsHub') || 'View Points Hub'}
      </Button>
    </Box>
  );
};

/**
 * Sticky banner for Chat screen - VIBRANT STYLE
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
        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* Sparkle effect */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: `${25 + i * 25}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.3,
            }}
          >
            <Sparkles size={10} color="rgba(255,255,255,0.6)" />
          </Box>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
        <Coins size={20} color="#ffffff" />
        <Typography
          sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}
        >
          {t('boostWithPoints') || 'Boost with'} <strong>{balance}</strong> {t('points') || 'points'}
        </Typography>
      </Box>
      <ChevronRight size={18} color="#ffffff" style={{ position: 'relative', zIndex: 1 }} />
    </Box>
  );
};

/**
 * Feature gate banner (when feature is blocked) - VIBRANT STYLE
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
        background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 100%)',
        borderRadius: '24px',
        p: 4,
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(139,92,246,0.3)',
        overflow: 'hidden',
        border: '1px solid rgba(139,92,246,0.3)',
      }}
    >
      {/* Background glow */}
      <Box sx={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
        filter: 'blur(30px)',
      }} />
      
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: 72,
          height: 72,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
          boxShadow: '0 8px 24px rgba(236,72,153,0.4)',
        }}
      >
        <Sparkles size={32} color="#ffffff" />
      </Box>
      
      <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1.25rem', mb: 1, position: 'relative', zIndex: 1 }}>
        {t('unlockFeature') || 'Unlock'} {feature}
      </Typography>
      
      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', mb: 3, position: 'relative', zIndex: 1 }}>
        {t('usePointsToUnlock') || 'Use points to unlock this feature temporarily'}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3, position: 'relative', zIndex: 1 }}>
        <Coins size={24} color="#F59E0B" />
        <Typography sx={{ fontWeight: 800, color: '#F59E0B', fontSize: '1.5rem' }}>
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
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
            color: '#ffffff',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 20px rgba(236,72,153,0.4)',
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              opacity: 0.9,
            },
          }}
        >
          {t('activateNow') || 'Activate Now'}
        </Button>
      ) : (
        <>
          <Typography sx={{ color: '#F59E0B', fontSize: '0.85rem', mb: 2, position: 'relative', zIndex: 1 }}>
            {t('notEnoughPoints') || 'Not enough points'} ({currentBalance}/{cost})
          </Typography>
          <Button
            fullWidth
            onClick={() => navigate('/points')}
            sx={{
              py: 1.5,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 20px rgba(236,72,153,0.4)',
              position: 'relative',
              zIndex: 1,
              '&:hover': {
                opacity: 0.9,
              },
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
