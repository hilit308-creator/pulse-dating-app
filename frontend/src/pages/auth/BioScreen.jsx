import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import { FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OnboardingHeader from '../../components/OnboardingHeader';

const MAX_BIO_LENGTH = 500;

const BIO_PROMPTS = [
  "I'm looking for someone who...",
  "My perfect Sunday includes...",
  "Two truths and a lie about me...",
  "The way to my heart is...",
  "I geek out on...",
  "My friends would describe me as...",
];

const BioScreen = () => {
  const navigate = useNavigate();
  const { updateUser, user, updateOnboardingStep, saveOnboardingData } = useAuth();
  
  const [bio, setBio] = useState(user?.bio || '');

  useEffect(() => {
    updateOnboardingStep('bio');
  }, [updateOnboardingStep]);

  const handleBioChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_BIO_LENGTH) {
      setBio(value);
    }
  };

  const handlePromptClick = (prompt) => {
    if (bio.length + prompt.length + 2 <= MAX_BIO_LENGTH) {
      setBio(prev => prev ? `${prev}\n\n${prompt}` : prompt);
    }
  };

  const handleContinue = () => {
    saveOnboardingData({ bio: bio.trim() });
    updateUser({ bio: bio.trim() });
    updateOnboardingStep('interests');
    navigate('/auth/interests');
  };

  const handleSkip = () => {
    updateOnboardingStep('interests');
    navigate('/auth/interests');
  };

  const handleBack = () => {
    navigate('/auth/photos');
  };

  const charCount = bio.length;
  const charPercentage = (charCount / MAX_BIO_LENGTH) * 100;

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
        currentStep="bio"
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
              backgroundColor: 'rgba(34,197,94,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <FileText size={28} color="#22c55e" />
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
            Write your bio
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 3,
            }}
          >
            Tell others what makes you unique. A good bio increases your matches by 30%!
          </Typography>

          {/* Bio Input */}
          <Box sx={{ position: 'relative', mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={bio}
              onChange={handleBioChange}
              placeholder="Write something interesting about yourself..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: '#f8fafc',
                  '& fieldset': {
                    borderColor: 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6C5CE7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6C5CE7',
                  },
                },
              }}
            />
            
            {/* Character count */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `conic-gradient(${charPercentage > 90 ? '#ef4444' : '#6C5CE7'} ${charPercentage}%, #e2e8f0 0%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: charPercentage > 90 ? '#ef4444' : '#94a3b8',
                  fontWeight: 500,
                }}
              >
                {charCount}/{MAX_BIO_LENGTH}
              </Typography>
            </Box>
          </Box>

          {/* Prompt suggestions */}
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
              <Sparkles size={16} color="#6C5CE7" />
              Need inspiration?
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {BIO_PROMPTS.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  onClick={() => handlePromptClick(prompt)}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    '&:hover': {
                      borderColor: '#6C5CE7',
                      backgroundColor: 'rgba(108,92,231,0.05)',
                    },
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* Spacer */}
        <Box sx={{ flex: 1, minHeight: 20 }} />

        {/* Continue button */}
        <Box sx={{ pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleContinue}
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
            }}
          >
            {bio.trim() ? 'Continue' : 'Skip for now'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BioScreen;
