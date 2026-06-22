// TsekaMuna — Content Script
// Injected into every Facebook page. Scans feed posts as they load and
// attaches a credibility panel below each one. Clicking any module card
// inside the panel opens a global modal with the full details of that module.

import { icon } from "./icons";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

// Raw data extracted from a Facebook post DOM element.
interface PostData {
  author: string;
  text: string;      // full post text, emojis included
  links: string[];   // all external URLs found in the post
  timestamp: string; // relative time shown to the user (e.g. "3h", "1d")
}

// Possible verdicts for a single analysis module.
// "safe"     — no concerns detected
// "warning"  — mild concern, not necessarily misleading
// "risk"     — strong indicator of low credibility
// "pending"  — analysis still running (placeholder while wiring up modules)
type ModuleStatus = "safe" | "warning" | "risk" | "pending";

// Output of a single analysis module (linguistic, heuristic, or external).
interface ModuleResult {
  status: ModuleStatus;
  summary: string;     // short verdict on the card (e.g. "Emotional language detected")
  details: string[];   // bullet points shown inside the modal
}

// Combined output across all modules + the aggregated risk score.
interface AnalysisResult {
  riskScore: number;          // 0-100, higher = riskier
  riskLevel: "low" | "medium" | "high";
  linguistic: ModuleResult;
  heuristic: ModuleResult;
  external: ModuleResult;
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
// Facebook's React re-render before resolving.
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

// ---------------------------------------------------------------------------
// DATA EXTRACTION
// ---------------------------------------------------------------------------

async function extractPostData(postEl: HTMLElement): Promise<PostData> {
  await expandPost(postEl);

  const msgEl = postEl.querySelector<HTMLElement>("[data-ad-preview='message']");
  const text = msgEl ? extractText(msgEl) : "";

  const author =
    postEl
      .querySelector<HTMLElement>("[data-ad-rendering-role='profile_name']")
      ?.innerText?.trim() ?? "";

  const links = [
    ...postEl.querySelectorAll<HTMLAnchorElement>("a[href^='http']"),
  ].map((a) => a.href);

  const timestamp =
    postEl
      .querySelector<HTMLElement>("a[href*='?__cft__'] span")
      ?.innerText?.trim() ?? "";

  return { author, text, links, timestamp };
}

// ---------------------------------------------------------------------------
// ANALYSIS (PLACEHOLDER)
// ---------------------------------------------------------------------------

// Stub that returns hard-coded "pending" results for each module.
// Replace each branch with the real analysis output once the modules are
// implemented:
//   - linguistic → DLSU Fake News Filipino NLP model
//   - heuristic  → DOM/source signal scanner (bylines, domains, URL shape)
//   - external   → fact-check database / web search cross-reference
function analyzePost(_postData: PostData): AnalysisResult {
  // TODO: wire up real analysis modules
  return {
    riskScore: 0,
    riskLevel: "low",
    linguistic: {
      status: "pending",
      summary: "TODO: linguistic analysis pending",
      details: ["TODO: list detected emotional words, all-caps usage, exclamation patterns, clickbait phrases"],
    },
    heuristic: {
      status: "pending",
      summary: "TODO: heuristic checks pending",
      details: ["TODO: list missing byline, unverified domains, suspicious URL shape, lack of publication date"],
    },
    external: {
      status: "pending",
      summary: "TODO: external verification pending",
      details: ["TODO: list matched fact-checks, related credible source articles, search results"],
    },
  };
}

// ---------------------------------------------------------------------------
// UI HELPERS
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Maps a module status to (icon name, tailwind text-color class) for both
// the status badge on the card and the icon inside the modal.
function statusVisual(status: ModuleStatus): { iconName: Parameters<typeof icon>[0]; color: string } {
  switch (status) {
    case "safe":    return { iconName: "checkCircle",   color: "text-green-600 dark:text-green-400" };
    case "warning": return { iconName: "triangleAlert", color: "text-yellow-600 dark:text-yellow-400" };
    case "risk":    return { iconName: "circleX",       color: "text-red-600 dark:text-red-400" };
    case "pending": return { iconName: "loader",        color: "text-gray-400 dark:text-gray-500" };
  }
}

// Maps an overall risk level to the progress bar fill color.
function riskBarColor(level: AnalysisResult["riskLevel"]): string {
  switch (level) {
    case "low":    return "bg-green-500";
    case "medium": return "bg-yellow-500";
    case "high":   return "bg-red-500";
  }
}

// Human-readable label for the risk badge in the panel header.
function riskBadgeLabel(level: AnalysisResult["riskLevel"]): string {
  switch (level) {
    case "low":    return "Low Risk";
    case "medium": return "Medium Risk";
    case "high":   return "High Risk";
  }
}

function riskBadgeClasses(level: AnalysisResult["riskLevel"]): string {
  switch (level) {
    case "low":    return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "high":   return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  }
}

// ---------------------------------------------------------------------------
// MODAL
// ---------------------------------------------------------------------------

// We use a single global modal element (mounted once on document.body)
// instead of one modal per panel. Cards open the modal by populating it
// with the relevant module's data.

interface ModalContent {
  moduleLabel: string;
  iconName: Parameters<typeof icon>[0];
  result: ModuleResult;
  postData: PostData;
}

let modalEl: HTMLElement | null = null;

function ensureModalMounted(): HTMLElement {
  if (modalEl) return modalEl;

  modalEl = document.createElement("div");
  modalEl.id = "tsekamuna-modal";
  modalEl.className = "fixed inset-0 z-[9999] hidden items-center justify-center bg-black/50 p-4";

  // Close modal when clicking the backdrop (but not when clicking the dialog)
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeModal();
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  document.body.appendChild(modalEl);
  return modalEl;
}

function openModal(content: ModalContent): void {
  const el = ensureModalMounted();
  const { iconName, color } = statusVisual(content.result.status);

  el.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        role="dialog" aria-modal="true">
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2">
          <span class="${color}">${icon(content.iconName, "w-5 h-5")}</span>
          <h2 class="font-semibold text-gray-800 dark:text-gray-100">${escapeHtml(content.moduleLabel)}</h2>
        </div>
        <button class="tsekamuna-modal-close bg-transparent border-none p-0 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer"
                aria-label="Close">
          ${icon("x", "w-5 h-5")}
        </button>
      </div>
      <div class="p-4 space-y-3">
        <div class="flex items-center gap-2">
          <span class="${color} shrink-0">${icon(iconName, "w-5 h-5")}</span>
          <p class="text-sm text-gray-700 dark:text-gray-200">${escapeHtml(content.result.summary)}</p>
        </div>
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Details
          </h3>
          <ul class="space-y-1 text-sm text-gray-700 dark:text-gray-200 list-disc list-inside">
            ${content.result.details.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  `;

  el.querySelector(".tsekamuna-modal-close")?.addEventListener("click", closeModal);

  el.classList.remove("hidden");
  el.classList.add("flex");
}

function closeModal(): void {
  if (!modalEl) return;
  modalEl.classList.add("hidden");
  modalEl.classList.remove("flex");
}

// ---------------------------------------------------------------------------
// PANEL
// ---------------------------------------------------------------------------

interface ModuleCardConfig {
  key: "linguistic" | "heuristic" | "external";
  label: string;
  iconName: Parameters<typeof icon>[0];
}

const MODULES: ModuleCardConfig[] = [
  { key: "linguistic", label: "Linguistic", iconName: "messageSquareText" },
  { key: "heuristic",  label: "Heuristic",  iconName: "shieldCheck" },
  { key: "external",   label: "External",   iconName: "globe" },
];

// Builds a single module card HTML string.
function renderModuleCard(cfg: ModuleCardConfig, result: ModuleResult): string {
  const { iconName: statusIcon, color: statusColor } = statusVisual(result.status);

  return `
    <button class="tsekamuna-module-card text-left flex-1 min-w-0 p-2 rounded-md border-none
                  bg-blue-500/10 hover:bg-blue-500/20
                  dark:bg-blue-400/10 dark:hover:bg-blue-400/20
                  transition-colors cursor-pointer"
            data-module="${cfg.key}">
      <div class="flex items-center gap-1.5 mb-1">
        <span class="text-gray-600 dark:text-gray-300">${icon(cfg.iconName, "w-3.5 h-3.5")}</span>
        <span class="text-xs font-semibold text-gray-700 dark:text-gray-200">${cfg.label}</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="${statusColor} shrink-0">${icon(statusIcon, "w-3 h-3")}</span>
        <p class="text-[11px] text-gray-600 dark:text-gray-400 leading-tight">
          ${escapeHtml(result.summary)}
        </p>
      </div>
    </button>
  `;
}

function injectPanel(postEl: HTMLElement, postData: PostData, analysis: AnalysisResult): void {
  if (postEl.querySelector(".tsekamuna-panel")) return;

  const panel = document.createElement("div");
  panel.className = [
    "tsekamuna-panel",
    "mt-2 p-3 rounded-2xl border font-sans",
    "border-gray-200 bg-gray-50",
    "dark:border-gray-700 dark:bg-gray-900",
  ].join(" ");

  panel.innerHTML = `
    <!-- Header: logo + overall risk badge -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-1.5">
        <span class="text-blue-500 dark:text-blue-400">${icon("search", "w-4 h-4")}</span>
        <span class="text-blue-500 dark:text-blue-400 font-semibold text-sm">TsekaMuna</span>
      </div>
      <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${riskBadgeClasses(analysis.riskLevel)}">
        ${riskBadgeLabel(analysis.riskLevel)}
      </span>
    </div>

    <!-- Risk score progress bar -->
    <div class="mb-3">
      <div class="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
        <span>Risk Score</span>
        <span>${analysis.riskScore}%</span>
      </div>
      <div class="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div class="h-full ${riskBarColor(analysis.riskLevel)} transition-all"
            style="width: ${analysis.riskScore}%"></div>
      </div>
    </div>

    <!-- Three module cards -->
    <div class="flex gap-2">
      ${MODULES.map((cfg) => renderModuleCard(cfg, analysis[cfg.key])).join("")}
    </div>
  `;

  // Wire up card clicks → open modal with that module's details
  panel.querySelectorAll<HTMLElement>(".tsekamuna-module-card").forEach((card) => {
    card.addEventListener("click", () => {
      const moduleKey = card.dataset.module as ModuleCardConfig["key"];
      const cfg = MODULES.find((m) => m.key === moduleKey)!;
      openModal({
        moduleLabel: cfg.label + " Analysis",
        iconName: cfg.iconName,
        result: analysis[moduleKey],
        postData,
      });
    });
  });

  postEl.appendChild(panel);
}

// ---------------------------------------------------------------------------
// POST PROCESSING
// ---------------------------------------------------------------------------

async function processPost(postEl: HTMLElement): Promise<void> {
  if (postEl.getAttribute("data-virtualized") === "true") return;
  if (postEl.querySelector(".tsekamuna-panel")) return;

  const postData = await extractPostData(postEl);
  if (!postData.text) return;

  const analysis = analyzePost(postData);
  injectPanel(postEl, postData, analysis);

  console.log("[TsekaMuna] Post processed:", { postData, analysis });
}

// ---------------------------------------------------------------------------
// FEED OBSERVER
// ---------------------------------------------------------------------------

const observer = new MutationObserver((mutations: MutationRecord[]) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;

      if (node.matches("[aria-posinset]")) {
        processPost(node);
      }
      node.querySelectorAll<HTMLElement>("[aria-posinset]").forEach(processPost);
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

document.querySelectorAll<HTMLElement>("[aria-posinset]").forEach(processPost);
