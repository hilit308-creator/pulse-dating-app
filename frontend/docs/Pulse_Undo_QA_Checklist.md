# 🧪 Pulse Undo — QA Checklist

> **Complete test coverage for Undo Backtrack Feature**

---

## 🧪 SECTION A — Activation & Basic Flow

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| U1 | Unlock Undo | Activate Undo (40 pts) | Active Feature timer 30m | High |
| U2 | Points deducted | After activation | Balance reduced by 40 | High |
| U3 | Insufficient points | <40 points → activate | Error message, no activation | High |
| U4 | Timer display | After unlock | 30 min countdown accurate | High |
| U5 | Expiry | אחרי 30m | Undo disabled | **Critical** |

---

## 🧪 SECTION B — Undo Pass

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| U6 | Undo Pass | Pass → Undo | כרטיס חוזר | **Critical** |
| U7 | Pass restored correctly | After undo | Same user card displayed | High |
| U8 | Can swipe again | After undo | Normal swipe works | High |
| U9 | Multiple passes | Pass A, Pass B → Undo | רק B חוזר | **Critical** |

---

## 🧪 SECTION C — Undo Like

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| U10 | Undo Like (no match) | Like → Undo | like מתבטל והכרטיס חוזר | High |
| U11 | Like record removed | After undo | No like record on server | High |
| U12 | Undo Like (creates match) | Like שיוצר match → Undo | חסימה "Can't undo after a match" | **Critical** |
| U13 | Match preserved | After blocked undo | Match still exists | **Critical** |

---

## 🧪 SECTION D — One-Step-Back Rule

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| U14 | One step only | like A, like B → Undo | מחזיר רק B | **Critical** |
| U15 | Sequential undos | Undo → Swipe → Undo | Works correctly | High |
| U16 | Undo twice in a row | Undo → Undo | Second blocked (NO_PREVIOUS_ACTION) | High |
| U17 | No multi-step | Try to undo multiple steps | Only last action available | **Critical** |

---

## 🧪 SECTION E — Unlimited Usage

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| U18 | Unlimited | לעשות 10 פעמים | אין מגבלה בתוך חלון | Medium |
| U19 | Many swipe+undo cycles | 20 cycles | All work correctly | Medium |
| U20 | No rate limit | Rapid undo taps | Works without throttle | Low |

---

## 🧪 SECTION F — Session & Retroactive

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| U21 | No retroactive | refresh feed → Undo | חסום | High |
| U22 | Session preserved | Navigate away and back | Undo still works if same session | High |
| U23 | Session mismatch | Feed refresh → Undo | 409 SESSION_MISMATCH | High |
| U24 | New feed = new session | Pull to refresh | New sessionId generated | High |

---

## 🧪 SECTION G — Feature Switching

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| U25 | Switch feature | Activate BeatPulse בזמן Undo | Undo נסגר מייד | **Critical** |
| U26 | Switch to Likes You | Activate Likes You | Undo נסגר מייד | **Critical** |
| U27 | Premium override | Purchase Premium | Undo via points stops | High |
| U28 | Single feature rule | Check active features | Only one active | **Critical** |

---

## 🧪 SECTION H — Edge Cases

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| U29 | No previous action | Undo without swiping | disabled / error 409 | High |
| U30 | App force close | Close app during active | הטיימר ממשיך | High |
| U31 | App background | Background during active | Timer continues server-side | High |
| U32 | Network error | Undo with no network | Error message, card not restored | Medium |
| U33 | Concurrent swipes | Rapid swipes + undo | Last action only | Medium |

---

## 🧪 SECTION I — UI/UX

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| U34 | Button disabled when locked | No undo active | Undo button disabled/hidden | High |
| U35 | Button enabled when active | Undo active | Undo button visible and enabled | High |
| U36 | No confirmation | Tap undo | Immediate action, no dialog | Medium |
| U37 | No celebration | After undo | No animations/confetti | Medium |
| U38 | Card animation | After undo | Card slides back smoothly | Medium |

---

## ✅ Definition of Done (QA)

- [ ] 30 minute timer accurate
- [ ] Unlimited undos within window
- [ ] One-step-back only
- [ ] No retroactive undo
- [ ] Pass undo works
- [ ] Like undo works (no match)
- [ ] Like undo blocked (match created)
- [ ] Session management correct
- [ ] Feature switching stops undo
- [ ] UI states correct

---

## 📊 Test Matrix

### Undo Availability Matrix

| Feature Status | Previous Action | Match Created | Can Undo |
|----------------|-----------------|---------------|----------|
| Active | Pass | - | ✅ |
| Active | Like | No | ✅ |
| Active | Like | Yes | ❌ |
| Active | None | - | ❌ |
| Expired | Any | - | ❌ |
| Not activated | Any | - | ❌ |

### Session Matrix

| Scenario | Same Session | Can Undo |
|----------|--------------|----------|
| Normal swipe | ✅ | ✅ |
| Navigate away/back | ✅ | ✅ |
| Feed refresh | ❌ | ❌ |
| App restart | ❌ | ❌ |

---

**Last Updated:** January 2026  
**Version:** 1.0
