// Static brand-voice placeholder data for the credibility card.
//
// Placeholder content now reflects the actual analysis parameters defined in
// Chapter 3 of the thesis (see BRANDING.md context + Appendix B prompts):
//
//   Layer 1 — Linguistic (9 signals):
//     rule-based:  all-caps usage, all-caps headline, exclamation marks, emoji overuse
//     AI-assisted: emotional language, clickbait pattern, implied urgency,
//                  vague attribution, writing complexity
//
//   Layer 2 — Source & Metadata (rule-based):
//     missing linked source, domain classification, author verified status,
//     author classification
//
//   Layer 3 — External Verification (fallback chain):
//     primary:  Google Fact Check Tools API
//     fallback: AI-assisted source retrieval (Gemini Flash + search grounding)
//
// Risk classification thresholds (thesis §A.b.iv):
//   Low: 0-4 risky parameters · Medium: 5-9 · High: 10-14
//
// TODO(data): replace this whole module with real analyzer output once the
// pipeline lands. The AnalysisResult shape here is what panel/modal consume;
// keep the shape stable and swap the source.

import type { AnalysisResult, RiskLevel } from "./types";

export const PLACEHOLDERS: Record<RiskLevel, AnalysisResult> = {
  clear: {
    riskScore: 14, // ~2 risky params out of 14 → Low
    riskLevel: "clear",
    readout: "Mukhang okay. Walang nakitang red flags sa post na ito.",
    linguistic: {
      status: "clear",
      summary: "Mahinahon ang pananalita",
      verdict:
        "Walang nakitang senyales ng manipulasyon sa pananalita ng post na ito.",
      details: [
        "Walang emosyonal na pananalita (fear/anger/urgency).",
        "Walang clickbait pattern.",
        "All-caps usage: mababa (0%).",
        "Walang all-caps headline.",
        "Exclamation marks: 0.",
        "Walang labis na emoji.",
        "Walang implied urgency.",
        "May tiyak na attribution.",
        "Writing complexity: medium.",
      ],
    },
    heuristic: {
      status: "clear",
      summary: "Verified na pinagmulan",
      verdict:
        "Kumpleto ang impormasyon tungkol sa pinagmulan ng post na ito.",
      details: [
        "May linked source sa caption.",
        "Domain classification: verified (kilalang news outlet).",
        "Author: verified badge (Facebook).",
        "Author classification: News Organization.",
      ],
    },
    external: {
      status: "clear",
      summary: "Tugma sa fact-check",
      verdict:
        "Nakita namin ang impormasyong ito sa mga kilalang verification sources.",
      details: [
        "Google Fact Check: nakatugma sa 1 published verdict.",
        "Trusted sources: 2 (Rappler, ABS-CBN) — supports.",
        "Walang nakitang contradicting source.",
      ],
    },
  },

  caution: {
    riskScore: 43, // ~6 risky params out of 14 → Medium
    riskLevel: "caution",
    readout: "May ilang dahilan para mag-isip muna. Tingnan ang mga detalye.",
    linguistic: {
      status: "caution",
      summary: "May ilang senyales sa pananalita",
      verdict: "May ilang linguistic signals na pwedeng tingnan muna.",
      details: [
        "Emotional language: nadetect (urgency).",
        "Clickbait pattern: walang nadetect.",
        "All-caps usage: 8% (bahagyang mataas).",
        "Walang all-caps headline.",
        "Exclamation marks: 3 (bahagyang marami).",
        "Emoji overuse: walang nadetect.",
        "Walang implied urgency.",
        "May tiyak na attribution.",
        "Writing complexity: medium.",
      ],
    },
    heuristic: {
      status: "caution",
      summary: "Hindi kumpleto ang metadata",
      verdict:
        "May ilang bagay sa pinagmulan na hindi kumpleto — pwedeng tingnan muna.",
      details: [
        "May linked source sa caption.",
        "Domain classification: unknown (hindi sa curated list).",
        "Author: walang verified badge.",
        "Author classification: Personal Account.",
      ],
    },
    external: {
      status: "pending",
      summary: "Tinitingnan…",
      verdict: "Hinahanap pa namin ang ibang sources para sa post na ito.",
      details: [
        "Google Fact Check: patuloy na paghahanap.",
        "AI-assisted source retrieval: pending.",
      ],
    },
  },

  high: {
    riskScore: 79, // ~11 risky params out of 14 → High
    riskLevel: "high",
    readout:
      "Mag-ingat — maraming senyales dito. Tingnan ang mga detalye bago mag-share.",
    linguistic: {
      status: "high",
      summary: "Emosyonal, all-caps, clickbait",
      verdict:
        "Ginagamit ng post na ito ang maraming pattern na karaniwan sa misleading content.",
      details: [
        "Emotional language: nadetect (fear).",
        "Clickbait pattern: sensational claim (\"SHOCKING\", \"tanggalin ng doktor\").",
        "All-caps usage: 24% (mataas).",
        "All-caps headline: opo (\"SHOCKING!!\").",
        "Exclamation marks: 6 (labis).",
        "Emoji overuse: walang nadetect.",
        "Implied urgency: opo (\"bago tanggalin\").",
        "Vague attribution: opo (\"daw ng mga doktor\").",
        "Writing complexity: low.",
      ],
    },
    heuristic: {
      status: "high",
      summary: "Walang author, walang source",
      verdict: "Walang malinaw na pinagmulan ang post na ito.",
      details: [
        "Walang linked source sa caption.",
        "Domain classification: N/A (walang link).",
        "Author: walang verified badge.",
        "Author classification: Unknown.",
      ],
    },
    external: {
      status: "pending",
      summary: "Tinitingnan…",
      verdict: "Hinahanap pa namin ang ibang sources para sa post na ito.",
      details: [
        "Google Fact Check: patuloy na paghahanap.",
        "AI-assisted source retrieval: pending.",
      ],
    },
  },

  unverified: {
    riskScore: 0,
    riskLevel: "unverified",
    readout:
      "Wala kaming nahanap na pag-verify dito — hindi ibig sabihin mali, pero wala pang nakumpirma.",
    linguistic: {
      status: "clear",
      summary: "Mahinahon ang pananalita",
      verdict: "Walang nakitang linguistic manipulation sa post na ito.",
      details: [
        "Walang emosyonal na pananalita.",
        "Walang clickbait pattern.",
        "All-caps usage: mababa.",
        "Writing complexity: medium.",
      ],
    },
    heuristic: {
      status: "caution",
      summary: "Bahagyang kumpleto ang metadata",
      verdict:
        "May ilang metadata na hindi kumpleto pero walang malinaw na red flag.",
      details: [
        "Walang linked source sa caption.",
        "Author: walang verified badge.",
        "Author classification: Personal Account.",
      ],
    },
    external: {
      status: "unverified",
      summary: "Walang fact-check na nahanap",
      verdict:
        "Wala kaming nahanap na fact-check o kilalang source para sa post na ito.",
      details: [
        "Google Fact Check: walang match sa database.",
        "AI-assisted source retrieval: no_matches_found.",
        "Ibig sabihin: hindi kumpirmado — hindi ibig sabihin mali.",
      ],
    },
  },
};

// Stable string hash → non-negative integer. Used to deterministically pick a
// placeholder verdict from the post text so a fresh feed shows all four states
// for visual review (see analyzer.ts → analyzePost).
export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const STATES: RiskLevel[] = ["clear", "caution", "high", "unverified"];

export function placeholderFor(text: string): AnalysisResult {
  const state = STATES[hashString(text) % STATES.length];
  return PLACEHOLDERS[state];
}
