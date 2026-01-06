# 🎯 Pulse Chat Gates — Jira Tickets

> **Work breakdown for Chat Feature Gates implementation**

---

## 🎯 Backend Tickets

### CHAT-1: Implement thread endpoint with gates

**Type:** Backend  
**Priority:** High  
**Story Points:** 5

**Description:**
```
GET /v1/chat/threads/{threadId}
```

**Acceptance Criteria:**
- [ ] Returns thread metadata
- [ ] Returns current gates state
- [ ] Returns participants list
- [ ] Returns thread state (MATCHED_UNLOCKED/GATED/BLOCKED/EXPIRED)
- [ ] 404 for non-existent threads

**Technical Notes:**
- Include gates calculation in response
- Cache thread metadata for performance

---

### CHAT-2: Implement messages pagination

**Type:** Backend  
**Priority:** High  
**Story Points:** 3

**Description:**
```
GET /v1/chat/threads/{threadId}/messages
```

**Acceptance Criteria:**
- [ ] Cursor-based pagination
- [ ] Limit 1-50, default 30
- [ ] Return nextCursor or null
- [ ] 403 for blocked threads
- [ ] Oldest first ordering

**Technical Notes:**
- Use cursor for efficient pagination
- Index on (threadId, createdAt)

---

### CHAT-3: Enforce gates in send message

**Type:** Backend  
**Priority:** Critical  
**Story Points:** 5

**Description:**
```
POST /v1/chat/threads/{threadId}/messages
```

**Acceptance Criteria:**
- [ ] Check gates before allowing send
- [ ] 201 on success with message + updated thread
- [ ] 409 MESSAGE_GATED with gates and thread
- [ ] 403 SYSTEM_BLOCKED for blocked threads
- [ ] 429 for rate limiting
- [ ] Body max 2000 chars validation

**Gates Check Order:**
1. Thread exists
2. Not BLOCKED
3. canSendMessage = true
4. Rate limit check

---

### CHAT-4: Idempotency support

**Type:** Backend  
**Priority:** Critical  
**Story Points:** 5

**Description:**
Implement idempotency for message sending.

**Acceptance Criteria:**
- [ ] Require `Idempotency-Key` header (UUID)
- [ ] Store key → response mapping (TTL 24h)
- [ ] Return cached response for duplicate key
- [ ] 400 if key missing

**Technical Notes:**
- Redis for key storage
- TTL: 24 hours
- Key format: `idempotency:{userId}:{key}`

---

### CHAT-5: Gates lightweight polling

**Type:** Backend  
**Priority:** Medium  
**Story Points:** 2

**Description:**
```
GET /v1/chat/threads/{threadId}/gates
```

**Acceptance Criteria:**
- [ ] Return only GateState object
- [ ] Fast response (<50ms)
- [ ] Support frequent polling

**Technical Notes:**
- Lightweight endpoint for polling
- Consider caching with short TTL

---

## 🎨 Frontend Tickets

### CHAT-FE-1: Chat screen renders GateState

**Type:** Frontend  
**Priority:** High  
**Story Points:** 5

**Description:**
Render gate state in chat UI.

**Acceptance Criteria:**
- [ ] Show ChatGateBanner when gated
- [ ] Disable composer when gated
- [ ] Show correct placeholder text
- [ ] CTA button navigates correctly
- [ ] No CTA for SYSTEM_BLOCKED

**Components:**
- `ChatGateBanner` ✅ Created
- `ChatGateIndicator` ✅ Created
- Composer disabled state

**File:** `ChatScreen.jsx`

---

### CHAT-FE-2: Real-time refresh strategy

**Type:** Frontend  
**Priority:** High  
**Story Points:** 3

**Description:**
Implement real-time gate updates.

**Acceptance Criteria:**
- [ ] Poll /gates every 5s when gated
- [ ] Immediate refresh on app foreground
- [ ] Stop polling when unlocked
- [ ] Handle websocket if available

**Technical Notes:**
- useEffect with interval
- Cleanup on unmount
- Visibility API for foreground detection

---

### CHAT-FE-3: Retry & error UX

**Type:** Frontend  
**Priority:** Medium  
**Story Points:** 3

**Description:**
Handle errors and retries gracefully.

**Acceptance Criteria:**
- [ ] 409 updates gate banner
- [ ] 429 shows rate limit message
- [ ] Network error shows retry option
- [ ] Loading state on send
- [ ] Disable double-send

**Error Messages:**
| Code | Message |
|------|---------|
| 409 | Banner updates |
| 429 | "Please wait before sending" |
| 403 | "Chat unavailable" |
| 5xx | "Something went wrong" |

---

### CHAT-FE-4: Idempotency-Key generation

**Type:** Frontend  
**Priority:** High  
**Story Points:** 2

**Description:**
Generate and manage idempotency keys.

**Acceptance Criteria:**
- [ ] Generate UUID for each message
- [ ] Include in request header
- [ ] Store pending keys for retry
- [ ] Clear after confirmed delivery

**Technical Notes:**
- Use uuid library or crypto.randomUUID()
- Store in message state until confirmed

---

## 🧪 QA Tickets

### CHAT-QA-1: Full gated/unlocked/blocked matrix

**Type:** QA  
**Priority:** High  
**Story Points:** 5

**Description:**
Test all combinations of thread states and block reasons.

**Scope:**
- Thread states: MATCHED_UNLOCKED, MATCHED_GATED, BLOCKED, EXPIRED
- Block reasons: All 6 types
- CTA types: All 4 types

**Reference:** `Pulse_Chat_QA_Checklist.md`

---

### CHAT-QA-2: Idempotency regression

**Type:** QA  
**Priority:** Critical  
**Story Points:** 3

**Description:**
Verify idempotency prevents duplicate messages.

**Test Cases:**
- [ ] Same key → same response
- [ ] Different key → new message
- [ ] Missing key → 400 error
- [ ] Expired key → new message

---

### CHAT-QA-3: Real-time change regression

**Type:** QA  
**Priority:** High  
**Story Points:** 3

**Description:**
Test real-time gate updates.

**Test Cases:**
- [ ] Premium purchase unlocks immediately
- [ ] Points unlock shows timer
- [ ] Block shows immediately
- [ ] Unlock expiry re-gates

---

## 📊 Summary

| Category | Tickets | Total Points |
|----------|---------|--------------|
| Backend | 5 | 20 |
| Frontend | 4 | 13 |
| QA | 3 | 11 |
| **Total** | **12** | **44** |

---

## 📅 Suggested Sprint Allocation

### Sprint 1 (Core Backend + Basic UI)
- CHAT-1: Thread endpoint
- CHAT-2: Messages pagination
- CHAT-3: Gates enforcement
- CHAT-FE-1: Gate UI rendering

### Sprint 2 (Reliability + Polish)
- CHAT-4: Idempotency
- CHAT-5: Gates polling
- CHAT-FE-2: Real-time refresh
- CHAT-FE-4: Idempotency keys

### Sprint 3 (QA + Error Handling)
- CHAT-FE-3: Error UX
- CHAT-QA-1: Full matrix testing
- CHAT-QA-2: Idempotency regression
- CHAT-QA-3: Real-time regression

---

## 🔗 Dependencies

```
CHAT-3 depends on CHAT-1
CHAT-FE-1 depends on CHAT-1
CHAT-FE-2 depends on CHAT-5
CHAT-FE-4 depends on CHAT-4
CHAT-QA-* depends on all dev tickets
```

---

**Last Updated:** January 2026  
**Version:** 1.0
