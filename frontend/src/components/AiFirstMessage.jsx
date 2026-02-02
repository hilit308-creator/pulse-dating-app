/**
 * AiFirstMessage - Automatic AI Message (First Message Only)
 * 
 * Per Spec Section 9:
 * Sender: Pulse AI (appears as a system participant)
 * Tone: warm, human, encouraging
 * 
 * Example:
 * "Hey 👋
 * Nice one – you've got a Pulse!
 * We noticed you connect around:
 * • Music
 * • Travel
 * • Sunset Yoga
 * Want help writing your first message? I've got you 😊"
 * 
 * AI Action Buttons:
 * - 💜 Flirty
 * - 😄 Playful
 * - 😌 Chill
 * 
 * Behavior:
 * - Tap inserts text into input field
 * - NEVER auto-send
 */

import React, { useState } from 'react';
import { Box, Typography, Button, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Smile, Coffee } from 'lucide-react';

// AI Message styles
const AI_AVATAR_GRADIENT = 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)';

// Tone button configurations
const TONE_BUTTONS = [
  { id: 'flirty', label: 'Flirty', emoji: '💜', icon: Heart },
  { id: 'playful', label: 'Playful', emoji: '😄', icon: Smile },
  { id: 'chill', label: 'Chill', emoji: '😌', icon: Coffee },
];

/**
 * Generate AI first message based on shared interests
 * @param {string} matchName - Name of the match
 * @param {string[]} sharedInterests - Array of shared interests
 * @returns {string} Formatted message
 */
export function generateAiFirstMessage(matchName, sharedInterests = []) {
  const interestsList = sharedInterests.length > 0
    ? sharedInterests.slice(0, 3).map(i => `• ${i}`).join('\n')
    : '• Getting to know each other';

  return `Hey 👋\nNice one – you've got a Pulse!\n\nWe noticed you connect around:\n${interestsList}\n\nWant help writing your first message? I've got you 😊`;
}

/**
 * Generate suggestion based on tone
 * @param {string} tone - 'flirty' | 'playful' | 'chill'
 * @param {string} matchName - Name of the match
 * @param {string[]} interests - Shared interests
 * @returns {string} Suggested message
 */
export function generateToneSuggestion(tone, matchName, interests = []) {
  const topic = interests[0] || 'your vibe';
  
  const suggestions = {
    flirty: [
      `Hey ${matchName} 💜 Something tells me we'd have great conversations...`,
      `I have a feeling you're trouble in the best way 😏`,
      `So ${matchName}, what's the story behind that smile?`,
    ],
    playful: [
      `Okay ${matchName}, important question: coffee or tea? ☕️`,
      `Plot twist: we both love ${topic}. Coincidence? I think not 😄`,
      `Hey! Quick debate: is a hot dog a sandwich? 🌭`,
    ],
    chill: [
      `Hey ${matchName}, how's your day going? 😊`,
      `Love that we both vibe with ${topic}. Tell me more!`,
      `Hey! Just wanted to say hi and see what you're up to`,
    ],
  };

  const toneOptions = suggestions[tone] || suggestions.chill;
  return toneOptions[Math.floor(Math.random() * toneOptions.length)];
}

/**
 * AiFirstMessage Component
 * 
 * @param {Object} props
 * @param {string} props.matchName - Name of the matched person
 * @param {string[]} props.sharedInterests - Array of shared interests
 * @param {function} props.onToneSelect - Called when user selects a tone (receives suggestion text)
 * @param {boolean} props.showButtons - Whether to show tone buttons (default true)
 */
