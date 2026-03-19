# Home2 Page - אפיון ותיעוד מלא

## 📍 מידע כללי

| פרט | ערך |
|-----|-----|
| **קובץ** | `frontend/src/components/Home2.js` |
| **Route** | `/home2` |
| **הגנה** | ללא (נגיש בלי התחברות לצורך בדיקות) |
| **כפתור גישה** | אייקון בית 🏠 בבר העליון |

---

## 🏗️ מבנה הדף (Layout)

```
┌─────────────────────────────────────────┐
│  [?] [👤]                    (Top Right) │  ← Help + Avatar buttons
├─────────────────────────────────────────┤
│  Home                                    │  ← Page Title
│  Swipe with purpose ✨                   │  ← Subtitle
├─────────────────────────────────────────┤
│  [🧭 Discover]  [📅 My Events]          │  ← Quick Actions
├─────────────────────────────────────────┤
│  ⭐ 150 Points                          │  ← Points Banner
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │  📍 Want better matches faster? │    │  ← Soft Onboarding Card
│  │  Set my availability | Later    │    │     (dismissible)
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │      [USER CARD - Swipeable]   │    │  ← Main Swipe Card
│  │                                 │    │     (UserCard component)
│  │      Maya, 27                   │    │
│  │      Product Designer           │    │
│  │      0.6 km away               │    │
│  │                                 │    │
│  │      [❌]           [❤️]        │    │  ← Pass / Like buttons
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  Today's Picks                          │  ← Section Title
│  Handpicked for today                   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │  ← Horizontal scroll cards
│  │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │           │     (3-5 picks max)
│  └────┘ └────┘ └────┘ └────┘           │
└─────────────────────────────────────────┘
```

---

## 🔄 User Flow - זרימת משתמש

### 1. כניסה לדף
```
User enters /home2
    │
    ├─► Fetch users from API (/api/nearby-users)
    │       └─► Fallback to demo users if API fails
    │
    ├─► Fetch Today's Picks (/api/todays-picks)
    │       └─► Fallback to demo picks if API fails
    │
    └─► Display first card in deck
```

### 2. Swipe Flow - זרימת החלקה
```
User sees card
    │
    ├─► Swipe RIGHT (Like) ──────────────────────┐
    │       │                                     │
    │       ├─► Add to likedUsers                │
    │       ├─► Add to swipeHistory              │
    │       ├─► POST /api/likes                  │
    │       │                                     │
    │       └─► Check if Match? ─────────────────┤
    │               │                             │
    │               ├─► YES: Show Match Popup    │
    │               │       Add to mutualMatches │
    │               │                             │
    │               └─► NO: Add to likedProfiles │
    │                                             │
    ├─► Swipe LEFT (Pass) ───────────────────────┤
    │       │                                     │
    │       ├─► Add to passedUsers               │
    │       └─► Add to swipeHistory              │
    │                                             │
    └─► Card removed from deck, next card shows  │
```

### 3. Undo Flow - ביטול פעולה
```
User clicks Undo
    │
    ├─► Get last action from swipeHistory
    │
    ├─► Remove user from likedUsers/passedUsers
    │
    └─► User reappears in deck at current position
```

### 4. Tap on Card - לחיצה על כרטיס
```
User taps on card
    │
    ├─► Set anchor (for back navigation)
    │
    └─► Navigate to /user/:id (Full Profile)
        │
        └─► User can Like/Pass from profile
            │
            └─► Back button returns to Home2
                at same position (anchor restore)
```

### 5. Today's Picks Flow
```
User sees Today's Picks section
    │
    ├─► Horizontal scroll (3-5 cards max)
    │
    └─► Tap on pick card
        │
        └─► Navigate to /user/:id (Full Profile)
```

---

## 📦 Components - רכיבים

### Main Components

| רכיב | תיאור | קובץ |
|------|-------|------|
| `Home2` | הקומפוננטה הראשית | `Home2.js` |
| `UserCard` | כרטיס משתמש להחלקה | `UserCard.jsx` |
| `TodaysPicks` | סקציית הבחירות היומיות | Internal in `Home2.js` |
| `QuickAction` | כפתורי פעולה מהירה | Internal in `Home2.js` |
| `FiltersDialog` | דיאלוג פילטרים | Internal in `Home2.js` |
| `PointsBannerCompact` | באנר נקודות | `PointsBanner.js` |
| `UserAvatarButton` | כפתור אווטאר | `UserAvatarButton.jsx` |

