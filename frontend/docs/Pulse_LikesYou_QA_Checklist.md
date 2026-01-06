# 🧪 Pulse Likes You — QA Checklist

> **Complete test coverage for Likes You Reveal Feature**

---

## 🧪 SECTION A — Locked State

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| LY1 | Locked view | לפתוח Likes You בלי unlock | כרטיסים blurred / masked | High |
| LY2 | No photo leak | Inspect network | photoUrl = null | **Critical** |
| LY3 | No name leak | Inspect network | displayName = null | **Critical** |
| LY4 | CTA display | Locked state | "Unlock for 10 min (80 pts)" visible | High |
| LY5 | Count visible | Locked state | Total likes count shown | Medium |

---

## 🧪 SECTION B — Unlock Flow

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| LY6 | Unlock success | Activate (80 pts) | gate=isUnlocked + timer | High |
| LY7 | Immediate refresh | unlock → רשימה | נפתח מייד בלי blur | **Critical** |
| LY8 | Points deducted | After activation | Balance reduced by 80 | High |
| LY9 | Insufficient points | <80 points → activate | Error message, no activation | High |
| LY10 | Timer display | After unlock | "Active now · 09:31" visible | High |

---

## 🧪 SECTION C — Revealed State

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| LY11 | Photos visible | Unlocked state | All photos clear (no blur) | High |
| LY12 | Names visible | Unlocked state | Display names shown | High |
| LY13 | Age visible | Unlocked state | Ages shown | High |
| LY14 | Distance visible | Unlocked state | Distance shown | High |
| LY15 | Like/Pass actions | Tap on card | Can like or pass | High |
| LY16 | Profile access | Tap on card | Opens full profile | High |

---

## 🧪 SECTION D — Expiry Behavior

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| LY17 | Expire behavior | להמתין 10 דק | חוזר ל־blur אוטומטית | **Critical** |
| LY18 | No data leak | אחרי expiry | photoUrl/name לא נחשפים | **Critical** |
| LY19 | Session ended hint | Expiry while viewing | "Session ended" message | Medium |
| LY20 | No celebration | On expiry | No animation/confetti | Medium |
| LY21 | CTA returns | After expiry | Unlock CTA visible again | High |

---

## 🧪 SECTION E — Feature Switching

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| LY22 | Switch feature | Activate Undo בזמן unlock | Likes You נסגר מייד | **Critical** |
| LY23 | Switch to BeatPulse | Activate BeatPulse בזמן unlock | Likes You נסגר מייד | **Critical** |
| LY24 | Switch to Nearby Priority | Activate Nearby Priority | Likes You נסגר מייד | **Critical** |
| LY25 | Single feature rule | Check active features | Only one active at a time | **Critical** |

---

## 🧪 SECTION F — Premium Override

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| LY26 | Premium overrides | לקנות Premium באמצע | points feature נסגר, premium ממשיך reveal | High |
| LY27 | Premium user access | Premium user opens Likes You | Always unlocked | High |
| LY28 | Premium no points | Premium user tries points | Blocked - "Premium active" | High |
| LY29 | Premium cancel | Premium expires | Reverts to locked | High |

---

## 🧪 SECTION G — App Lifecycle

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| LY30 | App force close | לסגור אפליקציה | הטיימר ממשיך, חוזר לפי שרת | High |
| LY31 | App background | Send to background | Timer continues server-side | High |
| LY32 | App return | Return to app | State refreshed from server | High |
| LY33 | Screen navigation | Navigate away and back | Unlock persists until expiry | High |

---

## 🧪 SECTION H — Pagination & Data

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| LY34 | Pagination | גלילה לרשימה | cursor עובד, same gate | Medium |
| LY35 | New like during unlock | Someone new likes | Appears in list (revealed) | Medium |
| LY36 | Large list | 50+ likes | Pagination works correctly | Medium |

---

## ✅ Definition of Done (QA)

- [ ] Locked state shows blurred cards
- [ ] No data leakage (photoUrl/name null when locked)
- [ ] 10 minute timer accurate
- [ ] Immediate refetch on activation
- [ ] Blur returns automatically on expiry
- [ ] Feature switching works (stops Likes You)
- [ ] Premium override works
- [ ] App lifecycle handled correctly
- [ ] Pagination works
- [ ] No celebration/gamification UI

---

## 📊 Test Matrix

### Gate State × Data Visibility

| Gate State | Photo | Name | Age | Distance | Actions |
|------------|-------|------|-----|----------|---------|
| Locked | null (blur) | null | null | null | CTA only |
| Unlocked (points) | visible | visible | visible | visible | Like/Pass |
| Unlocked (premium) | visible | visible | visible | visible | Like/Pass |
| Expired | null (blur) | null | null | null | CTA only |

### Feature Switch Matrix

| Active Feature | New Activation | Result |
|----------------|----------------|--------|
| Likes You | Undo | Likes You stops |
| Likes You | BeatPulse | Likes You stops |
| Likes You | Nearby Priority | Likes You stops |
| Undo | Likes You | Undo stops |
| BeatPulse | Likes You | BeatPulse stops |

---

**Last Updated:** January 2026  
**Version:** 1.0
