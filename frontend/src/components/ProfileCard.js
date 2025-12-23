import React, { useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import {
  Favorite as FavoriteIcon,
  Chat as ChatIcon,
  EmojiEmotions as EmojiIcon,
  Send as RocketIcon,
  WavesOutlined as WavesIcon,
  DoNotDisturb as NoInitiateIcon,
} from '@mui/icons-material';

// Animations
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 345,
  borderRadius: 20,
  overflow: 'visible',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const PhotoContainer = styled(Box)({
  position: 'relative',
  paddingTop: '133%', // 4:3 aspect ratio
  borderRadius: '20px 20px 0 0',
  overflow: 'hidden',
});

const StyledMedia = styled(CardMedia)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const OpeningStyleIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '50%',
  padding: 8,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
  zIndex: 1,
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  padding: '16px',
}));

const StyledChip = styled(Chip)(({ color }) => ({
  borderRadius: 12,
  fontWeight: 500,
  background: color,
  color: '#fff',
  '&:hover': {
    transform: 'scale(1.05)',
    background: color,
  },
}));

const SuperLikeButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: -20,
  right: 16,
  background: 'linear-gradient(45deg, #FF4B91, #FF0676)',
  color: '#fff',
  padding: 12,
  boxShadow: '0 4px 12px rgba(255, 6, 118, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF0676, #FF4B91)',
    animation: `${pulseAnimation} 1.5s infinite`,
  },
}));

const ProfileCard = ({ profile }) => {
  const [isLiked, setIsLiked] = useState(false);

  const getOpeningStyleIcon = (style) => {
    switch (style) {
      case 'initiator':
        return <RocketIcon />;
      case 'receiver':
        return <ChatIcon />;
      case 'flexible':
        return <WavesIcon />;
      case 'selective':
        return <NoInitiateIcon />;
      default:
        return <EmojiIcon />;
    }
  };

  const getTagColor = (category) => {
    const colors = {
      art: '#FF4B91',
      music: '#4B4BFF',
      fitness: '#4BC970',
      travel: '#FFB347',
      books: '#9747FF',
      gaming: '#47B5FF',
    };
    return colors[category.toLowerCase()] || '#FF4B91';
  };

  const handleSuperLike = () => {
    setIsLiked(true);
    // Add your super like logic here
  };

  return (
    <StyledCard>
      <PhotoContainer>
        <StyledMedia
          component="img"
          image={profile.photoUrl}
          alt={profile.firstName}
        />
        <OpeningStyleIcon>
          <Tooltip 
            title={profile.openingPreference.description}
            TransitionComponent={Zoom}
            arrow
          >
            {getOpeningStyleIcon(profile.openingPreference.type)}
          </Tooltip>
        </OpeningStyleIcon>
      </PhotoContainer>

      <Box sx={{ p: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {profile.firstName}, {profile.age}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {profile.distance} km away • {profile.profession}
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            fontStyle: 'italic',
            mb: 2,
            color: 'text.primary',
          }}
        >
          "{profile.personalLine}"
        </Typography>

        <TagsContainer>
          {profile.interests.map((interest, index) => (
            <StyledChip
              key={index}
              label={interest.name}
              icon={interest.icon}
              color={getTagColor(interest.category)}
            />
          ))}
        </TagsContainer>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 1 
          }}
        >
          {getOpeningStyleIcon(profile.openingPreference.type)}
          {profile.openingPreference.description}
        </Typography>
      </Box>

      <SuperLikeButton
        onClick={handleSuperLike}
        disabled={isLiked}
      >
        <FavoriteIcon />
      </SuperLikeButton>
    </StyledCard>
  );
};

export default ProfileCard;
