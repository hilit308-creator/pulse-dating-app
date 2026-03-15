import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Card,
  CardContent,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { MapPin, Share2, Heart, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { EVENTS, DEMO_ATTENDEES } from './EventsByCategory';
import { demoMatches } from './MatchesScreen';
import useGestureMessagesStore from '../store/gestureMessagesStore';
import { openPayPlusWindow } from '../services/payplus';

const resolvePublicImageUrl = (url) => {
  if (!url) return url;
  if (typeof url === 'string' && url.startsWith('/')) return `${process.env.PUBLIC_URL}${url}`;
  return url;
};

const getLikedProfiles = () => {
  try {
    const raw = localStorage.getItem('pulse_profile_likes');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const addLikedProfile = (id, meta = {}) => {
  try {
    const key = String(id);
    const arr = getLikedProfiles();
    const next = arr.some((x) => String(x?.id ?? x) === key)
      ? arr
      : [{ id: key, ts: Date.now(), ...meta }, ...arr];
    localStorage.setItem('pulse_profile_likes', JSON.stringify(next));
    window.dispatchEvent(new Event('pulse:profile_likes_changed'));
  } catch {
    // ignore
  }
};

const getPurchasedSet = () => {
  try {
    const raw = localStorage.getItem('event_purchased');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

function SwipeDeck({ users, onLike, onSkip, onOpenProfile, onExhausted }) {
  const [deck, setDeck] = useState(users || []);
  React.useEffect(() => setDeck(users || []), [users]);

  const handleSwipe = (u, dir) => {
    setDeck((d) => {
      if (!Array.isArray(d) || d.length === 0) return d;
      // Keep liked cards in the deck (move to end) so they don't disappear.
      if (dir === 'right') {
        const next = d.filter((x) => x.id !== u.id);
        return [...next, u];
      }
      // Skipped cards are removed.
      const next = d.filter((x) => x.id !== u.id);
      if (next.length === 0) onExhausted?.();
      return next;
    });
    dir === 'right' ? onLike?.(u) : onSkip?.(u);
  };

  const top = deck.slice(0, 3);

  if (top.length === 0) return null;

  return (
    <Box sx={{ position: 'relative', height: { xs: 260, sm: 280 } }}>
      {top.map((u, i) => {
        const isTop = i === 0;
        const z = 10 - i;
        const yOffset = i * 10;
        return (
          <motion.div
            key={u.id}
            drag={isTop ? 'x' : false}
            dragElastic={0.2}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              const power = Math.abs(info.offset.x) + Math.abs(info.velocity.x);
              const dir = info.offset.x > 0 ? 'right' : 'left';
              if (power > 160) {
                handleSwipe(u, dir);
              }
            }}
            whileTap={{ scale: isTop ? 1.02 : 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              y: yOffset,
              zIndex: z,
              height: '100%',
            }}
          >
            <Card
              sx={{
                overflow: 'hidden',
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                bgcolor: '#fff',
                border: '1px solid rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'row',
                cursor: 'pointer',
                height: '100%',
                minHeight: { xs: 240, sm: 260 },
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => onOpenProfile?.(u)}
            >
              <CardContent
                sx={{
                  p: 2,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }} noWrap>
                    {u.name}
                  </Typography>
                  {u.isMatch && (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 800,
                        bgcolor: 'rgba(108,92,231,0.10)',
                        color: '#6C5CE7',
                        border: '1px solid rgba(108,92,231,0.25)',
                        flexShrink: 0,
                      }}
                    >
                      Match
                    </Box>
                  )}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    mb: 0.75,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {u.bio}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {[
                    u.age ? String(u.age) : null,
                    u.location || null,
                    u.jobTitle || null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 1.25 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwipe(u, 'right');
                      }}
                      sx={{
                        flex: 1,
                        borderRadius: '10px',
                        py: 0.75,
                        textTransform: 'none',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #5a4bd1 0%, #9333ea 100%)' },
                      }}
                    >
                      Like
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwipe(u, 'left');
                      }}
                      sx={{
                        flex: 1,
                        borderRadius: '10px',
                        py: 0.75,
                        textTransform: 'none',
                        fontWeight: 700,
                        borderColor: '#e2e8f0',
                        color: '#64748b',
                        '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
                      }}
                    >
                      Skip
                    </Button>
                  </Stack>
                </Box>
              </CardContent>

              <Box
                sx={{
                  width: 140,
                  minWidth: 140,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '0 20px 20px 0',
                  height: '100%',
                }}
              >
                <Box
                  component="img"
                  src={u.photo}
                  alt={u.name}
                  srcSet={`${u.photo}&dpr=2 2x`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
            </Card>
          </motion.div>
        );
      })}
    </Box>
  );
}

const setPurchasedSet = (set) => {
  try {
    localStorage.setItem('event_purchased', JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

const getFavsSet = () => {
  try {
    const raw = localStorage.getItem('event_favs');
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set((parsed || []).map((x) => String(x)));
  } catch {
    return new Set();
  }
};

const setFavsSet = (set) => {
  try {
    localStorage.setItem('event_favs', JSON.stringify(Array.from(set)));
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
    return EVENTS.find((e) => String(e.id) === String(id));
  }, [id]);

  const [purchased, setPurchased] = useState(() => getPurchasedSet());
  const isPurchased = !!(event && purchased.has(String(event.id)));

  const [favs, setFavs] = useState(() => getFavsSet());
  const isFav = !!(event && favs.has(String(event.id)));

  const [buyOpen, setBuyOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyErr, setBuyErr] = useState('');

  const [plusOpen, setPlusOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [payForInvitee, setPayForInvitee] = useState(false);

  const [prefGender, setPrefGender] = useState('any'); // 'any' | 'female' | 'male'
  const [deckDone, setDeckDone] = useState(false);
  const [deckMode, setDeckMode] = useState('all'); // 'all' | 'skipped'
  const [skippedUsers, setSkippedUsers] = useState([]);

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

  const deckUsers = useMemo(() => {
    if (!event) return [];
    return (sortedAttendees || []).map((a) => ({
      id: a.id,
      name: a.name,
      bio: a.isMatch ? 'You might already vibe 👀' : 'Going to this event',
      photo: a.photo,
      isMatch: !!a.isMatch,
      gender: a.gender,
      age: a.age,
      location: a.location,
      jobTitle: a.jobTitle,
      education: a.education,
      height: a.height,
      zodiac: a.zodiac,
      languages: a.languages,
      causes: a.causes,
      qualities: a.qualities,
      prompts: a.prompts,
      favoriteSongs: a.favoriteSongs,
      drinking: a.drinking,
      smoking: a.smoking,
      children: a.children,
      religion: a.religion,
      politics: a.politics,
      lookingFor: a.lookingFor,
      hobbies: a.hobbies,
      photos: a.photos,
      eventIds: [event.id],
    }));
  }, [event, sortedAttendees]);

  const filteredDeckUsers = useMemo(() => {
    return (deckUsers || []).filter((u) => {
      if (prefGender === 'any') return true;
      if (!u.gender) return true;
      return u.gender === prefGender;
    });
  }, [deckUsers, prefGender]);

  React.useEffect(() => {
    setDeckDone(false);
  }, [event?.id, prefGender, deckMode]);

  React.useEffect(() => {
    setDeckMode('all');
    setSkippedUsers([]);
  }, [event?.id]);

  const likeUser = (u) => {
    if (!u) return;
    addLikedProfile(u.id, { from: 'event_details_deck', eventId: event?.id });
    setSkippedUsers((prev) => prev.filter((x) => x.id !== u.id));
    if (u.isMatch) {
      setTimeout(
        () => {
          try {
            window.dispatchEvent(
              new CustomEvent('pulse:show_match', {
                detail: {
                  match: {
                    id: u.id,
                    name: u.name,
                    firstName: u.name,
                    photo: u.photo,
                    photos: u.photos?.length ? u.photos : u.photo ? [u.photo] : [],
                  },
                },
              })
            );
          } catch {
            // ignore
          }
        },
        0
      );
    }
  };

  const skipUser = (u) => {
    if (!u) return;
    setSkippedUsers((prev) => {
      if (prev.some((x) => x.id === u.id)) return prev;
      return [u, ...prev];
    });
  };

  const filteredSkippedUsers = useMemo(() => {
    return (skippedUsers || []).filter((u) => {
      if (prefGender === 'any') return true;
      if (!u.gender) return true;
      return u.gender === prefGender;
    });
  }, [skippedUsers, prefGender]);

  const toggleFav = () => {
    if (!event) return;
    setFavs((prev) => {
      const next = new Set(prev);
      const key = String(event.id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setFavsSet(next);
      try {
        window.dispatchEvent(
          new CustomEvent('pulse:event_favs_changed', {
            detail: { eventId: key, isFav: next.has(key) },
          })
        );
      } catch {
        // ignore
      }
      return next;
    });
    if (navigator?.vibrate) navigator.vibrate(10);
  };

  const sendPlusOneInvite = () => {
    if (!event || !selectedMatch) return;
    const matchUser = (demoMatches || []).find((m) => m.id === selectedMatch);
    if (!matchUser) return;

    const { addGestureMessage } = useGestureMessagesStore.getState();
    addGestureMessage(
      selectedMatch,
      {
        gestureType: 'event_invite',
        message: payForInvitee
          ? `Hey! I'm thinking of going to ${event.title} - want to join me? 🎉\nI can also buy your ticket if you want.`
          : `Hey! I'm thinking of going to ${event.title} - want to join me? 🎉`,
        details: {
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventVenue: event.venue,
          eventCover: event.cover,
          paidByInviter: !!payForInvitee,
        },
      },
      {
        id: matchUser.id,
        name: matchUser.name,
        photoUrl: matchUser.photoUrl,
      }
    );

    setPlusOpen(false);
    setSelectedMatch(null);
    setPayForInvitee(false);
    setTimeout(() => navigate(`/chat/${selectedMatch}`), 150);
  };

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
      <Box sx={{ position: 'relative' }}>
        {event.videoUrl ? (
          <video
            src={event.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            poster={resolvePublicImageUrl(event.cover)}
            style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box
            component="img"
            src={resolvePublicImageUrl(event.cover)}
            alt={event.title}
            sx={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
          />
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
                sx={{ fontWeight: 800, bgcolor: 'rgba(108,92,231,0.10)', color: '#6C5CE7' }}
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

            {!isPurchased && (
              <Box sx={{ 
                mt: 2, 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: 'rgba(108,92,231,0.08)', 
                border: '1px solid rgba(108,92,231,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <Box sx={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(108,92,231,0.15)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Typography sx={{ color: '#6C5CE7', fontSize: '0.85rem' }}>ℹ</Typography>
                </Box>
                <Typography sx={{ color: '#6C5CE7', fontSize: '0.9rem' }}>
                  Buy a ticket to unlock the people you might meet at this event.
                </Typography>
              </Box>
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
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5b4cdb 0%, #9645e6 100%)' },
                }}
                disabled={event.soldOut || isPurchased}
              >
                {isPurchased ? "You're going! ✓" : event.soldOut ? 'SOLD OUT' : event.price === 0 ? 'JOIN' : 'BUY TICKET'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Heart size={16} />}
                fullWidth
                sx={{ 
                  borderRadius: 2.5, 
                  py: 1,
                  borderColor: '#6C5CE7',
                  color: '#6C5CE7',
                  '&:hover': { borderColor: '#5b4cdb', bgcolor: 'rgba(108,92,231,0.08)' },
                }}
                onClick={toggleFav}
              >
                {isFav ? 'Saved' : 'Save'}
              </Button>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Share2 size={16} />}
                fullWidth
                sx={{ 
                  borderRadius: 2.5, 
                  py: 1,
                  borderColor: '#6C5CE7',
                  color: '#6C5CE7',
                  '&:hover': { borderColor: '#5b4cdb', bgcolor: 'rgba(108,92,231,0.08)' },
                }}
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
              <Button
                variant="outlined"
                startIcon={<UserPlus size={16} />}
                fullWidth
                sx={{ 
                  borderRadius: 2.5, 
                  py: 1,
                  borderColor: '#6C5CE7',
                  color: '#6C5CE7',
                  '&:hover': { borderColor: '#5b4cdb', bgcolor: 'rgba(108,92,231,0.08)' },
                }}
                onClick={() => setPlusOpen(true)}
              >
                +1
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>

      <Container maxWidth="sm" sx={{ pb: 2 }}>
        {/* People you might meet - ONLY here, ONLY after purchase */}
        {isPurchased && filteredDeckUsers.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: '#fff',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              p: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
              People you might meet
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={prefGender}
              onChange={(_, v) => v && setPrefGender(v)}
              sx={{
                mb: 1.25,
                borderRadius: '12px',
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontWeight: 800,
                  border: '1px solid rgba(0,0,0,0.10)',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
                    color: '#fff',
                    borderColor: 'transparent',
                  },
                },
              }}
            >
              <ToggleButton value="any">Any</ToggleButton>
              <ToggleButton value="female">Women</ToggleButton>
              <ToggleButton value="male">Men</ToggleButton>
            </ToggleButtonGroup>
            <SwipeDeck
              key={`${event.id}:${prefGender}:${deckMode}`}
              users={deckMode === 'skipped' ? filteredSkippedUsers : filteredDeckUsers}
              onLike={likeUser}
              onSkip={skipUser}
              onExhausted={() => setDeckDone(true)}
              onOpenProfile={(u) =>
                navigate(`/user/${u.id}`, {
                  state: {
                    user: {
                      id: u.id,
                      firstName: u.name,
                      age: u.age || 26,
                      gender: u.gender,
                      isMatch: !!u.isMatch,
                      bio: u.isMatch
                        ? `We might already vibe — catch me at ${event.title}.`
                        : `Going to ${event.title}. Say hi if you see me there.`,
                      photos: u.photos?.length ? u.photos : u.photo ? [u.photo] : [],
                      primaryPhotoUrl: u.photo,
                      interests: (event?.tags || []).slice(0, 5),
                      lookingFor: u.lookingFor?.length ? u.lookingFor : ['New connections'],
                      hobbies: u.hobbies?.length ? u.hobbies : [],
                      location: u.location || event.region || event.venue,
                      jobTitle: u.jobTitle || 'Member',
                      education: u.education || '—',
                      height: u.height || 170,
                      zodiac: u.zodiac,
                      languages: u.languages || [],
                      causes: u.causes || [],
                      qualities: u.qualities || [],
                      prompts: u.prompts || [],
                      favoriteSongs: u.favoriteSongs || [],
                      drinking: u.drinking,
                      smoking: u.smoking,
                      children: u.children,
                      religion: u.religion,
                      politics: u.politics,
                      sharedEvent: event.title,
                      contextLine: `Going to ${event.title}`,
                    },
                  },
                })
              }
            />
            {deckDone && (
              <>
                <Alert severity="success" sx={{ mt: 1.5 }}>
                  {deckMode === 'skipped'
                    ? "You’re all caught up — no more skipped profiles to review."
                    : "You’ve reached the end — you’ve seen everyone for this event."}
                </Alert>
                {deckMode !== 'skipped' && skippedUsers.length > 0 && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.25 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ borderRadius: 2.5, py: 1, textTransform: 'none', fontWeight: 800 }}
                      onClick={() => {
                        setDeckMode('skipped');
                        setDeckDone(false);
                      }}
                    >
                      Review skipped ({skippedUsers.length})
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        borderRadius: 2.5,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a4296 100%)' },
                      }}
                      onClick={() => {
                        setDeckMode('all');
                        setDeckDone(false);
                      }}
                    >
                      Start over
                    </Button>
                  </Stack>
                )}
                {deckMode === 'skipped' && (
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 1.25, borderRadius: 2.5, py: 1, textTransform: 'none', fontWeight: 800 }}
                    onClick={() => {
                      setDeckMode('all');
                      setDeckDone(false);
                    }}
                  >
                    Back to all profiles
                  </Button>
                )}
              </>
            )}
          </Paper>
        )}
      </Container>

      <Dialog open={buyOpen} onClose={() => setBuyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>Buy Ticket</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{event?.title}</Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>{event?.date} • {event?.venue}</Typography>
            </Box>
            
            <Divider />
            
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body1" sx={{ fontWeight: 700 }}>Total:</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#6C5CE7' }}>
                ₪{Number(event?.price || 0).toFixed(2)}
              </Typography>
            </Stack>
            
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              // Open PayPlus payment page
              openPayPlusWindow({
                type: 'event',
                itemId: String(event?.id),
                itemName: event?.title || 'Event Ticket',
                amount: Number(event?.price || 0),
                quantity: 1,
                description: `Ticket for ${event?.title}`,
                metadata: {
                  eventId: event?.id,
                  eventTitle: event?.title,
                  eventDate: event?.date,
                },
              });
              
              // Mark as purchased (in production, this would happen after payment confirmation)
              const next = new Set(purchased);
              next.add(event.id);
              setPurchased(next);
              setPurchasedSet(next);
              setBuyOpen(false);
            }}
            sx={{
              py: 1.25,
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a855f7 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #5b4cdb 0%, #9645e6 100%)' },
            }}
          >
            Buy Ticket
          </Button>
          <Button color="inherit" fullWidth onClick={() => setBuyOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={plusOpen}
        onClose={() => {
          setPlusOpen(false);
          setSelectedMatch(null);
          setPayForInvitee(false);
        }}
        maxWidth="xs"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            maxHeight: '75vh',
            borderRadius: '14px',
          },
        }}
      >
        <DialogTitle>Invite +1</DialogTitle>
        <DialogContent dividers sx={{ py: 1.25 }}>
          <Stack spacing={1}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Invite a match to {event.title}
            </Typography>
            <FormControlLabel
              control={<Checkbox size="small" checked={payForInvitee} onChange={(e) => setPayForInvitee(e.target.checked)} />}
              label={<Typography variant="caption">I’ll buy your ticket too</Typography>}
              sx={{ alignItems: 'center', m: 0 }}
            />
            <Stack spacing={0.75} sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
              {(demoMatches || []).map((m) => (
                <Box
                  key={m.id}
                  onClick={() => setSelectedMatch(m.id)}
                  sx={{
                    p: 1,
                    borderRadius: 1.75,
                    border: selectedMatch === m.id ? '2px solid #d1d5db' : '1px solid #e5e7eb',
                    bgcolor: selectedMatch === m.id ? 'rgba(108,92,231,0.05)' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    component="img"
                    src={m.photoUrl}
                    alt={m.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://via.placeholder.com/64';
                    }}
                    sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#e5e7eb', flexShrink: 0, objectFit: 'cover' }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.name}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {(m.interests || []).slice(0, 3).join(', ') || m.tagline}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            onClick={() => {
              setPlusOpen(false);
              setSelectedMatch(null);
              setPayForInvitee(false);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={sendPlusOneInvite} disabled={!selectedMatch}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
