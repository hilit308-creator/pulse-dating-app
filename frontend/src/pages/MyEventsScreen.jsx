/**
 * MyEventsScreen - Shows events the user has registered to
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
} from '@mui/material';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Heart, UserCheck, ThumbsUp } from 'lucide-react';
import { Stack } from '@mui/material';

// Mock data for registered events
const MY_EVENTS = [
  {
    id: 1,
    title: "Sunset Yoga on the Beach",
    date: "Sat, Dec 28",
    time: "17:00",
    location: "Gordon Beach, Tel Aviv",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=800&q=80",
    attendeesCount: 24,
    matchingAttendeesCount: 8,
    likesCount: 3,
    category: "Wellness",
  },
  {
    id: 2,
    title: "Tech Networking Mixer",
    date: "Sun, Dec 29",
    time: "19:00",
    location: "WeWork Sarona, Tel Aviv",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    attendeesCount: 56,
    matchingAttendeesCount: 12,
    likesCount: 5,
    category: "Networking",
  },
  {
    id: 3,
    title: "Wine Tasting Evening",
    date: "Tue, Dec 31",
    time: "20:00",
    location: "Jaffa Wine Bar",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    attendeesCount: 18,
    matchingAttendeesCount: 5,
    likesCount: 2,
    category: "Social",
  },
  {
    id: 4,
    title: "New Year's Eve Party",
    date: "Tue, Dec 31",
    time: "22:00",
    location: "Clara Rooftop, Tel Aviv",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    attendeesCount: 120,
    matchingAttendeesCount: 28,
    likesCount: 8,
    category: "Party",
  },
];

const MyEventsScreen = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleEventClick = (event) => {
    navigate(`/events/${event.id}/attendees`, {
      state: { event },
    });
  };

  const handleViewAttendees = (event, e) => {
    e.stopPropagation();
    navigate(`/events/${event.id}/attendees`, {
      state: { event, viewType: 'discover' },
    });
  };

  const handleViewMatches = (event, e) => {
    e.stopPropagation();
    navigate(`/events/${event.id}/matches`, {
      state: { event },
    });
  };

  const handleViewLikes = (event, e) => {
    e.stopPropagation();
    navigate(`/events/${event.id}/likes`, {
      state: { event },
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#fafbfc',
        pb: 'calc(88px + env(safe-area-inset-bottom, 0px))',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 2,
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
            My Events
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          {MY_EVENTS.length} events you're attending
        </Typography>
      </Box>

      {/* Events List */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {MY_EVENTS.map((event) => (
          <Card
            key={event.id}
            onClick={() => handleEventClick(event)}
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              },
            }}
          >
            <CardMedia
              component="img"
              height="140"
              image={event.image}
              alt={event.title}
            />
            <CardContent sx={{ p: 2 }}>
              {/* Category chip */}
              <Chip
                label={event.category}
                size="small"
                sx={{
                  mb: 1,
                  backgroundColor: 'rgba(108,92,231,0.1)',
                  color: '#6C5CE7',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />

              {/* Title */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a2e',
                  mb: 1,
                  lineHeight: 1.3,
                }}
              >
                {event.title}
              </Typography>

              {/* Date & Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Calendar size={14} color="#64748b" />
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {event.date} · {event.time}
                </Typography>
              </Box>

              {/* Location */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                <MapPin size={14} color="#64748b" />
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  {event.location}
                </Typography>
              </Box>

              {/* Attendees info */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pt: 1.5,
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Users size={16} color="#64748b" />
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {event.attendeesCount} attending
                  </Typography>
                </Box>
                
                {/* Matching attendees highlight */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 999,
                    backgroundColor: 'rgba(34,197,94,0.1)',
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: '#16a34a', fontWeight: 600 }}
                  >
                    {event.matchingAttendeesCount} matches
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {/* Attendees Button - Discover style */}
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Users size={16} />}
                  onClick={(e) => handleViewAttendees(event, e)}
                  sx={{
                    py: 1.25,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a4296 100%)',
                    },
                  }}
                >
                  View {event.attendeesCount} Attendees
                </Button>

                {/* Matches Button */}
                {event.matchingAttendeesCount > 0 && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<UserCheck size={16} />}
                    onClick={(e) => handleViewMatches(event, e)}
                    sx={{
                      py: 1.25,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#667eea',
                      color: '#667eea',
                      background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)',
                        borderColor: '#5568d3',
                      },
                    }}
                  >
                    {event.matchingAttendeesCount} Matches
                  </Button>
                )}

                {/* Likes Button - People who liked you */}
                {event.likesCount > 0 && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Heart size={16} />}
                    onClick={(e) => handleViewLikes(event, e)}
                    sx={{
                      py: 1.25,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#f093fb',
                      color: '#f093fb',
                      background: 'linear-gradient(135deg, rgba(240,147,251,0.08) 0%, rgba(245,87,108,0.08) 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(240,147,251,0.15) 0%, rgba(245,87,108,0.15) 100%)',
                        borderColor: '#e879f9',
                      },
                    }}
                  >
                    {event.likesCount} Interested in You
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Empty state */}
      {MY_EVENTS.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
            py: 8,
            textAlign: 'center',
          }}
        >
          <Calendar size={64} color="#cbd5e1" />
          <Typography
            variant="h6"
            sx={{ mt: 2, fontWeight: 700, color: '#1a1a2e' }}
          >
            No events yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
            No events nearby right now.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MyEventsScreen;
