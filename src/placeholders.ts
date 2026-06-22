// Static brand-voice placeholder data for the credibility card.
// Replaces the literal "TODO:" strings that used to render inside the panel.
//
// TODO(data): replace these fixtures with real analysis pipeline output once
// the linguistic / heuristic / external modules are implemented. The
// AnalysisResult shape produced here is exactly what the UI consumes — wire
// the real analyzer to match.

import type { AnalysisResult, RiskLevel } from "./types";

// One fully fleshed-out fixture per verdict state. The panel cycles through
// these deterministically by post hash so all four states are reachable in a
// single feed for review (see content.ts → placeholderFor).
export const PLACEHOLDERS: Record<RiskLevel, AnalysisResult> = {
  clear: {
    riskScore: 18,
    riskLevel: "clear",
    readout: "Mukhang okay. Walang nakitang red flags.",
    linguistic: {
      status: "clear",
      summary: "Walang emosyonal na pananalita",
      verdict: "Walang nakitang senyales ng manipulasyon sa pananalita ng post na ito.",
      details: [
        "Walang pang-akit na headline o all-caps.",
        "Walang labis na exclamation marks.",
        "Mahinahon ang tono ng pagkasulat.",
      ],
    },
    heuristic: {
      status: "clear",
      summary: "May pangalan ng author",
      verdict: "May malinaw na pinagmulan ang post na ito.",
      details: [
        "May pangalan ng may-akda o byline.",
        "Galing sa kilalang domain.",
        "May petsa ng paglathala.",
      ],
    },
    external: {
      status: "clear",
      summary: "Tugma sa kilalang source",
      verdict: "Nakita namin ang impormasyong ito sa mga kilalang news source.",
      details: [
        "Tugma sa 2 kilalang news outlet.",
        "Walang fact-check warning sa post na ito.",
      ],
    },
  },

  caution: {
    riskScore: 52,
    riskLevel: "caution",
    readout: "May ilang dahilan para mag-isip muna. Tingnan ang mga detalye.",
    linguistic: {
      status: "caution",
      summary: "Medyo emosyonal ang tono",
      verdict: "May ilang senyales sa pananalita na pwedeng tingnan muna.",
      details: [
        "May ilang emosyonal na salita.",
        "Mas mahaba ang headline kaysa karaniwan.",
      ],
    },
    heuristic: {
      status: "caution",
      summary: "Walang petsa",
      verdict: "Hindi kumpleto ang impormasyon tungkol sa pinagmulan.",
      details: [
        "Walang malinaw na petsa ng paglathala.",
        "Hindi malinaw kung sino ang may-akda.",
      ],
    },
    external: {
      status: "pending",
      summary: "Tinitingnan…",
      verdict: "Hinahanap pa namin ang ibang sources para sa post na ito.",
      details: ["Patuloy ang paghahanap sa fact-check databases."],
    },
  },

  high: {
    riskScore: 74,
    riskLevel: "high",
    readout: "Mag-ingat — maraming senyales dito. Tingnan ang mga detalye bago mag-share.",
    linguistic: {
      status: "high",
      summary: "Emosyonal, all-caps",
      verdict: "May maraming senyales na ginagamit ang post para mag-akit ng emosyon.",
      details: [
        "Ginagamit ang all-caps sa headline.",
        "Maraming exclamation marks.",
        "May clickbait pattern (\"SHOCKING\", \"i-share niyo na\").",
      ],
    },
    heuristic: {
      status: "high",
      summary: "Walang author",
      verdict: "Walang malinaw na pinagmulan ang post na ito.",
      details: [
        "Walang pangalan ng may-akda o byline.",
        "Link papunta sa hindi pamilyar na site.",
        "Walang petsa ng paglathala.",
      ],
    },
    external: {
      status: "pending",
      summary: "Tinitingnan…",
      verdict: "Hinahanap pa namin ang ibang sources para sa post na ito.",
      details: ["Patuloy ang paghahanap sa fact-check databases."],
    },
  },

  unverified: {
    riskScore: 0,
    riskLevel: "unverified",
    readout:
      "Wala kaming nahanap na pag-verify dito — hindi ibig sabihin mali, pero wala pang nakumpirma.",
    linguistic: {
      status: "clear",
      summary: "Walang emosyonal na tono",
      verdict: "Mahinahon ang pananalita ng post na ito.",
      details: ["Walang nakitang manipulasyon sa pananalita."],
    },
    heuristic: {
      status: "caution",
      summary: "Walang byline",
      verdict: "Hindi kumpleto ang pinagmulan.",
      details: [
        "Walang malinaw na may-akda.",
        "Hindi kilalang domain.",
      ],
    },
    external: {
      status: "unverified",
      summary: "Walang nahanap",
      verdict:
        "Wala kaming nahanap na fact-check o kilalang source para sa post na ito.",
      details: [
        "Hindi makita sa kilalang news outlets.",
        "Walang nakatugmang fact-check.",
      ],
    },
  },
};

// Stable hash of a string → small non-negative integer. Used to deterministically
// pick a placeholder verdict from the post text so a fresh feed shows all four
// states for visual review.
export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const STATES: RiskLevel[] = ["clear", "caution", "high", "unverified"];

// Returns the placeholder AnalysisResult for a given post text.
// TODO(data): replace with `analyzePost(postData)` once the pipeline ships.
export function placeholderFor(text: string): AnalysisResult {
  const state = STATES[hashString(text) % STATES.length];
  return PLACEHOLDERS[state];
}
