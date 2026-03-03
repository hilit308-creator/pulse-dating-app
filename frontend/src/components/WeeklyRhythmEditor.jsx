/**
 * WeeklyRhythmEditor.jsx
 * Edit Profile component for managing weekly rhythm
 * Allows users to add/edit/delete recurring activities and upcoming plans
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  IconButton,
  Chip,
} from '@mui/material';
import { Plus, Edit2, Trash2, Calendar, Clock, Eye, EyeOff, Users } from 'lucide-react';

// Frequency options for recurring plans
const frequencyOptions = [
  { value: 'weekday_mornings', label: 'Weekday mornings' },
  { value: 'weekday_afternoons', label: 'Weekday afternoons' },
  { value: 'midweek_evenings', label: 'Midweek evenings' },
  { value: 'late_nights', label: 'Late nights' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'custom', label: 'Custom' },
];

// Date type options for upcoming plans
const dateTypeOptions = [
  { value: 'tonight', label: 'Tonight' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'this_weekend', label: 'This weekend' },
  { value: 'next_week', label: 'Next week' },
  { value: 'custom', label: 'Custom' },
];

// Visibility options
const visibilityOptions = [
  { value: 'hidden', label: 'Hidden', description: 'Not shown on your profile', icon: EyeOff },
  { value: 'matches', label: 'Matches only', description: 'Only visible to people you match with', icon: Users, recommended: true },
  { value: 'everyone', label: 'Everyone', description: 'Visible to anyone viewing your profile', icon: Eye },
];

const WeeklyRhythmEditor = ({ userRhythm, onChange, onSave }) => {
  const [rhythm, setRhythm] = useState(userRhythm || {
    visibility: 'matches',
    recurring: [],
    upcoming: [],
  });
  
  // Dialog states
  const [addRecurringOpen, setAddRecurringOpen] = useState(false);
  const [addUpcomingOpen, setAddUpcomingOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form states
  const [newLabel, setNewLabel] = useState('');
  const [newFrequency, setNewFrequency] = useState('weekday_mornings');
  const [newDateType, setNewDateType] = useState('this_weekend');
  const [customText, setCustomText] = useState('');

  const hasItems = rhythm.recurring.length > 0 || rhythm.upcoming.length > 0;

  // Update rhythm and notify parent
  const updateRhythm = (newRhythm) => {
    setRhythm(newRhythm);
    onChange?.(newRhythm);
  };

  // Add recurring plan
  const handleAddRecurring = () => {
    if (!newLabel.trim() || newLabel.length > 40) return;
    
    const newItem = {
      id: `r-${Date.now()}`,
      label: newLabel.trim(),
      frequency: newFrequency,
      customText: newFrequency === 'custom' ? customText : undefined,
    };
    
    updateRhythm({
      ...rhythm,
      recurring: [...rhythm.recurring, newItem],
    });
    
    resetForm();
    setAddRecurringOpen(false);
  };

  // Add upcoming plan
  const handleAddUpcoming = () => {
    if (!newLabel.trim() || newLabel.length > 40) return;
    
    const newItem = {
      id: `u-${Date.now()}`,
      label: newLabel.trim(),
      dateType: newDateType,
      source: 'manual',
    };
    
    updateRhythm({
      ...rhythm,
      upcoming: [...rhythm.upcoming, newItem],
    });
    
    resetForm();
    setAddUpcomingOpen(false);
  };

  // Delete item
  const handleDelete = (type, id) => {
    if (type === 'recurring') {
      updateRhythm({
        ...rhythm,
        recurring: rhythm.recurring.filter(item => item.id !== id),
      });
    } else {
      updateRhythm({
        ...rhythm,
        upcoming: rhythm.upcoming.filter(item => item.id !== id),
      });
    }
  };

  // Update visibility
  const handleVisibilityChange = (value) => {
    updateRhythm({
      ...rhythm,
      visibility: value,
    });
  };

  // Reset form
  const resetForm = () => {
    setNewLabel('');
    setNewFrequency('weekday_mornings');
    setNewDateType('this_weekend');
    setCustomText('');
    setEditingItem(null);
  };

  return (
    <Box sx={{ py: 3 }}>
      {/* Section Header */}
      <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', mb: 0.5 }}>
        My weekly rhythm
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 3, lineHeight: 1.5 }}>
        Share a few things you usually do - it helps Pulse suggest people you're more likely to actually meet.
      </Typography>

      {/* Empty State */}
      {!hasItems && (
        <Box
          sx={{
            p: 3,
            borderRadius: '12px',
            bgcolor: 'rgba(108,92,231,0.04)',
            border: '1px dashed rgba(108,92,231,0.2)',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151', mb: 1 }}>
            Add your rhythm
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 2, lineHeight: 1.5 }}>
            Add 1-3 recurring plans (like "Salsa nights" or "Gym mornings") so your profile feels more real - and your matches more relevant.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={() => setAddRecurringOpen(true)}
              sx={{
                bgcolor: '#6C5CE7',
                '&:hover': { bgcolor: '#5b4cdb' },
                textTransform: 'none',
                borderRadius: '8px',
              }}
            >
              Add a recurring plan
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Calendar size={16} />}
              onClick={() => setAddUpcomingOpen(true)}
              sx={{
                borderColor: '#6C5CE7',
                color: '#6C5CE7',
                '&:hover': { borderColor: '#5b4cdb', bgcolor: 'rgba(108,92,231,0.04)' },
                textTransform: 'none',
                borderRadius: '8px',
              }}
            >
              Add something upcoming
            </Button>
          </Box>
          <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 2 }}>
            You control who can see this.
          </Typography>
        </Box>
      )}

      {/* Items List */}
      {hasItems && (
        <>
          {/* Recurring Items */}
          {rhythm.recurring.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                Recurring
              </Typography>
              {rhythm.recurring.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                      {item.customText || frequencyOptions.find(f => f.value === item.frequency)?.label || item.frequency}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleDelete('recurring', item.id)}>
                      <Trash2 size={16} color="#ef4444" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              {rhythm.recurring.length < 5 && (
                <Button
                  size="small"
                  startIcon={<Plus size={14} />}
                  onClick={() => setAddRecurringOpen(true)}
                  sx={{ mt: 1, textTransform: 'none', color: '#6C5CE7' }}
                >
                  Add another recurring plan
                </Button>
              )}
              {rhythm.recurring.length >= 3 && (
                <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 1 }}>
                  1-3 is perfect. Keep it simple.
                </Typography>
              )}
            </Box>
          )}

          {/* Upcoming Items */}
          {rhythm.upcoming.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                Coming up
              </Typography>
              {rhythm.upcoming.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {dateTypeOptions.find(d => d.value === item.dateType)?.label || item.dateType}
                        {item.source === 'event' && (
                          <Chip label="From events" size="small" sx={{ height: 16, fontSize: 9, bgcolor: 'rgba(108,92,231,0.1)', color: '#6C5CE7' }} />
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  {item.source !== 'event' && (
                    <IconButton size="small" onClick={() => handleDelete('upcoming', item.id)}>
                      <Trash2 size={16} color="#ef4444" />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<Plus size={14} />}
                onClick={() => setAddUpcomingOpen(true)}
                sx={{ mt: 1, textTransform: 'none', color: '#6C5CE7' }}
              >
                Add another upcoming plan
              </Button>
            </Box>
          )}

          {/* Add buttons if no items in a category */}
          {rhythm.recurring.length === 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={() => setAddRecurringOpen(true)}
              sx={{ mb: 2, textTransform: 'none', borderRadius: '8px' }}
            >
              Add a recurring plan
            </Button>
          )}
          {rhythm.upcoming.length === 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Calendar size={16} />}
              onClick={() => setAddUpcomingOpen(true)}
              sx={{ mb: 2, ml: rhythm.recurring.length === 0 ? 1 : 0, textTransform: 'none', borderRadius: '8px' }}
            >
              Add something upcoming
            </Button>
          )}

          {/* Visibility Control */}
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #f3f4f6' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 1.5 }}>
              Who can see this?
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={rhythm.visibility}
                onChange={(e) => handleVisibilityChange(e.target.value)}
              >
                {visibilityOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio size="small" sx={{ color: '#6C5CE7', '&.Mui-checked': { color: '#6C5CE7' } }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconComponent size={14} color="#6B7280" />
                          <Typography sx={{ fontSize: 13, color: '#374151' }}>
                            {option.label}
                            {option.recommended && (
                              <Typography component="span" sx={{ fontSize: 11, color: '#6C5CE7', ml: 0.5 }}>
                                (recommended)
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: 0.5 }}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
            <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 1 }}>
              We never show exact times or precise locations. You can change this anytime.
            </Typography>
          </Box>
        </>
      )}

      {/* Add Recurring Dialog */}
      <Dialog open={addRecurringOpen} onClose={() => { setAddRecurringOpen(false); resetForm(); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>Add a recurring plan</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="What do you usually do?"
            placeholder="e.g., Salsa nights, Gym sessions, Coffee + laptop"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value.slice(0, 40))}
            helperText={`${newLabel.length}/40 characters`}
            sx={{ mb: 2, mt: 1 }}
          />
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#374151', mb: 1 }}>
            When does it usually happen?
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup value={newFrequency} onChange={(e) => setNewFrequency(e.target.value)}>
              {frequencyOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={<Typography sx={{ fontSize: 13 }}>{option.label}</Typography>}
                />
              ))}
            </RadioGroup>
          </FormControl>
          {newFrequency === 'custom' && (
            <TextField
              fullWidth
              label="Describe the timing"
              placeholder="e.g., Mon/Wed/Fri evenings"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddRecurringOpen(false); resetForm(); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddRecurring}
            disabled={!newLabel.trim()}
            sx={{ bgcolor: '#6C5CE7', '&:hover': { bgcolor: '#5b4cdb' } }}
          >
            Save plan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Upcoming Dialog */}
      <Dialog open={addUpcomingOpen} onClose={() => { setAddUpcomingOpen(false); resetForm(); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>Add something upcoming</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="What's coming up?"
            placeholder="e.g., Dancing night, Beach walk, Work event"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value.slice(0, 40))}
            helperText="Don't include exact venues or addresses."
            sx={{ mb: 2, mt: 1 }}
          />
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#374151', mb: 1 }}>
            When?
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup value={newDateType} onChange={(e) => setNewDateType(e.target.value)}>
              {dateTypeOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={<Typography sx={{ fontSize: 13 }}>{option.label}</Typography>}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddUpcomingOpen(false); resetForm(); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddUpcoming}
            disabled={!newLabel.trim()}
            sx={{ bgcolor: '#6C5CE7', '&:hover': { bgcolor: '#5b4cdb' } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeeklyRhythmEditor;
