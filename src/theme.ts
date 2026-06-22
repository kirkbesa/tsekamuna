// Facebook theme detection.
// Facebook changes its dark-mode class names frequently, so we don't match a
// class. Instead we read the computed page background luminance — a robust
// signal that survives FB's churn. A MutationObserver re-checks whenever FB
// flips its theme at runtime so users don't have to reload.

export type Theme = "light" | "dark";

// Returns "dark" if the page body's background is dark, "light" otherwise.
export function detectFbTheme(): Theme {
  const bg = getComputedStyle(document.body).backgroundColor;
  const m = bg.match(/\d+(\.\d+)?/g);
  if (!m) return "light";

  const [r, g, b] = m.map(Number);
  // Standard relative luminance formula (sRGB approximation)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.5 ? "dark" : "light";
}

// Registered listeners that get called whenever the theme changes.
const listeners = new Set<(theme: Theme) => void>();
let currentTheme: Theme = "light";
let observerStarted = false;

function emit(theme: Theme): void {
  if (theme === currentTheme) return;
  currentTheme = theme;
  listeners.forEach((fn) => fn(theme));
}

// Start watching for FB theme changes. Idempotent — calling multiple times is
// safe; only the first call attaches the observer.
function startObserving(): void {
  if (observerStarted) return;
  observerStarted = true;

  currentTheme = detectFbTheme();

  const recheck = () => emit(detectFbTheme());
  const observer = new MutationObserver(recheck);

  // Watch both <html> and <body> — FB has flipped between the two locations
  // for its dark-mode marker over the years.
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style", "data-theme"],
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class", "style"],
  });
}

// Subscribe to theme changes. Invokes the callback immediately with the
// current theme, then again on every subsequent change. Returns an
// unsubscribe function.
export function onThemeChange(fn: (theme: Theme) => void): () => void {
  startObserving();
  listeners.add(fn);
  fn(currentTheme);
  return () => listeners.delete(fn);
}

// Apply the current theme to an element by setting its data-theme attribute.
// Re-applies on every theme change for as long as the element is alive.
export function bindThemeToElement(el: HTMLElement): void {
  onThemeChange((theme) => {
    el.setAttribute("data-theme", theme);
  });
}