### Sub-Components

| רכיב | תיאור |
|------|-------|
| `TagPill` | צ'יפ עם אייקון ותווית |
| `ActivityBadge` | נקודת התראה |

---

## 🗃️ State Management - ניהול מצב

### Zustand Store (`homeDeckStore`)
```javascript
{
  users: [],              // All users in deck
  likedUsers: [],         // IDs of liked users
  passedUsers: [],        // IDs of passed users
  swipeHistory: [],       // History for undo [{userId, action, index}]
  anchorUserId: null,     // For back navigation restoration
  likedProfiles: [],      // Full profiles of users you liked
  mutualMatches: [],      // Full profiles of mutual matches
}
```

### Local State
```javascript
{
  deckIndex: 0,           // Current position in filtered deck
  photoIdx: 0,            // Current photo in card
  filtersOpen: false,     // Filters dialog state
  showTutorial: false,    // Tutorial dialog state
  showOnboardingCard: false, // Soft onboarding visibility
  todaysPicksRaw: [],     // Today's picks from API
  matchUser: null,        // User for match popup
  prefs: {                // User preferences
    maxDistanceKm: 5,
    genders: ["female"],
    ageRange: [18, 60]
  }
}
```

---

## 🎨 Visual Design - עיצוב

### Colors
| שימוש | צבע |
|-------|-----|
| Primary | `#6C5CE7` (Purple) |
| Accent | `#F43F5E` (Pink/Red) |
| Like | `#22C55E` (Green) |
| Pass | `#EF4444` (Red) |
| Background | White with gradient |
| Text Primary | `#0f172a` |
| Text Secondary | `#6B7280` |

### Card Dimensions
```
Width:  min(420px, 92vw)
Height: min(640px, 78vh)
Border Radius: 16px
```

### Animations (Framer Motion)
- **Swipe**: Spring animation with stiffness 220, damping 22
- **Card rotation**: -12° to +12° based on drag
- **Like/Nope labels**: Scale 0.9 to 2.6 based on drag progress
- **Side glows**: Green (right) / Red (left) gradients

---

## 🔌 API Endpoints

| Endpoint | Method | תיאור |
|----------|--------|-------|
| `/api/nearby-users` | GET | Fetch users for deck |
| `/api/todays-picks` | GET | Fetch daily picks |
| `/api/likes` | POST | Record a like |
| `/api/todays-picks/:id/dismiss` | POST | Dismiss a pick |

---

## 📱 User Data Model

```javascript
{
  id: number,
  name: string,
  age: number,
  gender: "Woman" | "Man",
  city: string,
  distance: number,          // in km
  profession: string,
  education: string,
  tagline: string,           // Live status (max 60 chars)
  bio: string,
  interests: string[],
  photos: string[],
  verified: boolean,
  likesYou: boolean,
  isMatch: boolean,
  
  // Prompts - תשובות לשאלות אישיות
  prompts: [{
    prompt: string,          // השאלה/נושא (e.g., "A fun fact about me…")
    answer: string           // התשובה של המשתמש
  }],
  introLine: string,         // התשובה של ה-prompt הראשון (מוצג אחרי תמונה 1)
  
  // Lifestyle
  height: number,
  drinking: string,
  smoking: string,
  exercise: string,
  kids: string,
  
  // More info
  starSign: string,
  politics: string,
  languages: string[],
  causes: string[],
  qualities: string[],       // תכונות שהמשתמש מעריך
  spotifyPlaylists: [{name, artist, image}]
}
```

---

## ⚙️ Filters - פילטרים

| פילטר | ברירת מחדל | טווח |
|-------|------------|------|
| Max Distance | 5 km | 1-50 km |
| Age Range | 18-60 | 18-80 |
| Gender | Women only | Currently locked |

---

## 🔐 URL State

