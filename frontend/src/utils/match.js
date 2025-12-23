// src/utils/match.js

export function fireConfetti() {
  try {
    // Lightweight DOM-based confetti (no dependency)
    const root = document.createElement('div');
    root.style.position = 'fixed'; root.style.inset = '0'; root.style.pointerEvents = 'none'; root.style.overflow = 'hidden'; root.style.zIndex = '9999';
    const colors = ['#f43f5e', '#22c55e', '#3b82f6', '#f59e0b', '#a78bfa', '#10b981'];
    for (let i = 0; i < 120; i++) {
      const s = document.createElement('span');
      const size = 6 + Math.random() * 6;
      s.style.position = 'absolute';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = '-10px';
      s.style.width = size + 'px'; s.style.height = size + 'px';
      s.style.background = colors[i % colors.length];
      s.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      s.style.transform = `rotate(${Math.random() * 360}deg)`;
      s.style.opacity = '0.9';
      s.animate([
        { transform: `translateY(-10px) rotate(0deg)`, opacity: 0.9 },
        { transform: `translate(${(Math.random() * 2 - 1) * 80}px, ${window.innerHeight + 80}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 1 }
      ], { duration: 1800 + Math.random() * 1200, easing: 'cubic-bezier(.15,.6,.3,1)', fill: 'forwards' });
      root.appendChild(s);
    }
    document.body.appendChild(root);
    setTimeout(() => root.remove(), 2600);
  } catch (_) { /* noop */ }
}

export function isMutualLike(result) {
  return Boolean(result && (result.mutual || result.isMutual || result.status === 'mutual'));
}

export function isNearbyMatch(match, { requireNearby = true } = {}) {
  if (!requireNearby) return true;
  return Boolean(match && (match.isNearby || match.nearby === true));
}
