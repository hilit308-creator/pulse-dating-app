// src/components/MatchModal.jsx
import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Avatar, Typography } from '@mui/material';
import { fireConfetti } from '../utils/match';
import { resolvePrimaryPhoto } from '../utils/photoUtils';

export default function MatchModal({ open, onClose, me, other, onStartChat }) {
  useEffect(() => { if (open) fireConfetti(); }, [open]);
  if (!other) return null;
  
  // Use shared photo resolution to ensure no broken images
  const mePhoto = resolvePrimaryPhoto(me);
  const otherPhoto = resolvePrimaryPhoto(other);
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>It's a Match!</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ my: 1 }}>
          <Avatar src={mePhoto} sx={{ width: 64, height: 64 }} />
          <Avatar src={otherPhoto} sx={{ width: 64, height: 64 }} />
        </Stack>
        <Typography align="center">You and {other?.name || other?.firstName} like each other</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Keep browsing</Button>
        <Button variant="contained" onClick={onStartChat}>Say hi</Button>
      </DialogActions>
    </Dialog>
  );
}
