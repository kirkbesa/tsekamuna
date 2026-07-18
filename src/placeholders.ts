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
// keep the shape stable and swap the source. Filipino is the brand-voice
// default; English strings are direct translations kept in lockstep below —
// riskScore/riskLevel/status must stay identical across languages for the
// same state, only display text differs.

import type { Lang } from "./lang";
import type { AnalysisResult, RiskLevel } from "./types";

const PLACEHOLDERS_FIL: Record<RiskLevel, AnalysisResult> = {
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

// English translations — kept in lockstep with PLACEHOLDERS_FIL above.
// Same riskScore/riskLevel/status per state; only display text differs.
const PLACEHOLDERS_EN: Record<RiskLevel, AnalysisResult> = {
  clear: {
    riskScore: 14,
    riskLevel: "clear",
    readout: "Looks okay. No red flags found in this post.",
    linguistic: {
      status: "clear",
      summary: "Calm, measured language",
      verdict: "No signs of linguistic manipulation were found in this post.",
      details: [
        "No emotional language (fear/anger/urgency).",
        "No clickbait pattern.",
        "All-caps usage: low (0%).",
        "No all-caps headline.",
        "Exclamation marks: 0.",
        "No excessive emoji use.",
        "No implied urgency.",
        "Has clear attribution.",
        "Writing complexity: medium.",
      ],
    },
    heuristic: {
      status: "clear",
      summary: "Verified source",
      verdict: "This post's source information is complete.",
      details: [
        "Has a linked source in the caption.",
        "Domain classification: verified (known news outlet).",
        "Author: verified badge (Facebook).",
        "Author classification: News Organization.",
      ],
    },
    external: {
      status: "clear",
      summary: "Matches a fact-check",
      verdict: "We found this information in known verification sources.",
      details: [
        "Google Fact Check: matches 1 published verdict.",
        "Trusted sources: 2 (Rappler, ABS-CBN) — supports.",
        "No contradicting source found.",
      ],
    },
  },

  caution: {
    riskScore: 43,
    riskLevel: "caution",
    readout: "There are a few reasons to think twice. Check the details.",
    linguistic: {
      status: "caution",
      summary: "A few signals in the language",
      verdict: "There are a few linguistic signals worth a second look.",
      details: [
        "Emotional language: detected (urgency).",
        "Clickbait pattern: none detected.",
        "All-caps usage: 8% (slightly high).",
        "No all-caps headline.",
        "Exclamation marks: 3 (slightly excessive).",
        "Emoji overuse: none detected.",
        "No implied urgency.",
        "Has clear attribution.",
        "Writing complexity: medium.",
      ],
    },
    heuristic: {
      status: "caution",
      summary: "Incomplete metadata",
      verdict: "Some source details are incomplete — worth a second look.",
      details: [
        "Has a linked source in the caption.",
        "Domain classification: unknown (not on the curated list).",
        "Author: no verified badge.",
        "Author classification: Personal Account.",
      ],
    },
    external: {
      status: "pending",
      summary: "Checking…",
      verdict: "We're still searching other sources for this post.",
      details: [
        "Google Fact Check: search in progress.",
        "AI-assisted source retrieval: pending.",
      ],
    },
  },

  high: {
    riskScore: 79,
    riskLevel: "high",
    readout: "Be careful — there are many signals here. Check the details before sharing.",
    linguistic: {
      status: "high",
      summary: "Emotional, all-caps, clickbait",
      verdict:
        "This post uses many patterns commonly found in misleading content.",
      details: [
        "Emotional language: detected (fear).",
        "Clickbait pattern: sensational claim (\"SHOCKING\", \"doctors want this banned\").",
        "All-caps usage: 24% (high).",
        "All-caps headline: yes (\"SHOCKING!!\").",
        "Exclamation marks: 6 (excessive).",
        "Emoji overuse: none detected.",
        "Implied urgency: yes (\"before it's banned\").",
        "Vague attribution: yes (\"according to doctors, apparently\").",
        "Writing complexity: low.",
      ],
    },
    heuristic: {
      status: "high",
      summary: "No author, no source",
      verdict: "This post has no clear source.",
      details: [
        "No linked source in the caption.",
        "Domain classification: N/A (no link).",
        "Author: no verified badge.",
        "Author classification: Unknown.",
      ],
    },
    external: {
      status: "pending",
      summary: "Checking…",
      verdict: "We're still searching other sources for this post.",
      details: [
        "Google Fact Check: search in progress.",
        "AI-assisted source retrieval: pending.",
      ],
    },
  },

  unverified: {
    riskScore: 0,
    riskLevel: "unverified",
    readout:
      "We didn't find any verification for this — that doesn't mean it's false, but nothing is confirmed yet.",
    linguistic: {
      status: "clear",
      summary: "Calm, measured language",
      verdict: "No linguistic manipulation was found in this post.",
      details: [
        "No emotional language.",
        "No clickbait pattern.",
        "All-caps usage: low.",
        "Writing complexity: medium.",
      ],
    },
    heuristic: {
      status: "caution",
      summary: "Partially complete metadata",
      verdict: "Some metadata is incomplete, but there's no clear red flag.",
      details: [
        "No linked source in the caption.",
        "Author: no verified badge.",
        "Author classification: Personal Account.",
      ],
    },
    external: {
      status: "unverified",
      summary: "No fact-check found",
      verdict: "We found no fact-check or known source for this post.",
      details: [
        "Google Fact Check: no match in the database.",
        "AI-assisted source retrieval: no_matches_found.",
        "In other words: unconfirmed — not the same as false.",
      ],
    },
  },
};

export const PLACEHOLDERS: Record<Lang, Record<RiskLevel, AnalysisResult>> = {
  fil: PLACEHOLDERS_FIL,
  en: PLACEHOLDERS_EN,
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

export function placeholderFor(text: string, lang: Lang): AnalysisResult {
  const state = STATES[hashString(text) % STATES.length];
  return PLACEHOLDERS[lang][state];
}
