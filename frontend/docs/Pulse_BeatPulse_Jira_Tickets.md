# 🎯 Pulse BeatPulse — Jira Tickets

> **Work breakdown for BeatPulse Exposure Boost implementation**

---

## 🎯 Backend Tickets

### BEATPULSE-1: Apply beatpulse multiplier in ranking engine

**Type:** Backend  
**Priority:** Critical  
**Story Points:** 8

**Description:**
Implement BeatPulse multiplier in the feed ranking engine.

```
final_score = base_score * beatpulse_multiplier
```

**Acceptance Criteria:**
- [ ] Multiplier applied to Home feed ranking
- [ ] Multiplier applied to Nearby feed ranking
- [ ] Configurable multiplier range (1.15 - 1.35)
- [ ] Multiplier caps enforced
- [ ] Does NOT affect distance calculations
- [ ] Does NOT bypass filters

**Technical Notes:**
- Add `beatpulse_multiplier` to ranking pipeline
- Config values in server config
- Logging for debugging (internal only)

---

### BEATPULSE-2: Enforce duration + expiry (server timer)

**Type:** Backend  
**Priority:** High  
**Story Points:** 5

**Description:**
Server-side timer that automatically ends BeatPulse at `expiresAt`.

**Acceptance Criteria:**
- [ ] Duration fixed at 15 minutes
- [ ] Timer starts on activation
- [ ] Automatic expiry at `expiresAt`
- [ ] Status endpoint returns accurate `expiresAt`
- [ ] Multiplier resets to 1.0 on expiry

**Technical Notes:**
- Use scheduled job or TTL-based expiry
- Store `expiresAt` in user boost state

---

### BEATPULSE-3: Guardrails - daily cap + cooldown

**Type:** Backend  
**Priority:** High  
**Story Points:** 5

**Description:**
Implement server-enforced guardrails for BeatPulse.

**Acceptance Criteria:**
- [ ] Daily cap: 3 activations (configurable)
- [ ] Cooldown: 30 minutes between activations (configurable)
- [ ] Daily cap resets at midnight (user timezone)
- [ ] `/boosts/guardrails` endpoint returns current status
- [ ] Activation blocked if guardrails violated

**Config Values:**
```yaml
beatpulse:
  daily_limit: 3
  cooldown_minutes: 30
  profile_quality_threshold: 70
```

---

### BEATPULSE-4: Premium override

**Type:** Backend  
**Priority:** Critical  
**Story Points:** 3

**Description:**
Subscription active → terminate points feature immediately.

**Acceptance Criteria:**
- [ ] Premium user cannot activate BeatPulse via points
- [ ] Active BeatPulse terminates when Premium purchased
- [ ] Points refund NOT given (feature was used)
- [ ] Clear error message for blocked activation

---

### BEATPULSE-5: Quality filter

**Type:** Backend  
**Priority:** Medium  
**Story Points:** 3

**Description:**
Apply reduced multiplier or block for low-quality profiles.

**Acceptance Criteria:**
- [ ] Profile completeness < 70% → reduced multiplier
- [ ] Flagged users → BeatPulse unavailable
- [ ] New users in probation → configurable behavior

---

## 🎨 Frontend Tickets

### BEATPULSE-FE-1: Points card + Active Feature countdown

**Type:** Frontend  
**Priority:** High  
**Story Points:** 3

**Description:**
Display BeatPulse in Points Hub with proper countdown.

**Acceptance Criteria:**
- [ ] BeatPulse card shows 15 min / 70 pts
- [ ] Active Feature shows countdown timer
- [ ] Timer updates every second
- [ ] Pull from points balance endpoint

**File:** `PointsHubScreen.jsx` (already implemented in FEATURES array)

---

### BEATPULSE-FE-2: No external UI leaks

**Type:** Frontend  
**Priority:** High  
**Story Points:** 2

**Description:**
Ensure no "boosting" UI in Home/Nearby screens.

**Acceptance Criteria:**
- [ ] No "Boosting" badge anywhere
- [ ] No toast notifications about boost
- [ ] No statistics/results shown
- [ ] Home/Nearby screens unchanged visually

