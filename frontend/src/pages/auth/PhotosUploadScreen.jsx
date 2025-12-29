import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Plus, X, Star, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OnboardingHeader from '../../components/OnboardingHeader';

const MIN_PHOTOS = 2;
const MAX_PHOTOS = 6;

const PhotosUploadScreen = () => {
  const navigate = useNavigate();
  const { updateUser, user, updateOnboardingStep, saveOnboardingData } = useAuth();
  const fileInputRef = useRef(null);
  
  const [photos, setPhotos] = useState(user?.photos || Array(MAX_PHOTOS).fill(null));
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [activeSlot, setActiveSlot] = useState(null);

  const uploadedCount = photos.filter(p => p !== null).length;
  const canContinue = uploadedCount >= MIN_PHOTOS;

  const handleSlotClick = (index) => {
    setActiveSlot(index);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Create local URL for preview
      const imageUrl = URL.createObjectURL(file);
      
      const newPhotos = [...photos];
      newPhotos[activeSlot] = {
        url: imageUrl,
        file: file,
        isMain: activeSlot === 0 || !photos.some(p => p?.isMain),
      };
      
      setPhotos(newPhotos);
    } catch (err) {
      setError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      setActiveSlot(null);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index, e) => {
    e.stopPropagation();
    const newPhotos = [...photos];
    
    // Revoke URL to free memory
    if (newPhotos[index]?.url) {
      URL.revokeObjectURL(newPhotos[index].url);
    }
    
    newPhotos[index] = null;
    
    // If removed main photo, set first available as main
    if (photos[index]?.isMain) {
      const firstPhoto = newPhotos.find(p => p !== null);
      if (firstPhoto) firstPhoto.isMain = true;
    }
    
    setPhotos(newPhotos);
  };

  const handleSetMain = (index, e) => {
    e.stopPropagation();
    const newPhotos = photos.map((p, i) => {
      if (p) return { ...p, isMain: i === index };
      return p;
    });
    setPhotos(newPhotos);
  };

  const handleContinue = () => {
    const validPhotos = photos.filter(p => p !== null);
    saveOnboardingData({ photos: validPhotos });
    updateUser({ photos: validPhotos });
    navigate('/auth/bio');
  };

  const handleBack = () => {
    navigate('/auth/age-confirmation');
  };

  const handleSkip = () => {
    updateOnboardingStep('bio');
    navigate('/auth/bio');
  };

  useEffect(() => {
    updateOnboardingStep('photos');
  }, [updateOnboardingStep]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Header with Progress */}
      <OnboardingHeader
        currentStep="photos"
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
              backgroundColor: 'rgba(244,63,94,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Camera size={28} color="#F43F5E" />
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
            Add your best photos
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 3,
            }}
          >
            Add at least {MIN_PHOTOS} photos to continue. Profiles with more photos get more matches!
          </Typography>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Photo Grid */}
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {photos.map((photo, index) => (
              <Grid item xs={4} key={index}>
                <PhotoSlot
                  photo={photo}
                  index={index}
                  isUploading={isUploading && activeSlot === index}
                  onClick={() => handleSlotClick(index)}
                  onRemove={(e) => handleRemovePhoto(index, e)}
                  onSetMain={(e) => handleSetMain(index, e)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Tips */}
          <Box
            sx={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              p: 2,
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a1a2e' }}>
              📸 Photo tips
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2, color: '#64748b', fontSize: '0.8rem' }}>
              <li>Show your face clearly in your first photo</li>
              <li>Add photos of you doing things you love</li>
              <li>Smile! Profiles with smiles get 14% more likes</li>
              <li>Avoid group photos as your main picture</li>
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
            disabled={!canContinue}
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
              '&:disabled': {
                background: '#e2e8f0',
                color: '#94a3b8',
              },
            }}
          >
            Continue ({uploadedCount}/{MIN_PHOTOS} photos)
          </Button>
          
          {!canContinue && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 1,
                color: '#94a3b8',
              }}
            >
              Add {MIN_PHOTOS - uploadedCount} more photo{MIN_PHOTOS - uploadedCount > 1 ? 's' : ''} to continue
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Photo Slot Component
const PhotoSlot = ({ photo, index, isUploading, onClick, onRemove, onSetMain }) => {
  const isMain = photo?.isMain;
  
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        aspectRatio: '3/4',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: photo ? 'none' : '2px dashed #e2e8f0',
        backgroundColor: photo ? 'transparent' : '#f8fafc',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#6C5CE7',
          backgroundColor: photo ? 'transparent' : 'rgba(108,92,231,0.05)',
        },
      }}
    >
      {photo ? (
        <>
          {/* Photo */}
          <Box
            component="img"
            src={photo.url}
            alt={`Photo ${index + 1}`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          
          {/* Main badge */}
          {isMain && (
            <Box
              sx={{
                position: 'absolute',
                top: 6,
                left: 6,
                backgroundColor: '#F43F5E',
                borderRadius: '6px',
                px: 0.75,
                py: 0.25,
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
              }}
            >
              <Star size={10} color="white" fill="white" />
              <Typography sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 600 }}>
                MAIN
              </Typography>
            </Box>
          )}
          
          {/* Remove button */}
          <IconButton
            onClick={onRemove}
            size="small"
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              width: 24,
              height: 24,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <X size={14} />
          </IconButton>
          
          {/* Set as main button (if not already main) */}
          {!isMain && (
            <IconButton
              onClick={onSetMain}
              size="small"
              sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: '#64748b',
                width: 28,
                height: 28,
                '&:hover': {
                  backgroundColor: 'white',
                  color: '#F43F5E',
                },
              }}
            >
              <Star size={14} />
            </IconButton>
          )}
        </>
      ) : (
        // Empty slot
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          {isUploading ? (
            <CircularProgress size={24} sx={{ color: '#6C5CE7' }} />
          ) : (
            <>
              <Plus size={24} color="#94a3b8" />
              {index === 0 && (
                <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  Main photo
                </Typography>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PhotosUploadScreen;
