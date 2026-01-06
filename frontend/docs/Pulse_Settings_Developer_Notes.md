# 📄 Pulse Settings – Developer Notes

> **Locked Rules & Clarifications (קריטי)**
> 
> הקובץ הזה נועד למנוע "חשבנו שיותר טוב ככה".

---

## 🔒 Locked Product Rules (אסור לשנות)

### 1. Immediate Apply

כל שינוי בהגדרות:
- נשמר מיידית
- ❌ אין כפתור Save
- ❌ אין מסך אישור

---

### 2. No Accidental Invisibility

המשתמש לעולם לא ייעלם בטעות.

אם שילוב הגדרות גורם ל־0 נראות:
- יש להציג אזהרה
- או לחסום את הפעולה

**סדר עדיפות מוחלט:**
```
Pause > Time > Location
```

---

### 3. At Least One Sign-In Method (חוק חסום)

חייב להיות:
- Email מאומת **או**
- Google **או**
- Apple

**חסימות:**
- ❌ אסור לאפשר ניתוק אמצעי התחברות אחרון
- הודעת חסימה חובה (לא Toast שקט)

---

### 4. Email = Identity, Not Decoration

**אימייל לא מאומת:**
- לא משמש לפעולות קריטיות
- לא מחליף OAuth

**שינוי אימייל:**
- תמיד דורש אימות מחדש
- האימייל הישן נשאר פעיל עד סיום אימות

---

### 5. Visibility ≠ Profile Data

**Visibility controls:**
- משפיעים רק על הופעה לאחרים
- ❌ לא משנים matching logic
- ❌ לא משפיעים על recommendation engine

---

### 6. No Smart Guessing

אם נתון חסר:
- ❌ לא מנחשים
- ❌ לא משלימים אוטומטית
- מציגים State ברור למשתמש

---

## 🚫 מה נחשב BUG (לא UX Choice)

| Issue | Why It's a Bug |
|-------|----------------|
| הגדרה שלא נשמרת מיידית | Breaks Immediate Apply rule |
| מצב שבו המשתמש לא יודע אם הוא נראה | Violates visibility transparency |
| חוסר התאמה בין UI ל־backend state | Data inconsistency |
| אפשרות לניתוק כל אמצעי התחברות | Security violation |
| תרגום חסר / ערבוב שפות | i18n failure |

---

## 🧭 Consistency Rules

אותו Pattern בכל ההגדרות:

| Interaction | Behavior |
|-------------|----------|
| Tap | → Expand |
| Toggle | → Immediate effect |

- אין Variant עיצובי בין מסכים
- אותם צבעים, רדיוסים, spacing

---

**Last Updated:** January 2026  
**Version:** 1.0
