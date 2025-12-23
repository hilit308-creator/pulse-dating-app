import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Stack,
  Button,
  IconButton,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import { useEventForm } from '../store/eventForm';

function Section({ title, subtitle, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{subtitle}</Typography>
      )}
      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
        {children}
      </Box>
    </Box>
  );
}

export default function AddEvent() {
  const form = useEventForm();
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const capacityLeft = useMemo(() => {
    const sum = form.tickets.reduce((s, t) => s + Number(t.inventory || 0), 0);
    return Math.max(0, Number(form.capacity.maxCapacity || 0) - sum);
  }, [form.tickets, form.capacity.maxCapacity]);

  const validateAnd = (next) => {
    const e = form.validate();
    setErrors(e);
    if (Object.keys(e).length === 0) next?.();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f7f8', pb: 10 }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: '#f7f7f8', pt: 1, pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center' }}>Add Event</Typography>
      </Box>

      <Box sx={{ px: 2, pt: 1, maxWidth: 720, mx: 'auto' }}>
        {/* Basic Info */}
        <Section title="Basic Info" subtitle="Name, descriptions, tags, cover image">
          <Stack spacing={2}>
            <TextField
              label="Event Name"
              value={form.basic.title}
              onChange={(e) => form.setField('basic', 'title', e.target.value)}
              helperText={errors.title || `${form.basic.title.length}/60`}
              error={Boolean(errors.title)}
              inputProps={{ maxLength: 60 }}
              fullWidth
            />
            <TextField
              label="Short Description"
              value={form.basic.shortDescription}
              onChange={(e) => form.setField('basic', 'shortDescription', e.target.value)}
              inputProps={{ maxLength: 200 }}
              helperText={`${form.basic.shortDescription.length}/200`}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              label="Full Description (Markdown supported)"
              value={form.basic.fullDescription}
              onChange={(e) => form.setField('basic', 'fullDescription', e.target.value)}
              multiline
              minRows={4}
              fullWidth
            />
            <TextField
              label="Cover Image URL (16:9, ≥1200×675)"
              value={form.basic.coverUrl}
              onChange={(e) => form.setField('basic', 'coverUrl', e.target.value)}
              error={Boolean(errors.coverUrl)}
              helperText={errors.coverUrl || ''}
              fullWidth
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label="Add Tag"
                value={form._tagDraft || ''}
                onChange={(e) => form.setSection('_', { _tagDraft: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const tag = (form._tagDraft || '').trim();
                    if (tag && (form.basic.tags?.length || 0) < 5) {
                      form.setField('basic', 'tags', Array.from(new Set([...(form.basic.tags || []), tag])));
                      form.setSection('_', { _tagDraft: '' });
                    }
                    e.preventDefault();
                  }
                }}
                size="small"
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Up to 5
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {(form.basic.tags || []).map((t) => (
                <Chip key={t} label={t} onDelete={() => form.setField('basic', 'tags', (form.basic.tags || []).filter((x) => x !== t))} />
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField
                select
                label="Visibility"
                value={form.basic.visibility}
                onChange={(e) => form.setField('basic', 'visibility', e.target.value)}
                sx={{ flex: 1 }}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="unlisted">Unlisted</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </TextField>
              <TextField
                select
                label="Format"
                value={form.basic.type}
                onChange={(e) => form.setField('basic', 'type', e.target.value)}
                sx={{ flex: 1 }}
              >
                <MenuItem value="physical">Physical</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
              </TextField>
              <TextField
                select
                label="Size"
                value={form.basic.size}
                onChange={(e) => form.setField('basic', 'size', e.target.value)}
                sx={{ flex: 1 }}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </Section>

        {/* Time & Location */}
        <Section title="Time & Location" subtitle="Dates, address or online link, rules">
          <Stack spacing={2}>
            <TextField
              label="Timezone"
              value={form.schedule.timezone}
              onChange={(e) => form.setField('schedule', 'timezone', e.target.value)}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type="datetime-local"
                label="Start"
                InputLabelProps={{ shrink: true }}
                value={form.schedule.startAt}
                onChange={(e) => form.setField('schedule', 'startAt', e.target.value)}
                error={Boolean(errors.startAt)}
                helperText={errors.startAt || ''}
                sx={{ flex: 1 }}
              />
              <TextField
                type="datetime-local"
                label="End (optional)"
                InputLabelProps={{ shrink: true }}
                value={form.schedule.endAt}
                onChange={(e) => form.setField('schedule', 'endAt', e.target.value)}
                error={Boolean(errors.endAt)}
                helperText={errors.endAt || ''}
                sx={{ flex: 1 }}
              />
            </Stack>
            <TextField
              label={form.schedule.isOnline ? 'Zoom/Link' : 'Venue address'}
              value={form.schedule.isOnline ? form.schedule.onlineLink : form.schedule.locationText}
              onChange={(e) => form.setField('schedule', form.schedule.isOnline ? 'onlineLink' : 'locationText', e.target.value)}
              fullWidth
            />
            <FormControlLabel
              control={<Switch checked={form.schedule.isOnline} onChange={(e) => form.setField('schedule', 'isOnline', e.target.checked)} />}
              label="This is an online event"
            />
            <TextField
              label="Entry Rules (age/dress code, etc)"
              value={form.schedule.entryRules}
              onChange={(e) => form.setField('schedule', 'entryRules', e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </Section>

        {/* Capacity & Registration */}
        <Section title="Capacity & Registration" subtitle="Max capacity, counters, free/paid/donation, deadline">
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Max Capacity"
                type="number"
                value={form.capacity.maxCapacity}
                onChange={(e) => form.setField('capacity', 'maxCapacity', Number(e.target.value))}
                error={Boolean(errors.maxCapacity)}
                helperText={errors.maxCapacity || ''}
                sx={{ flex: 1 }}
              />
              <FormControlLabel
                control={<Switch checked={form.capacity.showCounter} onChange={(e) => form.setField('capacity', 'showCounter', e.target.checked)} />}
                label="Show registration counter"
              />
            </Stack>
            <ToggleButtonGroup
              exclusive
              value={form.capacity.registrationType}
              onChange={(_, v) => v && form.setField('capacity', 'registrationType', v)}
              size="small"
            >
              <ToggleButton value="free">Free</ToggleButton>
              <ToggleButton value="paid">Paid</ToggleButton>
              <ToggleButton value="donation">Donation</ToggleButton>
            </ToggleButtonGroup>
            <TextField
              type="datetime-local"
              label="Registration deadline"
              InputLabelProps={{ shrink: true }}
              value={form.capacity.registrationDeadline}
              onChange={(e) => form.setField('capacity', 'registrationDeadline', e.target.value)}
              fullWidth
            />
          </Stack>
        </Section>

        {/* Tickets & Pricing */}
        <Section title="Tickets & Pricing" subtitle={`Inventory vs Capacity left: ${capacityLeft}`}>
          <Stack spacing={2}>
            {form.tickets.map((t) => (
              <Box key={t.id} sx={{ p: 2, borderRadius: 2, border: '1px solid #eee' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                  <TextField label="Ticket name" value={t.name} onChange={(e) => form.updateTicket(t.id, { name: e.target.value })} sx={{ flex: 2 }} />
                  <TextField
                    label="Price (₪)"
                    type="number"
                    value={t.price}
                    onChange={(e) => form.updateTicket(t.id, { price: Number(e.target.value) })}
                    InputProps={{ startAdornment: <InputAdornment position="start">₪</InputAdornment> }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Quantity"
                    type="number"
                    value={t.inventory}
                    onChange={(e) => form.updateTicket(t.id, { inventory: Number(e.target.value) })}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Per-user limit"
                    type="number"
                    value={t.perUserLimit}
                    onChange={(e) => form.updateTicket(t.id, { perUserLimit: Number(e.target.value) })}
                    sx={{ flex: 1 }}
                  />
                  <IconButton color="error" onClick={() => form.removeTicket(t.id)}><Trash2 /></IconButton>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                  <TextField type="datetime-local" label="Sale starts" InputLabelProps={{ shrink: true }} value={t.saleStart || ''} onChange={(e) => form.updateTicket(t.id, { saleStart: e.target.value })} sx={{ flex: 1 }} />
                  <TextField type="datetime-local" label="Sale ends" InputLabelProps={{ shrink: true }} value={t.saleEnd || ''} onChange={(e) => form.updateTicket(t.id, { saleEnd: e.target.value })} sx={{ flex: 1 }} />
                  <TextField select label="Refund policy" value={t.refundPolicy || 'none'} onChange={(e) => form.updateTicket(t.id, { refundPolicy: e.target.value })} sx={{ flex: 1 }}>
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="percent">Percentage</MenuItem>
                    <MenuItem value="window">Time window</MenuItem>
                  </TextField>
                </Stack>
              </Box>
            ))}
            <Button startIcon={<Plus />} variant="outlined" onClick={form.addTicket}>Add ticket tier</Button>
          </Stack>
        </Section>

        {/* Payments */}
        <Section title="Payments" subtitle="Choose methods, Bit info, external receipts">
          <Stack spacing={2}>
            <ToggleButtonGroup
              value={form.payments.methods}
              onChange={(_, v) => v && form.setField('payments', 'methods', v)}
              size="small"
            >
              <ToggleButton value="in_app">In-App</ToggleButton>
              <ToggleButton value="bit">Bit</ToggleButton>
              <ToggleButton value="other">Other</ToggleButton>
            </ToggleButtonGroup>
            {form.payments.methods.includes('bit') && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Bit Business Name" value={form.payments.bit.businessName} onChange={(e) => form.setField('payments', 'bit', { ...form.payments.bit, businessName: e.target.value })} sx={{ flex: 1 }} />
                <TextField label="Bit Business Number" value={form.payments.bit.businessNumber} onChange={(e) => form.setField('payments', 'bit', { ...form.payments.bit, businessNumber: e.target.value })} sx={{ flex: 1 }} />
                <TextField label="Description" value={form.payments.bit.description} onChange={(e) => form.setField('payments', 'bit', { ...form.payments.bit, description: e.target.value })} sx={{ flex: 1 }} />
              </Stack>
            )}
          </Stack>
        </Section>

        {/* Audience */}
        <Section title="Audience Preferences" subtitle="Recommended age, gender filter, photo verification">
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Min Age" type="number" value={form.audience.recommendedAge[0]} onChange={(e) => form.setField('audience', 'recommendedAge', [Number(e.target.value), form.audience.recommendedAge[1]])} sx={{ flex: 1 }} />
              <TextField label="Max Age" type="number" value={form.audience.recommendedAge[1]} onChange={(e) => form.setField('audience', 'recommendedAge', [form.audience.recommendedAge[0], Number(e.target.value)])} sx={{ flex: 1 }} />
              <TextField select label="Gender Preference" value={form.audience.genderPref} onChange={(e) => form.setField('audience', 'genderPref', e.target.value)} sx={{ flex: 1 }}>
                <MenuItem value="user_pref">User’s preference</MenuItem>
                <MenuItem value="men_only">Men only</MenuItem>
                <MenuItem value="women_only">Women only</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </TextField>
            </Stack>
            <FormControlLabel control={<Switch checked={form.audience.requireVerifiedPhoto} onChange={(e) => form.setField('audience', 'requireVerifiedPhoto', e.target.checked)} />} label="Require verified profile photo before registration" />
          </Stack>
        </Section>

        {/* Policies */}
        <Section title="Policies & Safety" subtitle="Community rules, emergency contact">
          <Stack spacing={2}>
            <TextField label="Community rules" value={form.policies.communityRules} onChange={(e) => form.setField('policies', 'communityRules', e.target.value)} multiline minRows={2} fullWidth />
            <TextField label="Emergency contact" value={form.policies.emergencyContact} onChange={(e) => form.setField('policies', 'emergencyContact', e.target.value)} fullWidth />
          </Stack>
        </Section>

        <Divider sx={{ my: 3 }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Drafts auto‑save locally. You can publish once required fields are valid.</Typography>
      </Box>

      {/* Sticky Bottom Bar */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#fff', borderTop: '1px solid #eee', p: 1 }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button variant="outlined" onClick={() => setShowPreview(true)}>Preview</Button>
          <Button variant="contained" onClick={() => validateAnd(() => alert('Ready to publish (mock).'))}>Publish</Button>
        </Stack>
      </Box>

      {/* Preview Dialog (lightweight) */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} fullWidth maxWidth="sm">
        <DialogTitle>Preview</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{form.basic.title || 'Untitled event'}</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 1 }}>{form.basic.shortDescription}</Typography>
          {form.basic.coverUrl && (
            <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 1 }}>
              <img src={form.basic.coverUrl} alt="cover" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
            </Box>
          )}
          <Typography variant="subtitle2">Time</Typography>
          <Typography sx={{ mb: 1 }}>{form.schedule.startAt || '—'} → {form.schedule.endAt || '—'} ({form.schedule.timezone})</Typography>
          <Typography variant="subtitle2">Location</Typography>
          <Typography sx={{ mb: 1 }}>{form.schedule.isOnline ? form.schedule.onlineLink || '—' : form.schedule.locationText || '—'}</Typography>
          <Typography variant="subtitle2">Tickets</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {form.tickets.length === 0 && <Typography variant="body2">No tickets added.</Typography>}
            {form.tickets.map((t) => (
              <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>{t.name} × {t.inventory}</Typography>
                <Typography>₪{Number(t.price || 0).toFixed(2)}</Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export { AddEvent as EventsDirectory };
