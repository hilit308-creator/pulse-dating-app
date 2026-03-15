/**
 * SubscriptionsScreen - Pulse Premium Subscriptions
 * 
 * Design: Nightlife, urban, alive, sexy, user in full control
 * NOT: Sales screen, classic premium, cold tech
 * 
 * Visual:
 * - Multi-layered background (dark purple/black, neon gradient, people, overlay)
 * - Pulse Wave animation (abstract horizontal, neon pink/purple, 15-25% opacity)
 * - Soft fade-in animations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Dialog, DialogContent, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Eye, Zap, Clock, Shield, Ghost, CreditCard, X, Apple } from 'lucide-react';

// Sample profile images for the people layer (collage effect)
const PROFILE_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop',
];

// Pulse Wave SVG Component - Abstract horizontal wave, NOT ECG/heart/scientific
const PulseWave = ({ intensity = 'calm', style = {} }) => {
  const isCalm = intensity === 'calm';
  const peakHeight = isCalm ? 15 : 25;
  const glowIntensity = isCalm ? 0.3 : 0.5;
  
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        height: 120,
        overflow: 'hidden',
        opacity: 0.2,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="pulseGlow">
            <feGaussianBlur stdDeviation={glowIntensity * 8} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated wave path */}
        <motion.path
          d={`M0,60 
              Q150,${60 - peakHeight} 300,60 
              T600,60 
              Q750,${60 + peakHeight} 900,60 
              T1200,60`}
          fill="none"
          stroke="url(#pulseGradient)"
          strokeWidth="3"
          filter="url(#pulseGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: 1,
            d: [
              `M0,60 Q150,${60 - peakHeight} 300,60 T600,60 Q750,${60 + peakHeight} 900,60 T1200,60`,
              `M0,60 Q150,${60 + peakHeight * 0.5} 300,60 T600,60 Q750,${60 - peakHeight * 0.5} 900,60 T1200,60`,
              `M0,60 Q150,${60 - peakHeight} 300,60 T600,60 Q750,${60 + peakHeight} 900,60 T1200,60`,
            ]
          }}
          transition={{
            pathLength: { duration: 1.5, ease: 'easeOut' },
            opacity: { duration: 0.5 },
            d: {
              duration: isCalm ? 8 : 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          }}
        />
        
        {/* Secondary subtle wave */}
        <motion.path
          d={`M0,60 
              Q200,${60 + peakHeight * 0.6} 400,60 
              T800,60 
              Q1000,${60 - peakHeight * 0.6} 1200,60`}
          fill="none"
          stroke="url(#pulseGradient)"
          strokeWidth="1.5"
          opacity="0.4"
          filter="url(#pulseGlow)"
          animate={{ 
            d: [
              `M0,60 Q200,${60 + peakHeight * 0.6} 400,60 T800,60 Q1000,${60 - peakHeight * 0.6} 1200,60`,
              `M0,60 Q200,${60 - peakHeight * 0.4} 400,60 T800,60 Q1000,${60 + peakHeight * 0.4} 1200,60`,
              `M0,60 Q200,${60 + peakHeight * 0.6} 400,60 T800,60 Q1000,${60 - peakHeight * 0.6} 1200,60`,
            ]
          }}
          transition={{
            d: {
              duration: isCalm ? 10 : 7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }
          }}
        />
      </svg>
    </Box>
  );
};

// People Layer - Collage of profile photos with blur and overlay
const PeopleLayer = () => {
  const positions = [
    { top: '5%', left: '5%', size: 80, rotate: -10 },
    { top: '8%', right: '10%', size: 70, rotate: 8 },
    { top: '20%', left: '15%', size: 60, rotate: -5 },
    { top: '15%', right: '5%', size: 90, rotate: 12 },
    { top: '35%', left: '2%', size: 75, rotate: -8 },
    { top: '40%', right: '8%', size: 65, rotate: 5 },
    { top: '55%', left: '12%', size: 85, rotate: -12 },
    { top: '50%', right: '3%', size: 70, rotate: 10 },
    { top: '70%', left: '5%', size: 60, rotate: -6 },
    { top: '75%', right: '12%', size: 80, rotate: 8 },
    { top: '85%', left: '18%', size: 65, rotate: -10 },
    { top: '88%', right: '5%', size: 75, rotate: 6 },
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {positions.map((pos, idx) => (
        <Box
          key={idx}
          sx={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            right: pos.right,
            width: pos.size,
            height: pos.size,
            borderRadius: '50%',
            overflow: 'hidden',
            transform: `rotate(${pos.rotate}deg)`,
            filter: 'blur(3px)',
            opacity: 0.4,
          }}
        >
          <img
            src={PROFILE_IMAGES[idx % PROFILE_IMAGES.length]}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
      ))}
      
      {/* Dark overlay on people layer - 65% opacity */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 10, 30, 0.65)',
        }}
      />
    </Box>
  );
};

