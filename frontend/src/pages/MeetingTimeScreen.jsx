// MeetingTimeScreen.jsx - Dedicated page for active meeting with Quick Actions
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";
import {
  trackSOSConfirmed,
  trackSOSUnconfirmed,
} from "../services/analytics";
import {
  canGrantReward,
  recordHelpSession,
  flagUser,
} from "../services/sosAbusePrevention";
import {
  grantReward,
  calculateReward,
} from "../services/sosRewardSystem";
import {
  getTrustScore,
  recordHelpConfirmed as recordTrustConfirmed,
  recordHelpUnconfirmed as recordTrustUnconfirmed,
  recordHelperArrived as recordTrustArrived,
} from "../services/sosTrustScore";
import {
  Users,
  UserPlus,
  MapPin,
  X,
  Edit2,
  Trash2,
  MessageSquare,
  Send,
  Heart,
  Shield,
  AlertTriangle,
  Ban,
  MessageCircle,
  ArrowRight,
  Search,
  UserCheck,
  Navigation,
  CheckCircle,
  XCircle,
  Check,
  RefreshCw,
} from "lucide-react";
import { useMeeting, MEETING_STATE } from "../context/MeetingContext";
import SOSHelperNotification, { HELPER_STATE } from "../components/SOSHelperNotification";

// SOS Demo States (matching spec)
const SOS_DEMO_STATE = {
  IDLE: 'idle',
  SEARCHING: 'searching',
  HELPER_ASSIGNED: 'helper_assigned',
  HELPER_APPROACHING: 'helper_approaching',
  HELPER_ARRIVED: 'helper_arrived',
  AWAITING_CONFIRMATION: 'awaiting_confirmation', // New: waiting for requester to confirm help
  RESOLVED_CONFIRMED: 'resolved_confirmed', // New: requester confirmed help received
  RESOLVED_UNCONFIRMED: 'resolved_unconfirmed', // New: timeout without confirmation
  CANCELLED: 'cancelled',
  HELPER_UNAVAILABLE: 'helper_unavailable',
  HELPER_NOT_PROGRESSING: 'helper_not_progressing',
};

// Reward points for confirmed help
const HELPER_REWARD_POINTS = 150;

