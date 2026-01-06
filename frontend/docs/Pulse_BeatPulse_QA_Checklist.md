# 🧪 Pulse BeatPulse — QA Checklist

> **Complete test coverage for BeatPulse Exposure Boost**

---

## 🧪 SECTION A — Activation & Basic Flow

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| BP1 | הפעלה דרך Points | Activate BeatPulse | Active Feature מופיע + countdown | High |
| BP2 | נקודות מספיקות | 70+ points → activate | הפעלה מצליחה | High |
| BP3 | נקודות לא מספיקות | <70 points → activate | הודעת שגיאה, אין הפעלה | High |
| BP4 | Countdown display | BeatPulse active | 15 דקות countdown מדויק | High |
| BP5 | פקיעה אוטומטית | להמתין 15 דקות | נעלם, status חוזר ל-inactive | High |

---

## 🧪 SECTION B — Feed Impact

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| BP6 | משפיע על Home | הפעלה → רענון Home | המשתמש מופיע מוקדם יותר אצל אחרים (בדיקה שרתית/לוגים) | High |
| BP7 | משפיע על Nearby | הפעלה → Nearby | קדימות עולה אך בלי שינוי מרחק | High |
| BP8 | אין שינוי פילטרים | פילטר גיל/מרחק פעיל | BeatPulse לא עוקף פילטרים | **Critical** |
| BP9 | אין שינוי מרחק | check distance values | מרחק נשאר זהה | **Critical** |
| BP10 | Multiplier applied | Server logs | final_score = base_score * multiplier | High |

---

## 🧪 SECTION C — Feature Switching

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| BP11 | Feature יחיד | להפעיל Undo ואז BeatPulse | Undo נפסק מייד, BeatPulse מתחיל | **Critical** |
| BP12 | BeatPulse then other | להפעיל BeatPulse ואז Likes You | BeatPulse נפסק מייד, Likes You מתחיל | **Critical** |
| BP13 | Premium override | לקנות Premium בזמן BeatPulse | BeatPulse נפסק מייד | **Critical** |
| BP14 | Premium active | Premium user → try activate | אין אפשרות להפעיל | High |

---

## 🧪 SECTION D — Guardrails

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| BP15 | Daily cap | 3 הפעלות ביום אחד | הפעלה רביעית נחסמת | High |
| BP16 | Cooldown | 2 הפעלות ברצף | הפעלה שנייה נחסמת עד סיום cooldown | High |
| BP17 | Cooldown timer | בזמן cooldown | מוצג זמן נותר | Medium |
| BP18 | Profile quality low | פרופיל <70% completeness | multiplier מופחת או נחסם | Medium |
| BP19 | Flagged user | משתמש עם trust flag | BeatPulse לא זמין | High |

---

## 🧪 SECTION E — UI Rules

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| BP20 | אין UI למשתמש | מחוץ ל־Points Hub | אין badge/סטטיסטיקות/הודעות | High |
| BP21 | אין badge | Home screen | אין "Boosting" indicator | High |
| BP22 | אין toast | לאחר הפעלה | אין toast "you're now boosted" | High |
| BP23 | אין סטטיסטיקות | Points Hub active | אין "reached X people" | High |
| BP24 | Points Hub display | BeatPulse active | מוצג רק countdown | High |

---

## 🧪 SECTION F — Server & Edge Cases

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| BP25 | Server lag | עיכוב תשובה | client לא מנחש, מציג loading | Medium |
| BP26 | App background | BeatPulse active → background | Timer continues server-side | High |
| BP27 | App kill | BeatPulse active → kill app | Boost still active on return | High |
| BP28 | Network disconnect | BeatPulse active → offline | Status refreshes on reconnect | Medium |
| BP29 | Midnight reset | הפעלות ביום → חצות | Daily cap resets | Medium |

---

## ✅ Definition of Done (QA)

- [ ] BeatPulse activates correctly via Points
- [ ] 15 minute countdown accurate
- [ ] Home feed ranking affected
- [ ] Nearby feed ranking affected
- [ ] Filters NOT affected
- [ ] Distance NOT changed
- [ ] Single feature rule enforced
- [ ] Premium override works
- [ ] Daily cap enforced
- [ ] Cooldown enforced
- [ ] No UI outside Points Hub
- [ ] No statistics shown to user

---

## 📊 Test Matrix

### Guardrails Matrix

| Condition | Can Activate | Reason |
|-----------|--------------|--------|
| Normal user, first time | ✅ | - |
| Normal user, 3rd time | ✅ | - |
| Normal user, 4th time | ❌ | Daily cap |
| Within 30min of last | ❌ | Cooldown |
| Premium active | ❌ | Premium override |
| Other feature active | ✅ | Stops previous |
| Profile <70% | ⚠️ | Reduced multiplier |
| Flagged user | ❌ | Trust flag |

### Feed Impact Matrix

| Feed | BeatPulse Effect |
|------|------------------|
| Home | Early placement ✅ |
| Nearby | Priority boost ✅ |
| Distance | No change ❌ |
| Filters | No bypass ❌ |

---

**Last Updated:** January 2026  
**Version:** 1.0
