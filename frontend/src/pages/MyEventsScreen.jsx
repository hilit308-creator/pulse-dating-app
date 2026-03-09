/**
 * MyEventsScreen - Shows events the user has registered to
 * Synced with EventsByCategory - uses same EVENTS data and purchased localStorage
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
} from '@mui/material';
import { Calendar, MapPin, Users, Heart, UserCheck } from 'lucide-react';
import { Stack } from '@mui/material';
import { EVENTS, DEMO_ATTENDEES } from './EventsByCategory';

// Format date for display (e.g., "Thu · May 30")
const formatEventDate = (dateStr, time = "21:00") => {
  const d = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
};

// Transform EVENTS data to MyEvents format
const transformEventToMyEvent = (event) => {
  const attendeesList = (event.attendees || []).map(id => DEMO_ATTENDEES.find(a => a.id === id)).filter(Boolean);
  const matchingAttendees = attendeesList.filter(a => a.isMatch);
  // "Likes" = non-match attendees (people who liked you but you haven't matched yet)
  const likesAttendees = attendeesList.filter(a => !a.isMatch);
  
  return {
    id: event.id,
    title: event.title,
    date: formatEventDate(event.date, event.time),
    time: event.time,
    location: `${event.venue}, ${event.region}`,
    image: event.cover,
    attendeesCount: attendeesList.length || event.capacity || 0,
    matchingAttendeesCount: matchingAttendees.length,
    likesCount: likesAttendees.length, // Synced with real data
    category: event.category === 'large' ? 'Party' : 
              event.category === 'small' ? 'Social' : 
              event.category === 'twist' ? 'Experience' : 
              event.category === 'sports' ? 'Sports' : 'Event',
  };
};

const MyEventsScreen = () => {
  const navigate = useNavigate();
  
  // Get purchased events from localStorage (synced with EventsByCategory)
  const [purchased, setPurchased] = useState(() => {
    try {
      const raw = localStorage.getItem("event_purchased");
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  // Listen for localStorage changes (when user buys tickets in EventsByCategory)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const raw = localStorage.getItem("event_purchased");
        setPurchased(new Set(raw ? JSON.parse(raw) : []));
      } catch {
        // ignore
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also check on focus (for same-tab updates)
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Filter and transform purchased events
  const myEvents = useMemo(() => {
    return EVENTS
      .filter(ev => purchased.has(String(ev.id)))
      .map(transformEventToMyEvent);
  }, [purchased]);

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
          {myEvents.length} events you're attending
        </Typography>
      </Box>

      {/* Events List */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {myEvents.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
            }}
          >
            <Calendar size={48} color="#cbd5e1" />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: '#1a1a2e' }}>
              No events yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
              Browse events and buy tickets to see them here
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/events')}
              sx={{
                mt: 3,
                py: 1.25,
                px: 4,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Browse Events
            </Button>
          </Box>
        ) : myEvents.map((event) => (
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
    </Box>
  );
};

export default MyEventsScreen;
