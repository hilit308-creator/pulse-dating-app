/**
 * ContactsVisibilityScreen - Contacts-Based Visibility Settings
 * 
 * Sync contacts and choose who won't see you
 * Principle: Zero awkward situations. Zero social friction.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Switch,
  Avatar,
  TextField,
  InputAdornment,
  Checkbox,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Search,
  Upload,
  Shield,
  UserX,
  Check,
} from 'lucide-react';

const ContactsVisibilityScreen = () => {
  const navigate = useNavigate();
  const [contactsSynced, setContactsSynced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Mock contacts data
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Mom', phone: '+972 50 123 4567', hidden: true },
    { id: 2, name: 'Dad', phone: '+972 50 234 5678', hidden: true },
    { id: 3, name: 'Boss', phone: '+972 50 345 6789', hidden: true },
    { id: 4, name: 'Ex Partner', phone: '+972 50 456 7890', hidden: true },
    { id: 5, name: 'Sarah (Work)', phone: '+972 50 567 8901', hidden: false },
    { id: 6, name: 'David (Gym)', phone: '+972 50 678 9012', hidden: false },
    { id: 7, name: 'Emily', phone: '+972 50 789 0123', hidden: false },
    { id: 8, name: 'Michael', phone: '+972 50 890 1234', hidden: false },
  ]);

  const handleBack = () => navigate(-1);

  const handleSyncContacts = async () => {
    setIsSyncing(true);
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setContactsSynced(true);
    setIsSyncing(false);
  };

  const toggleContactHidden = (id) => {
    setContacts(contacts.map(c => 
      c.id === id ? { ...c, hidden: !c.hidden } : c
    ));
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const hiddenCount = contacts.filter(c => c.hidden).length;

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
          Contacts Visibility
        </Typography>
      </Box>

      <Box sx={{ px: 2, pt: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Info Banner */}
          <Alert 
            severity="info" 
            icon={<Shield size={20} />}
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            <Typography variant="body2">
              <strong>Zero awkward situations.</strong> Choose contacts who won't see you on Pulse.
            </Typography>
          </Alert>

          {!contactsSynced ? (
            /* Sync Contacts CTA */
            <Box
              sx={{
                p: 4,
                backgroundColor: '#f8fafc',
                borderRadius: '20px',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <Users size={36} color="#fff" />
              </Box>
              
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
                Sync Your Contacts
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                We'll show you contacts on Pulse so you can choose who shouldn't see your profile.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={isSyncing ? null : <Upload size={18} />}
                onClick={handleSyncContacts}
                disabled={isSyncing}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                }}
              >
                {isSyncing ? 'Syncing...' : 'Sync Contacts'}
              </Button>

              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 2 }}>
                Your contacts are stored securely and never shared.
              </Typography>
            </Box>
          ) : (
            /* Contacts List */
            <>
              {/* Stats */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#6C5CE7' }}>
                    {contacts.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Total contacts
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    backgroundColor: '#fef2f2',
                    borderRadius: '16px',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444' }}>
                    {hiddenCount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Hidden from
                  </Typography>
                </Box>
              </Box>

              {/* Search */}
              <TextField
                fullWidth
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="#94a3b8" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                  },
                }}
              />

              {/* Quick Actions */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  size="small"
                  onClick={() => setContacts(contacts.map(c => ({ ...c, hidden: true })))}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    color: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    '&:hover': { backgroundColor: 'rgba(239,68,68,0.2)' },
                  }}
                >
                  Hide all
                </Button>
                <Button
                  size="small"
                  onClick={() => setContacts(contacts.map(c => ({ ...c, hidden: false })))}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    color: '#22c55e',
                    backgroundColor: 'rgba(34,197,94,0.1)',
                    '&:hover': { backgroundColor: 'rgba(34,197,94,0.2)' },
                  }}
                >
                  Show all
                </Button>
              </Box>

              {/* Contacts List */}
              <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                Your Contacts
              </Typography>
              
              {filteredContacts.map((contact) => (
                <Box
                  key={contact.id}
                  onClick={() => toggleContactHidden(contact.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    mb: 1,
                    backgroundColor: contact.hidden ? '#fef2f2' : '#f8fafc',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: contact.hidden ? '1px solid rgba(239,68,68,0.1)' : '1px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: contact.hidden ? '#fee2e2' : '#f1f5f9',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: contact.hidden ? '#fecaca' : '#e2e8f0',
                        color: contact.hidden ? '#ef4444' : '#64748b',
                        fontSize: '1rem',
                      }}
                    >
                      {contact.hidden ? <UserX size={18} /> : contact.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e' }}>
                        {contact.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {contact.phone}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '6px',
                      backgroundColor: contact.hidden ? '#ef4444' : 'rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {contact.hidden && <Check size={14} color="#fff" />}
                  </Box>
                </Box>
              ))}

              {filteredContacts.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    No contacts found
                  </Typography>
                </Box>
              )}

              {/* Re-sync Button */}
              <Button
                fullWidth
                variant="text"
                startIcon={<Upload size={16} />}
                onClick={handleSyncContacts}
                sx={{
                  mt: 2,
                  py: 1,
                  textTransform: 'none',
                  color: '#64748b',
                }}
              >
                Re-sync contacts
              </Button>
            </>
          )}

          {/* Info Box */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: '12px' }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              💡 Hidden contacts won't see you on Pulse, and you won't see them. This is mutual and private.
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default ContactsVisibilityScreen;
