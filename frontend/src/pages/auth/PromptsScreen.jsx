import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Plus, X, Edit2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OnboardingHeader from '../../components/OnboardingHeader';

const MAX_PROMPTS = 3;
const MAX_ANSWER_LENGTH = 250;

const PROMPT_OPTIONS = [
  // Personality
  "I'm known for...",
  "My simple pleasures are...",
  "I go crazy for...",
  "My most irrational fear is...",
  "I'm weirdly attracted to...",
  "The way to win me over is...",
  
  // Lifestyle
  "A typical Sunday for me...",
  "My ideal weekend includes...",
  "I'm looking for someone who...",
  "Together, we could...",
  "I want someone who...",
  
  // Fun facts
  "Two truths and a lie...",
  "Believe it or not, I...",
  "My most controversial opinion is...",
  "The key to my heart is...",
  "I bet you can't...",
  
  // Conversation starters
  "Let's debate this topic...",
  "Change my mind about...",
  "We'll get along if...",
  "Don't hate me if I...",
  "I'll fall for you if...",
];

const PromptsScreen = () => {
  const navigate = useNavigate();
  const { updateUser, user, updateOnboardingStep, saveOnboardingData } = useAuth();
  
  const [prompts, setPrompts] = useState(user?.prompts || []);

  useEffect(() => {
    updateOnboardingStep('prompts');
  }, [updateOnboardingStep]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [answer, setAnswer] = useState('');

  const handleAddPrompt = () => {
    setEditingIndex(null);
    setSelectedPrompt('');
    setAnswer('');
    setIsDialogOpen(true);
  };

  const handleEditPrompt = (index) => {
    setEditingIndex(index);
    setSelectedPrompt(prompts[index].prompt);
    setAnswer(prompts[index].answer);
    setIsDialogOpen(true);
  };

  const handleRemovePrompt = (index) => {
    setPrompts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSavePrompt = () => {
    if (!selectedPrompt || !answer.trim()) return;
    
    const newPrompt = { prompt: selectedPrompt, answer: answer.trim() };
    
    if (editingIndex !== null) {
      setPrompts(prev => prev.map((p, i) => i === editingIndex ? newPrompt : p));
    } else {
      setPrompts(prev => [...prev, newPrompt]);
    }
    
    setIsDialogOpen(false);
  };

  const handleContinue = () => {
    saveOnboardingData({ prompts });
    updateUser({ prompts });
    updateOnboardingStep('verify-photo');
    navigate('/auth/verify-photo');
  };

  const handleSkip = () => {
    updateOnboardingStep('verify-photo');
    navigate('/auth/verify-photo');
  };

  const handleBack = () => {
    navigate('/auth/details');
  };

  const availablePrompts = PROMPT_OPTIONS.filter(
    p => !prompts.some(existing => existing.prompt === p) || p === selectedPrompt
  );

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
        currentStep="prompts"
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
              backgroundColor: 'rgba(251,146,60,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <MessageCircle size={28} color="#fb923c" />
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
            Add conversation starters
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4,
            }}
          >
            Prompts help break the ice and show your personality. Add up to {MAX_PROMPTS}.
          </Typography>

          {/* Existing Prompts */}
          <Box sx={{ mb: 3 }}>
            <AnimatePresence>
              {prompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '16px',
                      p: 2,
                      mb: 2,
                      position: 'relative',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: '#6C5CE7',
                        mb: 1,
                      }}
                    >
                      {prompt.prompt}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#1a1a2e',
                        lineHeight: 1.6,
                      }}
                    >
                      {prompt.answer}
                    </Typography>
                    
                    {/* Actions */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 0.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleEditPrompt(index)}
                        sx={{
                          backgroundColor: 'white',
                          '&:hover': { backgroundColor: '#e2e8f0' },
                        }}
                      >
                        <Edit2 size={14} color="#64748b" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRemovePrompt(index)}
                        sx={{
                          backgroundColor: 'white',
                          '&:hover': { backgroundColor: '#fee2e2' },
                        }}
                      >
                        <X size={14} color="#ef4444" />
                      </IconButton>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>

          {/* Add Prompt Button */}
          {prompts.length < MAX_PROMPTS && (
            <Button
              fullWidth
              variant="outlined"
              onClick={handleAddPrompt}
              startIcon={<Plus size={18} />}
              sx={{
                py: 2,
                borderRadius: '16px',
                borderStyle: 'dashed',
                borderColor: '#e2e8f0',
                color: '#64748b',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#6C5CE7',
                  backgroundColor: 'rgba(108,92,231,0.05)',
                },
              }}
            >
              Add a prompt ({prompts.length}/{MAX_PROMPTS})
            </Button>
          )}
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
            {prompts.length > 0 ? 'Continue' : 'Skip for now'}
          </Button>
        </Box>
      </Box>

      {/* Add/Edit Prompt Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            m: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingIndex !== null ? 'Edit prompt' : 'Choose a prompt'}
        </DialogTitle>
        
        <DialogContent>
          {/* Prompt Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#1a1a2e' }}>
              Select a prompt
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
              {availablePrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant={selectedPrompt === prompt ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSelectedPrompt(prompt)}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    ...(selectedPrompt === prompt
                      ? {
                          backgroundColor: '#6C5CE7',
                          '&:hover': { backgroundColor: '#5b4cdb' },
                        }
                      : {
                          borderColor: '#e2e8f0',
                          color: '#64748b',
                        }),
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Answer Input */}
          {selectedPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a1a2e' }}>
                Your answer
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={answer}
                onChange={(e) => e.target.value.length <= MAX_ANSWER_LENGTH && setAnswer(e.target.value)}
                placeholder="Write your answer..."
                helperText={`${answer.length}/${MAX_ANSWER_LENGTH}`}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </motion.div>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setIsDialogOpen(false)}
            sx={{ color: '#64748b', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePrompt}
            disabled={!selectedPrompt || !answer.trim()}
            startIcon={<Check size={18} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromptsScreen;
