# Pulse - External Services & Costs

## Overview
This document lists all external services that Pulse may use, their purpose, current status, and estimated costs.

---

## Core Infrastructure & External Services (Production)

This section is the source of truth for **third-party services** and **core infrastructure** that Pulse relies on (current or planned). It exists so we can operate the system safely (debugging, incident response, rollouts, compliance).

### Database

- **PostgreSQL (primary persistent database)**
- **Purpose**
  - Nearby: invites, meetings, payments (holds/captures), feedback, partner venue tiers
  - Internal ledger for payment-related actions and reconciliation

### Payments

- **Stripe**
- **Usage**
  - Pre-authorization (**hold**), capture, release
  - Webhooks enabled for payment status updates
  - Internal ledger maintained for all payment-related actions

### Venues data

- **Google Places API** (primary venue source)
- **Internal DB table** for partner venues + plan tiers (paid prioritization) and manual overrides

### Authentication

- **JWT-based auth**
- **Single source of truth** for `userId` across frontend + backend (derived from JWT claims)

### Real-time / Notifications

- **Socket-based updates**
  - Invite accepted/declined
  - Meeting state changes
- **Polling fallback**
  - Used when sockets are unavailable

### Feature Flags

- **Remote-config based flags** (not localStorage)
- **Admin-only control**
- **Logged per environment** (dev / stage / prod)
- **Audit trail** for every flag change (who/when/from/to)

### Observability

- **Error logging**
- **Event tracking** for core flows
  - scan → invite → meeting → payment → feedback
- **Server-side audit logs** for admin actions + feature flag changes

### Policy: No Proximity Language (UI + API)

- The **server must not return user-facing proximity strings** (e.g., "300m away", "nearby", "2 km").
- The **frontend must not render proximity/distance copy**.
- If internal distance is required for ranking, it must remain **internal-only numeric data** (e.g., meters) and never be passed as user copy.

---

## 1. Location & Maps Services

### Current Status: **Built-in (Free)**
Using internal country/city database with autocomplete.

### Future Options:

| Service | Purpose | Cost | Notes |
|---------|---------|------|-------|
| **Mapbox** | In-app maps, geocoding, city autocomplete | Free tier: 50K loads/month, then ~$0.50/1K | Recommended for MVP |
| **Google Maps SDK** | In-app maps | $7/1K loads after free tier | More expensive |
| **Google Places API** | City/address autocomplete | $17/1K requests | High cost |
| **OpenStreetMap / Nominatim** | Geocoding | Free | Less accurate |

### Recommended: **Mapbox**
- Free tier sufficient for MVP & pilot
- Cross-platform (iOS + Android)
- Custom styling support
- Privacy-friendly

### Implementation Ready:
Specs saved in memory. Need Mapbox Access Token from https://account.mapbox.com/

---

## 2. Photo Verification (AI)

### Current Status: **Simulation (Free)**
Shows pose instruction, captures photo, marks as verified without actual AI check.

### Future Options:

| Service | Purpose | Cost | Notes |
|---------|---------|------|-------|
| **AWS Rekognition** | Face detection, pose estimation | ~$1/1K images | Good accuracy |
| **Google Cloud Vision** | Face detection, landmarks | ~$1.50/1K images | High accuracy |
| **Azure Face API** | Face verification, emotion | ~$1/1K calls | Good for verification |
| **Liveness detection APIs** | Anti-spoofing | $2-5/1K calls | Prevents photo-of-photo |

### Recommended: **AWS Rekognition** or **Azure Face API**
- Cost-effective for verification
- Can detect face landmarks (smile, eyes open, hand gestures)
- Liveness detection available

### What AI Would Verify:
1. Face is present and clear
2. Pose matches instruction (smile, thumbs up, peace sign)
3. Liveness check (not a photo of a photo)
4. Face matches profile photos (optional)

---

## 3. Push Notifications

### Current Status: **Browser Notification API (Free)**

### Future Options (Mobile):

