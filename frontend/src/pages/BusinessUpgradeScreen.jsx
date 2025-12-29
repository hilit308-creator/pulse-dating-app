/**
 * BusinessUpgradeScreen - Monetization / Business Upgrade (MVP)
 * 
 * Spec:
 * - Purpose: Upgrade to Business account for access to business features
 * - Entry: Account Settings → Upgrade, or Business CTA from Events/Business Page
 * - Value props: Create events, Get visibility, Connect with people nearby
 * - Plans: Free (read-only), Business Basic
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Crown,
  Calendar,
  Eye,
  Users,
  Check,
  Sparkles,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Plan features
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Basic access',
    features: [
      'View nearby activity',
      'Join events',
      'Basic profile',
    ],
    notIncluded: [
      'Create events',
      'Business visibility',
      'Analytics dashboard',
    ],
    highlighted: false,
  },
  {
    id: 'business',
    name: 'Business',
    price: '$9.99',
    period: '/month',
    description: 'For venues & organizers',
    features: [
      'Everything in Free',
      'Create unlimited events',
      'Get visibility on map',
      'Connect with people nearby',
      'Business analytics',
      'Priority support',
    ],
    notIncluded: [],
    highlighted: true,
  },
];

// Value propositions
const VALUE_PROPS = [
  {
    icon: Calendar,
    title: 'Create events',
    description: 'Host events and attract nearby people',
  },
  {
    icon: Eye,
    title: 'Get visibility',
    description: 'Your business appears on the map',
  },
  {
    icon: Users,
    title: 'Connect locally',
    description: 'Reach people who are nearby right now',
  },
];

const BusinessUpgradeScreen = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState('business');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Check if already business
  const isAlreadyBusiness = user?.accountType === 'business';

  // Track page view
  useEffect(() => {
    trackEvent('upgrade_viewed');
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleUpgrade = useCallback(async () => {
    if (selectedPlan !== 'business') return;

    trackEvent('upgrade_clicked', { plan: selectedPlan });
    setIsUpgrading(true);

    try {
      // Simulate payment/upgrade process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user to business account
      updateUser({ accountType: 'business' });

      trackEvent('upgrade_success', { plan: selectedPlan });
      setSnack({ open: true, message: 'Welcome to Business! 🎉', severity: 'success' });

      // Redirect to events or business dashboard after short delay
      setTimeout(() => {
        navigate('/events', { replace: true });
      }, 1500);
    } catch (err) {
      setSnack({ open: true, message: 'Upgrade failed. Please try again.', severity: 'error' });
    } finally {
      setIsUpgrading(false);
    }
  }, [selectedPlan, updateUser, navigate]);

  // If already business, show confirmation
  if (isAlreadyBusiness) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 2,
            borderBottom: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowLeft size={24} color="#1a1a2e" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
            Business Account
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Crown size={40} color="white" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            You're a Business member!
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
            You have access to all business features.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/events')}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Go to Events
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 2,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 10,
        }}
      >
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowLeft size={24} color="#1a1a2e" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          Upgrade to Business
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, pb: 4, overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero */}
          <Box
            sx={{
              px: 3,
              py: 4,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              color: '#fff',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Sparkles size={32} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Grow your business
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Connect with people nearby and create events
            </Typography>
          </Box>

          {/* Value Props */}
          <Box sx={{ px: 3, py: 3 }}>
            <Typography
              variant="overline"
              sx={{ color: '#64748b', fontWeight: 600, letterSpacing: 1 }}
            >
              What you get
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {VALUE_PROPS.map((prop, index) => (
                <motion.div
                  key={prop.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(108,92,231,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <prop.icon size={22} color="#6C5CE7" />
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                        {prop.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {prop.description}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>

          {/* Plans */}
          <Box sx={{ px: 3, py: 2 }}>
            <Typography
              variant="overline"
              sx={{ color: '#64748b', fontWeight: 600, letterSpacing: 1 }}
            >
              Choose your plan
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    border: selectedPlan === plan.id 
                      ? '2px solid #6C5CE7' 
                      : '2px solid transparent',
                    backgroundColor: plan.highlighted ? 'rgba(108,92,231,0.03)' : '#f8fafc',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  {plan.highlighted && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: 16,
                        backgroundColor: '#f59e0b',
                        color: '#fff',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Star size={12} fill="white" />
                      POPULAR
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {plan.description}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#6C5CE7' }}>
                        {plan.price}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {plan.period}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Features */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {plan.features.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Check size={16} color="#10b981" />
                        <Typography variant="body2" sx={{ color: '#1a1a2e' }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.5 }}>
                        <Check size={16} color="#94a3b8" />
                        <Typography variant="body2" sx={{ color: '#94a3b8', textDecoration: 'line-through' }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* CTA Button - Fixed at bottom */}
      <Box
        sx={{
          px: 3,
          py: 3,
          borderTop: '1px solid rgba(0,0,0,0.05)',
          backgroundColor: '#fff',
        }}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleUpgrade}
          disabled={isUpgrading || selectedPlan === 'free'}
          sx={{
            py: 1.75,
            borderRadius: '14px',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            background: selectedPlan === 'business' 
              ? 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)'
              : '#e2e8f0',
            boxShadow: selectedPlan === 'business' 
              ? '0 4px 20px rgba(108,92,231,0.4)'
              : 'none',
            color: selectedPlan === 'business' ? '#fff' : '#94a3b8',
          }}
        >
          {isUpgrading ? (
            <CircularProgress size={24} color="inherit" />
          ) : selectedPlan === 'business' ? (
            'Upgrade to Business'
          ) : (
            'Select Business plan'
          )}
        </Button>
        {selectedPlan === 'free' && (
          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', mt: 1, color: '#64748b' }}
          >
            You're already on the Free plan
          </Typography>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ borderRadius: '12px' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusinessUpgradeScreen;
