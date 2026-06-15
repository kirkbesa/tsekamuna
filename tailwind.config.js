/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind where to look for class names so it only includes the
  // utilities actually used — keeps the output CSS small.
  content: ["./src/**/*.ts"],

  // "media" uses the prefers-color-scheme CSS media query, so dark mode
  // follows the user's OS setting automatically with no JS required.
  darkMode: "media",

  theme: {
    extend: {},
  },
  plugins: [],
};