| Service | Purpose | Cost | Notes |
|---------|---------|------|-------|
| **Firebase Cloud Messaging (FCM)** | Android + iOS push | Free | Google service |
| **Apple Push Notification (APNs)** | iOS push | Free | Apple service |
| **OneSignal** | Cross-platform push | Free tier: 10K users | Easy setup |

### Recommended: **FCM + APNs** (Free)

---

## 4. SMS / OTP Verification

### Current Status: **Simulation (Free)**
OTP codes logged to console, not actually sent.

### Future Options:

| Service | Purpose | Cost | Notes |
|---------|---------|------|-------|
| **Twilio** | SMS sending | ~$0.0075/SMS | Most popular |
| **AWS SNS** | SMS sending | ~$0.00645/SMS | Slightly cheaper |
| **Firebase Auth** | Phone auth | Free tier: 10K/month | Easy integration |

### Recommended: **Firebase Auth** for MVP (free tier)

---

## 5. Email Services

### Current Status: **Not implemented**

### Future Options:

| Service | Purpose | Cost | Notes |
|---------|---------|------|-------|
| **SendGrid** | Transactional email | Free: 100/day | Popular |
| **AWS SES** | Email sending | $0.10/1K emails | Very cheap |
| **Mailgun** | Email sending | Free: 5K/month | Good for startups |

---

## 6. Analytics

### Current Status: **Not implemented**

### Future Options:

| Service | Purpose | Cost | Notes |
|---------|---------|------|-------|
| **Google Analytics** | Web analytics | Free | Standard |
| **Mixpanel** | Product analytics | Free tier available | Better for apps |
| **Amplitude** | Product analytics | Free tier: 10M events | Popular for dating apps |

---

## 7. Social Media Integrations

### Instagram

#### Current Status: **Simulation (Free)**
Shows "Connected" but doesn't actually connect to Instagram.

#### Real Integration:
| Item | Details |
|------|---------|
| **API** | Instagram Basic Display API |
| **Cost** | Free |
| **Setup Time** | 2-4 weeks (Meta approval required) |
| **What You Get** | Profile photos, username, media |
| **What You Don't Get** | Stories, DMs, posting |

