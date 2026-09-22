// Background service worker — owns all Gemini API calls.
//
// The content script cannot call Gemini directly (cross-origin fetch from a
// content script is blocked; the key also shouldn't touch page context). So the
// content script messages this worker, which holds the key, calls Gemini with
// the extension's host_permissions, caches results, and messages back.

import { GEMINI_API_KEY } from "./config";
import type { ClassifyHealthResponse, TmRequest } from "./messaging";

// Fast, cheap model — fine for a yes/no classifier. Bump if you need more
// nuance in the finer-grained category.
const GEMINI_MODEL = "gemini-2.0-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Cap the text we send so a very long post can't blow up token usage.
const MAX_CHARS = 4000;

const HEALTH_PROMPT = `You are a classifier for a Filipino social-media fact-check tool.
Decide whether the Facebook post below is about HEALTH: medical claims, treatments
or remedies, diseases, medicines, supplements, vaccines, nutrition, mental health,
or health news/advisories. The post may be in English, Filipino/Tagalog, or Taglish.
Personal well-wishes ("get well soon"), workout selfies, and food photos are NOT
health content unless they make a health claim.

Respond with JSON only.

Post:
"""
{TEXT}
"""`;

// In-memory cache (keyed by post text). Lost when the worker is torn down, but
// the content script caches too, so cold restarts are cheap in practice.
const cache = new Map<string, ClassifyHealthResponse>();

async function classifyHealth(text: string): Promise<ClassifyHealthResponse> {
  const key = text.slice(0, MAX_CHARS);

  const cached = cache.get(key);
  if (cached) return cached;

  if (!GEMINI_API_KEY) {
    console.warn("[TsekaMuna] no GEMINI_API_KEY — set it in .env and rebuild.");
    return { isHealth: false };
  }

  const res = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: HEALTH_PROMPT.replace("{TEXT}", key) }] }],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            isHealth: { type: "BOOLEAN" },
            category: {
              type: "STRING",
              enum: ["health_claim", "health_news", "health_related", "not_health"],
            },
          },
          required: ["isHealth"],
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const parsed = JSON.parse(raw) as ClassifyHealthResponse;

  const result: ClassifyHealthResponse = {
    isHealth: parsed.isHealth === true,
    category: parsed.category,
  };
  cache.set(key, result);
  return result;
}

chrome.runtime.onMessage.addListener((msg: TmRequest, _sender, sendResponse) => {
  if (msg.type === "CLASSIFY_HEALTH") {
    classifyHealth(msg.text)
      .then(sendResponse)
      .catch((err) => {
        console.warn("[TsekaMuna] health classification failed:", err);
        sendResponse({ isHealth: false }); // fail closed — no panel on error
      });
    return true; // keep the message channel open for the async response
  }
  return false;
});
