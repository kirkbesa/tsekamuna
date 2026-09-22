// Step 0 — Health content classification (preliminary gate).
//
// Scopes the whole extension to health content: only posts that pass this gate
// get a credibility panel. Classification is delegated to Gemini via the
// background service worker (see ../messaging.ts + ../background.ts) — an LLM
// handles Tagalog / English / Taglish far better than a keyword list could.
//
// Cost is controlled by the caller (content.ts): a concurrency limiter caps how
// many classifications run at once, and results are cached per post text so the
// same post is never classified twice.

import { sendClassifyHealth } from "../messaging";
import type { PostData } from "../types";

// Returns true when the post is health-related and should be analyzed.
export async function classifyHealthContent(postData: PostData): Promise<boolean> {
  const text = postData.text.trim();
  if (!text) return false;

  try {
    const res = await sendClassifyHealth(text);
    return res.isHealth === true;
  } catch (err) {
    console.warn("[TsekaMuna] health gate failed:", err);
    return false; // fail closed — no panel when we can't classify
  }
}
