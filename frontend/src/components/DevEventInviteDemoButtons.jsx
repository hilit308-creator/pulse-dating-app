import React from 'react';
import { Box, Button } from '@mui/material';
import useEventInvitesStore from '../store/eventInvitesStore';

const DEMO_MATCH = {
  id: 6,
  name: 'Shani',
  photoUrl: '/liza_1.jpg',
};

const DEMO_EVENT = {
  id: 'lp1',
  title: 'Summer Festival',
  date: '2025-07-23',
  time: '16:00',
  venue: 'Central Park',
  cover: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1600&auto=format&fit=crop',
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
  const addInvite = useEventInvitesStore((s) => s.addInvite);
  const invites = useEventInvitesStore((s) => s.invites);

  if (process.env.NODE_ENV !== 'development') return null;

  const hasOpenInviteDialog = (invites || []).some(
    (i) => i.status === 'pending' || i.status === 'gift_pending' || ((i.status === 'accepted' || i.status === 'gift_declined') && !!i.remindAt && !i.reminded && Date.now() >= i.remindAt)
  );

  if (hasOpenInviteDialog) return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 88, right: 12, zIndex: 20000, display: 'flex', flexDirection: 'column', gap: 1 }}>
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
            inviter: { id: DEMO_MATCH.id, name: DEMO_MATCH.name },
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
            inviter: { id: DEMO_MATCH.id, name: DEMO_MATCH.name },
            event: DEMO_EVENT,
            paidByInviter: false,
          });
        }}
      >
        Demo: invited me (not paid)
      </Button>
    </Box>
  );
}
