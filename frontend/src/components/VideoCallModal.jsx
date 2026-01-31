import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Modal, Typography, IconButton, Avatar, Button } from '@mui/material';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';

const VideoCallModal = ({ open, onClose, callType, remoteUser, onCallEnd }) => {
  const [callState, setCallState] = useState('connecting'); // connecting, ringing, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'voice');
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const callTimerRef = useRef(null);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize media stream
  const initializeMedia = useCallback(async () => {
    try {
      const constraints = {
        audio: true,
        video: callType === 'video' ? { facingMode: 'user', width: 640, height: 480 } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate connection (in real app, this would be WebRTC signaling)
      setCallState('ringing');
      
      // Simulate remote user answering after 2-3 seconds
      setTimeout(() => {
        if (localStreamRef.current) {
          setCallState('connected');
          // Start call timer
          callTimerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
          }, 1000);
        }
      }, 2000 + Math.random() * 1000);

    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError(err.name === 'NotAllowedError' 
        ? 'Camera/microphone permission denied. Please allow access to make calls.'
        : 'Could not access camera/microphone. Please check your device settings.');
      setCallState('ended');
    }
  }, [callType]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  // Handle call end
  const handleEndCall = useCallback(() => {
    cleanup();
    setCallState('ended');
    setTimeout(() => {
      onCallEnd?.();
      onClose();
    }, 500);
  }, [cleanup, onCallEnd, onClose]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, []);

  // Toggle speaker
  const toggleSpeaker = useCallback(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
      setIsSpeakerOff(remoteVideoRef.current.muted);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (open) {
      setCallState('connecting');
      setCallDuration(0);
      setError(null);
      setIsMuted(false);
      setIsVideoOff(callType === 'voice');
      initializeMedia();
    }

    return () => {
      cleanup();
    };
  }, [open, callType, initializeMedia, cleanup]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleEndCall} sx={{ zIndex: 9999 }}>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: '#111',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={handleEndCall}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
          }}
        >
          <X size={24} />
        </IconButton>

        {/* Video area */}
        {callType === 'video' && callState === 'connected' ? (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Remote video (full screen) */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#222',
              }}
            >
              {/* Placeholder for remote video - in real app this would show remote stream */}
              <Avatar
                src={remoteUser?.photoUrl}
                sx={{ width: 200, height: 200, opacity: 0.5 }}
              />
            </Box>

            {/* Local video (small, bottom right) */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 120,
                right: 16,
                width: 120,
                height: 160,
                borderRadius: 2,
                overflow: 'hidden',
                border: '2px solid #fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  display: isVideoOff ? 'none' : 'block',
                }}
              />
              {isVideoOff && (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <VideoOff size={32} color="#666" />
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          /* Voice call or connecting/ringing state */
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar
              src={remoteUser?.photoUrl}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid #6C5CE7',
                boxShadow: callState === 'ringing' 
                  ? '0 0 0 0 rgba(108, 92, 231, 0.7)'
                  : 'none',
                animation: callState === 'ringing' ? 'pulse-ring 1.5s ease-out infinite' : 'none',
                '@keyframes pulse-ring': {
                  '0%': { boxShadow: '0 0 0 0 rgba(108, 92, 231, 0.7)' },
                  '70%': { boxShadow: '0 0 0 20px rgba(108, 92, 231, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(108, 92, 231, 0)' },
                },
              }}
            />
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
              {remoteUser?.name || 'Unknown'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
              {callState === 'connecting' && 'Connecting...'}
              {callState === 'ringing' && 'Ringing...'}
              {callState === 'connected' && formatDuration(callDuration)}
              {callState === 'ended' && 'Call ended'}
            </Typography>
            {error && (
              <Typography variant="body2" sx={{ color: '#EF4444', textAlign: 'center', maxWidth: 300 }}>
                {error}
              </Typography>
            )}
          </Box>
        )}

        {/* Call duration for video calls */}
        {callType === 'video' && callState === 'connected' && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0,0,0,0.6)',
              px: 2,
              py: 0.5,
              borderRadius: 999,
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 600 }}>
              {formatDuration(callDuration)}
            </Typography>
          </Box>
        )}

        {/* Controls */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
          }}
        >
          {/* Mute button */}
          <IconButton
            onClick={toggleMute}
            sx={{
              width: 56,
              height: 56,
              bgcolor: isMuted ? '#EF4444' : 'rgba(255,255,255,0.15)',
              color: '#fff',
              '&:hover': { bgcolor: isMuted ? '#DC2626' : 'rgba(255,255,255,0.25)' },
            }}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </IconButton>

          {/* Video toggle (only for video calls) */}
          {callType === 'video' && (
            <IconButton
              onClick={toggleVideo}
              sx={{
                width: 56,
                height: 56,
                bgcolor: isVideoOff ? '#EF4444' : 'rgba(255,255,255,0.15)',
                color: '#fff',
                '&:hover': { bgcolor: isVideoOff ? '#DC2626' : 'rgba(255,255,255,0.25)' },
              }}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </IconButton>
          )}

          {/* Speaker toggle */}
          <IconButton
            onClick={toggleSpeaker}
            sx={{
              width: 56,
              height: 56,
              bgcolor: isSpeakerOff ? '#EF4444' : 'rgba(255,255,255,0.15)',
              color: '#fff',
              '&:hover': { bgcolor: isSpeakerOff ? '#DC2626' : 'rgba(255,255,255,0.25)' },
            }}
          >
            {isSpeakerOff ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </IconButton>

          {/* End call button */}
          <IconButton
            onClick={handleEndCall}
            sx={{
              width: 56,
              height: 56,
              bgcolor: '#EF4444',
              color: '#fff',
              '&:hover': { bgcolor: '#DC2626' },
            }}
          >
            <PhoneOff size={24} />
          </IconButton>
        </Box>

        {/* User info at bottom */}
        {callState === 'connected' && callType === 'video' && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 110,
              left: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(0,0,0,0.6)',
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
            }}
          >
            <Avatar src={remoteUser?.photoUrl} sx={{ width: 32, height: 32 }} />
            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
              {remoteUser?.name}
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default VideoCallModal;
