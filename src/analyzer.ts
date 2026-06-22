// Analysis pipeline that turns PostData into AnalysisResult.
//
// Currently a placeholder layer that returns brand-voice fixtures from
// ./placeholders — see TODO(data) comments there for the seam where the real
// modules will plug in.

import { placeholderFor } from "./placeholders";
import type { AnalysisResult, PostData } from "./types";

// TODO(data): replace placeholder with pipeline output.
// Real modules to wire in here:
//   - linguistic → DLSU Fake News Filipino NLP model (Cruz et al., 2019)
//   - heuristic  → DOM/source signal scanner (bylines, domains, URL shape)
//   - external   → fact-check database / web search cross-reference
export function analyzePost(postData: PostData): AnalysisResult {
  return placeholderFor(postData.text);
}
