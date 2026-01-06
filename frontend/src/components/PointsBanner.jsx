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
import { Coins, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Compact banner for inline use (Chat, Home sidebar)
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        backgroundColor: 'rgba(108,92,231,0.08)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          backgroundColor: 'rgba(108,92,231,0.15)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Coins size={18} color="#ffffff" />
        </Box>
        <Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.85rem' }}
          >
            {balance} {t('points') || 'Points'}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#6C5CE7', fontSize: '0.7rem' }}
          >
            {t('boostYourProfile') || 'Boost your profile'}
          </Typography>
        </Box>
      </Box>
      <ChevronRight size={18} color="#6C5CE7" />
    </Box>
  );
};

/**
 * Promo card for Home screen
 */
export const PointsPromoCard = ({ balance = 0 }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Box
      onClick={() => navigate('/points')}
      sx={{
        background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
        borderRadius: '16px',
        p: 2.5,
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Sparkles size={18} color="#ffffff" />
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {t('yourPoints') || 'Your Points'}
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#ffffff', mb: 0.5 }}
          >
            {balance}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}
          >
            {t('usePointsToBoost') || 'Use points to boost your visibility'}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Zap size={24} color="#ffffff" />
        </Box>
      </Box>
      
      <Button
        fullWidth
        sx={{
          mt: 2,
          py: 1,
          borderRadius: '10px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: '#ffffff',
          fontWeight: 600,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.3)',
          },
        }}
      >
        {t('viewPointsHub') || 'View Points Hub'}
      </Button>
    </Box>
  );
};

/**
 * Sticky banner for Chat screen
 */
export const PointsStickyBanner = ({ balance = 0 }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Box
      onClick={() => navigate('/points')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 1.5,
        backgroundColor: '#6C5CE7',
        cursor: 'pointer',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Coins size={20} color="#ffffff" />
        <Typography
          variant="body2"
          sx={{ color: '#ffffff', fontWeight: 500 }}
        >
          {t('boostWithPoints') || 'Boost with'} <strong>{balance}</strong> {t('points') || 'points'}
        </Typography>
      </Box>
      <ChevronRight size={18} color="#ffffff" />
    </Box>
  );
};

/**
 * Feature gate banner (when feature is blocked)
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
        backgroundColor: '#fff',
        borderRadius: '16px',
        p: 3,
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <Sparkles size={28} color="#ffffff" />
      </Box>
      
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
        {t('unlockFeature') || 'Unlock'} {feature}
      </Typography>
      
      <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
        {t('usePointsToUnlock') || 'Use points to unlock this feature temporarily'}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
        <Coins size={20} color="#6C5CE7" />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#6C5CE7' }}>
          {cost} {t('pts') || 'pts'}
        </Typography>
      </Box>
      
      {canAfford ? (
        <Button
          fullWidth
          onClick={onActivate}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            color: '#ffffff',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          {t('activateNow') || 'Activate Now'}
        </Button>
      ) : (
        <>
          <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mb: 2 }}>
            {t('notEnoughPoints') || 'Not enough points'} ({currentBalance}/{cost})
          </Typography>
          <Button
            fullWidth
            onClick={() => navigate('/points')}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
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
