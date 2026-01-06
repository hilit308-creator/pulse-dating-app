# ✅ Pulse Settings – QA Checklist

> **Complete test coverage for Settings & Account features**

---

## 🧪 SECTION A — Account Overview Screen

| ID | Scenario | Steps | Expected Result | Severity |
|----|----------|-------|-----------------|----------|
| A1 | פתיחת Account Screen | להיכנס ל-Settings → Account | המסך נטען ללא עיכוב, נתונים עדכניים מהשרת | High |
| A2 | משתמש ללא אימייל | משתמש חדש, ללא אימייל | מוצג: "No email address added" | Medium |
| A3 | משתמש עם אימייל Pending | אימייל הוזן אך לא אומת | מוצג: "Not verified" | High |
| A4 | משתמש עם אימייל Verified | אימייל אומת | מוצג: "Verified" | High |
| A5 | נתוני UI מול Backend | שינוי אימייל ממכשיר אחר | ה-UI מתעדכן ברענון הבא | High |

---

## 📧 SECTION B — Email Add / Update Flow

| ID | Scenario | Steps | Expected Result | Severity |
|----|----------|-------|-----------------|----------|
| B1 | הוספת אימייל חדש | להזין אימייל תקין → Send code | קוד נשלח, סטטוס Pending | High |
| B2 | אימייל לא תקין | להזין אימייל שגוי | שגיאה: "Please enter a valid email address" | Medium |
| B3 | שליחת קוד כפולה מהר | Send code פעמיים מהר | חסימה + cooldown | Medium |
| B4 | אימות קוד נכון | להזין קוד נכון | סטטוס הופך ל-Verified | High |
| B5 | קוד שגוי | להזין קוד שגוי | שגיאה ברורה | High |
| B6 | קוד שפג תוקף | להמתין לפקיעה | שגיאה: Code expired | Medium |
| B7 | החלפת אימייל מאומת | אימייל חדש למשתמש Verified | הישן נשאר פעיל עד אימות החדש | **Critical** |
| B8 | יציאה באמצע תהליך | לצאת לפני Verify | הסטטוס נשאר Pending | Medium |

### API Error Codes Reference
| Code | HTTP | Message |
|------|------|---------|
| INVALID_EMAIL | 400 | "Please enter a valid email address." |
| VERIFICATION_THROTTLED | 429 | "Please wait before requesting a new code." |
| INCORRECT_CODE | 409 | "The verification code is incorrect" |
| CODE_EXPIRED | 410 | "This code has expired. Please request a new one." |
| EMAIL_MISMATCH | 409 | "This code does not match the pending email." |

---

## 🔗 SECTION C — Connected Accounts Overview

| ID | Scenario | Steps | Expected Result | Severity |
|----|----------|-------|-----------------|----------|
| C1 | Google מחובר | חשבון עם Google | מוצג: Connected | High |
| C2 | Apple לא מחובר | חשבון ללא Apple | מוצג: Not connected | Medium |
| C3 | טעינת סטטוס | רענון מסך | סטטוס תמיד תואם שרת | High |

---

## 🔐 SECTION D — Connect Provider

| ID | Scenario | Steps | Expected Result | Severity |
|----|----------|-------|-----------------|----------|
| D1 | חיבור Google | Connect → OAuth | סטטוס Connected + Toast | High |
| D2 | חיבור Apple | Connect → OAuth | סטטוס Connected + Toast | High |
| D3 | חיבור כפול | Connect כשכבר מחובר | שגיאה: Already connected | Medium |
| D4 | ביטול OAuth | לבטל באמצע | אין שינוי סטטוס | Medium |
| D5 | OAuth כושל | Token שגוי | הודעת שגיאה | High |

---

## ❌ SECTION E — Disconnect Provider

| ID | Scenario | Steps | Expected Result | Severity |
|----|----------|-------|-----------------|----------|
| E1 | ניתוק ספק משני | Disconnect כשיש עוד אמצעי | ניתוק מצליח | High |
| E2 | ניתוק ספק יחיד | Disconnect ספק אחרון | חסימה + הודעה ברורה | **Critical** |
| E3 | אישור ניתוק | Confirm dialog | מתבצע רק לאחר אישור | High |
| E4 | ביטול ניתוק | Cancel | אין שינוי | Medium |
| E5 | ניתוק ואז רענון | Disconnect → Reload | סטטוס נשמר | High |

