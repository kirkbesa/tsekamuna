// Step 0 — Health content classification (preliminary gate).
//
// Scopes the whole extension to health content: only posts that pass this gate
// get a credibility panel. Uses a bilingual keyword lexicon (see
// ./health-terms.ts) — free, instant, and unlimited, unlike an LLM call which
// the Gemini free tier rate-limits to ~20/day.
//
// TODO: if precision needs improving later (and billing is enabled), an LLM can
// be added as a Stage 2 confirmation for posts that pass this keyword gate. The
// worker + messaging plumbing for that already exists (see ../background.ts).

import type { PostData } from "../types";
import { HEALTH_ACRONYMS, HEALTH_TERMS } from "./health-terms";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// `\p{L}` boundaries (letter / non-letter) so short terms match only as whole
// words and multi-word terms match across their internal spaces.
function buildLexiconRegExp(terms: string[], flags: string): RegExp {
  const alternation = terms.map(escapeRegExp).join("|");
  return new RegExp(`(^|[^\\p{L}])(${alternation})([^\\p{L}]|$)`, flags);
}

// Case-insensitive for ordinary terms; case-sensitive for acronyms whose
// lowercase forms ("who", "aids", "doh"…) are everyday words.
const TERMS_RE = buildLexiconRegExp(HEALTH_TERMS, "iu");
const ACRONYMS_RE = buildLexiconRegExp(HEALTH_ACRONYMS, "u");

// Returns true when the post is health-related and should be analyzed.
export function classifyHealthContent(postData: PostData): boolean {
  const text = postData.text.trim();
  if (!text) return false;
  return TERMS_RE.test(text) || ACRONYMS_RE.test(text);
}
