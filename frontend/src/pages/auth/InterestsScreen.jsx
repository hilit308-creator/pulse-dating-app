import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Heart, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OnboardingHeader from '../../components/OnboardingHeader';

const MIN_INTERESTS = 3;
const MAX_INTERESTS = 10;

const INTEREST_CATEGORIES = [
  {
    name: 'Music & Entertainment',
    emoji: '🎵',
    interests: ['Live Music', 'Concerts', 'Karaoke', 'Podcasts', 'Stand-up Comedy', 'Theater', 'Movies', 'Netflix', 'K-Pop', 'Hip Hop', 'Rock', 'Jazz'],
  },
  {
    name: 'Sports & Fitness',
    emoji: '⚽',
    interests: ['Gym', 'Running', 'Yoga', 'Swimming', 'Football', 'Basketball', 'Tennis', 'Hiking', 'Cycling', 'CrossFit', 'Martial Arts', 'Dancing'],
  },
  {
    name: 'Food & Drinks',
    emoji: '🍕',
    interests: ['Cooking', 'Foodie', 'Wine', 'Coffee', 'Brunch', 'Vegan', 'Sushi', 'BBQ', 'Baking', 'Craft Beer', 'Cocktails', 'Street Food'],
  },
  {
    name: 'Travel & Adventure',
    emoji: '✈️',
    interests: ['Travel', 'Backpacking', 'Road Trips', 'Beach', 'Mountains', 'Camping', 'City Breaks', 'Adventure Sports', 'Scuba Diving', 'Skiing'],
  },
  {
    name: 'Arts & Culture',
    emoji: '🎨',
    interests: ['Art', 'Photography', 'Museums', 'Reading', 'Writing', 'Poetry', 'Design', 'Fashion', 'Architecture', 'History'],
  },
  {
    name: 'Lifestyle',
    emoji: '🌱',
    interests: ['Meditation', 'Spirituality', 'Volunteering', 'Sustainability', 'Pets', 'Dogs', 'Cats', 'Plants', 'Self-care', 'Astrology'],
  },
  {
    name: 'Tech & Gaming',
    emoji: '🎮',
    interests: ['Gaming', 'Tech', 'Startups', 'Crypto', 'AI', 'Board Games', 'Anime', 'Esports', 'VR', 'Coding'],
  },
  {
    name: 'Social',
    emoji: '🎉',
    interests: ['Parties', 'Nightlife', 'Festivals', 'Networking', 'Trivia', 'Wine Tasting', 'Book Club', 'Language Exchange'],
  },
];

const InterestsScreen = () => {
  const navigate = useNavigate();
  const { updateUser, user, updateOnboardingStep, saveOnboardingData } = useAuth();
  
  const [selectedInterests, setSelectedInterests] = useState(user?.interests || []);

  useEffect(() => {
    updateOnboardingStep('interests');
  }, [updateOnboardingStep]);

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      }
      if (prev.length >= MAX_INTERESTS) {
        return prev;
      }
      return [...prev, interest];
    });
  };

  const handleContinue = () => {
    saveOnboardingData({ interests: selectedInterests });
    updateUser({ interests: selectedInterests });
    updateOnboardingStep('looking-for');
    navigate('/auth/looking-for');
  };

  const handleSkip = () => {
    updateOnboardingStep('looking-for');
    navigate('/auth/looking-for');
  };

  const handleBack = () => {
    navigate('/auth/bio');
  };

  const canContinue = selectedInterests.length >= MIN_INTERESTS;

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
        currentStep="interests"
        onBack={handleBack}
        showSkip={false}
      />

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ px: 3, pt: 3 }}>
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
                backgroundColor: 'rgba(244,63,94,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Heart size={28} color="#F43F5E" />
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
              What are you into?
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mb: 3,
              }}
            >
              Pick at least {MIN_INTERESTS} interests to help us find better matches for you
            </Typography>
          </motion.div>
        </Box>

        {/* Interest Categories */}
        <Box sx={{ px: 3, pb: 3 }}>
          {INTEREST_CATEGORIES.map((category, catIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: catIndex * 0.05 }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a2e',
                    mb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <span>{category.emoji}</span>
                  {category.name}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {category.interests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    const isDisabled = !isSelected && selectedInterests.length >= MAX_INTERESTS;
                    
                    return (
                      <Chip
                        key={interest}
                        label={interest}
                        onClick={() => !isDisabled && toggleInterest(interest)}
                        icon={isSelected ? <Check size={14} /> : undefined}
                        sx={{
                          borderRadius: '20px',
                          fontWeight: 500,
                          fontSize: '0.8rem',
                          transition: 'all 0.2s ease',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isDisabled ? 0.5 : 1,
                          ...(isSelected
                            ? {
                                backgroundColor: '#6C5CE7',
                                color: 'white',
                                '& .MuiChip-icon': {
                                  color: 'white',
                                },
                                '&:hover': {
                                  backgroundColor: '#5b4cdb',
                                },
                              }
                            : {
                                backgroundColor: '#f8fafc',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                '&:hover': {
                                  backgroundColor: 'rgba(108,92,231,0.1)',
                                  borderColor: '#6C5CE7',
                                },
                              }),
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1, minHeight: 20 }} />

        {/* Continue button */}
        <Box sx={{ px: 3, pb: 2, pt: 2, backgroundColor: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleContinue}
            disabled={!canContinue}
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
            Continue ({selectedInterests.length}/{MIN_INTERESTS} selected)
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default InterestsScreen;