---

## 🔒 SECTION F — Safety Rules (קריטי)

| ID | Scenario | Steps | Expected Result | Severity |
|----|----------|-------|-----------------|----------|
| F1 | רק OAuth אחד | אין אימייל, רק Google | ניתוק חסום | **Critical** |
| F2 | אימייל Verified + OAuth | ניתוק OAuth | מותר | High |
| F3 | אימייל Pending בלבד | אין OAuth | לא נחשב אמצעי התחברות | **Critical** |
| F4 | כל האמצעים נמחקים | ניסיון עקיפה | חסימה מוחלטת | **Critical** |

### Safety Matrix
| Email Status | Google | Apple | Can Disconnect Google | Can Disconnect Apple |
|--------------|--------|-------|----------------------|---------------------|
| None | ✅ | ❌ | ❌ BLOCKED | N/A |
| None | ❌ | ✅ | N/A | ❌ BLOCKED |
| None | ✅ | ✅ | ✅ | ✅ |
| Pending | ✅ | ❌ | ❌ BLOCKED | N/A |
| Verified | ✅ | ❌ | ✅ | N/A |
| Verified | ❌ | ❌ | N/A | N/A |

---

## 🔄 SECTION G — Sync & Consistency

| ID | Scenario | Steps | Expected Result | Severity |
|----|----------|-------|-----------------|----------|
| G1 | שינוי במכשיר אחר | שינוי אימייל בדסקטופ | עדכון במובייל | High |
| G2 | Offline → Online | שינוי Offline | Sync לאחר חיבור | Medium |
| G3 | Cache UI | לחזור למסך | אין נתונים ישנים | High |

---

## 🌍 SECTION H — Accessibility & i18n

| ID | Scenario | Steps | Expected Result | Severity |
|----|----------|-------|-----------------|----------|
| H1 | RTL | שינוי שפה לעברית | יישור מלא, ללא שבירה | High |
| H2 | Screen reader | קריאת סטטוסים | כל טקסט נקרא | Medium |
| H3 | Text scale | הגדלת טקסט | אין חיתוכים | Medium |

---

## 🧠 SECTION I — Analytics Events

| ID | Event | Trigger | Expected Payload | Severity |
|----|-------|---------|------------------|----------|
| I1 | `account_email_added` | Send code | `user_id`, `method` | Medium |
| I2 | `account_email_verified` | Verify | `user_id` | Medium |
| I3 | `account_provider_connected` | OAuth success | `provider` | Medium |
| I4 | `account_disconnect_blocked` | Attempt | `reason` | Medium |

---

## ✅ Definition of Done (QA)

- [ ] אין מצב בו המשתמש ננעל מחוץ לחשבון
- [ ] ה-UI תמיד תואם ל-backend
- [ ] כל Edge Case מתועד ונבדק
- [ ] אין Silent failures
- [ ] אין מצבי "לא ברור מה קורה"

---

## 👁️ Visibility Mode

### Mode Switching
- [ ] Always Visible → Shows everywhere
- [ ] Selected Times → Respects time settings
- [ ] Selected Places → Respects area settings
- [ ] Paused → Hidden everywhere (highest priority)

### State Indicators
| State | Expected UI |
|-------|-------------|
| Always Visible | "Visible" badge |
| In active hours | "Visible" badge |
| Outside active hours | "Hidden" badge |
| In hidden area | "Hidden" badge |
| Paused | "Paused" indicator |

---

## 📍 Location Visibility

### Map Interaction
- [ ] Tap map → Create circular area
- [ ] Drag area → Reposition
- [ ] Pinch area → Resize (100m - 5000m)
- [ ] Tap X on area → Delete confirmation
- [ ] Maximum 5 areas → Show limit warning

### Edge Cases
| Test Case | Expected Result |
|-----------|-----------------|
| Create area with no GPS | Use last known location |
| Area smaller than 100m | Snap to 100m minimum |
| Area larger than 5km | Snap to 5km maximum |
| Overlapping areas | Both apply (hidden in either) |
| Delete all areas | "No hidden areas" state |

