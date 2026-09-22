// Step 1 — Linguistic (9 signals).
//   rule-based:  all-caps usage, all-caps headline, exclamation marks, emoji overuse
//   AI-assisted: emotional language, clickbait pattern, implied urgency,
//                vague attribution, writing complexity

import type { Lang } from "../lang";
import type { PostData } from "../types";
import { buildModule } from "./aggregate";
import { NOT_RISKY, type Layer, type Signal } from "./types";

// ── Rule-based ───────────────────────────────────────────────────────────────

// TODO: flag when a high percentage of letters are uppercase.
function detectAllCapsUsage(_text: string): Signal {
  return NOT_RISKY;
}

// TODO: flag an all-caps first line / headline.
function detectAllCapsHeadline(_text: string): Signal {
  return NOT_RISKY;
}

// TODO: flag excessive exclamation marks.
function detectExclamationMarks(_text: string): Signal {
  return NOT_RISKY;
}

// TODO: flag emoji overuse relative to text length.
function detectEmojiOveruse(_text: string): Signal {
  return NOT_RISKY;
}

// ── AI-assisted ──────────────────────────────────────────────────────────────

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

export function analyzeLinguistic(postData: PostData, _lang: Lang): Layer {
  const signals = [
    detectEmotionalLanguage(postData.text),
    detectClickbaitPattern(postData.text),
    detectAllCapsUsage(postData.text),
    detectAllCapsHeadline(postData.text),
    detectExclamationMarks(postData.text),
    detectEmojiOveruse(postData.text),
    detectImpliedUrgency(postData.text),
    detectVagueAttribution(postData.text),
    assessWritingComplexity(postData.text),
  ];
  return { signals, module: buildModule(signals) };
}
