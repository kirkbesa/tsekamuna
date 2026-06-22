// PostCSS pipeline — runs before Tailwind so @import statements in
// src/input.css are inlined (otherwise our brand tokens / components CSS
// would never reach the compiled content.css).
module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: {},
  },
};
