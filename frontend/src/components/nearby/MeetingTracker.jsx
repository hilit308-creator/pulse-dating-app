// MeetingTracker.jsx
// Real-time tracking of both participants approaching the meeting spot

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Navigation, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../config/api';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Meeting spot marker (purple pin)
const createMeetingSpotIcon = () => new L.DivIcon({
  className: 'meeting-spot-marker',
  html: `<div style="background: linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%); width: 40px; height: 40px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 16px rgba(108,92,231,0.5); display: flex; align-items: center; justify-content: center;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// User marker (me - green)
const createMyMarkerIcon = () => new L.DivIcon({
  className: 'my-marker',
  html: `<div style="background: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 12px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
      <circle cx="12" cy="12" r="4"></circle>
    </svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Other participant marker (blue)
const createOtherMarkerIcon = () => new L.DivIcon({
  className: 'other-marker',
  html: `<div style="background: #3b82f6; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 12px rgba(59,130,246,0.4); display: flex; align-items: center; justify-content: center;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
      <circle cx="12" cy="12" r="4"></circle>
    </svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Calculate distance between two points in meters
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Format distance for display
function formatDistance(meters) {
  if (meters < 100) return 'Almost there!';
  if (meters < 1000) return `${Math.round(meters)}m away`;
  return `${(meters / 1000).toFixed(1)}km away`;
}

// Map bounds fitter
const MapBoundsFitter = ({ positions }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [positions, map]);
  
  return null;
};

export default function MeetingTracker({
  meetingId,
  meetingSpot,
  otherPersonName,
  onClose,
  onArrived,
}) {
  const [myLocation, setMyLocation] = useState(null);
  const [otherLocation, setOtherLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iAmClose, setIAmClose] = useState(false);
  const [theyAreClose, setTheyAreClose] = useState(false);
  const watchIdRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const ARRIVAL_THRESHOLD = 50; // meters

  // Update my location to server
  const updateMyLocation = useCallback(async (lat, lng) => {
    const token = localStorage.getItem('token');
    if (!token || !meetingId) return;

    try {
      await fetch(
        `${API_URL}/api/v1/meetings/${meetingId}/location`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lat, lng }),
        }
      );
    } catch (err) {
      console.warn('[MeetingTracker] Failed to update location:', err);
    }
  }, [meetingId]);

  // Fetch locations from server
  const fetchLocations = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !meetingId) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/meetings/${meetingId}/location`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.otherLocation) {
          setOtherLocation(data.otherLocation);
        }
      }
    } catch (err) {
      console.warn('[MeetingTracker] Failed to fetch locations:', err);
    }
  }, [meetingId]);

  // Start watching my location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        updateMyLocation(latitude, longitude);
        setLoading(false);

        // Check if I'm close to meeting spot
        if (meetingSpot) {
          const distance = calculateDistance(
            latitude, longitude,
            meetingSpot.lat, meetingSpot.lng
          );
          setIAmClose(distance < ARRIVAL_THRESHOLD);
        }
      },
      (err) => {
        console.error('[MeetingTracker] Geolocation error:', err);
        setError('Unable to get your location');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [meetingSpot, updateMyLocation]);

  // Poll for other person's location
  useEffect(() => {
    fetchLocations();
    pollIntervalRef.current = setInterval(fetchLocations, 5000); // Every 5 seconds

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchLocations]);

  // Check if other person is close
  useEffect(() => {
    if (otherLocation && meetingSpot) {
      const distance = calculateDistance(
        otherLocation.lat, otherLocation.lng,
        meetingSpot.lat, meetingSpot.lng
      );
      setTheyAreClose(distance < ARRIVAL_THRESHOLD);
    }
  }, [otherLocation, meetingSpot]);

  // Calculate distances
  const myDistance = myLocation && meetingSpot
    ? calculateDistance(myLocation.lat, myLocation.lng, meetingSpot.lat, meetingSpot.lng)
    : null;

  const theirDistance = otherLocation && meetingSpot
    ? calculateDistance(otherLocation.lat, otherLocation.lng, meetingSpot.lat, meetingSpot.lng)
    : null;

  // Collect all positions for map bounds
  const allPositions = [];
  if (meetingSpot) allPositions.push([meetingSpot.lat, meetingSpot.lng]);
  if (myLocation) allPositions.push([myLocation.lat, myLocation.lng]);
  if (otherLocation) allPositions.push([otherLocation.lat, otherLocation.lng]);

  const defaultCenter = meetingSpot 
    ? [meetingSpot.lat, meetingSpot.lng] 
    : [32.0853, 34.7818];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 500,
            maxHeight: '90vh',
            backgroundColor: '#fff',
            borderRadius: 20,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Navigation size={20} color="#6C5CE7" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                On the way
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <X size={20} color="#64748b" />
            </IconButton>
          </Box>

          {/* Status Cards */}
          <Box sx={{ p: 2, display: 'flex', gap: 1.5 }}>
            {/* My status */}
            <Box sx={{ 
              flex: 1, 
              p: 1.5, 
              borderRadius: '12px',
              backgroundColor: iAmClose ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)',
              border: `2px solid ${iAmClose ? '#10b981' : 'rgba(16,185,129,0.2)'}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                {iAmClose ? (
                  <CheckCircle size={14} color="#10b981" />
                ) : (
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
                )}
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#10b981' }}>
                  You
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                {loading ? 'Locating...' : (iAmClose ? 'Arrived!' : formatDistance(myDistance))}
              </Typography>
            </Box>

            {/* Their status */}
            <Box sx={{ 
              flex: 1, 
              p: 1.5, 
              borderRadius: '12px',
              backgroundColor: theyAreClose ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
              border: `2px solid ${theyAreClose ? '#3b82f6' : 'rgba(59,130,246,0.2)'}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                {theyAreClose ? (
                  <CheckCircle size={14} color="#3b82f6" />
                ) : (
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                )}
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                  {otherPersonName || 'Them'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                {otherLocation ? (theyAreClose ? 'Arrived!' : formatDistance(theirDistance)) : 'Waiting...'}
              </Typography>
            </Box>
          </Box>

          {/* Map */}
          <Box sx={{ flex: 1, minHeight: 300 }}>
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress size={32} sx={{ color: '#6C5CE7' }} />
              </Box>
            ) : error ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 1 }}>
                <AlertCircle size={32} color="#ef4444" />
                <Typography variant="body2" sx={{ color: '#ef4444' }}>{error}</Typography>
              </Box>
            ) : (
              <MapContainer
                center={defaultCenter}
                zoom={15}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                
                {allPositions.length > 1 && <MapBoundsFitter positions={allPositions} />}

                {/* Meeting spot marker */}
                {meetingSpot && (
                  <Marker
                    position={[meetingSpot.lat, meetingSpot.lng]}
                    icon={createMeetingSpotIcon()}
                  />
                )}

                {/* My location marker */}
                {myLocation && (
                  <Marker
                    position={[myLocation.lat, myLocation.lng]}
                    icon={createMyMarkerIcon()}
                  />
                )}

                {/* Other person's marker */}
                {otherLocation && (
                  <Marker
                    position={[otherLocation.lat, otherLocation.lng]}
                    icon={createOtherMarkerIcon()}
                  />
                )}

                {/* Lines to meeting spot */}
                {myLocation && meetingSpot && (
                  <Polyline
                    positions={[
                      [myLocation.lat, myLocation.lng],
                      [meetingSpot.lat, meetingSpot.lng],
                    ]}
                    color="#10b981"
                    weight={3}
                    opacity={0.6}
                    dashArray="10, 10"
                  />
                )}
                {otherLocation && meetingSpot && (
                  <Polyline
                    positions={[
                      [otherLocation.lat, otherLocation.lng],
                      [meetingSpot.lat, meetingSpot.lng],
                    ]}
                    color="#3b82f6"
                    weight={3}
                    opacity={0.6}
                    dashArray="10, 10"
                  />
                )}
              </MapContainer>
            )}
          </Box>

          {/* Legend */}
          <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)' }} />
              <Typography variant="caption" sx={{ color: '#64748b' }}>Meeting spot</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981' }} />
              <Typography variant="caption" sx={{ color: '#64748b' }}>You</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
              <Typography variant="caption" sx={{ color: '#64748b' }}>{otherPersonName || 'Them'}</Typography>
            </Box>
          </Box>

          {/* Action button */}
          {iAmClose && theyAreClose && (
            <Box sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={onArrived}
                sx={{
                  py: 1.5,
                  borderRadius: '14px',
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                }}
              >
                We're both here! 🎉
              </Button>
            </Box>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
