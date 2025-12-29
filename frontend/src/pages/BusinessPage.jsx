// BusinessPage.jsx - Business/Venue Page
// Dynamic business card - source for events, connection point between place ↔ people ↔ moments
// No dating features on this page

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Bookmark,
  ExternalLink,
  Users,
  Star,
} from "lucide-react";

/* ------------------------------ Constants --------------------------------- */
const SAFE_BOTTOM = 'calc(88px + env(safe-area-inset-bottom, 0px))';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Mock businesses data
const MOCK_BUSINESSES = {
  1: {
    id: 1,
    name: "Yarkon Park Yoga Studio",
    category: "Studio",
    coverImage: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
    address: "Yarkon Park, Tel Aviv",
    description: "A peaceful outdoor yoga space in the heart of the park. We offer daily classes for all levels, from sunrise sessions to sunset flows. Our community is welcoming and diverse.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0853,34.7818&zoom=15&size=400x200&key=demo",
    upcomingEvents: [
      {
        id: 1,
        name: "Sunset Yoga Session",
        date: "Tonight",
        time: "18:00 - 19:30",
      },
      {
        id: 2,
        name: "Morning Flow",
        date: "Tomorrow",
        time: "07:00 - 08:00",
      },
    ],
  },
  2: {
    id: 2,
    name: "Gallery 23",
    category: "Venue",
    coverImage: "https://images.unsplash.com/photo-1577720643272-265f09367456?auto=format&fit=crop&w=1200&q=80",
    address: "Rothschild Blvd 23, Tel Aviv",
    description: "Contemporary art gallery featuring local and international artists. We host regular exhibitions, art talks, and social events. A perfect spot for culture lovers.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0636,34.7705&zoom=15&size=400x200&key=demo",
    upcomingEvents: [
      {
        id: 3,
        name: "Art & Wine Evening",
        date: "Tomorrow",
        time: "20:00 - 23:00",
      },
    ],
  },
  3: {
    id: 3,
    name: "Cafe Aroma",
    category: "Cafe",
    coverImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    address: "Dizengoff 99, Tel Aviv",
    description: "Cozy neighborhood cafe with great coffee and a relaxed atmosphere. Perfect for working, reading, or meeting friends. We're known for our homemade pastries.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0780,34.7740&zoom=15&size=400x200&key=demo",
    upcomingEvents: [],
  },
};

/* ------------------------------ Components -------------------------------- */