---

## ⏰ Time Visibility

### Day Selection
- [ ] Tap day → Toggle on/off
- [ ] All days selected → "Every day" label
- [ ] No days selected → Warning: "Select at least one day"
- [ ] Weekend only → "Weekends" label

### Time Picker
- [ ] Drag start time → Updates immediately
- [ ] Drag end time → Updates immediately
- [ ] End before start → Interpreted as overnight (e.g., 22:00 - 02:00)
- [ ] Same start/end → 24-hour visibility

### Edge Cases
| Test Case | Expected Result |
|-----------|-----------------|
| Enable with no days | Prompt to select days |
| Enable with 0-minute window | Show minimum 30 min warning |
| Timezone change | Recalculate based on new timezone |

---

## 👥 Contacts Visibility

### Toggle Behavior
- [ ] Enable → Sync contacts → Hide from matches
- [ ] Disable → Contacts can see profile
- [ ] Shows contact count after sync

### Edge Cases
| Test Case | Expected Result |
|-----------|-----------------|
| No contacts permission | Prompt for permission |
| Permission denied | Show explanation, option to go to settings |
| 0 contacts | Show "No contacts synced" |
| Large contact list (1000+) | Show loading, complete sync |

---

## 🔔 Notifications

### Toggle States
- [ ] Match notifications on/off
- [ ] Message notifications on/off
- [ ] Quiet hours on/off
- [ ] Smart notifications on/off

### Quiet Hours
| Test Case | Expected Result |
|-----------|-----------------|
| Enable → Set 23:00-07:00 | No notifications in window |
| Overnight window | Works correctly (22:00-06:00) |
| Same start/end | Disabled (invalid) |

---

## 🎯 Matching Preferences

### Age Range
- [ ] Slide min → Updates
- [ ] Slide max → Updates
- [ ] Min cannot exceed max
- [ ] Range: 18-80

### Distance
- [ ] Slide → Updates (1-50 km)
- [ ] Shows km/miles based on units setting

---

## 🌍 Language

### RTL Switching
- [ ] Switch to Hebrew → Full RTL layout
- [ ] Switch back to English → Full LTR layout
- [ ] All text translated
- [ ] Icons don't flip (correct behavior)
- [ ] Chevrons flip direction

### Edge Cases
| Test Case | Expected Result |
|-----------|-----------------|
| Missing translation key | Show English fallback |
| Long translation (German) | Text doesn't overflow |

---

## ♿ Accessibility

### Screen Reader
- [ ] All buttons have labels
- [ ] All images have alt text
- [ ] Focus order is logical
- [ ] Announcements on state change

### Reduce Motion
- [ ] Enable → No animations
- [ ] Cards don't swipe animate
- [ ] Transitions are instant

---

## 📥 Data Download

### Request Flow
- [ ] Tap "Request My Data"
- [ ] Confirmation dialog
- [ ] Success: "Check email in 24-48 hours"
- [ ] Prevent duplicate requests

---

## 🚨 Error Handling

### Network Errors
| Scenario | Expected |
|----------|----------|
| No internet on save | Toast: "No connection. Changes saved locally." |
| API timeout | Toast: "Taking longer than expected. Retrying..." |
| Server error (500) | Toast: "Something went wrong. Try again." |

### Recovery
- [ ] Retry button appears on persistent error
- [ ] Local changes sync when connection restored

---

## 📱 Device Testing

### Screen Sizes
- [ ] iPhone SE (small)
- [ ] iPhone 14 Pro (standard)
- [ ] iPhone 14 Pro Max (large)
- [ ] iPad (tablet)

### OS Versions
- [ ] iOS 15+
- [ ] Android 10+

---

## 🔄 State Persistence

### App Restart
- [ ] All settings persist after kill/restart
- [ ] Visibility mode persists
- [ ] Hidden areas persist
- [ ] Language persists

### Logout/Login
- [ ] Settings restored on re-login
- [ ] No stale local data

---

**Last Updated:** January 2026  
**Version:** 1.0
