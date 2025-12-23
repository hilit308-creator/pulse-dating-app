import React from 'react';
import { Container, Box } from '@mui/material';
import ProfileCard from './ProfileCard';
import {
  Brush as ArtIcon,
  MusicNote as MusicIcon,
  FitnessCenter as YogaIcon,
  MenuBook as BooksIcon,
  FlightTakeoff as TravelIcon,
  SportsEsports as GamingIcon,
} from '@mui/icons-material';

const sampleProfile = {
  firstName: 'Noa',
  age: 26,
  distance: 2.3,
  profession: 'Graphic Designer',
  photoUrl: 'https://source.unsplash.com/random/400x600/?portrait,woman',
  personalLine: "If you're into French films and espresso in the garden – we might just match.",
  interests: [
    { name: 'Art', icon: <ArtIcon />, category: 'art' },
    { name: 'Music', icon: <MusicIcon />, category: 'music' },
    { name: 'Yoga', icon: <YogaIcon />, category: 'fitness' },
    { name: 'Books', icon: <BooksIcon />, category: 'books' },
    { name: 'Travel', icon: <TravelIcon />, category: 'travel' },
    { name: 'Gaming', icon: <GamingIcon />, category: 'gaming' },
  ],
  openingPreference: {
    type: 'selective',
    description: "99% of the time I won't make the first move… unless you're really worth it 😉"
  }
};

const ProfileCardDemo = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <ProfileCard profile={sampleProfile} />
      </Box>
    </Container>
  );
};

export default ProfileCardDemo;
