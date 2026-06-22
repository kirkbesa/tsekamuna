# TsekaMuna — Brand & UI Guide

> Handoff document for designers, developers, and AI coding assistants.
> If you are an AI model implementing UI: read **§9 Design Tokens** first, then **§7 Components**. Do not invent colors, radii, or shadows outside the token set.

---

## 1. The name is the brief

**Tseka muna** = *"check first."* `tseka` (phonetic Filipino for *check*) + `muna` (Tagalog softener: *first / hold on a sec / for now*).

The word `muna` is the whole personality. In Tagalog it is gentle and non-confrontational — "kain muna" (eat first), "sandali muna" (wait a sec). It is a tap on the shoulder, never a command. That softness is the brand. Everything we make should feel like a thoughtful friend saying *"uy, tseka muna bago mo i-share"* — not a system blocking you, not a red error, not a judgment.

This is also what the research mandates: TsekaMuna **surfaces signals and asks one question**. It does **not** block, remove, or label content as false. The design must never look more aggressive than the product actually is.

**One-line positioning:** A calm, local second opinion that appears the moment before you share.

---

## 2. Personality

| We are | We are not |
|---|---|
| A thoughtful kababayan who reads carefully | A cop, a censor, a referee |
| Calm, warm, plain-spoken | Alarmist, technical, preachy |
| Honest about uncertainty | Falsely confident |
| Bilingual and local | Generic / Silicon-Valley-default |
| Quietly confident | Loud, neon, "cyber" |

Three adjectives to design against: **warm, trustworthy, unhurried.**

---

## 3. Logo

