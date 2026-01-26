import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft, MapPin, Plus, Share2, Heart, UserPlus } from 'lucide-react';
import { EVENTS, DEMO_ATTENDEES } from './EventsByCategory';

const getPurchasedSet = () => {
  try {
    const raw = localStorage.getItem('event_purchased');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const setPurchasedSet = (set) => {
  try {
    localStorage.setItem('event_purchased', JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

const fmtPulseDate = (date, time) => {
  try {
    const d = new Date(`${date}T${time || '20:00'}:00`);
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    const mon = d.toLocaleDateString('en-US', { month: 'short' });
    const dd = d.getDate();
    const hh = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${day} · ${mon} ${dd} · ${hh}`;
  } catch {
    return `${date || ''}${time ? ` · ${time}` : ''}`;
  }
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const event = useMemo(() => {
    if (!id) return null;
    return EVENTS.find((e) => String(e.id) === String(id) || String(e.id).includes(String(id)));
  }, [id]);

  const [purchased, setPurchased] = useState(() => getPurchasedSet());
  const isPurchased = !!(event && purchased.has(event.id));

  const [buyOpen, setBuyOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyErr, setBuyErr] = useState('');

  const eventAttendees = useMemo(() => {
    if (!event?.attendees?.length) return [];
    return (event.attendees || [])
      .map((attId) => DEMO_ATTENDEES.find((a) => a.id === attId))
      .filter(Boolean);
  }, [event]);

  const sortedAttendees = useMemo(() => {
    const arr = [...eventAttendees];
    return arr.sort((a, b) => (b.isMatch ? 1 : 0) - (a.isMatch ? 1 : 0));
  }, [eventAttendees]);

  if (!event) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', py: 2 }}>
        <Container maxWidth="sm">
          <Button variant="outlined" onClick={() => navigate('/events')}>
            Back to events
          </Button>
          <Alert severity="error" sx={{ mt: 2 }}>
            Event not found.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafbfc', pb: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1.25 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#1a1a2e' }}>
            <ArrowLeft size={20} />
          </IconButton>
          <Typography sx={{ fontWeight: 800, color: '#1a1a2e' }} noWrap>
            {event.title}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ position: 'relative' }}>
        {event.videoUrl ? (
          <video
            src={event.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            poster={event.cover}
            style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box component="img" src={event.cover} alt={event.title} sx={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
        )}
      </Box>

      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            bgcolor: '#fff',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5, color: '#111827' }}>
              {event.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {fmtPulseDate(event.date, event.time || '20:00')}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, color: 'text.secondary' }}>
              <MapPin size={16} />
              <Typography variant="body2">{event.region || event.venue}</Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {event.details || event.blurb}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={event.price === 0 ? 'Free' : `₪${event.price}`}
                size="small"
                sx={{ fontWeight: 800, bgcolor: 'rgba(102,126,234,0.10)', color: '#667eea' }}
              />
              {!!event.capacity && (
                <Chip
                  label={`${event.capacity} people`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: 'rgba(17,24,39,0.06)', color: '#111827' }}
                />
              )}
              {!!event.vibe && <Chip label={event.vibe} size="small" sx={{ fontWeight: 700 }} />}
            </Stack>

            {/* People you might meet - ONLY here, ONLY after purchase */}
            {isPurchased && sortedAttendees.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                  People you might meet
                </Typography>
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
                  {sortedAttendees.map((a) => (
                    <Box
                      key={a.id}
                      onClick={() =>
                        navigate(`/user/${a.id}`, {
                          state: {
                            from: 'event_details_people',
                            profile: {
                              id: a.id,
                              name: a.name,
                              age: 26,
                              gender: 'any',
                              bio: 'Met at events',
                              photo: a.photo,
                            },
                          },
                        })
                      }
                      sx={{ textAlign: 'center', minWidth: 72, cursor: 'pointer' }}
                    >
                      <Box
                        component="img"
                        src={a.photo}
                        alt={a.name}
                        sx={{
                          width: 54,
                          height: 54,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: a.isMatch ? '2px solid #6C5CE7' : '2px solid #e5e7eb',
                        }}
                      />
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        {a.name}
                      </Typography>
                      {a.isMatch && (
                        <Typography variant="caption" sx={{ color: '#6C5CE7', fontSize: '0.6rem' }}>
                          Match
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </>
            )}

            {!isPurchased && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Buy a ticket to unlock the people you might meet at this event.
              </Alert>
            )}
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.06)', bgcolor: 'rgba(17,24,39,0.02)' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  if (isPurchased || event.soldOut) return;
                  if (event.price === 0) {
                    const next = new Set(purchased);
                    next.add(event.id);
                    setPurchased(next);
                    setPurchasedSet(next);
                    return;
                  }
                  setBuyOpen(true);
                }}
                sx={{
                  fontWeight: 800,
                  borderRadius: 2.5,
                  py: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a4296 100%)' },
                }}
                disabled={event.soldOut || isPurchased}
              >
                {isPurchased ? "You're going! ✓" : event.soldOut ? 'SOLD OUT' : event.price === 0 ? 'JOIN' : 'BUY TICKET'}
              </Button>
              <Button variant="outlined" startIcon={<Heart size={16} />} fullWidth sx={{ borderRadius: 2.5, py: 1 }}>
                Save
              </Button>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Share2 size={16} />}
                fullWidth
                sx={{ borderRadius: 2.5, py: 1 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: event.title, text: `Check out ${event.title}`, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
              >
                Share
              </Button>
              <Button variant="outlined" startIcon={<UserPlus size={16} />} fullWidth sx={{ borderRadius: 2.5, py: 1 }}>
                +1
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>

      <Dialog open={buyOpen} onClose={() => setBuyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Buy ticket</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField
              label="Name"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              fullWidth
              size="small"
            />
            {!!buyErr && <Alert severity="error">{buyErr}</Alert>}
            <Alert severity="info">
              Demo purchase. After purchase, you'll unlock people you might meet at this event.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setBuyOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!buyerName.trim()) return setBuyErr('Please enter your name.');
              if (!buyerEmail.trim() || !buyerEmail.includes('@')) return setBuyErr('Please enter a valid email.');
              setBuyErr('');
              const next = new Set(purchased);
              next.add(event.id);
              setPurchased(next);
              setPurchasedSet(next);
              setBuyOpen(false);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
