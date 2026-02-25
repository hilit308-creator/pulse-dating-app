import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  Box,
  IconButton,
  Badge,
  Avatar,
} from '@mui/material';
import {
  Message as MessageIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';
import { API_URL, updateUserLocation } from '../config/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('pulse_access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Connect to WebSocket
    const newSocket = io(API_URL);
    setSocket(newSocket);

    // Get user's location and start updating
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (position) => updateLocation(position.coords),
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (newSocket) newSocket.close();
    };
  }, []);

  const updateLocation = async (coords) => {
    const token = localStorage.getItem('pulse_access_token');
    if (!token) {
      console.warn('[Dashboard] No token, skipping location update');
      return;
    }
    try {
      const result = await updateUserLocation(coords.latitude, coords.longitude, token);
      if (!result.success) {
        console.error('[Dashboard] Location update failed:', result.error);
      }
    } catch (error) {
      console.error('[Dashboard] Error updating location:', error);
    }
  };

  const handleActiveToggle = () => {
    setIsActive(!isActive);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => updateLocation(position.coords),
        (error) => console.error('Error getting location:', error)
      );
    }
  };

  const fetchNearbyUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/nearby-users`, {
        params: {
          user_id: localStorage.getItem('userId'),
          radius: 5 // 5km radius
        }
      });
      setNearbyUsers(response.data);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchNearbyUsers();
      const interval = setInterval(fetchNearbyUsers, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const handleMessage = (userId) => {
    // TODO: Implement messaging functionality
    console.log('Message user:', userId);
  };

  return (
    <Container>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Dashboard</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography>Active Status</Typography>
            <Switch
              checked={isActive}
              onChange={handleActiveToggle}
              color="primary"
            />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {nearbyUsers.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar>{user.first_name[0]}</Avatar>
                  <Typography variant="h6">{user.first_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationIcon color="primary" />
                  <Typography variant="body2">{user.distance} km away</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {user.approach_preferences}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={() => handleMessage(user.id)} color="primary">
                    <MessageIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
