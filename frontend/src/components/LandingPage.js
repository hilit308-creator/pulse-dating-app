import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff4081 0%, #3f51b5 100%)',
      py: 4
    }}>
      <Container>
        <Grid container spacing={4}>
          {/* Hero Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ color: 'white', mt: { xs: 4, md: 8 } }}>
              <Typography variant="h2" component="h1" gutterBottom>
                Find Your Perfect Match
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 300 }}>
                Connect with people who share your interests in real-time
              </Typography>
              <Box sx={{ 
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    bgcolor: 'white',
                    color: '#ff4081',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                    },
                    px: 4
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.9)',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                    px: 4
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Features Section */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.9)' }}>
                  <CardContent>
                    <IconButton sx={{ bgcolor: '#ff4081', color: 'white', mb: 2 }}>
                      <LocationIcon />
                    </IconButton>
                    <Typography variant="h6" gutterBottom>
                      Real-time Location
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Find matches nearby and connect instantly
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.9)' }}>
                  <CardContent>
                    <IconButton sx={{ bgcolor: '#3f51b5', color: 'white', mb: 2 }}>
                      <ChatIcon />
                    </IconButton>
                    <Typography variant="h6" gutterBottom>
                      Instant Chat
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start conversations with your matches
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.9)' }}>
                  <CardContent>
                    <IconButton sx={{ bgcolor: '#ff4081', color: 'white', mb: 2 }}>
                      <PersonIcon />
                    </IconButton>
                    <Typography variant="h6" gutterBottom>
                      Detailed Profiles
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Share your interests and preferences
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.9)' }}>
                  <CardContent>
                    <IconButton sx={{ bgcolor: '#3f51b5', color: 'white', mb: 2 }}>
                      <FavoriteIcon />
                    </IconButton>
                    <Typography variant="h6" gutterBottom>
                      Perfect Matches
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Find people who share your interests
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
