// Shared type definitions used across extraction, analysis, and UI layers.

// Raw data extracted from a Facebook post DOM element.
export interface PostData {
  author: string;    // display name with the "· Follow" suffix stripped
  verified: boolean; // true if Facebook shows a verified badge next to the name
  text: string;      // full post text, emojis included
  links: string[];   // all external URLs found in the post
  timestamp: string; // relative time shown to the user (e.g. "3h", "1d")
}

// Module-level status — drives icon + color of the status indicator.
// "clear"      — no concerns detected
// "caution"    — mild concern, worth a look
// "high"       — strong indicator of low credibility
// "unverified" — no fact-check / cross-reference found (NOT "false")
// "pending"    — analysis still running (scanning spinner)
export type ModuleStatus = "clear" | "caution" | "high" | "unverified" | "pending";

// Output of a single analysis module (linguistic, heuristic, or external).
export interface ModuleResult {
  status: ModuleStatus;
  summary: string;     // short verdict on the card (e.g. "Emosyonal, all-caps")
  verdict: string;     // plain-language verdict for the popover header
  details: string[];   // bullet points shown inside the popover
}

// Aggregated risk level used by the verdict pill and the credibility reading.
// "unverified" is its own state — never style it as "high". The research
// requires this distinction.
export type RiskLevel = "clear" | "caution" | "high" | "unverified";

// Combined output across all modules + the aggregated risk score.
export interface AnalysisResult {
  riskScore: number;          // 0-100, higher = riskier
  riskLevel: RiskLevel;
  readout: string;            // one-line plain-language summary under the meter
  linguistic: ModuleResult;
  heuristic: ModuleResult;
  external: ModuleResult;
}

// Keys identifying each analysis module — used to look up results in
// AnalysisResult and to wire data attributes on module card buttons.
export type ModuleKey = "linguistic" | "heuristic" | "external";
