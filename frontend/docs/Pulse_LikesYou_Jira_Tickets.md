# 🎯 Pulse Likes You — Jira Tickets

> **Work breakdown for Likes You Reveal Feature implementation**

---

## 🎯 Backend Tickets

### LIKESYOU-1: Implement /v1/likes-you gated response

**Type:** Backend  
**Priority:** Critical  
**Story Points:** 8

**Description:**
Implement the likes-you endpoint with gated response based on feature/premium status.

**Acceptance Criteria:**
- [ ] Returns blurred fields when locked (`photoUrl=null`, `displayName=null`, etc.)
- [ ] Returns revealed fields when unlocked (points feature active)
- [ ] Returns revealed fields when premium active
- [ ] Includes gate state (`isUnlocked`, `expiresAt`, `source`)
- [ ] Supports pagination with cursor
- [ ] Returns total count (even when locked)

**Response Structure:**
```json
{
  "gate": {
    "isUnlocked": false,
    "expiresAt": null,
    "source": "none"
  },
  "items": [...],
  "totalCount": 5,
  "nextCursor": null
}
```

---

### LIKESYOU-2: Ensure no leakage via cache

**Type:** Backend  
**Priority:** Critical  
**Story Points:** 5

**Description:**
Ensure no data leakage through caching or serialization.

**Acceptance Criteria:**
- [ ] Server enforces nulls for locked fields
- [ ] No photoUrl in response when locked
- [ ] No displayName in response when locked
- [ ] Validate serialization doesn't leak
- [ ] Photo URLs are signed/temporary
- [ ] Cache headers prevent client caching of revealed data

**Security Checks:**
- Review all serialization paths
- Test with network inspection
- Verify cache behavior

---

### LIKESYOU-3: Integrate points feature likes_you

**Type:** Backend  
**Priority:** High  
**Story Points:** 5

**Description:**
Add likes_you to the points feature system.

**Acceptance Criteria:**
- [ ] Feature ID: `likes_you`
- [ ] Duration: 10 minutes (locked)
- [ ] Cost: 80 points (locked)
- [ ] Ends immediately when other points feature activates
- [ ] Ends immediately when premium purchased
- [ ] Server timer for expiry

**Integration Points:**
- Points activation endpoint
- Feature switching logic
- Premium override logic

---

### LIKESYOU-4: Implement /v1/likes-you/count endpoint

**Type:** Backend  
**Priority:** Medium  
**Story Points:** 2

**Description:**
Lightweight endpoint for likes count (teaser for locked state).

**Acceptance Criteria:**
- [ ] Returns just the count
- [ ] Always available (no gate)
- [ ] Fast response (<50ms)

---

## 🎨 Frontend Tickets

### LIKESYOU-FE-1: Likes You screen states

**Type:** Frontend  
**Priority:** High  
**Story Points:** 8

**Description:**
Implement all UI states for Likes You screen.

**Acceptance Criteria:**
- [ ] Locked UI with blurred cards
- [ ] CTA button: "Unlock for 10 min (80 pts)"
- [ ] Alternative CTA: "View Premium"
- [ ] Unlocked UI with clear photos
- [ ] Timer banner: "Active now · 09:31"
- [ ] Expired transition with "Session ended" hint
- [ ] No celebration animations

**States:**
1. `Locked` - Blurred cards + CTA
2. `Unlocked` - Clear cards + timer
3. `Expired` - Transition back to locked

---

### LIKESYOU-FE-2: Immediate refetch on activation

**Type:** Frontend  
**Priority:** Critical  
**Story Points:** 3

**Description:**
After points activation success, immediately refetch likes-you list.

**Acceptance Criteria:**
- [ ] POST /points/activate success triggers refetch
- [ ] GET /likes-you called immediately
- [ ] UI updates without page reload
- [ ] Loading state during refetch
- [ ] Error handling if refetch fails

**Flow:**
```
1. User taps "Unlock"
2. POST /points/activate { feature: "likes_you" }
3. On 200 → GET /likes-you
4. Update UI with revealed data
```

