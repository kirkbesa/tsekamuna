// Typed message contract between the content script and the background service
// worker. All Gemini-backed work runs in the worker (see background.ts); the
// content script talks to it only through the helpers here.

// ─── Health classification (Step 0) ──────────────────────────────────────────

export interface ClassifyHealthRequest {
  type: "CLASSIFY_HEALTH";
  text: string;
}

export interface ClassifyHealthResponse {
  isHealth: boolean;
  // Optional finer-grained label for later use; the gate only needs isHealth.
  category?: "health_claim" | "health_news" | "health_related" | "not_health";
}

// Union of every request the worker understands. Extend as more AI-assisted
// steps move to the worker (linguistic signals, external verification…).
export type TmRequest = ClassifyHealthRequest;

// Ask the worker whether a post is health-related.
export function sendClassifyHealth(text: string): Promise<ClassifyHealthResponse> {
  const req: ClassifyHealthRequest = { type: "CLASSIFY_HEALTH", text };
  return chrome.runtime.sendMessage(req) as Promise<ClassifyHealthResponse>;
}
