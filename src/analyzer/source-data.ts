// Reference data for the Step 2 source & metadata signals (see source.ts).
// Edit these lists to tune what counts as a credible source / news organization.

// Domains treated as credible: health authorities, reputable PH + international
// news, and fact-checkers. A link to any of these (or a subdomain) is a positive
// credibility signal. Everything else is treated as "unverified" — we do NOT
// maintain a hardcoded "fake news" blocklist (that invites defamation issues and
// goes stale); absence from this allowlist just means "not vouched for".
export const CREDIBLE_DOMAINS: string[] = [
  // ── Health authorities & medical references ──
  "who.int", "cdc.gov", "nih.gov", "ncbi.nlm.nih.gov", "medlineplus.gov",
  "mayoclinic.org", "hopkinsmedicine.org", "cochrane.org", "healthline.com",
  "webmd.com", "doh.gov.ph", "fda.gov.ph",
  // ── Philippine government ──
  "gov.ph", "pna.gov.ph",
  // ── Philippine news ──
  "rappler.com", "inquirer.net", "philstar.com", "gmanetwork.com",
  "abs-cbn.com", "mb.com.ph", "manilatimes.net", "businessworld.com.ph",
  // ── International news ──
  "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "cnn.com", "nytimes.com",
  // ── Fact-checkers ──
  "verafiles.org", "tsek.ph", "snopes.com", "politifact.com", "factcheck.org",
  "healthfeedback.org",
];

// Lowercase substrings that mark an author as a news / media organization rather
// than a personal account. Matched against the post's author display name.
export const NEWS_ORG_KEYWORDS: string[] = [
  "news", "balita", "tv patrol", "24 oras", "gma", "abs-cbn", "rappler",
  "inquirer", "philstar", "manila bulletin", "manila times", "bombo",
  "radyo", "reuters", "bbc", "cnn", "broadcasting", "network", "media",
  "department of health", "world health organization", "unicef",
];
