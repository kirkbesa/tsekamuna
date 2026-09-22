// Analysis pipeline — turns PostData into a single AnalysisResult.
//
// Each pipeline step lives in its own file so parameters can be implemented one
// at a time:
//   health.ts      — Step 0: health content gate
//   linguistic.ts  — Step 1: 9 linguistic signals
//   source.ts      — Step 2: 4 source & metadata signals
//   external.ts    — Step 3: fact-check + AI-assisted retrieval
//   aggregate.ts   — Step 4: signals → risk score + module results
//   types.ts       — shared internal types (Signal, Layer)
//
// 14 parameters total (9 linguistic + 4 source + 1 external). Nothing does real
// detection yet — see the TODOs in each step.
//
// Risk thresholds (thesis §A.b.iv): Low 0–4 · Medium 5–9 · High 10–14 risky params.

import type { Lang } from "../lang";
import type { AnalysisResult, PostData } from "../types";
import { aggregate, buildReadout } from "./aggregate";
import { analyzeExternal } from "./external";
import { analyzeLinguistic } from "./linguistic";
import { analyzeSource } from "./source";

// Step 0 — the health-content gate. Re-exported so the content script can scope
// the extension (skip non-health posts) BEFORE running the pipeline below.
export { classifyHealthContent } from "./health";

export function analyzePost(postData: PostData, lang: Lang): AnalysisResult {
  // By the time we get here the caller has already confirmed the post is
  // health-related (see classifyHealthContent).

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