// Feature Item Component
const FeatureItem = ({ icon: Icon, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'rgba(236, 72, 153, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {Icon ? <Icon size={14} color="#ec4899" /> : <Check size={14} color="#ec4899" />}
    </Box>
    <Typography
      sx={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.9rem',
        fontWeight: 500,
      }}
    >
      {text}
    </Typography>
  </Box>
);

// Pricing Option Component
const PricingOption = ({ duration, price, note, selected, onSelect }) => (
  <Box
    onClick={onSelect}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: 1.5,
      borderRadius: '12px',
      border: selected 
        ? '2px solid rgba(236, 72, 153, 0.8)' 
        : '1px solid rgba(255, 255, 255, 0.15)',
      background: selected 
        ? 'rgba(236, 72, 153, 0.1)' 
        : 'rgba(255, 255, 255, 0.03)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      mb: 1,
      '&:hover': {
        background: 'rgba(236, 72, 153, 0.08)',
        borderColor: 'rgba(236, 72, 153, 0.5)',
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: selected 
            ? '6px solid #ec4899' 
            : '2px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.2s ease',
        }}
      />
      <Box>
        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
          {duration}
        </Typography>
        {note && (
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
            {note}
          </Typography>
        )}
      </Box>
    </Box>
    <Typography sx={{ color: '#ec4899', fontWeight: 700, fontSize: '1rem' }}>
      {price}
    </Typography>
  </Box>
);

// CTA Button with Ripple Effect
const CTAButton = ({ children, onClick }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  return (
    <Button
      onClick={handleClick}
      sx={{
        position: 'relative',
        width: '100%',
        py: 1.75,
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1rem',
        textTransform: 'none',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(236, 72, 153, 0.35)',
        '&:hover': {
          background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
          boxShadow: '0 12px 40px rgba(236, 72, 153, 0.45)',
        },
      }}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.4)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      ))}
      {children}
    </Button>
  );
};

