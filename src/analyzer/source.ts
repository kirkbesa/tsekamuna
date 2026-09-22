// Step 2 — Source & Metadata (4 signals, rule-based).
//   missing linked source, domain classification, author verified, author classification

import type { Lang } from "../lang";
import type { PostData } from "../types";
import { buildModule } from "./aggregate";
import { NOT_RISKY, type Layer, type Signal } from "./types";

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

export function analyzeSource(postData: PostData, _lang: Lang): Layer {
  const signals = [
    detectMissingLinkedSource(postData.links),
    classifyDomain(postData.links),
    checkAuthorVerified(postData.verified),
    classifyAuthor(postData.author),
  ];
  return { signals, module: buildModule(signals) };
}
