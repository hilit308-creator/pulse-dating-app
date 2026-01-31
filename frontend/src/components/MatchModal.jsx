// src/components/MatchModal.jsx
import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Avatar, Typography } from '@mui/material';
import { fireConfetti } from '../utils/match';
import { resolvePrimaryPhoto } from '../utils/photoUtils';

export default function MatchModal({ open, onClose, me, other, onStartChat }) {
  // FALLBACK: If this legacy component is triggered, dispatch global popup and render nothing.
  useEffect(() => {
    if (!open || !other) return;
    try {
      window.dispatchEvent(
        new CustomEvent('pulse:show_match', {
          detail: {
            match: {
              id: other.id,
              name: other.name || other.firstName,
              firstName: other.firstName || other.name,
              photo: resolvePrimaryPhoto(other),
              photos: other.photos,
            },
            copy: {
              title: "It's a Match",
              subtitle: "You're in sync",
              description: 'Something real can happen now',
              matchedLine: `You and ${other.name || other.firstName} matched!`,
              primaryCta: 'Say hi',
              secondaryCta: 'Keep browsing',
            },
            onLater: onClose,
          },
        })
      );
    } catch {
      // ignore
    }
    // Close this legacy modal immediately so it doesn't render
    if (onClose) onClose();
  }, [open, other, onClose]);

  // Never render the old UI - global popup handles display
  return null;
}
