# MeetingTimeScreen - Layout Specification

## Overview
The MeetingTimeScreen is displayed during an active meeting. It provides quick actions for safety and communication.

## Layout Constants

| Property | Value | Description |
|----------|-------|-------------|
| **Top bar height** | 56px | Global header with meeting info |
| **Bottom nav height** | 56px | Global bottom navigation |
| **Horizontal padding** | 16px (px: 2) | Left/right padding |
| **Content max width** | 400px | Maximum width of content area |
| **Gap between components** | 8px (gap: 1) | Vertical spacing between all components |

## Container Positioning
```jsx
position: 'fixed',
top: 56,      // Below top bar
left: 0,
right: 0,
bottom: 56,   // Above bottom nav
```

## Content Centering
- `justifyContent: 'center'` - Vertically centers all content
- `alignItems: 'center'` - Horizontally centers content
- No scrolling allowed (`overflow: hidden`)

## Component Heights (Approximate)

| Component | Height | Description |
|-----------|--------|-------------|
| Meeting Card | ~80px | Purple gradient card with meeting status |
| WhatsApp Section | ~140px | Title + contact buttons (3 contacts + Add) |
| Support Button | ~56px | "Need support?" card |
| Action Buttons Row | ~48px | End Meeting + SOS buttons |
| Demo Button | ~32px | Test SOS Demo button |
| **Total** | ~364px | Fits most screens without scrolling |

## Scrollbar Handling
- `overflow: hidden` on container
- CSS in `index.css` hides scrollbar:
```css
[data-testid="meeting-time-screen"] {
  overflow: hidden !important;
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
```

## Responsive Behavior
- Content is always centered vertically
- On smaller screens, content may need to be compressed
- No horizontal scrolling allowed

## Z-Index
- Screen sits at normal document flow level
- Dialogs (SOS Demo, Add Contact) use global overlay z-index (10000)

## Colors
- Background: `#F8F9FA` (light gray)
- Meeting card: Purple gradient `#F3F0FF` to `#E9E4FF`
- Support card: Purple gradient `#EDE9FE` to `#DDD6FE`
- SOS button: Purple gradient `#6C5CE7` to `#a855f7`

---
**Last Updated:** March 2026
**Do NOT modify layout constants without updating this specification.**