#### Setup Process:
1. Create Meta Developer account (https://developers.facebook.com/)
2. Create an App
3. Add Instagram Basic Display product
4. Submit for App Review (takes 2-4 weeks)
5. Get approved, then integrate

#### Action Items:
- [ ] Create Meta Developer account
- [ ] Start App Review process early (it takes time)

---

### Spotify

#### Current Status: **Simulation (Free)** ⚠️ BLOCKED
Shows "Connected" but doesn't actually connect to Spotify.

**⚠️ NOTE (January 2026):** Spotify has temporarily blocked new app creation:
> "New integrations are currently on hold while we make updates to improve reliability and performance."

Check back at https://developer.spotify.com/dashboard periodically.

#### Real Integration (When Available):
| Item | Details |
|------|---------|
| **API** | Spotify Web API |
| **Cost** | Free |
| **Setup Time** | Immediate (when registration opens) |
| **What You Get** | Playlists, cover art, metadata |
| **Rate Limits** | Generous for normal use |

#### Compliance Rules (IMPORTANT):
- ❌ **NO AI/ML training** on Spotify data
- ❌ **NO audio playback** (MVP)
- ❌ **NO long-term storage** of Spotify content
- ✅ Display playlists to user only
- ✅ Cache with 24h TTL max
- ✅ Provide "Disconnect" with full data deletion

#### Setup Process (When Available):
1. Go to https://developer.spotify.com/dashboard
2. Create an App
3. Set Redirect URI: `http://localhost:3000/auth/spotify/callback`
4. Get Client ID and Client Secret
5. Store Client Secret in `.env` (never expose in frontend)
6. Implement OAuth flow

#### Minimum Scopes Required:
- `playlist-read-private` - Read user's private playlists
- `playlist-read-collaborative` - Read collaborative playlists
- `user-read-private` - Read user profile (for linking)

#### What Pulse Can Show:
- Playlist names
- Playlist cover art
- Number of tracks
- Playlist owner

#### Action Items:
- [ ] **WAITING** - Check Spotify dashboard for registration availability
- [ ] Create App and get credentials when available
- [ ] Implement OAuth flow with backend token exchange
- [ ] Add "Disconnect Spotify" with data deletion

---

## 8. Video & Voice Calling

### Current Status: **Simulation (Free)**
Uses WebRTC for local camera/mic access, simulates remote connection.

### Future Options:

| Service | Purpose | Cost | Notes |
|---------|---------|------|-------|
| **Daily.co** | Video/voice calls | Free: 10K min/month | Easy integration, recommended |
| **Agora** | Video/voice calls | Free: 10K min/month | Good SDK |
| **Twilio Video** | Video/voice calls | ~$0.004/min | Pay as you go |
| **Jitsi** | Video/voice calls | Free (self-hosted) | Open source |
| **100ms** | Video/voice calls | Free: 10K min/month | Modern API |

### Recommended: **Daily.co** or **Jitsi**
- Daily.co: Easiest integration, generous free tier
- Jitsi: Completely free if self-hosted

### What's Needed for Real Calls:
1. **Signaling Server** - Exchange connection info between users (WebSocket)
2. **STUN Server** - Discover public IP (Google provides free: `stun:stun.l.google.com:19302`)
3. **TURN Server** - Relay for difficult NAT situations (can be costly)

### Current Implementation:
- `VideoCallModal.jsx` - Full UI with controls (mute, video toggle, speaker, end call)
- WebRTC `getUserMedia()` for camera/mic access
- Simulated "ringing" and "connected" states
- Call duration timer

### Action Items:
- [ ] Choose video calling provider (Daily.co recommended for MVP)
- [ ] Set up signaling server (Socket.io on backend)
- [ ] Implement WebRTC peer connection
- [ ] Add incoming call notifications

---

## 9. Cloud Hosting / Backend

### Current Status: **Local development**

### Future Options:

| Service | Purpose | Cost | Notes |
|---------|---------|------|-------|
| **Vercel** | Frontend hosting | Free tier | Great for React |
| **Netlify** | Frontend hosting | Free tier | Easy deploy |
| **AWS** | Full backend | Pay as you go | Scalable |
| **Firebase** | Backend + DB | Free tier generous | Quick MVP |
| **Supabase** | Backend + DB | Free tier | Open source Firebase |

---

## Cost Summary (Estimated Monthly)

### MVP / Pilot Phase (1,000 users):
| Service | Estimated Cost |
|---------|---------------|
| Location (Mapbox) | $0 (free tier) |
| Photo Verification | $0 (simulation) |
| Push Notifications | $0 (free) |
| SMS (Firebase) | $0 (free tier) |
| Video Calling (Daily.co) | $0 (free tier) |
| Hosting | $0 (free tier) |
| **Total** | **$0** |

### Growth Phase (10,000 users):
| Service | Estimated Cost |
|---------|---------------|
| Location (Mapbox) | ~$20/month |
| Photo Verification (AWS) | ~$50/month |
| Push Notifications | $0 |
| SMS | ~$50/month |
| Video Calling | ~$30/month |
| Hosting | ~$50/month |
| **Total** | **~$200/month** |

### Scale Phase (100,000 users):
| Service | Estimated Cost |
|---------|---------------|
| Location (Mapbox) | ~$200/month |
| Photo Verification | ~$500/month |
| Push Notifications | $0 |
| SMS | ~$500/month |
| Video Calling | ~$300/month |
| Hosting | ~$500/month |
| **Total** | **~$2,000/month** |

---

## Action Items

1. [ ] Create Mapbox account and get API token
2. [ ] Decide on photo verification service (AWS/Azure/Google)
3. [ ] Set up Firebase for auth and push notifications
4. [ ] Choose hosting provider for production
5. [ ] Choose video calling provider (Daily.co recommended)
6. [ ] Set up signaling server for real-time call connections

---

*Last updated: January 2026*
