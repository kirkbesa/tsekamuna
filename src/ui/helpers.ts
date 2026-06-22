// Shared UI utilities: HTML escaping + visual mappers that convert analysis
// status/risk values into Tailwind class strings and Lucide icon names.

import { type IconName } from "../icons";
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

// Maps a module status to (icon name, tailwind text-color class) for both
// the status badge on the card and the icon inside the modal.
export function statusVisual(status: ModuleStatus): { iconName: IconName; color: string } {
  switch (status) {
    case "safe":    return { iconName: "checkCircle",   color: "text-green-600 dark:text-green-400" };
    case "warning": return { iconName: "triangleAlert", color: "text-yellow-600 dark:text-yellow-400" };
    case "risk":    return { iconName: "circleX",       color: "text-red-600 dark:text-red-400" };
    case "pending": return { iconName: "loader",        color: "text-gray-400 dark:text-gray-500" };
  }
}

// Maps an overall risk level to the progress bar fill color.
export function riskBarColor(level: RiskLevel): string {
  switch (level) {
    case "low":    return "bg-green-500";
    case "medium": return "bg-yellow-500";
    case "high":   return "bg-red-500";
  }
}

// Human-readable label for the risk badge in the panel header.
export function riskBadgeLabel(level: RiskLevel): string {
  switch (level) {
    case "low":    return "Low Risk";
    case "medium": return "Medium Risk";
    case "high":   return "High Risk";
  }
}

// Tailwind classes for the risk badge background + text color combination.
export function riskBadgeClasses(level: RiskLevel): string {
  switch (level) {
    case "low":    return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "high":   return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  }
}
