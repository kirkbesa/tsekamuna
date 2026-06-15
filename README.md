# TsekaMuna

A browser extension that passively surfaces credibility signals on Facebook posts to reduce misinformation sharing among Filipino users.

Built with TypeScript and Tailwind CSS as part of a thesis project at CIIT College of Arts and Technology.

---

## How It Works

TsekaMuna runs in the background as you browse Facebook. When it detects a post with readable text, it automatically injects a credibility panel below the post — no clicking required. The panel shows who posted it and a preview of the content, and will eventually display a risk score based on linguistic signals, source checks, and external verification.

---

## Project Structure

```
tsekamuna/
├── src/
│   ├── content.ts      ← main content script (write code here)
│   └── input.css       ← Tailwind input (do not add styles here directly)
├── dist/
│   └── content.js      ← compiled JS output (auto-generated, do not edit)
├── content.css         ← compiled Tailwind output (auto-generated, do not edit)
├── manifest.json       ← extension config (permissions, entry points)
├── tailwind.config.js  ← Tailwind config (points to src/ for class scanning)
├── tsconfig.json       ← TypeScript compiler config
└── package.json        ← scripts and dependencies
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- Google Chrome (or any Chromium-based browser)

---

## Installation

**1. Clone the repository**

```bash
git clone <repo-url>
cd tsekamuna
```

**2. Install dependencies**

```bash
npm install
```

**3. Build the extension**

```bash
npm run build
```

This compiles `src/content.ts` into `dist/content.js` and generates `content.css` from the Tailwind input.

**4. Load the extension in Chrome**

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** using the toggle in the top-right corner
3. Click **Load unpacked**
4. Select the `tsekamuna` folder (the root folder, not `src/` or `dist/`)
5. The TsekaMuna extension should now appear in your extensions list

**5. Open Facebook**

Navigate to [facebook.com](https://www.facebook.com) and scroll through your feed. TsekaMuna panels will appear below posts that have readable text.

---

## Development

Run the watch command to auto-recompile on every file save:

```bash
npm run watch
```

After saving changes, go to `chrome://extensions/` and click the **refresh icon** on the TsekaMuna card to reload the extension. Then refresh the Facebook tab.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript and generate Tailwind CSS once |
| `npm run watch` | Watch for changes and recompile automatically |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | TypeScript compiler |
| `@types/chrome` | Type definitions for Chrome extension APIs |
| `tailwindcss` | Utility-first CSS framework for panel styling |
| `concurrently` | Runs TypeScript and Tailwind watch processes in parallel |
