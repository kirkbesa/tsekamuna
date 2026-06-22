// Shared type definitions used across extraction, analysis, and UI layers.

// Raw data extracted from a Facebook post DOM element.
export interface PostData {
  author: string;    // display name with the "· Follow" suffix stripped
  verified: boolean; // true if Facebook shows a verified badge next to the name
  text: string;      // full post text, emojis included
  links: string[];   // all external URLs found in the post
  timestamp: string; // relative time shown to the user (e.g. "3h", "1d")
}

// Possible verdicts for a single analysis module.
// "safe"     — no concerns detected
// "warning"  — mild concern, not necessarily misleading
// "risk"     — strong indicator of low credibility
// "pending"  — analysis still running (placeholder while wiring up modules)
export type ModuleStatus = "safe" | "warning" | "risk" | "pending";

// Output of a single analysis module (linguistic, heuristic, or external).
export interface ModuleResult {
  status: ModuleStatus;
  summary: string;     // short verdict on the card (e.g. "Emotional language detected")
  details: string[];   // bullet points shown inside the modal
}

// Possible levels for the aggregated risk score.
export type RiskLevel = "low" | "medium" | "high";

// Combined output across all modules + the aggregated risk score.
export interface AnalysisResult {
  riskScore: number;          // 0-100, higher = riskier
  riskLevel: RiskLevel;
  linguistic: ModuleResult;
  heuristic: ModuleResult;
  external: ModuleResult;
}

// Keys identifying each analysis module — used to look up results in
// AnalysisResult and to wire data attributes on module card buttons.
export type ModuleKey = "linguistic" | "heuristic" | "external";
