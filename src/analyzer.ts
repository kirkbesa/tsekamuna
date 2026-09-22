// Analysis pipeline — turns PostData into a single AnalysisResult.
//
// This is the scaffold for the credibility engine described in Chapter 3.
// Every parameter has its own stub function so they can be implemented one at a
// time; each returns a Signal, and analyzePost aggregates all signals into the
// risk score the UI consumes. Nothing here does real detection yet — see the
// TODOs.
//
// Parameters (14 total):
//   Layer 0 — Health content classification (preliminary gate)
//   Layer 1 — Linguistic (9)
//     rule-based:  all-caps usage, all-caps headline, exclamation marks, emoji overuse
//     AI-assisted: emotional language, clickbait pattern, implied urgency,
//                  vague attribution, writing complexity
//   Layer 2 — Source & Metadata (4)
//     missing linked source, domain classification, author verified, author classification
//   Layer 3 — External Verification (1)
//     Google Fact Check Tools API → AI-assisted source retrieval (fallback)
//
// Risk thresholds (thesis §A.b.iv): Low 0–4 · Medium 5–9 · High 10–14 risky params.

import type { Lang } from "./lang";
import type {
  AnalysisResult,
  ModuleResult,
  ModuleStatus,
  PostData,
  RiskLevel,
} from "./types";

// One credibility signal — one of the parameters above. `risky` feeds the
// aggregate score; `detail` is the human-readable line shown in the popover.
interface Signal {
  risky: boolean;
  detail: string;
}

// A module's signals plus the ModuleResult the UI renders for it.
interface Layer {
  signals: Signal[];
  module: ModuleResult;
}

// Default returned by every stub until it does real detection.
const NOT_RISKY: Signal = { risky: false, detail: "" };

// ─── Layer 0 — Health content classification (preliminary gate) ──────────────

// Only health-related posts should be scored. When this returns false the
// caller should skip the post entirely (no panel).
// TODO: implement health-topic detection (keyword list + AI-assisted).
function classifyHealthContent(_postData: PostData): boolean {
  return true; // treat everything as health content for now
}

// ─── Layer 1 — Linguistic ────────────────────────────────────────────────────

// Rule-based signals
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

// AI-assisted signals
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

function analyzeLinguistic(postData: PostData, _lang: Lang): Layer {
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

// ─── Layer 2 — Source & Metadata ─────────────────────────────────────────────

// TODO: flag when a claim-like post links to no external source.
function detectMissingLinkedSource(_links: string[]): Signal {
  return NOT_RISKY;
}

// TODO: classify each link's domain against a curated credible/unreliable list.
function classifyDomain(_links: string[]): Signal {
  return NOT_RISKY;
}

// TODO: turn the extracted verified badge into a signal.
function checkAuthorVerified(_verified: boolean): Signal {
  return NOT_RISKY;
}

// TODO: classify the author (news org / personal account / unknown).
function classifyAuthor(_author: string): Signal {
  return NOT_RISKY;
}

function analyzeSource(postData: PostData, _lang: Lang): Layer {
  const signals = [
    detectMissingLinkedSource(postData.links),
    classifyDomain(postData.links),
    checkAuthorVerified(postData.verified),
    classifyAuthor(postData.author),
  ];
  return { signals, module: buildModule(signals) };
}

// ─── Layer 3 — External Verification ─────────────────────────────────────────
// Fallback chain: query Google Fact Check first, fall back to AI retrieval.
// NOTE: both are network calls — implementing this will make analyzePost async
// (or require a follow-up update once results arrive).

// TODO: extract the core claim from the caption before querying.
function extractClaim(text: string): string {
  return text;
}

// TODO: query the Google Fact Check Tools API for matching claims.
function queryFactCheckApi(_claim: string): Signal {
  return NOT_RISKY;
}

// TODO: AI-assisted source retrieval fallback (Gemini Flash + search grounding).
function aiAssistedRetrieval(_claim: string): Signal {
  return NOT_RISKY;
}

function analyzeExternal(postData: PostData, _lang: Lang): Layer {
  const claim = extractClaim(postData.text);
  const factCheck = queryFactCheckApi(claim);
  // TODO: only fall back to AI retrieval when the fact-check API returns no match.
  const retrieval = aiAssistedRetrieval(claim);

  const verification: Signal =
    factCheck.risky || retrieval.risky ? { risky: true, detail: "" } : NOT_RISKY;

  // TODO: build a real ModuleResult (matched / unverified / contradicted).
  return {
    signals: [verification],
    module: { status: "pending", summary: "", verdict: "", details: [] },
  };
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

// Collapse a layer's signals into the ModuleResult shape the UI renders.
function buildModule(signals: Signal[]): ModuleResult {
  const riskyCount = signals.filter((s) => s.risky).length;

  // TODO: refine this mapping and write the summary/verdict copy per language.
  const status: ModuleStatus =
    riskyCount === 0 ? "clear" : riskyCount <= 2 ? "caution" : "high";

  return {
    status,
    summary: "", // TODO
    verdict: "", // TODO
    details: signals.map((s) => s.detail).filter(Boolean),
  };
}

// Count risky parameters across all layers → overall score + level.
function aggregate(signals: Signal[]): { riskScore: number; riskLevel: RiskLevel } {
  const riskyCount = signals.filter((s) => s.risky).length; // out of 14

  // Thresholds (thesis §A.b.iv): Low 0–4 · Medium 5–9 · High 10–14.
  const riskLevel: RiskLevel =
    riskyCount <= 4 ? "clear" : riskyCount <= 9 ? "caution" : "high";

  // TODO: return "unverified" when external verification finds no supporting or
  // contradicting source and no other strong signals are present.

  const riskScore = Math.round((riskyCount / 14) * 100);
  return { riskScore, riskLevel };
}

// One-line plain-language summary shown under the meter.
// TODO: write copy per risk level and language.
function buildReadout(_level: RiskLevel, _lang: Lang): string {
  return "";
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export function analyzePost(postData: PostData, lang: Lang): AnalysisResult {
  // Step 0 — gate on health content.
  // TODO: when this is false, skip the post (caller should not inject a panel).
  classifyHealthContent(postData);

  // Steps 1–3 — run each credibility layer.
  const linguistic = analyzeLinguistic(postData, lang);
  const heuristic = analyzeSource(postData, lang);
  const external = analyzeExternal(postData, lang);

  // Step 4 — aggregate into a single risk reading.
  const { riskScore, riskLevel } = aggregate([
    ...linguistic.signals,
    ...heuristic.signals,
    ...external.signals,
  ]);

  return {
    riskScore,
    riskLevel,
    readout: buildReadout(riskLevel, lang),
    linguistic: linguistic.module,
    heuristic: heuristic.module,
    external: external.module,
  };
}
