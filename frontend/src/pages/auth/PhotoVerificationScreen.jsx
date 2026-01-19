import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, ShieldCheck, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OnboardingHeader from '../../components/OnboardingHeader';

const VERIFICATION_POSES = [
  { id: 'smile', instruction: 'Smile at the camera', emoji: '😊' },
  { id: 'thumbs_up', instruction: 'Give a thumbs up', emoji: '👍' },
  { id: 'peace', instruction: 'Make a peace sign', emoji: '✌️' },
];

const PhotoVerificationScreen = () => {
  const navigate = useNavigate();
  const { updateUser, user, updateOnboardingStep, saveOnboardingData } = useAuth();

  useEffect(() => {
    updateOnboardingStep('verify-photo');
  }, [updateOnboardingStep]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [step, setStep] = useState('intro'); // intro, camera, capturing, review, verified
  const [currentPose, setCurrentPose] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      // Select random pose first
      const randomPose = VERIFICATION_POSES[Math.floor(Math.random() * VERIFICATION_POSES.length)];
      setCurrentPose(randomPose);
      setStep('camera');
      
      // Small delay to ensure video element is rendered
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      
      setStream(mediaStream);
      
      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => console.error('Video play error:', err));
        };
        // Also try to play directly
        videoRef.current.play().catch(() => {});
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please allow camera access and try again.');
      setStep('intro');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setStep('capturing');
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Mirror the image (selfie mode)
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0);
    
    const photoUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoUrl);
    
    // Simulate verification
    setTimeout(() => {
      setStep('review');
    }, 1500);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setStep('camera');
  };

  const verifyPhoto = async () => {
    setIsLoading(true);
    
    // Simulate verification API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    stopCamera();
    updateUser({ isVerified: true, verificationPhoto: capturedPhoto });
    setStep('verified');
    setIsLoading(false);
  };

  const handleContinue = () => {
    stopCamera();
    updateOnboardingStep('social-connect');
    navigate('/auth/social-connect');
  };

  const handleSkip = () => {
    stopCamera();
    updateOnboardingStep('social-connect');
    navigate('/auth/social-connect');
  };

  const handleBack = () => {
    stopCamera();
    navigate('/auth/prompts');
  };

  // Intro screen
  if (step === 'intro') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Header with Progress */}
        <OnboardingHeader
          currentStep="verify-photo"
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
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            py: 4,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center' }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '28px',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
              }}
            >
              <ShieldCheck size={48} color="#22c55e" />
            </Box>

            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1a1a2e',
                mb: 2,
              }}
            >
              Verify your profile
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                mb: 4,
                maxWidth: 300,
                mx: 'auto',
              }}
            >
              Take a quick selfie to prove you're real. Verified profiles get 3x more matches!
            </Typography>

            {/* Benefits */}
            <Box
              sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                p: 3,
                mb: 4,
                textAlign: 'left',
                maxWidth: 300,
                mx: 'auto',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1a1a2e' }}>
                Why verify?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Check size={16} color="#22c55e" />
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Get a verified badge on your profile
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Check size={16} color="#22c55e" />
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Build trust with potential matches
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Check size={16} color="#22c55e" />
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Stand out in search results
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Start button */}
            <Button
              variant="contained"
              size="large"
              onClick={startCamera}
              startIcon={<Camera size={20} />}
              sx={{
                px: 6,
                py: 1.75,
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                },
              }}
            >
              Start verification
            </Button>
          </motion.div>
        </Box>
      </Box>
    );
  }

  // Camera/Capture/Review screen
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000000',
      }}
    >
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={handleBack} sx={{ color: 'white' }}>
          <ArrowLeft size={24} />
        </IconButton>
      </Box>

      {/* Camera View */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {step !== 'verified' && (
          <>
            {/* Video/Photo */}
            <Box
              sx={{
                width: 280,
                height: 280,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid white',
                position: 'relative',
              }}
            >
              {capturedPhoto ? (
                <img
                  src={capturedPhoto}
                  alt="Captured"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                  }}
                />
              )}
              
              {step === 'capturing' && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress sx={{ color: 'white' }} />
                </Box>
              )}
            </Box>

            {/* Pose instruction */}
            {currentPose && step === 'camera' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Box
                  sx={{
                    mt: 4,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    px: 4,
                    py: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '2rem', mb: 1 }}>
                    {currentPose.emoji}
                  </Typography>
                  <Typography sx={{ color: 'white', fontWeight: 600 }}>
                    {currentPose.instruction}
                  </Typography>
                </Box>
              </motion.div>
            )}
          </>
        )}

        {/* Verified state */}
        {step === 'verified' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ textAlign: 'center' }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ShieldCheck size={60} color="white" />
            </Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
              You're verified!
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
              Your profile now has a verified badge
            </Typography>
          </motion.div>
        )}
      </Box>

      {/* Bottom controls */}
      <Box
        sx={{
          p: 3,
          pb: 5,
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        {step === 'camera' && (
          <IconButton
            onClick={capturePhoto}
            sx={{
              width: 72,
              height: 72,
              backgroundColor: 'white',
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
          >
            <Camera size={32} color="#1a1a2e" />
          </IconButton>
        )}

        {step === 'review' && (
          <>
            <Button
              variant="outlined"
              onClick={retakePhoto}
              startIcon={<RefreshCw size={18} />}
              sx={{
                borderColor: 'white',
                color: 'white',
                borderRadius: '12px',
                textTransform: 'none',
                px: 3,
              }}
            >
              Retake
            </Button>
            <Button
              variant="contained"
              onClick={verifyPhoto}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <Check size={18} />}
              sx={{
                backgroundColor: '#22c55e',
                borderRadius: '12px',
                textTransform: 'none',
                px: 3,
                '&:hover': { backgroundColor: '#16a34a' },
              }}
            >
              {isLoading ? 'Verifying...' : 'Looks good!'}
            </Button>
          </>
        )}

        {step === 'verified' && (
          <Button
            variant="contained"
            onClick={handleContinue}
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Continue
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PhotoVerificationScreen;
