/**
 * ReportDialog.jsx
 * Global report dialog component used across the entire app
 * Includes automatic reason options, optional note, and image upload
 */

import React, { useState, useRef } from 'react';
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
  IconButton,
} from '@mui/material';
import { Flag, AlertTriangle, UserX, Camera, MessageSquare, Shield, ImagePlus, X } from 'lucide-react';

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
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Limit to 3 images
    const remainingSlots = 3 - uploadedImages.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file: file,
          preview: event.target.result,
          name: file.name,
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = () => {
    onSubmit?.({
      reason: selectedReason,
      note: note.trim(),
      images: uploadedImages.map(img => img.file),
      timestamp: new Date().toISOString(),
    });
    // Reset state
    setSelectedReason(null);
    setNote('');
    setUploadedImages([]);
    onClose?.();
  };

  const handleClose = () => {
    setSelectedReason(null);
    setNote('');
    setUploadedImages([]);
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

        {/* Image upload section */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
            Add screenshot (optional)
          </Typography>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          
          {/* Upload button and preview */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {/* Uploaded images preview */}
            {uploadedImages.map((img) => (
              <Box
                key={img.id}
                sx={{
                  position: 'relative',
                  width: 70,
                  height: 70,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                }}
              >
                <img
                  src={img.preview}
                  alt="Upload preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(img.id)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    p: 0.25,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <X size={14} />
                </IconButton>
              </Box>
            ))}
            
            {/* Add image button (show if less than 3 images) */}
            {uploadedImages.length < 3 && (
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '10px',
                  border: '2px dashed #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#6C5CE7',
                    bgcolor: 'rgba(108,92,231,0.05)',
                  },
                }}
              >
                <ImagePlus size={20} color="#94a3b8" />
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem', mt: 0.5 }}>
                  Add
                </Typography>
              </Box>
            )}
          </Box>
          
          {uploadedImages.length > 0 && (
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1 }}>
              {uploadedImages.length}/3 images added
            </Typography>
          )}
        </Box>
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
