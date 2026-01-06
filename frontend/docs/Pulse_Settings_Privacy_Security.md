# 🔒 Pulse Settings – Privacy & Security Notes

> **Security requirements and privacy guarantees for Settings features**

---

## 🔐 Data Classification

### 🔴 Highly Sensitive (Encrypted at rest + transit)
| Data | Storage | Notes |
|------|---------|-------|
| Email address | Server (encrypted) | AES-256 |
| Phone number | Server (encrypted) | AES-256 |
| OAuth tokens | Server (encrypted) | Short-lived, rotated |
| Exact location | Never stored | Only used for real-time matching |
| Contact list hashes | Server (hashed) | SHA-256, one-way |

### 🟡 Sensitive (Encrypted in transit)
| Data | Storage | Notes |
|------|---------|-------|
| Hidden areas (lat/lng) | Server | User-defined privacy zones |
| Time visibility settings | Server | Preferences only |
| Blocked user IDs | Server | Relational data |
| Match preferences | Server | Age, distance, gender |

### 🟢 Non-Sensitive
| Data | Storage | Notes |
|------|---------|-------|
| Language preference | Server + Local | UI setting |
| Units preference | Server + Local | km/miles |
| Notification settings | Server | On/off states |
| Accessibility flags | Local only | Device-specific |

---

## 🚫 What NEVER Leaves Device

| Data | Reason |
|------|--------|
| Raw contact list | Privacy - only hashes sent |
| Biometric data | Never collected |
| Device passwords | Never accessed |
| Other app data | Sandboxed |
| Browsing history | Not relevant |
| SMS/Call logs | Never accessed |

---

## 🔑 Authentication Security

### OAuth Tokens
- Access tokens: 1 hour expiry
- Refresh tokens: 30 day expiry
- Stored in secure keychain (iOS) / encrypted preferences (Android)
- Revoked on logout
- Revoked on password change (if applicable)

### Session Management
- JWT tokens for API auth
- Automatic refresh before expiry
- Force logout on security events:
  - Password reset
  - Account compromise detected
  - Manual "logout all devices"

---

## 📧 Email Security

### Verification Flow
```
1. User enters email
2. Server generates 6-digit code
3. Code sent via email (no link - phishing protection)
4. Code expires in 10 minutes
5. Max 5 attempts before lockout (5 min)
6. New code invalidates old code
```

### Storage
- Email stored encrypted (AES-256)
- Verification codes hashed (bcrypt)
- Attempt counts stored temporarily (Redis, 24h TTL)

---

## 🔗 Connected Accounts Security

### OAuth Flow
- State parameter for CSRF protection
- PKCE for mobile (where supported)
- Token exchange server-side only
- No tokens stored in localStorage (web)

### Provider Data Access
| Provider | Data Accessed | Purpose |
|----------|---------------|---------|
| Google | Email, Name | Account linking |
| Apple | Email (optional), Name | Account linking |

**We do NOT access:**
- Contacts
- Calendar
- Drive/files
- Location history
- Any other scopes

---

## 📍 Location Privacy

### Real-time Location
- Used ONLY for nearby matching
- Never stored permanently
- Precision reduced for display (100m grid)
- User can disable anytime

### Hidden Areas
- User-defined privacy zones
- Stored on server (encrypted coordinates)
- Checked server-side before showing profile
- User can delete anytime

### Location History
- NOT stored
- NOT sent to analytics
- NOT shared with third parties

---

## 👥 Contacts Visibility

### How It Works
```
1. User grants contacts permission
2. App hashes phone numbers locally (SHA-256)
3. Only hashes sent to server
4. Server matches hashes
5. Matched contacts hidden from user's profile
```

### Guarantees
- Raw phone numbers NEVER leave device
- Hashes are one-way (cannot reverse)
- Contacts list NEVER shared
- User can disable anytime
- Hashes deleted on disable

---

## 📊 Analytics Privacy

### What We Track
- Screen views (anonymized)
- Feature usage counts
- Error rates
- Performance metrics

### What We NEVER Track
| Data | Why |
|------|-----|
| Email address | PII |
| Phone number | PII |
| Exact location | Privacy |
| Contact names | Privacy |
| Message content | Privacy |
| Match identities | Privacy |
| Swipe targets | Privacy |

### Analytics Payload Rules
```javascript
// ✅ ALLOWED
trackEvent('email_verified', { user_id: 'uuid' });

// ❌ FORBIDDEN
trackEvent('email_verified', { email: 'user@example.com' });
```

---

## 📥 Data Export

### What's Included
- Profile information
- Photos (URLs)
- Match history (anonymized IDs)
- Message history
- Preferences
- Activity timestamps

### What's Excluded
| Data | Reason |
|------|--------|
| Other users' data | Their privacy |
| Algorithm weights | Trade secret |
| Fraud detection flags | Security |
| Internal notes | Operational |

### Export Format
- JSON file
- Encrypted ZIP
- Download link expires in 48 hours
- One-time download

---

## 🚨 Report a Problem

### Data Collection
- User description (text)
- Screenshot (optional, user-provided)
- App version
- Device info (model, OS)
- User ID (for follow-up)

### NOT Collected Automatically
- Location
- Network info
- Other app data
- Clipboard content

### Storage
- Reports stored securely
- Deleted after resolution + 30 days
- No third-party access

---

## 🛡️ Security Best Practices (for developers)

### API Calls
```javascript
// ✅ ALWAYS use HTTPS
const API_URL = 'https://api.pulse.dating';

// ✅ ALWAYS include auth header
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
}

// ✅ NEVER log sensitive data
console.log('User:', { id: user.id }); // OK
console.log('User:', user); // WRONG - may include PII
```

### Local Storage
```javascript
// ✅ OK to store
localStorage.setItem('pulse_language', 'en');
localStorage.setItem('pulse_theme', 'light');

// ❌ NEVER store
localStorage.setItem('token', accessToken); // Use secure storage
localStorage.setItem('email', email); // PII
```

### Error Messages
```javascript
// ✅ CORRECT - Generic message
throw new Error('Authentication failed');

// ❌ WRONG - Reveals system info
throw new Error(`Database error: ${dbError.message}`);
```

---

## 📋 Security Checklist

Before PR:
- [ ] No PII in logs
- [ ] No tokens in localStorage (web)
- [ ] All API calls use HTTPS
- [ ] Sensitive data encrypted
- [ ] Error messages don't leak info
- [ ] Analytics don't include PII
- [ ] Location only used for intended purpose

---

## 🔄 Incident Response

If security issue found:
1. Do NOT commit fix publicly
2. Report to security@pulse.dating
3. Wait for security team review
4. Coordinate disclosure

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Security Contact:** security@pulse.dating
