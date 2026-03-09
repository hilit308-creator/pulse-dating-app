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
 * Compact banner for inline use (Chat, Home sidebar) - Events page style
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        borderRadius: '14px',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(102,126,234,0.35)',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.01)',
          boxShadow: '0 6px 20px rgba(102,126,234,0.45)',
        },
      }}
    >
      {/* Subtle sparkles */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(2)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: `${30 + i * 35}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.3,
            }}
          >
            <Sparkles size={12} color="rgba(255,255,255,0.5)" />
          </Box>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
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
            sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem' }}
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
 * Promo card for Home screen - Events page style
 */
export const PointsPromoCard = ({ balance = 0 }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Box
      onClick={() => navigate('/points')}
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        borderRadius: '20px',
        p: 3,
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(102,126,234,0.4)',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 12px 40px rgba(102,126,234,0.5)',
        },
      }}
    >
      {/* Subtle sparkles */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(2)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: `${30 + i * 35}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.3,
            }}
          >
            <Sparkles size={14} color="rgba(255,255,255,0.5)" />
          </Box>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Coins size={18} color="#ffffff" />
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
            sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}
          >
            {t('usePointsToBoost') || 'Use points to boost your visibility'}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.2)',
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
          bgcolor: '#fff',
          color: '#667eea',
          fontWeight: 700,
          textTransform: 'none',
          fontSize: '0.95rem',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          '&:hover': {
            bgcolor: '#f8f9ff',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
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
 * Sticky banner for Chat screen - Events page style
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* Subtle sparkles */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(2)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: `${30 + i * 35}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.3,
            }}
          >
            <Sparkles size={10} color="rgba(255,255,255,0.5)" />
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
 * Feature gate banner (when feature is blocked) - Events page style
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        borderRadius: '24px',
        p: 4,
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
        overflow: 'hidden',
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
        background: 'radial-gradient(circle, rgba(240,147,251,0.3) 0%, transparent 70%)',
        filter: 'blur(30px)',
      }} />
      
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: 72,
          height: 72,
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <Coins size={32} color="#ffffff" />
      </Box>
      
      <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1.25rem', mb: 1, position: 'relative', zIndex: 1 }}>
        {t('unlockFeature') || 'Unlock'} {feature}
      </Typography>
      
      <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', mb: 3, position: 'relative', zIndex: 1 }}>
        {t('usePointsToUnlock') || 'Use points to unlock this feature temporarily'}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3, position: 'relative', zIndex: 1 }}>
        <Coins size={24} color="#fff" />
        <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1.5rem' }}>
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
            bgcolor: '#fff',
            color: '#667eea',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              bgcolor: '#f8f9ff',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {t('activateNow') || 'Activate Now'}
        </Button>
      ) : (
        <>
          <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', mb: 2, position: 'relative', zIndex: 1 }}>
            {t('notEnoughPoints') || 'Not enough points'} ({currentBalance}/{cost})
          </Typography>
          <Button
            fullWidth
            onClick={() => navigate('/points')}
            sx={{
              py: 1.5,
              borderRadius: '14px',
              bgcolor: '#fff',
              color: '#667eea',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              position: 'relative',
              zIndex: 1,
              '&:hover': {
                bgcolor: '#f8f9ff',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
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
