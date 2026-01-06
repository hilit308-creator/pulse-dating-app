# 🧪 Pulse Nearby Priority — QA Checklist

> **Complete test coverage for Nearby Priority Ranking Boost**

---

## 🧪 SECTION A — Activation & Basic Flow

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| NP1 | Unlock | Activate (70 pts) | Active Feature + countdown 10m | High |
| NP2 | Points deducted | After activation | Balance reduced by 70 | High |
| NP3 | Insufficient points | <70 points → activate | Error message, no activation | High |
| NP4 | Timer display | After unlock | 10 min countdown accurate | High |
| NP5 | Expiry | להמתין 10m | חוזר לדירוג רגיל | High |

---

## 🧪 SECTION B — Ranking Effect

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| NP6 | Nearby ranking | פיד Nearby של אחרים | המשתמש מופיע מוקדם יותר | High |
| NP7 | Server logs | Check ranking logs | Priority boost applied | High |
| NP8 | Cap enforced | Check ranking | Boost limited by cap | Medium |
| NP9 | Only affects Nearby | Check Home feed | No effect on Home | High |

---

## 🧪 SECTION C — Distance & Filter Safety

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| NP10 | No distance change | לראות distance UI | distance לא משתנה | **Critical** |
| NP11 | Distance filter | Set max 5km | Still filtered correctly | **Critical** |
| NP12 | Age filter | Set age range | לא עוקף פילטרים | **Critical** |
| NP13 | Preference filters | Various filters | All respected | **Critical** |
| NP14 | Blocked users | Blocked user | Not shown despite priority | **Critical** |

---

## 🧪 SECTION D — Invisibility

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| NP15 | Invisible to others | בצד השני | אין badge/הודעה | High |
| NP16 | No badge in Nearby | Other user's view | No "boosted" indicator | High |
| NP17 | No profile indicator | View profile | No priority indicator | High |
| NP18 | API response clean | Check response | No priority flags exposed | High |

---

## 🧪 SECTION E — Feature Switching

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| NP19 | Switch feature | Activate BeatPulse בזמן NP | NP מחליף מייד | **Critical** |
| NP20 | Switch to Undo | Activate Undo | NP stops immediately | **Critical** |
| NP21 | Switch to Likes You | Activate Likes You | NP stops immediately | **Critical** |
| NP22 | Single feature rule | Check active features | Only one active | **Critical** |

---

## 🧪 SECTION F — Premium Override

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| NP23 | Premium override | לקנות Premium באמצע | NP נפסק; premium לפי entitlement | High |
| NP24 | Premium user | Premium tries to activate | Blocked - points disabled | High |
| NP25 | Premium expires | Premium ends | Can use points again | High |

---

## 🧪 SECTION G — App Lifecycle

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| NP26 | App background | Send to background | Timer continues server-side | High |
| NP27 | App force close | יוצא מהאפליקציה | הטיימר ממשיך | High |
| NP28 | App return | Return to app | Status refreshed from server | High |
| NP29 | Network error | שרת מתעכב | client לא מנחש | Medium |

---

## 🧪 SECTION H — UI Rules

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| NP30 | Points Hub display | NP active | Shows in Active Feature | High |
| NP31 | No external UI | Nearby screen | No badge/indicator | High |
| NP32 | No toast | After activation | No special toast | Medium |
| NP33 | No statistics | Points Hub | No "reached X people" | High |

---

## ✅ Definition of Done (QA)

- [ ] 10 minute timer accurate
- [ ] Nearby ranking affected
- [ ] Home feed NOT affected
- [ ] Distance values unchanged
- [ ] All filters respected
- [ ] Invisible to other users
- [ ] Feature switching works
- [ ] Premium override works
- [ ] Cap enforced
- [ ] No UI leaks

---

## 📊 Test Matrix

### Feature Scope Matrix

| Feed | Affected by NP |
|------|----------------|
| Nearby | ✅ Ranking only |
| Home | ❌ No effect |
| Likes You | ❌ No effect |

### Filter Safety Matrix

| Filter | Bypassed by NP |
|--------|----------------|
| Distance | ❌ Never |
| Age | ❌ Never |
| Preferences | ❌ Never |
| Blocks | ❌ Never |
| Privacy | ❌ Never |

### Feature Switch Matrix

| Active Feature | New Activation | Result |
|----------------|----------------|--------|
| Nearby Priority | BeatPulse | NP stops |
| Nearby Priority | Undo | NP stops |
| Nearby Priority | Likes You | NP stops |
| BeatPulse | Nearby Priority | BP stops |

---

**Last Updated:** January 2026  
**Version:** 1.0
