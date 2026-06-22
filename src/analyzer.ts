// Analysis pipeline that turns PostData into AnalysisResult.
// Each module returns a verdict + summary + details that the UI consumes.
//
// Currently a stub returning hard-coded "pending" results — replace each
// module's branch with the real implementation:
//   - linguistic → DLSU Fake News Filipino NLP model
//   - heuristic  → DOM/source signal scanner (bylines, domains, URL shape)
//   - external   → fact-check database / web search cross-reference

import type { AnalysisResult, PostData } from "./types";

export function analyzePost(_postData: PostData): AnalysisResult {
  // TODO: wire up real analysis modules
  return {
    riskScore: 0,
    riskLevel: "low",
    linguistic: {
      status: "pending",
      summary: "TODO: linguistic analysis pending",
      details: ["TODO: list detected emotional words, all-caps usage, exclamation patterns, clickbait phrases"],
    },
    heuristic: {
      status: "pending",
      summary: "TODO: heuristic checks pending",
      details: ["TODO: list missing byline, unverified domains, suspicious URL shape, lack of publication date"],
    },
    external: {
      status: "pending",
      summary: "TODO: external verification pending",
      details: ["TODO: list matched fact-checks, related credible source articles, search results"],
    },
  };
}