**Verify in:**
- Home.js
- NearbyScreen.jsx
- All feed components

---

### BEATPULSE-FE-3: Guardrails UI

**Type:** Frontend  
**Priority:** Medium  
**Story Points:** 3

**Description:**
Show guardrail status when activation blocked.

**Acceptance Criteria:**
- [ ] Daily cap reached → show message
- [ ] Cooldown active → show remaining time
- [ ] Premium active → show message
- [ ] Disable activate button when blocked

---

## 🧪 QA Tickets

### BEATPULSE-QA-1: Regression - Points feature switching

**Type:** QA  
**Priority:** Critical  
**Story Points:** 3

**Description:**
Test that feature switching works correctly with BeatPulse.

**Test Cases:**
- [ ] BeatPulse stops when other feature activated
- [ ] Other feature stops when BeatPulse activated
- [ ] Only one feature active at a time

---

### BEATPULSE-QA-2: Ranking sanity - filters unaffected

**Type:** QA  
**Priority:** Critical  
**Story Points:** 5

**Description:**
Verify BeatPulse doesn't bypass filters or change distance.

**Test Cases:**
- [ ] Age filter still applied
- [ ] Distance filter still applied
- [ ] Other filters still applied
- [ ] Distance values unchanged
- [ ] Only ranking position affected

---

### BEATPULSE-QA-3: Premium override regression

**Type:** QA  
**Priority:** Critical  
**Story Points:** 2

**Description:**
Test Premium override behavior.

**Test Cases:**
- [ ] Premium user cannot use points features
- [ ] Active boost terminates on Premium purchase
- [ ] No points features available for Premium users

---

### BEATPULSE-QA-4: Guardrails regression

**Type:** QA  
**Priority:** High  
**Story Points:** 3

**Description:**
Test all guardrails work correctly.

**Test Cases:**
- [ ] Daily cap blocks 4th activation
- [ ] Cooldown blocks rapid activation
- [ ] Midnight reset works
- [ ] Low profile quality handled

---

## 📊 Summary

| Category | Tickets | Total Points |
|----------|---------|--------------|
| Backend | 5 | 24 |
| Frontend | 3 | 8 |
| QA | 4 | 13 |
| **Total** | **12** | **45** |

---

## 📅 Suggested Sprint Allocation

### Sprint 1 (Core Backend)
- BEATPULSE-1: Ranking multiplier (8 pts)
- BEATPULSE-2: Duration + expiry (5 pts)
- BEATPULSE-4: Premium override (3 pts)

### Sprint 2 (Guardrails + Frontend)
- BEATPULSE-3: Guardrails (5 pts)
- BEATPULSE-5: Quality filter (3 pts)
- BEATPULSE-FE-1: Points card (3 pts)
- BEATPULSE-FE-2: No UI leaks (2 pts)

### Sprint 3 (Polish + QA)
- BEATPULSE-FE-3: Guardrails UI (3 pts)
- BEATPULSE-QA-1: Feature switching (3 pts)
- BEATPULSE-QA-2: Filters unaffected (5 pts)
- BEATPULSE-QA-3: Premium override (2 pts)
- BEATPULSE-QA-4: Guardrails (3 pts)

---

## 🔗 Dependencies

```
BEATPULSE-2 depends on BEATPULSE-1
BEATPULSE-3 depends on BEATPULSE-1
BEATPULSE-5 depends on BEATPULSE-3
BEATPULSE-FE-1 depends on Points Hub (done)
BEATPULSE-FE-3 depends on BEATPULSE-3
BEATPULSE-QA-* depends on all dev tickets
```

---

## 🔒 Locked Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Duration | 15 minutes | Cannot be changed |
| Cost | 70 points | Cannot be changed |
| Multiplier range | 1.15 - 1.35 | Server config |
| Daily limit | 3 | Server config |
| Cooldown | 30 minutes | Server config |
| Profile threshold | 70% | Server config |

---

**Last Updated:** January 2026  
**Version:** 1.0
