// Step 4 — Aggregation. Turns raw signals into the score + per-module results
// the UI consumes. Shared by the linguistic and source steps (buildModule) and
// by the entry point (aggregate, buildReadout).

import type { Lang } from "../lang";
import type { ModuleResult, ModuleStatus, RiskLevel } from "../types";
import type { Signal } from "./types";

// Collapse a step's signals into the ModuleResult shape the UI renders.
export function buildModule(signals: Signal[]): ModuleResult {
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

// Count risky parameters across all steps → overall score + level.
export function aggregate(signals: Signal[]): {
  riskScore: number;
  riskLevel: RiskLevel;
} {
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
export function buildReadout(_level: RiskLevel, _lang: Lang): string {
  return "";
}
