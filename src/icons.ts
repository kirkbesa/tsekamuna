// Lucide icon SVG strings.
// We inline them as strings (instead of importing from the lucide npm package)
// because the content script has no bundler — only the TypeScript compiler.
// Source: https://lucide.dev — copy the SVG markup for any new icon needed.

// All icons share the same outer attributes; we set width/height/color via
// the className passed at render time, so consumers can size each instance
// independently.
const wrap = (inner: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export const icons = {
  // Brand / header
  search: wrap('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),

  // Module icons
  messageSquareText: wrap('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/>'),
  shieldCheck: wrap('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'),
  globe: wrap('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'),

  // Status icons
  checkCircle: wrap('<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>'),
  triangleAlert: wrap('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  circleX: wrap('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'),
  loader: wrap('<path d="M21 12a9 9 0 1 1-6.219-8.56"/>'),

  // UI controls
  x: wrap('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  info: wrap('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),

  // Verified badge (used next to post author when Facebook shows one)
  badgeCheck: wrap('<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>'),
} as const;

export type IconName = keyof typeof icons;

// Returns an SVG string with the given class applied to the root element.
// Use this when building innerHTML strings so each icon can be sized and
// colored independently via Tailwind classes (e.g. "w-4 h-4 text-blue-500").
export function icon(name: IconName, className: string = ""): string {
  return icons[name].replace("<svg ", `<svg class="${className}" `);
}
