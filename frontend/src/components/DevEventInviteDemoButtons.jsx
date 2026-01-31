import React from 'react';
import { Box, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';
import useEventInvitesStore from '../store/eventInvitesStore';

const DEMO_MATCH = {
  id: 1,
  name: 'Maya',
  photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
};

const DEMO_EVENT = {
  id: 'workshop-pottery-demo',
  title: 'Pottery Workshop for Couples',
  date: '2026-02-14',
  time: '18:00',
  venue: 'Clay Studio TLV',
  cover: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800&auto=format&fit=crop',
};

const pushPendingEventInviteMessage = ({ matchId, user, event, paidByInviter }) => {
  try {
    const key = 'pending_event_invites';
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];

    const message = {
      id: `event_invite_${Date.now()}`,
      type: 'gesture',
      gestureType: 'event_invite',
      from: 'them',
      text: paidByInviter
        ? `I invited you to ${event.title} 🎉\nI can also buy your ticket if you want.`
        : `I invited you to ${event.title} 🎉`,
      timestamp: Date.now(),
      status: 'delivered',
      gestureDetails: {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventVenue: event.venue,
        eventCover: event.cover,
        paidByInviter: !!paidByInviter,
      },
      reactions: {},
    };

    arr.push({ matchId, user, message });
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    // ignore in demo
  }
};

export default function DevEventInviteDemoButtons() {
  const location = useLocation();
  const addInvite = useEventInvitesStore((s) => s.addInvite);
  const invites = useEventInvitesStore((s) => s.invites);

  // Show only in development mode
  if (process.env.NODE_ENV !== 'development') return null;

  // Show on Explore page only
  if (location?.pathname !== '/explore') return null;

  // Hide when there's an open invite dialog
  const hasOpenInviteDialog = (invites || []).some(
    (i) => i.status === 'pending' || i.status === 'gift_pending' || ((i.status === 'accepted' || i.status === 'gift_declined') && !!i.remindAt && !i.reminded && Date.now() >= i.remindAt)
  );

  if (hasOpenInviteDialog) return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 100, right: 12, zIndex: 20000, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          pushPendingEventInviteMessage({
            matchId: DEMO_MATCH.id,
            user: DEMO_MATCH,
            event: DEMO_EVENT,
            paidByInviter: true,
          });
          addInvite({
            matchId: DEMO_MATCH.id,
            inviter: { id: DEMO_MATCH.id, name: DEMO_MATCH.name, photoUrl: DEMO_MATCH.photoUrl },
            event: DEMO_EVENT,
            paidByInviter: true,
          });
        }}
      >
        Demo: invited me (paid)
      </Button>

      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          pushPendingEventInviteMessage({
            matchId: DEMO_MATCH.id,
            user: DEMO_MATCH,
            event: DEMO_EVENT,
            paidByInviter: false,
          });
          addInvite({
            matchId: DEMO_MATCH.id,
            inviter: { id: DEMO_MATCH.id, name: DEMO_MATCH.name, photoUrl: DEMO_MATCH.photoUrl },
            event: DEMO_EVENT,
            paidByInviter: false,
          });
        }}
      >
        Demo: invited me (not paid)
      </Button>

      <Button
        variant="contained"
        size="small"
        sx={{ 
          bgcolor: '#ef4444', 
          '&:hover': { bgcolor: '#dc2626' },
        }}
        onClick={() => {
          // Trigger the decline options popup by dispatching a custom event
          window.dispatchEvent(new CustomEvent('demo-invite-declined', {
            detail: {
              event: DEMO_EVENT,
              declinedBy: DEMO_MATCH,
            }
          }));
        }}
      >
        Demo: they declined me
      </Button>
    </Box>
  );
}
