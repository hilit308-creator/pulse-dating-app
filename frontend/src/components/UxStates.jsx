/**
 * UX States - Empty, Loading, and Error States
 * 
 * Per Spec Section 10:
 * 
 * Discover States:
 * - Empty: "We're finding the right moments for you"
 * - No permission (location): hide distance, show city only
 * 
 * Events States:
 * - No events: CTA to discover events
 * - Past events: archived, no matches shown
 * 
 * Chat States:
 * - AI disabled: hide AI buttons
 * - Event expired: countdown removed
 */

import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Calendar, 
  MapPin, 
  MessageCircle, 
  Search,
  Sparkles,
  Heart,
} from 'lucide-react';

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

/**
 * DiscoverEmptyState - "We're finding the right moments for you"
 */
export function DiscoverEmptyState({ onRefresh }) {
  return (
    <motion.div {...fadeIn}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          px: 4,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            boxShadow: '0 8px 24px rgba(108,92,231,0.3)',
          }}
        >
          <Compass size={36} color="white" />
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1a1a2e',
            mb: 1,
          }}
        >
          We're finding the right moments for you
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mb: 4,
            maxWidth: 280,
          }}
        >
          Check back soon — new people are joining your area
        </Typography>

        {onRefresh && (
          <Button
            variant="outlined"
            onClick={onRefresh}
            sx={{
              borderRadius: '12px',
              borderColor: '#6C5CE7',
              color: '#6C5CE7',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Refresh
          </Button>
        )}
      </Box>
    </motion.div>
  );
}

/**
 * DiscoverLoadingState - Loading skeleton for discover
 */
export function DiscoverLoadingState() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        px: 4,
      }}
    >
      <CircularProgress
        size={48}
        sx={{ color: '#6C5CE7', mb: 3 }}
      />
      <Typography
        variant="body2"
        sx={{ color: '#64748b' }}
      >
        Finding people near you...
      </Typography>
    </Box>
  );
}

/**
 * LocationPermissionState - No location permission
 */
export function LocationPermissionState({ onRequestPermission }) {
  return (
    <motion.div {...fadeIn}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          px: 4,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '24px',
            backgroundColor: 'rgba(108,92,231,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <MapPin size={36} color="#6C5CE7" />
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1a1a2e',
            mb: 1,
          }}
        >
          Enable location to see nearby people
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mb: 4,
            maxWidth: 280,
          }}
        >
          We'll show you people in your area without sharing your exact location
        </Typography>

        <Button
          variant="contained"
          onClick={onRequestPermission}
          startIcon={<MapPin size={18} />}
          sx={{
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
          }}
        >
          Enable Location
        </Button>
      </Box>
    </motion.div>
  );
}

/**
 * EventsEmptyState - No events available
 */
export function EventsEmptyState({ onDiscoverEvents }) {
  return (
    <motion.div {...fadeIn}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          px: 4,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '24px',
            backgroundColor: 'rgba(108,92,231,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Calendar size={36} color="#6C5CE7" />
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1a1a2e',
            mb: 1,
          }}
        >
          No upcoming events
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mb: 4,
            maxWidth: 280,
          }}
        >
          Discover events happening near you and meet people with shared interests
        </Typography>

        <Button
          variant="contained"
          onClick={onDiscoverEvents}
          startIcon={<Search size={18} />}
          sx={{
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
          }}
        >
          Discover Events
        </Button>
      </Box>
    </motion.div>
  );
}

/**
 * ChatsEmptyState - No chats yet
 */
export function ChatsEmptyState({ onStartMatching }) {
  return (
    <motion.div {...fadeIn}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          px: 4,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '24px',
            backgroundColor: 'rgba(108,92,231,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <MessageCircle size={36} color="#6C5CE7" />
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1a1a2e',
            mb: 1,
          }}
        >
          No conversations yet
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mb: 4,
            maxWidth: 280,
          }}
        >
          Start matching to begin conversations with people you connect with
        </Typography>

        <Button
          variant="contained"
          onClick={onStartMatching}
          startIcon={<Heart size={18} />}
          sx={{
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
          }}
        >
          Start Matching
        </Button>
      </Box>
    </motion.div>
  );
}

/**
 * MatchesEmptyState - No matches yet
 */
export function MatchesEmptyState({ onKeepSwiping }) {
  return (
    <motion.div {...fadeIn}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          px: 4,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            boxShadow: '0 8px 24px rgba(108,92,231,0.3)',
          }}
        >
          <Sparkles size={36} color="white" />
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1a1a2e',
            mb: 1,
          }}
        >
          No matches yet
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mb: 4,
            maxWidth: 280,
          }}
        >
          Keep exploring — your next connection could be just a swipe away
        </Typography>

        <Button
          variant="contained"
          onClick={onKeepSwiping}
          sx={{
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
          }}
        >
          Keep Exploring
        </Button>
      </Box>
    </motion.div>
  );
}

/**
 * ErrorState - Generic error state
 */
export function ErrorState({ message, onRetry }) {
  return (
    <motion.div {...fadeIn}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40vh',
          px: 4,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: '#ef4444',
            mb: 2,
          }}
        >
          {message || 'Something went wrong'}
        </Typography>

        {onRetry && (
          <Button
            variant="outlined"
            onClick={onRetry}
            sx={{
              borderRadius: '12px',
              borderColor: '#6C5CE7',
              color: '#6C5CE7',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Try Again
          </Button>
        )}
      </Box>
    </motion.div>
  );
}

export default {
  DiscoverEmptyState,
  DiscoverLoadingState,
  LocationPermissionState,
  EventsEmptyState,
  ChatsEmptyState,
  MatchesEmptyState,
  ErrorState,
};
