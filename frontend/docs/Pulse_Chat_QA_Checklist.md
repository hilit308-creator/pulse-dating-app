# 🧪 Pulse Chat Gates — QA Checklist

> **Complete test coverage for Chat Feature Gates**

---

## 🧪 SECTION A — Thread & Gates Load

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| A1 | טעינת צ׳אט רגיל | לפתוח thread unlocked | messages נטענות + composer פתוח | High |
| A2 | טעינת gated | לפתוח thread gated | composer disabled + Gate Banner | High |
| A3 | טעינת blocked | לפתוח blocked | הודעת blocked + אין composer | **Critical** |
| A4 | רענון gates | GET /gates | UI משתנה בזמן אמת | High |
| A5 | Thread not found | פתיחת thread לא קיים | 404 + error message | Medium |
| A6 | Loading state | פתיחת thread | Skeleton loading מוצג | Medium |

---

## 🧪 SECTION B — Message Sending

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| B1 | שליחה ב־unlocked | לכתוב ולשלוח | 201 + מופיע מיד | High |
| B2 | שליחה ב־gated | לנסות לשלוח | 409 gated + banner מתעדכן | High |
| B3 | idempotency | לשלוח פעמיים אותו key | רק הודעה אחת נוצרת | **Critical** |
| B4 | rate limit | שליחות מהירות | 429 + UI מונע ספאם | Medium |
| B5 | הודעה ריקה | לשלוח הודעה ריקה | validation error | Low |
| B6 | הודעה ארוכה | > 2000 chars | validation error | Low |
| B7 | Send button state | בזמן שליחה | disabled + loading | Medium |

---

## 🧪 SECTION C — Real-time Changes

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| C1 | פתיחה אחרי Premium | לקנות Premium כשהגייט פעיל | נפתח מייד | High |
| C2 | פקיעת unlock באמצע כתיבה | להמתין לפקיעה | בלחיצה על Send → 409 gated | High |
| C3 | Block באמצע שיחה | צד ב' חוסם | UI עובר ל־blocked | **Critical** |
| C4 | Points unlock | הפעלת unlock עם נקודות | נפתח מייד + timer | High |
| C5 | Points unlock expires | המתנה לסיום timer | חוזר ל-gated | High |
| C6 | App backgrounded | יציאה מהאפליקציה | gates refresh on return | Medium |

---

## 🧪 SECTION D — Copy & UX

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| D1 | טקסט ברור | gated reason | תמיד יש reason ברור | Medium |
| D2 | CTA יחיד | banner | אין יותר מ־CTA אחד | Medium |
| D3 | No CTA for SYSTEM_BLOCKED | blocked chat | אין כפתור לפתוח | **Critical** |
| D4 | Placeholder text | gated composer | "Messaging locked" or similar | Low |
| D5 | RTL support | Hebrew UI | תצוגה נכונה | Medium |

---

## 🧪 SECTION E — Gate Banner UI

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| E1 | NEED_MATCH banner | לפתוח thread ללא match | "Match first" + no CTA | High |
| E2 | SUBSCRIPTION_REQUIRED banner | לפתוח gated | "Premium required" + CTA | High |
| E3 | POINTS_FEATURE_REQUIRED banner | לפתוח gated | "Unlock messaging" + CTA | High |
| E4 | SYSTEM_BLOCKED banner | לפתוח blocked | "Chat unavailable" + no CTA | **Critical** |
| E5 | CTA navigation | לחיצה על CTA | ניווט למסך הנכון | High |

---

## 🧪 SECTION F — Error Handling

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| F1 | Network error | disconnect + send | error message + retry option | High |
| F2 | Server error 500 | שליחה | error message | Medium |
| F3 | Timeout | שליחה איטית | loading + eventual error | Medium |
| F4 | Invalid response | malformed JSON | graceful error | Low |

---

## 🧪 SECTION G — Idempotency

| ID | Scenario | Steps | Expected | Severity |
|----|----------|-------|----------|----------|
| G1 | Same key twice | POST /messages x2 | Same messageId returned | **Critical** |
| G2 | Different key | POST /messages x2 different keys | Two messages created | High |
| G3 | Missing key | POST without Idempotency-Key | 400 error | High |
| G4 | Key expiry | Wait > TTL, retry | New message created | Medium |

---

## ✅ Definition of Done (QA)

- [ ] All thread states render correctly
- [ ] Gate banner shows for all block reasons
- [ ] Composer disabled when gated
- [ ] CTA navigates to correct screen
- [ ] No CTA for SYSTEM_BLOCKED
- [ ] Real-time updates work
- [ ] Idempotency prevents duplicates
- [ ] Rate limiting works
- [ ] Error messages are clear
- [ ] RTL/LTR support

---

## 📊 Test Matrix

### Thread State × Block Reason

| Thread State | NONE | NEED_MATCH | SUBSCRIPTION | POINTS | SYSTEM |
|--------------|------|------------|--------------|--------|--------|
| MATCHED_UNLOCKED | ✅ Send | - | - | - | - |
| MATCHED_GATED | - | Banner | Banner+CTA | Banner+CTA | Banner |
| BLOCKED | - | - | - | - | No CTA |
| EXPIRED | - | - | - | - | Banner |

### CTA Type × Navigation

| CTA Type | Target Screen |
|----------|---------------|
| none | - |
| buy_subscription | /subscriptions |
| use_points | /points |
| complete_action | Custom |

---

**Last Updated:** January 2026  
**Version:** 1.0
