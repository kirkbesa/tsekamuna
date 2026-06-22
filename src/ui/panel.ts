// Builds and injects the TsekaMuna credibility panel into a post element.
// The panel shows the aggregated risk score and three module cards that open
// the global modal when clicked.

import { icon, type IconName } from "../icons";
import type { AnalysisResult, ModuleKey, ModuleResult, PostData } from "../types";
import { escapeHtml, riskBadgeClasses, riskBadgeLabel, riskBarColor, statusVisual } from "./helpers";
import { openModal } from "./modal";

interface ModuleCardConfig {
  key: ModuleKey;
  label: string;
  iconName: IconName;
}

// Order here drives the left-to-right order of cards in the panel.
const MODULES: ModuleCardConfig[] = [
  { key: "linguistic", label: "Linguistic", iconName: "messageSquareText" },
  { key: "heuristic",  label: "Heuristic",  iconName: "shieldCheck" },
  { key: "external",   label: "External",   iconName: "globe" },
];

// Renders a single module card HTML string. The data-module attribute is
// read back by the click handler to look up which module was clicked.
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

export function injectPanel(postEl: HTMLElement, postData: PostData, analysis: AnalysisResult): void {
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
      const moduleKey = card.dataset.module as ModuleKey;
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
