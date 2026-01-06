# 🧪 Pulse Points – QA Checklist

> **Complete test coverage for Points Hub features**

---

## 🧪 SECTION A — Balance & Visibility

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| A1 | פתיחת Points Hub | להיכנס למסך | יתרה נכונה מוצגת | High |
| A2 | עדכון בזמן אמת | שינוי בשרת | UI מתעדכן | High |
| A3 | משתמש עם מנוי | Premium פעיל | Points מוסתרים/מנוטרלים | **Critical** |
| A4 | יתרה 0 | משתמש ללא נקודות | מוצג 0, כל Features disabled | Medium |
| A5 | Sync בין מסכים | שינוי במסך אחד | כל המסכים מתעדכנים | High |

---

## 🧪 SECTION B — Feature Activation

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| B1 | הפעלת Undo | Activate Undo | טיימר מתחיל, 40 pts נגרעים | High |
| B2 | הפעלת Likes You | Activate Likes You | רשימה נפתחת, 80 pts נגרעים | High |
| B3 | הפעלת Nearby Priority | Activate | 70 pts נגרעים, טיימר 10 min | High |
| B4 | הפעלת BeatPulse | Activate | 70 pts נגרעים, טיימר 15 min | High |
| B5 | Feature כפול | להפעיל Feature נוסף | הקודם נפסק **מייד** | **Critical** |
| B6 | אין מספיק נקודות | Activate | חסימה + הודעה | High |
| B7 | Feature פג | להמתין לסיום טיימר | Section נעלם אוטומטית | High |
| B8 | אין confirmation | Tap Activate | פעולה מיידית, ללא dialog | High |

### Feature Cost Matrix (Verification)

| Feature | Duration | Cost | Test |
|---------|----------|------|------|
| Undo | 30 min | 40 pts | ☐ |
| Likes You | 10 min | 80 pts | ☐ |
| Nearby Priority | 10 min | 70 pts | ☐ |
| BeatPulse | 15 min | 70 pts | ☐ |

---

## 🧪 SECTION C — Buying Points

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| C1 | רכישה קטנה | Buy Small (100 pts) | נקודות מתווספות, ₪9.90 | High |
| C2 | רכישה בינונית | Buy Medium (250 pts) | נקודות מתווספות, ₪19.90 | High |
| C3 | רכישה גדולה | Buy Large (600 pts) | נקודות מתווספות, ₪39.90 | High |
| C4 | ביטול תשלום | Cancel checkout | אין שינוי ביתרה | Medium |
| C5 | רכישה באמצע Feature | Buy while feature active | Feature לא מושפע | High |
| C6 | אין Success screen | רכישה מוצלחת | רק עדכון יתרה, ללא חגיגה | Medium |

### Package Pricing (Verification)

| Package | Points | Price | Test |
|---------|--------|-------|------|
| Small | 100 | ₪9.90 | ☐ |
| Medium | 250 | ₪19.90 | ☐ |
| Large | 600 | ₪39.90 | ☐ |

---

## 🧪 SECTION D — Edge Cases

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| D1 | אפליקציה נסגרת | Force close באמצע Feature | טיימר ממשיך בשרת | High |
| D2 | Subscription באמצע Feature | Buy Premium | Feature נפסק **מייד** | **Critical** |
| D3 | Lag שרת | האטה בתגובה | UI ממתין, לא מנחש | High |
| D4 | Network offline | אין חיבור | הודעת שגיאה | Medium |
| D5 | Feature פג באמצע פעולה | Undo expires while swiping | פעולה נחסמת | High |
| D6 | רכישה נכשלת | Payment declined | הודעת שגיאה, אין שינוי | High |

---

## 🧪 SECTION E — Subscription Override

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| E1 | Premium user opens Points | יש מנוי פעיל | הודעה: "Points features included" | **Critical** |
| E2 | Activate while Premium | Tap Activate | חסום, 403 error | **Critical** |
| E3 | Premium expires | מנוי מסתיים | Points Hub פעיל שוב | High |
| E4 | Buy Premium mid-feature | רכישת מנוי | Feature נפסק | **Critical** |

---

## 🧪 SECTION F — Timer Behavior

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| F1 | Timer display | Feature active | mm:ss format | Medium |
| F2 | Timer sync | Server time | תואם לשרת | High |
| F3 | Timer reaches 0 | Feature expires | Section נעלם, cards enabled | High |
| F4 | App backgrounded | Switch apps | Timer continues | High |
| F5 | App killed | Force close | Timer continues (server) | High |

---

## 🧪 SECTION G — Analytics Events

| ID | Event | Trigger | Payload | Test |
|----|-------|---------|---------|------|
| G1 | `points_balance_viewed` | Screen opened | `user_id`, `balance` | ☐ |
| G2 | `points_store_opened` | Screen opened | `user_id`, `source_screen` | ☐ |
| G3 | `points_spent` | Feature activated | `user_id`, `feature`, `points_amount` | ☐ |
| G4 | `feature_started` | Activation success | `user_id`, `feature`, `duration` | ☐ |
| G5 | `feature_ended` | Timer expired | `user_id`, `feature` | ☐ |
| G6 | `points_earned` | Purchase complete | `user_id`, `points_amount`, `source` | ☐ |
| G7 | `points_purchase_success` | Payment complete | `user_id`, `package`, `price` | ☐ |

---

## ✅ Definition of Done (QA)

- [ ] תמיד Feature אחד או אפס
- [ ] אין אי־התאמה בין UI לשרת
- [ ] Subscription גובר על Points
- [ ] אין מצבי ביניים לא ברורים
- [ ] Points מרגישים שימושיים אך מוגבלים
- [ ] אין אנימציות חגיגה
- [ ] אין confirmation dialogs
- [ ] Timer מהשרת בלבד

---

## 🚫 Forbidden Behaviors (Verify NOT present)

| Check | Description | Test |
|-------|-------------|------|
| ☐ | No XP or levels | Verify no gamification |
| ☐ | No progress bars | Verify no visual progress |
| ☐ | No stacking | Only one feature at a time |
| ☐ | No feature statistics | User can't see boost metrics |
| ☐ | No celebration animations | No confetti, no fanfare |
| ☐ | No confirmation dialogs | Immediate activation |

---

**Last Updated:** January 2026  
**Version:** 1.0
