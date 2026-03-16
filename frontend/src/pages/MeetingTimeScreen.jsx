// MeetingTimeScreen.jsx - Dedicated page for active meeting with Quick Actions
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import {
  Users,
  UserPlus,
  MapPin,
  X,
  Edit2,
  Trash2,
  MessageSquare,
  Send,
  Heart,
} from "lucide-react";
import { useMeeting, MEETING_STATE } from "../context/MeetingContext";

// Preset message options for WhatsApp sharing
const PRESET_MESSAGES = [
  { id: 1, text: "Hey, I'm on a date right now. Everything is fine, just wanted to let you know 💜", label: "Regular update" },
  { id: 2, text: "Hey, I'm on a date now at {location}. I'll update you when I'm done 🙂", label: "Update with location" },
  { id: 3, text: "Hey, just wanted you to know I'm on a date. If I don't get back to you within 2 hours, please call me", label: "Check-in request" },
  { id: 4, text: "Hi, I'm sharing my location with you. I'm on a date right now.", label: "Share location" },
];

export default function MeetingTimeScreen() {
  const navigate = useNavigate();
  const { 
    meetingState, 
    meetingWith, 
    endMeeting,
    triggerSOS,
  } = useMeeting();

  // Default demo contacts with phone numbers
  const DEFAULT_CONTACTS = [
    { id: 1, name: 'לירון', phone: '+972501234567', message: PRESET_MESSAGES[0].text },
    { id: 2, name: 'אלכס', phone: '+972509876543', message: PRESET_MESSAGES[0].text },
  ];

  // Meeting contacts state - now stores more info including custom message
  const [meetingContacts, setMeetingContacts] = useState(() => {
    const saved = localStorage.getItem('pulse_meeting_contacts');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all contacts have message and phone fields
      return parsed.map(c => ({ 
        ...c, 
        message: c.message || PRESET_MESSAGES[0].text,
        phone: c.phone || '' 
      }));
    }
    return DEFAULT_CONTACTS;
  });
  const [contactsSharedLocation, setContactsSharedLocation] = useState([]);
  
  // Dialogs
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [showEditContactDialog, setShowEditContactDialog] = useState(false);
  const [showEndMeetingConfirm, setShowEndMeetingConfirm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedPresetMessage, setSelectedPresetMessage] = useState(PRESET_MESSAGES[0].id);
  const [customMessage, setCustomMessage] = useState('');
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Redirect if no active meeting
  useEffect(() => {
    if (meetingState !== MEETING_STATE.ACTIVE) {
      navigate(-1);
    }
  }, [meetingState, navigate]);

  // Save contacts to localStorage
  const saveContacts = (contacts) => {
    setMeetingContacts(contacts);
    localStorage.setItem('pulse_meeting_contacts', JSON.stringify(contacts));
  };

  // Share location via WhatsApp
  const handleShareLocation = (contact) => {
    // Check if phone number exists
    if (!contact.phone) {
      setSnackbar({ open: true, message: `Please add a phone number first`, severity: 'warning' });
      return;
    }
    
    const message = contact.message || PRESET_MESSAGES[0].text;
    // Remove non-digits but keep the number clean for WhatsApp
    let phone = contact.phone.replace(/\D/g, '');
    
    // Ensure phone starts with country code (add Israel code if missing)
    if (phone.startsWith('0')) {
      phone = '972' + phone.substring(1);
    } else if (!phone.startsWith('972') && !phone.startsWith('+')) {
      phone = '972' + phone;
    }
    
    console.log('[MeetingTimeScreen] Sharing to WhatsApp:', { phone, message });
    
    // Create WhatsApp URL with message - use api.whatsapp.com for better compatibility
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Mark as shared
    if (!contactsSharedLocation.includes(contact.id)) {
      setContactsSharedLocation(prev => [...prev, contact.id]);
    }
    setSnackbar({ open: true, message: `📍 Location sent to ${contact.name || 'contact'}`, severity: 'success' });
  };

  // Open edit dialog for contact
  const handleEditContact = (contact, e) => {
    e.stopPropagation();
    setEditingContact(contact);
    setContactName(contact.name);
    setContactPhone(contact.phone);
    const presetMatch = PRESET_MESSAGES.find(p => p.text === contact.message);
    if (presetMatch) {
      setSelectedPresetMessage(presetMatch.id);
      setUseCustomMessage(false);
    } else {
      setCustomMessage(contact.message || '');
      setUseCustomMessage(true);
    }
    setShowEditContactDialog(true);
  };

  // Delete contact
  const handleDeleteContact = (contact, e) => {
    e.stopPropagation();
    const updated = meetingContacts.filter(c => c.id !== contact.id);
    saveContacts(updated);
    setSnackbar({ open: true, message: 'Contact removed', severity: 'info' });
  };

  // Save new contact
  const handleSaveNewContact = () => {
    if (!contactName.trim()) return;
    
    const message = useCustomMessage ? customMessage : PRESET_MESSAGES.find(p => p.id === selectedPresetMessage)?.text;
    const newContact = {
      id: Date.now().toString(),
      name: contactName.trim(),
      phone: contactPhone.trim(),
      message: message,
    };
    
    saveContacts([...meetingContacts, newContact]);
    resetContactForm();
    setShowAddContactDialog(false);
    setSnackbar({ open: true, message: 'Contact added successfully', severity: 'success' });
  };

  // Update existing contact
  const handleUpdateContact = () => {
    if (!editingContact || (!contactName.trim() && !contactPhone.trim())) return;
    
    const message = useCustomMessage ? customMessage : PRESET_MESSAGES.find(p => p.id === selectedPresetMessage)?.text;
    const updated = meetingContacts.map(c => 
      c.id === editingContact.id 
        ? { ...c, name: contactName.trim(), phone: contactPhone.trim(), message }
        : c
    );
    
    saveContacts(updated);
    resetContactForm();
    setShowEditContactDialog(false);
    setEditingContact(null);
    setSnackbar({ open: true, message: 'Contact updated', severity: 'success' });
  };

  // Reset form
  const resetContactForm = () => {
    setContactName('');
    setContactPhone('');
    setSelectedPresetMessage(PRESET_MESSAGES[0].id);
    setCustomMessage('');
    setUseCustomMessage(false);
  };

  // Navigate to AI support chat
  const handleSupportChat = () => {
    // Navigate to Pulse Agent chat with meeting context
    navigate('/chat/pulse-agent', { 
      state: { 
        fromMeeting: true, 
        meetingWith: meetingWith?.name || 'someone'
      } 
    });
  };

  // Handle end meeting
  const handleEndMeeting = () => {
    endMeeting();
    setShowEndMeetingConfirm(false);
    navigate(-1);
  };

  if (meetingState !== MEETING_STATE.ACTIVE) {
    return null;
  }

  // Get display contacts (max 3) + Add button
  const displayContacts = meetingContacts.slice(0, 3);

  return (
    <Box sx={{ 
      position: 'fixed',
      top: 56,
      left: 0,
      right: 0,
      bottom: 56,
      overflow: 'hidden',
      bgcolor: '#F8F9FA',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      px: 2,
    }}>
      {/* Main Content */}
      <Box sx={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        
        {/* Motivational Message Card */}
        <Box sx={{ 
          width: '100%', 
          p: 2, 
          background: 'linear-gradient(135deg, #F3F0FF 0%, #E9E4FF 100%)',
          borderRadius: 3, 
          border: '2px solid #C4B5FD',
          textAlign: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.75 }}>
            <Box sx={{ 
              width: 36, height: 36, borderRadius: '50%', 
              background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7CF7 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={18} color="#fff" />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4C1D95', fontSize: '1rem' }}>
              Meeting with {meetingWith?.name || 'Someone'} ✓
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#6B21A8', lineHeight: 1.5, display: 'block' }}>
            💜 We're here so you can feel safe. Enjoy the moment!
          </Typography>
        </Box>

        {/* Quick Actions - WhatsApp Share Contacts */}
        <Box sx={{ width: '100%' }}>
          <Typography variant="overline" sx={{ 
            color: '#6B7280', fontWeight: 800, letterSpacing: 1.5, fontSize: '0.7rem', 
            display: 'block', textAlign: 'center', mb: 1.5,
          }}>
            SHARE LOCATION VIA WHATSAPP
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Contact buttons */}
            {displayContacts.map((contact) => (
              <Box
                key={contact.id}
                sx={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  p: 1.5, borderRadius: 2, bgcolor: '#fff', cursor: 'pointer',
                  boxShadow: contactsSharedLocation.includes(contact.id) 
                    ? '0 0 0 2px #10B981, 0 2px 8px rgba(16, 185, 129, 0.2)' 
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  minWidth: 72,
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
                }}
                onClick={() => handleShareLocation(contact)}
              >
                {/* Edit button - top left */}
                <IconButton 
                  size="small" 
                  onClick={(e) => handleEditContact(contact, e)} 
                  sx={{ position: 'absolute', top: 2, left: 2, p: 0.25 }}
                >
                  <Edit2 size={12} color="#9CA3AF" />
                </IconButton>
                {/* Delete button - top right */}
                <IconButton 
                  size="small" 
                  onClick={(e) => handleDeleteContact(contact, e)} 
                  sx={{ position: 'absolute', top: 2, right: 2, p: 0.25 }}
                >
                  <Trash2 size={12} color="#9CA3AF" />
                </IconButton>
                
                <Box sx={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: contactsSharedLocation.includes(contact.id) 
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5,
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                }}>
                  {contactsSharedLocation.includes(contact.id) ? (
                    <MapPin size={22} color="#fff" />
                  ) : (
                    <Send size={20} color="#fff" />
                  )}
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '0.75rem', lineHeight: 1.2 }}>
                  {(contact.name || contact.phone?.slice(-4) || 'Contact').length > 7 
                    ? (contact.name || contact.phone?.slice(-4) || 'Contact').slice(0, 7) + '…' 
                    : (contact.name || contact.phone?.slice(-4) || 'Contact')}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: contactsSharedLocation.includes(contact.id) ? '#10B981' : '#9CA3AF', 
                  fontSize: '0.65rem', fontWeight: 600, lineHeight: 1,
                }}>
                  {contactsSharedLocation.includes(contact.id) ? '✓ Sent' : 'Send'}
                </Typography>
              </Box>
            ))}

            {/* Add Contact button */}
            <Box 
              onClick={() => { resetContactForm(); setShowAddContactDialog(true); }} 
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                p: 1.5, borderRadius: 2, bgcolor: '#fff', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px dashed #D1D5DB', minWidth: 72,
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: '#6C5CE7', transform: 'translateY(-2px)' },
              }}
            >
              <Box sx={{
                width: 48, height: 48, borderRadius: '50%', bgcolor: '#F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5,
              }}>
                <UserPlus size={22} color="#6B7280" />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '0.75rem' }}>
                Add
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Support Button */}
        <Box 
          onClick={handleSupportChat} 
          sx={{ 
            width: '100%', p: 1.5, borderRadius: 2, 
            background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
            border: '1px solid #C4B5FD', 
            display: 'flex', alignItems: 'center', 
            gap: 1.5, cursor: 'pointer', 
            transition: 'all 0.2s ease',
            '&:hover': { boxShadow: '0 4px 12px rgba(108, 92, 231, 0.15)' },
          }}
        >
          <Box sx={{ 
            width: 40, height: 40, borderRadius: '50%', 
            background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7CF7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={20} color="#fff" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4C1D95', fontSize: '0.9rem' }}>
              Need support? 💬
            </Typography>
            <Typography variant="caption" sx={{ color: '#7C3AED', display: 'block' }}>
              Chat with our digital assistant for support and advice
            </Typography>
          </Box>
          <MessageSquare size={20} color="#6C5CE7" />
        </Box>

        {/* End Meeting + SOS Row */}
        <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
          <Button
            variant="outlined"
            onClick={() => setShowEndMeetingConfirm(true)}
            sx={{
              flex: 1, py: 1, borderRadius: 2, textTransform: 'none',
              fontWeight: 700, fontSize: '0.9rem', borderColor: '#6B7280', color: '#6B7280',
              '&:hover': { borderColor: '#4B5563', bgcolor: 'rgba(107, 114, 128, 0.05)' },
            }}
          >
            End Meeting
          </Button>
          <Tooltip title="Emergency SOS - Instantly alert your emergency contacts and get help" arrow placement="top">
            <Button
              variant="contained"
              onClick={triggerSOS}
              sx={{
                flex: 1, py: 1, borderRadius: 2, textTransform: 'none',
                fontWeight: 700, fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #B91C1C 0%, #991B1B 100%)' },
              }}
            >
              🆘 SOS
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Add Contact Dialog */}
      <Dialog 
        open={showAddContactDialog} 
        onClose={() => setShowAddContactDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 380, width: '95%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add Contact to Share
          <IconButton size="small" onClick={() => setShowAddContactDialog(false)}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth 
            label="Name" 
            value={contactName} 
            onChange={(e) => setContactName(e.target.value)} 
            sx={{ mb: 2, mt: 1 }} 
          />
          <TextField 
            fullWidth 
            label="Phone (with country code)" 
            value={contactPhone} 
            onChange={(e) => setContactPhone(e.target.value)} 
            placeholder="+972501234567"
            sx={{ mb: 2 }} 
          />
          
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#374151' }}>
            Choose message to send:
          </Typography>
          
          <RadioGroup value={useCustomMessage ? 'custom' : selectedPresetMessage} onChange={(e) => {
            if (e.target.value === 'custom') {
              setUseCustomMessage(true);
            } else {
              setUseCustomMessage(false);
              setSelectedPresetMessage(Number(e.target.value));
            }
          }}>
            {PRESET_MESSAGES.map((preset) => (
              <FormControlLabel 
                key={preset.id} 
                value={preset.id} 
                control={<Radio size="small" />} 
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{preset.label}</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>{preset.text}</Typography>
                  </Box>
                }
                sx={{ mb: 1, alignItems: 'flex-start', '& .MuiRadio-root': { pt: 0.5 } }}
              />
            ))}
            <FormControlLabel 
              value="custom" 
              control={<Radio size="small" />} 
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Custom message</Typography>}
              sx={{ mb: 1 }}
            />
          </RadioGroup>
          
          {useCustomMessage && (
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Custom message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write your message..."
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowAddContactDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveNewContact} 
            disabled={!contactName.trim() && !contactPhone.trim()}
            sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
            startIcon={<Send size={16} />}
          >
            Add & Share
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog 
        open={showEditContactDialog} 
        onClose={() => { setShowEditContactDialog(false); setEditingContact(null); }}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 380, width: '95%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Edit Contact
          <IconButton size="small" onClick={() => { setShowEditContactDialog(false); setEditingContact(null); }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth 
            label="Name" 
            value={contactName} 
            onChange={(e) => setContactName(e.target.value)} 
            sx={{ mb: 2, mt: 1 }} 
          />
          <TextField 
            fullWidth 
            label="Phone (with country code)" 
            value={contactPhone} 
            onChange={(e) => setContactPhone(e.target.value)} 
            placeholder="+972501234567"
            sx={{ mb: 2 }} 
          />
          
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#374151' }}>
            Choose message to send:
          </Typography>
          
          <RadioGroup value={useCustomMessage ? 'custom' : selectedPresetMessage} onChange={(e) => {
            if (e.target.value === 'custom') {
              setUseCustomMessage(true);
            } else {
              setUseCustomMessage(false);
              setSelectedPresetMessage(Number(e.target.value));
            }
          }}>
            {PRESET_MESSAGES.map((preset) => (
              <FormControlLabel 
                key={preset.id} 
                value={preset.id} 
                control={<Radio size="small" />} 
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{preset.label}</Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>{preset.text}</Typography>
                  </Box>
                }
                sx={{ mb: 1, alignItems: 'flex-start', '& .MuiRadio-root': { pt: 0.5 } }}
              />
            ))}
            <FormControlLabel 
              value="custom" 
              control={<Radio size="small" />} 
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Custom message</Typography>}
              sx={{ mb: 1 }}
            />
          </RadioGroup>
          
          {useCustomMessage && (
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Custom message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write your message..."
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setShowEditContactDialog(false); setEditingContact(null); }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateContact} 
            disabled={!contactName.trim() && !contactPhone.trim()}
            sx={{ bgcolor: '#6C5CE7', '&:hover': { bgcolor: '#5B4CD6' } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* End Meeting Confirmation */}
      <Dialog 
        open={showEndMeetingConfirm} 
        onClose={() => setShowEndMeetingConfirm(false)} 
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 320, width: '90%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>End Meeting?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center' }}>
            Are you sure you want to end the meeting with {meetingWith?.name}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center', gap: 1 }}>
          <Button onClick={() => setShowEndMeetingConfirm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEndMeeting} sx={{ bgcolor: '#DC2626' }}>End Meeting</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
