# 🔒 Pulse Points System — MVP Freeze Document (V1)

> **מסמך זה מגדיר את גרסת V1 הסופית של מערכת הנקודות (Points).**
> 
> **כל שינוי מעבר למסמך זה דורש אישור מוצר מפורש (Hilit).**

---

## 1️⃣ Scope (מה כלול ב־V1)

מערכת Points כוללת:

- ✅ Points Hub / Store
- ✅ הפעלת Features זמניים באמצעות נקודות
- ✅ רכישת נקודות (One-time purchase בלבד)
- ✅ ביטול אוטומטי של Points בעת Premium
- ✅ UI אחיד וסטטי (ללא A/B)

---

## 2️⃣ Locked Features (אסור לשנות)

| Feature | Duration | Cost |
|---------|----------|------|
| **Undo** | 30 דקות | 40 נק׳ |
| **Likes You** | 10 דקות | 80 נק׳ |
| **Nearby Priority** | 10 דקות | 70 נק׳ |
| **BeatPulse** | 15 דקות | 70 נק׳ |

**❌ אין שינוי משך**
**❌ אין שינוי מחיר**
**❌ אין הוספה/הסרה של Feature ב־V1**

---

## 3️⃣ Global Rules (Locked)

### Feature Rules
- Feature אחד בלבד פעיל בכל רגע
- הפעלת Feature חדש מפסיקה מיידית Feature קיים

### Points Rules
- ❌ לא נערמות בין Features
- ❌ לא מוחזרות
- ❌ לא פגות תוקף

### Premium Override
- Premium פעיל מבטל Points לחלוטין
- מפסיק Feature נקודות פעיל

### Timer Rules
- **Server-only** timers
- Client = Renderer בלבד
- ❌ ללא לוגיקה עסקית ב-Client

---

## 4️⃣ Purchase Rules (Locked)

### Allowed
- ✅ One-time purchase בלבד
- ✅ דרך App Store / Google Play

### Not Allowed
- ❌ Subscription לנקודות
- ❌ Bundles
- ❌ Discounts
- ❌ "Best value" badges
- ❌ Success / Celebration screens

### Packages (Locked)

| Package | Points | Price |
|---------|--------|-------|
| Small | 100 | ₪9.90 |
| Medium | 250 | ₪19.90 |
| Large | 600 | ₪39.90 |

---

## 5️⃣ UI Freeze (Locked)

### Structure (Fixed Order)
1. Header (Balance)
2. Active Feature (Conditional)
3. Spend Points (Feature Cards)
4. Buy Points
5. Premium Compare (Text-only)

### UI Restrictions
- ❌ אין אנימציות חגיגיות
- ❌ אין Gamification (XP / levels / progress)
- ❌ אין שינוי סדר כרטיסים
- ❌ אין copy שיווקי חדש

---

## 6️⃣ Analytics (Locked – Internal Only)

### נמדד פנימית בלבד:
- `feature_started`
- `feature_ended`
- `points_spent`
- `points_purchase_success`

### Not Allowed
- ❌ אין הצגת נתונים למשתמש
- ❌ אין "ראית X אנשים"

---

## 7️⃣ Security & Abuse (Locked)

- ✅ Validation של purchases בשרת בלבד
- ✅ Rate limits להפעלות
- ✅ Daily caps להפעלות Feature (server-config)
- ✅ Anti-replay על receipts

---

## 8️⃣ What Is Explicitly Out of Scope (V1)

| Item | Status |
|------|--------|
| Stacking של Features | ❌ Out |
| Feature bundles | ❌ Out |
| Referral → Points | ❌ Out |
| Earning points דרך פעולות | ❌ Out |
| Seasonal pricing | ❌ Out |
| Discounts / coupons | ❌ Out |
| A/B על prices או durations | ❌ Out |

---

## 9️⃣ Change Control

כל שינוי ל־V1 חייב:
1. מסמך אפיון חדש (V2)
2. סימון מפורש מה השתנה
3. **לא מתבצע "על הדרך"**

---

## 🔟 Sign-off

| Role | Name | Status |
|------|------|--------|
| **Product Owner** | Hilit Kandli | ✅ Approved |

### Status: ✅ Frozen — Ready for Implementation

---

## 🟢 מצב נוכחי — איפה אנחנו עומדים

| Item | Status |
|------|--------|
| אפיון מוצר | ✔ |
| לוגיקה שרתית | ✔ |
| API Contracts | ✔ |
| QA Checklists | ✔ |
| Jira Tickets | ✔ |
| UI Spec | ✔ |
| Edge Case Matrix | ✔ |
| Freeze V1 | ✔ |

---

## 📚 Related Documents

| Document | Description |
|----------|-------------|
| [Pulse_PointsHub_Spec.md](./Pulse_PointsHub_Spec.md) | Full specification |
| [Pulse_Points_API_Contract.yaml](./Pulse_Points_API_Contract.yaml) | API specification |
| [Pulse_Points_QA_Checklist.md](./Pulse_Points_QA_Checklist.md) | QA test cases |
| [Pulse_Points_Jira_Tickets.md](./Pulse_Points_Jira_Tickets.md) | Work breakdown |
| [Pulse_PointsHub_UI_Spec.md](./Pulse_PointsHub_UI_Spec.md) | UI specification |
| [Pulse_PointsHub_EdgeCase_Matrix.md](./Pulse_PointsHub_EdgeCase_Matrix.md) | Edge cases |

---

**Frozen Date:** January 2026  
**Version:** 1.0  
**Next Review:** V2 Planning
