import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, HelpCircle, User, Settings, ChevronRight } from 'lucide-react';
import { useMeeting, MEETING_STATE, SOS_STATE } from '../context/MeetingContext';
import MeetingStatusIcon from './MeetingStatusIcon';

function GlobalMeetingBar() {
  const navigate = useNavigate();
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const {
    meetingState,
    meetingWith,
    meetingStartTime,
    sosState,
    sosHelperDistance,
    sosMessage,
    triggerSOS,
    cancelSOS,
  } = useMeeting();

  // Calculate meeting duration
  const [meetingDuration, setMeetingDuration] = useState('0:00');
  useEffect(() => {
    if (!meetingStartTime || meetingState !== MEETING_STATE.ACTIVE) return;
    
    const updateDuration = () => {
      const elapsed = Date.now() - meetingStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setMeetingDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [meetingStartTime, meetingState]);

  // Don't render if no active meeting (but show during ENDING state)
  if (meetingState !== MEETING_STATE.ACTIVE && meetingState !== MEETING_STATE.ENDING) {
    return null;
  }

  // Determine background color based on state
  const getBackgroundColor = () => {
    if (meetingState === MEETING_STATE.ENDING) {
      return '#DC2626'; // Brief red for ending
    }
    if (sosState === SOS_STATE.NONE) return '#6C5CE7';
    if (sosState === SOS_STATE.SEARCHING) return '#8B5CF6';
    if (sosState === SOS_STATE.HELPER_ARRIVED) return '#6C5CE7';
    return '#8B5CF6';
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        height: 56,
        zIndex: 2001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        bgcolor: getBackgroundColor(),
        color: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        // Fade out animation for ending state
        ...(meetingState === MEETING_STATE.ENDING && {
          opacity: 0.9,
          animation: 'meetingBarFadeOut 1.5s ease-out forwards',
        }),
        '@keyframes meetingBarFadeOut': {
          '0%': { opacity: 1 },
          '70%': { opacity: 0.8 },
          '100%': { opacity: 0 },
        },
      }}
    >
      {/* Left side: Back button + Meeting info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Back button */}
        <IconButton
          size="small"
          sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </IconButton>
        
        {/* Meeting Status Icon - Click to return to Meeting Time screen */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            cursor: 'pointer',
            py: 0.5,
            px: 1,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.1)',
            transition: 'all 0.2s ease',
            '&:hover': { 
              bgcolor: 'rgba(255,255,255,0.2)',
            },
          }}
          onClick={() => {
            // Navigate to dedicated Meeting Time page
            navigate('/meeting-time');
          }}
          role="button"
          aria-label="Return to Meeting Time"
        >
          {/* Meeting Status Icon with connecting line states */}
          <MeetingStatusIcon sosState={sosState} size={32} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {meetingWith?.name && `with ${meetingWith.name}`}
              </Typography>
              {meetingState === MEETING_STATE.ACTIVE && sosState === SOS_STATE.NONE && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(255,255,255,0.2)', px: 1, py: 0.25, borderRadius: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#10B981', 
                    boxShadow: '0 0 6px #10B981',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#10B981', fontSize: '0.65rem' }}>
                    LIVE
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 800, 
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#fff',
                    }}
                  >
                    {meetingDuration}
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.9, lineHeight: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {meetingState === MEETING_STATE.ENDING && 'Meeting ended'}
              {meetingState === MEETING_STATE.ACTIVE && sosState === SOS_STATE.NONE && 'Tap to view'}
              {meetingState === MEETING_STATE.ACTIVE && sosState === SOS_STATE.SEARCHING && 'Finding helper...'}
              {meetingState === MEETING_STATE.ACTIVE && sosState === SOS_STATE.HELPER_FOUND && 'Helper found'}
              {meetingState === MEETING_STATE.ACTIVE && sosState === SOS_STATE.HELPER_APPROACHING && 'Helper approaching'}
              {sosState === SOS_STATE.HELPER_ARRIVED && 'Helper arrived'}
              {sosHelperDistance !== null && sosState !== SOS_STATE.NONE && 
                ` • ${sosHelperDistance < 0.1 ? '<100m' : `${sosHelperDistance.toFixed(1)}km`}`}
            </Typography>
          </Box>
          {/* Arrow indicator */}
          <ChevronRight size={16} style={{ opacity: 0.7 }} />
        </Box>
      </Box>

      {/* Right side: SOS + Nav buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {sosState !== SOS_STATE.NONE && (
          <Button
            size="small"
            variant="outlined"
            onClick={cancelSOS}
            sx={{ 
              color: '#fff', 
              borderColor: 'rgba(255,255,255,0.5)',
              fontSize: '0.7rem',
              py: 0.25,
              px: 1,
              minWidth: 'auto',
              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Cancel
          </Button>
        )}
        {/* SOS Button - With text label */}
        <Box
          onClick={sosState === SOS_STATE.NONE ? triggerSOS : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'rgba(0,0,0,0.3)',
            color: '#fff',
            px: 1,
            py: 0.5,
            borderRadius: 1.5,
            cursor: sosState === SOS_STATE.NONE ? 'pointer' : 'default',
            opacity: sosState !== SOS_STATE.NONE ? 0.5 : 1,
            border: '1px solid rgba(255,255,255,0.3)',
            '&:hover': sosState === SOS_STATE.NONE ? { bgcolor: 'rgba(0,0,0,0.4)' } : {},
          }}
        >
          <Shield size={14} />
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
            SOS
          </Typography>
        </Box>
        {/* Help button */}
        <IconButton
          size="small"
          sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
          onClick={() => setShowHelpDialog(true)}
        >
          <HelpCircle size={20} />
        </IconButton>
        {/* Profile button */}
        <IconButton
          size="small"
          sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
          onClick={() => navigate('/profile')}
        >
          <User size={20} />
        </IconButton>
        {/* Settings button */}
        <IconButton
          size="small"
          sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
          onClick={() => navigate('/settings')}
        >
          <Settings size={20} />
        </IconButton>
      </Box>

      {/* Help Dialog */}
      <Dialog
        open={showHelpDialog}
        onClose={() => setShowHelpDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 0,
            maxWidth: 300,
            width: '90%',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0.5, pt: 2, textAlign: 'center', fontSize: '1.05rem' }}>
          Meeting Time Help
        </DialogTitle>
        <DialogContent sx={{ py: 1, px: 2.5 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 22, mb: 0.25 }}>🛡️</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.85rem' }}>
                Stay Safe
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                Your location is shared with your safety contacts during the meeting
              </Typography>
            </Box>
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 22, mb: 0.25 }}>🆘</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.85rem' }}>
                SOS Button
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                Tap the shield icon if you need help - nearby users will be alerted
              </Typography>
            </Box>
            <Box sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: 22, mb: 0.25 }}>✅</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.85rem' }}>
                End Meeting
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                Tap the bar to return to the meeting screen and end when you're done
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, pt: 0.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowHelpDialog(false)}
            sx={{
              py: 1,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

      {/* SOS Message Toast */}
      <Snackbar
        open={!!sosMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: 70, zIndex: 99999 }}
      >
        <Alert 
          severity="info" 
          sx={{ 
            width: '100%',
            bgcolor: '#6C5CE7',
            color: '#fff',
            '& .MuiAlert-icon': { color: '#fff' },
          }}
        >
          {sosMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GlobalMeetingBar;
