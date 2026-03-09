/**
 * QuickPlanModal.jsx
 * Lightweight modal for adding plans in < 5 seconds
 * 
 * Types:
 * 1. One-time Plan (Today, Tonight, Tomorrow, This week)
 * 2. Recurring Activity (Specific days + time of day)
 * 
 * Features:
 * - Google Places Autocomplete for location search
 * - Specific day selection (Mon-Sun) for recurring plans
 * - Time of day selection (Morning/Afternoon/Evening/Night)
 * 
 * Data flows to:
 * - Future Places (Settings)
 * - My Weekly Rhythm (Profile)
 * - Matching Algorithm
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  TextField,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  Repeat,
  Coffee,
  Dumbbell,
  Music,
  Users,
  ShoppingBag,
  Utensils,
  Briefcase,
  Search,
  Check,
} from 'lucide-react';

// Storage key for plans
const PLANS_STORAGE_KEY = 'pulse.futurePlans';

// Quick time options for one-time plans
const TIME_OPTIONS = [
  { id: 'today', label: 'Today', icon: '📅' },
  { id: 'tonight', label: 'Tonight', icon: '🌙' },
  { id: 'tomorrow', label: 'Tomorrow', icon: '☀️' },
  { id: 'this_week', label: 'This week', icon: '📆' },
];

// Days of the week for recurring plans
const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Mon', fullLabel: 'Monday' },
  { id: 'tuesday', label: 'Tue', fullLabel: 'Tuesday' },
  { id: 'wednesday', label: 'Wed', fullLabel: 'Wednesday' },
  { id: 'thursday', label: 'Thu', fullLabel: 'Thursday' },
  { id: 'friday', label: 'Fri', fullLabel: 'Friday' },
  { id: 'saturday', label: 'Sat', fullLabel: 'Saturday' },
  { id: 'sunday', label: 'Sun', fullLabel: 'Sunday' },
];

// Time of day options
const TIME_OF_DAY = [
  { id: 'morning', label: 'Morning', icon: '🌅', timeRange: '06:00-12:00' },
  { id: 'afternoon', label: 'Afternoon', icon: '☀️', timeRange: '12:00-17:00' },
  { id: 'evening', label: 'Evening', icon: '🌆', timeRange: '17:00-21:00' },
  { id: 'night', label: 'Night', icon: '🌙', timeRange: '21:00-02:00' },
];

// Popular place suggestions (fallback when no Google Places)
const PLACE_SUGGESTIONS = [
  { id: 'gym', label: 'Gym', icon: Dumbbell, emoji: '💪' },
  { id: 'coffee', label: 'Coffee shop', icon: Coffee, emoji: '☕' },
  { id: 'bar', label: 'Bar / Drinks', icon: Utensils, emoji: '🍹' },
  { id: 'downtown', label: 'Downtown', icon: MapPin, emoji: '🏙️' },
  { id: 'beach', label: 'Beach', icon: MapPin, emoji: '🏖️' },
  { id: 'concert', label: 'Concert / Event', icon: Music, emoji: '🎵' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, emoji: '🛍️' },
  { id: 'coworking', label: 'Coworking', icon: Briefcase, emoji: '💼' },
  { id: 'meetup', label: 'Meetup / Social', icon: Users, emoji: '👥' },
];

// Google Places API key (check both naming conventions)
const GOOGLE_PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || '';
console.log('[Google Places] API Key loaded:', GOOGLE_PLACES_API_KEY ? 'Yes (length: ' + GOOGLE_PLACES_API_KEY.length + ')' : 'NO KEY FOUND');

// Load Google Maps script dynamically
const loadGoogleMapsScript = () => {
  console.log('[Google Places] loadGoogleMapsScript called, window.google exists:', !!window.google?.maps?.places, 'API key exists:', !!GOOGLE_PLACES_API_KEY);
  if (window.google?.maps?.places || !GOOGLE_PLACES_API_KEY) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Script already loading
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
};

// Load plans from localStorage
export const loadPlans = () => {
  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Save plans to localStorage
export const savePlans = (plans) => {
  try {
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('Error saving plans:', e);
  }
};

// Add a new plan
export const addPlan = (plan) => {
  const plans = loadPlans();
  const newPlan = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...plan,
  };
  plans.push(newPlan);
  savePlans(plans);
  return newPlan;
};

// Delete a plan
export const deletePlan = (planId) => {
  const plans = loadPlans();
  const filtered = plans.filter(p => p.id !== planId);
  savePlans(filtered);
  return filtered;
};

// Get plans for Weekly Rhythm display (max 5)
export const getPlansForRhythm = () => {
  const plans = loadPlans();
  // Sort: upcoming first, then recurring
  const sorted = plans.sort((a, b) => {
    // One-time plans first
    if (a.isRecurring !== b.isRecurring) {
      return a.isRecurring ? 1 : -1;
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  return sorted.slice(0, 5);
};

export default function QuickPlanModal({ open, onClose, onPlanAdded }) {
  const [step, setStep] = useState(1); // 1: place, 2: time
  const [planType, setPlanType] = useState('onetime'); // 'onetime' | 'recurring'
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [customPlace, setCustomPlace] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New state for recurring plans
  const [selectedDays, setSelectedDays] = useState([]); // Array of day ids
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState(null);
  
  // Privacy toggle state
  const [showOnProfile, setShowOnProfile] = useState(() => {
    const saved = localStorage.getItem('pulse.weeklyRhythmVisibility');
    return saved !== 'false'; // Default to true
  });
  
  // Google Places state
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Initialize Google Places services
  useEffect(() => {
    const initGooglePlaces = async () => {
      try {
        await loadGoogleMapsScript();
        if (window.google?.maps?.places) {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
          // Create a dummy div for PlacesService (required by API)
          const dummyDiv = document.createElement('div');
          placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
        }
      } catch (err) {
        console.warn('Google Places not available:', err);
      }
    };
    initGooglePlaces();
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setPlanType('onetime');
      setSelectedPlace(null);
      setCustomPlace('');
      setSelectedTime(null);
      setSearchQuery('');
      setSelectedDays([]);
      setSelectedTimeOfDay(null);
      setPlaceSuggestions([]);
    }
  }, [open]);

  // Search Google Places
  const searchGooglePlaces = useCallback((query) => {
    console.log('[Google Places] Searching for:', query, 'Service available:', !!autocompleteService.current);
    
    if (!query.trim() || !autocompleteService.current) {
      console.log('[Google Places] No query or service not available');
      setPlaceSuggestions([]);
      return;
    }

    setIsSearching(true);
    
    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        types: ['establishment'],
        // No country restriction for now
      },
      (predictions, status) => {
        console.log('[Google Places] Response status:', status, 'Predictions:', predictions?.length || 0, 'Raw predictions:', predictions);
        setIsSearching(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
          setPlaceSuggestions(predictions.map(p => ({
            id: p.place_id,
            label: p.structured_formatting.main_text,
            description: p.structured_formatting.secondary_text,
            placeId: p.place_id,
            isGooglePlace: true,
          })));
        } else {
          setPlaceSuggestions([]);
        }
      }
    );
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchGooglePlaces(searchQuery);
      }, 300);
    } else {
      setPlaceSuggestions([]);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchGooglePlaces]);

  // Get place details from Google
  const getPlaceDetails = useCallback((placeId, callback) => {
    if (!placesService.current) {
      callback(null);
      return;
    }

    placesService.current.getDetails(
      {
        placeId: placeId,
        fields: ['name', 'geometry', 'formatted_address', 'place_id'],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          callback({
            name: place.name,
            placeId: place.place_id,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            address: place.formatted_address,
          });
        } else {
          callback(null);
        }
      }
    );
  }, []);

  // Filter local suggestions based on search
  const filteredSuggestions = PLACE_SUGGESTIONS.filter(p =>
    p.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPlace = (place) => {
    if (place.isGooglePlace && place.placeId) {
      // Get full details from Google
      getPlaceDetails(place.placeId, (details) => {
        setSelectedPlace({
          id: place.placeId,
          label: place.label,
          emoji: '📍',
          isGooglePlace: true,
          ...details,
        });
        setCustomPlace('');
        setStep(2);
      });
    } else {
      setSelectedPlace(place);
      setCustomPlace('');
      setStep(2);
    }
  };

  const handleCustomPlace = () => {
    if (customPlace.trim()) {
      setSelectedPlace({ id: 'custom', label: customPlace.trim(), emoji: '📍' });
      setStep(2);
    }
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
  };

  const handleToggleDay = (dayId) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleSelectTimeOfDay = (time) => {
    setSelectedTimeOfDay(time);
  };

  // Format days for display
  const formatSelectedDays = () => {
    if (selectedDays.length === 0) return '';
    const dayLabels = selectedDays
      .map(id => DAYS_OF_WEEK.find(d => d.id === id)?.label)
      .filter(Boolean);
    return dayLabels.join(' • ');
  };

  const handleSave = () => {
    if (!selectedPlace) return;

    let plan;
    
    if (planType === 'onetime') {
      // Time is now OPTIONAL for one-time plans
      plan = {
        place: selectedPlace.label,
        placeId: selectedPlace.id,
        emoji: selectedPlace.emoji || '📍',
        time: selectedTime?.label || 'Flexible',
        timeId: selectedTime?.id || 'flexible',
        isRecurring: false,
        // Google Places data
        googlePlaceId: selectedPlace.placeId,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        address: selectedPlace.address,
      };
    } else {
      // Recurring plan - days and time are now OPTIONAL
      const daysDisplay = formatSelectedDays() || 'Flexible';
      const timeDisplay = selectedDays.length > 0 && selectedTimeOfDay 
        ? `${daysDisplay} ${selectedTimeOfDay.label.toLowerCase()}s`
        : selectedTimeOfDay 
          ? selectedTimeOfDay.label
          : daysDisplay;
      
      plan = {
        place: selectedPlace.label,
        placeId: selectedPlace.id,
        emoji: selectedPlace.emoji || '📍',
        time: timeDisplay,
        days: selectedDays,
        timeOfDay: selectedTimeOfDay?.id || 'flexible',
        timeOfDayLabel: selectedTimeOfDay?.label || 'Flexible',
        isRecurring: true,
        // Google Places data
        googlePlaceId: selectedPlace.placeId,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        address: selectedPlace.address,
      };
    }

    const newPlan = addPlan(plan);
    
    if (onPlanAdded) {
      onPlanAdded(newPlan);
    }
    
    onClose();
  };

  // Validation - only place is required, everything else is optional
  const canSave = !!selectedPlace;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxHeight: '80vh',
          m: 2,
        },
      }}
      sx={{ zIndex: 10000 }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          pb: 1,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>
            Add a plan
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#9ca3af' }}>
            Where you'll be in the coming days
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search input */}
              <TextField
                fullWidth
                placeholder="Search or type a place..."
                value={searchQuery || customPlace}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCustomPlace(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customPlace.trim()) {
                    handleCustomPlace();
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="#9ca3af" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f9fafb',
                  },
                }}
              />

              {/* Google Places suggestions */}
              {isSearching && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CircularProgress size={16} sx={{ color: '#6C5CE7' }} />
                  <Typography sx={{ fontSize: 13, color: '#9ca3af' }}>Searching...</Typography>
                </Box>
              )}

              {placeSuggestions.length > 0 && (
                <>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    📍 Locations
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    {placeSuggestions.slice(0, 5).map((place) => (
                      <Box
                        key={place.id}
                        onClick={() => handleSelectPlace(place)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: '12px',
                          backgroundColor: '#f9fafb',
                          cursor: 'pointer',
                          border: '1px solid transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(108,92,231,0.08)',
                            borderColor: '#6C5CE7',
                          },
                        }}
                      >
                        <MapPin size={18} color="#6C5CE7" />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {place.label}
                          </Typography>
                          {place.description && (
                            <Typography sx={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {place.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              {/* Quick suggestions - show when no search or as fallback */}
              {(!searchQuery.trim() || (searchQuery.trim() && placeSuggestions.length === 0 && !isSearching)) && (
                <>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Popular places
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {filteredSuggestions.map((place) => (
                      <Chip
                        key={place.id}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{place.emoji}</span>
                            <span>{place.label}</span>
                          </Box>
                        }
                        onClick={() => handleSelectPlace(place)}
                        sx={{
                          borderRadius: '10px',
                          py: 2,
                          px: 0.5,
                          fontSize: 14,
                          fontWeight: 500,
                          backgroundColor: '#f3f4f6',
                          border: '1px solid transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(108,92,231,0.1)',
                            borderColor: '#6C5CE7',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}

              {/* Custom place button */}
              {customPlace.trim() && placeSuggestions.length === 0 && !filteredSuggestions.some(p => p.label.toLowerCase() === customPlace.toLowerCase()) && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCustomPlace}
                  startIcon={<MapPin size={18} />}
                  sx={{
                    mt: 2,
                    borderRadius: '12px',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    py: 1.5,
                    borderColor: '#6C5CE7',
                    color: '#6C5CE7',
                  }}
                >
                  Add "{customPlace}"
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Selected place */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  mb: 1,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(108,92,231,0.08)',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: '#6C5CE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{selectedPlace?.emoji}</span>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {selectedPlace?.label}
                  </Typography>
                  {selectedPlace?.address && (
                    <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                      {selectedPlace.address}
                    </Typography>
                  )}
                </Box>
                <IconButton size="small" onClick={() => setStep(1)}>
                  <X size={16} />
                </IconButton>
              </Box>

              {/* Optional: Search for specific location */}
              <TextField
                fullWidth
                size="small"
                placeholder="🔍 Add specific location (optional)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCustomPlace(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    // Update selected place with specific location
                    setSelectedPlace(prev => ({
                      ...prev,
                      address: searchQuery.trim(),
                    }));
                    setSearchQuery('');
                  }
                }}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#f9fafb',
                    fontSize: 14,
                  },
                }}
              />

              {/* Show "Add location" button when typing */}
              {searchQuery.trim() && (
                <Box sx={{ mb: 2 }}>
                  {/* Google Places suggestions */}
                  {placeSuggestions.length > 0 ? (
                    <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                      {placeSuggestions.slice(0, 3).map((place) => (
                        <Box
                          key={place.id}
                          onClick={() => {
                            handleSelectPlace(place);
                            setSearchQuery('');
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'rgba(108,92,231,0.08)' },
                          }}
                        >
                          <MapPin size={14} color="#6C5CE7" />
                          <Typography sx={{ fontSize: 13, color: '#1a1a2e' }}>
                            {place.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    /* Manual add button when no Google results */
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setSelectedPlace(prev => ({
                          ...prev,
                          address: searchQuery.trim(),
                        }));
                        setSearchQuery('');
                      }}
                      startIcon={<MapPin size={14} />}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        py: 1,
                        borderColor: '#6C5CE7',
                        color: '#6C5CE7',
                        fontSize: 13,
                      }}
                    >
                      Add "{searchQuery.trim()}"
                    </Button>
                  )}
                </Box>
              )}

              {/* Plan type toggle */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant={planType === 'onetime' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setPlanType('onetime');
                    setSelectedTime(null);
                  }}
                  startIcon={<Calendar size={16} />}
                  sx={{
                    flex: 1,
                    borderRadius: '10px',
                    textTransform: 'none',
                    py: 1,
                    ...(planType === 'onetime' ? {
                      backgroundColor: '#6C5CE7',
                      '&:hover': { backgroundColor: '#5B4BD5' },
                    } : {
                      borderColor: '#e5e7eb',
                      color: '#6b7280',
                    }),
                  }}
                >
                  One-time
                </Button>
                <Button
                  variant={planType === 'recurring' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setPlanType('recurring');
                    setSelectedTime(null);
                  }}
                  startIcon={<Repeat size={16} />}
                  sx={{
                    flex: 1,
                    borderRadius: '10px',
                    textTransform: 'none',
                    py: 1,
                    ...(planType === 'recurring' ? {
                      backgroundColor: '#6C5CE7',
                      '&:hover': { backgroundColor: '#5B4BD5' },
                    } : {
                      borderColor: '#e5e7eb',
                      color: '#6b7280',
                    }),
                  }}
                >
                  Recurring
                </Button>
              </Box>

              {/* Time options - different UI for one-time vs recurring */}
              {planType === 'onetime' ? (
                <>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    When? <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {TIME_OPTIONS.map((time) => (
                      <Chip
                        key={time.id}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{time.icon}</span>
                            <span>{time.label}</span>
                          </Box>
                        }
                        onClick={() => handleSelectTime(time)}
                        sx={{
                          borderRadius: '10px',
                          py: 2,
                          px: 0.5,
                          fontSize: 14,
                          fontWeight: 500,
                          backgroundColor: selectedTime?.id === time.id ? 'rgba(108,92,231,0.15)' : '#f3f4f6',
                          border: selectedTime?.id === time.id ? '2px solid #6C5CE7' : '1px solid transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(108,92,231,0.1)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </>
              ) : (
                <>
                  {/* Day selection for recurring */}
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Which days? <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
                    {DAYS_OF_WEEK.map((day) => (
                      <Chip
                        key={day.id}
                        label={day.label}
                        onClick={() => handleToggleDay(day.id)}
                        sx={{
                          borderRadius: '8px',
                          py: 1.5,
                          px: 0.5,
                          fontSize: 13,
                          fontWeight: 600,
                          minWidth: 44,
                          backgroundColor: selectedDays.includes(day.id) ? '#6C5CE7' : '#f3f4f6',
                          color: selectedDays.includes(day.id) ? '#fff' : '#4b5563',
                          border: selectedDays.includes(day.id) ? '2px solid #6C5CE7' : '1px solid #e5e7eb',
                          '&:hover': {
                            backgroundColor: selectedDays.includes(day.id) ? '#5B4BD5' : 'rgba(108,92,231,0.1)',
                          },
                        }}
                      />
                    ))}
                  </Box>

                  {/* Time of day selection */}
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    What time? <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {TIME_OF_DAY.map((time) => (
                      <Chip
                        key={time.id}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{time.icon}</span>
                            <span>{time.label}</span>
                          </Box>
                        }
                        onClick={() => handleSelectTimeOfDay(time)}
                        sx={{
                          borderRadius: '10px',
                          py: 2,
                          px: 0.5,
                          fontSize: 14,
                          fontWeight: 500,
                          backgroundColor: selectedTimeOfDay?.id === time.id ? 'rgba(108,92,231,0.15)' : '#f3f4f6',
                          border: selectedTimeOfDay?.id === time.id ? '2px solid #6C5CE7' : '1px solid transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(108,92,231,0.1)',
                          },
                        }}
                      />
                    ))}
                  </Box>

                  {/* Preview of selection */}
                  {selectedDays.length > 0 && selectedTimeOfDay && (
                    <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: '10px' }}>
                      <Typography sx={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>
                        ✓ {selectedPlace?.label} • {formatSelectedDays()} {selectedTimeOfDay.label.toLowerCase()}s
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, pt: 0 }}>
        {step === 2 && (
          <>
            {/* Privacy Toggle */}
            <Box 
              sx={{ 
                mb: 2, 
                p: 1.5, 
                backgroundColor: '#f8fafc', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                  Show on profile
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#64748b' }}>
                  {showOnProfile ? 'Visible to others' : 'Hidden, used for matching only'}
                </Typography>
              </Box>
              <Box
                onClick={() => {
                  const newValue = !showOnProfile;
                  setShowOnProfile(newValue);
                  localStorage.setItem('pulse.weeklyRhythmVisibility', String(newValue));
                }}
                sx={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: showOnProfile ? '#22c55e' : '#e5e7eb',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    position: 'absolute',
                    top: 2,
                    left: showOnProfile ? 22 : 2,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              disabled={!canSave}
              startIcon={<Check size={18} />}
              sx={{
                borderRadius: '12px',
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 15,
                backgroundColor: '#6C5CE7',
                '&:hover': { backgroundColor: '#5B4BD5' },
                '&:disabled': {
                  backgroundColor: '#e5e7eb',
                  color: '#9ca3af',
                },
              }}
            >
              Add plan
            </Button>
          </>
        )}
      </Box>
    </Dialog>
  );
}
