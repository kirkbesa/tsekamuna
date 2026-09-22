// Internal types shared across the analyzer steps. These are distinct from the
// UI-facing types in ../types — nothing outside the analyzer folder needs them.

import type { ModuleResult } from "../types";

// One credibility signal — one of the parameters defined in Chapter 3.
// `risky` feeds the aggregate score; `detail` is the human-readable line shown
// in the module popover.
export interface Signal {
  risky: boolean;
  detail: string;
}

// A step's signals plus the ModuleResult the UI renders for it.
export interface Layer {
  signals: Signal[];
  module: ModuleResult;
}

// Default returned by every stub until it does real detection.
export const NOT_RISKY: Signal = { risky: false, detail: "" };
