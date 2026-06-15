/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind where to look for class names so it only includes the
  // utilities actually used — keeps the output CSS small.
  content: ["./src/**/*.ts"],
  theme: {
    extend: {},
  },
  plugins: [],
};
