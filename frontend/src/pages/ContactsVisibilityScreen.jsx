/**
 * ContactsVisibilityScreen - Contacts-Based Visibility Settings
 * 
 * Sync contacts and choose who won't see you
 * Principle: Zero awkward situations. Zero social friction.
 * 
 * Features:
 * - Import contacts from phone
 * - Import WhatsApp groups
 * - Hide profile from specific contacts or entire groups
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  Collapse,
  Snackbar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Search,
  Upload,
  Shield,
  UserX,
  Check,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// WhatsApp icon component
const WhatsAppIcon = ({ size = 24, color = '#25D366' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ContactsVisibilityScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [contactsSynced, setContactsSynced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Contacts, 1: WhatsApp Groups
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [expandedGroup, setExpandedGroup] = useState(null);
  
  // Mock contacts data
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Mom', phone: '+972 50 123 4567', hidden: true, groupId: null },
    { id: 2, name: 'Dad', phone: '+972 50 234 5678', hidden: false, groupId: null },
    { id: 3, name: 'Boss', phone: '+972 50 345 6789', hidden: false, groupId: null },
    { id: 4, name: 'Ex Partner', phone: '+972 50 456 7890', hidden: false, groupId: null },
    { id: 5, name: 'Sarah (Work)', phone: '+972 50 567 8901', hidden: false, groupId: null },
    { id: 6, name: 'David (Gym)', phone: '+972 50 678 9012', hidden: false, groupId: null },
    { id: 7, name: 'Emily', phone: '+972 50 789 0123', hidden: false, groupId: null },
    { id: 8, name: 'Michael', phone: '+972 50 890 1234', hidden: false, groupId: null },
  ]);

  // WhatsApp groups (mock data - simulating what would be imported)
  const [whatsappGroups, setWhatsappGroups] = useState([]);
  
  // Available groups to import (mock data)
  const [availableGroups, setAvailableGroups] = useState([
    { 
      id: 'g1', 
      name: 'Family Group 👨‍👩‍👧‍👦', 
      memberCount: 12,
      members: [
        { id: 101, name: 'Mom', phone: '+972 50 123 4567' },
        { id: 102, name: 'Dad', phone: '+972 50 234 5678' },
        { id: 103, name: 'Sister', phone: '+972 50 111 2222' },
        { id: 104, name: 'Brother', phone: '+972 50 333 4444' },
        { id: 105, name: 'Uncle David', phone: '+972 50 555 6666' },
      ]
    },
    { 
      id: 'g2', 
      name: 'Work Team 💼', 
      memberCount: 8,
      members: [
        { id: 201, name: 'Boss', phone: '+972 50 345 6789' },
        { id: 202, name: 'Sarah (Work)', phone: '+972 50 567 8901' },
        { id: 203, name: 'Mike HR', phone: '+972 50 777 8888' },
        { id: 204, name: 'Lisa Marketing', phone: '+972 50 999 0000' },
      ]
    },
    { 
      id: 'g3', 
      name: 'Gym Buddies 💪', 
      memberCount: 15,
      members: [
        { id: 301, name: 'David (Gym)', phone: '+972 50 678 9012' },
        { id: 302, name: 'Trainer Dan', phone: '+972 50 222 3333' },
        { id: 303, name: 'Yoga Sarah', phone: '+972 50 444 5555' },
      ]
    },
    { 
      id: 'g4', 
      name: 'College Friends 🎓', 
      memberCount: 25,
      members: [
        { id: 401, name: 'Emily', phone: '+972 50 789 0123' },
        { id: 402, name: 'Michael', phone: '+972 50 890 1234' },
        { id: 403, name: 'Rachel', phone: '+972 50 666 7777' },
        { id: 404, name: 'Josh', phone: '+972 50 888 9999' },
      ]
    },
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

  // Import a WhatsApp group
  const handleImportGroup = (group) => {
    // Check if already imported
    if (whatsappGroups.find(g => g.id === group.id)) {
      setSnackbar({ open: true, message: 'Group already imported' });
      return;
    }

    // Add group with all members set to hidden by default
    const importedGroup = {
      ...group,
      allHidden: true, // Hide from entire group by default
      members: group.members.map(m => ({ ...m, hidden: true })),
    };
    
    setWhatsappGroups([...whatsappGroups, importedGroup]);
    setAvailableGroups(availableGroups.filter(g => g.id !== group.id));
    setSnackbar({ open: true, message: `${group.name} imported - all members hidden` });
    setShowImportDialog(false);
  };

  // Remove an imported group
  const handleRemoveGroup = (groupId) => {
    const group = whatsappGroups.find(g => g.id === groupId);
    if (group) {
      setWhatsappGroups(whatsappGroups.filter(g => g.id !== groupId));
      setAvailableGroups([...availableGroups, { ...group, members: group.members.map(m => ({ ...m, hidden: false })) }]);
      setSnackbar({ open: true, message: `${group.name} removed` });
    }
  };

  // Toggle entire group visibility
  const toggleGroupHidden = (groupId) => {
    setWhatsappGroups(whatsappGroups.map(g => {
      if (g.id === groupId) {
        const newHiddenState = !g.allHidden;
        return {
          ...g,
          allHidden: newHiddenState,
          members: g.members.map(m => ({ ...m, hidden: newHiddenState })),
        };
      }
      return g;
    }));
  };

  // Toggle individual member in group
  const toggleGroupMemberHidden = (groupId, memberId) => {
    setWhatsappGroups(whatsappGroups.map(g => {
      if (g.id === groupId) {
        const updatedMembers = g.members.map(m => 
          m.id === memberId ? { ...m, hidden: !m.hidden } : m
        );
        const allHidden = updatedMembers.every(m => m.hidden);
        return { ...g, members: updatedMembers, allHidden };
      }
      return g;
    }));
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const hiddenCount = contacts.filter(c => c.hidden).length;
  const hiddenGroupMembersCount = whatsappGroups.reduce((acc, g) => acc + g.members.filter(m => m.hidden).length, 0);

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

          {/* Tabs - Only show after sync */}
          {contactsSynced && (
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              variant="fullWidth"
              sx={{
                mb: 2,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                p: 0.5,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minHeight: 44,
                  borderRadius: '10px',
                },
                '& .Mui-selected': {
                  color: '#6C5CE7',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              <Tab icon={<Users size={16} />} iconPosition="start" label="Contacts" />
              <Tab icon={<WhatsAppIcon size={16} />} iconPosition="start" label="WhatsApp Groups" />
            </Tabs>
          )}

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
            /* Main Content */
            <>
              {/* Tab 0: Contacts */}
              {activeTab === 0 && (
                <>
                  {/* Stats */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Box sx={{ flex: 1, p: 2, backgroundColor: '#f8fafc', borderRadius: '16px', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#6C5CE7' }}>
                        {contacts.length}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Total contacts
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 2, backgroundColor: '#fef2f2', borderRadius: '16px', textAlign: 'center' }}>
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

              {/* Tab 1: WhatsApp Groups */}
              {activeTab === 1 && (
                <>
                  {/* Import WhatsApp Group Button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Plus size={18} />}
                    onClick={() => setShowImportDialog(true)}
                    sx={{
                      mb: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#25D366',
                      color: '#25D366',
                      '&:hover': {
                        borderColor: '#25D366',
                        backgroundColor: 'rgba(37,211,102,0.1)',
                      },
                    }}
                  >
                    Import WhatsApp Group
                  </Button>

                  {whatsappGroups.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <WhatsAppIcon size={48} color="#94a3b8" />
                      <Typography variant="body2" sx={{ color: '#94a3b8', mt: 2 }}>
                        No WhatsApp groups imported yet
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Import a group to hide your profile from all members
                      </Typography>
                    </Box>
                  ) : (
                    whatsappGroups.map((group) => (
                      <Box key={group.id} sx={{ mb: 2 }}>
                        {/* Group Header */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            backgroundColor: group.allHidden ? '#fef2f2' : '#f0fdf4',
                            borderRadius: expandedGroup === group.id ? '12px 12px 0 0' : '12px',
                            cursor: 'pointer',
                            border: `1px solid ${group.allHidden ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                          }}
                        >
                          <Box 
                            sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}
                            onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                          >
                            <Box sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '12px',
                              backgroundColor: '#25D366',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <WhatsAppIcon size={24} color="#fff" />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                                {group.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {group.members.filter(m => m.hidden).length}/{group.members.length} members hidden
                              </Typography>
                            </Box>
                            {expandedGroup === group.id ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => toggleGroupHidden(group.id)}
                              sx={{ 
                                backgroundColor: group.allHidden ? '#ef4444' : '#22c55e',
                                color: '#fff',
                                '&:hover': { backgroundColor: group.allHidden ? '#dc2626' : '#16a34a' },
                              }}
                            >
                              {group.allHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                            </IconButton>
                            <IconButton size="small" onClick={() => handleRemoveGroup(group.id)}>
                              <X size={16} color="#94a3b8" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Expanded Members List */}
                        <Collapse in={expandedGroup === group.id}>
                          <Box sx={{ 
                            border: '1px solid rgba(0,0,0,0.1)', 
                            borderTop: 'none',
                            borderRadius: '0 0 12px 12px',
                            overflow: 'hidden',
                          }}>
                            {group.members.map((member) => (
                              <Box
                                key={member.id}
                                onClick={() => toggleGroupMemberHidden(group.id, member.id)}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 1.5,
                                  backgroundColor: member.hidden ? '#fef2f2' : '#fff',
                                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                                  cursor: 'pointer',
                                  '&:last-child': { borderBottom: 'none' },
                                  '&:hover': { backgroundColor: member.hidden ? '#fee2e2' : '#f8fafc' },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', backgroundColor: member.hidden ? '#fecaca' : '#e2e8f0', color: member.hidden ? '#ef4444' : '#64748b' }}>
                                    {member.hidden ? <UserX size={14} /> : member.name[0]}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a2e', fontSize: '0.875rem' }}>
                                      {member.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                                      {member.phone}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '4px',
                                  backgroundColor: member.hidden ? '#ef4444' : 'rgba(0,0,0,0.08)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  {member.hidden && <Check size={12} color="#fff" />}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Collapse>
                      </Box>
                    ))
                  )}
                </>
              )}
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

      {/* Import WhatsApp Group Dialog */}
      <Dialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WhatsAppIcon size={24} />
          Import WhatsApp Group
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Select a group to import. All members will be hidden from your profile by default.
          </Typography>
          
          {availableGroups.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                All groups have been imported
              </Typography>
            </Box>
          ) : (
            availableGroups.map((group) => (
              <Box
                key={group.id}
                onClick={() => handleImportGroup(group)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  mb: 1,
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    transform: 'scale(1.01)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    backgroundColor: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <WhatsAppIcon size={22} color="#fff" />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                      {group.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {group.memberCount} members
                    </Typography>
                  </Box>
                </Box>
                <Plus size={20} color="#25D366" />
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowImportDialog(false)}
            sx={{ borderRadius: '12px', textTransform: 'none', color: '#64748b' }}
          >
            Cancel
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

export default ContactsVisibilityScreen;
