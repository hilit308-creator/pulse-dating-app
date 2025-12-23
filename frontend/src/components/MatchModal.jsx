// src/components/MatchModal.jsx
import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Avatar, Typography } from '@mui/material';
import { fireConfetti } from '../utils/match';

export default function MatchModal({ open, onClose, me, other, onStartChat }) {
  useEffect(() => { if (open) fireConfetti(); }, [open]);
  if (!other) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>It's a match!</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ my: 1 }}>
          <Avatar src={me?.photoUrl} sx={{ width: 64, height: 64 }} />
          <Avatar src={other?.photoUrl} sx={{ width: 64, height: 64 }} />
        </Stack>
        <Typography align="center">You and {other?.name} like each other</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Keep browsing</Button>
        <Button variant="contained" onClick={onStartChat}>Say hi</Button>
      </DialogActions>
    </Dialog>
  );
}
