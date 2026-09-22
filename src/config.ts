// Build-time configuration, injected by build.mjs via esbuild `define`.
//
// SECURITY: these values are inlined into dist/content.js at build time, so
// they are visible to anyone who inspects the shipped extension. A client-side
// browser extension cannot keep an API key secret. For this prototype the
// Gemini key is inlined; for a public release the API call must go through a
// backend you control so the key never reaches the browser.
//
// Mitigations while inlined: restrict the key in Google Cloud Console to the
// Generative Language API only, and set a quota cap.

// Replaced at build time by build.mjs. Falls back to "" when no .env is present.
declare const __GEMINI_API_KEY__: string;

export const GEMINI_API_KEY: string = __GEMINI_API_KEY__;
