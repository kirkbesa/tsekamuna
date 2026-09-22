// Step 0 — Health content classification (preliminary gate).
//
// Scopes the whole extension to health content: only posts that pass this gate
// get a credibility panel. Runs as a two-stage funnel —
//
//   Stage 1 (implemented here, rule-based): a cheap bilingual keyword pre-filter
//     that runs on every post and rejects the majority that are clearly not
//     health-related. Free and instant — no API call.
//
//   Stage 2 (TODO, AI-assisted): for posts that pass Stage 1, an LLM confirms
//     the post actually makes/repeats a health claim or reports health news,
//     and filters out incidental mentions ("get well soon", gym selfies, food
//     photos). Async — will run from the background service worker. Skipped for
//     now, so Stage 1 alone decides the gate.

import type { PostData } from "../types";

// Bilingual (English + Filipino/Tagalog) health lexicon. Lowercase; matched on
// word boundaries so short terms don't hit inside unrelated words. Grouped only
// for readability — every term is treated equally.
// TODO: expand from the thesis corpus; add Cebuano / other PH-language terms.
const HEALTH_TERMS: string[] = [
  // conditions & diseases
  "cancer", "kanser", "diabetes", "dyabetis", "hypertension", "high blood",
  "altapresyon", "stroke", "heart attack", "atake sa puso", "tuberculosis",
  "dengue", "covid", "coronavirus", "hiv", "aids", "kidney", "bato sa apdo",
  "sakit", "karamdaman", "impeksyon", "infection", "virus", "bakterya",
  "healthcare",
  // symptoms
  "sintomas", "symptom", "lagnat", "fever", "ubo", "sipon", "pananakit",
  "pagsusuka", "pagtatae",
  // treatments & remedies (high-signal for health misinfo)
  "gamot", "lunas", "cure", "remedy", "herbal", "halamang gamot", "supplement",
  "vitamins", "bitamina", "antibiotic", "steroid", "therapy", "treatment",
  "pampagaling", "nakakagamot", "detox", "immune", "resistensya",
  // vaccines
  "bakuna", "vaccine", "booster", "immunization", "pagbabakuna",
  // actors & institutions
  "doktor", "doctor", "ospital", "hospital", "nurse", "health worker",
  "doh", "who", "fda", "clinic", "klinika",
  // nutrition & wellness
  "diet", "nutrisyon", "nutrition", "weight loss", "pampapayat", "cholesterol",
  "mental health", "kalusugan", "health",
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// One precompiled regex for the whole lexicon. The `\p{L}` boundaries (letter /
// non-letter) mean "tb"-style short terms only match as whole words, and
// multi-word terms like "high blood" match across their internal space.
const HEALTH_RE = new RegExp(
  `(^|[^\\p{L}])(${HEALTH_TERMS.map(escapeRegExp).join("|")})([^\\p{L}]|$)`,
  "iu",
);

// Stage 1 — cheap keyword pre-filter.
function matchesHealthLexicon(text: string): boolean {
  return HEALTH_RE.test(text);
}

// Returns true when the post should be analyzed (i.e. it is health-related).
export function classifyHealthContent(postData: PostData): boolean {
  if (!matchesHealthLexicon(postData.text)) return false;

  // TODO(Stage 2): confirm with an LLM that this is a genuine health claim /
  // health news rather than an incidental mention, before returning true.
  return true;
}
