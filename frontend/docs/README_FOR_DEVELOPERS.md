# Pulse – Settings & Account Implementation

> **Start here. Read in order.**

---

## 1. Source of Truth

```
Pulse_Settings_Product_Spec.pdf
```

This document defines ALL behavior and UX.

**If something is not written there – it does not exist.**

---

## 2. Locked Rules

```
Pulse_Settings_Developer_Notes.md
```

These rules are **non-negotiable**.

Do not improve, optimize, or reinterpret.

---

## 3. Implementation Principles

- Immediate apply (no save buttons)
- No accidental invisibility
- Always at least one sign-in method
- Clear states, no guessing
- No UI invention

---

## 4. API Contract

```
Pulse_Settings_API_Contract.md
```

Use only documented endpoints and payloads.

No custom structures without approval.

---

## 5. QA Expectation

```
Pulse_Settings_QA_Checklist.md
```

Every edge case listed must be testable.

If behavior is unclear – **stop and ask**.

---

## 6. What NOT to do

- ❌ Do not change visual hierarchy
- ❌ Do not add confirmation screens
- ❌ Do not create new settings
- ❌ Do not change copy tone

---

## 7. Success Criteria

If implemented correctly:

- ✅ User always knows their visibility state
- ✅ User never locks themselves out
- ✅ Settings feel calm, predictable, and trustworthy

---

## 📁 Full Documentation Index

| File | Purpose |
|------|---------|
| `Pulse_Settings_Developer_Notes.md` | Locked rules, forbidden actions |
| `Pulse_Settings_API_Contract.md` | API endpoints, payloads, errors |
| `Pulse_Settings_Analytics_Events.json` | All analytics events |
| `Pulse_Settings_QA_Checklist.md` | Test cases for every feature |
| `Pulse_Accessibility_i18n_Rules.md` | RTL, screen reader, translations |
| `Pulse_Settings_Privacy_Security.md` | Encryption, storage, privacy |

---

**Last Updated:** January 2026  
**Version:** 1.0