הדף שומר מצב ב-URL לצורך שחזור:
```
/home2?card=0&user=7
```

| Param | תיאור |
|-------|-------|
| `card` | Index of current card in deck |
| `user` | User ID for anchor-based restoration |

---

## 📝 Notes - הערות

1. **Today's Picks** - מוגבל ל-3-5 כרטיסים, לא מתמלא מחדש
2. **Undo** - אפשרי רק לפעולה האחרונה
3. **Match Detection** - בודק גם API וגם `likesYou` מקומי
4. **Soft Onboarding** - מופיע 5 שניות אחרי טעינה (ניתן לסגירה)
5. **Empty State** - מוצג כשאין עוד כרטיסים + כפתור לפילטרים

---

## � Prompts - שאלות ותשובות אישיות

### מיקום ה-Prompts בכרטיס הפרופיל (ProfileTimeline)

| מיקום | Prompt | תצוגה |
|-------|--------|-------|
| אחרי תמונה 1 | **Prompt 1** (Main Intro) | נושא (אפור קטן) + תשובה (איטליק) |
| אחרי תמונה 2 | **Prompt 2** | נושא + תשובה |
| אחרי תמונה 3 | **Prompt 3** | נושא + תשובה |
| אחרי תמונה 4 | **Prompt 4** | נושא + תשובה |
| אחרי תמונה 5 | **Prompt 5** | נושא + תשובה |
| אחרי תמונה 6 | **Prompt 6** | נושא + תשובה |

### נושאי Prompts זמינים

```javascript
const promptsWithSuggestions = {
  "A fun fact about me…": [
    "I can name any song within 3 seconds 🎧",
    "I've visited 20 countries and counting 🌍",
    "I make the best homemade pasta you'll ever taste 🍝",
    "I once ran a marathon on a dare 🏃‍♀️",
  ],
  "Friends describe me as…": [
    "The one who always has a plan (and a backup plan) 📋",
    "The friend who remembers every birthday 🎂",
    "Spontaneous but somehow always on time ⏰",
    "A good listener with terrible dance moves 💃",
  ],
  "Currently obsessed with…": [
    "Training for the TLV marathon 🏃‍♀️",
    "Finding the city's best coffee spots ☕",
    "Learning to play guitar (my neighbors love me) 🎸",
    "Perfecting my sourdough recipe 🍞",
  ],
  // ... more topics
};
```

### עיצוב Prompt בכרטיס

```jsx
<Box sx={{ py: 3, px: 3, textAlign: 'center' }}>
  {/* נושא */}
  <Typography sx={{ fontSize: 13, color: '#9ca3af', fontWeight: 500, mb: 0.5 }}>
    {prompt.prompt}
  </Typography>
  {/* תשובה */}
  <Typography sx={{ fontSize: 18, color: '#374151', fontWeight: 400, fontStyle: 'italic' }}>
    "{prompt.answer}"
  </Typography>
</Box>
```

### ניהול Prompts בהגדרות פרופיל

| פעולה | תיאור |
|-------|-------|
| **הוספה** | לחיצה על "Add prompt" → בחירת נושא → כתיבת תשובה או בחירת הצעה → "Save to Profile" |
| **מחיקה** | לחיצה על X ליד ה-prompt |
| **סידור מחדש** | חצים למעלה/למטה להחלפת מיקום |
| **מגבלה** | מקסימום prompts = מספר התמונות שהועלו |

### שמירה ב-localStorage

```javascript
// נשמר ב-pulse_user
{
  prompts: [
    { prompt: "A fun fact about me…", answer: "I once ran a marathon on a dare 🏃‍♀️" },
    { prompt: "Friends describe me as…", answer: "The one who always has a plan 📋" },
    // ...
  ],
  introLine: "I once ran a marathon on a dare 🏃‍♀️" // תשובת ה-prompt הראשון
}
```

---

## �🚀 Future Improvements - שיפורים עתידיים

- [ ] Super Like functionality
- [ ] Boost feature
- [ ] Advanced filters (interests, lifestyle)
- [ ] Video profiles
- [ ] Voice notes
- [ ] Real-time "typing" indicator for nearby users
