import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useEventInvitesStore from '../store/eventInvitesStore';

const getPurchasedSet = () => {
  try {
    const raw = localStorage.getItem('event_purchased');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const setPurchasedSet = (set) => {
  localStorage.setItem('event_purchased', JSON.stringify(Array.from(set)));
};

const demoChargeInviter = () => {
  const k = 'demo_inviter_balance';
  const cur = Number(localStorage.getItem(k) || '1000');
  const next = Math.max(0, cur - 60);
  localStorage.setItem(k, String(next));
  return { before: cur, after: next };
};

export default function GlobalEventInvitePopups() {
  const navigate = useNavigate();
  const invites = useEventInvitesStore((s) => s.invites);
  const acceptInvite = useEventInvitesStore((s) => s.acceptInvite);
  const declineInvite = useEventInvitesStore((s) => s.declineInvite);
  const acceptGift = useEventInvitesStore((s) => s.acceptGift);
  const declineGift = useEventInvitesStore((s) => s.declineGift);
  const markReminded = useEventInvitesStore((s) => s.markReminded);
  const clearInvite = useEventInvitesStore((s) => s.clearInvite);

  const pendingInvite = useMemo(() => invites.find((i) => i.status === 'pending') || null, [invites]);
  const giftInvite = useMemo(() => invites.find((i) => i.status === 'gift_pending') || null, [invites]);
  const reminderInvite = useMemo(
    () =>
      invites.find((i) =>
        (i.status === 'accepted' || i.status === 'gift_declined') &&
        !!i.remindAt &&
        !i.reminded &&
        Date.now() >= i.remindAt
      ) || null,
    [invites]
  );

  const [lastCharge, setLastCharge] = useState(null);

  useEffect(() => {
    if (!reminderInvite) return;
    // This will display the reminder dialog; mark as reminded so it won't repeat.
    markReminded(reminderInvite.id);
  }, [reminderInvite, markReminded]);

  const openEventDetails = (eventId) => {
    if (!eventId) return;
    navigate(`/events?eventId=${eventId}`);
  };

  const openChat = (matchId) => {
    if (!matchId) return;
    navigate(`/chat/${matchId}`);
  };

  return (
    <>
      <Dialog open={!!pendingInvite} onClose={() => pendingInvite && clearInvite(pendingInvite.id)} maxWidth="xs" fullWidth>
        <DialogTitle>Event invitation</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: 700 }}>
            {pendingInvite?.inviter?.name || 'Someone'} invited you
          </Typography>
          <Typography sx={{ mt: 0.75 }}>
            {pendingInvite?.event?.title || 'An event'}
          </Typography>
          {pendingInvite?.paidByInviter ? (
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              They want to buy your ticket.
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Ticket is not included.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => pendingInvite && declineInvite(pendingInvite.id)}>Decline</Button>
          <Button variant="outlined" onClick={() => openEventDetails(pendingInvite?.event?.id)}>View details</Button>
          <Button variant="outlined" onClick={() => openChat(pendingInvite?.matchId)}>Open chat</Button>
          <Button variant="contained" onClick={() => pendingInvite && acceptInvite(pendingInvite.id)}>Accept</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!giftInvite} onClose={() => giftInvite && clearInvite(giftInvite.id)} maxWidth="xs" fullWidth>
        <DialogTitle>Ticket gift</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: 700 }}>
            {giftInvite?.inviter?.name || 'They'} want to buy you a ticket
          </Typography>
          <Typography sx={{ mt: 0.75 }}>
            {giftInvite?.event?.title || 'This event'}
          </Typography>
          {lastCharge && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Demo charge: {lastCharge.before} → {lastCharge.after}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            onClick={() => {
              if (!giftInvite) return;
              declineGift(giftInvite.id);
            }}
          >
            Decline gift
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!giftInvite) return;
              const charge = demoChargeInviter();
              setLastCharge(charge);

              // Mark ticket purchased for recipient (demo)
              const set = getPurchasedSet();
              set.add(giftInvite.event?.id);
              setPurchasedSet(set);

              acceptGift(giftInvite.id);
              // Close after success
              setTimeout(() => clearInvite(giftInvite.id), 600);
            }}
          >
            Accept gift
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!reminderInvite} onClose={() => reminderInvite && clearInvite(reminderInvite.id)} maxWidth="xs" fullWidth>
        <DialogTitle>Reminder</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: 700 }}>Don’t forget to buy your ticket</Typography>
          <Typography sx={{ mt: 0.75 }}>{reminderInvite?.event?.title || 'Event'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => reminderInvite && clearInvite(reminderInvite.id)}>Later</Button>
          <Button variant="contained" onClick={() => openEventDetails(reminderInvite?.event?.id)}>Buy ticket</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