// Subscription Section Component
const SubscriptionSection = ({ 
  type, 
  headline, 
  subline, 
  features, 
  pricingOptions, 
  ctaText, 
  waveIntensity,
  selectedPricing,
  onSelectPricing,
  onActivate,
  isActive,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Box
        sx={{
          position: 'relative',
          mx: 2,
          mb: 4,
          p: 3,
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden',
        }}
      >
        {/* Pulse Wave in background */}
        <PulseWave intensity={waveIntensity} style={{ opacity: waveIntensity === 'calm' ? 0.15 : 0.22 }} />
        
        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
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
              mb: 2,
            }}
          >
            <Sparkles size={14} color="#ec4899" />
            <Typography sx={{ color: '#ec4899', fontSize: '0.75rem', fontWeight: 600 }}>
              {type}
            </Typography>
          </Box>
          
          {/* Headline */}
          <Typography
            variant="h5"
            sx={{
              color: '#fff',
              fontWeight: 800,
              mb: 0.5,
              fontSize: '1.5rem',
            }}
          >
            {headline}
          </Typography>
          
          {/* Subline */}
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.95rem',
              mb: 3,
            }}
          >
            {subline}
          </Typography>
          
          {/* Features */}
          <Box sx={{ mb: 3 }}>
            {features.map((feature, idx) => (
              <FeatureItem key={idx} icon={feature.icon} text={feature.text} />
            ))}
          </Box>
          
          {/* Pricing Options */}
          {!isActive && (
            <>
              <Box sx={{ mb: 3 }}>
                {pricingOptions.map((option, idx) => (
                  <PricingOption
                    key={idx}
                    duration={option.duration}
                    price={option.price}
                    note={option.note}
                    selected={selectedPricing === idx}
                    onSelect={() => onSelectPricing(idx)}
                  />
                ))}
              </Box>
              
              {/* CTA */}
              <CTAButton onClick={onActivate}>
                {ctaText}
              </CTAButton>
            </>
          )}
          
          {/* Active State */}
          {isActive && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                py: 1.75,
                borderRadius: '14px',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <Check size={20} color="#22c55e" />
              <Typography sx={{ color: '#22c55e', fontWeight: 600 }}>
                Active Plan
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

// Pricing Options - defined outside component to avoid stale closures
const PLUS_PRICING_OPTIONS = [
  { duration: '1 Hour', price: '₪5', note: 'one-time, no renewal' },
  { duration: 'Monthly', price: '₪29', note: 'auto-renew' },
  { duration: '3 Months', price: '₪69', note: 'auto-renew' },
];

const PRO_PRICING_OPTIONS = [
  { duration: 'Weekly', price: '₪9', note: '' },
  { duration: 'Monthly', price: '₪49', note: '' },
  { duration: '3 Months', price: '₪119', note: '' },
  { duration: '6 Months', price: '₪199', note: '' },
];

// Payment Modal Component - Fallback for non-Apple Pay browsers
const PaymentModal = ({ open, onClose, planName, price, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async () => {
    setError('');
    
    // Basic validation
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card number');
      return;
    }
    if (expiry.length < 5) {
      setError('Please enter a valid expiry date');
      return;
    }
    if (cvv.length < 3) {
      setError('Please enter a valid CVV');
      return;
    }
    if (!name.trim()) {
      setError('Please enter cardholder name');
      return;
    }

    setProcessing(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('[Payment] Processing payment for', planName, 'at', price);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleApplePay = async () => {
    if (!window.PaymentRequest) {
      setError('Apple Pay is not available on this device');
      return;
    }

    try {
      const priceValue = parseFloat(price.replace('₪', ''));
      
      const paymentRequest = new PaymentRequest(
        [{
          supportedMethods: 'https://apple.com/apple-pay',
          data: {
            version: 3,
            merchantIdentifier: 'merchant.com.pulse.app',
            merchantCapabilities: ['supports3DS'],
            supportedNetworks: ['visa', 'masterCard', 'amex'],
            countryCode: 'IL',
          },
        }],
        {
          total: {
            label: `Pulse ${planName}`,
            amount: { currency: 'ILS', value: priceValue.toString() },
          },
        }
      );

      const canMakePayment = await paymentRequest.canMakePayment();
      
      if (canMakePayment) {
        const paymentResponse = await paymentRequest.show();
        await paymentResponse.complete('success');
        onSuccess();
        onClose();
      } else {
        setError('Apple Pay is not set up on this device');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.log('[Apple Pay] Error:', err);
        setError('Apple Pay failed. Please use card payment.');
      }
    }
  };

  if (!open) return null;

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
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '90%',
            maxWidth: 400,
            background: 'linear-gradient(180deg, #1a1025 0%, #0f0a15 100%)',
            borderRadius: 24,
            padding: 24,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem' }}>
              Payment
            </Typography>
            <Box
              component="button"
              onClick={onClose}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} color="#fff" />
            </Box>
          </Box>

          {/* Plan Summary */}
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              mb: 3,
            }}
          >
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
              {planName}
            </Typography>
            <Typography sx={{ color: '#ec4899', fontWeight: 700, fontSize: '1.5rem' }}>
              {price}
            </Typography>
          </Box>

          {/* Apple Pay Button */}
          <Button
            fullWidth
            onClick={handleApplePay}
            disabled={processing}
            sx={{
              py: 1.5,
              mb: 2,
              borderRadius: '12px',
              background: '#000',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              '&:hover': { background: '#1a1a1a' },
              '&:disabled': { opacity: 0.5 },
            }}
          >
            <Apple size={20} />
            Pay with Apple Pay
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem' }}>
              or pay with card
            </Typography>
            <Box sx={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
          </Box>

          {/* Card Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              inputProps={{ maxLength: 19 }}
              InputProps={{
                startAdornment: <CreditCard size={18} color="#888" style={{ marginRight: 8 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#ec4899' },
                },
                '& input::placeholder': { color: 'rgba(255, 255, 255, 0.4)' },
              }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                inputProps={{ maxLength: 5 }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#ec4899' },
                  },
                  '& input::placeholder': { color: 'rgba(255, 255, 255, 0.4)' },
                }}
              />
              <TextField
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                inputProps={{ maxLength: 4 }}
                type="password"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#ec4899' },
                  },
                  '& input::placeholder': { color: 'rgba(255, 255, 255, 0.4)' },
                }}
              />
            </Box>

            <TextField
              fullWidth
              placeholder="Cardholder Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#ec4899' },
                },
                '& input::placeholder': { color: 'rgba(255, 255, 255, 0.4)' },
              }}
            />

            {error && (
              <Typography sx={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
                {error}
              </Typography>
            )}

            <Button
              fullWidth
              onClick={handleSubmit}
              disabled={processing}
              sx={{
                py: 1.5,
                mt: 1,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)' },
                '&:disabled': { opacity: 0.7 },
              }}
            >
              {processing ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                `Pay ${price}`
              )}
            </Button>
          </Box>

          {/* Security Note */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3 }}>
            <Shield size={14} color="rgba(255, 255, 255, 0.4)" />
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.75rem' }}>
              Secure payment powered by Stripe
            </Typography>
          </Box>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Subscriptions Screen
const SubscriptionsScreen = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [plusPricing, setPlusPricing] = useState(1); // Default to monthly
  const [proPricing, setProPricing] = useState(1); // Default to monthly
  const [activePlan, setActivePlan] = useState(null); // null, 'plus', 'pro'
  const [purchasing, setPurchasing] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(null); // { planType, durationKey, product }
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Duration keys for the hook
  const PLUS_DURATION_KEYS = ['hourly', 'monthly', 'quarterly'];
  const PRO_DURATION_KEYS = ['weekly', 'monthly', 'quarterly', 'biannual'];
  
  // Check for existing subscription on mount
  useEffect(() => {
    const existingPlan = localStorage.getItem('pulse_subscription');
    if (existingPlan) {
      try {
        const parsed = JSON.parse(existingPlan);
        setActivePlan(parsed.type || existingPlan);
      } catch {
        setActivePlan(existingPlan);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Open purchase confirmation dialog
  const openPurchaseDialog = useCallback(async (planType, durationKey) => {
    console.log('[SubscriptionsScreen] Opening purchase dialog:', planType, durationKey);
    try {
      const { PRODUCTS } = await import('../services/storeBilling');
      console.log('[SubscriptionsScreen] PRODUCTS loaded:', PRODUCTS);
      const product = PRODUCTS[planType]?.[durationKey];
      console.log('[SubscriptionsScreen] Product found:', product);
      if (product) {
        setPendingPurchase({ planType, durationKey, product });
        setShowPurchaseDialog(true);
        console.log('[SubscriptionsScreen] Dialog should be open now');
      } else {
        console.error('[SubscriptionsScreen] Product not found for:', planType, durationKey);
      }
    } catch (error) {
      console.error('Failed to load product info:', error);
    }
  }, []);

  // Confirm and execute purchase
  const handleConfirmPurchase = useCallback(async () => {
    if (purchasing || !pendingPurchase) return;
    
    setPurchasing(true);
    
    try {
      const { storeBilling } = await import('../services/storeBilling');
      const { planType, product } = pendingPurchase;
      
      // Use purchaseAndValidate for full flow with duplicate prevention
      const result = await storeBilling.purchaseAndValidate(product.id);
      
      if (result.success) {
        // Check if already processed (duplicate callback)
        if (result.alreadyProcessed) {
          console.log('[Subscriptions] Purchase already processed, skipping');
          setShowPurchaseDialog(false);
          setPendingPurchase(null);
          return;
        }
        
        // Subscription is saved by validateReceipt via _cacheEntitlements
        // Update local state for immediate UI feedback
        setActivePlan(planType);
        
        setShowPurchaseDialog(false);
        setPendingPurchase(null);
        setSnackbar({
          open: true,
          message: 'Purchase successful! Premium activated.',
          severity: 'success',
        });
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('[Store Billing] Purchase failed:', error);
      const message = error.message === 'cancelled' 
        ? 'Purchase cancelled' 
        : 'Purchase failed. Please try again.';
      setShowPurchaseDialog(false);
      setPendingPurchase(null);
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setPurchasing(false);
    }
  }, [purchasing, pendingPurchase]);

  const handleRestorePurchases = useCallback(async () => {
    setSnackbar({ open: true, message: 'Restoring purchases...', severity: 'info' });
    
    try {
      const { storeBilling } = await import('../services/storeBilling');
      const purchases = await storeBilling.restorePurchases();
      
      if (purchases && purchases.length > 0) {
        setSnackbar({ open: true, message: 'Purchases restored!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'No purchases to restore', severity: 'info' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Restore failed', severity: 'error' });
    }
  }, []);

  const handleActivatePlus = useCallback(() => {
    const durationKey = PLUS_DURATION_KEYS[plusPricing];
    openPurchaseDialog('plus', durationKey);
  }, [plusPricing, openPurchaseDialog]);

  const handleActivatePro = useCallback(() => {
    const durationKey = PRO_DURATION_KEYS[proPricing];
    openPurchaseDialog('pro', durationKey);
  }, [proPricing, openPurchaseDialog]);

  const plusFeatures = [
    { icon: Eye, text: 'See who already liked you' },
    { icon: Zap, text: 'Smart filters' },
    { icon: Clock, text: 'One Pulse Beat per week' },
  ];

  const proFeatures = [
    { icon: null, text: 'Unlimited Backtrack' },
    { icon: Zap, text: '4–5 Pulse Beats per week' },
    { icon: Clock, text: 'Longer Beats (30–45 min)' },
    { icon: Shield, text: 'Control visibility' },
    { icon: Ghost, text: 'Incognito mode' },
  ];

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: '100vh' }}
    >
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          minHeight: '100vh',
          overflowX: 'hidden',
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
        }}
      >
        {/* ===== LAYERED BACKGROUND ===== */}
        
        {/* Base Layer - Deep dark purple/black */}
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(180deg, #0a0612 0%, #150d20 50%, #1a0f28 100%)',
            zIndex: 0,
          }}
        />
        
        {/* Gradient Layer - Neon glow effect (like city lights at night) */}
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 50% at 20% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 60%, rgba(168, 85, 247, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 50% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)
            `,
            zIndex: 1,
          }}
        />
        
        {/* People Layer - Collage with blur and overlay */}
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 2 }}>
          <PeopleLayer />
        </Box>
        
        {/* Final Dark Overlay - For text readability */}
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(10, 6, 18, 0.5) 0%, rgba(10, 6, 18, 0.3) 50%, rgba(10, 6, 18, 0.6) 100%)',
            zIndex: 3,
          }}
        />
        
        {/* ===== CONTENT ===== */}
        <Box sx={{ position: 'relative', zIndex: 10 }}>
          
          {/* ===== HERO AREA ===== */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '35vh',
              px: 3,
              textAlign: 'center',
            }}
          >
            {/* Pulse Wave in Hero background */}
            <PulseWave intensity="calm" style={{ top: '60%' }} />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2.25rem' },
                  lineHeight: 1.3,
                  maxWidth: 320,
                  mx: 'auto',
                }}
              >
                Choose how you want to be present
              </Typography>
            </motion.div>
          </Box>
          
          {/* ===== MY SUBSCRIPTION (if active) ===== */}
          {activePlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Box
                sx={{
                  mx: 2,
                  mb: 4,
                  p: 3,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.1) 100%)',
                  border: '1px solid rgba(34,197,94,0.3)',
                }}
              >
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: 1,
                    mb: 1,
                  }}
                >
                  YOUR CURRENT PLAN
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    color: '#fff',
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  {activePlan === 'pro' ? 'Pulse Pro' : 'Pulse Plus'} — {activePlan === 'pro' ? PRO_PRICING_OPTIONS[proPricing]?.duration : PLUS_PRICING_OPTIONS[plusPricing]?.duration}
                </Typography>
                
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', mb: 0.5 }}>
                  Next renewal: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </Typography>
                
                <Typography sx={{ color: '#22c55e', fontWeight: 600, fontSize: '0.95rem', mb: 2 }}>
                  {activePlan === 'pro' ? PRO_PRICING_OPTIONS[proPricing]?.price : PLUS_PRICING_OPTIONS[plusPricing]?.price} / {activePlan === 'pro' ? PRO_PRICING_OPTIONS[proPricing]?.duration?.toLowerCase() : PLUS_PRICING_OPTIONS[plusPricing]?.duration?.toLowerCase()}
                </Typography>
                
                <Button
                  variant="outlined"
                  onClick={() => {
                    // Open App Store subscription management
                    window.open('https://apps.apple.com/account/subscriptions', '_blank');
                  }}
                  sx={{
                    borderRadius: '12px',
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: '#ffffff !important',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.5)',
                      background: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  <span style={{ color: '#ffffff' }}>Manage subscription</span>
                </Button>
              </Box>
            </motion.div>
          )}
          
          {/* ===== PULSE PLUS SECTION ===== */}
          <SubscriptionSection
            type="PULSE PLUS"
            headline="Know who's into you"
            subline="No guessing. No waiting."
            features={plusFeatures}
            pricingOptions={PLUS_PRICING_OPTIONS}
            ctaText="Activate Pulse Plus"
            waveIntensity="calm"
            selectedPricing={plusPricing}
            onSelectPricing={setPlusPricing}
            onActivate={handleActivatePlus}
            isActive={activePlan === 'plus' || activePlan === 'pro'}
          />
          
          {/* ===== PULSE PRO SECTION ===== */}
          <SubscriptionSection
            type="PULSE PRO"
            headline="Show up at the right moment"
            subline="You decide when and how you're seen."
            features={proFeatures}
            pricingOptions={PRO_PRICING_OPTIONS}
            ctaText="Take control with Pulse Pro"
            waveIntensity="strong"
            selectedPricing={proPricing}
            onSelectPricing={setProPricing}
            onActivate={handleActivatePro}
            isActive={activePlan === 'pro'}
          />

          {/* Restore Purchases */}
          <Box sx={{ textAlign: 'center', px: 2, mb: 2 }}>
            <Typography
              onClick={handleRestorePurchases}
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                '&:hover': { color: 'rgba(255, 255, 255, 0.8)' },
                transition: 'color 0.2s ease',
              }}
            >
              Restore Purchases
            </Typography>
          </Box>
          
          {/* Bottom spacing */}
          <Box sx={{ height: 40 }} />
        </Box>
      </Box>

    </motion.div>

    {/* Purchase Confirmation Dialog */}
    <Dialog
      open={showPurchaseDialog}
      onClose={() => !purchasing && setShowPurchaseDialog(false)}
      PaperProps={{
        sx: {
          background: 'linear-gradient(180deg, #1a1025 0%, #0f0a15 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: 340,
          mx: 2,
        },
      }}
    >
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          {/* Icon */}
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: pendingPurchase?.planType === 'pro' 
                ? 'rgba(168, 85, 247, 0.15)' 
                : 'rgba(236, 72, 153, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Sparkles size={28} color={pendingPurchase?.planType === 'pro' ? '#a855f7' : '#ec4899'} />
          </Box>
          
          {/* Title */}
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', mb: 1 }}>
            {purchasing ? 'Processing...' : 'Confirm Purchase'}
          </Typography>
          
          {/* Plan details */}
          {!purchasing && pendingPurchase && (
            <>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', mb: 2 }}>
                You're about to subscribe to
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  background: pendingPurchase.planType === 'pro' 
                    ? 'rgba(168, 85, 247, 0.1)' 
                    : 'rgba(236, 72, 153, 0.1)',
                  border: `1px solid ${pendingPurchase.planType === 'pro' 
                    ? 'rgba(168, 85, 247, 0.3)' 
                    : 'rgba(236, 72, 153, 0.3)'}`,
                  mb: 3,
                }}
              >
                <Typography sx={{ 
                  color: pendingPurchase.planType === 'pro' ? '#a855f7' : '#ec4899', 
                  fontWeight: 700, 
                  fontSize: '1.3rem' 
                }}>
                  Pulse {pendingPurchase.planType === 'pro' ? 'Pro' : 'Plus'}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                  {pendingPurchase.product?.duration} • {pendingPurchase.product?.currency}{pendingPurchase.product?.price}
                </Typography>
              </Box>
            </>
          )}
          
          {/* Loading state */}
          {purchasing && (
            <Box sx={{ py: 3 }}>
              <CircularProgress sx={{ color: pendingPurchase?.planType === 'pro' ? '#a855f7' : '#ec4899' }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 2, fontSize: '0.9rem' }}>
                Connecting to store...
              </Typography>
            </Box>
          )}
          
          {/* Buttons */}
          {!purchasing && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                onClick={() => {
                  setShowPurchaseDialog(false);
                  setPendingPurchase(null);
                }}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#ffffff !important',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.08)',
                  '&:hover': { background: 'rgba(255,255,255,0.12)' },
                }}
              >
                <span style={{ color: '#ffffff' }}>Cancel</span>
              </Button>
              <Button
                fullWidth
                onClick={handleConfirmPurchase}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  background: pendingPurchase?.planType === 'pro'
                    ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
                    : 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { 
                    background: pendingPurchase?.planType === 'pro'
                      ? 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)'
                      : 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
                  },
                }}
              >
                Confirm
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for purchase feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 8 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SubscriptionsScreen;
