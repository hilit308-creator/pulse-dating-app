# Pulse – Today's Picks

**Product & System Specification**

> Audience: Product · Frontend · Backend · AI  
> Status: Final – Locked (v1 with UX guardrails)  
> Language: English

---

## ① Product Intent Specification

### Purpose

Today's Picks is a **focus mechanism**.

Its role is to:
- Reduce choice overload
- Create a sense of direction for "today"
- Help users act instead of endlessly browsing

It answers one question clearly:
> "Who is most worth my attention today?"

### What Today's Picks Is

- A curated, limited set of profiles
- Contextual to time, availability, and relevance
- A daily snapshot, not a feed

### What Today's Picks Is NOT

- ❌ Not "best looking"
- ❌ Not "most popular"
- ❌ Not "who paid"
- ❌ Not a Discover shortcut
- ❌ Not an infinite list

> If it feels like "Discover, but smaller" — it failed.

### Emotional Tone

Today's Picks should feel:
- Calm
- Intentional
- Trust-building
- Non-urgent

It should **not** feel:
- Pushy
- Competitive
- Gamified
- Like a daily task that must be completed

### Success (Intent-Level)

Today's Picks succeeds when users say:
- "This helps me decide"
- "I don't need to scroll endlessly today"
- "This feels personal, not random"

It fails if:
- Users ignore it
- Users confuse it with Discover
- Users feel pressure to "use it up"

---

## ② System & Behavior Specification

### 1. Placement (Home Screen)

- Appears on the Home / Discover screen
- Positioned above the main Discover feed
- Visually separated as a distinct section

Structure:
- Section title
- Optional subtle subtitle
- Horizontal row or compact vertical stack (design-locked)
- Limited number of cards

### 2. Section Title

**Title:** `Today's Picks`

**Optional subtitle** (1 line, subtle, non-static):
- "Handpicked for today"
- "Active around you today"
- "Relevant right now"

**Rules:**
- ❌ No countdown
- ❌ No urgency language
- ❌ No numbers ("5 left today" ❌)

### 3. Number of Picks (Hard Limit)

- **Minimum:** 3
- **Maximum:** 5
- Fixed per user per day

**Rules:**
- ❌ No pagination
- ❌ No "see more"
- ❌ No refill

> Today's Picks can only shrink during the day.

### 4. Card Design & Content

Each card uses the standard Pulse User Card (compact), with subtle visual distinction at the section level (not a new card type).

**Each card displays:**
- Profile photo
- Name
- Age
- Approximate distance
- One short vibe indicator (if already part of the card system)

**Must NOT display:**
- ❌ "Top"
- ❌ "Best match"
- ❌ "High score"
- ❌ Any ranking or promotional badges

### 5. Interaction Behavior

**On Tap:** Opens the full User Card (same behavior as double-tap from Discover)

**Actions inside card:**
- Like
- Pass
- No special actions exclusive to Today's Picks

### 6. Post-Action Behavior

If a user Likes or Passes a Pick:
- That profile is removed from Today's Picks
- Remaining picks stay exactly as-is
- No replacement appears

> Today's Picks shrinks, it does not refill.

### 7. Regeneration Logic

- Picks refresh once per calendar day
- Reset occurs at a fixed time (e.g. local midnight)

**Rules:**
- ❌ No manual refresh
- ❌ No pull-to-refresh
- ❌ No reminders or penalties

If a user does not interact:
- Picks expire quietly

### 8. Selection Logic (High-Level)

Profiles are selected using a composite relevance signal:
- Recent activity
- Proximity today
- Compatibility signals
- Availability likelihood
- Safety & trust signals

**Rules:**
- Algorithm logic is intentionally opaque
- No explicit explanations shown to users
- Different users receive different types of picks
- A soft context hint may be shown (section subtitle), but never a reason

### 9. Relationship to Discover

**Critical rule:** Today's Picks does not replace Discover — it precedes it.

**Additional rules:**
- Picks may or may not appear later in Discover
- Acting on a Pick behaves exactly like acting in Discover
- No duplicated business logic

### 10. Empty State

When no Picks are available:

**Title:** `No picks for today`

**Text:** `You're all caught up for now. Explore nearby or check back later.`

**CTA:** `Continue browsing`

**Rules:**
- ❌ No blame
- ❌ No urgency
- ❌ No suggestion that the user "missed" something

### 11. Analytics (Internal Only)

Track:
- `todays_picks_viewed`
- `todays_picks_card_opened`
- `todays_picks_like`
- `todays_picks_pass`
- `todays_picks_to_match`

> Metrics are used to evaluate usefulness — never to pressure usage.

### 12. Explicit Non-Goals

Today's Picks must **never**:
- ❌ Auto-like
- ❌ Auto-match
- ❌ Trigger AI messages
- ❌ Show paid promotion labels
- ❌ Create FOMO mechanics

### 13. Final Product Guardrail

**If Today's Picks:**
- Encourages less scrolling
- Feels personal
- Helps the user stop browsing sooner

→ **it is correct.**

**If it:**
- Feels like a trick
- Feels repetitive
- Feels like homework

→ **it must be redesigned or removed.**

---

## Implementation Status

| Feature | Status |
|---------|--------|
| Section placement (above Discover) | ✅ |
| Title + rotating subtitle | ✅ |
| 3-5 picks max, no pagination | ✅ |
| Card design (no ranking badges) | ✅ |
| Post-action removal (no refill) | ✅ |
| Empty state per spec | ✅ |
| Analytics events | ✅ |
| No FOMO mechanics | ✅ |
| **Decoupled from Discover** | ✅ |
| **Separate API endpoint** | ✅ |
| **Meeting-likelihood algorithm** | ✅ |
| **Meeting context badge** | ✅ |
| **Picks excluded from Discover** | ✅ |

---

## Technical Architecture (v2 - Decoupled)

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/todays-picks` | Fetch Today's Picks (separate selection) |
| `POST /api/todays-picks/:id/dismiss` | Mark pick as dismissed |
| `GET /api/nearby-users` | Discover feed (excludes today's picks) |

### Database Model

```sql
CREATE TABLE todays_picks (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,        -- User receiving picks
    pick_user_id INTEGER NOT NULL,   -- Picked profile
    pick_date DATE NOT NULL,         -- Date generated
    meeting_likelihood FLOAT,        -- Internal score 0.0-1.0
    meeting_context VARCHAR(50),     -- 'nearby_now', 'active_today', 'good_timing'
    dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    UNIQUE(user_id, pick_user_id, pick_date)
);
```

### Meeting-Likelihood Algorithm

| Signal | Weight | Description |
|--------|--------|-------------|
| Activity recency | 30% | Active in last 2h = full, 24h = half |
| Proximity | 35% | Within 500m = full, 10km+ = minimal |
| Availability | 25% | Placeholder for future calendar integration |
| Profile completeness | 10% | Has bio, interests, music |

### Meeting Context Badges

| Context | Icon | Label | Trigger |
|---------|------|-------|---------|
| `nearby_now` | 📍 | "Nearby now" | Distance < 2km |
| `active_today` | ⏰ | "Active today" | Active in last 6h |
| `good_timing` | ✨ | "Good timing" | Score ≥ 0.5 |

### Key Guardrails

1. **Picks are NOT derived from Discover** - separate API, separate selection
2. **Picks excluded from Discover for entire day** - even if not interacted with
3. **Meeting-likelihood is internal only** - never shown as match/compatibility score
4. **No refill** - picks shrink on action, never replaced

**Last Updated:** January 2026
