import React, { useMemo, useState, useEffect } from 'react';
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
  Avatar,
} from '@mui/material';
import { Plus, Trash2, ArrowLeft, Calendar, MapPin, Users, CreditCard, Target, Shield, Image as ImageIcon, Sparkles, ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { useEventForm } from '../store/eventForm';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function Section({ title, subtitle, icon, children, isOpen, onToggle, isComplete, sectionNumber }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: sectionNumber * 0.05 }}
    >
      <Box sx={{ mb: 2 }}>
        {/* Section Header - Clickable */}
        <Box
          onClick={onToggle}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            mb: isOpen ? 1.5 : 0,
            p: 2,
            borderRadius: '16px',
            bgcolor: isOpen ? 'rgba(108,92,231,0.04)' : '#fff',
            border: isOpen ? '2px solid rgba(108,92,231,0.2)' : '1px solid rgba(0,0,0,0.05)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isOpen ? '0 4px 12px rgba(108,92,231,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(108,92,231,0.2)',
              borderColor: 'rgba(108,92,231,0.3)',
            }
          }}
        >
          {/* Completion indicator */}
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '8px', 
            background: isComplete ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}>
            {isComplete ? <CheckCircle2 size={18} color="#fff" /> : <Circle size={18} color="#64748b" />}
          </Box>
          
          {icon && (
            <Box sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isOpen ? '0 4px 12px rgba(108,92,231,0.3)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              {icon}
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>{title}</Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: '#64748b' }}>{subtitle}</Typography>
            )}
          </Box>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={20} color="#6C5CE7" />
          </motion.div>
        </Box>
        
        {/* Section Content - Collapsible */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <Box sx={{ 
                p: 2.5, 
                mt: 1.5,
                borderRadius: '16px', 
                bgcolor: '#fff', 
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {children}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
}

export default function AddEvent() {
  const navigate = useNavigate();
  const form = useEventForm();
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  
  // Accordion state - track which section is open
  const [openSection, setOpenSection] = useState('basic');
  
  // Section completion tracking
  const [completedSections, setCompletedSections] = useState({
    basic: false,
    time: false,
    capacity: false,
    tickets: false,
    payments: false,
    audience: false,
    policies: false,
  });
  
  // Auto-advance to next section when current is complete
  useEffect(() => {
    const checkCompletion = () => {
      const newCompleted = { ...completedSections };
      
      // Check basic info
      newCompleted.basic = form.basic.title.length > 0 && form.basic.shortDescription.length > 0;
      
      // Check time & location
      newCompleted.time = form.schedule.startAt && (form.schedule.locationText || form.schedule.onlineLink);
      
      // Check capacity
      newCompleted.capacity = form.capacity.maxCapacity > 0;
      
      // Check tickets (at least one ticket if paid)
      newCompleted.tickets = form.capacity.registrationType === 'free' || form.tickets.length > 0;
      
      // Check payments
      newCompleted.payments = form.payments.methods.length > 0;
      
      // Check audience
      newCompleted.audience = true; // Optional section
      
      // Check policies
      newCompleted.policies = true; // Optional section
      
      setCompletedSections(newCompleted);
    };
    
    checkCompletion();
  }, [form, completedSections]);
  
  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };
  
  const overallProgress = useMemo(() => {
    const completed = Object.values(completedSections).filter(Boolean).length;
    const total = Object.keys(completedSections).length;
    return Math.round((completed / total) * 100);
  }, [completedSections]);

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
      {/* Hero Section with Progress */}
      <Box sx={{ px: 2, pt: 3, pb: 2, maxWidth: 720, mx: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              borderRadius: '20px',
              p: 3,
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              mb: 3,
            }}
          >
            {/* Animated decorative elements */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ position: 'absolute', top: -30, right: -30 }}
            >
              <Box sx={{ 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.1)' 
              }} />
            </motion.div>
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.08, 0.12, 0.08]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              style={{ position: 'absolute', bottom: -20, left: -20 }}
            >
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.08)' 
              }} />
            </motion.div>
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles size={24} />
                </motion.div>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Create Your Event</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 500, mb: 2 }}>
                Share your passion, bring people together, and create memorable experiences
              </Typography>
              
              {/* Progress Bar */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                    Overall Progress
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 700 }}>
                    {overallProgress}%
                  </Typography>
                </Box>
                <Box sx={{ 
                  height: 8, 
                  borderRadius: 999, 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                      borderRadius: 999,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>

      <Box sx={{ px: 2, pt: 1, maxWidth: 720, mx: 'auto' }}>
        {/* Basic Info */}
        <Section 
          title="Basic Info" 
          subtitle="Name, descriptions, tags, cover image"
          icon={<Sparkles size={18} color="#fff" />}
          isOpen={openSection === 'basic'}
          onToggle={() => toggleSection('basic')}
          isComplete={completedSections.basic}
          sectionNumber={0}
        >
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
        <Section 
          title="Time & Location" 
          subtitle="Dates, address or online link, rules"
          icon={<Calendar size={18} color="#fff" />}
          isOpen={openSection === 'time'}
          onToggle={() => toggleSection('time')}
          isComplete={completedSections.time}
          sectionNumber={1}
        >
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
        <Section 
          title="Capacity & Registration" 
          subtitle="Max capacity, counters, free/paid/donation, deadline"
          icon={<Users size={18} color="#fff" />}
          isOpen={openSection === 'capacity'}
          onToggle={() => toggleSection('capacity')}
          isComplete={completedSections.capacity}
          sectionNumber={2}
        >
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
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1,
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    color: '#fff',
                    border: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                    }
                  }
                }
              }}
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
        <Section 
          title="Tickets & Pricing" 
          subtitle={`Inventory vs Capacity left: ${capacityLeft}`}
          icon={<CreditCard size={18} color="#fff" />}
          isOpen={openSection === 'tickets'}
          onToggle={() => toggleSection('tickets')}
          isComplete={completedSections.tickets}
          sectionNumber={3}
        >
          <Stack spacing={2}>
            {form.tickets.map((t) => (
              <Box key={t.id} sx={{ 
                p: 2.5, 
                borderRadius: '14px', 
                border: '1px solid rgba(0,0,0,0.08)',
                bgcolor: '#f8fafc',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
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
            <Button 
              startIcon={<Plus />} 
              variant="outlined" 
              onClick={form.addTicket}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#e2e8f0',
                color: '#6C5CE7',
                py: 1.25,
                '&:hover': {
                  borderColor: '#6C5CE7',
                  bgcolor: 'rgba(108,92,231,0.04)'
                }
              }}
            >
              Add ticket tier
            </Button>
          </Stack>
        </Section>

        {/* Payments */}
        <Section 
          title="Payments" 
          subtitle="Choose methods, Bit info, external receipts"
          icon={<CreditCard size={18} color="#fff" />}
          isOpen={openSection === 'payments'}
          onToggle={() => toggleSection('payments')}
          isComplete={completedSections.payments}
          sectionNumber={4}
        >
          <Stack spacing={2}>
            <ToggleButtonGroup
              value={form.payments.methods}
              onChange={(_, v) => v && form.setField('payments', 'methods', v)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1,
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    color: '#fff',
                    border: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                    }
                  }
                }
              }}
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
        <Section 
          title="Audience Preferences" 
          subtitle="Recommended age, gender filter, photo verification"
          icon={<Target size={18} color="#fff" />}
          isOpen={openSection === 'audience'}
          onToggle={() => toggleSection('audience')}
          isComplete={completedSections.audience}
          sectionNumber={5}
        >
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
        <Section 
          title="Policies & Safety" 
          subtitle="Community rules, emergency contact"
          icon={<Shield size={18} color="#fff" />}
          isOpen={openSection === 'policies'}
          onToggle={() => toggleSection('policies')}
          isComplete={completedSections.policies}
          sectionNumber={6}
        >
          <Stack spacing={2}>
            <TextField label="Community rules" value={form.policies.communityRules} onChange={(e) => form.setField('policies', 'communityRules', e.target.value)} multiline minRows={2} fullWidth />
            <TextField label="Emergency contact" value={form.policies.emergencyContact} onChange={(e) => form.setField('policies', 'emergencyContact', e.target.value)} fullWidth />
          </Stack>
        </Section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Box sx={{ 
            p: 2.5, 
            borderRadius: '14px', 
            bgcolor: 'rgba(108,92,231,0.06)',
            border: '1px solid rgba(108,92,231,0.12)',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            justifyContent: 'center'
          }}>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Typography sx={{ fontSize: 20 }}>💾</Typography>
            </motion.div>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Drafts auto-save locally. You can publish once required fields are valid.
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* Sticky Bottom Bar */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        bgcolor: '#fff', 
        borderTop: '1px solid rgba(0,0,0,0.08)',
        p: 2,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
      }}>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ maxWidth: 720, mx: 'auto' }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowPreview(true)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.25,
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#6C5CE7',
                color: '#6C5CE7',
                bgcolor: 'rgba(108,92,231,0.04)'
              }
            }}
          >
            Preview
          </Button>
          <Button 
            variant="contained" 
            onClick={() => validateAnd(() => alert('Ready to publish (mock).'))}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.25,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              boxShadow: '0 4px 12px rgba(108,92,231,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)',
                boxShadow: '0 6px 16px rgba(108,92,231,0.4)'
              }
            }}
          >
            Publish Event
          </Button>
        </Stack>
      </Box>

      {/* Preview Dialog (lightweight) */}
      <Dialog 
        open={showPreview} 
        onClose={() => setShowPreview(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1a1a2e' }}>Event Preview</DialogTitle>
        <DialogContent dividers sx={{ px: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>{form.basic.title || 'Untitled event'}</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 1 }}>{form.basic.shortDescription}</Typography>
          {form.basic.coverUrl && (
            <Box sx={{ borderRadius: '16px', overflow: 'hidden', mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <img src={form.basic.coverUrl} alt="cover" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
            </Box>
          )}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>Time</Typography>
          <Typography sx={{ mb: 2, color: '#64748b' }}>{form.schedule.startAt || '—'} → {form.schedule.endAt || '—'} ({form.schedule.timezone})</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>Location</Typography>
          <Typography sx={{ mb: 2, color: '#64748b' }}>{form.schedule.isOnline ? form.schedule.onlineLink || '—' : form.schedule.locationText || '—'}</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>Tickets</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {form.tickets.length === 0 && <Typography variant="body2">No tickets added.</Typography>}
            {form.tickets.map((t) => (
              <Box key={t.id} sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                p: 1.5,
                borderRadius: '10px',
                bgcolor: '#f8fafc',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Typography sx={{ color: '#1a1a2e', fontWeight: 500 }}>{t.name} × {t.inventory}</Typography>
                <Typography sx={{ color: '#6C5CE7', fontWeight: 700 }}>₪{Number(t.price || 0).toFixed(2)}</Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setShowPreview(false)}
            fullWidth
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              py: 1.25,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b4cdb 0%, #9333ea 100%)'
              }
            }}
          >
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export { AddEvent as EventsDirectory };