---

### LIKESYOU-FE-3: Timer countdown component

**Type:** Frontend  
**Priority:** High  
**Story Points:** 3

**Description:**
Display countdown timer during unlock period.

**Acceptance Criteria:**
- [ ] Format: "Active now · MM:SS"
- [ ] Updates every second
- [ ] Positioned in header/banner
- [ ] Triggers state change on expiry
- [ ] Refetch on expiry

---

### LIKESYOU-FE-4: Blur/mask card component

**Type:** Frontend  
**Priority:** High  
**Story Points:** 3

**Description:**
Create blurred card component for locked state.

**Acceptance Criteria:**
- [ ] CSS blur effect on photo placeholder
- [ ] Masked name/age/distance
- [ ] Count badge visible
- [ ] Tappable but shows CTA
- [ ] Consistent with design system

---

## 🧪 QA Tickets

### LIKESYOU-QA-1: Leak regression

**Type:** QA  
**Priority:** Critical  
**Story Points:** 5

**Description:**
Test for data leakage in all scenarios.

**Test Cases:**
- [ ] Network inspection shows null fields when locked
- [ ] No cached data visible after expiry
- [ ] Photo URLs not guessable
- [ ] Console/storage doesn't contain leaked data
- [ ] API response validation

---

### LIKESYOU-QA-2: Expiry & switch-feature regression

**Type:** QA  
**Priority:** Critical  
**Story Points:** 3

**Description:**
Test expiry behavior and feature switching.

**Test Cases:**
- [ ] 10 minute timer accuracy
- [ ] Auto-blur on expiry
- [ ] Likes You stops when Undo activated
- [ ] Likes You stops when BeatPulse activated
- [ ] Single feature rule enforced

---

### LIKESYOU-QA-3: Premium override regression

**Type:** QA  
**Priority:** High  
**Story Points:** 3

**Description:**
Test Premium interaction with Likes You.

**Test Cases:**
- [ ] Premium purchase stops points feature
- [ ] Premium users see revealed list
- [ ] Premium users can't use points
- [ ] Premium expiry reverts to locked

---

## 📊 Summary

| Category | Tickets | Total Points |
|----------|---------|--------------|
| Backend | 4 | 20 |
| Frontend | 4 | 17 |
| QA | 3 | 11 |
| **Total** | **11** | **48** |

---

## 📅 Suggested Sprint Allocation

### Sprint 1 (Core Backend)
- LIKESYOU-1: Gated response (8 pts)
- LIKESYOU-2: No leakage (5 pts)
- LIKESYOU-3: Points integration (5 pts)

### Sprint 2 (Frontend)
- LIKESYOU-FE-1: Screen states (8 pts)
- LIKESYOU-FE-2: Refetch on activation (3 pts)
- LIKESYOU-FE-3: Timer component (3 pts)
- LIKESYOU-FE-4: Blur component (3 pts)

### Sprint 3 (Polish + QA)
- LIKESYOU-4: Count endpoint (2 pts)
- LIKESYOU-QA-1: Leak regression (5 pts)
- LIKESYOU-QA-2: Expiry regression (3 pts)
- LIKESYOU-QA-3: Premium regression (3 pts)

---

## 🔗 Dependencies

```
LIKESYOU-2 depends on LIKESYOU-1
LIKESYOU-3 depends on Points system
LIKESYOU-FE-1 depends on LIKESYOU-1
LIKESYOU-FE-2 depends on LIKESYOU-3
LIKESYOU-FE-3 depends on LIKESYOU-FE-1
LIKESYOU-QA-* depends on all dev tickets
```

---

## 🔒 Locked Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Duration | 10 minutes | Cannot be changed |
| Cost | 80 points | Cannot be changed |
| Data revealed | Photo, Name, Age, Distance | Only when unlocked |
| Data hidden | All above | Null when locked |

---

**Last Updated:** January 2026  
**Version:** 1.0
