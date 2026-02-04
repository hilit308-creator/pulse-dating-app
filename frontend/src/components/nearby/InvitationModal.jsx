// InvitationModal.jsx
// Per spec: Two invitation paths - both must feel equally valid
// A. Invite for a Drink (With Payment) - gesture, not transaction
// B. Suggest Meeting (No Payment) - social initiative without financial framing

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Typography, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wine, MessageCircle, MapPin, Clock, CreditCard, Shield, Map, Navigation, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SuggestedVenues from './SuggestedVenues';
import { getFeatureFlag } from '../../utils/featureFlags';
import { saveMeetingDraft } from '../../utils/nearbyMeetingDrafts';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker for selected meeting spot
const createMeetingSpotIcon = () => new L.DivIcon({
  className: 'meeting-spot-marker',
  html: `<div style="background: linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(108,92,231,0.4); display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Location picker component for map
const LocationPicker = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={createMeetingSpotIcon()} />
  ) : null;
};

// Map center updater
const MapCenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 15);
    }
  }, [center, map]);
  return null;
};

const PAYMENT_HOLDS_STORAGE_KEY = 'pulse_nearby_payment_holds';

function getPaymentHolds() {
  try {
    const raw = localStorage.getItem(PAYMENT_HOLDS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePaymentHold(hold) {
  try {
    const current = getPaymentHolds();
    localStorage.setItem(PAYMENT_HOLDS_STORAGE_KEY, JSON.stringify([hold, ...current].slice(0, 50)));
  } catch {
    // ignore
  }
}

/**
 * InvitationModal - Two equal paths to suggest meeting
 * 
 * Per spec principles:
 * - Payment represents initiative, not expectation
 * - Pre-authorization is a hold, not a transaction
 * - Both paths must feel equally legitimate
 * - No invisible commitments
 */
export default function InvitationModal({
  isOpen,
  onClose,
  person,
  onSendInvitation,
}) {
  const [selectedPath, setSelectedPath] = useState(null); // 'drink' or 'meet'
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapSelectedLocation, setMapSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 32.0853, lng: 34.7818 }); // Default Tel Aviv

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => console.log('Location permission denied'),
        { timeout: 10000 }
      );
    }
  }, []);

  const handleConfirmMapLocation = useCallback(() => {
    if (mapSelectedLocation) {
      const mapVenue = {
        id: 'map_custom_' + Date.now(),
        googlePlaceId: null,
        name: 'Meeting spot',
        category: 'outdoors',
        isMapPicked: true,
        coordinates: mapSelectedLocation,
      };
      setSelectedVenue(mapVenue);
      setMapPickerOpen(false);
    }
  }, [mapSelectedLocation]);

  const venuesEnabled = getFeatureFlag('nearby_phase4_venues', false);
  const paymentsEnabled = getFeatureFlag('nearby_phase6_payments', false);
  const meetingSetupEnabled = getFeatureFlag('nearby_phase7_meeting_setup', false);
  const drinkPathEnabled = paymentsEnabled && venuesEnabled;

  const holdAmountNis = useMemo(() => 60, []);
  const maskedCard = useMemo(() => 'VISA •••• 4242', []);

  useEffect(() => {
    if (!isOpen) return;
    if (selectedPath === 'drink' && !drinkPathEnabled) {
      setSelectedPath(null);
      setSelectedVenue(null);
    }
  }, [isOpen, selectedPath, drinkPathEnabled]);

  if (!isOpen || !person) return null;

  const handleSend = async () => {
    if (selectedPath === 'drink' && paymentsEnabled) {
      setPaymentConfirmOpen(true);
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (meetingSetupEnabled && person?.id != null) {
      saveMeetingDraft(person.id, {
        createdAt: Date.now(),
        type: selectedPath,
        venue: selectedVenue || null,
        paymentHold: null,
        personId: person.id,
      });
    }

    onSendInvitation({
      type: selectedPath,
      venue: selectedVenue,
      message: message || getDefaultMessage(),
      person,
    });
    
    setIsProcessing(false);
    onClose();
  };

  const handleConfirmHoldAndSend = async () => {
    setIsProcessing(true);

    // Simulate pre-auth hold
    await new Promise(resolve => setTimeout(resolve, 650));

    const hold = {
      id: String(Date.now()),
      createdAt: Date.now(),
      status: 'held',
      amountNis: holdAmountNis,
      card: maskedCard,
      venueId: selectedVenue?.id ?? null,
      venueName: selectedVenue?.name ?? null,
      personId: person?.id ?? null,
    };

    savePaymentHold(hold);

    if (meetingSetupEnabled && person?.id != null) {
      saveMeetingDraft(person.id, {
        createdAt: Date.now(),
        type: selectedPath,
        venue: selectedVenue || null,
        paymentHold: hold,
        personId: person.id,
      });
    }

    onSendInvitation({
      type: selectedPath,
      venue: selectedVenue,
      message: message || getDefaultMessage(),
      person,
      paymentHold: hold,
    });

    setIsProcessing(false);
    setPaymentConfirmOpen(false);
    onClose();
  };

  const getDefaultMessage = () => {
    if (selectedPath === 'drink') {
      return selectedVenue 
        ? `Hey! Would you like to grab a drink at ${selectedVenue.name}? My treat 🍷`
        : "Hey! Would you like to grab a drink? My treat 🍷";
    }
    return selectedVenue
      ? `Hey! Want to meet up at ${selectedVenue.name}?`
      : "Hey! Want to meet up sometime?";
  };

  const canSend = selectedPath && (selectedPath === 'meet' || selectedVenue);

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="invitation-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          paddingTop: 70,
        }}
        onClick={() => {
          if (paymentConfirmOpen) return;
          onClose();
        }}
      >
        <Dialog
          open={paymentConfirmOpen}
          onClose={() => setPaymentConfirmOpen(false)}
          sx={{ zIndex: 10000 }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#1a1a2e' }}>
            Confirm payment hold
          </DialogTitle>
          <DialogContent sx={{ pt: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              We’ll place a temporary hold of ₪{holdAmountNis} on your card.
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Card: {maskedCard}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 2.5, pb: 2 }}>
            <Button
              variant="text"
              onClick={() => setPaymentConfirmOpen(false)}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmHoldAndSend}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, bgcolor: '#6C5CE7', '&:hover': { bgcolor: '#5a4ee0' } }}
              disabled={isProcessing}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <motion.div
          key="invitation-modal-content"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 500 }}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              maxHeight: '80vh',
              overflow: 'auto',
              margin: '0 16px',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                position: 'sticky',
                top: 0,
                backgroundColor: '#fff',
                zIndex: 10,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                Suggest meeting
              </Typography>
              <IconButton onClick={onClose} size="small">
                <X size={20} color="#64748b" />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2 }}>
              {/* Person info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={person.photos?.[0]}
                    alt={person.firstName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                    {person.firstName}
                  </Typography>
                  {!!person.city && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MapPin size={12} color="#6C5CE7" />
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {person.city}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Path selection - both equally valid */}
              {!selectedPath && (
                <>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1.5 }}>
                    How would you like to reach out?
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* Path A: Invite for a Drink */}
                    {drinkPathEnabled && (
                      <Box
                        onClick={() => setSelectedPath('drink')}
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          border: '2px solid rgba(108,92,231,0.2)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#6C5CE7',
                            backgroundColor: 'rgba(108,92,231,0.04)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Wine size={18} color="#fff" />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.25 }}>
                              Invite for a drink
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.3 }}>
                              A gesture of initiative — you'll only be charged if they accept and you both show up
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Path B: Suggest Meeting */}
                    <Box
                      onClick={() => setSelectedPath('meet')}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: '2px solid rgba(108,92,231,0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#6C5CE7',
                          backgroundColor: 'rgba(108,92,231,0.04)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            backgroundColor: 'rgba(108,92,231,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <MessageCircle size={18} color="#6C5CE7" />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.25 }}>
                            Suggest meeting up
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.3 }}>
                            Social initiative without any financial framing — just a friendly suggestion
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Reassurance */}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 2,
                      color: '#94a3b8',
                      textAlign: 'center',
                    }}
                  >
                    Both options are equally valid — choose what feels right
                  </Typography>
                </>
              )}

              {/* Selected path: Drink invitation */}
              {selectedPath === 'drink' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="text"
                      onClick={() => {
                        setSelectedPath(null);
                        setSelectedVenue(null);
                      }}
                      sx={{ color: '#64748b', textTransform: 'none', mb: 2 }}
                    >
                      ← Back to options
                    </Button>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(108,92,231,0.06)',
                        border: '1px solid rgba(108,92,231,0.15)',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Wine size={18} color="#6C5CE7" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6C5CE7' }}>
                          Invite for a drink
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Select a place and we'll send your invitation. Payment is pre-authorized only — 
                        you're never charged unless they accept and you both arrive.
                      </Typography>
                    </Box>

                    {/* Venue selection - required for drink */}
                    {venuesEnabled && (
                      <SuggestedVenues
                        onSelectVenue={setSelectedVenue}
                        selectedVenue={selectedVenue}
                      />
                    )}
                  </Box>

                  {/* Payment info - transparent */}
                  {selectedVenue && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        mb: 3,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CreditCard size={16} color="#64748b" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                          Payment hold
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                        ~$15-25 will be held (not charged) until the meeting happens
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Shield size={14} color="#10b981" />
                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                          Released automatically if declined or expired
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}

              {/* Selected path: Suggest meeting */}
              {selectedPath === 'meet' && (
                <>
                  <Button
                    variant="text"
                    onClick={() => {
                      setSelectedPath(null);
                      setSelectedVenue(null);
                    }}
                    sx={{ color: '#64748b', textTransform: 'none', mb: 2 }}
                  >
                    ← Back to options
                  </Button>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(108,92,231,0.06)',
                      border: '1px solid rgba(108,92,231,0.15)',
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MessageCircle size={18} color="#6C5CE7" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6C5CE7' }}>
                        Suggest meeting up
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                      A friendly suggestion to meet — no payment involved. 
                      You can optionally suggest a place or leave it open.
                    </Typography>
                  </Box>

                  {/* Optional venue selection */}
                  {venuesEnabled && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                        Suggest a place? (optional)
                      </Typography>
                      <SuggestedVenues
                        onSelectVenue={setSelectedVenue}
                        selectedVenue={selectedVenue}
                      />

                      {/* Pick a spot on map - for free meeting spots like parks */}
                      <Box
                        onClick={() => setMapPickerOpen(true)}
                        sx={{
                          mt: 2,
                          p: 1.5,
                          borderRadius: '12px',
                          border: selectedVenue?.isMapPicked 
                            ? '2px solid #6C5CE7' 
                            : '2px dashed rgba(108,92,231,0.3)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          backgroundColor: selectedVenue?.isMapPicked ? 'rgba(108,92,231,0.08)' : 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#6C5CE7',
                            backgroundColor: 'rgba(108,92,231,0.04)',
                          },
                        }}
                      >
                        <Map size={18} color="#6C5CE7" />
                        <Typography variant="body2" sx={{ color: '#6C5CE7', fontWeight: 600 }}>
                          {selectedVenue?.isMapPicked ? 'Custom spot selected ✓' : 'Or pick a spot on the map'}
                        </Typography>
                      </Box>
                      {selectedVenue?.isMapPicked && (
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1, textAlign: 'center' }}>
                          Perfect for parks, beaches, or any outdoor spot
                        </Typography>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Message input - when path is selected */}
              {selectedPath && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e', mb: 1 }}>
                    Add a message (optional)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder={getDefaultMessage()}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Box>
              )}

              {/* Send button */}
              {selectedPath && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSend}
                    disabled={!canSend || isProcessing}
                    sx={{
                      py: 1.5,
                      borderRadius: '14px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: canSend 
                        ? 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)'
                        : '#e2e8f0',
                      boxShadow: canSend ? '0 4px 16px rgba(108,92,231,0.3)' : 'none',
                    }}
                  >
                    {isProcessing ? 'Sending...' : (
                      selectedPath === 'drink' 
                        ? 'Send invitation' 
                        : 'Send suggestion'
                    )}
                  </Button>

                  {/* Expiration info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 2 }}>
                    <Clock size={14} color="#94a3b8" />
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {selectedPath === 'drink' 
                        ? 'Invitation expires in 2 hours — protects both of you'
                        : 'They can respond whenever they\'re ready'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </motion.div>
      </motion.div>

      {/* Map Picker Modal */}
      <Dialog
        open={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Map size={20} color="#6C5CE7" />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
              Pick a meeting spot
            </Typography>
          </Box>
          <IconButton onClick={() => setMapPickerOpen(false)} size="small">
            <X size={20} color="#64748b" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Typography variant="body2" sx={{ color: '#64748b', px: 3, pb: 2 }}>
            Tap on the map to select where you'd like to meet
          </Typography>
          <Box sx={{ height: 350, width: '100%' }}>
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={15}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapCenterUpdater center={userLocation} />
              <LocationPicker
                onLocationSelect={setMapSelectedLocation}
                selectedLocation={mapSelectedLocation}
              />
              {/* User's current location marker */}
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={new L.DivIcon({
                  className: 'user-location-marker',
                  html: `<div style="background: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8],
                })}
              />
            </MapContainer>
          </Box>
          {mapSelectedLocation && (
            <Box sx={{ px: 3, py: 2, backgroundColor: 'rgba(108,92,231,0.06)', borderTop: '1px solid rgba(108,92,231,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={16} color="#6C5CE7" />
                <Typography variant="body2" sx={{ color: '#1a1a2e', fontWeight: 600 }}>
                  Meeting spot selected
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {mapSelectedLocation.lat.toFixed(5)}, {mapSelectedLocation.lng.toFixed(5)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            variant="text"
            onClick={() => {
              setMapSelectedLocation(null);
              setMapPickerOpen(false);
            }}
            sx={{ textTransform: 'none', color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmMapLocation}
            disabled={!mapSelectedLocation}
            startIcon={<Check size={18} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              bgcolor: '#6C5CE7',
              '&:hover': { bgcolor: '#5a4ee0' },
              '&:disabled': { bgcolor: '#e2e8f0' },
            }}
          >
            Confirm spot
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatePresence>
  );
}
