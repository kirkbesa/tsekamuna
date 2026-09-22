// TsekaMuna — Content Script entry point.
// Bootstraps the feed observer that processes each Facebook post as it loads.

import { analyzePost, classifyHealthContent } from "./analyzer";
import { extractPostData } from "./extractor";
import { getLang } from "./lang";
import { createLimiter } from "./limit";
import type { PostData } from "./types";
import { injectPanel } from "./ui/panel";

// Cap how many health classifications hit Gemini at once so fast scrolling
// doesn't fire a burst of API calls.
const classifyLimit = createLimiter(4);

// Cache the classification per post text (stores the in-flight promise, so two
// posts with identical text share a single API call).
const healthCache = new Map<string, Promise<boolean>>();

function isHealthPost(postData: PostData): Promise<boolean> {
  let pending = healthCache.get(postData.text);
  if (!pending) {
    pending = classifyLimit(() => classifyHealthContent(postData));
    healthCache.set(postData.text, pending);
  }
  return pending;
}

// Runs the full pipeline for a single post: skip guards → extract data
// → health gate → run analysis → inject the credibility panel.
async function processPost(postEl: HTMLElement): Promise<void> {
  // Facebook marks off-screen posts as virtualized — they have a placeholder
  // height but no rendered content yet, so there is nothing to extract.
  if (postEl.getAttribute("data-virtualized") === "true") return;

  // Skip posts that already have a panel attached (prevents duplicates on
  // re-observation, e.g. when Facebook re-renders a post in place).
  if (postEl.querySelector(".tm-card")) return;

  const postData = await extractPostData(postEl);

  // Skip posts with no readable text — avoids noise on pure image/video posts
  // and on posts that contain only an emoji or sticker.
  if (!postData.text) return;

  // Classify each post once, even non-health ones (which never get a .tm-card),
  // so the observer doesn't re-trigger a Gemini call on every feed mutation.
  if (postEl.dataset.tmSeen) return;
  postEl.dataset.tmSeen = "1";

  // Scope the extension to health content: non-health posts get no panel.
  if (!(await isHealthPost(postData))) return;

  const analysis = analyzePost(postData, getLang());
  injectPanel(postEl, postData, analysis);

  console.log("[TsekaMuna] Post processed:", { postData, analysis });
}

// Facebook is a single-page app — posts are added to the DOM dynamically as
// the user scrolls. MutationObserver fires whenever new nodes appear so we
// can process them without polling.
const observer = new MutationObserver((mutations: MutationRecord[]) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;

      // The added node itself might be a post
      if (node.matches("[aria-posinset]")) {
        processPost(node);
      }

      // Or a container holding multiple posts added in one mutation batch
      // (e.g. during initial feed load)
      node.querySelectorAll<HTMLElement>("[aria-posinset]").forEach(processPost);
    }
  }
});

// subtree: true  — watch all descendants, not just direct children
// childList: true — fire when nodes are added or removed
observer.observe(document.body, { childList: true, subtree: true });

// Process posts already in the DOM when this script first loads — the
// observer only catches future additions, not what is already rendered.
document.querySelectorAll<HTMLElement>("[aria-posinset]").forEach(processPost);
