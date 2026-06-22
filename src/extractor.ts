// Pulls raw data (author, text, links, timestamp) out of a Facebook post DOM
// element. Handles Facebook's "See more" truncation and emoji-as-image quirk.

import type { PostData } from "./types";

// Extracts the full visible text of a post element, emojis included.
// Facebook renders emojis as <img alt="🙂"> tags, so innerText alone drops
// them. We clone the element to avoid mutating the live DOM, swap each emoji
// image for its alt character, then read the text.
function extractText(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement;

  clone.querySelectorAll<HTMLImageElement>("img[alt]").forEach((img) => {
    img.replaceWith(img.alt);
  });

  return clone.innerText.replace(/See less$/i, "").trim();
}

// Reads the profile name container and returns a cleaned-up author name plus
// the verified-badge flag.
//
// Facebook appends a "· Follow" suffix on the profile name of algorithmically
// suggested posts (posts from pages the user doesn't follow). We strip that
// so the name displayed in the panel stays clean.
//
// The verified badge is rendered as an SVG with an aria-label containing the
// word "verified" — we detect any element with that pattern inside the
// profile name container.
function extractAuthor(postEl: HTMLElement): { author: string; verified: boolean } {
  const profileEl = postEl.querySelector<HTMLElement>("[data-ad-rendering-role='profile_name']");
  if (!profileEl) return { author: "", verified: false };

  const raw = profileEl.innerText?.trim() ?? "";
  // Strip suffixes like " · Follow", "· Follow", "• Follow", " Follow"
  const author = raw.replace(/\s*[·•]?\s*Follow\s*$/i, "").trim();

  const verified = !!profileEl.querySelector('[aria-label*="erified" i]');

  return { author, verified };
}

// Clicks the "See more" button inside a post if present, then waits for
// Facebook's React re-render before resolving. Without the delay, innerText
// still returns the truncated version.
function expandPost(postEl: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const buttons = [...postEl.querySelectorAll<HTMLElement>('div[role="button"]')];
    const seeMore = buttons.find((el) => el.innerText.trim() === "See more");

    if (seeMore) {
      seeMore.click();
      setTimeout(resolve, 500); // 500ms is enough for React to re-render
    } else {
      resolve();
    }
  });
}

// Collects author, full text, external links, and timestamp from a post element.
// Expands truncated posts first so the full text is always captured.
export async function extractPostData(postEl: HTMLElement): Promise<PostData> {
  await expandPost(postEl);

  const msgEl = postEl.querySelector<HTMLElement>("[data-ad-preview='message']");
  const text = msgEl ? extractText(msgEl) : "";

  const { author, verified } = extractAuthor(postEl);

  // All http/https links inside the post. Many will be Facebook redirect URLs
  // (l.facebook.com/l.php?u=...) wrapping the actual destination.
  const links = [
    ...postEl.querySelectorAll<HTMLAnchorElement>("a[href^='http']"),
  ].map((a) => a.href);

  // Relative timestamp visible to the user (e.g. "3h"). Facebook hides the
  // absolute datetime inside obfuscated attributes, so we take what's visible.
  const timestamp =
    postEl
      .querySelector<HTMLElement>("a[href*='?__cft__'] span")
      ?.innerText?.trim() ?? "";

  return { author, verified, text, links, timestamp };
}
