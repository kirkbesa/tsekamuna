// Builds and injects the TsekaMuna credibility card into a Facebook post.
// Markup translated directly from src/branding/tsekamuna-brand.html so the
// rendered output matches the brand reference 1:1.
//
// All styling lives in branding/components.css. This file only emits HTML and
// wires up click handlers — no inline styles, no Tailwind color classes.

import { icon, type IconName } from "../icons";
import { markSvg, wordmark } from "../mark";
import { bindThemeToElement } from "../theme";
import type {
  AnalysisResult,
  ModuleKey,
  ModuleResult,
  PostData,
  RiskLevel,
} from "../types";
import { escapeHtml, statusIcon, verdictLabel } from "./helpers";
import { openPopover } from "./modal";

interface ModuleCardConfig {
  key: ModuleKey;
  /** Mono uppercase eyebrow label (English category from the research) */
  labelEn: string;
  /** Filipino display name shown larger underneath */
  labelFil: string;
  iconName: IconName;
}

// Order here drives the left-to-right order of cards in the panel.
const MODULES: ModuleCardConfig[] = [
  { key: "linguistic", labelEn: "Language",    labelFil: "Pananalita", iconName: "messageSquareText" },
  { key: "heuristic",  labelEn: "Source",      labelFil: "Pinagmulan", iconName: "shieldCheck" },
  { key: "external",   labelEn: "Cross-check", labelFil: "Tseke",      iconName: "globe" },
];

// Build the 4-segment credibility reading. Each segment fills to a tinted
// color depending on the overall risk level — clear fills 1 segment, caution
// fills 2, high fills 3, unverified leaves all segments empty.
function renderMeter(level: RiskLevel): string {
  const fillCount = level === "clear" ? 1 : level === "caution" ? 2 : level === "high" ? 3 : 0;
  const fillColor =
    level === "clear" ? "var(--tm-clear)"
      : level === "caution" ? "var(--tm-caution)"
      : level === "high" ? "var(--tm-high)"
      : "var(--tm-unverified)";

  return Array.from({ length: 4 }, (_, i) => {
    const bg = i < fillCount ? fillColor : "var(--tm-mist)";
    return `<span class="tm-seg" style="background:${bg}"></span>`;
  }).join("");
}

// Renders the status indicator inside a module card.
// "pending" → the CSS spinner; anything else → a status icon tinted by state.
function renderStatusIndicator(result: ModuleResult): string {
  if (result.status === "pending") {
    return `<span class="tm-scan" aria-label="Scanning"></span>`;
  }
  const name = statusIcon(result.status);
  if (!name) return "";
  return `<span class="tm-tick" data-state="${result.status}">${icon(name, "tm-tick")}</span>`;
}

// One module chip-card.
function renderModuleCard(cfg: ModuleCardConfig, result: ModuleResult): string {
  return `
    <button class="tm-mod" data-module="${cfg.key}" type="button">
      <div class="tm-mi">
        <span class="ic">${icon(cfg.iconName, "")}</span>
        <div class="titles">
          <span class="tm-lab">${cfg.labelEn}</span>
          <span class="tm-fil">${cfg.labelFil}</span>
        </div>
      </div>
      <div class="tm-st">
        ${renderStatusIndicator(result)}
        <span>${escapeHtml(result.summary)}</span>
      </div>
    </button>
  `;
}

// Caption snippet shown in the post details section.
function snippet(text: string): string {
  if (text.length <= 140) return text;
  return text.slice(0, 140).trim() + "…";
}

// Verified-badge icon used next to the author when Facebook marks the page.
const VERIFIED_SVG = icon("badgeCheck", "verified");

export function injectPanel(
  postEl: HTMLElement,
  postData: PostData,
  analysis: AnalysisResult,
): void {
  if (postEl.querySelector(".tm-card")) return;

  const card = document.createElement("div");
  card.className = "tm-scope tm-card";
  // Theme attribute is set by bindThemeToElement below — light is the safe
  // default if FB's background can't be measured (e.g. on document_idle race).
  card.setAttribute("data-theme", "light");

  card.innerHTML = `
    <!-- Header: mark + wordmark on the left, verdict pill on the right -->
    <div class="tm-head">
      <div class="tm-id">
        ${markSvg(24)}
        ${wordmark()}
      </div>
      <span class="tm-pill" data-state="${analysis.riskLevel}">
        <span class="dot"></span>${verdictLabel(analysis.riskLevel)}
      </span>
    </div>

    <div class="tm-body">
      <!-- Post details (above the reading) -->
      <div class="tm-postdetails">
        <div class="author-row">
          <span class="author">${escapeHtml(postData.author) || "Unknown author"}</span>
          ${postData.verified ? VERIFIED_SVG : ""}
          ${postData.timestamp
            ? `<span class="meta">· ${escapeHtml(postData.timestamp)}</span>`
            : ""}
        </div>
        ${postData.text
          ? `<p class="snippet">"${escapeHtml(snippet(postData.text))}"</p>`
          : ""}
      </div>

      <!-- Credibility reading: 4-segment meter + mono score -->
      <div class="tm-meterrow">
        <div class="tm-meter">${renderMeter(analysis.riskLevel)}</div>
        <span class="tm-score">${analysis.riskScore}<small>/100</small></span>
      </div>
      <div class="tm-readout">${escapeHtml(analysis.readout)}</div>

      <!-- Three module cards -->
      <div class="tm-modules">
        ${MODULES.map((cfg) => renderModuleCard(cfg, analysis[cfg.key])).join("")}
      </div>
    </div>
  `;

  // Wire each module card to open the popover with that module's details.
  card.querySelectorAll<HTMLElement>(".tm-mod").forEach((cardBtn) => {
    cardBtn.addEventListener("click", () => {
      const moduleKey = cardBtn.dataset.module as ModuleKey;
      const cfg = MODULES.find((m) => m.key === moduleKey)!;
      openPopover({
        title: cfg.labelFil,
        result: analysis[moduleKey],
      });
    });
  });

  // Theme-bind so the card flips automatically when FB toggles dark mode.
  bindThemeToElement(card);

  postEl.appendChild(card);
}
