// src/components/ProximityAlert.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function ProximityAlert({ open, onClose, onOpenChat, name }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Your match is nearby!</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 1 }}>Want to say hi{name ? ` to ${name}` : ''}?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Maybe later</Button>
        <Button variant="contained" onClick={onOpenChat}>Open chat</Button>
      </DialogActions>
    </Dialog>
  );
}
