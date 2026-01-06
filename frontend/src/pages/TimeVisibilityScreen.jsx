/**
 * TimeVisibilityScreen - Time-Based Visibility Settings
 * 
 * Set hours when you don't want suggestions or to appear
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Switch,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Sun,
  Moon,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TimeVisibilityScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showAddScheduleDialog, setShowAddScheduleDialog] = useState(false);
  
  // Active hours settings
  const [activeHoursEnabled, setActiveHoursEnabled] = useState(true);
  const [activeHours, setActiveHours] = useState({ start: '08:00', end: '23:00' });
  
  // Quiet periods
  const [quietPeriods, setQuietPeriods] = useState([
    { id: 1, name: 'Work hours', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], start: '09:00', end: '17:00' },
    { id: 2, name: 'Sleep time', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], start: '23:00', end: '07:00' },
  ]);
  
  // New schedule form
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    days: [],
    start: '09:00',
    end: '17:00',
  });

  const handleBack = () => navigate(-1);

  const handleAddSchedule = () => {
    if (newSchedule.name && newSchedule.days.length > 0) {
      setQuietPeriods([...quietPeriods, { id: Date.now(), ...newSchedule }]);
      setNewSchedule({ name: '', days: [], start: '09:00', end: '17:00' });
      setShowAddScheduleDialog(false);
    }
  };

  const handleDeleteSchedule = (id) => {
    setQuietPeriods(quietPeriods.filter(p => p.id !== id));
  };

  const toggleDay = (day) => {
    if (newSchedule.days.includes(day)) {
      setNewSchedule({ ...newSchedule, days: newSchedule.days.filter(d => d !== day) });
    } else {
      setNewSchedule({ ...newSchedule, days: [...newSchedule.days, day] });
    }
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
          Time Visibility
        </Typography>
      </Box>

      <Box sx={{ px: 2, pt: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Active Hours Section */}
          <Box
            sx={{
              p: 2.5,
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Clock size={22} color="#fff" />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    Active Hours
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    When you're open to suggestions
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={activeHoursEnabled}
                onChange={(e) => setActiveHoursEnabled(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C5CE7' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C5CE7' },
                }}
              />
            </Box>

            {activeHoursEnabled && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                    From
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <Sun size={16} color="#f59e0b" />
                    <TextField
                      type="time"
                      value={activeHours.start}
                      onChange={(e) => setActiveHours({ ...activeHours, start: e.target.value })}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      sx={{ '& input': { p: 0, fontSize: '0.9rem', fontWeight: 600 } }}
                    />
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                    To
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <Moon size={16} color="#6366f1" />
                    <TextField
                      type="time"
                      value={activeHours.end}
                      onChange={(e) => setActiveHours({ ...activeHours, end: e.target.value })}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      sx={{ '& input': { p: 0, fontSize: '0.9rem', fontWeight: 600 } }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Quiet Periods Section */}
          <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 600, px: 1 }}>
            Quiet Periods
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2, px: 1 }}>
            Times when you don't want to appear or receive suggestions
          </Typography>

          {quietPeriods.map((period) => (
            <Box
              key={period.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                mb: 1.5,
                backgroundColor: '#fef3c7',
                borderRadius: '16px',
                border: '1px solid rgba(245,158,11,0.2)',
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                  {period.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  {period.start} - {period.end}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                  {period.days.map((day) => (
                    <Chip
                      key={day}
                      label={day}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        backgroundColor: 'rgba(245,158,11,0.2)',
                        color: '#92400e',
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <IconButton size="small" onClick={() => handleDeleteSchedule(period.id)}>
                <Trash2 size={18} color="#64748b" />
              </IconButton>
            </Box>
          ))}

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Plus size={18} />}
            onClick={() => setShowAddScheduleDialog(true)}
            sx={{
              mt: 1,
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(245,158,11,0.3)',
              color: '#d97706',
              '&:hover': {
                borderColor: '#d97706',
                backgroundColor: 'rgba(245,158,11,0.05)',
              },
            }}
          >
            Add quiet period
          </Button>

          {/* Info Box */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              💡 These settings apply to Nearby, Suggestions, and general visibility. Existing matches & chats are not affected.
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* Add Schedule Dialog */}
      <Dialog
        open={showAddScheduleDialog}
        onClose={() => setShowAddScheduleDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Quiet Period</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            placeholder="e.g., Work hours, Date night"
            value={newSchedule.name}
            onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />

          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Days
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
            {DAYS.map((day) => (
              <Chip
                key={day}
                label={day}
                size="small"
                onClick={() => toggleDay(day)}
                sx={{
                  backgroundColor: newSchedule.days.includes(day) ? '#d97706' : 'rgba(0,0,0,0.06)',
                  color: newSchedule.days.includes(day) ? '#fff' : '#64748b',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: newSchedule.days.includes(day) ? '#b45309' : 'rgba(0,0,0,0.1)',
                  },
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start"
              type="time"
              value={newSchedule.start}
              onChange={(e) => setNewSchedule({ ...newSchedule, start: e.target.value })}
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End"
              type="time"
              value={newSchedule.end}
              onChange={(e) => setNewSchedule({ ...newSchedule, end: e.target.value })}
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowAddScheduleDialog(false)} sx={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddSchedule}
            sx={{
              backgroundColor: '#d97706',
              '&:hover': { backgroundColor: '#b45309' },
            }}
          >
            Add Period
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeVisibilityScreen;
