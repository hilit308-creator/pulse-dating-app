/**
 * MeetingsSafetyScreen - Meetings & Safety Settings
 * 
 * Per Spec: Settings → Meetings & Safety (Meeting Time & Safety)
 * 
 * Purpose:
 * Allow users to prepare in advance for an in-person meeting, so that during the meeting:
 * - No thinking or typing is required
 * - Safety actions are available with a single tap
 * - A fallback option (WhatsApp) is always available, even without in-app contacts
 * 
 * All settings are strongly recommended, but never mandatory.
 * 
 * Sections:
 * 1. Meeting Contacts (up to 3 Pulse in-app contacts)
 * 2. WhatsApp Location Sharing message
 * 3. SOS Message (read-only)
 * 4. SOS Gender Preferences
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Divider,
  Avatar,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Shield,
  AlertTriangle,
  Plus,
  X,
  Edit2,
  Check,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Default message templates per spec
const MESSAGE_TEMPLATES = [
  "Hi, I'm currently in a meeting. Sharing my location with you just in case.",
  "Just a quick update - I'm in a meeting, everything is fine for now.",
  "I'm meeting someone right now. I'll update you if anything changes.",
];

const DEFAULT_WHATSAPP_MESSAGE = "Hi, I'm currently in a meeting. Sharing my location with you just in case.";

const SOS_MESSAGE = "A Pulse user nearby is asking for help. Distance from you: X meters.";

const SOS_GENDER_OPTIONS = [
  { value: 'all', label: 'All genders' },
  { value: 'women', label: 'Women only' },
  { value: 'men', label: 'Men only' },
  { value: 'no_preference', label: 'No preference' },
];

const MeetingsSafetyScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Meeting contacts state (up to 3)
  const [meetingContacts, setMeetingContacts] = useState(() => {
    const saved = localStorage.getItem('pulse_meeting_contacts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  // WhatsApp message
  const [whatsappMessage, setWhatsappMessage] = useState(() => {
    return localStorage.getItem('pulse_whatsapp_message') || DEFAULT_WHATSAPP_MESSAGE;
  });
  
  // SOS gender preference
  const [sosGenderPreference, setSosGenderPreference] = useState(() => {
    return localStorage.getItem('pulse_sos_gender') || 'all';
  });
  
  // Dialog states
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [showEditMessageDialog, setShowEditMessageDialog] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactMessage, setNewContactMessage] = useState(MESSAGE_TEMPLATES[0]);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pulse_meeting_contacts', JSON.stringify(meetingContacts));
  }, [meetingContacts]);

  useEffect(() => {
    localStorage.setItem('pulse_whatsapp_message', whatsappMessage);
  }, [whatsappMessage]);

  useEffect(() => {
    localStorage.setItem('pulse_sos_gender', sosGenderPreference);
  }, [sosGenderPreference]);

  const handleBack = () => {
    navigate(-1);
  };

  // Add new contact
  const handleAddContact = () => {
    if (!newContactName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a contact name' });
      return;
    }
    
    const newContact = {
      id: Date.now(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      message: newContactMessage || MESSAGE_TEMPLATES[0],
    };
    
    setMeetingContacts(prev => [...prev, newContact].slice(0, 3));
    setShowAddContactDialog(false);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactMessage(MESSAGE_TEMPLATES[0]);
    setSnackbar({ open: true, message: 'Contact added' });
  };

  // Edit contact
  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setNewContactName(contact.name);
    setNewContactPhone(contact.phone || '');
    setNewContactMessage(contact.message);
    setShowAddContactDialog(true);
  };

  // Save edited contact
  const handleSaveEditedContact = () => {
    if (!newContactName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a contact name' });
      return;
    }
    
    setMeetingContacts(prev => prev.map(c => 
      c.id === editingContact.id 
        ? { ...c, name: newContactName.trim(), phone: newContactPhone.trim(), message: newContactMessage }
        : c
    ));
    
    setShowAddContactDialog(false);
    setEditingContact(null);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactMessage(MESSAGE_TEMPLATES[0]);
    setSnackbar({ open: true, message: 'Contact updated' });
  };

  // Remove contact
  const handleRemoveContact = (contactId) => {
    setMeetingContacts(prev => prev.filter(c => c.id !== contactId));
    setSnackbar({ open: true, message: 'Contact removed' });
  };

  // Close dialog and reset
  const handleCloseDialog = () => {
    setShowAddContactDialog(false);
    setEditingContact(null);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactMessage(MESSAGE_TEMPLATES[0]);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 1.5,
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowLeft size={22} color="#1a1a2e" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {t('meetingsSafety') || 'Meetings & Safety'}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: 2, pt: 3, pb: 4, overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Intro */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              p: 2,
              backgroundColor: 'rgba(108,92,231,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(108,92,231,0.1)',
              mb: 3,
            }}
          >
            <Shield size={20} color="#6C5CE7" style={{ flexShrink: 0, marginTop: 2 }} />
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {t('meetingsSafetyIntro') || "These settings help you feel safer during a meeting. We recommend setting them up in advance."}
            </Typography>
          </Box>

          {/* ═══════════════════════════════════════════════════════════════
              1. MEETING CONTACTS
          ═══════════════════════════════════════════════════════════════ */}
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              p: 3,
              mb: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Users size={20} color="#6C5CE7" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {t('meetingContacts') || 'Meeting Contacts'}
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              {t('meetingContactsDesc') || 'Select up to 3 contacts who will receive an update and live location sharing during a meeting.'}
            </Typography>

            {/* Contact list */}
            {meetingContacts.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {meetingContacts.map((contact) => (
                  <Box
                    key={contact.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#6C5CE7', fontSize: 14 }}>
                        {contact.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                          {contact.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {contact.message.slice(0, 40)}...
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => handleEditContact(contact)}>
                        <Edit2 size={16} color="#64748b" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleRemoveContact(contact.id)}>
                        <X size={16} color="#ef4444" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Empty state */}
            {meetingContacts.length === 0 && (
              <Box
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: '2px dashed rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  {t('noMeetingContacts') || 'No meeting contacts selected'}
                </Typography>
              </Box>
            )}

            {/* Add contact button */}
            {meetingContacts.length < 3 && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Plus size={18} />}
                onClick={() => setShowAddContactDialog(true)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  borderColor: 'rgba(108,92,231,0.3)',
                  color: '#6C5CE7',
                  '&:hover': {
                    borderColor: '#6C5CE7',
                    backgroundColor: 'rgba(108,92,231,0.05)',
                  },
                }}
              >
                {t('addContact') || 'Add contact'}
              </Button>
            )}
          </Box>

          {/* ═══════════════════════════════════════════════════════════════
              2. WHATSAPP LOCATION SHARING
          ═══════════════════════════════════════════════════════════════ */}
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              p: 3,
              mb: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <MessageCircle size={20} color="#25D366" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {t('whatsappLocationSharing') || 'WhatsApp Location Sharing'}
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              {t('whatsappMessageDesc') || 'The message that will be sent together with your location when sharing via WhatsApp.'}
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              placeholder={DEFAULT_WHATSAPP_MESSAGE}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </Box>

          {/* ═══════════════════════════════════════════════════════════════
              3. SOS MESSAGE (READ-ONLY)
          ═══════════════════════════════════════════════════════════════ */}
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              p: 3,
              mb: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <AlertTriangle size={20} color="#ef4444" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {t('sosMessage') || 'SOS Message'}
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              {t('sosMessageDesc') || 'This is the message that will be sent to nearby Pulse users if you tap SOS.'}
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.1)',
              }}
            >
              <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                "{SOS_MESSAGE}"
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
              <Info size={14} color="#94a3b8" />
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {t('sosMessageReadOnly') || 'This message cannot be edited, for safety and consistency reasons.'}
              </Typography>
            </Box>
          </Box>

          {/* ═══════════════════════════════════════════════════════════════
              4. SOS GENDER PREFERENCES
          ═══════════════════════════════════════════════════════════════ */}
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              p: 3,
              mb: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Users size={20} color="#6C5CE7" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                {t('sosGenderPreferences') || 'Who can receive my SOS request'}
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              {t('sosGenderDesc') || 'This choice only affects who receives your SOS request. It does not affect your visibility in the app.'}
            </Typography>

            <FormControl fullWidth size="small">
              <Select
                value={sosGenderPreference}
                onChange={(e) => setSosGenderPreference(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                {SOS_GENDER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {t(option.value) || option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </motion.div>
      </Box>

      {/* Add/Edit Contact Dialog */}
      <Dialog
        open={showAddContactDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingContact ? (t('editContact') || 'Edit Contact') : (t('addMeetingContact') || 'Add Meeting Contact')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label={t('contactName') || 'Contact name'}
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            
            <TextField
              fullWidth
              label={t('phoneNumber') || 'Phone number (optional)'}
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            
            <FormControl fullWidth>
              <InputLabel>{t('messageTemplate') || 'Message'}</InputLabel>
              <Select
                value={newContactMessage}
                onChange={(e) => setNewContactMessage(e.target.value)}
                label={t('messageTemplate') || 'Message'}
                sx={{ borderRadius: '12px' }}
              >
                {MESSAGE_TEMPLATES.map((template, idx) => (
                  <MenuItem key={idx} value={template}>
                    {template.slice(0, 50)}...
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t('customMessage') || 'Or write a custom message'}
              value={newContactMessage}
              onChange={(e) => setNewContactMessage(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={editingContact ? handleSaveEditedContact : handleAddContact}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              py: 1.5,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
            }}
          >
            {editingContact ? (t('saveChanges') || 'Save changes') : (t('addContact') || 'Add contact')}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={handleCloseDialog}
            sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}
          >
            {t('cancel') || 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default MeetingsSafetyScreen;
