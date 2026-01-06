# 🎯 Pulse Nearby Priority — Jira Tickets

> **Work breakdown for Nearby Priority Ranking Boost implementation**

---

## 🎯 Backend Tickets

### NEARBYPRIO-1: Implement priority weight in Nearby ranking

**Type:** Backend  
**Priority:** Critical  
**Story Points:** 8

**Description:**
Add priority boost to Nearby feed ranking algorithm.

**Model (Additive - Recommended):**
```
final_score = base_score + nearby_priority_boost
```

**Acceptance Criteria:**
- [ ] Apply additive boost when feature active
- [ ] Implement cap to limit boost effect
- [ ] Filter safety enforced (distance, age, preferences, blocks)
- [ ] Configurable boost value
- [ ] Does NOT affect distance display
- [ ] Only affects Nearby feed ranking

**Config Values:**
```yaml
nearby_priority:
  boost_value: 75
  max_positions_forward: 10
  duration_minutes: 10
  cost_points: 70
```

---

### NEARBYPRIO-2: Status endpoint

**Type:** Backend  
**Priority:** High  
**Story Points:** 2

**Description:**
Implement status endpoint for Nearby Priority.

```
GET /v1/priority/nearby/status
```

**Acceptance Criteria:**
- [ ] Returns active boolean
- [ ] Returns expiresAt when active
- [ ] Fast response (<50ms)
- [ ] No internal data leaked

---

### NEARBYPRIO-3: Integrate points feature nearby_priority

**Type:** Backend  
**Priority:** High  
**Story Points:** 3

**Description:**
Add nearby_priority to points feature system.

**Acceptance Criteria:**
- [ ] Feature ID: `nearby_priority`
- [ ] Duration: 10 minutes (locked)
- [ ] Cost: 70 points (locked)
- [ ] Immediate replacement of active feature
- [ ] Server timer for expiry

---

### NEARBYPRIO-4: Filter safety enforcement

**Type:** Backend  
**Priority:** Critical  
**Story Points:** 5

**Description:**
Ensure priority boost cannot bypass any filters.

**Acceptance Criteria:**
- [ ] Distance filter always applied
- [ ] Age filter always applied
- [ ] Preference filters always applied
- [ ] Blocks/reports always applied
- [ ] Privacy constraints always applied
- [ ] Unit tests for each filter

---

## 🎨 Frontend Tickets

### NEARBYPRIO-FE-1: Points card + active timer

**Type:** Frontend  
**Priority:** High  
**Story Points:** 3

**Description:**
Display Nearby Priority in Points Hub.

**Acceptance Criteria:**
- [ ] Card shows 10 min / 70 pts
- [ ] Active Feature shows countdown
- [ ] Timer updates every second
- [ ] No statistics shown

**Note:** Already implemented in `FEATURES` array in PointsHubScreen.jsx

---

### NEARBYPRIO-FE-2: Ensure no UI leaks in Nearby feed

**Type:** Frontend  
**Priority:** High  
**Story Points:** 2

**Description:**
Verify no "boosted" indicators in Nearby feed.

**Acceptance Criteria:**
- [ ] No badge on boosted users
- [ ] No "priority" text anywhere
- [ ] No special styling for boosted users
- [ ] Distance always shows real value

**Files to verify:**
- NearbyScreen.jsx
- ViewNearbyPeopleScreen.jsx
- Any nearby-related components

---

## 🧪 QA Tickets

### NEARBYPRIO-QA-1: Ranking + distance regression

**Type:** QA  
**Priority:** Critical  
**Story Points:** 5

**Description:**
Test ranking effect and distance display.

**Test Cases:**
- [ ] User appears higher in Nearby feed
- [ ] Distance values remain accurate
- [ ] Home feed unaffected
- [ ] Cap limits boost effect
- [ ] Ranking resets after expiry

---

### NEARBYPRIO-QA-2: Filter safety regression

**Type:** QA  
**Priority:** Critical  
**Story Points:** 5

**Description:**
Test all filters are respected with priority active.

**Test Cases:**
- [ ] Distance filter works
- [ ] Age filter works
- [ ] Preference filters work
- [ ] Blocked users hidden
- [ ] Privacy settings respected

---

### NEARBYPRIO-QA-3: Invisibility regression

**Type:** QA  
**Priority:** High  
**Story Points:** 2

**Description:**
Test feature is invisible to other users.

**Test Cases:**
- [ ] No badge visible to others
- [ ] No indicator on profile
- [ ] API response clean
- [ ] No UI leaks anywhere

---

## 📊 Summary

| Category | Tickets | Total Points |
|----------|---------|--------------|
| Backend | 4 | 18 |
| Frontend | 2 | 5 |
| QA | 3 | 12 |
| **Total** | **9** | **35** |

---

## 📅 Suggested Sprint Allocation

### Sprint 1 (Core Backend)
- NEARBYPRIO-1: Ranking implementation (8 pts)
- NEARBYPRIO-4: Filter safety (5 pts)
- NEARBYPRIO-3: Points integration (3 pts)

### Sprint 2 (Frontend + Polish)
- NEARBYPRIO-2: Status endpoint (2 pts)
- NEARBYPRIO-FE-1: Points card (3 pts)
- NEARBYPRIO-FE-2: No UI leaks (2 pts)

### Sprint 3 (QA)
- NEARBYPRIO-QA-1: Ranking regression (5 pts)
- NEARBYPRIO-QA-2: Filter safety (5 pts)
- NEARBYPRIO-QA-3: Invisibility (2 pts)

---

## 🔗 Dependencies

```
NEARBYPRIO-1 depends on existing Nearby ranking
NEARBYPRIO-4 depends on NEARBYPRIO-1
NEARBYPRIO-FE-1 depends on Points Hub (done)
NEARBYPRIO-QA-* depends on all dev tickets
```

---

## 🔒 Locked Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Duration | 10 minutes | Cannot be changed |
| Cost | 70 points | Cannot be changed |
| Scope | Nearby only | Cannot affect Home |
| Model | Additive | Recommended for V1 |

---

**Last Updated:** January 2026  
**Version:** 1.0
