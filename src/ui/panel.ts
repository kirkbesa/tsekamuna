// Builds and injects the TsekaMuna credibility card into a Facebook post.
// Markup translated directly from src/branding/tsekamuna-brand.html so the
// rendered output matches the brand reference 1:1.
//
// All styling lives in branding/components.css. This file only emits HTML and
// wires up click handlers — no inline styles, no Tailwind color classes.

import { analyzePost } from "../analyzer";
import { icon, type IconName } from "../icons";
import { getLang, onLangChange, setLang, type Lang } from "../lang";
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

// UI chrome strings that switch with the active display language. The two
// bilingual module labels above are a deliberate brand pairing (always shown
// together) and are NOT part of this — only single-language chrome is.
const STRINGS: Record<Lang, {
  settings: string;
  language: string;
  collapse: string;
  expand: string;
}> = {
  en:  { settings: "Settings", language: "Language", collapse: "Collapse", expand: "Expand" },
  fil: { settings: "Mga Setting", language: "Wika", collapse: "I-collapse", expand: "I-expand" },
};

// Close any open per-post settings menu when the pointer lands outside it, or
// on Escape. One pair of document-level listeners shared across every card
// (registered once, at module load) instead of one per card — Facebook feeds
// can mount hundreds of cards per session, so per-card document listeners
// would leak.
function closeOpenSettingsMenus(): void {
  document.querySelectorAll<HTMLElement>(".tm-settings-menu:not([hidden])").forEach((menu) => {
    menu.setAttribute("hidden", "");
    menu.parentElement?.querySelector(".tm-settings-btn")?.setAttribute("aria-expanded", "false");
  });
}
document.addEventListener("click", (e) => {
  document.querySelectorAll<HTMLElement>(".tm-settings-menu:not([hidden])").forEach((menu) => {
    if (!menu.parentElement?.contains(e.target as Node)) closeOpenSettingsMenus();
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeOpenSettingsMenus();
});

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

  // Local render state. `lang` and `collapsed` persist across re-renders
  // (re-renders happen on language change; collapse is toggled directly
  // without a full re-render, but the flag is kept here so a language
  // switch doesn't silently re-expand a card the user collapsed).
  let lang = getLang();
  let currentAnalysis = analysis;
  let collapsed = false;

  function render(): void {
    const t = STRINGS[lang];

    card.innerHTML = `
      <!-- Header: mark + wordmark on the left, controls on the right -->
      <div class="tm-head">
        <div class="tm-id">
          ${markSvg(24)}
          ${wordmark()}
        </div>
        <div class="tm-headctl">
          <span class="tm-pill" data-state="${currentAnalysis.riskLevel}">
            <span class="dot"></span>${verdictLabel(currentAnalysis.riskLevel, lang)}
          </span>
          <div class="tm-settings">
            <button class="tm-iconbtn tm-settings-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${t.settings}">
              ${icon("settings", "")}
            </button>
            <div class="tm-settings-menu" hidden>
              <div class="tm-settings-label">${t.language}</div>
              <button class="tm-langopt" type="button" data-lang="fil" aria-pressed="${lang === "fil"}">Filipino</button>
              <button class="tm-langopt" type="button" data-lang="en" aria-pressed="${lang === "en"}">English</button>
            </div>
          </div>
          <button class="tm-iconbtn tm-collapse" type="button" aria-expanded="${!collapsed}" aria-label="${collapsed ? t.expand : t.collapse}">
            ${icon("chevronDown", "")}
          </button>
        </div>
      </div>

      <div class="tm-body"${collapsed ? " hidden" : ""}>
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
          <div class="tm-meter">${renderMeter(currentAnalysis.riskLevel)}</div>
          <span class="tm-score">${currentAnalysis.riskScore}<small>/100</small></span>
        </div>
        <div class="tm-readout">${escapeHtml(currentAnalysis.readout)}</div>

        <!-- Three module cards -->
        <div class="tm-modules">
          ${MODULES.map((cfg) => renderModuleCard(cfg, currentAnalysis[cfg.key])).join("")}
        </div>
      </div>
    `;

    wireEvents();
  }

  function wireEvents(): void {
    // Wire each module card to open the popover with that module's details.
    card.querySelectorAll<HTMLElement>(".tm-mod").forEach((cardBtn) => {
      cardBtn.addEventListener("click", () => {
        const moduleKey = cardBtn.dataset.module as ModuleKey;
        const cfg = MODULES.find((m) => m.key === moduleKey)!;
        openPopover({
          title: lang === "en" ? cfg.labelEn : cfg.labelFil,
          result: currentAnalysis[moduleKey],
        });
      });
    });

    // Collapse/expand — toggled directly (no re-render) so it's instant and
    // doesn't disturb scroll position or the settings menu.
    const collapseBtn = card.querySelector<HTMLElement>(".tm-collapse")!;
    collapseBtn.addEventListener("click", () => {
      collapsed = !collapsed;
      const body = card.querySelector<HTMLElement>(".tm-body")!;
      body.hidden = collapsed;
      card.setAttribute("data-collapsed", String(collapsed));
      collapseBtn.setAttribute("aria-expanded", String(!collapsed));
      collapseBtn.setAttribute("aria-label", collapsed ? STRINGS[lang].expand : STRINGS[lang].collapse);
    });
    card.setAttribute("data-collapsed", String(collapsed));

    // Settings gear toggles the language dropdown.
    const settingsBtn = card.querySelector<HTMLElement>(".tm-settings-btn")!;
    const menu = card.querySelector<HTMLElement>(".tm-settings-menu")!;
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = menu.hasAttribute("hidden");
      closeOpenSettingsMenus(); // close any other card's open menu first
      if (willOpen) menu.removeAttribute("hidden");
      settingsBtn.setAttribute("aria-expanded", String(willOpen));
    });

    // Language options inside the dropdown.
    menu.querySelectorAll<HTMLButtonElement>(".tm-langopt").forEach((btn) => {
      btn.addEventListener("click", () => {
        menu.setAttribute("hidden", "");
        settingsBtn.setAttribute("aria-expanded", "false");
        setLang(btn.dataset.lang as Lang); // triggers this card's onLangChange below
      });
    });
  }

  render();

  // Re-render in the new language whenever the user switches it from any
  // card's settings dropdown. Unsubscribes lazily the first time this card
  // is no longer in the DOM (e.g. removed by Facebook's feed virtualization)
  // so the listener set doesn't grow unbounded while scrolling.
  const unsubscribe = onLangChange((newLang) => {
    if (!card.isConnected) {
      unsubscribe();
      return;
    }
    lang = newLang;
    currentAnalysis = analyzePost(postData, newLang);
    render();
  });

  // Theme-bind so the card flips automatically when FB toggles dark mode.
  bindThemeToElement(card);

  postEl.appendChild(card);
}
