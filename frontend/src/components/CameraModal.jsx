import React, { useState, useEffect, useRef } from 'react';
import { Box, Dialog, IconButton, Typography, Button } from '@mui/material';
import { Camera, X, RotateCcw, Check } from 'lucide-react';

const CameraModal = ({ open, onClose, onCapture }) => {
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start camera - same approach as ProfileSettings
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setCameraStream(stream);
      setError(null);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
          };
        }
      }, 100);
    } catch (err) {
      console.error('Camera permission error:', err);
      if (err.name === 'NotAllowedError') {
        setError('נא לאשר גישה למצלמה');
      } else if (err.name === 'NotFoundError') {
        setError('לא נמצאה מצלמה במכשיר');
      } else {
        setError('שגיאה בפתיחת המצלמה');
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Take photo - same approach as ProfileSettings
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('המצלמה לא מוכנה');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    const base64Url = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(base64Url);
  };

  // Retake photo - clear image and restart camera
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Confirm and send photo
  const confirmPhoto = () => {
    if (capturedImage && onCapture) {
      // Convert data URL to blob
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          handleClose();
        });
    }
  };

  // Handle close
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    onClose();
  };

  // Start camera when modal opens
  useEffect(() => {
    if (open) {
      startCamera();
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      sx={{ zIndex: 99999 }}
      PaperProps={{ sx: { backgroundColor: '#000' } }}
    >
      <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Close button */}
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, color: '#fff' }}
        >
          <X size={24} />
        </IconButton>
        
        {/* Error state */}
        {error ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 3 }}>
            <Camera size={64} color="#fff" style={{ opacity: 0.5, marginBottom: 16 }} />
            <Typography variant="h6" sx={{ color: '#fff', mb: 2, textAlign: 'center' }}>{error}</Typography>
            <Button 
              variant="contained" 
              onClick={startCamera}
              sx={{ bgcolor: '#6C5CE7', '&:hover': { bgcolor: '#5B4BC4' } }}
            >
              נסה שוב
            </Button>
          </Box>
        ) : capturedImage ? (
          /* Captured image preview */
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img
              src={capturedImage}
              alt="Captured"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </Box>
        ) : (
          /* Video preview */
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
          </Box>
        )}
        
        {/* Capture/Confirm buttons */}
        <Box sx={{ 
          p: 3, 
          pb: 8,
          display: 'flex', 
          justifyContent: 'center',
          gap: 3,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          {capturedImage ? (
            <>
              <IconButton
                onClick={retakePhoto}
                sx={{
                  width: 56,
                  height: 56,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                }}
              >
                <RotateCcw size={24} />
              </IconButton>
              <IconButton
                onClick={confirmPhoto}
                sx={{
                  width: 72,
                  height: 72,
                  backgroundColor: '#6C5CE7',
                  '&:hover': { backgroundColor: '#5B4BC4' },
                }}
              >
                <Check size={32} color="#fff" />
              </IconButton>
            </>
          ) : (
            <IconButton
              onClick={handleCapturePhoto}
              disabled={!cameraStream}
              sx={{
                width: 72,
                height: 72,
                backgroundColor: '#fff',
                border: '4px solid rgba(255,255,255,0.3)',
                '&:hover': { backgroundColor: '#f0f0f0' },
                '&:disabled': { backgroundColor: 'rgba(255,255,255,0.3)' },
              }}
            >
              <Camera size={32} color="#1a1a2e" />
            </IconButton>
          )}
        </Box>
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Box>
    </Dialog>
  );
};

export default CameraModal;
