// Shared UI utilities: HTML escaping + state → label / icon mappers.
//
// All visual styling lives in branding/components.css and is driven by the
// data-state attribute on each element. These helpers only return the data
// values needed to render (icon names, bilingual labels, raw state strings).

import type { IconName } from "../icons";
import type { Lang } from "../lang";
import type { ModuleStatus, RiskLevel } from "../types";

// Escapes HTML special characters so user-supplied text can be safely inserted
// into innerHTML without being interpreted as markup.
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Status icon (excludes "pending" — that renders as a CSS spinner instead).
export function statusIcon(status: ModuleStatus): IconName | null {
  switch (status) {
    case "clear":      return "checkCircle";
    case "caution":    return "triangleAlert";
    case "high":       return "circleX";
    case "unverified": return "info";
    case "pending":    return null;
  }
}

// Verdict pill text, single-language — switches with the active display
// language instead of always pairing English + Filipino. Mono, uppercase —
// set in CSS, but the string itself is the source of truth.
export function verdictLabel(level: RiskLevel, lang: Lang): string {
  if (lang === "en") {
    switch (level) {
      case "clear":      return "LOOKS CLEAR";
      case "caution":    return "WORTH A LOOK";
      case "high":       return "BE CAREFUL";
      case "unverified": return "UNVERIFIED";
    }
  }
  switch (level) {
    case "clear":      return "MUKHANG OKAY";
    case "caution":    return "MAG-INGAT";
    case "high":       return "MATAAS ANG RISK";
    case "unverified": return "DI MATUKOY";
  }
}
