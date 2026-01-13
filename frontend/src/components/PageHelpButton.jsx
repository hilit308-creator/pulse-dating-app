import React, { useState } from 'react';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { HelpCircle } from 'lucide-react';

/**
 * PageHelpButton - A reusable help button component that displays page-specific guides
 * Designed to be placed in the top bar alongside other icon buttons (profile, settings)
 * @param {Object} props
 * @param {string} props.title - Dialog title (e.g., "How Nearby Works")
 * @param {Array} props.steps - Array of step objects with { emoji, title, description }
 * @param {Object} props.buttonSx - Optional custom styles for the button
 */
export default function PageHelpButton({ 
  title = "How This Works", 
  steps = [], 
  buttonSx = {}
}) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* Help Button - Simple Icon Style */}
      <IconButton
        onClick={() => setShowHelp(true)}
        sx={{
          color: '#1a1a2e',
          ...buttonSx,
        }}
        aria-label="Help Guide"
      >
        <HelpCircle size={24} />
      </IconButton>

      {/* Help Dialog */}
      <Dialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            maxWidth: 360,
            width: '100%',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, textAlign: 'center' }}>
          {title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            {steps.map((step, index) => (
              <Box key={index} sx={{ mb: index === steps.length - 1 ? 2 : 3 }}>
                {step.emoji && (
                  <Typography sx={{ fontSize: 32, mb: 1 }}>
                    {step.emoji}
                  </Typography>
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {step.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowHelp(false)}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
