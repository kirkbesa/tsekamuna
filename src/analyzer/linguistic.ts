// Step 1 — Linguistic (9 signals).
//   rule-based:  all-caps usage, all-caps headline, exclamation marks, emoji overuse
//   AI-assisted: emotional language, clickbait pattern, implied urgency,
//                vague attribution, writing complexity
//
// The four rule-based signals are implemented; the five AI-assisted ones are
// still stubs (they need an LLM — see ../background.ts). Each detector emits a
// bilingual `detail` line so the popover reads correctly in either language.

import type { Lang } from "../lang";
import type { PostData } from "../types";
import { buildModule } from "./aggregate";
import { NOT_RISKY, type Layer, type Signal } from "./types";

// Tunable thresholds — edit here to calibrate sensitivity.
const EXCLAMATION_LIMIT = 3; // risky at or above this many "!"
const CAPS_MIN_CASED = 15; // ignore caps ratio on very short text
const CAPS_RATIO_LIMIT = 0.35; // risky at or above this uppercase share
const HEADLINE_MIN_CASED = 6; // first line needs at least this many letters
const HEADLINE_RATIO_LIMIT = 0.9; // first line is ~entirely uppercase
const EMOJI_LIMIT = 5; // risky at or above this many emoji

// ── Rule-based ───────────────────────────────────────────────────────────────

// Share of cased letters that are uppercase (ignores digits, spaces, emoji).
function capsRatio(text: string): { ratio: number; cased: number } {
  const upper = (text.match(/\p{Lu}/gu) ?? []).length;
  const lower = (text.match(/\p{Ll}/gu) ?? []).length;
  const cased = upper + lower;
  return { ratio: cased === 0 ? 0 : upper / cased, cased };
}

// Flag when a high percentage of the text is uppercase ("shouting").
function detectAllCapsUsage(text: string, lang: Lang): Signal {
  const { ratio, cased } = capsRatio(text);
  const pct = Math.round(ratio * 100);
  const risky = cased >= CAPS_MIN_CASED && ratio >= CAPS_RATIO_LIMIT;
  const label = lang === "fil" ? "All-caps" : "All-caps usage";
  const tag = risky ? (lang === "fil" ? " (mataas)" : " (high)") : "";
  return { risky, detail: `${label}: ${pct}%${tag}` };
}

// Flag an all-caps first line / headline.
function detectAllCapsHeadline(text: string, lang: Lang): Signal {
  const firstLine = text.split(/\r?\n/)[0]?.trim() ?? "";
  const { ratio, cased } = capsRatio(firstLine);
  const risky = cased >= HEADLINE_MIN_CASED && ratio >= HEADLINE_RATIO_LIMIT;

  if (!risky) {
    return {
      risky: false,
      detail: lang === "fil" ? "Walang all-caps na headline." : "No all-caps headline.",
    };
  }
  const snippet = firstLine.length > 40 ? `${firstLine.slice(0, 40)}…` : firstLine;
  const label = lang === "fil" ? "All-caps na headline" : "All-caps headline";
  return { risky: true, detail: `${label}: "${snippet}"` };
}

// Flag excessive exclamation marks.
function detectExclamationMarks(text: string, lang: Lang): Signal {
  const count = (text.match(/!/g) ?? []).length;
  const risky = count >= EXCLAMATION_LIMIT;
  const label = lang === "fil" ? "Tandang padamdam" : "Exclamation marks";
  const tag = risky ? (lang === "fil" ? " (labis)" : " (excessive)") : "";
  return { risky, detail: `${label}: ${count}${tag}` };
}

// Flag emoji overuse relative to the post.
function detectEmojiOveruse(text: string, lang: Lang): Signal {
  const count = (text.match(/\p{Extended_Pictographic}/gu) ?? []).length;
  const risky = count >= EMOJI_LIMIT;
  const label = lang === "fil" ? "Emoji" : "Emoji";
  const tag = risky
    ? lang === "fil" ? " (labis)" : " (overuse)"
    : lang === "fil" ? " (normal)" : " (normal)";
  return { risky, detail: `${label}: ${count}${tag}` };
}

// ── AI-assisted (still stubs — need an LLM) ──────────────────────────────────

// TODO: detect emotional language (fear / anger / urgency) via LLM.
function detectEmotionalLanguage(_text: string): Signal {
  return NOT_RISKY;
}

// TODO: detect clickbait / sensational-claim patterns via LLM.
function detectClickbaitPattern(_text: string): Signal {
  return NOT_RISKY;
}

// TODO: detect implied urgency ("before it's banned", "act now") via LLM.
function detectImpliedUrgency(_text: string): Signal {
  return NOT_RISKY;
}

// TODO: detect vague attribution ("according to doctors", "they say") via LLM.
function detectVagueAttribution(_text: string): Signal {
  return NOT_RISKY;
}

// TODO: assess writing complexity / readability via LLM.
function assessWritingComplexity(_text: string): Signal {
  return NOT_RISKY;
}

export function analyzeLinguistic(postData: PostData, lang: Lang): Layer {
  const { text } = postData;
  const signals = [
    detectEmotionalLanguage(text),
    detectClickbaitPattern(text),
    detectAllCapsUsage(text, lang),
    detectAllCapsHeadline(text, lang),
    detectExclamationMarks(text, lang),
    detectEmojiOveruse(text, lang),
    detectImpliedUrgency(text),
    detectVagueAttribution(text),
    assessWritingComplexity(text),
  ];
  return { signals, module: buildModule(signals) };
}
