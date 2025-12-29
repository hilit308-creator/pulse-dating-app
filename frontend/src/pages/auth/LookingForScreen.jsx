import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Target, Heart, Users, Coffee, Sparkles, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OnboardingHeader from '../../components/OnboardingHeader';

const RELATIONSHIP_GOALS = [
  {
    id: 'long_term',
    title: 'Long-term relationship',
    description: 'Looking for something serious',
    icon: Heart,
    color: '#F43F5E',
    bgColor: 'rgba(244,63,94,0.1)',
  },
  {
    id: 'short_term',
    title: 'Short-term, open to long',
    description: 'See where things go',
    icon: Sparkles,
    color: '#a855f7',
    bgColor: 'rgba(168,85,247,0.1)',
  },
  {
    id: 'casual',
    title: 'Something casual',
    description: 'Fun without pressure',
    icon: Coffee,
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.1)',
  },
  {
    id: 'friends',
    title: 'New friends',
    description: 'Expand my social circle',
    icon: Users,
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.1)',
  },
  {
    id: 'not_sure',
    title: 'Not sure yet',
    description: 'Still figuring it out',
    icon: HelpCircle,
    color: '#64748b',
    bgColor: 'rgba(100,116,139,0.1)',
  },
];

const LookingForScreen = () => {
  const navigate = useNavigate();
  const { updateUser, user, updateOnboardingStep, saveOnboardingData } = useAuth();
  
  const [selected, setSelected] = useState(user?.lookingFor || null);

  useEffect(() => {
    updateOnboardingStep('looking-for');
  }, [updateOnboardingStep]);

  const handleSelect = (id) => {
    setSelected(id);
  };

  const handleContinue = () => {
    saveOnboardingData({ lookingFor: selected });
    updateUser({ lookingFor: selected });
    updateOnboardingStep('details');
    navigate('/auth/details');
  };

  const handleSkip = () => {
    updateOnboardingStep('details');
    navigate('/auth/details');
  };

  const handleBack = () => {
    navigate('/auth/interests');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header with Progress */}
      <OnboardingHeader
        currentStep="looking-for"
        onBack={handleBack}
        onSkip={handleSkip}
        showSkip={true}
      />

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 3,
          pt: 3,
          pb: 2,
          overflowY: 'auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              backgroundColor: 'rgba(108,92,231,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Target size={28} color="#6C5CE7" />
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1a1a2e',
              mb: 1,
            }}
          >
            What are you looking for?
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            This helps us match you with people who want the same things
          </Typography>

          {/* Options */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {RELATIONSHIP_GOALS.map((goal, index) => {
              const Icon = goal.icon;
              const isSelected = selected === goal.id;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Box
                    onClick={() => handleSelect(goal.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: isSelected ? goal.color : '#e2e8f0',
                      backgroundColor: isSelected ? goal.bgColor : '#ffffff',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: goal.color,
                        backgroundColor: goal.bgColor,
                      },
                    }}
                  >
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        backgroundColor: isSelected ? goal.color : goal.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon size={24} color={isSelected ? 'white' : goal.color} />
                    </Box>
                    
                    {/* Text */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: '#1a1a2e',
                          mb: 0.25,
                        }}
                      >
                        {goal.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748b',
                          fontSize: '0.8rem',
                        }}
                      >
                        {goal.description}
                      </Typography>
                    </Box>
                    
                    {/* Selection indicator */}
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: isSelected ? goal.color : '#e2e8f0',
                        backgroundColor: isSelected ? goal.color : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: 'white',
                            }}
                          />
                        </motion.div>
                      )}
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
          </Box>
        </motion.div>

        {/* Spacer */}
        <Box sx={{ flex: 1, minHeight: 20 }} />

        {/* Continue button */}
        <Box sx={{ pb: 2, pt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleContinue}
            disabled={!selected}
            sx={{
              py: 1.75,
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              boxShadow: '0 4px 20px rgba(108,92,231,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
              },
              '&:disabled': {
                background: '#e2e8f0',
                color: '#94a3b8',
              },
            }}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LookingForScreen;