// SOS Demo Dialog Component - Full Flow Simulation per Spec
function SOSDemoDialog({ open, onClose, meetingWith, meetingContacts }) {
  const [demoState, setDemoState] = useState(SOS_DEMO_STATE.IDLE);
  const [helperDistance, setHelperDistance] = useState(null);
  const [searchRadius, setSearchRadius] = useState(400);
  const [message, setMessage] = useState('');
  const [helperName, setHelperName] = useState('Sarah');
  const [showHelperView, setShowHelperView] = useState(false);
  const [showConfirmationSheet, setShowConfirmationSheet] = useState(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(150); // Dynamic reward amount with bonuses
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [demoStartTime, setDemoStartTime] = useState(null); // Track when demo started for abuse prevention
  const confirmationTimeoutRef = useRef(null);
  
  // Reset on open
  useEffect(() => {
    if (open) {
      setDemoState(SOS_DEMO_STATE.IDLE);
      setHelperDistance(null);
      setSearchRadius(400);
      setMessage('');
      setShowHelperView(false);
      setShowConfirmationSheet(false);
      setRewardGranted(false);
      setShowRewardToast(false);
      if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
        confirmationTimeoutRef.current = null;
      }
    }
  }, [open]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
      }
    };
  }, []);

  // Start SOS demo flow
  const startDemo = useCallback(() => {
    setDemoStartTime(Date.now()); // Track start time for abuse prevention
    setDemoState(SOS_DEMO_STATE.SEARCHING);
    setMessage('Searching for nearby help');
    setSearchRadius(400);
    
    // Simulate radius expansion and helper found
    setTimeout(() => setSearchRadius(800), 3000);
    setTimeout(() => {
      setDemoState(SOS_DEMO_STATE.HELPER_ASSIGNED);
      setHelperDistance(1.2);
      setMessage('Someone from the community is on the way');
    }, 5000);
    
    // Simulate approaching
    setTimeout(() => {
      setDemoState(SOS_DEMO_STATE.HELPER_APPROACHING);
      setHelperDistance(0.8);
    }, 8000);
    
    setTimeout(() => setHelperDistance(0.3), 11000);
    
    // Simulate arrived - transition to awaiting confirmation
    setTimeout(() => {
      setDemoState(SOS_DEMO_STATE.AWAITING_CONFIRMATION);
      setHelperDistance(0);
      setMessage('Someone from the community has arrived');
      setShowConfirmationSheet(true);
      
      // Start confirmation timeout (2-3 minutes in real app, 15s for demo)
      confirmationTimeoutRef.current = setTimeout(() => {
        // No confirmation received - resolve as unconfirmed
        setDemoState(SOS_DEMO_STATE.RESOLVED_UNCONFIRMED);
        setShowConfirmationSheet(false);
        setMessage('Hope everything is okay. You can still confirm if needed.');
        
        // Update Trust Score for unconfirmed help
        const helperId = 'demo_helper';
        recordTrustUnconfirmed(helperId);
        
        // Analytics: Track SOS unconfirmed (timeout)
        trackSOSUnconfirmed();
      }, 15000); // 15 seconds for demo (would be 2-3 min in production)
    }, 14000);
  }, []);

  // Handle confirmation: "Yes, they helped me"
  const handleConfirmHelp = useCallback(() => {
    // Clear timeout
    if (confirmationTimeoutRef.current) {
      clearTimeout(confirmationTimeoutRef.current);
      confirmationTimeoutRef.current = null;
    }
    
    // Get user IDs and session data
    const currentUserId = JSON.parse(localStorage.getItem('pulse_user') || '{}').id || 'demo_requester';
    const helperId = 'demo_helper'; // In production, this would be the actual helper ID
    const arrivalTimeMs = Date.now() - (demoStartTime || Date.now());
    const distanceKm = 0.8; // Demo distance (in production, actual distance traveled)
    
    // Get helper's trust score for bonus calculation
    const helperTrust = getTrustScore(helperId);
    
    // Abuse Prevention: Check if reward can be granted
    const rewardCheck = canGrantReward(currentUserId, helperId, arrivalTimeMs);
    
    // Close confirmation sheet
    setShowConfirmationSheet(false);
    
    // Set state to resolved confirmed
    setDemoState(SOS_DEMO_STATE.RESOLVED_CONFIRMED);
    
    if (rewardCheck.grantReward) {
      // Smart Reward System: Calculate and grant reward with bonuses
      const rewardResult = grantReward({
        requesterId: currentUserId,
        helperId,
        distanceKm,
        arrivalTimeMs,
        isTrustedHelper: helperTrust.isTrustedHelper,
      });
      
      if (rewardResult.eligible) {
        // Build reward message with bonuses
        let rewardMessage = `Thank you for confirming! Helper earned ${rewardResult.totalReward} points`;
        if (rewardResult.bonuses.length > 0) {
          const bonusLabels = rewardResult.bonuses.map(b => b.label).join(', ');
          rewardMessage += ` (${bonusLabels})`;
        }
        setMessage(rewardMessage);
        
        // Grant reward to helper
        setRewardGranted(true);
        setRewardAmount(rewardResult.totalReward);
        
        // Record for abuse prevention
        recordHelpSession(currentUserId, helperId, arrivalTimeMs);
        
        // Update Trust Score
        recordTrustConfirmed(helperId);
        
        // Analytics: Track SOS confirmed with actual reward
        trackSOSConfirmed(rewardResult.totalReward);
        
        // Flag for review if pattern detected
        if (rewardCheck.flagForReview) {
          flagUser(currentUserId, 'repeated_help_pattern');
        }
        
        // Show reward toast after a brief delay
        setTimeout(() => {
          setShowRewardToast(true);
          setTimeout(() => setShowRewardToast(false), 5000);
        }, 500);
      } else {
        // Reward blocked by smart reward system (daily limit, etc.)
        setMessage(rewardResult.message || 'Thank you for confirming.');
        setRewardGranted(false);
        recordTrustConfirmed(helperId); // Still update trust score
        trackSOSConfirmed(0);
      }
    } else {
      // Reward blocked by abuse prevention
      setMessage(rewardCheck.message || 'Thank you for confirming.');
      setRewardGranted(false);
      trackSOSConfirmed(0);
    }
  }, [demoStartTime]);

  // Handle "Not yet" - minimize confirmation but keep available
  const handleNotYet = useCallback(() => {
    setShowConfirmationSheet(false);
    // Keep state as awaiting_confirmation - user can still confirm later
    setMessage('You can confirm whenever you feel ready.');
  }, []);

  // Reopen confirmation sheet
  const reopenConfirmation = useCallback(() => {
    if (demoState === SOS_DEMO_STATE.AWAITING_CONFIRMATION || 
        demoState === SOS_DEMO_STATE.RESOLVED_UNCONFIRMED) {
      setShowConfirmationSheet(true);
    }
  }, [demoState]);

  // Demo helper unavailable scenario
  const demoHelperUnavailable = useCallback(() => {
    setDemoState(SOS_DEMO_STATE.SEARCHING);
    setMessage('Searching for nearby help');
    
    setTimeout(() => {
      setDemoState(SOS_DEMO_STATE.HELPER_ASSIGNED);
      setHelperDistance(1.5);
      setMessage('Someone from the community is on the way');
    }, 3000);
    
    setTimeout(() => {
      setDemoState(SOS_DEMO_STATE.HELPER_UNAVAILABLE);
      setMessage("It looks like the person who responded is unavailable. We're continuing to search.");
    }, 6000);
    
    setTimeout(() => {
      setDemoState(SOS_DEMO_STATE.SEARCHING);
      setMessage('Searching for nearby help');
    }, 10000);
    
    setTimeout(() => {
      setDemoState(SOS_DEMO_STATE.HELPER_ASSIGNED);
      setHelperName('David');
      setHelperDistance(0.9);
      setMessage('Someone from the community is on the way');
    }, 13000);
  }, []);

  // Demo helper not progressing scenario
  const demoHelperNotProgressing = useCallback(() => {
    setDemoState(SOS_DEMO_STATE.SEARCHING);
    setMessage('Searching for nearby help');
    
    setTimeout(() => {
      setDemoState(SOS_DEMO_STATE.HELPER_ASSIGNED);
      setHelperDistance(1.2);
      setMessage('Someone from the community is on the way');
    }, 3000);
    
    setTimeout(() => {
      setDemoState(SOS_DEMO_STATE.HELPER_NOT_PROGRESSING);
      setMessage("It looks like the person who responded isn't approaching. We're continuing to search.");
    }, 6000);
    
    setTimeout(() => {
      setDemoState(SOS_DEMO_STATE.SEARCHING);
      setMessage('Searching for nearby help');
    }, 10000);
  }, []);

  // Cancel demo
  const cancelDemo = useCallback(() => {
    setDemoState(SOS_DEMO_STATE.CANCELLED);
    setMessage('The request was cancelled');
  }, []);

  // Get state color
  const getStateColor = () => {
    switch (demoState) {
      case SOS_DEMO_STATE.SEARCHING: return '#8B5CF6';
      case SOS_DEMO_STATE.HELPER_ASSIGNED: return '#6C5CE7';
      case SOS_DEMO_STATE.HELPER_APPROACHING: return '#3B82F6';
      case SOS_DEMO_STATE.HELPER_ARRIVED: return '#10B981';
      case SOS_DEMO_STATE.AWAITING_CONFIRMATION: return '#10B981';
      case SOS_DEMO_STATE.RESOLVED_CONFIRMED: return '#10B981';
      case SOS_DEMO_STATE.RESOLVED_UNCONFIRMED: return '#94a3b8';
      case SOS_DEMO_STATE.CANCELLED: return '#6B7280';
      case SOS_DEMO_STATE.HELPER_UNAVAILABLE:
      case SOS_DEMO_STATE.HELPER_NOT_PROGRESSING: return '#F59E0B';
      default: return '#6C5CE7';
    }
  };

  // Get state icon
  const getStateIcon = () => {
    switch (demoState) {
      case SOS_DEMO_STATE.SEARCHING: return <Search size={28} color="#fff" />;
      case SOS_DEMO_STATE.HELPER_ASSIGNED: return <UserCheck size={28} color="#fff" />;
      case SOS_DEMO_STATE.HELPER_APPROACHING: return <Navigation size={28} color="#fff" />;
      case SOS_DEMO_STATE.HELPER_ARRIVED: return <CheckCircle size={28} color="#fff" />;
      case SOS_DEMO_STATE.AWAITING_CONFIRMATION: return <Users size={28} color="#fff" />;
      case SOS_DEMO_STATE.RESOLVED_CONFIRMED: return <Heart size={28} color="#fff" />;
      case SOS_DEMO_STATE.RESOLVED_UNCONFIRMED: return <CheckCircle size={28} color="#fff" />;
      case SOS_DEMO_STATE.CANCELLED: return <XCircle size={28} color="#fff" />;
      case SOS_DEMO_STATE.HELPER_UNAVAILABLE:
      case SOS_DEMO_STATE.HELPER_NOT_PROGRESSING: return <RefreshCw size={28} color="#fff" />;
      default: return <Shield size={28} color="#fff" />;
    }
  };

  // Get progress value (0-100)
  const getProgress = () => {
    switch (demoState) {
      case SOS_DEMO_STATE.SEARCHING: return 15;
      case SOS_DEMO_STATE.HELPER_ASSIGNED: return 40;
      case SOS_DEMO_STATE.HELPER_APPROACHING: 
        if (helperDistance <= 0.3) return 85;
        if (helperDistance <= 0.8) return 65;
        return 50;
      case SOS_DEMO_STATE.HELPER_ARRIVED: return 100;
      case SOS_DEMO_STATE.AWAITING_CONFIRMATION: return 100;
      case SOS_DEMO_STATE.RESOLVED_CONFIRMED: return 100;
      case SOS_DEMO_STATE.RESOLVED_UNCONFIRMED: return 100;
      default: return 0;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: '20px', maxWidth: 400, width: '95%' } }}
    >
      <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
        <Box sx={{ 
          width: 64, height: 64, borderRadius: '50%', 
          background: `linear-gradient(135deg, ${getStateColor()} 0%, ${getStateColor()}dd 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 1.5,
          animation: demoState === SOS_DEMO_STATE.SEARCHING ? 'pulse 1.5s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { boxShadow: `0 0 0 0 ${getStateColor()}66` },
            '70%': { boxShadow: `0 0 0 15px ${getStateColor()}00` },
            '100%': { boxShadow: `0 0 0 0 ${getStateColor()}00` },
          },
        }}>
          {getStateIcon()}
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e' }}>
          🧪 SOS Demo - Full Flow
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Test the SOS system behavior
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        {/* Current State Display */}
        {demoState !== SOS_DEMO_STATE.IDLE && (
          <Box sx={{ mb: 2 }}>
            {/* Progress Bar */}
            <LinearProgress 
              variant="determinate" 
              value={getProgress()} 
              sx={{ 
                height: 8, borderRadius: 4, mb: 1.5,
                bgcolor: '#e2e8f0',
                '& .MuiLinearProgress-bar': { 
                  bgcolor: getStateColor(),
                  borderRadius: 4,
                },
              }} 
            />
            
            {/* Status Message */}
            <Box sx={{ 
              p: 2, borderRadius: '12px', 
              bgcolor: `${getStateColor()}15`,
              border: `1px solid ${getStateColor()}30`,
              mb: 2,
            }}>
              <Typography variant="body2" sx={{ 
                color: getStateColor(), 
                fontWeight: 600, 
                textAlign: 'center',
                fontSize: '0.9rem',
              }}>
                {message}
              </Typography>
              
              {/* Helper Distance */}
              {helperDistance !== null && demoState !== SOS_DEMO_STATE.CANCELLED && (
                <Typography variant="caption" sx={{ 
                  display: 'block', textAlign: 'center', 
                  color: '#64748b', mt: 1,
                }}>
                  {helperName} • {helperDistance < 0.1 ? '<100m' : `${helperDistance.toFixed(1)}km away`}
                </Typography>
              )}
              
              {/* Search Radius */}
              {demoState === SOS_DEMO_STATE.SEARCHING && (
                <Typography variant="caption" sx={{ 
                  display: 'block', textAlign: 'center', 
                  color: '#64748b', mt: 1,
                }}>
                  Search radius: {searchRadius}m
                </Typography>
              )}
            </Box>

            {/* Visual State Indicator */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 2 }}>
              {['searching', 'assigned', 'approaching', 'arrived'].map((state, idx) => (
                <Box key={state} sx={{
                  width: 40, height: 4, borderRadius: 2,
                  bgcolor: getProgress() >= (idx + 1) * 25 ? getStateColor() : '#e2e8f0',
                  transition: 'all 0.3s',
                }} />
              ))}
            </Box>
          </Box>
        )}

        {/* Demo Controls */}
        {demoState === SOS_DEMO_STATE.IDLE && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151', mb: 0.5 }}>
              Choose a scenario to demo:
            </Typography>
            
            {/* Happy Path */}
            <Button
              fullWidth
              variant="contained"
              onClick={startDemo}
              sx={{
                py: 1.5, borderRadius: '12px', textTransform: 'none',
                fontWeight: 600, fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
              }}
            >
              ✅ Happy Path - Helper Arrives
            </Button>
            
            {/* Helper Unavailable */}
            <Button
              fullWidth
              variant="outlined"
              onClick={demoHelperUnavailable}
              sx={{
                py: 1.5, borderRadius: '12px', textTransform: 'none',
                fontWeight: 600, fontSize: '0.9rem',
                borderColor: '#F59E0B', color: '#F59E0B',
                '&:hover': { borderColor: '#D97706', bgcolor: '#FEF3C7' },
              }}
            >
              ⚠️ Helper Unavailable - Auto Reassign
            </Button>
            
            {/* Helper Not Progressing */}
            <Button
              fullWidth
              variant="outlined"
              onClick={demoHelperNotProgressing}
              sx={{
                py: 1.5, borderRadius: '12px', textTransform: 'none',
                fontWeight: 600, fontSize: '0.9rem',
                borderColor: '#F59E0B', color: '#F59E0B',
                '&:hover': { borderColor: '#D97706', bgcolor: '#FEF3C7' },
              }}
            >
              🚶 Helper Not Approaching - Auto Reassign
            </Button>

            {/* Toggle Helper View */}
            <Button
              fullWidth
              variant="text"
              onClick={() => setShowHelperView(!showHelperView)}
              sx={{
                py: 1, textTransform: 'none', fontSize: '0.85rem',
                color: '#6C5CE7',
              }}
            >
              {showHelperView ? '👤 Hide Helper View' : '👥 Show Helper View'}
            </Button>
          </Box>
        )}

        {/* Helper View Demo - Uses SOSHelperNotification component */}
        {showHelperView && (
          <Box sx={{ 
            mt: 2, p: 2, borderRadius: '12px', 
            bgcolor: '#f8fafc', border: '1px solid #e2e8f0',
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151', mb: 1.5 }}>
              📱 What helpers see:
            </Typography>
            
            {/* Embedded SOSHelperNotification preview (not as dialog) */}
            <SOSHelperNotification
              open={true}
              onClose={() => setShowHelperView(false)}
              requester={{
                name: 'Liza',
                age: 28,
                photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
                tagline: 'Adventure seeker with a passion for discovering new places ✈️',
                verified: true,
              }}
              location={{
                address: 'Dizengoff Center, Tel Aviv',
                lat: 32.0753,
                lng: 34.7748,
                distance: helperDistance || 1.2,
              }}
              onAccept={startDemo}
              onDecline={() => setShowHelperView(false)}
              onCancel={cancelDemo}
              helperState={
                demoState === SOS_DEMO_STATE.IDLE ? HELPER_STATE.INCOMING :
                demoState === SOS_DEMO_STATE.HELPER_ASSIGNED ? HELPER_STATE.ACCEPTED :
                demoState === SOS_DEMO_STATE.HELPER_APPROACHING ? HELPER_STATE.APPROACHING :
                demoState === SOS_DEMO_STATE.AWAITING_CONFIRMATION ? HELPER_STATE.ARRIVED :
                demoState === SOS_DEMO_STATE.RESOLVED_CONFIRMED ? HELPER_STATE.CONFIRMED :
                HELPER_STATE.INCOMING
              }
              rewardPoints={150}
              embedded={true}
            />

            {/* Searching State */}
            {demoState === SOS_DEMO_STATE.SEARCHING && (
              <Box sx={{ 
                p: 2, borderRadius: '12px', bgcolor: '#fff',
                border: '2px dashed #94a3b8', textAlign: 'center', mt: 1.5,
              }}>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Waiting for a helper to accept...
                </Typography>
              </Box>
            )}
            
            {/* Other messages info */}
            {demoState === SOS_DEMO_STATE.IDLE && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Other helper messages:
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontStyle: 'italic' }}>
                  • "Someone has already responded. Thank you."
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontStyle: 'italic' }}>
                  • "This request is no longer active. Thank you."
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Active Demo - Cancel Button */}
        {demoState !== SOS_DEMO_STATE.IDLE && 
         demoState !== SOS_DEMO_STATE.CANCELLED && 
         demoState !== SOS_DEMO_STATE.HELPER_ARRIVED &&
         demoState !== SOS_DEMO_STATE.AWAITING_CONFIRMATION &&
         demoState !== SOS_DEMO_STATE.RESOLVED_CONFIRMED &&
         demoState !== SOS_DEMO_STATE.RESOLVED_UNCONFIRMED && (
          <Button
            fullWidth
            variant="outlined"
            onClick={cancelDemo}
            sx={{
              py: 1, borderRadius: '12px', textTransform: 'none',
              fontWeight: 600, borderColor: '#ef4444', color: '#ef4444',
              '&:hover': { borderColor: '#dc2626', bgcolor: '#fef2f2' },
            }}
          >
            Cancel SOS
          </Button>
        )}

        {/* Confirmation Bottom Sheet UI */}
        {showConfirmationSheet && (
          <Box sx={{ 
            mt: 2, p: 2.5, borderRadius: '16px', 
            bgcolor: '#f0fdf4', border: '2px solid #86efac',
            animation: 'fadeIn 0.3s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            {/* Icon */}
            <Box sx={{ 
              width: 48, height: 48, borderRadius: '50%', 
              bgcolor: '#dcfce7', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 1.5,
            }}>
              <Users size={24} color="#22c55e" />
            </Box>
            
            {/* Title */}
            <Typography sx={{ 
              fontWeight: 700, fontSize: '1rem', color: '#166534',
              textAlign: 'center', mb: 0.5,
            }}>
              Did someone arrive to help you?
            </Typography>
            
            {/* Body Text */}
            <Typography variant="body2" sx={{ 
              color: '#4ade80', textAlign: 'center', mb: 2,
              fontSize: '0.85rem',
            }}>
              Please confirm if the person has reached you and helped.
            </Typography>
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleConfirmHelp}
                sx={{
                  py: 1.25, borderRadius: '12px', textTransform: 'none',
                  fontWeight: 600, fontSize: '0.9rem',
                  bgcolor: '#22c55e',
                  '&:hover': { bgcolor: '#16a34a' },
                }}
              >
                Yes, they helped me
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleNotYet}
                sx={{
                  py: 1, borderRadius: '12px', textTransform: 'none',
                  fontWeight: 600, fontSize: '0.85rem',
                  borderColor: '#86efac', color: '#166534',
                  '&:hover': { borderColor: '#22c55e', bgcolor: '#f0fdf4' },
                }}
              >
                Not yet
              </Button>
            </Box>
            
            {/* Optional Subtext */}
            <Typography variant="caption" sx={{ 
              display: 'block', textAlign: 'center', 
              color: '#86efac', mt: 1.5, fontStyle: 'italic',
            }}>
              You can confirm whenever you feel ready.
            </Typography>
          </Box>
        )}

        {/* Reopen Confirmation Button (when minimized) */}
        {!showConfirmationSheet && 
         (demoState === SOS_DEMO_STATE.AWAITING_CONFIRMATION || 
          demoState === SOS_DEMO_STATE.RESOLVED_UNCONFIRMED) && (
          <Button
            fullWidth
            variant="outlined"
            onClick={reopenConfirmation}
            sx={{
              mt: 1, py: 1, borderRadius: '12px', textTransform: 'none',
              fontWeight: 600, fontSize: '0.85rem',
              borderColor: '#22c55e', color: '#22c55e',
              '&:hover': { borderColor: '#16a34a', bgcolor: '#f0fdf4' },
            }}
          >
            ✓ Confirm help received
          </Button>
        )}

        {/* Reward Toast (shown to helper) */}
        {showRewardToast && (
          <Box sx={{ 
            mt: 2, p: 2, borderRadius: '12px', 
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            animation: 'slideUp 0.4s ease-out',
            '@keyframes slideUp': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            <Typography sx={{ 
              fontWeight: 700, fontSize: '0.95rem', color: '#fff',
              textAlign: 'center', mb: 0.5,
            }}>
              🎉 Helper Reward Granted!
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.9)', textAlign: 'center',
              fontSize: '0.85rem',
            }}>
              You helped someone today. You've earned {rewardAmount} points. Thank you 💜
            </Typography>
          </Box>
        )}

        {/* Reset Button */}
        {(demoState === SOS_DEMO_STATE.CANCELLED || 
          demoState === SOS_DEMO_STATE.RESOLVED_CONFIRMED ||
          demoState === SOS_DEMO_STATE.RESOLVED_UNCONFIRMED) && (
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setDemoState(SOS_DEMO_STATE.IDLE);
              setHelperDistance(null);
              setMessage('');
              setHelperName('Sarah');
              setShowConfirmationSheet(false);
              setRewardGranted(false);
              setShowRewardToast(false);
              if (confirmationTimeoutRef.current) {
                clearTimeout(confirmationTimeoutRef.current);
                confirmationTimeoutRef.current = null;
              }
            }}
            sx={{
              mt: 1.5, py: 1.5, borderRadius: '12px', textTransform: 'none',
              fontWeight: 600, bgcolor: '#6C5CE7',
              '&:hover': { bgcolor: '#5B4CD6' },
            }}
          >
            🔄 Try Another Scenario
          </Button>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'center' }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: '12px', textTransform: 'none', fontWeight: 600,
            color: '#64748b',
          }}
        >
          Close Demo
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Preset message options for WhatsApp sharing
// Use {name} placeholder for personalized messages
const PRESET_MESSAGES = [
  { id: 1, text: "Hey, I'm on a date right now. Everything is fine, just wanted to let you know 💜", label: "Regular update", hasLocation: false },
  { id: 2, text: "Hey, I'm on a date now. I'll update you when I'm done 🙂", label: "Update with check-in", hasLocation: false },
  { id: 3, text: "Hey, just wanted you to know I'm on a date. If I don't get back to you within 2 hours, please call me", label: "Check-in request", hasLocation: false },
  { id: 4, text: "Hey {name}, I'm on a date right now. Just wanted you to know I'm safe 💜", label: "Personal message", hasLocation: false, personalized: true },
];

export default function MeetingTimeScreen() {
  const navigate = useNavigate();
  const { 
    meetingState, 
    meetingWith, 
    endMeeting,
    triggerSOS,
    sosState,
    sosHelperDistance,
    sosHelper,
    cancelSOS,
    SOS_STATE,
  } = useMeeting();

  // Default contacts - empty phone numbers so user must fill in real numbers
  // Use personalized message with name placeholder
  const DEFAULT_CONTACTS = [
    { id: 1, name: 'איש קשר 1', phone: '', message: PRESET_MESSAGES[3].text.replace('{name}', 'איש קשר 1') },
    { id: 2, name: 'איש קשר 2', phone: '', message: PRESET_MESSAGES[3].text.replace('{name}', 'איש קשר 2') },
  ];

  // Meeting contacts state - now stores more info including custom message
  const [meetingContacts, setMeetingContacts] = useState(() => {
    const saved = localStorage.getItem('pulse_meeting_contacts');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all contacts have message and phone fields
      // Also update old generic messages to personalized ones
      const oldGenericMessage = "Hey, I'm on a date right now. Everything is fine, just wanted to let you know 💜";
      return parsed.map(c => {
        let message = c.message;
        // If using old generic message, update to personalized one
        if (!message || message === oldGenericMessage) {
          message = PRESET_MESSAGES[3].text.replace('{name}', c.name || '');
        }
        return { 
          ...c, 
          message,
          phone: c.phone || '' 
        };
      });
    }
    return DEFAULT_CONTACTS;
  });
  const [contactsSharedLocation, setContactsSharedLocation] = useState([]);
  
  // Dialogs
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [showEditContactDialog, setShowEditContactDialog] = useState(false);
  const [showEndMeetingConfirm, setShowEndMeetingConfirm] = useState(false);
  const [showPostMeetingFeedback, setShowPostMeetingFeedback] = useState(false);
  const [showSOSDemo, setShowSOSDemo] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedPresetMessage, setSelectedPresetMessage] = useState(4); // Default to personalized message with name
  const [customMessage, setCustomMessage] = useState('');
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [editedPresetMessages, setEditedPresetMessages] = useState({}); // Track edited versions of preset messages
  const [includeLocation, setIncludeLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Redirect if no active meeting
  useEffect(() => {
    if (meetingState !== MEETING_STATE.ACTIVE) {
      navigate(-1);
    }
  }, [meetingState, navigate]);

  // Save contacts to localStorage
  const saveContacts = (contacts) => {
    setMeetingContacts(contacts);
    localStorage.setItem('pulse_meeting_contacts', JSON.stringify(contacts));
  };

  // Get current location with better error handling
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          // Provide specific error messages
          let errorMessage = 'Could not get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred getting location.';
          }
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  };

  // Handle location toggle
  const handleLocationToggle = async () => {
    if (!includeLocation) {
      // Turning on - get location
      setLocationLoading(true);
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
        setIncludeLocation(true);
        setSnackbar({ open: true, message: '📍 Location captured!', severity: 'success' });
      } catch (error) {
        console.error('Error getting location:', error);
        setSnackbar({ open: true, message: error.message || 'Could not get location. Please enable location services.', severity: 'error' });
      }
      setLocationLoading(false);
    } else {
      // Turning off
      setIncludeLocation(false);
      setCurrentLocation(null);
    }
  };

  // Build message with optional Google Maps link
  const buildMessageWithLocation = (baseMessage, location) => {
    if (!location) return baseMessage;
    const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    return `${baseMessage}\n\n📍 My location: ${mapsUrl}`;
  };

  // Share location via WhatsApp - always let user choose recipient
  const handleShareLocation = (contact) => {
    let message = contact.message || PRESET_MESSAGES[0].text;
    
    // Add location if contact has it saved
    if (contact.location) {
      message = buildMessageWithLocation(message, contact.location);
    }
    
    const encodedMessage = encodeURIComponent(message);
    
    console.log('[MeetingTimeScreen] Sharing to WhatsApp:', { message });
    
    // Always open WhatsApp with message only - let user choose recipient
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let whatsappUrl;
    
    if (isMobile) {
      // Mobile: use whatsapp:// protocol without phone number
      whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    } else {
      // Desktop: use web.whatsapp.com without phone number
      whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
    }
    
    window.open(whatsappUrl, '_blank');
    
    // Mark as shared
    if (!contactsSharedLocation.includes(contact.id)) {
      setContactsSharedLocation(prev => [...prev, contact.id]);
    }
  };

  // Open edit dialog for contact
  const handleEditContact = (contact, e) => {
    e.stopPropagation();
    setEditingContact(contact);
    setContactName(contact.name);
    setContactPhone(contact.phone);
    
    // If contact has a saved presetId, use it to restore the correct preset with the edited message
    if (contact.presetId && contact.message) {
      setSelectedPresetMessage(contact.presetId);
      setUseCustomMessage(false);
      setEditedPresetMessages({ [contact.presetId]: contact.message });
    } else {
      // Check if the saved message matches any preset exactly
      const presetMatch = PRESET_MESSAGES.find(p => p.text === contact.message);
      if (presetMatch) {
        // Exact match - select that preset
        setSelectedPresetMessage(presetMatch.id);
        setUseCustomMessage(false);
        setEditedPresetMessages({});
      } else {
        // Check if it's a personalized preset with name replaced
        const personalizedPreset = PRESET_MESSAGES.find(p => 
          p.personalized && contact.message === p.text.replace('{name}', contact.name)
        );
        if (personalizedPreset) {
          setSelectedPresetMessage(personalizedPreset.id);
          setUseCustomMessage(false);
          setEditedPresetMessages({});
        } else if (contact.message) {
          // Custom/edited message - load it into the first preset slot for editing
          setSelectedPresetMessage(1);
          setUseCustomMessage(false);
          setEditedPresetMessages({ 1: contact.message });
        } else {
          // No message - use default
          setSelectedPresetMessage(4);
          setUseCustomMessage(false);
          setEditedPresetMessages({});
        }
      }
    }
    setShowEditContactDialog(true);
  };

  // Delete contact
  const handleDeleteContact = (contact, e) => {
    e.stopPropagation();
    const updated = meetingContacts.filter(c => c.id !== contact.id);
    saveContacts(updated);
    setSnackbar({ open: true, message: 'Contact removed', severity: 'info' });
  };

  // Save new contact
  const handleSaveNewContact = () => {
    if (!contactName.trim()) return;
    
    // Use edited preset message if available, otherwise fall back to original preset or custom
    let message;
    if (useCustomMessage) {
      message = customMessage;
    } else if (editedPresetMessages[selectedPresetMessage] !== undefined) {
      message = editedPresetMessages[selectedPresetMessage];
    } else {
      message = PRESET_MESSAGES.find(p => p.id === selectedPresetMessage)?.text;
      // Replace {name} placeholder with actual contact name
      if (message && message.includes('{name}')) {
        message = message.replace('{name}', contactName.trim());
      }
    }
    
    const newContact = {
      id: Date.now().toString(),
      name: contactName.trim(),
      phone: contactPhone.trim(),
      message: message,
      presetId: selectedPresetMessage,
      location: includeLocation ? currentLocation : null,
    };
    
    saveContacts([...meetingContacts, newContact]);
    resetContactForm();
    setShowAddContactDialog(false);
    setSnackbar({ open: true, message: 'Contact added successfully', severity: 'success' });
  };

  // Update existing contact
  const handleUpdateContact = () => {
    if (!editingContact || (!contactName.trim() && !contactPhone.trim())) return;
    
    // Use edited preset message if available, otherwise fall back to original preset or custom
    let message;
    if (useCustomMessage) {
      message = customMessage;
    } else if (editedPresetMessages[selectedPresetMessage] !== undefined) {
      message = editedPresetMessages[selectedPresetMessage];
    } else {
      message = PRESET_MESSAGES.find(p => p.id === selectedPresetMessage)?.text;
      // Replace {name} placeholder with actual contact name
      if (message && message.includes('{name}')) {
        message = message.replace('{name}', contactName.trim());
      }
    }
    
    const updated = meetingContacts.map(c => 
      c.id === editingContact.id 
        ? { ...c, name: contactName.trim(), phone: contactPhone.trim(), message, presetId: selectedPresetMessage, location: includeLocation ? currentLocation : null }
        : c
    );
    
    saveContacts(updated);
    resetContactForm();
    setShowEditContactDialog(false);
    setEditingContact(null);
    setSnackbar({ open: true, message: 'Contact updated', severity: 'success' });
  };

  // Reset form
  const resetContactForm = () => {
    setContactName('');
    setContactPhone('');
    setSelectedPresetMessage(4); // Default to personalized message with name
    setCustomMessage('');
    setUseCustomMessage(false);
    setEditedPresetMessages({}); // Reset edited messages
    setIncludeLocation(false);
    setCurrentLocation(null);
  };

  // Navigate to AI support chat
  const handleSupportChat = () => {
    // Navigate to Pulse Agent chat with meeting context
    navigate('/chat/pulse-agent', { 
      state: { 
        fromMeeting: true, 
        meetingWith: meetingWith?.name || 'someone'
      } 
    });
  };

  // Handle end meeting - navigate to home
  const handleEndMeeting = () => {
    endMeeting();
    setShowEndMeetingConfirm(false);
    navigate('/home');
  };

  // Handle post-meeting feedback actions
  const handleTalkToAgent = () => {
    setShowPostMeetingFeedback(false);
    navigate('/chat/pulse-agent', { 
      state: { 
        fromMeeting: true, 
        meetingWith: meetingWith?.name || 'someone'
      } 
    });
  };

  const handleBlockReport = () => {
    setShowPostMeetingFeedback(false);
    // Navigate to chat with the person and open report dialog
    navigate('/chat', { state: { openReport: true, reportUser: meetingWith } });
  };

  const handleContinueApp = () => {
    setShowPostMeetingFeedback(false);
    navigate('/home');
  };

  // Handle SOS demo
  const handleSOSDemo = () => {
    setShowSOSDemo(true);
  };

  if (meetingState !== MEETING_STATE.ACTIVE) {
    return null;
  }

  // Get display contacts (max 3) + Add button
  const displayContacts = meetingContacts.slice(0, 3);

  // ============================================
  // MEETING TIME SCREEN - SPACING SPECIFICATION
  // ============================================
  // Container: fixed position between top bar (56px) and bottom nav (56px)
  // Content is vertically centered within the available space
  // 
  // LAYOUT CONSTANTS:
  // - Top bar height: 56px
  // - Bottom nav height: 56px  
  // - Horizontal padding: 16px (px: 2)
  // - Content max width: 400px
  // - Gap between components: 8px (gap: 1)
  //
  // COMPONENT HEIGHTS (approximate):
  // - Meeting card: ~80px
  // - WhatsApp section: ~140px
  // - Support button: ~56px
  // - Action buttons row: ~48px
  // - Demo button: ~32px
  // Total content: ~364px (fits in most screens without scrolling)
  // ============================================

  return (
    <Box 
      data-testid="meeting-time-screen"
      sx={{ 
        position: 'fixed',
        top: 56,  // Top bar height
        left: 0,
        right: 0,
        bottom: 56,  // Bottom nav height
        overflow: 'hidden',
        overflowY: 'hidden',
        overflowX: 'hidden',
        bgcolor: '#F8F9FA',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',  // Vertically center content
        alignItems: 'center',
        px: 2,  // 16px horizontal padding
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
      {/* Main Content - Fixed width, centered */}
      <Box sx={{ 
        width: '100%', 
        maxWidth: 400,  // Max content width
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 1,  // 8px gap between all components
      }}>
        
        {/* Motivational Message Card */}
        <Box sx={{ 
          width: '100%', 
          p: 1.5, 
          background: 'linear-gradient(135deg, #F3F0FF 0%, #E9E4FF 100%)',
          borderRadius: 2.5, 
          border: '2px solid #C4B5FD',
          textAlign: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
            <Box sx={{ 
              width: 32, height: 32, borderRadius: '50%', 
              background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7CF7 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={16} color="#fff" />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4C1D95', fontSize: '0.95rem' }}>
              Meeting with {meetingWith?.name || 'Someone'} ✓
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#6B21A8', lineHeight: 1.4, display: 'block', fontSize: '0.85rem' }}>
            💜 We're here so you can feel safe. Enjoy the moment!
          </Typography>
        </Box>

        {/* Quick Actions - WhatsApp Share Contacts */}
        <Box sx={{ width: '100%' }}>
          <Typography variant="overline" sx={{ 
            color: '#6B7280', fontWeight: 800, letterSpacing: 1.5, fontSize: '0.65rem', 
            display: 'block', textAlign: 'center', mb: 1,
          }}>
            SHARE LOCATION VIA WHATSAPP
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            {/* Contact buttons */}
            {displayContacts.map((contact) => (
              <Box
                key={contact.id}
                sx={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  p: 1.5, borderRadius: 2, bgcolor: '#fff', cursor: 'pointer',
                  boxShadow: contactsSharedLocation.includes(contact.id) 
                    ? '0 0 0 2px #8B5CF6, 0 2px 8px rgba(139, 92, 246, 0.2)' 
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  minWidth: 72,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
                }}
                onClick={() => handleShareLocation(contact)}
              >
                {/* Edit button - top left */}
                <IconButton 
                  size="small" 
                  onClick={(e) => handleEditContact(contact, e)} 
                  sx={{ position: 'absolute', top: 2, left: 2, p: 0.25 }}
                >
                  <Edit2 size={12} color="#9CA3AF" />
                </IconButton>
                {/* Delete button - top right */}
                <IconButton 
                  size="small" 
                  onClick={(e) => handleDeleteContact(contact, e)} 
                  sx={{ position: 'absolute', top: 2, right: 2, p: 0.25 }}
                >
                  <Trash2 size={12} color="#9CA3AF" />
                </IconButton>
                
                <Box sx={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: contactsSharedLocation.includes(contact.id) 
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                    : 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5,
                  boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)',
                }}>
                  {contactsSharedLocation.includes(contact.id) ? (
                    <MapPin size={22} color="#fff" />
                  ) : (
                    <Send size={20} color="#fff" />
                  )}
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '0.75rem', lineHeight: 1.2 }}>
                  {(contact.name || contact.phone?.slice(-4) || 'Contact').length > 7 
                    ? (contact.name || contact.phone?.slice(-4) || 'Contact').slice(0, 7) + '…' 
                    : (contact.name || contact.phone?.slice(-4) || 'Contact')}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: contactsSharedLocation.includes(contact.id) ? '#8B5CF6' : '#6C5CE7', 
                  fontSize: '0.65rem', fontWeight: 600, lineHeight: 1,
                }}>
                  {contactsSharedLocation.includes(contact.id) ? '✓ Sent' : 'Send'}
                </Typography>
              </Box>
            ))}

            {/* Add Contact button */}
            <Box 
              onClick={() => { resetContactForm(); setShowAddContactDialog(true); }} 
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                p: 1.5, borderRadius: 2, bgcolor: '#fff', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px dashed #D1D5DB', minWidth: 72,
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: '#6C5CE7', transform: 'translateY(-2px)' },
              }}
            >
              <Box sx={{
                width: 48, height: 48, borderRadius: '50%', bgcolor: '#F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5,
              }}>
                <UserPlus size={22} color="#6B7280" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '0.75rem' }}>
                Add
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Support Button */}
        <Box 
          onClick={handleSupportChat} 
          sx={{ 
            width: '100%', p: 1, borderRadius: 2, 
            background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
            border: '1px solid #C4B5FD', 
            display: 'flex', alignItems: 'center', 
            gap: 1, cursor: 'pointer', 
            transition: 'all 0.2s ease',
            '&:hover': { boxShadow: '0 4px 12px rgba(108, 92, 231, 0.15)' },
          }}
        >
          <Box sx={{ 
            width: 36, height: 36, borderRadius: '50%', 
            background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7CF7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={18} color="#fff" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4C1D95', fontSize: '0.85rem' }}>
              Need support? 💬
            </Typography>
            <Typography variant="caption" sx={{ color: '#7C3AED', display: 'block', fontSize: '0.7rem' }}>
              Chat with our digital assistant for support and advice
            </Typography>
          </Box>
          <MessageSquare size={18} color="#6C5CE7" />
        </Box>

        {/* End Meeting + SOS Row */}
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          {/* Show SOS status when active, otherwise show End Meeting + SOS buttons */}
          {sosState && sosState !== 'none' ? (
            <>
              {/* SOS Active Status */}
              <Box sx={{ 
                flex: 1, py: 1.5, px: 2, borderRadius: 2, 
                background: sosState === 'helper_arrived' 
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #8B5CF6 0%, #6C5CE7 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                  {sosState === 'searching' && '🔍 Searching for nearby help...'}
                  {sosState === 'helper_found' && '✅ Someone is on the way'}
                  {sosState === 'helper_approaching' && `🚶 Helper approaching${sosHelperDistance ? ` • ${sosHelperDistance < 0.1 ? '<100m' : `${sosHelperDistance.toFixed(1)}km`}` : ''}`}
                  {sosState === 'helper_arrived' && '🎉 Helper arrived!'}
                </Typography>
                {sosHelper && sosState !== 'searching' && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', mt: 0.25 }}>
                    {sosHelper.name}
                  </Typography>
                )}
              </Box>
              {/* Cancel SOS Button */}
              {sosState !== 'helper_arrived' && (
                <Button
                  variant="outlined"
                  onClick={cancelSOS}
                  data-testid="cancel-sos-button"
                  sx={{
                    py: 1, px: 2, borderRadius: 2, textTransform: 'none',
                    fontWeight: 600, fontSize: '0.85rem', 
                    borderColor: '#ef4444', color: '#ef4444',
                    '&:hover': { borderColor: '#dc2626', bgcolor: 'rgba(239, 68, 68, 0.05)' },
                  }}
                >
                  Cancel
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={() => setShowEndMeetingConfirm(true)}
                sx={{
                  flex: 1, py: 1, borderRadius: 2, textTransform: 'none',
                  fontWeight: 700, fontSize: '0.9rem', borderColor: '#6B7280', color: '#6B7280',
                  '&:hover': { borderColor: '#4B5563', bgcolor: 'rgba(107, 114, 128, 0.05)' },
                }}
              >
                End Meeting
              </Button>
              <Tooltip title="Emergency SOS - Instantly alert your emergency contacts and get help" arrow placement="top">
                <Button
                  variant="contained"
                  onClick={triggerSOS}
                  data-testid="sos-button"
                  sx={{
                    flex: 1, py: 1, borderRadius: 2, textTransform: 'none',
                    fontWeight: 700, fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                    '&:hover': { background: 'linear-gradient(135deg, #5B4CD6 0%, #9333ea 100%)' },
                  }}
                >
                  <Shield size={18} /> SOS
                </Button>
              </Tooltip>
            </>
          )}
        </Box>

        {/* Demo SOS Button - For Testing */}
        <Button
          variant="text"
          onClick={() => setShowSOSDemo(true)}
          sx={{
            mt: 0.5, textTransform: 'none', fontSize: '0.7rem',
            color: '#6B7280', fontWeight: 600, py: 0.5, px: 1.5,
            bgcolor: 'rgba(107, 114, 128, 0.08)',
            borderRadius: '16px',
            '&:hover': { bgcolor: 'rgba(107, 114, 128, 0.15)', color: '#4B5563' },
          }}
        >
          🧪 Test SOS Demo
        </Button>
      </Box>

      {/* Add Contact Dialog - Styled like Explorer */}
      <Dialog 
        open={showAddContactDialog} 
        onClose={() => { setShowAddContactDialog(false); resetContactForm(); }}
        PaperProps={{ sx: { borderRadius: '20px', maxWidth: 400, width: '95%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              width: 44, height: 44, borderRadius: '12px', 
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <UserPlus size={22} color="#fff" />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Add Contact</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Share your status via WhatsApp</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => { setShowAddContactDialog(false); resetContactForm(); }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField 
            fullWidth 
            label="Name" 
            value={contactName} 
            onChange={(e) => setContactName(e.target.value)} 
            sx={{ mb: 2, mt: 1 }} 
          />
          <TextField 
            fullWidth 
            label="Phone (with country code)" 
            value={contactPhone} 
            onChange={(e) => setContactPhone(e.target.value)} 
            placeholder="+972501234567"
            sx={{ mb: 2 }} 
          />
          
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a2e' }}>
            Choose a message (tap to edit)
          </Typography>
          
          {/* Message cards - All editable */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {PRESET_MESSAGES.map((preset) => {
              const isSelected = !useCustomMessage && selectedPresetMessage === preset.id;
              // Get the current text - either edited version or original with name replacement
              const originalText = preset.personalized && contactName 
                ? preset.text.replace('{name}', contactName) 
                : preset.text;
              const currentText = editedPresetMessages[preset.id] !== undefined 
                ? editedPresetMessages[preset.id] 
                : originalText;
              
              return (
                <Box
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetMessage(preset.id);
                    setUseCustomMessage(false);
                    // Initialize edited text if not already set
                    if (editedPresetMessages[preset.id] === undefined) {
                      setEditedPresetMessages(prev => ({ ...prev, [preset.id]: originalText }));
                    }
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #6C5CE7' : '1px solid #e2e8f0',
                    bgcolor: isSelected ? 'rgba(108,92,231,0.08)' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: isSelected ? '#6C5CE7' : '#cbd5e1',
                      bgcolor: isSelected ? 'rgba(108,92,231,0.08)' : '#f8fafc',
                    },
                  }}
                >
                  {isSelected ? (
                    <TextField
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={4}
                      value={currentText}
                      onChange={(e) => {
                        setEditedPresetMessages(prev => ({ ...prev, [preset.id]: e.target.value }));
                      }}
                      onClick={(e) => e.stopPropagation()}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      sx={{ 
                        '& .MuiInputBase-input': { 
                          fontSize: '0.85rem', 
                          p: 0,
                          color: '#6C5CE7',
                          fontWeight: 600,
                        } 
                      }}
                    />
                  ) : (
                    <Typography sx={{ 
                      fontSize: '0.85rem', 
                      color: '#374151',
                      fontWeight: 400,
                    }}>
                      {currentText}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
          
          {/* Share Location Toggle */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
            <Box
              onClick={handleLocationToggle}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                border: includeLocation ? '2px solid #10b981' : '1px solid #e2e8f0',
                bgcolor: includeLocation ? 'rgba(16,185,129,0.08)' : '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: includeLocation ? '#10b981' : '#cbd5e1',
                  bgcolor: includeLocation ? 'rgba(16,185,129,0.08)' : '#f8fafc',
                },
              }}
            >
              <Box sx={{ 
                width: 36, height: 36, borderRadius: '10px', 
                bgcolor: includeLocation ? '#10b981' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {locationLoading ? (
                  <Box sx={{ 
                    width: 18, height: 18, 
                    border: '2px solid #fff', 
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } }
                  }} />
                ) : (
                  <MapPin size={18} color={includeLocation ? '#fff' : '#64748b'} />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ 
                  fontWeight: 600, 
                  fontSize: '0.85rem',
                  color: includeLocation ? '#10b981' : '#374151',
                }}>
                  Share my location 📍
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {includeLocation 
                    ? 'Google Maps link will be added to message' 
                    : 'Add Google Maps link to your message'}
                </Typography>
              </Box>
              {includeLocation && (
                <Box sx={{ 
                  px: 1, py: 0.5, 
                  borderRadius: '6px', 
                  bgcolor: '#10b981', 
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}>
                  ON
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button 
            onClick={() => { setShowAddContactDialog(false); resetContactForm(); }}
            sx={{ 
              borderRadius: '12px', 
              textTransform: 'none', 
              fontWeight: 600,
              color: '#64748b',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveNewContact} 
            disabled={!contactName.trim() && !contactPhone.trim()}
            sx={{ 
              borderRadius: '12px', 
              textTransform: 'none', 
              fontWeight: 700,
              px: 3,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)' } 
            }}
          >
            Add Contact
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Contact Dialog - Styled like Explorer */}
      <Dialog 
        open={showEditContactDialog} 
        onClose={() => { setShowEditContactDialog(false); setEditingContact(null); resetContactForm(); }}
        PaperProps={{ sx: { borderRadius: '20px', maxWidth: 400, width: '95%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              width: 44, height: 44, borderRadius: '12px', 
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <MessageSquare size={22} color="#fff" />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Edit Contact</Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>Choose a message to send</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => { setShowEditContactDialog(false); setEditingContact(null); resetContactForm(); }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField 
            fullWidth 
            label="Name" 
            value={contactName} 
            onChange={(e) => setContactName(e.target.value)} 
            sx={{ mb: 2, mt: 1 }} 
          />
          <TextField 
            fullWidth 
            label="Phone (with country code)" 
            value={contactPhone} 
            onChange={(e) => setContactPhone(e.target.value)} 
            placeholder="+972501234567"
            sx={{ mb: 2 }} 
          />
          
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a2e' }}>
            Choose a message (tap to edit)
          </Typography>
          
          {/* Message cards - All editable */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {PRESET_MESSAGES.map((preset) => {
              const isSelected = !useCustomMessage && selectedPresetMessage === preset.id;
              // Get the current text - either edited version or original with name replacement
              const originalText = preset.personalized && contactName 
                ? preset.text.replace('{name}', contactName) 
                : preset.text;
              const currentText = editedPresetMessages[preset.id] !== undefined 
                ? editedPresetMessages[preset.id] 
                : originalText;
              
              return (
                <Box
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetMessage(preset.id);
                    setUseCustomMessage(false);
                    // Initialize edited text if not already set
                    if (editedPresetMessages[preset.id] === undefined) {
                      setEditedPresetMessages(prev => ({ ...prev, [preset.id]: originalText }));
                    }
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #6C5CE7' : '1px solid #e2e8f0',
                    bgcolor: isSelected ? 'rgba(108,92,231,0.08)' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: isSelected ? '#6C5CE7' : '#cbd5e1',
                      bgcolor: isSelected ? 'rgba(108,92,231,0.08)' : '#f8fafc',
                    },
                  }}
                >
                  {isSelected ? (
                    <TextField
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={4}
                      value={currentText}
                      onChange={(e) => {
                        setEditedPresetMessages(prev => ({ ...prev, [preset.id]: e.target.value }));
                      }}
                      onClick={(e) => e.stopPropagation()}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      sx={{ 
                        '& .MuiInputBase-input': { 
                          fontSize: '0.85rem', 
                          p: 0,
                          color: '#6C5CE7',
                          fontWeight: 600,
                        } 
                      }}
                    />
                  ) : (
                    <Typography sx={{ 
                      fontSize: '0.85rem', 
                      color: '#374151',
                      fontWeight: 400,
                    }}>
                      {currentText}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
          
          {/* Share Location Toggle */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
            <Box
              onClick={handleLocationToggle}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                border: includeLocation ? '2px solid #10b981' : '1px solid #e2e8f0',
                bgcolor: includeLocation ? 'rgba(16,185,129,0.08)' : '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: includeLocation ? '#10b981' : '#cbd5e1',
                  bgcolor: includeLocation ? 'rgba(16,185,129,0.08)' : '#f8fafc',
                },
              }}
            >
              <Box sx={{ 
                width: 36, height: 36, borderRadius: '10px', 
                bgcolor: includeLocation ? '#10b981' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {locationLoading ? (
                  <Box sx={{ 
                    width: 18, height: 18, 
                    border: '2px solid #fff', 
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } }
                  }} />
                ) : (
                  <MapPin size={18} color={includeLocation ? '#fff' : '#64748b'} />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ 
                  fontWeight: 600, 
                  fontSize: '0.85rem',
                  color: includeLocation ? '#10b981' : '#374151',
                }}>
                  Share my location 📍
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {includeLocation 
                    ? 'Google Maps link will be added to message' 
                    : 'Add Google Maps link to your message'}
                </Typography>
              </Box>
              {includeLocation && (
                <Box sx={{ 
                  px: 1, py: 0.5, 
                  borderRadius: '6px', 
                  bgcolor: '#10b981', 
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}>
                  ON
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button 
            onClick={() => { setShowEditContactDialog(false); setEditingContact(null); resetContactForm(); }}
            sx={{ 
              borderRadius: '12px', 
              textTransform: 'none', 
              fontWeight: 600,
              color: '#64748b',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateContact} 
            disabled={!contactName.trim() && !contactPhone.trim()}
            sx={{ 
              borderRadius: '12px', 
              textTransform: 'none', 
              fontWeight: 700,
              px: 3,
              bgcolor: '#6C5CE7', 
              '&:hover': { bgcolor: '#5B4CD6' } 
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* End Meeting Confirmation */}
      <Dialog 
        open={showEndMeetingConfirm} 
        onClose={() => setShowEndMeetingConfirm(false)} 
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 320, width: '90%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>End Meeting?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center' }}>
            Are you sure you want to end the meeting with {meetingWith?.name}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center', gap: 1 }}>
          <Button onClick={() => setShowEndMeetingConfirm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEndMeeting} sx={{ bgcolor: '#DC2626' }}>End Meeting</Button>
        </DialogActions>
      </Dialog>

      {/* Post-Meeting Feedback Dialog */}
      <Dialog 
        open={showPostMeetingFeedback} 
        onClose={() => {}}
        PaperProps={{ sx: { borderRadius: '20px', maxWidth: 360, width: '95%' } }}
      >
        <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
          <Box sx={{ 
            width: 56, height: 56, borderRadius: '50%', 
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 1.5,
          }}>
            <Heart size={28} color="#fff" />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e' }}>
            How was your meeting?
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            We hope you had a great time with {meetingWith?.name || 'your date'}! 💜
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Talk to Agent */}
            <Button
              fullWidth
              onClick={handleTalkToAgent}
              sx={{
                py: 1.5, borderRadius: '12px', textTransform: 'none',
                border: '1px solid #e2e8f0', bgcolor: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#6C5CE7' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ 
                  width: 36, height: 36, borderRadius: '10px', 
                  bgcolor: 'rgba(108,92,231,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MessageCircle size={18} color="#6C5CE7" />
                </Box>
                <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                  Talk to Pulse Agent
                </Typography>
              </Box>
              <ArrowRight size={18} color="#94a3b8" />
            </Button>

            {/* Block/Report */}
            <Button
              fullWidth
              onClick={handleBlockReport}
              sx={{
                py: 1.5, borderRadius: '12px', textTransform: 'none',
                border: '1px solid #e2e8f0', bgcolor: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ 
                  width: 36, height: 36, borderRadius: '10px', 
                  bgcolor: 'rgba(239,68,68,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ban size={18} color="#ef4444" />
                </Box>
                <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                  Block / Report User
                </Typography>
              </Box>
              <ArrowRight size={18} color="#94a3b8" />
            </Button>

            {/* Continue in App */}
            <Button
              fullWidth
              variant="contained"
              onClick={handleContinueApp}
              sx={{
                py: 1.5, borderRadius: '12px', textTransform: 'none',
                fontWeight: 700, fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #5B4CD6 0%, #9333ea 100%)' },
              }}
            >
              Continue in App ✨
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* SOS Demo Dialog - Full Flow Simulation */}
      <SOSDemoDialog 
        open={showSOSDemo} 
        onClose={() => setShowSOSDemo(false)}
        meetingWith={meetingWith}
        meetingContacts={meetingContacts}
      />

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
