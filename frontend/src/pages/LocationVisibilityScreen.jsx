/**
 * LocationVisibilityScreen - Location-Based Visibility Settings
 * 
 * Two layers:
 * Layer 1 - Areas I Don't Want to Be Seen (hiding zones)
 * Layer 2 - Places I'll Be Around (future locations)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Snackbar,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  EyeOff,
  Calendar,
  Plus,
  Trash2,
  Clock,
  Building,
  Home,
  Users,
  Coffee,
  Briefcase,
  Heart,
  ShoppingBag,
  Dumbbell,
  GraduationCap,
  Church,
  Car,
  Plane,
  Music,
  Camera,
  Search,
  X,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../context/LanguageContext';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon (simple dot)
const createCustomIcon = (color) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom marker with label and icon
const createLabeledIcon = (name, iconId, color, isZone = false) => {
  const iconMap = {
    building: '🏢', home: '🏠', briefcase: '💼', coffee: '☕', users: '👥',
    dumbbell: '💪', graduation: '🎓', shopping: '🛍️', heart: '❤️', church: '⛪',
    car: '🚗', plane: '✈️', music: '🎵', camera: '📷', mappin: '📍',
  };
  const emoji = iconMap[iconId] || '📍';
  
  return new L.DivIcon({
    className: 'labeled-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translateX(-50%);
      ">
        <div style="
          background: white;
          border-radius: 12px;
          padding: 4px 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          border: 2px solid ${color};
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          max-width: 120px;
        ">
          <span style="font-size: 14px;">${emoji}</span>
          <span style="font-size: 11px; font-weight: 600; color: #1a1a2e; overflow: hidden; text-overflow: ellipsis;">${name}</span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
          margin-top: -1px;
        "></div>
        ${isZone ? '' : `<div style="
          width: 8px;
          height: 8px;
          background: ${color};
          border-radius: 50%;
          margin-top: 2px;
        "></div>`}
      </div>
    `,
    iconSize: [100, 50],
    iconAnchor: [50, 50],
  });
};

// Location picker component
const LocationPicker = ({ onLocationSelect, selectedLocation }) => {
  const map = useMapEvents({
    click: (e) => {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={createCustomIcon('#6C5CE7')} />
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

// Available icons for locations
const availableIcons = [
  { id: 'building', icon: Building, label: 'Office' },
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'briefcase', icon: Briefcase, label: 'Work' },
  { id: 'coffee', icon: Coffee, label: 'Cafe' },
  { id: 'users', icon: Users, label: 'Social' },
  { id: 'dumbbell', icon: Dumbbell, label: 'Gym' },
  { id: 'graduation', icon: GraduationCap, label: 'School' },
  { id: 'shopping', icon: ShoppingBag, label: 'Shopping' },
  { id: 'heart', icon: Heart, label: 'Dating' },
  { id: 'church', icon: Church, label: 'Religious' },
  { id: 'car', icon: Car, label: 'Commute' },
  { id: 'plane', icon: Plane, label: 'Travel' },
  { id: 'music', icon: Music, label: 'Entertainment' },
  { id: 'camera', icon: Camera, label: 'Scenic' },
  { id: 'mappin', icon: MapPin, label: 'Other' },
];

const LocationVisibilityScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [showAddZoneDialog, setShowAddZoneDialog] = useState(false);
  const [showAddPlaceDialog, setShowAddPlaceDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // User's current location (default to Tel Aviv)
  const [userLocation, setUserLocation] = useState({ lat: 32.0853, lng: 34.7818 });
  const [mapCenter, setMapCenter] = useState({ lat: 32.0853, lng: 34.7818 });
  
  // Hidden zones state
  const [hiddenZones, setHiddenZones] = useState([
    { id: 1, name: 'Work', radius: 500, schedule: 'weekdays', timeRange: '09:00-18:00', icon: 'building', lat: 32.0853, lng: 34.7818 },
    { id: 2, name: 'Family area', radius: 1000, schedule: 'always', timeRange: null, icon: 'home', lat: 32.0700, lng: 34.7700 },
  ]);
  
  // Future places state
  const [futurePlaces, setFuturePlaces] = useState([
    { id: 1, name: 'Downtown', when: 'Today', timeRange: '18:00-22:00', icon: 'coffee', lat: 32.0900, lng: 34.7900 },
    { id: 2, name: 'Gym', when: 'This week', timeRange: 'Evenings', icon: 'dumbbell', lat: 32.0750, lng: 34.7850 },
  ]);
  
  // New zone form
  const [newZone, setNewZone] = useState({
    name: '',
    radius: 500,
    schedule: 'always',
    timeRange: '',
    icon: 'building',
    location: null,
  });
  
  // New place form
  const [newPlace, setNewPlace] = useState({
    name: '',
    when: 'today',
    timeRange: '',
    icon: 'coffee',
    location: null,
  });

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          setMapCenter(loc);
        },
        () => console.log('Location permission denied'),
        { timeout: 10000 }
      );
    }
  }, []);

  const handleBack = () => navigate(-1);

  const getIcon = (iconName) => {
    const iconMap = availableIcons.find(i => i.id === iconName);
    if (iconMap) {
      const IconComponent = iconMap.icon;
      return <IconComponent size={18} />;
    }
    return <MapPin size={18} />;
  };

  // Search for places using Nominatim (OpenStreetMap)
  const searchPlaces = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.map(item => ({
        name: item.display_name.split(',')[0],
        fullName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      })));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result, isZone = true) => {
    const location = { lat: result.lat, lng: result.lng };
    setMapCenter(location);
    if (isZone) {
      setNewZone({ ...newZone, location, name: newZone.name || result.name });
    } else {
      setNewPlace({ ...newPlace, location, name: newPlace.name || result.name });
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddZone = () => {
    if (newZone.name && newZone.location) {
      setHiddenZones([...hiddenZones, {
        id: Date.now(),
        name: newZone.name,
        radius: newZone.radius,
        schedule: newZone.schedule,
        timeRange: newZone.timeRange,
        icon: newZone.icon,
        lat: newZone.location.lat,
        lng: newZone.location.lng,
      }]);
      setNewZone({ name: '', radius: 500, schedule: 'always', timeRange: '', icon: 'building', location: null });
      setShowAddZoneDialog(false);
      setSnackbar({ open: true, message: 'Hidden area added successfully' });
    } else if (!newZone.location) {
      setSnackbar({ open: true, message: 'Please select a location on the map' });
    }
  };

  const handleAddPlace = () => {
    if (newPlace.name && newPlace.location) {
      setFuturePlaces([...futurePlaces, {
        id: Date.now(),
        name: newPlace.name,
        when: newPlace.when,
        timeRange: newPlace.timeRange,
        icon: newPlace.icon,
        lat: newPlace.location.lat,
        lng: newPlace.location.lng,
      }]);
      setNewPlace({ name: '', when: 'today', timeRange: '', icon: 'coffee', location: null });
      setShowAddPlaceDialog(false);
      setSnackbar({ open: true, message: 'Future place added successfully' });
    } else if (!newPlace.location) {
      setSnackbar({ open: true, message: 'Please select a location on the map' });
    }
  };

  const handleDeleteZone = (id) => {
    setHiddenZones(hiddenZones.filter(z => z.id !== id));
  };

  const handleDeletePlace = (id) => {
    setFuturePlaces(futurePlaces.filter(p => p.id !== id));
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fff', pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 10,
        }}
      >
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowLeft size={22} color="#1a1a2e" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          Location Visibility
        </Typography>
      </Box>

      {/* Interactive Map */}
      <Box sx={{ height: 220, position: 'relative' }}>
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User's current location */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createCustomIcon('#6C5CE7')} />
          
          {/* Hidden zones with circles */}
          {activeTab === 0 && hiddenZones.map((zone) => (
            <React.Fragment key={zone.id}>
              <Circle
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.2,
                  dashArray: '10, 10',
                }}
              />
              <Marker 
                position={[zone.lat, zone.lng]} 
                icon={createLabeledIcon(zone.name, zone.icon, '#ef4444', true)} 
              />
            </React.Fragment>
          ))}
          
          {/* Future places with labeled markers */}
          {activeTab === 1 && futurePlaces.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createLabeledIcon(place.name, place.icon, '#22c55e', false)}
            />
          ))}
        </MapContainer>
        
        {/* Map overlay info */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '8px',
            px: 1.5,
            py: 0.5,
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
            {activeTab === 0 ? `${hiddenZones.length} hidden areas` : `${futurePlaces.length} future places`}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        variant="fullWidth"
        sx={{
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          },
          '& .Mui-selected': {
            color: '#6C5CE7',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#6C5CE7',
          },
        }}
      >
        <Tab icon={<EyeOff size={18} />} iconPosition="start" label="Hidden Areas" />
        <Tab icon={<MapPin size={18} />} iconPosition="start" label="Future Places" />
      </Tabs>

      {/* Content */}
      <Box sx={{ px: 2, pt: 2 }}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Tab 0: Hidden Areas */}
          {activeTab === 0 && (
            <>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Areas where you don't want to be seen. Block contexts, not people.
              </Typography>
              
              {hiddenZones.map((zone) => (
                <Box
                  key={zone.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    mb: 1.5,
                    backgroundColor: '#fef2f2',
                    borderRadius: '16px',
                    border: '1px solid rgba(239,68,68,0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(239,68,68,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                      }}
                    >
                      {getIcon(zone.icon)}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                        {zone.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {zone.radius}m radius • {zone.schedule === 'always' ? 'Always' : zone.timeRange}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => handleDeleteZone(zone.id)}>
                    <Trash2 size={18} color="#ef4444" />
                  </IconButton>
                </Box>
              ))}

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Plus size={18} />}
                onClick={() => setShowAddZoneDialog(true)}
                sx={{
                  mt: 1,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'rgba(239,68,68,0.3)',
                  color: '#ef4444',
                  '&:hover': {
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,0.05)',
                  },
                }}
              >
                Add hidden area
              </Button>
            </>
          )}

          {/* Tab 1: Future Places */}
          {activeTab === 1 && (
            <>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Places where you expect to be. This helps suggest matches with real overlap.
              </Typography>
              
              {futurePlaces.map((place) => (
                <Box
                  key={place.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    mb: 1.5,
                    backgroundColor: '#f0fdf4',
                    borderRadius: '16px',
                    border: '1px solid rgba(34,197,94,0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(34,197,94,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#22c55e',
                      }}
                    >
                      {getIcon(place.icon)}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                        {place.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {place.when} • {place.timeRange}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => handleDeletePlace(place.id)}>
                    <Trash2 size={18} color="#64748b" />
                  </IconButton>
                </Box>
              ))}

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Plus size={18} />}
                onClick={() => setShowAddPlaceDialog(true)}
                sx={{
                  mt: 1,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'rgba(34,197,94,0.3)',
                  color: '#22c55e',
                  '&:hover': {
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34,197,94,0.05)',
                  },
                }}
              >
                Add future place
              </Button>

              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  💡 This doesn't force visibility — it enables suggestions with real overlap.
                </Typography>
              </Box>
            </>
          )}
        </motion.div>
      </Box>

      {/* Add Hidden Zone Dialog */}
      <Dialog
        open={showAddZoneDialog}
        onClose={() => setShowAddZoneDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '20px', p: 1, maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add Hidden Area
          <IconButton onClick={() => setShowAddZoneDialog(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          {/* Search box */}
          <Box sx={{ position: 'relative', mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search size={18} color="#64748b" style={{ marginRight: 8 }} />,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            {searchResults.length > 0 && (
              <Box sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                zIndex: 1000,
                mt: 0.5,
                maxHeight: 200,
                overflow: 'auto',
              }}>
                {searchResults.map((result, idx) => (
                  <Box
                    key={idx}
                    onClick={() => handleSelectSearchResult(result, true)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      '&:hover': { backgroundColor: '#f8fafc' },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{result.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>{result.fullName}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Map for location selection */}
          <Box sx={{ height: 200, borderRadius: '12px', overflow: 'hidden', mb: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapCenterUpdater center={mapCenter} />
              <LocationPicker 
                onLocationSelect={(loc) => setNewZone({ ...newZone, location: loc })} 
                selectedLocation={newZone.location}
              />
              {newZone.location && (
                <Circle
                  center={[newZone.location.lat, newZone.location.lng]}
                  radius={newZone.radius}
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 }}
                />
              )}
            </MapContainer>
          </Box>
          
          <Typography variant="caption" sx={{ color: newZone.location ? '#22c55e' : '#64748b', mb: 2, display: 'block' }}>
            {newZone.location ? '✓ Location selected - tap map to change' : 'Tap on the map to select a location'}
          </Typography>

          <TextField
            fullWidth
            label="Area name"
            placeholder="e.g., Work, Gym, Family"
            value={newZone.name}
            onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          {/* Icon picker */}
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Choose an icon</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {availableIcons.slice(0, 10).map((iconItem) => {
              const IconComp = iconItem.icon;
              return (
                <Box
                  key={iconItem.id}
                  onClick={() => setNewZone({ ...newZone, icon: iconItem.id })}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: newZone.icon === iconItem.id ? 'rgba(239,68,68,0.15)' : '#f8fafc',
                    border: newZone.icon === iconItem.id ? '2px solid #ef4444' : '1px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': { backgroundColor: 'rgba(239,68,68,0.1)' },
                  }}
                >
                  <IconComp size={20} color={newZone.icon === iconItem.id ? '#ef4444' : '#64748b'} />
                </Box>
              );
            })}
          </Box>
          
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Radius: {newZone.radius}m
          </Typography>
          <Slider
            value={newZone.radius}
            onChange={(e, v) => setNewZone({ ...newZone, radius: v })}
            min={100}
            max={2000}
            step={100}
            sx={{ color: '#ef4444', mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>When to hide</InputLabel>
            <Select
              value={newZone.schedule}
              onChange={(e) => setNewZone({ ...newZone, schedule: e.target.value })}
              label="When to hide"
            >
              <MenuItem value="always">Always</MenuItem>
              <MenuItem value="weekdays">Weekdays only</MenuItem>
              <MenuItem value="weekends">Weekends only</MenuItem>
              <MenuItem value="custom">Custom times</MenuItem>
            </Select>
          </FormControl>
          
          {newZone.schedule === 'custom' && (
            <TextField
              fullWidth
              label="Time range"
              placeholder="e.g., 09:00-18:00"
              value={newZone.timeRange}
              onChange={(e) => setNewZone({ ...newZone, timeRange: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowAddZoneDialog(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddZone}
            disabled={!newZone.name || !newZone.location}
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': { backgroundColor: '#dc2626' },
              '&:disabled': { backgroundColor: '#fca5a5' },
            }}
          >
            Add Area
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Future Place Dialog */}
      <Dialog
        open={showAddPlaceDialog}
        onClose={() => setShowAddPlaceDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '20px', p: 1, maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add Future Place
          <IconButton onClick={() => setShowAddPlaceDialog(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          {/* Search box */}
          <Box sx={{ position: 'relative', mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search size={18} color="#64748b" style={{ marginRight: 8 }} />,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            {searchResults.length > 0 && (
              <Box sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                zIndex: 1000,
                mt: 0.5,
                maxHeight: 200,
                overflow: 'auto',
              }}>
                {searchResults.map((result, idx) => (
                  <Box
                    key={idx}
                    onClick={() => handleSelectSearchResult(result, false)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      '&:hover': { backgroundColor: '#f8fafc' },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{result.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>{result.fullName}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Map for location selection */}
          <Box sx={{ height: 200, borderRadius: '12px', overflow: 'hidden', mb: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapCenterUpdater center={mapCenter} />
              <LocationPicker 
                onLocationSelect={(loc) => setNewPlace({ ...newPlace, location: loc })} 
                selectedLocation={newPlace.location}
              />
            </MapContainer>
          </Box>
          
          <Typography variant="caption" sx={{ color: newPlace.location ? '#22c55e' : '#64748b', mb: 2, display: 'block' }}>
            {newPlace.location ? '✓ Location selected - tap map to change' : 'Tap on the map to select a location'}
          </Typography>

          <TextField
            fullWidth
            label="Place name"
            placeholder="e.g., Downtown, Beach, Cafe"
            value={newPlace.name}
            onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          {/* Icon picker */}
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Choose an icon</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {availableIcons.slice(0, 10).map((iconItem) => {
              const IconComp = iconItem.icon;
              return (
                <Box
                  key={iconItem.id}
                  onClick={() => setNewPlace({ ...newPlace, icon: iconItem.id })}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: newPlace.icon === iconItem.id ? 'rgba(34,197,94,0.15)' : '#f8fafc',
                    border: newPlace.icon === iconItem.id ? '2px solid #22c55e' : '1px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': { backgroundColor: 'rgba(34,197,94,0.1)' },
                  }}
                >
                  <IconComp size={20} color={newPlace.icon === iconItem.id ? '#22c55e' : '#64748b'} />
                </Box>
              );
            })}
          </Box>
          
          {/* When selection */}
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>When will you be there?</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {[
              { value: 'today', label: 'Today' },
              { value: 'tomorrow', label: 'Tomorrow' },
              { value: 'this_week', label: 'This Week' },
              { value: 'next_week', label: 'Next Week' },
              { value: 'weekends', label: 'Weekends' },
              { value: 'recurring', label: 'Recurring' },
            ].map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                onClick={() => setNewPlace({ ...newPlace, when: option.value })}
                sx={{
                  backgroundColor: newPlace.when === option.value ? '#22c55e' : '#f1f5f9',
                  color: newPlace.when === option.value ? '#fff' : '#64748b',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: newPlace.when === option.value ? '#16a34a' : '#e2e8f0' },
                }}
              />
            ))}
          </Box>

          {/* Days selection for recurring */}
          {newPlace.when === 'recurring' && (
            <>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Select days</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                  <Box
                    key={day}
                    onClick={() => {
                      const days = newPlace.days || [];
                      const newDays = days.includes(idx) ? days.filter(d => d !== idx) : [...days, idx];
                      setNewPlace({ ...newPlace, days: newDays });
                    }}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: (newPlace.days || []).includes(idx) ? '#22c55e' : '#f1f5f9',
                      color: (newPlace.days || []).includes(idx) ? '#fff' : '#64748b',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.1)' },
                    }}
                  >
                    {day}
                  </Box>
                ))}
              </Box>
            </>
          )}

          {/* Time selection */}
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Time of day</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {[
              { value: 'morning', label: '🌅 Morning', time: '06:00-12:00' },
              { value: 'afternoon', label: '☀️ Afternoon', time: '12:00-17:00' },
              { value: 'evening', label: '🌆 Evening', time: '17:00-21:00' },
              { value: 'night', label: '🌙 Night', time: '21:00-02:00' },
              { value: 'all_day', label: '📅 All Day', time: 'All day' },
            ].map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                onClick={() => setNewPlace({ ...newPlace, timeRange: option.time, timePreset: option.value })}
                sx={{
                  backgroundColor: newPlace.timePreset === option.value ? '#22c55e' : '#f1f5f9',
                  color: newPlace.timePreset === option.value ? '#fff' : '#64748b',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: newPlace.timePreset === option.value ? '#16a34a' : '#e2e8f0' },
                }}
              />
            ))}
          </Box>

          {/* Custom time option */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="time"
              label="From"
              value={newPlace.startTime || ''}
              onChange={(e) => {
                const start = e.target.value;
                const end = newPlace.endTime || '';
                setNewPlace({ 
                  ...newPlace, 
                  startTime: start,
                  timeRange: start && end ? `${start}-${end}` : '',
                  timePreset: 'custom',
                });
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <Typography sx={{ color: '#64748b' }}>-</Typography>
            <TextField
              size="small"
              type="time"
              label="To"
              value={newPlace.endTime || ''}
              onChange={(e) => {
                const end = e.target.value;
                const start = newPlace.startTime || '';
                setNewPlace({ 
                  ...newPlace, 
                  endTime: end,
                  timeRange: start && end ? `${start}-${end}` : '',
                  timePreset: 'custom',
                });
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowAddPlaceDialog(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddPlace}
            disabled={!newPlace.name || !newPlace.location}
            sx={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              '&:disabled': { background: '#86efac' },
            }}
          >
            Add Place
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default LocationVisibilityScreen;
