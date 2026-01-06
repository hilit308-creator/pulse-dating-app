# 📐 Pulse – Accessibility & Internationalization Rules

> **Mandatory requirements for accessibility and multi-language support**

---

## ♿ Accessibility Requirements

### Screen Reader (VoiceOver / TalkBack)

#### All Interactive Elements
```jsx
// ✅ CORRECT
<Button aria-label={t('sendVerificationCode')}>
  <Send size={18} />
</Button>

// ❌ WRONG - No label for icon-only button
<Button>
  <Send size={18} />
</Button>
```

#### Images
```jsx
// ✅ CORRECT
<img src={photo} alt={`${userName}'s profile photo`} />

// ❌ WRONG - Decorative image without empty alt
<img src={decorative} /> // Should be alt=""
```

#### Focus Order
- Tab order follows visual order
- Modals trap focus
- Focus returns to trigger after modal close
- Skip links for long pages

#### State Announcements
```jsx
// Announce when toggle changes
<Switch
  aria-label={t('enableNotifications')}
  aria-checked={enabled}
  onChange={(e) => {
    setEnabled(e.target.checked);
    // Screen reader announces new state automatically
  }}
/>
```

---

### Reduce Motion

When `prefers-reduced-motion: reduce`:

| Component | Normal | Reduced Motion |
|-----------|--------|----------------|
| Page transitions | Fade + slide | Instant |
| Card swipe | Spring animation | Instant move |
| Toggles | Smooth transition | Instant |
| Loading spinners | Spinning | Static or pulsing opacity |
| Micro-interactions | Bouncy | None |

**Implementation:**
```jsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const transition = prefersReducedMotion 
  ? { duration: 0 } 
  : { type: 'spring', damping: 20 };
```

---

### Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Body text | 4.5:1 |
| Large text (18px+) | 3:1 |
| UI components | 3:1 |
| Focus indicators | 3:1 |

**Current Colors (verified):**
- Primary text `#1a1a2e` on `#ffffff` → 16.5:1 ✅
- Secondary text `#64748b` on `#ffffff` → 4.8:1 ✅
- Muted text `#94a3b8` on `#ffffff` → 3.1:1 ✅ (large text only)

---

### Touch Targets

- Minimum size: 44×44 points
- Spacing between targets: 8px minimum
- Full-width buttons preferred on mobile

---

### Text Scaling

Support dynamic type up to 200%:
- Use relative units (`rem`, `em`)
- Test layouts at 200% zoom
- Content must remain accessible (no truncation of critical info)

---

## 🌍 Internationalization (i18n)

### Supported Languages

| Code | Language | Direction | Status |
|------|----------|-----------|--------|
| `en` | English | LTR | ✅ Complete |
| `he` | עברית (Hebrew) | RTL | ✅ Complete |
| `es` | Español | LTR | 🔄 Partial |

---

### RTL Layout Rules

#### What MUST flip:
- Text alignment
- Flex direction (row → row-reverse)
- Margin/padding (left ↔ right)
- Navigation chevrons (`<` → `>`)
- Progress indicators
- List bullet positions

#### What MUST NOT flip:
- Icons (most)
- Phone numbers
- Email addresses
- Brand logos
- Map controls
- Sliders (left = min is universal)
- Media playback controls

**Implementation:**
```jsx
const { isRTL } = useLanguage();

<Box sx={{ 
  flexDirection: isRTL ? 'row-reverse' : 'row',
  textAlign: isRTL ? 'right' : 'left',
}}>
```

---

### Translation Keys

#### Naming Convention
```
section_subsection_element
```

Examples:
- `settings_account_email`
- `notification_match_title`
- `visibility_time_startTime`

#### Placeholder Variables
```jsx
// ✅ CORRECT - Named placeholders
t('welcomeUser', { name: userName })
// "Welcome, {name}!"

// ❌ WRONG - Positional
t('welcomeUser', [userName])
```

---

### Text Expansion

Languages expand differently:

| Language | Expansion vs English |
|----------|---------------------|
| German | +35% |
| French | +20% |
| Hebrew | -10% |
| Spanish | +15% |

**Rules:**
- Never truncate with `...` on critical info
- Use flexible containers
- Test with German placeholder text
- Allow 2 lines for labels that might wrap

---

### Number & Date Formatting

```jsx
// Numbers
const formatNumber = (num, locale) => 
  new Intl.NumberFormat(locale).format(num);

// Dates
const formatDate = (date, locale) =>
  new Intl.DateTimeFormat(locale, { 
    dateStyle: 'medium' 
  }).format(date);

// Distance
const formatDistance = (meters, locale, units) => {
  if (units === 'imperial') {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(1)} mi`;
  }
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};
```

---

### Fallback Rules

1. **Missing translation** → Show English
2. **Missing locale format** → Use `en-US`
3. **RTL detection fails** → Assume LTR
4. **Font loading fails** → System font stack

```jsx
const t = (key) => {
  const translation = translations[language]?.[key];
  if (!translation) {
    console.warn(`Missing translation: ${key} for ${language}`);
    return translations['English'][key] || key;
  }
  return translation;
};
```

---

### Currency

Currently not used, but if needed:
```jsx
const formatCurrency = (amount, currency, locale) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
```

---

## 🧪 Testing Requirements

### Accessibility Testing
- [ ] VoiceOver (iOS) full navigation
- [ ] TalkBack (Android) full navigation
- [ ] Keyboard-only navigation (web)
- [ ] Color contrast analyzer
- [ ] Reduce motion enabled

### i18n Testing
- [ ] English - complete pass
- [ ] Hebrew - RTL layout correct
- [ ] All dates/numbers localized
- [ ] No hardcoded strings
- [ ] Text expansion (German test)

---

## 📋 Checklist Before PR

### Accessibility
- [ ] All buttons have accessible names
- [ ] All images have alt text
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Reduce motion supported
- [ ] Touch targets 44×44 minimum

### i18n
- [ ] All strings use translation keys
- [ ] New keys added to EN + HE
- [ ] RTL layout tested
- [ ] No layout breaks at 200% zoom
- [ ] Numbers/dates use Intl formatters

---

**Last Updated:** January 2026  
**Version:** 1.0
