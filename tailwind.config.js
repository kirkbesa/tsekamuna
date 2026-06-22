/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind where to look for class names so it only includes the
  // utilities actually used — keeps the output CSS small.
  content: ["./src/**/*.ts"],

  // Theming is now driven by --tm-* CSS variables that flip on a data-theme
  // attribute (set by src/theme.ts). Tailwind's dark variant is unused.

  theme: {
    extend: {},
  },
  plugins: [],
};
