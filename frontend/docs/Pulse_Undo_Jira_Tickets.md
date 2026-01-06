# 🎯 Pulse Undo — Jira Tickets

> **Work breakdown for Undo Backtrack Feature implementation**

---

## 🎯 Backend Tickets

### UNDO-1: Store last swipe decision per session

**Type:** Backend  
**Priority:** Critical  
**Story Points:** 5

**Description:**
Store the last swipe decision for each user session to enable undo functionality.

**Data Model:**
```
SwipeSession {
  userId: string
  sessionId: string
  lastAction: {
    targetUserId: string
    action: 'like' | 'pass'
    timestamp: datetime
    matchCreated: boolean
  } | null
  createdAt: datetime
  expiresAt: datetime
}
```

**Acceptance Criteria:**
- [ ] Store sessionId, action, targetUserId, timestamp
- [ ] Only keep the LAST action (one-step-back)
- [ ] Track if match was created on like
- [ ] Session expires with feed refresh
- [ ] Cleanup old sessions

---

### UNDO-2: Implement /v1/swipe/undo endpoint

**Type:** Backend  
**Priority:** Critical  
**Story Points:** 8

**Description:**
Implement the undo endpoint that cancels the last swipe decision.

**Acceptance Criteria:**
- [ ] Cancel last decision (remove like/pass record)
- [ ] Return restoredUserId for client
- [ ] One-step-back only (clear lastAction after undo)
- [ ] Block if match_created
- [ ] Block if no previous action
- [ ] Block if session mismatch
- [ ] Block if feature not active

**Error Codes:**
| Code | Reason |
|------|--------|
| UNDO_BLOCKED | NO_PREVIOUS_ACTION |
| UNDO_BLOCKED | MATCH_CREATED |
| UNDO_BLOCKED | FEATURE_NOT_ACTIVE |
| UNDO_BLOCKED | SESSION_MISMATCH |

---

### UNDO-3: Integrate points feature undo

**Type:** Backend  
**Priority:** High  
**Story Points:** 3

**Description:**
Add undo to the points feature system.

**Acceptance Criteria:**
- [ ] Feature ID: `undo`
- [ ] Duration: 30 minutes (locked)
- [ ] Cost: 40 points (locked)
- [ ] Ends immediately when other feature activates
- [ ] Premium has unlimited undo (if applicable)

---

### UNDO-4: Implement /v1/swipe/decision endpoint

**Type:** Backend  
**Priority:** High  
**Story Points:** 5

**Description:**
Record swipe decisions and return undo state.

**Acceptance Criteria:**
- [ ] Record like/pass decision
- [ ] Update lastAction in session
- [ ] Check if like created match
- [ ] Return current UndoState
- [ ] Return matchCreated flag

---

## 🎨 Frontend Tickets

### UNDO-FE-1: Undo button behavior by UndoState

**Type:** Frontend  
**Priority:** High  
**Story Points:** 5

**Description:**
Implement undo button with proper state handling.

**Acceptance Criteria:**
- [ ] Disabled when canUndo=false
- [ ] Enabled when canUndo=true
- [ ] On success: re-render restored card
- [ ] On failure: show error message
- [ ] No confirmation dialog
- [ ] Smooth card animation on restore

**Button States:**
| UndoState | Button |
|-----------|--------|
| canUndo=true | Enabled |
| canUndo=false | Disabled/Hidden |
| Loading | Disabled + spinner |

---

### UNDO-FE-2: SessionId management in swipe screens

**Type:** Frontend  
**Priority:** High  
**Story Points:** 3

**Description:**
Manage session IDs for swipe screens.

**Acceptance Criteria:**
- [ ] Generate stable sessionId per feed session
- [ ] New sessionId on feed refresh
- [ ] New sessionId on pull-to-refresh
- [ ] Persist sessionId during navigation
- [ ] Clear sessionId on logout

**Implementation:**
```javascript
// Generate on feed load
const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Reset on refresh
const handleRefresh = () => {
  setSessionId(generateSessionId());
};
```

---

### UNDO-FE-3: Undo timer display

**Type:** Frontend  
**Priority:** Medium  
**Story Points:** 2

**Description:**
Show undo feature timer in UI.

**Acceptance Criteria:**
- [ ] Timer in Points Hub active feature
- [ ] Optional: Small indicator on swipe screen
- [ ] Updates every second
- [ ] Triggers state change on expiry

---

### UNDO-FE-4: Card restore animation

**Type:** Frontend  
**Priority:** Low  
**Story Points:** 2

**Description:**
Smooth animation when card is restored.

**Acceptance Criteria:**
- [ ] Card slides back from direction it left
- [ ] Smooth transition (300ms)
- [ ] No jarring UI changes
- [ ] Works with existing swipe animations

---

## 🧪 QA Tickets

### UNDO-QA-1: Regression - match edge case

**Type:** QA  
**Priority:** Critical  
**Story Points:** 3

**Description:**
Test undo behavior when match is created.

**Test Cases:**
- [ ] Like that creates match → undo blocked
- [ ] Error message shown correctly
- [ ] Match is preserved
- [ ] User can continue swiping

---

### UNDO-QA-2: Regression - session mismatch / refresh

**Type:** QA  
**Priority:** High  
**Story Points:** 3

**Description:**
Test session management and retroactive undo prevention.

**Test Cases:**
- [ ] Feed refresh → new sessionId
- [ ] Undo after refresh → blocked
- [ ] Navigate away/back → same session works
- [ ] App restart → new session

---

### UNDO-QA-3: One-step-back verification

**Type:** QA  
**Priority:** Critical  
**Story Points:** 2

**Description:**
Verify only one step back is allowed.

**Test Cases:**
- [ ] Swipe A, Swipe B → Undo returns B only
- [ ] Undo → Undo → second blocked
- [ ] Swipe → Undo → Swipe → Undo → works

---

## 📊 Summary

| Category | Tickets | Total Points |
|----------|---------|--------------|
| Backend | 4 | 21 |
| Frontend | 4 | 12 |
| QA | 3 | 8 |
| **Total** | **11** | **41** |

---

## 📅 Suggested Sprint Allocation

### Sprint 1 (Core Backend)
- UNDO-1: Store last decision (5 pts)
- UNDO-4: Decision endpoint (5 pts)
- UNDO-2: Undo endpoint (8 pts)

### Sprint 2 (Frontend + Integration)
- UNDO-3: Points integration (3 pts)
- UNDO-FE-1: Button behavior (5 pts)
- UNDO-FE-2: Session management (3 pts)

### Sprint 3 (Polish + QA)
- UNDO-FE-3: Timer display (2 pts)
- UNDO-FE-4: Card animation (2 pts)
- UNDO-QA-1: Match edge case (3 pts)
- UNDO-QA-2: Session regression (3 pts)
- UNDO-QA-3: One-step-back (2 pts)

---

## 🔗 Dependencies

```
UNDO-2 depends on UNDO-1
UNDO-4 depends on UNDO-1
UNDO-FE-1 depends on UNDO-2
UNDO-FE-2 depends on UNDO-4
UNDO-QA-* depends on all dev tickets
```

---

## 🔒 Locked Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Duration | 30 minutes | Cannot be changed |
| Cost | 40 points | Cannot be changed |
| Steps back | 1 | Cannot be changed |
| Scope | Swipe screens only | Home, Nearby Browse |

---

**Last Updated:** January 2026  
**Version:** 1.0
