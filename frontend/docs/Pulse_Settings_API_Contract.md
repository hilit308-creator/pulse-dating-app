# 🔌 Pulse Settings – API Contract

> **All API endpoints for Settings & Account features**

---

## 📧 Account – Email

### Send Verification Code
```http
POST /api/v1/account/email
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Verification code sent",
  "expiresIn": 600
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Invalid email format |
| 409 | Email already in use |
| 429 | Too many requests. Try again in {seconds} seconds |

---

### Verify Email Code
```http
POST /api/v1/account/email/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "verified": true,
  "email": "user@example.com"
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Invalid verification code |
| 410 | Code expired. Please request a new one |
| 429 | Too many attempts. Try again in {seconds} seconds |

---

### Get Email Status
```http
GET /api/v1/account/email
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "email": "user@example.com",
  "status": "verified",
  "verifiedAt": "2026-01-06T19:00:00Z"
}
```

**Status Values:** `null` | `pending` | `verified`

---

## 🔗 Account – Connected Accounts

### Get Connected Accounts
```http
GET /api/v1/auth/providers
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "providers": [
    {
      "id": "google",
      "connected": true,
      "email": "user@gmail.com",
      "connectedAt": "2026-01-01T12:00:00Z"
    },
    {
      "id": "apple",
      "connected": false,
      "email": null,
      "connectedAt": null
    }
  ],
  "canDisconnect": {
    "google": false,
    "apple": true
  }
}
```

---

### Connect Provider
```http
POST /api/v1/auth/connect/{provider}
Authorization: Bearer {token}
Content-Type: application/json

{
  "idToken": "{oauth_id_token}",
  "accessToken": "{oauth_access_token}"
}
```

**Providers:** `google` | `apple`

**Response (200):**
```json
{
  "success": true,
  "provider": "google",
  "email": "user@gmail.com"
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Invalid token |
| 409 | Provider already connected to another account |

---

### Disconnect Provider
```http
DELETE /api/v1/auth/disconnect/{provider}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "provider": "google"
}
```

**Errors:**
| Code | Message |
|------|---------|
| 403 | Cannot disconnect last sign-in method |
| 404 | Provider not connected |

---

## 👁️ Visibility

### Get Visibility Status
```http
GET /api/v1/settings/visibility
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "mode": "always",
  "isPaused": false,
  "isVisibleNow": true,
  "nextVisibleAt": null,
  "hiddenAreasCount": 2,
  "activeHours": {
    "enabled": true,
    "days": ["mon", "tue", "wed", "thu", "fri"],
    "startTime": "18:00",
    "endTime": "23:00"
  }
}
```

**Mode Values:** `always` | `selected_times` | `selected_places` | `paused`

---

### Update Visibility Mode
```http
PATCH /api/v1/settings/visibility/mode
Authorization: Bearer {token}
Content-Type: application/json

{
  "mode": "selected_times"
}
```

**Response (200):**
```json
{
  "success": true,
  "mode": "selected_times",
  "isVisibleNow": true
}
```

---

## 📍 Location Visibility

### Get Hidden Areas
```http
GET /api/v1/settings/visibility/areas
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "areas": [
    {
      "id": "area_1",
      "name": "Work",
      "latitude": 32.0853,
      "longitude": 34.7818,
      "radiusMeters": 500,
      "createdAt": "2026-01-01T12:00:00Z"
    }
  ],
  "maxAreas": 5
}
```

---

### Add Hidden Area
```http
POST /api/v1/settings/visibility/areas
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Work",
  "latitude": 32.0853,
  "longitude": 34.7818,
  "radiusMeters": 500
}
```

**Response (201):**
```json
{
  "success": true,
  "area": {
    "id": "area_2",
    "name": "Work",
    "latitude": 32.0853,
    "longitude": 34.7818,
    "radiusMeters": 500
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Invalid coordinates |
| 400 | Radius must be between 100 and 5000 meters |
| 409 | Maximum areas limit reached |

---

### Delete Hidden Area
```http
DELETE /api/v1/settings/visibility/areas/{areaId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true
}
```

---

## ⏰ Time Visibility

### Get Time Settings
```http
GET /api/v1/settings/visibility/time
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "enabled": true,
  "days": ["mon", "tue", "wed", "thu", "fri"],
  "startTime": "18:00",
  "endTime": "23:00",
  "timezone": "Asia/Jerusalem"
}
```

---

### Update Time Settings
```http
PATCH /api/v1/settings/visibility/time
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled": true,
  "days": ["fri", "sat"],
  "startTime": "20:00",
  "endTime": "02:00"
}
```

**Response (200):**
```json
{
  "success": true,
  "isVisibleNow": false,
  "nextVisibleAt": "2026-01-10T20:00:00+02:00"
}
```

---

## 👥 Contacts Visibility

### Get Contacts Settings
```http
GET /api/v1/settings/visibility/contacts
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "hideFromContacts": true,
  "contactsCount": 342,
  "syncedAt": "2026-01-05T10:00:00Z"
}
```

---

### Update Contacts Settings
```http
PATCH /api/v1/settings/visibility/contacts
Authorization: Bearer {token}
Content-Type: application/json

{
  "hideFromContacts": true
}
```

---

## 🔔 Notifications

### Get Notification Settings
```http
GET /api/v1/settings/notifications
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "matches": {
    "enabled": true,
    "mode": "always"
  },
  "messages": {
    "enabled": true,
    "mode": "always"
  },
  "quietHours": {
    "enabled": true,
    "startTime": "23:00",
    "endTime": "07:00"
  },
  "smartNotifications": true
}
```

---

### Update Notification Settings
```http
PATCH /api/v1/settings/notifications
Authorization: Bearer {token}
Content-Type: application/json

{
  "matches": {
    "enabled": true,
    "mode": "important_only"
  },
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "08:00"
  }
}
```

---

## 🎯 Matching Preferences

### Get Matching Preferences
```http
GET /api/v1/settings/matching
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "ageRange": {
    "min": 22,
    "max": 35
  },
  "maxDistanceKm": 25,
  "genders": ["female"]
}
```

---

### Update Matching Preferences
```http
PATCH /api/v1/settings/matching
Authorization: Bearer {token}
Content-Type: application/json

{
  "ageRange": {
    "min": 24,
    "max": 32
  },
  "maxDistanceKm": 15
}
```

---

## 🌍 App Preferences

### Update Language
```http
PATCH /api/v1/settings/preferences/language
Authorization: Bearer {token}
Content-Type: application/json

{
  "language": "עברית"
}
```

**Supported:** `English` | `עברית` | `Español`

---

### Update Units
```http
PATCH /api/v1/settings/preferences/units
Authorization: Bearer {token}
Content-Type: application/json

{
  "units": "metric"
}
```

**Values:** `metric` | `imperial`

---

## 📥 Data Download

### Request Data Export
```http
POST /api/v1/account/data-export
Authorization: Bearer {token}
```

**Response (202):**
```json
{
  "success": true,
  "requestId": "export_123",
  "estimatedReadyAt": "2026-01-08T19:00:00Z",
  "notifyEmail": "user@example.com"
}
```

---

## 🚨 Error Response Format

All errors follow this format:
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Human readable message",
    "field": "email",
    "retryAfter": 60
  }
}
```

---

**Last Updated:** January 2026  
**Version:** 1.0
