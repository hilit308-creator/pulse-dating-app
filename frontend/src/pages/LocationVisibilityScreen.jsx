/**
 * LocationVisibilityScreen - Location-Based Visibility Settings
 * 
 * Two layers:
 * Layer 1 - Areas I Don't Want to Be Seen (hiding zones)
 * Layer 2 - Places I'll Be Around (future locations)
 */

import React, { useState } from 'react';
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
} from 'lucide-react';

const LocationVisibilityScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [showAddZoneDialog, setShowAddZoneDialog] = useState(false);
  const [showAddPlaceDialog, setShowAddPlaceDialog] = useState(false);
  
  // Hidden zones state
  const [hiddenZones, setHiddenZones] = useState([
    { id: 1, name: 'Work', radius: 500, schedule: 'weekdays', timeRange: '09:00-18:00', icon: 'building' },
    { id: 2, name: 'Family area', radius: 1000, schedule: 'always', timeRange: null, icon: 'home' },
  ]);
  
  // Future places state
  const [futurePlaces, setFuturePlaces] = useState([
    { id: 1, name: 'Downtown', when: 'Today', timeRange: '18:00-22:00', icon: 'coffee' },
    { id: 2, name: 'Gym', when: 'This week', timeRange: 'Evenings', icon: 'users' },
  ]);
  
  // New zone form
  const [newZone, setNewZone] = useState({
    name: '',
    radius: 500,
    schedule: 'always',
    timeRange: '',
  });
  
  // New place form
  const [newPlace, setNewPlace] = useState({
    name: '',
    when: 'today',
    timeRange: '',
  });

  const handleBack = () => navigate(-1);

  const getIcon = (iconName) => {
    const icons = {
      building: <Building size={18} />,
      home: <Home size={18} />,
      users: <Users size={18} />,
      coffee: <Coffee size={18} />,
    };
    return icons[iconName] || <MapPin size={18} />;
  };

  const handleAddZone = () => {
    if (newZone.name) {
      setHiddenZones([...hiddenZones, {
        id: Date.now(),
        ...newZone,
        icon: 'building',
      }]);
      setNewZone({ name: '', radius: 500, schedule: 'always', timeRange: '' });
      setShowAddZoneDialog(false);
    }
  };

  const handleAddPlace = () => {
    if (newPlace.name) {
      setFuturePlaces([...futurePlaces, {
        id: Date.now(),
        ...newPlace,
        icon: 'coffee',
      }]);
      setNewPlace({ name: '', when: 'today', timeRange: '' });
      setShowAddPlaceDialog(false);
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

      {/* Map Placeholder */}
      <Box
        sx={{
          height: 200,
          backgroundColor: '#e8f4f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #e0e7ff 100%)',
          }}
        />
        <Box sx={{ position: 'relative', textAlign: 'center' }}>
          <MapPin size={48} color="#6C5CE7" />
          <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
            Map preview
          </Typography>
        </Box>
        
        {/* Sample zones on map */}
        {activeTab === 0 && hiddenZones.map((zone, i) => (
          <Box
            key={zone.id}
            sx={{
              position: 'absolute',
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'rgba(239,68,68,0.2)',
              border: '2px dashed #ef4444',
              top: 40 + i * 30,
              left: 60 + i * 80,
            }}
          />
        ))}
        
        {activeTab === 1 && futurePlaces.map((place, i) => (
          <Box
            key={place.id}
            sx={{
              position: 'absolute',
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 0 4px rgba(34,197,94,0.3)',
              top: 60 + i * 40,
              right: 60 + i * 60,
            }}
          />
        ))}
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
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Hidden Area</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Area name"
            placeholder="e.g., Work, Gym, Family"
            value={newZone.name}
            onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          
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
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': { backgroundColor: '#dc2626' },
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
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Future Place</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Place name"
            placeholder="e.g., Downtown, Beach, Cafe"
            value={newPlace.name}
            onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>When</InputLabel>
            <Select
              value={newPlace.when}
              onChange={(e) => setNewPlace({ ...newPlace, when: e.target.value })}
              label="When"
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="tomorrow">Tomorrow</MenuItem>
              <MenuItem value="this_week">This week</MenuItem>
              <MenuItem value="next_week">Next week</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Time range (optional)"
            placeholder="e.g., 18:00-22:00, Evenings"
            value={newPlace.timeRange}
            onChange={(e) => setNewPlace({ ...newPlace, timeRange: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowAddPlaceDialog(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddPlace}
            sx={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            }}
          >
            Add Place
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocationVisibilityScreen;
