import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack, Link, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { Heart, Building2, Ticket, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = () => {
    navigate('/auth/login');
  };

  const handleSignUp = () => {
    navigate('/auth/phone');
  };

  const handleBusinessOwners = () => {
    navigate('/auth/business-login');
  };

  const handleBuyTickets = () => {
    navigate('/my-events');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9ff 50%, #f0f4ff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,92,231,0.1) 0%, transparent 70%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 3,
          py: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            {/* Logo icon */}
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: '28px',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 12px 40px rgba(108,92,231,0.35)',
              }}
            >
              <Heart size={44} color="white" fill="white" />
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: '#1a1a2e',
                mb: 1.5,
                letterSpacing: '-0.5px',
              }}
            >
              Pulse
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: '#64748b',
                fontWeight: 500,
                maxWidth: 280,
                mx: 'auto',
                lineHeight: 1.4,
              }}
            >
              Real connections. Right where you are.
            </Typography>
          </Box>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ width: '100%', maxWidth: 340 }}
        >
          <Stack spacing={2}>
            {/* Log In */}
            <CTAButton
              variant="contained"
              icon={<LogIn size={20} />}
              label="Log In"
              microcopy="Already have an account? Log in here"
              onClick={handleLogin}
              primary
            />

            {/* Sign Up */}
            <CTAButton
              variant="outlined"
              icon={<UserPlus size={20} />}
              label="Sign Up"
              microcopy="New to Pulse? Create your account"
              onClick={handleSignUp}
            />

            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                or
              </Typography>
            </Divider>

            {/* Business Owners */}
            <CTAButton
              variant="text"
              icon={<Building2 size={20} />}
              label="Business Owners"
              microcopy="Manage your business presence on Pulse"
              onClick={handleBusinessOwners}
              secondary
            />

            {/* Buy Tickets */}
            <CTAButton
              variant="text"
              icon={<Ticket size={20} />}
              label="Buy Tickets"
              microcopy="Purchase event tickets directly through Pulse"
              onClick={handleBuyTickets}
              secondary
            />
          </Stack>
        </motion.div>
      </Box>

      {/* Footer with terms */}
      <Box
        sx={{
          px: 3,
          pb: 4,
          pt: 2,
          textAlign: 'center',
        }}
      >
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 1.5 }}>
          <Link
            href="/terms"
            sx={{
              color: '#6C5CE7',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Terms of Service
          </Link>
          <Typography sx={{ color: '#cbd5e1' }}>•</Typography>
          <Link
            href="/privacy"
            sx={{
              color: '#6C5CE7',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Privacy Policy
          </Link>
        </Stack>
        <Typography
          variant="caption"
          sx={{
            color: '#94a3b8',
            fontSize: '0.75rem',
          }}
        >
          By continuing, you agree to our Terms & Privacy Policy
        </Typography>
      </Box>
    </Box>
  );
};

// CTA Button component with microcopy
const CTAButton = ({ variant, icon, label, microcopy, onClick, primary, secondary }) => {
  if (primary) {
    return (
      <Button
        variant="contained"
        size="large"
        onClick={onClick}
        startIcon={icon}
        sx={{
          py: 1.5,
          borderRadius: '14px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
          boxShadow: '0 4px 20px rgba(108,92,231,0.4)',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          '&:hover': {
            background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
            boxShadow: '0 6px 24px rgba(108,92,231,0.5)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          {label}
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 400 }}>
          {microcopy}
        </Typography>
      </Button>
    );
  }

  if (secondary) {
    return (
      <Button
        variant="text"
        size="large"
        onClick={onClick}
        sx={{
          py: 1.25,
          borderRadius: '12px',
          fontSize: '0.95rem',
          fontWeight: 600,
          textTransform: 'none',
          color: '#64748b',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.25,
          '&:hover': {
            backgroundColor: 'rgba(108,92,231,0.05)',
            color: '#6C5CE7',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          {label}
        </Box>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.7rem' }}>
          {microcopy}
        </Typography>
      </Button>
    );
  }

  return (
    <Button
      variant="outlined"
      size="large"
      onClick={onClick}
      sx={{
        py: 1.5,
        borderRadius: '14px',
        fontSize: '1rem',
        fontWeight: 600,
        textTransform: 'none',
        borderColor: '#6C5CE7',
        borderWidth: 2,
        color: '#6C5CE7',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        '&:hover': {
          borderWidth: 2,
          borderColor: '#5b4cdb',
          backgroundColor: 'rgba(108,92,231,0.05)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        {label}
      </Box>
      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 400 }}>
        {microcopy}
      </Typography>
    </Button>
  );
};

export default WelcomeScreen;
