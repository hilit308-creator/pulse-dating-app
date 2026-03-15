/**
 * ReportDialog.jsx
 * Global report dialog component used across the entire app
 * Includes automatic reason options and optional note
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { Flag, AlertTriangle, UserX, Camera, MessageSquare, Shield } from 'lucide-react';

// Report reason options
const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Inappropriate content', icon: AlertTriangle },
  { id: 'fake', label: 'Fake profile', icon: UserX },
  { id: 'photos', label: 'Inappropriate photos', icon: Camera },
  { id: 'harassment', label: 'Harassment', icon: MessageSquare },
  { id: 'spam', label: 'Spam or scam', icon: Shield },
  { id: 'other', label: 'Other', icon: Flag },
];

const ReportDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  userName = 'this user',
  title = 'Report user',
}) => {
  const [selectedReason, setSelectedReason] = useState(null);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onSubmit?.({
      reason: selectedReason,
      note: note.trim(),
      timestamp: new Date().toISOString(),
    });
    // Reset state
    setSelectedReason(null);
    setNote('');
    onClose?.();
  };

  const handleClose = () => {
    setSelectedReason(null);
    setNote('');
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: '20px',
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Flag size={20} color="#ef4444" />
        {title}
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
          Why are you reporting {userName}? Select a reason below.
        </Typography>

        {/* Reason chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {REPORT_REASONS.map((reason) => {
            const Icon = reason.icon;
            const isSelected = selectedReason === reason.id;
            
            return (
              <Chip
                key={reason.id}
                icon={<Icon size={16} />}
                label={reason.label}
                onClick={() => setSelectedReason(reason.id)}
                sx={{
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: 13,
                  py: 2,
                  bgcolor: isSelected ? 'rgba(239, 68, 68, 0.1)' : '#f8fafc',
                  color: isSelected ? '#ef4444' : '#64748b',
                  border: isSelected ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  '&:hover': {
                    bgcolor: isSelected ? 'rgba(239, 68, 68, 0.15)' : '#f1f5f9',
                  },
                  '& .MuiChip-icon': {
                    color: isSelected ? '#ef4444' : '#94a3b8',
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Optional note */}
        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
          Add more details (optional)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Write a note (optional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&.Mui-focused fieldset': {
                borderColor: '#6C5CE7',
              },
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            color: '#64748b',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedReason}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#ef4444',
            '&:hover': { bgcolor: '#dc2626' },
            '&:disabled': { bgcolor: '#fecaca', color: '#fff' },
          }}
        >
          Submit Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
