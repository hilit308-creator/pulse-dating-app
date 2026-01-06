/**
 * SkeletonLoading - Skeleton loading components for better UX
 * 
 * Replaces spinners with content-shaped placeholders
 * that match the expected layout of the content being loaded.
 */

import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { keyframes } from '@mui/system';

// Shimmer animation
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Base skeleton style with shimmer
const skeletonStyle = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: `${shimmer} 1.5s infinite`,
};

/**
 * Card skeleton for profile/match cards
 */
export const CardSkeleton = ({ height = 400 }) => (
  <Box
    sx={{
      width: '100%',
      height,
      borderRadius: '20px',
      overflow: 'hidden',
      backgroundColor: '#f8fafc',
    }}
  >
    <Skeleton variant="rectangular" width="100%" height="70%" sx={skeletonStyle} />
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="60%" height={28} sx={skeletonStyle} />
      <Skeleton variant="text" width="40%" height={20} sx={{ ...skeletonStyle, mt: 1 }} />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="rounded" width={60} height={24} sx={skeletonStyle} />
        <Skeleton variant="rounded" width={80} height={24} sx={skeletonStyle} />
        <Skeleton variant="rounded" width={50} height={24} sx={skeletonStyle} />
      </Box>
    </Box>
  </Box>
);

/**
 * Chat list skeleton
 */
export const ChatListSkeleton = ({ count = 5 }) => (
  <Box sx={{ p: 2 }}>
    {Array.from({ length: count }).map((_, i) => (
      <Box
        key={i}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 1.5,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Skeleton variant="circular" width={56} height={56} sx={skeletonStyle} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="50%" height={20} sx={skeletonStyle} />
          <Skeleton variant="text" width="80%" height={16} sx={{ ...skeletonStyle, mt: 0.5 }} />
        </Box>
        <Skeleton variant="text" width={40} height={14} sx={skeletonStyle} />
      </Box>
    ))}
  </Box>
);

/**
 * Chat message skeleton
 */
export const ChatMessageSkeleton = ({ count = 6 }) => (
  <Box sx={{ p: 2 }}>
    {Array.from({ length: count }).map((_, i) => {
      const isMe = i % 3 === 0;
      const width = ['60%', '45%', '75%', '50%', '65%', '40%'][i % 6];
      return (
        <Box
          key={i}
          sx={{
            display: 'flex',
            justifyContent: isMe ? 'flex-end' : 'flex-start',
            mb: 2,
          }}
        >
          <Skeleton
            variant="rounded"
            width={width}
            height={isMe ? 40 : 50}
            sx={{
              ...skeletonStyle,
              borderRadius: '16px',
              backgroundColor: isMe ? 'rgba(108,92,231,0.1)' : '#f0f0f0',
            }}
          />
        </Box>
      );
    })}
  </Box>
);

/**
 * Settings list skeleton
 */
export const SettingsListSkeleton = ({ sections = 3, itemsPerSection = 3 }) => (
  <Box sx={{ p: 2 }}>
    {Array.from({ length: sections }).map((_, sectionIndex) => (
      <Box key={sectionIndex} sx={{ mb: 3 }}>
        {/* Section header */}
        <Skeleton variant="text" width={120} height={14} sx={{ ...skeletonStyle, mb: 1.5 }} />
        
        {/* Section container */}
        <Box
          sx={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: itemsPerSection }).map((_, itemIndex) => (
            <Box
              key={itemIndex}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderBottom: itemIndex < itemsPerSection - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <Skeleton variant="rounded" width={40} height={40} sx={skeletonStyle} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={18} sx={skeletonStyle} />
                <Skeleton variant="text" width="60%" height={14} sx={{ ...skeletonStyle, mt: 0.5 }} />
              </Box>
              <Skeleton variant="circular" width={20} height={20} sx={skeletonStyle} />
            </Box>
          ))}
        </Box>
      </Box>
    ))}
  </Box>
);

/**
 * Profile skeleton
 */
export const ProfileSkeleton = () => (
  <Box>
    {/* Header with avatar */}
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Skeleton
        variant="circular"
        width={100}
        height={100}
        sx={{ ...skeletonStyle, mx: 'auto' }}
      />
      <Skeleton variant="text" width={150} height={28} sx={{ ...skeletonStyle, mx: 'auto', mt: 2 }} />
      <Skeleton variant="text" width={100} height={18} sx={{ ...skeletonStyle, mx: 'auto', mt: 0.5 }} />
    </Box>
    
    {/* Stats */}
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4 }}>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ textAlign: 'center' }}>
          <Skeleton variant="text" width={40} height={24} sx={{ ...skeletonStyle, mx: 'auto' }} />
          <Skeleton variant="text" width={60} height={14} sx={{ ...skeletonStyle, mx: 'auto', mt: 0.5 }} />
        </Box>
      ))}
    </Box>
    
    {/* Bio */}
    <Box sx={{ px: 3 }}>
      <Skeleton variant="rounded" width="100%" height={80} sx={{ ...skeletonStyle, borderRadius: '12px' }} />
    </Box>
  </Box>
);

/**
 * Points balance skeleton
 */
export const PointsBalanceSkeleton = () => (
  <Box
    sx={{
      backgroundColor: '#fff',
      borderRadius: '20px',
      p: 3,
      textAlign: 'center',
    }}
  >
    <Skeleton variant="circular" width={40} height={40} sx={{ ...skeletonStyle, mx: 'auto' }} />
    <Skeleton variant="text" width={80} height={48} sx={{ ...skeletonStyle, mx: 'auto', mt: 1 }} />
    <Skeleton variant="text" width={60} height={18} sx={{ ...skeletonStyle, mx: 'auto' }} />
  </Box>
);

/**
 * Feature cards skeleton
 */
export const FeatureCardsSkeleton = ({ count = 4 }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {Array.from({ length: count }).map((_, i) => (
      <Box
        key={i}
        sx={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="rounded" width={48} height={48} sx={skeletonStyle} />
          <Box>
            <Skeleton variant="text" width={100} height={18} sx={skeletonStyle} />
            <Skeleton variant="text" width={80} height={14} sx={{ ...skeletonStyle, mt: 0.5 }} />
          </Box>
        </Box>
        <Skeleton variant="rounded" width={80} height={36} sx={skeletonStyle} />
      </Box>
    ))}
  </Box>
);

/**
 * Generic list item skeleton
 */
export const ListItemSkeleton = ({ hasAvatar = true, hasSubtitle = true }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 2,
    }}
  >
    {hasAvatar && (
      <Skeleton variant="rounded" width={48} height={48} sx={skeletonStyle} />
    )}
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="50%" height={18} sx={skeletonStyle} />
      {hasSubtitle && (
        <Skeleton variant="text" width="70%" height={14} sx={{ ...skeletonStyle, mt: 0.5 }} />
      )}
    </Box>
  </Box>
);

export default {
  CardSkeleton,
  ChatListSkeleton,
  ChatMessageSkeleton,
  SettingsListSkeleton,
  ProfileSkeleton,
  PointsBalanceSkeleton,
  FeatureCardsSkeleton,
  ListItemSkeleton,
};