// Event Card (mini version for business page)
function EventCard({ event, onViewEvent }) {
  return (
    <Box
      onClick={() => onViewEvent(event)}
      sx={{
        backgroundColor: 'rgba(108,92,231,0.04)',
        borderRadius: '14px',
        p: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid rgba(108,92,231,0.08)',
        '&:hover': {
          backgroundColor: 'rgba(108,92,231,0.08)',
        },
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: '#1a1a2e',
          mb: 0.5,
        }}
      >
        {event.name}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Calendar size={14} color="#6C5CE7" />
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {event.date}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Clock size={14} color="#6C5CE7" />
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {event.time}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/* ------------------------------ Main Screen ------------------------------- */
export default function BusinessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  // Get business ID from params or location state
  const businessId = id || location.state?.businessId;
  
  const [business, setBusiness] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Load business data
  useEffect(() => {
    if (!businessId) {
      navigate(-1);
      return;
    }

    // Load mock business (in real app, fetch from API)
    const businessData = MOCK_BUSINESSES[businessId];
    if (!businessData) {
      navigate(-1);
      return;
    }

    setBusiness(businessData);
    trackEvent("business_page_viewed", { businessId });
  }, [businessId, navigate]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle view event
  const handleViewEvent = useCallback((event) => {
    trackEvent("business_event_clicked", { eventId: event.id, businessId });
    navigate("/nearby/event", {
      state: {
        eventId: event.id,
        fromBusiness: business?.name,
      },
    });
  }, [navigate, businessId, business]);

  // Handle view all events
  const handleViewEvents = useCallback(() => {
    trackEvent("business_view_events_clicked", { businessId });
    navigate("/events");
  }, [navigate, businessId]);

  // Handle save place
  const handleSavePlace = useCallback(() => {
    trackEvent("business_saved", { businessId });
    setIsSaved(true);
    // TODO: Implement actual save logic
  }, [businessId]);

  if (!business) {
    return null; // Loading or redirecting
  }

  const hasEvents = business.upcomingEvents && business.upcomingEvents.length > 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fafbfc",
        pb: SAFE_BOTTOM,
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 280,
        }}
      >
        {/* Cover Image */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${business.coverImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        {/* Gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)",
          }}
        />

        {/* Back button */}
        <IconButton
          onClick={handleBack}
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(4px)",
            '&:hover': {
              backgroundColor: "#fff",
            },
          }}
        >
          <ArrowLeft size={20} color="#1a1a2e" />
        </IconButton>

        {/* Business info overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: 3,
          }}
        >
          {/* Category badge */}
          <Chip
            label={business.category}
            size="small"
            sx={{
              backgroundColor: "rgba(255,255,255,0.9)",
              color: "#6C5CE7",
              fontWeight: 600,
              mb: 1,
            }}
          />
          
          {/* Business name */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#fff",
              mb: 0.5,
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {business.name}
          </Typography>

          {/* Location */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <MapPin size={16} color="#fff" />
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {business.address}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: 3 }}>
        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#1a1a2e",
                mb: 1,
              }}
            >
              About
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                lineHeight: 1.7,
              }}
            >
              {business.description}
            </Typography>
          </Box>
        </motion.div>

        {/* Upcoming Events Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#1a1a2e",
                mb: 2,
              }}
            >
              Upcoming Events
            </Typography>

            {hasEvents ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {business.upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onViewEvent={handleViewEvent}
                  />
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  backgroundColor: "rgba(0,0,0,0.02)",
                  borderRadius: "14px",
                  p: 3,
                  textAlign: "center",
                }}
              >
                <Calendar size={24} color="#94a3b8" style={{ marginBottom: 8 }} />
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  No upcoming events
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#94a3b8" }}
                >
                  Follow to get updates
                </Typography>
              </Box>
            )}
          </Box>
        </motion.div>

        {/* Social Proof (soft) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Box
            sx={{
              backgroundColor: "rgba(108,92,231,0.04)",
              borderRadius: "14px",
              p: 2.5,
              mb: 4,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                backgroundColor: "rgba(108,92,231,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={20} color="#6C5CE7" />
            </Box>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#1a1a2e" }}
              >
                Popular this week
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#64748b" }}
              >
                People like you come here
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {hasEvents ? (
            <Button
              fullWidth
              variant="contained"
              onClick={handleViewEvents}
              endIcon={<ExternalLink size={18} />}
              sx={{
                py: 1.5,
                borderRadius: "14px",
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                background: "linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)",
                boxShadow: "0 4px 20px rgba(108,92,231,0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)",
                },
              }}
            >
              View Events
            </Button>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              onClick={handleSavePlace}
              disabled={isSaved}
              startIcon={<Bookmark size={18} />}
              sx={{
                py: 1.5,
                borderRadius: "14px",
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                borderColor: isSaved ? "#22c55e" : "#6C5CE7",
                color: isSaved ? "#22c55e" : "#6C5CE7",
                backgroundColor: isSaved ? "rgba(34,197,94,0.05)" : "transparent",
                "&:hover": {
                  borderColor: isSaved ? "#22c55e" : "#5b4cdb",
                  backgroundColor: isSaved
                    ? "rgba(34,197,94,0.05)"
                    : "rgba(108,92,231,0.04)",
                },
              }}
            >
              {isSaved ? "Place Saved" : "Save Place"}
            </Button>
          )}
        </motion.div>
      </Box>
    </Box>
  );
}
