// Build script for the content bundle.
//
// esbuild does not read .env on its own, so we load it here and inject the
// values at build time via `define`. Each defined name is textually replaced in
// the output — see src/config.ts for how they are consumed.
//
// WARNING: injected values are inlined into dist/content.js and are therefore
// visible to anyone who inspects the shipped extension. Do not put a secret
// here that you need to stay secret in a public release — use a backend proxy
// for that. See src/config.ts.

import esbuild from "esbuild";
import { readFileSync } from "node:fs";

// Minimal KEY=VALUE parser — avoids adding a dotenv dependency.
function loadEnv(path = ".env") {
  const env = {};
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    return env; // no .env — defined values fall back to empty strings
  }
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const watch = process.argv.includes("--watch");

/** @type {import("esbuild").BuildOptions} */
const options = {
  entryPoints: ["src/content.ts"],
  bundle: true,
  outfile: "dist/content.js",
  format: "iife",
  target: "es2020",
  define: {
    __GEMINI_API_KEY__: JSON.stringify(env.GEMINI_API_KEY ?? ""),
  },
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("[build] watching for changes…");
} else {
  await esbuild.build(options);
  console.log("[build] done → dist/content.js");
}
