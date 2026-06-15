// TsekaMuna — Content Script
// Injected into every Facebook page. Scans feed posts as they load and
// attaches a credibility panel below each one.

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

// Represents the extracted data from a single Facebook post.
// This is the raw input that will be passed to the analysis modules later.
interface PostData {
  author: string;
  text: string;      // full post text, emojis included
  links: string[];   // all external URLs found in the post
  timestamp: string; // relative time string shown to the user (e.g. "3h", "1d")
}

// ---------------------------------------------------------------------------
// TEXT EXTRACTION
// ---------------------------------------------------------------------------

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

// Clicks the "See more" button inside a post if present, then waits for
// Facebook's React re-render before resolving. Without the delay, innerText
// still returns the truncated version.
function expandPost(postEl: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const buttons = [
      ...postEl.querySelectorAll<HTMLElement>('div[role="button"]'),
    ];
    const seeMore = buttons.find((el) => el.innerText.trim() === "See more");

    if (seeMore) {
      seeMore.click();
      setTimeout(resolve, 500); // 500ms is enough for React to re-render
    } else {
      resolve();
    }
  });
}

// ---------------------------------------------------------------------------
// DATA EXTRACTION
// ---------------------------------------------------------------------------

// Collects author, full text, external links, and timestamp from a post element.
// Expands truncated posts first so the full text is always captured.
async function extractPostData(postEl: HTMLElement): Promise<PostData> {
  await expandPost(postEl);

  const msgEl = postEl.querySelector<HTMLElement>("[data-ad-preview='message']");
  const text = msgEl ? extractText(msgEl) : "";

  const author =
    postEl
      .querySelector<HTMLElement>("[data-ad-rendering-role='profile_name']")
      ?.innerText?.trim() ?? "";

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

  return { author, text, links, timestamp };
}

// ---------------------------------------------------------------------------
// UI INJECTION
// ---------------------------------------------------------------------------

// Escapes HTML special characters so post text can be safely inserted into
// innerHTML without being interpreted as markup.
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Builds the TsekaMuna credibility panel and appends it inside the post card.
// The panel is a placeholder — risk scores and signal breakdowns will be
// filled in once the analysis modules are connected.
function injectPanel(postEl: HTMLElement, postData: PostData): void {
  // Prevent duplicate panels if processPost is called twice on the same post
  if (postEl.querySelector(".tsekamuna-panel")) return;

  const preview =
    postData.text.length > 120
      ? escapeHtml(postData.text.slice(0, 120)) + "…"
      : escapeHtml(postData.text);

  const panel = document.createElement("div");

  // tsekamuna-panel is a custom marker class used for duplicate detection.
  // All visual styling is done with Tailwind utility classes.
  panel.className = [
    "tsekamuna-panel",
    "p-3 border-t font-sans text-sm mt-1 rounded-md",
    // light mode
    "border-gray-200 bg-gray-50 text-gray-700",
    // dark mode — follows OS prefers-color-scheme
    "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
  ].join(" ");

  panel.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-blue-500 dark:text-blue-400 font-semibold text-sm">🔍 TsekaMuna</span>
      <span class="text-xs font-semibold px-2 py-0.5 rounded-full
                  bg-blue-100 text-blue-700
                  dark:bg-blue-900 dark:text-blue-300">
        Analyzing…
      </span>
    </div>
    <div>
      <p class="text-gray-500 dark:text-gray-400 text-xs mb-1">
        Post by <strong class="text-gray-700 dark:text-gray-200">${escapeHtml(postData.author)}</strong>
        ${postData.timestamp ? `<span class="text-gray-400 dark:text-gray-500">· ${escapeHtml(postData.timestamp)}</span>` : ""}
      </p>
      <p class="text-gray-400 dark:text-gray-500 italic text-xs">${preview}</p>
    </div>
  `;

  // Append below all existing post content without disrupting Facebook's layout
  postEl.appendChild(panel);
}

// ---------------------------------------------------------------------------
// POST PROCESSING
// ---------------------------------------------------------------------------

// Full pipeline for a single post: skip guards → extract data → inject panel.
async function processPost(postEl: HTMLElement): Promise<void> {
  // Facebook marks off-screen posts as virtualized — they have a placeholder
  // height but no rendered content yet, so there is nothing to extract.
  if (postEl.getAttribute("data-virtualized") === "true") return;

  // Skip posts that already have a panel attached
  if (postEl.querySelector(".tsekamuna-panel")) return;

  const postData = await extractPostData(postEl);

  // Only inject for posts with readable text — avoids noise on pure image or
  // video posts that have no text content to analyze.
  if (!postData.text) return;

  injectPanel(postEl, postData);

  // TODO: pass postData to analysis modules (linguistic, heuristic, external
  // verification) and update the panel badge with the resulting risk score.
  console.log("[TsekaMuna] Post processed:", postData);
}

// ---------------------------------------------------------------------------
// FEED OBSERVER
// ---------------------------------------------------------------------------

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
      node
        .querySelectorAll<HTMLElement>("[aria-posinset]")
        .forEach(processPost);
    }
  }
});

// subtree: true  — watch all descendants, not just direct children
// childList: true — fire when nodes are added or removed
observer.observe(document.body, { childList: true, subtree: true });

// Process posts already in the DOM when the script first loads — the observer
// only catches future additions, not what is already rendered on the page.
document.querySelectorAll<HTMLElement>("[aria-posinset]").forEach(processPost);
