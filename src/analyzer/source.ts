// Step 2 — Source & Metadata (4 signals, rule-based).
//   missing linked source, domain classification, author verified, author classification
//
// All four are implemented. Each emits a bilingual `detail` line for the popover.

import type { Lang } from "../lang";
import type { PostData } from "../types";
import { buildModule } from "./aggregate";
import { CREDIBLE_DOMAINS, NEWS_ORG_KEYWORDS } from "./source-data";
import { type Layer, type Signal } from "./types";

// Facebook's own hosts — links to these are internal navigation, not sources.
const FB_HOSTS = ["facebook.com", "fb.com", "fb.watch", "messenger.com"];

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function isFacebookHost(host: string): boolean {
  return FB_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

// Facebook wraps outbound links as l.facebook.com/l.php?u=<encoded real url>.
// Unwrap to the real destination so we classify the right domain.
function unwrap(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("facebook.com") && u.pathname === "/l.php") {
      return u.searchParams.get("u") ?? url;
    }
  } catch {
    /* fall through */
  }
  return url;
}

// Distinct external (non-Facebook) destination hostnames found in the post.
function externalHosts(links: string[]): string[] {
  const hosts = new Set<string>();
  for (const link of links) {
    const host = hostnameOf(unwrap(link));
    if (host && !isFacebookHost(host)) hosts.add(host);
  }
  return [...hosts];
}

function isCredible(host: string): boolean {
  return CREDIBLE_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}

// ── Signals ──────────────────────────────────────────────────────────────────

// Flag a post that links to no external source at all.
function detectMissingLinkedSource(links: string[], lang: Lang): Signal {
  const hosts = externalHosts(links);
  if (hosts.length === 0) {
    return {
      risky: true,
      detail: lang === "fil" ? "Walang naka-link na source." : "No linked source.",
    };
  }
  const label = lang === "fil" ? "May naka-link na source" : "Linked source";
  return { risky: false, detail: `${label}: ${hosts[0]}` };
}

// Classify the linked domain(s): credible → good, otherwise → unverified.
function classifyDomain(links: string[], lang: Lang): Signal {
  const hosts = externalHosts(links);
  if (hosts.length === 0) return { risky: false, detail: "" }; // nothing to classify

  const credible = hosts.filter(isCredible);
  if (credible.length > 0) {
    const label = lang === "fil" ? "Kilalang source" : "Credible source";
    return { risky: false, detail: `${label}: ${credible.join(", ")}` };
  }
  const label = lang === "fil" ? "Hindi kilalang source" : "Unverified source";
  return { risky: true, detail: `${label}: ${hosts.join(", ")}` };
}

// Turn the verified badge into a signal.
function checkAuthorVerified(verified: boolean, lang: Lang): Signal {
  if (verified) {
    return {
      risky: false,
      detail: lang === "fil" ? "May verified badge." : "Verified badge.",
    };
  }
  return {
    risky: true,
    detail: lang === "fil" ? "Walang verified badge." : "No verified badge.",
  };
}

// Classify the author using the display name plus the DOM cues extracted from
// the post (verified badge, "Follow" suggested-Page hint, profile URL shape).
// Precedence: recognized org / verified → clean; suggested Page → unverified
// Page; profile.php?id= or no cues → personal / unknown.
function classifyAuthor(postData: PostData, lang: Lang): Signal {
  const name = postData.author.trim();
  if (!name) {
    return {
      risky: true,
      detail: lang === "fil" ? "Author: hindi kilala." : "Author: unknown.",
    };
  }

  const isOrgName = NEWS_ORG_KEYWORDS.some((k) => name.toLowerCase().includes(k));
  const isPersonalUrl = /\/profile\.php\?id=/.test(postData.authorUrl);

  if (isOrgName) {
    return {
      risky: false,
      detail: lang === "fil" ? "Author: News Organization." : "Author: News Organization.",
    };
  }
  // Verified and not a personal profile → treat as a credible page / public figure.
  if (postData.verified && !isPersonalUrl) {
    return {
      risky: false,
      detail: lang === "fil" ? "Author: verified na page." : "Author: verified page.",
    };
  }
  // Suggested Page the user doesn't follow, but not recognized/verified.
  if (postData.authorFollowCue && !isPersonalUrl) {
    return {
      risky: true,
      detail: lang === "fil" ? "Author: Page (hindi verified)." : "Author: Page (unverified).",
    };
  }
  return {
    risky: true,
    detail: lang === "fil" ? "Author: personal / hindi kilala." : "Author: personal / unknown.",
  };
}

export function analyzeSource(postData: PostData, lang: Lang): Layer {
  const signals = [
    detectMissingLinkedSource(postData.links, lang),
    classifyDomain(postData.links, lang),
    checkAuthorVerified(postData.verified, lang),
    classifyAuthor(postData, lang),
  ];
  return { signals, module: buildModule(signals) };
}
