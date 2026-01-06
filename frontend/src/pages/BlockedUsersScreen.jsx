/**
 * BlockedUsersScreen - Settings → Safety & Trust → Blocked Users
 * 
 * Shows list of blocked users with:
 * - Name
 * - Small profile photo
 * - Source of block (Chat / Profile / Event)
 * - Unblock option
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Ban,
  MessageCircle,
  User,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Mock blocked users data
const MOCK_BLOCKED_USERS = [
  {
    id: 1,
    name: 'Alex',
    photo: 'https://i.pravatar.cc/150?img=1',
    source: 'chat',
    blockedAt: '2024-12-25',
  },
  {
    id: 2,
    name: 'Jordan',
    photo: 'https://i.pravatar.cc/150?img=2',
    source: 'profile',
    blockedAt: '2024-12-20',
  },
  {
    id: 3,
    name: 'Sam',
    photo: 'https://i.pravatar.cc/150?img=3',
    source: 'event',
    blockedAt: '2024-12-15',
  },
];

// Source icons mapping
const SOURCE_CONFIG = {
  chat: { icon: MessageCircle, label: 'From chat', color: '#6C5CE7' },
  profile: { icon: User, label: 'From profile', color: '#ec4899' },
  event: { icon: Calendar, label: 'From event', color: '#10b981' },
};

export default function BlockedUsersScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [blockedUsers, setBlockedUsers] = useState(MOCK_BLOCKED_USERS);
  const [unblockUser, setUnblockUser] = useState(null);

  const handleBack = () => navigate(-1);

  const handleUnblock = () => {
    if (unblockUser) {
      setBlockedUsers(prev => prev.filter(u => u.id !== unblockUser.id));
      setUnblockUser(null);
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
          {t('blockedUsers')}
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Info text */}
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mb: 3,
            p: 2,
            bgcolor: '#f8fafc',
            borderRadius: '12px',
          }}
        >
          Blocked users can't see your profile, send you messages, or interact with you on Pulse.
        </Typography>

        {/* Blocked users list */}
        <AnimatePresence>
          {blockedUsers.map((user) => {
            const sourceConfig = SOURCE_CONFIG[user.source];
            const SourceIcon = sourceConfig.icon;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    mb: 1.5,
                    bgcolor: '#f8fafc',
                    borderRadius: '16px',
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    src={user.photo}
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      filter: 'grayscale(50%)',
                      opacity: 0.8,
                    }}
                  />

                  {/* Info */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: '#1a1a2e' }}
                    >
                      {user.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <SourceIcon size={14} color={sourceConfig.color} />
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {sourceConfig.label}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Unblock button */}
                  <Button
                    size="small"
                    onClick={() => setUnblockUser(user)}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      color: '#6C5CE7',
                      bgcolor: 'rgba(108, 92, 231, 0.1)',
                      '&:hover': { bgcolor: 'rgba(108, 92, 231, 0.15)' },
                    }}
                  >
                    Unblock
                  </Button>
                </Box>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {blockedUsers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Ban size={28} color="#94a3b8" />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}
            >
              No blocked users
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Users you block will appear here
            </Typography>
          </Box>
        )}
      </Box>

      {/* Unblock confirmation dialog */}
      <Dialog
        open={!!unblockUser}
        onClose={() => setUnblockUser(null)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            maxWidth: 340,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, pb: 1 }}>
          Unblock {unblockUser?.name}?
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{ color: '#64748b', textAlign: 'center' }}
          >
            They'll be able to see your profile and send you messages again.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setUnblockUser(null)}
            sx={{
              flex: 1,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#e2e8f0',
              color: '#64748b',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUnblock}
            sx={{
              flex: 1,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#6C5CE7',
              '&:hover': { bgcolor: '#5b4cdb' },
            }}
          >
            Unblock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
