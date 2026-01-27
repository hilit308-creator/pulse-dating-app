import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
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

const getCurrentUserForDemo = () => {
  try {
    const raw = localStorage.getItem('pulse_user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    return { id: u.id, name: u.firstName || u.username || u.email };
  } catch {
    return null;
  }
};

const primaryCtaSx = {
  borderRadius: 999,
  px: 2.25,
  fontWeight: 800,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
  boxShadow: '0 10px 24px rgba(108,92,231,0.35)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5B4BD5 0%, #9B4DEB 100%)',
    boxShadow: '0 12px 28px rgba(108,92,231,0.45)',
  },
};

const secondaryCtaSx = {
  borderRadius: 999,
  px: 2.0,
  fontWeight: 700,
  textTransform: 'none',
  borderColor: 'rgba(108,92,231,0.45)',
  color: '#6C5CE7',
  background: 'rgba(108,92,231,0.05)',
  '&:hover': {
    borderColor: 'rgba(108,92,231,0.7)',
    background: 'rgba(108,92,231,0.08)',
  },
};

const neutralCtaSx = {
  borderRadius: 999,
  px: 1.75,
  fontWeight: 700,
  textTransform: 'none',
  color: '#111827',
  background: 'rgba(17,24,39,0.04)',
  '&:hover': {
    background: 'rgba(17,24,39,0.07)',
  },
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

  const openEventDetails = (eventId, inviteId) => {
    if (inviteId) clearInvite(inviteId);
    if (!eventId) return;
    navigate(`/events/${eventId}`);
  };

  const openChat = (matchId, inviteId) => {
    if (inviteId) clearInvite(inviteId);
    if (!matchId) return;
    navigate(`/chat/${matchId}`);
  };

  const dialogPortalProps = useMemo(
    () => ({
      disablePortal: false,
      container: typeof document !== 'undefined' ? document.body : undefined,
      sx: { zIndex: (theme) => (theme?.zIndex?.modal ?? 1300) + 2000 },
    }),
    []
  );

  return (
    <>
      <Dialog
        open={!!pendingInvite}
        onClose={() => pendingInvite && clearInvite(pendingInvite.id)}
        maxWidth="xs"
        fullWidth
        disablePortal={dialogPortalProps.disablePortal}
        container={dialogPortalProps.container}
        sx={dialogPortalProps.sx}
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {!!pendingInvite?.event?.cover && (
          <Box
            component="img"
            src={pendingInvite.event.cover}
            alt={pendingInvite.event.title || 'Event'}
            sx={{ width: '100%', height: 140, objectFit: 'cover' }}
          />
        )}
        <DialogTitle component="div" sx={{ pb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Event invitation
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
            <Avatar
              src={pendingInvite?.inviter?.photoUrl || ''}
              alt={pendingInvite?.inviter?.name || 'Inviter'}
              sx={{ width: 40, height: 40 }}
            >
              {(pendingInvite?.inviter?.name || 'S').slice(0, 1).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800 }} noWrap>
                {pendingInvite?.inviter?.name || 'Someone'} invited you
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {pendingInvite?.event?.title || 'An event'}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              border: '1px solid #e5e7eb',
              borderRadius: 2,
              p: 1,
              bgcolor: pendingInvite?.paidByInviter ? 'rgba(108,92,231,0.06)' : 'rgba(17,24,39,0.03)',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {pendingInvite?.paidByInviter
                ? "Ticket included — they’ll pay for you"
                : 'Ticket not included'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
              You can accept now, or decide later in chat.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 2,
            pb: 2,
            pt: 0.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'stretch',
            gap: 1,
          }}
        >
          <Button
            color="inherit"
            sx={neutralCtaSx}
            fullWidth
            onClick={() => pendingInvite && declineInvite(pendingInvite.id)}
          >
            Decline
          </Button>
          <Button
            variant="outlined"
            sx={secondaryCtaSx}
            fullWidth
            onClick={() => openEventDetails(pendingInvite?.event?.id, pendingInvite?.id)}
          >
            View details
          </Button>
          <Button
            variant="outlined"
            sx={secondaryCtaSx}
            fullWidth
            onClick={() => openChat(pendingInvite?.matchId, pendingInvite?.id)}
          >
            Open chat
          </Button>
          <Button
            variant="contained"
            sx={primaryCtaSx}
            fullWidth
            onClick={() => pendingInvite && acceptInvite(pendingInvite.id, getCurrentUserForDemo())}
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!giftInvite}
        onClose={() => giftInvite && clearInvite(giftInvite.id)}
        maxWidth="xs"
        fullWidth
        disablePortal={dialogPortalProps.disablePortal}
        container={dialogPortalProps.container}
        sx={dialogPortalProps.sx}
      >
        <DialogTitle component="div">
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Ticket gift
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
            <Avatar
              src={giftInvite?.inviter?.photoUrl || ''}
              alt={giftInvite?.inviter?.name || 'Inviter'}
              sx={{ width: 40, height: 40 }}
            >
              {(giftInvite?.inviter?.name || 'T').slice(0, 1).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800 }} noWrap>
                {giftInvite?.inviter?.name || 'They'} want to buy you a ticket
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {giftInvite?.event?.title || 'This event'}
              </Typography>
            </Box>
          </Box>
          {lastCharge && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Demo charge: {lastCharge.before} → {lastCharge.after}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 2,
            pb: 2,
            pt: 0.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'stretch',
            gap: 1,
          }}
        >
          <Button
            color="inherit"
            sx={neutralCtaSx}
            fullWidth
            onClick={() => {
              if (!giftInvite) return;
              declineGift(giftInvite.id);
            }}
          >
            Decline gift
          </Button>
          <Button
            variant="contained"
            sx={primaryCtaSx}
            fullWidth
            onClick={() => {
              if (!giftInvite) return;
              const charge = demoChargeInviter();
              setLastCharge(charge);

              // Mark ticket purchased for recipient (demo)
              const set = getPurchasedSet();
              set.add(giftInvite.event?.id);
              setPurchasedSet(set);

              acceptGift(giftInvite.id, getCurrentUserForDemo());
              // Close after success
              setTimeout(() => clearInvite(giftInvite.id), 600);
            }}
          >
            Accept gift
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!reminderInvite}
        onClose={() => reminderInvite && clearInvite(reminderInvite.id)}
        maxWidth="xs"
        fullWidth
        disablePortal={dialogPortalProps.disablePortal}
        container={dialogPortalProps.container}
        sx={dialogPortalProps.sx}
      >
        <DialogTitle component="div">
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Reminder
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: 800 }}>Don’t forget to buy your ticket</Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
            {reminderInvite?.event?.title || 'Event'}
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: 2,
            pb: 2,
            pt: 0.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'stretch',
            gap: 1,
          }}
        >
          <Button
            color="inherit"
            sx={neutralCtaSx}
            fullWidth
            onClick={() => reminderInvite && clearInvite(reminderInvite.id)}
          >
            Later
          </Button>
          <Button
            variant="contained"
            sx={primaryCtaSx}
            fullWidth
            onClick={() => openEventDetails(reminderInvite?.event?.id, reminderInvite?.id)}
          >
            Buy ticket
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
