// Step 3 — External Verification (1 signal).
//
// Fallback chain: query Google Fact Check first, fall back to AI-assisted
// retrieval when there is no match.
//
// NOTE: both are network calls — implementing this will make analyzePost async
// (or require a follow-up update once results arrive). Calls must run from a
// background service worker with host_permissions, not the content script.

import type { Lang } from "../lang";
import type { PostData } from "../types";
import { NOT_RISKY, type Layer, type Signal } from "./types";

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

export function analyzeExternal(postData: PostData, _lang: Lang): Layer {
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
