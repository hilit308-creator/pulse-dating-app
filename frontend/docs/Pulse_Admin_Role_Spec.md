# 👑 Pulse Admin Role — Full Access Specification

> **Developer-Ready (V1)**

---

## 1️⃣ User Roles

| Role | Level | Description |
|------|-------|-------------|
| `user` | 0 | Regular user |
| `moderator` | 1 | Limited admin (reports, content) |
| `admin` | 2 | Full access |
| `super_admin` | 3 | System owner (Hilit) |

---

## 2️⃣ Admin Permissions (Full Access)

### Users Management
- ✅ View all users
- ✅ Search users
- ✅ View user profiles
- ✅ Suspend/Ban users
- ✅ Delete users
- ✅ Reset user passwords
- ✅ Verify users manually

### Reports & Moderation
- ✅ View all reports
- ✅ Review flagged content
- ✅ Take action on reports
- ✅ Block/Unblock users
- ✅ Remove content

### Analytics & Dashboard
- ✅ View real-time stats
- ✅ User growth metrics
- ✅ Revenue reports
- ✅ Feature usage stats
- ✅ Points transactions

### Content Management
- ✅ Manage events
- ✅ Approve/Reject photos
- ✅ Edit system messages
- ✅ Manage notifications

### System Settings
- ✅ Feature toggles
- ✅ Config changes
- ✅ Maintenance mode

---

## 3️⃣ Admin Dashboard Screens

```
/admin
├── /dashboard      → Overview + Stats
├── /users          → User management
├── /reports        → Reports queue
├── /analytics      → Detailed analytics
├── /content        → Content moderation
├── /settings       → System settings
└── /logs           → Activity logs
```

---

## 4️⃣ Access Control

### Authentication
```javascript
// User object with role
{
  id: "user_123",
  email: "admin@pulse.app",
  role: "admin",  // user | moderator | admin | super_admin
  permissions: ["all"],
  createdAt: "2026-01-01"
}
```

### Route Protection
```javascript
// AdminRoute component
<AdminRoute requiredRole="admin">
  <AdminDashboard />
</AdminRoute>
```

---

## 5️⃣ Security Rules

| Rule | Implementation |
|------|----------------|
| 2FA Required | Admin must have 2FA enabled |
| Session timeout | 4 hours max |
| IP logging | All admin actions logged |
| Audit trail | Every action recorded |

---

## 6️⃣ Admin Actions Log

Every admin action creates a log entry:

```javascript
{
  adminId: "admin_123",
  action: "USER_SUSPENDED",
  targetId: "user_456",
  reason: "Inappropriate content",
  timestamp: "2026-01-07T22:00:00Z",
  ip: "192.168.1.1"
}
```

---

## 7️⃣ Staff Member Setup

### To add a new admin:

1. **Create user account** (regular flow)
2. **Backend**: Update role to `admin`
3. **Enable 2FA** (required)
4. **Grant permissions** (or use defaults)

### SQL Example:
```sql
UPDATE users 
SET role = 'admin', 
    permissions = '["all"]'
WHERE email = 'staff@pulse.app';
```

---

## 8️⃣ 24/7 Access Notes

- ✅ No time restrictions for admin
- ✅ Access from any location
- ✅ Mobile-responsive admin panel
- ✅ Push notifications for urgent reports

---

**Last Updated:** January 2026  
**Version:** 1.0
