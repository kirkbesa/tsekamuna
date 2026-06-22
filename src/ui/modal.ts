// Global details modal — one shared instance mounted once on document.body
// and reused for every module card click across all post panels.

import { icon, type IconName } from "../icons";
import type { ModuleResult, PostData } from "../types";
import { escapeHtml, statusVisual } from "./helpers";

export interface ModalContent {
  moduleLabel: string;
  iconName: IconName;
  result: ModuleResult;
  postData: PostData;
}

let modalEl: HTMLElement | null = null;

// Lazily mounts the modal element on first use.
// The Escape-key listener is registered once and persists for the page life.
function ensureModalMounted(): HTMLElement {
  if (modalEl) return modalEl;

  modalEl = document.createElement("div");
  modalEl.id = "tsekamuna-modal";
  modalEl.className = "fixed inset-0 z-[9999] hidden items-center justify-center bg-black/50 p-4";

  // Close when clicking the backdrop (but not when clicking the dialog itself)
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  document.body.appendChild(modalEl);
  return modalEl;
}

export function openModal(content: ModalContent): void {
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

export function closeModal(): void {
  if (!modalEl) return;
  modalEl.classList.add("hidden");
  modalEl.classList.remove("flex");
}