export default function AiFirstMessage({
  matchName = 'there',
  sharedInterests = [],
  onToneSelect,
  showButtons = true,
}) {
  const [selectedTone, setSelectedTone] = useState(null);

  const messageText = generateAiFirstMessage(matchName, sharedInterests);

  const handleToneClick = (tone) => {
    setSelectedTone(tone);
    const suggestion = generateToneSuggestion(tone, matchName, sharedInterests);
    onToneSelect?.(suggestion, tone);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Date pill */}
      <Box sx={{ mb: 1.5, textAlign: "center" }}>
        <Chip
          size="small"
          label={new Date().toLocaleDateString()}
          sx={{
            bgcolor: "rgba(108, 92, 231, 0.14) !important",
            color: "#4B3DB6 !important",
            fontWeight: 700,
            border: "1px solid rgba(108, 92, 231, 0.18) !important",
            '& .MuiChip-label': { color: '#4B3DB6 !important' },
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          mb: 2,
          px: 2,
        }}
      >
        {/* AI Avatar */}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            background: AI_AVATAR_GRADIENT,
            flexShrink: 0,
          }}
        >
          <Sparkles size={18} color="white" />
        </Avatar>

        {/* Message Bubble */}
        <Box sx={{ flex: 1, maxWidth: '85%' }}>
          {/* Sender name */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: '#6C5CE7',
              display: 'block',
              mb: 0.5,
            }}
          >
            Pulse AI
          </Typography>

          {/* Message content */}
          <Box
            sx={{
              backgroundColor: '#F0EDFF',
              borderRadius: '16px',
              borderTopLeftRadius: '4px',
              p: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#1a1a2e',
                whiteSpace: 'pre-line',
                lineHeight: 1.5,
              }}
            >
              {messageText}
            </Typography>

            {/* Tone Buttons */}
            {showButtons && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  mt: 2,
                  flexWrap: 'wrap',
                }}
              >
                {TONE_BUTTONS.map((tone) => (
                  <Button
                    key={tone.id}
                    variant={selectedTone === tone.id ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleToneClick(tone.id)}
                    sx={{
                      borderRadius: '20px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '13px',
                      px: 2,
                      py: 0.75,
                      minWidth: 'auto',
                      ...(selectedTone === tone.id
                        ? {
                            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                            color: '#fff',
                            border: 'none',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                            },
                          }
                        : {
                            borderColor: '#6C5CE7',
                            color: '#6C5CE7',
                            backgroundColor: 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(108,92,231,0.08)',
                              borderColor: '#5b4cdb',
                            },
                          }),
                    }}
                  >
                    {tone.emoji} {tone.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

/**
 * AiSuggestionSheet - "Say something real" sheet with suggestions
 * Per Spec Section 9
 */
export function AiSuggestionSheet({
  suggestions = [],
  onSelect,
  onRefresh,
  refreshCount = 0,
  maxRefresh = 3,
  tone = 'playful',
  onToneChange,
}) {
  const tones = ['Playful', 'Confident', 'Calm'];

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: '16px 16px 0 0',
        p: 2,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      }}
    >
      {/* Title */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          color: '#1a1a2e',
          mb: 2,
          textAlign: 'center',
        }}
      >
        Say something real
      </Typography>

      {/* Suggestions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outlined"
            fullWidth
            onClick={() => onSelect?.(suggestion)}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              textTransform: 'none',
              borderRadius: '12px',
              borderColor: '#E5E7EB',
              color: '#1a1a2e',
              py: 1.5,
              px: 2,
              '&:hover': {
                borderColor: '#6C5CE7',
                backgroundColor: 'rgba(108,92,231,0.05)',
              },
            }}
          >
            {suggestion}
          </Button>
        ))}
      </Box>

      {/* Refresh button */}
      {refreshCount < maxRefresh && (
        <Button
          variant="text"
          fullWidth
          onClick={onRefresh}
          sx={{
            color: '#6C5CE7',
            textTransform: 'none',
            fontWeight: 600,
            mb: 2,
          }}
        >
          🔄 Show me more ({maxRefresh - refreshCount} left)
        </Button>
      )}

      {/* Tone toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        {tones.map((t) => (
          <Button
            key={t}
            size="small"
            variant={tone.toLowerCase() === t.toLowerCase() ? 'contained' : 'text'}
            onClick={() => onToneChange?.(t.toLowerCase())}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              fontSize: '12px',
              px: 2,
              ...(tone.toLowerCase() === t.toLowerCase()
                ? {
                    backgroundColor: '#6C5CE7',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#5b4cdb' },
                  }
                : {
                    color: '#64748b',
                  }),
            }}
          >
            {t}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
