// Language preference for TsekaMuna's UI chrome + analysis output.
// Content scripts share the host page's per-origin localStorage, so no
// "storage" permission is needed in manifest.json. Mirrors the module-level
// listener pattern in theme.ts, but changes here are always user-initiated
// (via the settings dropdown) rather than detected from the page.

export type Lang = "en" | "fil";

const STORAGE_KEY = "tsekamuna-lang";

function loadLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "fil";
  } catch {
    return "fil"; // Filipino is the brand-voice default
  }
}

const listeners = new Set<(lang: Lang) => void>();
let currentLang: Lang = loadLang();

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  if (lang === currentLang) return;
  currentLang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // private-browsing / storage disabled — preference just won't persist
  }
  listeners.forEach((fn) => fn(lang));
}

// Subscribe to language changes. Returns an unsubscribe function — callers
// that bind to DOM nodes which can be removed from the page (e.g. one per
// Facebook post) must call it once their node is no longer connected, or the
// listener set grows unbounded as the feed is scrolled.
export function onLangChange(fn: (lang: Lang) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
