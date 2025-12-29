// EventPreviewScreen.jsx - Lightweight Event Preview
// Shows event details when accessed from Nearby People flow

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Bookmark, ExternalLink } from "lucide-react";

/* ------------------------------ Constants --------------------------------- */
const SAFE_BOTTOM = 'calc(88px + env(safe-area-inset-bottom, 0px))';

// Analytics helper
const trackEvent = (eventName, params = {}) => {
  console.log(`[Analytics] ${eventName}`, params);
};

// Mock events data
const MOCK_EVENTS = {
  1: {
    id: 1,
    name: "Sunset Yoga in the Park",
    coverImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    venue: "Yarkon Park Yoga Studio",
    venueId: 1, // Link to business
    address: "Tel Aviv",
    date: "Tonight",
    time: "18:00 - 19:30",
    distance: "0.8 km",
    tags: ["Social", "Yoga", "Dating-friendly"],
    description: "Join us for a relaxing sunset yoga session. Perfect for meeting new people in a calm environment.",
    peopleGoing: 12,
  },
  2: {
    id: 2,
    name: "Art & Wine Evening",
    coverImage: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
    venue: "Gallery 23",
    venueId: 2, // Link to business
    address: "Rothschild Blvd, Tel Aviv",
    date: "Tomorrow",
    time: "20:00 - 23:00",
    distance: "1.2 km",
    tags: ["Art", "Social", "Dating-friendly"],
    description: "Explore contemporary art while enjoying fine wine. A great opportunity to connect with creative minds.",
    peopleGoing: 8,
  },
};

/* ------------------------------ Main Screen ------------------------------- */
export default function EventPreviewScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get event info from navigation state
  const { eventId, fromPerson } = location.state || {};
  
  const [event, setEvent] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Load event data
  useEffect(() => {
    if (!eventId) {
      navigate("/nearby", { replace: true });
      return;
    }

    // Load mock event (in real app, fetch from API)
    const eventData = MOCK_EVENTS[eventId];
    if (!eventData) {
      navigate("/nearby", { replace: true });
      return;
    }

    setEvent(eventData);
    trackEvent("event_preview_viewed", { eventId, fromPerson });
  }, [eventId, fromPerson, navigate]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1); // Go back to View Nearby People
  }, [navigate]);

  // Handle "View Event" CTA
  const handleViewEvent = useCallback(() => {
    trackEvent("event_view_clicked", { eventId: event?.id });
    // Navigate to full event details (existing EventsByCategory or dedicated page)
    navigate("/events", {
      state: { selectedEventId: event?.id },
    });
  }, [navigate, event]);

  // Handle "Save Event" CTA
  const handleSaveEvent = useCallback(() => {
    trackEvent("event_saved", { eventId: event?.id });
    setIsSaved(true);
    // TODO: Implement actual save logic
  }, [event]);

  if (!event) {
    return null; // Loading or redirecting
  }

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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1.5,
          backgroundColor: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={handleBack} sx={{ color: "#1a1a2e" }}>
          <ArrowLeft size={22} />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#1a1a2e",
          }}
        >
          Happening nearby {event.date.toLowerCase()}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Event Card */}
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            {/* Cover Image */}
            <Box
              sx={{
                width: "100%",
                height: 200,
                backgroundImage: `url(${event.coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              {/* Gradient overlay */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)",
                }}
              />
              
              {/* People going badge */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <Users size={14} color="#6C5CE7" />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#1a1a2e" }}
                >
                  {event.peopleGoing} people nearby are going
                </Typography>
              </Box>
            </Box>

            {/* Event Details */}
            <Box sx={{ p: 3 }}>
              {/* Event Name */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a2e",
                  mb: 1.5,
                }}
              >
                {event.name}
              </Typography>

              {/* Venue & Address */}
              <Box
                onClick={() => event.venueId && navigate(`/business/${event.venueId}`)}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  mb: 1,
                  cursor: event.venueId ? "pointer" : "default",
                  p: 1,
                  mx: -1,
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                  "&:hover": event.venueId ? {
                    backgroundColor: "rgba(108,92,231,0.04)",
                  } : {},
                }}
              >
                <MapPin size={18} color="#6C5CE7" style={{ marginTop: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{ 
                      fontWeight: 600, 
                      color: "#1a1a2e",
                      textDecoration: event.venueId ? "underline" : "none",
                      textDecorationColor: "rgba(108,92,231,0.3)",
                    }}
                  >
                    {event.venue}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {event.address} · {event.distance}
                  </Typography>
                </Box>
              </Box>

              {/* Date & Time */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Calendar size={16} color="#64748b" />
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {event.date}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Clock size={16} color="#64748b" />
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {event.time}
                  </Typography>
                </Box>
              </Box>

              {/* Tags */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 3 }}>
                {event.tags.map((tag, i) => (
                  <Chip
                    key={i}
                    label={tag}
                    size="small"
                    sx={{
                      backgroundColor:
                        tag === "Dating-friendly"
                          ? "rgba(236,72,153,0.1)"
                          : "rgba(108,92,231,0.08)",
                      color:
                        tag === "Dating-friendly" ? "#ec4899" : "#6C5CE7",
                      fontWeight: 600,
                      border:
                        tag === "Dating-friendly"
                          ? "1px solid rgba(236,72,153,0.2)"
                          : "1px solid rgba(108,92,231,0.15)",
                    }}
                  />
                ))}
              </Box>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  lineHeight: 1.6,
                  mb: 3,
                }}
              >
                {event.description}
              </Typography>

              {/* Microcopy */}
              {fromPerson && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: "rgba(108,92,231,0.06)",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#6C5CE7", fontWeight: 500 }}
                  >
                    {fromPerson} and others nearby are interested in this event
                  </Typography>
                </Box>
              )}

              {/* CTAs */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {/* Primary CTA */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleViewEvent}
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
                  View Event
                </Button>

                {/* Secondary CTA */}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleSaveEvent}
                  disabled={isSaved}
                  startIcon={<Bookmark size={18} />}
                  sx={{
                    py: 1.5,
                    borderRadius: "14px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    borderColor: isSaved ? "#22c55e" : "#e2e8f0",
                    color: isSaved ? "#22c55e" : "#64748b",
                    backgroundColor: isSaved ? "rgba(34,197,94,0.05)" : "transparent",
                    "&:hover": {
                      borderColor: isSaved ? "#22c55e" : "#cbd5e1",
                      backgroundColor: isSaved
                        ? "rgba(34,197,94,0.05)"
                        : "rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  {isSaved ? "Event Saved" : "Save Event"}
                </Button>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}
