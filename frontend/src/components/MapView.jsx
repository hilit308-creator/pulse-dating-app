import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Helper to randomize marker position within a radius (meters)
function randomizePosition(lat, lng, maxMeters) {
  const r = maxMeters / 111300; // meters to degrees
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const dx = w * Math.cos(t);
  const dy = w * Math.sin(t);
  return [lat + dy, lng + dx];
}

function CurrentLocationMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 15);
  }, [position, map]);
  return (
    <Marker position={position} icon={L.divIcon({ className: 'user-marker', html: '<div style="background:#ffb357;width:22px;height:22px;border-radius:50%;border:3px solid #fff;"></div>' })}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default function MapView({ profiles = [], userLocation }) {
  const navigate = useNavigate();
  // Default: somewhere central if no geolocation
  const [position, setPosition] = useState(userLocation || [32.0853, 34.7818]);

  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, [userLocation]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Paper sx={{ width: 320, height: 420, borderRadius: 3, overflow: 'hidden', mb: 2 }}>
        <MapContainer center={position} zoom={15} style={{ width: '100%', height: 420 }} scrollWheelZoom={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <CurrentLocationMarker position={position} />
          {profiles.map((profile, idx) => {
            // Randomize marker within profile.distance meters from user
            const [lat, lng] = randomizePosition(position[0], position[1], profile.distance || 200);
            return (
              <Marker key={profile.id || idx} position={[lat, lng]} icon={L.divIcon({ className: 'profile-marker', html: `<div style='background:#2e2e2e;width:18px;height:18px;border-radius:50%;border:2px solid #fff;'></div>` })}>
                <Popup>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={profile.photo} sx={{ width: 32, height: 32, bgcolor: '#eee', cursor: 'pointer' }} onClick={() => navigate(`/user/${profile.id}`, { state: { from: 'map' } })} />
                    <Typography>{profile.name}</Typography>
                  </Box>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </Paper>
      <Typography variant="caption" sx={{ color: '#888' }}>Your location is private. User markers are approximate.</Typography>
    </Box>
  );
}
