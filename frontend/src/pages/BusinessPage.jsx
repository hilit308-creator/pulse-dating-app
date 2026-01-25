// BusinessPage.jsx - Business/Venue Page
// Dynamic business card - source for events, connection point between place ↔ people ↔ moments
// No dating features on this page

import React, { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Bookmark,
  BookmarkX,
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

// Mock businesses data - synced with ExploreScreen MOCK_PLACES
// Event IDs match EVENTS in EventsByCategory.jsx: tlv1-tlv8 for Tel Aviv venues
const MOCK_BUSINESSES = {
  1: {
    id: 1,
    name: "Kuli Alma",
    category: "Bar",
    coverImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    address: "Mikveh Israel St 10, Tel Aviv",
    description: "One of Tel Aviv's most iconic nightlife spots. Kuli Alma combines art, music, and nightlife in a unique underground space. Known for eclectic DJ sets, live performances, and a vibrant crowd.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0636,34.7705&zoom=15&size=400x200&key=demo",
    upcomingEvents: [
      { id: "tlv1", name: "Underground Beats @ Kuli Alma", date: "Jun 15", time: "23:00" },
    ],
  },
  2: {
    id: 2,
    name: "Cafe Nordoy",
    category: "Cafe",
    coverImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    address: "Nordau Blvd 7, Tel Aviv",
    description: "A charming neighborhood cafe with vintage vibes. Perfect for brunch, coffee dates, or working on your laptop. Known for excellent pastries and a cozy atmosphere.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0853,34.7818&zoom=15&size=400x200&key=demo",
    upcomingEvents: [],
  },
  3: {
    id: 3,
    name: "The Block",
    category: "Bar & Club",
    coverImage: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1200&q=80",
    address: "Shalma Rd 157, Tel Aviv",
    description: "Tel Aviv's premier techno club. A massive warehouse space with world-class sound system and international DJs. The place to be for serious electronic music lovers.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0500,34.7600&zoom=15&size=400x200&key=demo",
    upcomingEvents: [
      { id: "tlv2", name: "Techno Warehouse @ The Block", date: "Jun 20", time: "23:30" },
    ],
  },
  4: {
    id: 4,
    name: "Cafelix",
    category: "Cafe",
    coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    address: "Levinsky St 41, Tel Aviv",
    description: "Specialty coffee roasters with a passion for quality. Try their signature cold brew or enjoy a freshly baked pastry. A favorite among local coffee enthusiasts.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0600,34.7700&zoom=15&size=400x200&key=demo",
    upcomingEvents: [],
  },
  5: {
    id: 5,
    name: "Sputnik",
    category: "Bar",
    coverImage: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80",
    address: "Allenby St 56, Tel Aviv",
    description: "A laid-back dive bar with character. Great for casual drinks, good music, and meeting new people. Known for affordable prices and a friendly crowd.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0700,34.7750&zoom=15&size=400x200&key=demo",
    upcomingEvents: [
      { id: "tlv3", name: "Chill Vibes @ Sputnik", date: "Jun 14", time: "21:00" },
    ],
  },
  6: {
    id: 6,
    name: "Pastel",
    category: "Live Music Venue",
    coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    address: "HaArba'a St 28, Tel Aviv",
    description: "Intimate live music venue featuring local and international artists. From jazz to indie rock, Pastel hosts diverse performances in a cozy setting with great acoustics.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0720,34.7800&zoom=15&size=400x200&key=demo",
    upcomingEvents: [
      { id: "tlv4", name: "Live Jazz @ Pastel", date: "Jun 19", time: "20:30" },
    ],
  },
  7: {
    id: 7,
    name: "Beit Maariv",
    category: "Bar & Club",
    coverImage: "https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&w=1200&q=80",
    address: "Carlebach St 14, Tel Aviv",
    description: "Historic building turned into a vibrant nightlife complex. Multiple floors with different vibes - from rooftop cocktails to basement dance floors.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0680,34.7850&zoom=15&size=400x200&key=demo",
    upcomingEvents: [
      { id: "tlv5", name: "Rooftop Party @ Beit Maariv", date: "Jun 21", time: "22:00" },
    ],
  },
  8: {
    id: 8,
    name: "Anna Loulou",
    category: "Live Music Bar",
    coverImage: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
    address: "HaRechev St 2, Jaffa",
    description: "Legendary Jaffa bar known for live music and alternative culture. A melting pot of artists, musicians, and free spirits. Great cocktails and unforgettable nights.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0530,34.7550&zoom=15&size=400x200&key=demo",
    upcomingEvents: [
      { id: "tlv6", name: "Open Mic @ Anna Loulou", date: "Jun 17", time: "21:00" },
    ],
  },
  9: {
    id: 9,
    name: "Teder.fm",
    category: "Bar & Radio Station",
    coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    address: "Derech Jaffa 9, Tel Aviv",
    description: "Unique outdoor bar combined with a live radio station. Chill vibes, great music, and a diverse crowd. Perfect for sunset drinks and good conversations.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0580,34.7650&zoom=15&size=400x200&key=demo",
    upcomingEvents: [
      { id: "tlv7", name: "Sunset Sessions @ Teder.fm", date: "Jun 16", time: "17:00" },
    ],
  },
  10: {
    id: 10,
    name: "Spicehaus",
    category: "Cafe & Restaurant",
    coverImage: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=1200&q=80",
    address: "Levinsky Market, Tel Aviv",
    description: "A culinary gem in the heart of Levinsky Market. Fusion cuisine with Middle Eastern influences, great coffee, and a vibrant atmosphere. Perfect for foodies.",
    mapPreview: "https://maps.googleapis.com/maps/api/staticmap?center=32.0620,34.7720&zoom=15&size=400x200&key=demo",
    upcomingEvents: [
      { id: "tlv8", name: "Levinsky Food Fest @ Spicehaus", date: "Jun 22", time: "18:00" },
    ],
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
  
  // Scroll to top on mount
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Get business ID from params or location state
  const businessId = id || location.state?.businessId;
  
  const [business, setBusiness] = useState(null);
  const [isSaved, setIsSaved] = useState(() => {
    // Check if place is already saved in localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("saved_places") || "[]");
      return saved.some(p => p.id === id || p.id === parseInt(id));
    } catch { return false; }
  });

  // Load business data
  useEffect(() => {
    if (!businessId) {
      navigate(-1);
      return;
    }

    // First check if place data was passed via location state (from ExploreScreen)
    if (location.state?.place) {
      const placeData = location.state.place;
      // Convert place data to business format
      const businessFromPlace = {
        id: placeData.id,
        name: placeData.name,
        category: placeData.category === 'cafe' ? 'Cafe' : 
                  placeData.category === 'bar' ? 'Bar' :
                  placeData.category === 'live-music' ? 'Live Music' :
                  placeData.category === 'dance' ? 'Dance' :
                  placeData.category || 'Venue',
        coverImage: placeData.image,
        address: `${placeData.location}, Israel`,
        description: placeData.description || `A great ${placeData.category || 'place'} in ${placeData.location}. ${placeData.vibes ? 'Vibes: ' + placeData.vibes.join(', ') : ''}`,
        mapPreview: `https://maps.googleapis.com/maps/api/staticmap?center=${placeData.location}&zoom=15&size=400x200&key=demo`,
        upcomingEvents: placeData.hasEvents ? [{ id: `event-${placeData.id}`, name: `Event @ ${placeData.name}`, date: 'Coming soon', time: 'TBD' }] : [],
        pulseRating: placeData.pulseRating,
        pulseReviews: placeData.pulseReviews,
        isCommunityAdded: placeData.isCommunityAdded,
        benefit: placeData.benefit,
        openNow: placeData.openNow,
        closingTime: placeData.closingTime,
      };
      setBusiness(businessFromPlace);
      trackEvent("business_page_viewed", { businessId, source: 'explore' });
    } else {
      // Fallback to mock business (in real app, fetch from API)
      const businessData = MOCK_BUSINESSES[businessId];
      if (!businessData) {
        navigate(-1);
        return;
      }
      setBusiness(businessData);
      trackEvent("business_page_viewed", { businessId });
    }
    
    // Check saved status
    try {
      const saved = JSON.parse(localStorage.getItem("saved_places") || "[]");
      setIsSaved(saved.some(p => p.id === businessId || p.id === parseInt(businessId)));
    } catch { /* ignore */ }
  }, [businessId, navigate, location.state]);

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

  // Handle view all events - navigate to specific event if available
  const handleViewEvents = useCallback(() => {
    trackEvent("business_view_events_clicked", { businessId });
    // If business has events, navigate to the first event
    if (business?.upcomingEvents?.length > 0) {
      const firstEvent = business.upcomingEvents[0];
      navigate(`/events?eventId=${firstEvent.id}&businessId=${businessId}`);
    } else {
      navigate("/events");
    }
  }, [navigate, businessId, business]);

  // Handle save/unsave place toggle
  const handleSavePlace = useCallback(() => {
    if (isSaved) {
      trackEvent("business_unsaved", { businessId });
      setIsSaved(false);
      // Remove from localStorage
      try {
        const saved = JSON.parse(localStorage.getItem("saved_places") || "[]");
        const updated = saved.filter(p => p.id !== businessId && p.id !== parseInt(businessId));
        localStorage.setItem("saved_places", JSON.stringify(updated));
      } catch (e) { console.error("Error removing saved place:", e); }
    } else {
      trackEvent("business_saved", { businessId });
      setIsSaved(true);
      // Save to localStorage
      try {
        const saved = JSON.parse(localStorage.getItem("saved_places") || "[]");
        if (!saved.find(p => p.id === businessId || p.id === parseInt(businessId))) {
          saved.push({
            id: businessId,
            name: business?.name || "Unknown Place",
            category: business?.category || "Place",
            address: business?.address || "",
            coverImage: business?.coverImage || "",
          });
          localStorage.setItem("saved_places", JSON.stringify(saved));
        }
      } catch (e) { console.error("Error saving place:", e); }
    }
  }, [businessId, isSaved, business]);

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

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Stack spacing={1.5}>
            {/* Save Place Button - always visible */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleSavePlace}
              startIcon={isSaved ? <BookmarkX size={18} /> : <Bookmark size={18} />}
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
              {isSaved ? "Saved" : "Save Place"}
            </Button>

            {/* View Events Button - only if has events */}
            {hasEvents && (
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
            )}
          </Stack>
        </motion.div>
      </Box>
    </Box>
  );
}