**The mark:** a speech bubble (the post you're about to share) holding a check (verified / *tseka*), with a single gold dot — the *muna* beat, the small "ping" that says this post is worth a second look.

- File: `tsekamuna-mark.svg` (portable, works as favicon, toolbar icon, app icon).
- Survives 16px — keep it that way. Never add detail that disappears under 24px.

**The wordmark:** `Tseka` in Tseka Teal + `muna` in Araw Gold, set tight, no space-break in the color logic. The two-tone split *is* the meaning (check / then-pause). Display face is **Fraunces** (see §5).

```
Tsekamuna      ← lockup: [mark] + "Tseka" (teal) "muna" (gold)
```

**Clear space:** keep padding equal to the height of the gold dot on all sides.

**On dark backgrounds** (Facebook dark mode): swap the bubble to Surface Light (`#F4EFE5`) with a Tseka Teal check, OR lighten the bubble to `#1C5A5B`. Keep the gold dot. Never place the dark-teal bubble directly on near-black.

**Don't:** stretch it, add a drop shadow, outline it, recolor the check, or set the wordmark in a different font "just this once."

---

## 4. Color

A warm, paper-based system. The signature accent is a sun-gold, not a danger-red — because the brand is a nudge, not an alarm.

### Brand
| Token | Hex | Name | Use |
|---|---|---|---|
| `--tm-teal` | `#103B3C` | Tseka Teal | Primary. Mark, headers, primary buttons, the watchful "voice" |
| `--tm-ink` | `#0B2122` | Deep Ink | Body text on light |
| `--tm-gold` | `#E9A23B` | Araw Gold | Signature accent. The *muna* moment, the pre-share band, highlights |
| `--tm-paper` | `#FBF8F1` | Paper | App / card background (warm, not white) |
| `--tm-mist` | `#ECE7DC` | Mist | Secondary surfaces, dividers, tracks |

### Risk scale — the functional core
Calm, legible, **never neon**. Note the fourth state: *Unverified ≠ False* (a research requirement).

| Token | Hex | Level | Label (EN / FIL) |
|---|---|---|---|
| `--tm-clear` | `#2E8B6B` | Low | Looks clear / *Mababa* |
| `--tm-caution` | `#E9A23B` | Medium | Worth a look / *Mag-ingat* |
| `--tm-high` | `#DB5A45` | High | Be careful / *Mataas* |
| `--tm-unverified` | `#6E7E7C` | None found | Unverified / *Di matukoy* |

`#DB5A45` is a warm coral, deliberately *not* `#E00` fire-engine red. High risk should read "be careful," not "ERROR."

### Neutrals (text & lines on Paper)
`--tm-ink #0B2122` · `--tm-ink-2 #3C4A49` (secondary) · `--tm-ink-3 #6E7E7C` (muted) · `--tm-line #DED7C8` (hairlines).

### Contrast rules
- **Araw Gold is never body text on Paper** (fails WCAG). Gold = fills, icons, the pause band, ≥18px bold display only.
- Body text uses Deep Ink on Paper (passes AA comfortably).
- On Tseka Teal fills, use Paper (`#FBF8F1`) for text.

---

## 5. Typography

Three roles. The pairing is the point — credible serif + warm grotesque + measured mono.

| Role | Family | Why |
|---|---|---|
| Display / wordmark / headers | **Fraunces** (opt. soft, wonky axes) | Editorial seriffed = "considered, credible, fact-checked." Used with restraint. |
| UI / body | **Hanken Grotesk** | Warm, highly legible, friendly lowercase — not Inter, not default. |
| Data / scores / labels | **IBM Plex Mono** | Numbers and signal labels read as a measured instrument, not marketing. |

Google Fonts import:
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
```

### Scale (UI, 1rem = 16px)
| Token | Size / line | Family | Use |
|---|---|---|---|
| Display | 28 / 32 | Fraunces 600 | Pre-share modal headline |
| H1 | 20 / 26 | Fraunces 600 | Card title |
| H2 | 16 / 22 | Hanken 600 | Module headers |
| Body | 14 / 20 | Hanken 400 | Default text |
| Small | 13 / 18 | Hanken 500 | Helper / captions |
| Label | 11 / 14, +0.08em, UPPERCASE | IBM Plex Mono 500 | Signal labels, eyebrows |
| Score | 22 / 22 | IBM Plex Mono 600 | The risk % readout |

---

## 6. Shape, space, elevation

```
--tm-radius-card: 16px;   --tm-radius-inner: 12px;
--tm-radius-chip: 8px;    --tm-radius-pill: 999px;
--tm-space: 4px base → 8 / 12 / 16 / 20 / 24
--tm-shadow: 0 6px 24px -8px rgba(16,59,60,.22);   /* teal-tinted, soft, never harsh gray */
--tm-shadow-pop: 0 12px 40px -10px rgba(11,33,34,.30);
--tm-border: 1px solid var(--tm-line);
```

Generous radii + warm shadows = friendly. Hairlines are warm (`--tm-line`), never `#ccc` gray.

---

## 7. Components

### 7.1 Credibility Card (inline under a Facebook post)
The always-on, passive surface. Replaces the dark dashboard.

- Paper background, 16px radius, warm teal-tinted shadow, sits flush under the post.
- **Header row:** mark + "Tseka**muna**" wordmark (small) · **verdict pill** on the right.
- **Verdict pill:** filled with the risk color, Paper text, IBM Plex Mono label, e.g. `LOOKS CLEAR · MABABA`. This replaces the stock green "Low Risk" badge.
- **Reading meter:** a single horizontal segmented bar (4 segments) tinted along the risk scale, with the score in IBM Plex Mono at the end. Not a generic 0–100% progress bar — it's a "credibility reading."
- **Three signal modules** in a row, each a quiet chip-card: icon + bilingual label + one-line status. Map to the paper's three categories:
  - **Language / Pananalita** (linguistic signals — emotion, all-caps, clickbait)
  - **Source / Pinagmulan** (byline, domain, date)
  - **Cross-check / Tseke** (external references / fact-check matches)
- Each module is tappable → opens the Detail popover (§7.2).
- **States:** scanning (pulsing dot, "tinitingnan…"), done, unverified, error. Never leave raw "TODO:" strings in the UI — that's the current bug. Empty/loading states get real human copy (§8).

### 7.2 Signal Detail popover
- Paper card, `--tm-radius-card`, `--tm-shadow-pop`, 360–420px wide.
- Header: module icon + name + close.
- Body: the verdict in plain language, then a short bulleted list of the actual signals found (e.g. "No author named," "Link goes to an unfamiliar site"). Plain nouns, end-user language — never "missing byline heuristic failed."
- Footer: a single "got it" / "isara" dismiss. No nested CTAs.

### 7.3 Pre-share Nudge — **the signature moment**
This is the one screen the whole product exists for, and the current build doesn't even show it. It fires when a user clicks Share on a flagged post.

- A focused modal, Paper, with the **Araw Gold pause band** across the top — the brand's signature element.
- Headline in Fraunces: **"Tseka muna?"**
- One sentence: what we noticed, in calm language. One sentence only.
- The mini reading meter.
- **Two equal-weight buttons** — autonomy is preserved, so neither is scary:
  - `Tingnan muna` (Review) — Tseka Teal, primary
  - `I-share pa rin` (Share anyway) — quiet outline, never disabled, never red
- No "Are you sure???", no guilt, no blocking. We ask once, then we respect the choice. (Directly from the nudge-theory basis in the paper.)

---

## 8. Voice & microcopy

Plain, warm, bilingual (Taglish where natural). Sentence case. No jargon, no scolding, no exclamation pile-ups (ironic, given we flag those).

| Moment | ✅ Write | ❌ Avoid |
|---|---|---|
| Scanning | `Tinitingnan ang post…` | `TODO: linguistic analysis pending` |
| Low risk | `Mukhang okay. Walang nakitang red flags.` | `Risk Score: 0% — LOW RISK` |
| Medium | `May ilang dahilan para mag-isip muna.` | `WARNING: Medium risk detected` |
| High | `Mag-ingat — maraming senyales dito.` | `DANGER! Likely FAKE NEWS` |
| Unverified | `Wala kaming nahanap na pag-verify dito — hindi ibig sabihin mali, pero wala pang nakumpirma.` | `UNVERIFIED = FALSE` |
| Pre-share | `Tseka muna? Napansin namin ang ilang bagay sa post na ito.` | `Stop! Do not share this.` |
| Share anyway | `I-share pa rin` | `Ignore warning` |

**Rule:** the tool reports what it *noticed*, never declares what is *true*. Use "napansin namin / nakita namin" (we noticed), never "this is false."

---

## 9. Design tokens (copy/paste)

```css
:root {
  /* brand */
  --tm-teal:#103B3C; --tm-teal-600:#1C5A5B; --tm-ink:#0B2122;
  --tm-ink-2:#3C4A49; --tm-ink-3:#6E7E7C;
  --tm-gold:#E9A23B; --tm-gold-soft:#F6E2BC;
  --tm-paper:#FBF8F1; --tm-surface:#F4EFE5; --tm-mist:#ECE7DC;
  --tm-line:#DED7C8;
  /* risk */
  --tm-clear:#2E8B6B; --tm-caution:#E9A23B; --tm-high:#DB5A45; --tm-unverified:#6E7E7C;
  --tm-clear-soft:#DCEFE6; --tm-caution-soft:#F8E9CB; --tm-high-soft:#F7DCD5;
  /* shape */
  --tm-radius-card:16px; --tm-radius-inner:12px; --tm-radius-chip:8px; --tm-radius-pill:999px;
  --tm-shadow:0 6px 24px -8px rgba(16,59,60,.22);
  --tm-shadow-pop:0 12px 40px -10px rgba(11,33,34,.30);
  --tm-border:1px solid var(--tm-line);
  /* type */
  --tm-display:'Fraunces',Georgia,serif;
  --tm-body:'Hanken Grotesk',system-ui,sans-serif;
  --tm-mono:'IBM Plex Mono',ui-monospace,monospace;
}

/* dark (Facebook dark mode) */
:root[data-theme="dark"]{
  --tm-paper:#0E1C1C; --tm-surface:#15292A; --tm-mist:#1C3334;
  --tm-ink:#EDEAE0; --tm-ink-2:#B9C2BF; --tm-ink-3:#8A9794; --tm-line:#244041;
  --tm-teal:#7FD1C9; /* lighter for contrast on dark */
}
```

```json
{
  "color": {
    "brand": { "teal": "#103B3C", "ink": "#0B2122", "gold": "#E9A23B", "paper": "#FBF8F1", "mist": "#ECE7DC" },
    "risk": { "clear": "#2E8B6B", "caution": "#E9A23B", "high": "#DB5A45", "unverified": "#6E7E7C" }
  },
  "radius": { "card": 16, "inner": 12, "chip": 8, "pill": 999 },
  "font": { "display": "Fraunces", "body": "Hanken Grotesk", "mono": "IBM Plex Mono" }
}
```

---

## 10. Anti-patterns — read this if you're tempted to ship "shadcn default"

- ❌ Near-black surface + one neon accent. (The #1 AI-design tell, and our current look.)
- ❌ Stock green/red status pills with no type personality.
- ❌ Fire-engine red for high risk. We use warm coral; we nudge, we don't alarm.
- ❌ A plain 0–100% progress bar. Use the segmented credibility reading.
- ❌ Raw developer strings in the UI (`TODO: …`, `pending`). Every state has human copy (§8).
- ❌ English-only labels. Bilingual is a core differentiator, not decoration.
- ❌ Declaring content "FALSE." We surface signals; the user decides.
- ❌ A scary/disabled "share anyway" button. Autonomy is the product.

> If a screen could belong to any generic dashboard, it's wrong. Every TsekaMuna surface should feel like it's speaking Taglish, calmly, on warm paper.
