import React from "react";

// Monochrome settings icon: light gray circle, dark gray gear, no gradients/colors
export default function SettingsIconMonochrome({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#f2f2f2" />
      <g>
        <circle cx="32" cy="32" r="32" fill="#f2f2f2" />
        <g>
          <circle cx="32" cy="32" r="32" fill="#f2f2f2" />
          <g>
            <path d="M32 22a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10 10 10 0 0 1 10-10zm0-4a2 2 0 0 1 2 2v2.1a13.9 13.9 0 0 1 3.1.9l1.5-1.5a2 2 0 0 1 2.8 0l2.1 2.1a2 2 0 0 1 0 2.8l-1.5 1.5c.4 1 .7 2 .9 3.1H44a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2.1a13.9 13.9 0 0 1-.9 3.1l1.5 1.5a2 2 0 0 1 0 2.8l-2.1 2.1a2 2 0 0 1-2.8 0l-1.5-1.5c-1 .4-2 .7-3.1.9V52a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-2.1a13.9 13.9 0 0 1-3.1-.9l-1.5 1.5a2 2 0 0 1-2.8 0l-2.1-2.1a2 2 0 0 1 0-2.8l1.5-1.5a13.9 13.9 0 0 1-.9-3.1H12a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2.1a13.9 13.9 0 0 1 .9-3.1l-1.5-1.5a2 2 0 0 1 0-2.8l2.1-2.1a2 2 0 0 1 2.8 0l1.5 1.5c1-.4 2-.7 3.1-.9V20a2 2 0 0 1 2-2h3zm0 10a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" fill="#2e2e2e"/>
          </g>
        </g>
      </g>
    </svg>
  );
}
