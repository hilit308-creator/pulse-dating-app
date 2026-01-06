# 🏪 Pulse Points Store / Points Hub — UI Specification

> **Pixel-level, Developer-Ready (V1, Locked)**

זה המסך שבו המשתמש מבין מהר:
- כמה נקודות יש לו
- האם Feature פעיל
- מה אפשר להפעיל עכשיו
- ואיך Premium "פותר הכול" בלי לדחוף בכוח

---

## 1️⃣ מבנה כללי (Vertical Stack)

המסך בנוי תמיד באותו סדר, מלמעלה למטה, **ללא חריגים**:

1. **Header – Balance**
2. **Active Feature** (Conditional)
3. **Spend Points – Feature Cards**
4. **Buy Points – Packages**
5. **Subscription Compare** (Text-only)

**❌ אין reorder**
**❌ אין hide של Sections** (חוץ מ־Active Feature)

---

## 2️⃣ Header — Points Balance

### Layout
- Center aligned
- Padding גדול (Top hero)

### Components

| Element | Style |
|---------|-------|
| Title | Small: "Your Points" |
| Balance | Large, Bold: "150" |
| Suffix | Small, muted: "points" |

### Behavior
- נטען מהשרת בלבד
- מתעדכן:
  - אחרי רכישה
  - אחרי הפעלת Feature
- ❌ אין אנימציית "קפיצה"
- ❌ אין צבע ירוק/זהב

---

## 3️⃣ Active Feature (Conditional Section)

### מוצג רק אם:
```
activeFeature != null
```

### Layout
- Card מלא לרוחב
- רקע עדין (לא צבע חזק)
- Icon קטן (Feature-specific)

### Content

| Element | Example |
|---------|---------|
| Feature name | Bold |
| Label | "Active now" |
| Countdown timer | "09:42" |

### Behavior
- Timer נספר לפי `expiresAt` מהשרת
- ב־`00:00`:
  - ה־card נעלם
  - המסך מתרענן (state update)

**❌ אין כפתור "Stop"**
**❌ אין CTA כאן**

---

## 4️⃣ Spend Points — Feature Cards

### Grid
- Card list (vertical)
- כל Feature = Card קבוע

### Card Structure (Locked)

```
┌─────────────────────────────┐
│ [Icon]                      │
│ Feature name                │
│ Duration (small text)       │
│ Cost (e.g. 70 points)       │
│ [CTA button]                │
└─────────────────────────────┘
```

### CTA States

| State | Button Text | Notes |
|-------|-------------|-------|
| Enabled | "Activate" | Normal |
| Feature active | "Unavailable while feature is active" | Disabled |
| Not enough points | "Not enough points" | Disabled, text below |

### Feature Cards (Exact Order - LOCKED)

| # | Feature | Duration | Cost |
|---|---------|----------|------|
| 1 | Undo | 30 min | 40 points |
| 2 | Likes You | 10 min | 80 points |
| 3 | Nearby Priority | 10 min | 70 points |
| 4 | BeatPulse | 15 min | 70 points |

**❗ הסדר קבוע**
**❗ אין A/B order**

---

## 5️⃣ Activate Flow (UI)

### On Tap "Activate"
1. Button נכנס ל־loading
2. ❌ אין modal
3. ❌ אין confirmation
4. שרת מאשר ← state מתעדכן
5. Active Feature section מופיע/מתעדכן
6. כל שאר ה־cards הופכים disabled

### On Error
Toast קצר בלבד:
- "Not enough points"
- "Points are disabled while Premium is active"

---

## 6️⃣ Buy Points — Packages Section

### Layout
- Title: "Buy Points"
- Cards / rows (3 בלבד)

### Packages (LOCKED)

| Package | Points | Price |
|---------|--------|-------|
| Small | 100 | ₪9.90 |
| Medium | 250 | ₪19.90 |
| Large | 600 | ₪39.90 |

### Card Content
- Points amount (Bold)
- Price
- CTA: "Buy"

### Behavior
- Native store checkout
- ❌ אין Success screen
- ❌ אין animation
- חזרה אוטומטית למסך
- Balance מתעדכן

---

## 7️⃣ Subscription Compare (Text-only)

### Layout
- Separator דק
- טקסט מרכזי, קטן

### Copy (LOCKED)
```
Premium unlocks everything — anytime
```

- לא clickable (או כן, לפי החלטה שלך, אבל בלי כפתור)
- ❌ לא highlight
- ❌ לא badge

---

## 8️⃣ Error & Empty States

### No Internet
- Spinner
- Retry בלבד
- ❌ לא מציגים balance ישן

### Server Delay
- Loading skeleton
- ❌ אין fallback values

---

## 9️⃣ Accessibility

| Requirement | Value |
|-------------|-------|
| Button size | ≥ 44px |
| Contrast | AA |
| Timer | נקרא ע״י screen reader |
| RTL | מלא (עברית) |

---

## 🔒 What Developers Must NOT Do ❌

| Forbidden | Reason |
|-----------|--------|
| ❌ Animation חגיגי | No gamification |
| ❌ שינוי copy | Locked text |
| ❌ Badges "Best value" | No upsell tactics |
| ❌ הצגת "חסכת X" | No savings display |
| ❌ Progress / XP | No gamification |
| ❌ שינוי סדר | Fixed order |

---

## ✅ Definition of Done (UI)

- [ ] המסך נראה זהה בכל הפלטפורמות
- [ ] כל מצב (active / disabled / error) ברור
- [ ] אין decision points למפתח
- [ ] Points מרגישים מוגבלים בכוונה
- [ ] Premium מרגיש "ברור מאליו", לא דוחף

---

## 📐 Visual Reference

```
┌─────────────────────────────────────┐
│           Points Hub                │
├─────────────────────────────────────┤
│                                     │
│            Your Points              │
│              [150]                  │
│              points                 │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 🎯 Undo                     │   │
│  │ Active now · 09:42          │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│         Spend Points                │
│  ┌─────────────────────────────┐   │
│  │ ↩️ Undo                     │   │
│  │ 30 min · 40 points          │   │
│  │ [Unavailable]               │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ❤️ Likes You                │   │
│  │ 10 min · 80 points          │   │
│  │ [Activate]                  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 📍 Nearby Priority          │   │
│  │ 10 min · 70 points          │   │
│  │ [Activate]                  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ⚡ BeatPulse                │   │
│  │ 15 min · 70 points          │   │
│  │ [Activate]                  │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│          Buy Points                 │
│  ┌─────────┬─────────┬─────────┐   │
│  │  100    │  250    │  600    │   │
│  │ ₪9.90   │ ₪19.90  │ ₪39.90  │   │
│  │ [Buy]   │ [Buy]   │ [Buy]   │   │
│  └─────────┴─────────┴─────────┘   │
├─────────────────────────────────────┤
│  Premium unlocks everything —       │
│  anytime                            │
└─────────────────────────────────────┘
```

---

**Last Updated:** January 2026  
**Version:** 1.0
