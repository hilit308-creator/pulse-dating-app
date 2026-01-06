# 🎯 Pulse Points – Jira Tickets

> **Work breakdown for Points Hub implementation**

---

## 🎯 Backend Tickets

### POINTS-1: Implement points balance endpoint

**Type:** Backend  
**Priority:** High  
**Story Points:** 3

**Description:**
```
GET /v1/points/balance
```

**Acceptance Criteria:**
- [ ] Returns current points balance
- [ ] Returns active feature (if any) with `expiresAt`
- [ ] Server is source of truth
- [ ] Response matches `PointsBalance` schema

**Technical Notes:**
- Cache balance in Redis for fast reads
- Invalidate on any points transaction

---

### POINTS-2: Implement feature activation logic

**Type:** Backend  
**Priority:** High  
**Story Points:** 5

**Description:**
```
POST /v1/points/activate
```

**Acceptance Criteria:**
- [ ] One active feature maximum
- [ ] Immediate replacement of existing feature
- [ ] Points deducted atomically
- [ ] Timer starts server-side
- [ ] Returns updated balance and feature

**Technical Notes:**
- Use database transaction for atomicity
- Store `expiresAt` in UTC
- Background job to clean expired features

**Feature Costs (LOCKED):**
| Feature | Duration | Cost |
|---------|----------|------|
| undo | 30 min | 40 |
| likes_you | 10 min | 80 |
| nearby_priority | 10 min | 70 |
| beatpulse | 15 min | 70 |

---

### POINTS-3: Handle subscription override

**Type:** Backend  
**Priority:** Critical  
**Story Points:** 3

**Description:**
When user purchases Premium subscription, Points features must be disabled.

**Acceptance Criteria:**
- [ ] Active feature terminated immediately on subscription purchase
- [ ] `/v1/points/activate` returns 403 for subscribers
- [ ] Balance preserved (not deleted)
- [ ] Feature resumes if subscription expires (if still within time)

**Technical Notes:**
- Listen to subscription webhook events
- Check subscription status before activation

---

### POINTS-4: Implement purchase validation

**Type:** Backend  
**Priority:** High  
**Story Points:** 5

**Description:**
```
POST /v1/points/purchase/validate
```

**Acceptance Criteria:**
- [ ] Validate App Store receipts
- [ ] Validate Google Play receipts
- [ ] Credit points immediately on success
- [ ] Prevent receipt reuse
- [ ] Return updated balance

**Package Credits (LOCKED):**
| Package | Points |
|---------|--------|
| small | 100 |
| medium | 250 |
| large | 600 |

---

## 🎨 Frontend Tickets

### POINTS-FE-1: Points Hub UI

**Type:** Frontend  
**Priority:** High  
**Story Points:** 8

**Description:**
Build the main Points Hub screen with all sections.

**Acceptance Criteria:**
- [ ] Section A: Balance display (large number)
- [ ] Section B: Active Feature with countdown timer
- [ ] Section C: Feature cards (4 locked features)
- [ ] Section D: Buy Points packages
- [ ] Premium comparison text
- [ ] No celebration animations
- [ ] No confirmation dialogs

**UI Components:**
- Balance header
- Active feature card (conditional)
- Feature cards (Undo, Likes You, Nearby Priority, BeatPulse)
- Package cards (Small, Medium, Large)

**File:** `PointsHubScreen.jsx`

---

### POINTS-FE-2: Global sync & entry points

**Type:** Frontend  
**Priority:** Medium  
**Story Points:** 5

**Description:**
Add Points Hub entry points across the app.

**Entry Points:**
- [ ] Edit Profile → Points Banner
- [ ] Chat → Sticky banner
- [ ] Home → Promo card
- [ ] Feature Gate → When feature blocked

**Acceptance Criteria:**
- [ ] All entry points navigate to `/points`
- [ ] Balance syncs across all screens
- [ ] Active feature indicator visible globally

---

### POINTS-FE-3: Native checkout integration

**Type:** Frontend  
**Priority:** High  
**Story Points:** 5

**Description:**
Integrate with App Store and Google Play for points purchases.

**Acceptance Criteria:**
- [ ] Open native checkout on package tap
- [ ] Handle purchase success
- [ ] Handle purchase cancel
- [ ] Handle purchase failure
- [ ] Send receipt to backend
- [ ] Update balance on success
- [ ] No success screen or celebration

---

### POINTS-FE-4: Timer sync & countdown

**Type:** Frontend  
**Priority:** High  
**Story Points:** 3

**Description:**
Implement countdown timer that syncs with server.

**Acceptance Criteria:**
- [ ] Timer displays mm:ss format
- [ ] Timer syncs from server `expiresAt`
- [ ] Timer continues when app backgrounded
- [ ] Timer refreshes on app foreground
- [ ] Feature section disappears when timer reaches 0

---

### POINTS-FE-5: Subscription override UI

**Type:** Frontend  
**Priority:** Critical  
**Story Points:** 3

**Description:**
Handle Premium subscribers in Points Hub.

**Acceptance Criteria:**
- [ ] Show "Points features included" message
- [ ] Disable all feature cards
- [ ] Disable buy points section (or hide)
- [ ] Check subscription status on mount

---

## 🧪 QA Tickets

### POINTS-QA-1: Full regression – Points only

**Type:** QA  
**Priority:** High  
**Story Points:** 5

**Description:**
Execute full QA checklist for Points Hub.

**Scope:**
- Balance & Visibility (Section A)
- Feature Activation (Section B)
- Buying Points (Section C)
- Edge Cases (Section D)
- Timer Behavior (Section F)
- Analytics Events (Section G)

**Reference:** `Pulse_Points_QA_Checklist.md`

---

### POINTS-QA-2: Subscription × Points matrix

**Type:** QA  
**Priority:** Critical  
**Story Points:** 3

**Description:**
Test all subscription + points interactions.

**Test Matrix:**
| Scenario | Expected |
|----------|----------|
| Premium user opens Points | Disabled message |
| Activate while Premium | 403 blocked |
| Buy Premium mid-feature | Feature stops |
| Premium expires | Points enabled |

---

### POINTS-QA-3: Payment flow testing

**Type:** QA  
**Priority:** High  
**Story Points:** 3

**Description:**
Test purchase flows on both platforms.

**Test Cases:**
- [ ] iOS App Store purchase
- [ ] Android Google Play purchase
- [ ] Cancel mid-checkout
- [ ] Payment declined
- [ ] Network error during payment

---

## 📊 Summary

| Category | Tickets | Total Points |
|----------|---------|--------------|
| Backend | 4 | 16 |
| Frontend | 5 | 24 |
| QA | 3 | 11 |
| **Total** | **12** | **51** |

---

## 📅 Suggested Sprint Allocation

### Sprint 1 (Backend + Basic UI)
- POINTS-1: Balance endpoint
- POINTS-2: Feature activation
- POINTS-FE-1: Points Hub UI

### Sprint 2 (Payments + Polish)
- POINTS-3: Subscription override
- POINTS-4: Purchase validation
- POINTS-FE-3: Native checkout
- POINTS-FE-5: Subscription UI

### Sprint 3 (Integration + QA)
- POINTS-FE-2: Global sync
- POINTS-FE-4: Timer sync
- POINTS-QA-1: Full regression
- POINTS-QA-2: Sub × Points matrix
- POINTS-QA-3: Payment testing

---

**Last Updated:** January 2026  
**Version:** 1.0
