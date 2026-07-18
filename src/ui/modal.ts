// Signal detail popover — opened by clicking any module card in the credibility
// panel. One global instance is mounted on document.body and reused; we just
// repopulate its content per open call.

import { icon } from "../icons";
import { getLang, onLangChange } from "../lang";
import { bindThemeToElement } from "../theme";
import type { ModuleResult } from "../types";
import { escapeHtml, statusIcon } from "./helpers";

export interface PopoverContent {
  title: string;        // module name in the active display language
  result: ModuleResult;
}

const CLOSE_LABEL = { fil: "Isara", en: "Close" } as const;

let overlay: HTMLElement | null = null;

// The popover's content (title, verdict text, details) was rendered in
// whatever language was active at open time. Rather than re-translate it in
// place, just close it — the module card that opens it re-renders in the new
// language anyway, so re-opening shows fresh, correctly-localized content.
onLangChange(() => closePopover());

// Lazily mount the popover overlay on first use.
function ensureMounted(): HTMLElement {
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.className = "tm-scope tm-popover-overlay";
  overlay.setAttribute("hidden", "");

  // Close when clicking the backdrop (but not when clicking the popover card)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopover();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopover();
  });

  document.body.appendChild(overlay);

  // Bind theme so the popover mirrors FB's dark/light mode live.
  bindThemeToElement(overlay);

  return overlay;
}

export function openPopover(content: PopoverContent): void {
  const el = ensureMounted();
  const { result, title } = content;
  const closeLabel = CLOSE_LABEL[getLang()];

  // Status icon for the header chip — pending falls back to scanning spinner.
  const headerIcon = result.status === "pending"
    ? `<span class="tm-scan" aria-label="Scanning"></span>`
    : icon(statusIcon(result.status) ?? "info", "");

  el.innerHTML = `
    <div class="tm-pop" role="dialog" aria-modal="true" aria-labelledby="tm-pop-title">
      <div class="tm-pop-h">
        <div class="l">
          <span class="ic" data-state="${result.status}">${headerIcon}</span>
          <h4 id="tm-pop-title">${escapeHtml(title)}</h4>
        </div>
        <button class="x" type="button" aria-label="${closeLabel}">
          ${icon("x", "")}
        </button>
      </div>
      <div class="tm-pop-b">
        <p class="tm-verdict">
          <b data-state="${result.status}">${escapeHtml(result.verdict.split(".")[0])}.</b>
          ${escapeHtml(result.verdict.split(".").slice(1).join(".").trim())}
        </p>
        <ul class="tm-siglist">
          ${result.details
            .map(
              (d) => `
            <li>
              <span class="bp" data-state="${result.status}"></span>
              <span>${escapeHtml(d)}</span>
            </li>`,
            )
            .join("")}
        </ul>
      </div>
      <div class="tm-pop-f">
        <button class="tm-btn ghost" type="button" data-close>${closeLabel}</button>
      </div>
    </div>
  `;

  // Both close buttons (header X + footer "Isara") dismiss the popover.
  el.querySelectorAll<HTMLElement>(".x, [data-close]").forEach((btn) => {
    btn.addEventListener("click", closePopover);
  });

  el.removeAttribute("hidden");

  // Focus the close button so Esc-to-close / Enter-to-dismiss works from
  // the keyboard immediately.
  el.querySelector<HTMLElement>(".x")?.focus();
}

export function closePopover(): void {
  if (!overlay) return;
  overlay.setAttribute("hidden", "");
}
