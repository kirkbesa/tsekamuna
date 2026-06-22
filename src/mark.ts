// TsekaMuna mark SVG.
// Fills reference --tm-mark-bubble and --tm-mark-check so the mark reverses
// automatically in dark mode (handled in tokens.css).
// The gold "muna" dot stays gold across both themes — it's the brand signature.

export function markSvg(size: number = 24): string {
  return `
    <svg class="mark" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">
      <!-- speech bubble: the post you're about to share -->
      <path d="M11 6H37a8 8 0 0 1 8 8V28a8 8 0 0 1-8 8H22l-9 7v-7H11a8 8 0 0 1-8-8V14a8 8 0 0 1 8-8Z"
            fill="var(--tm-mark-bubble)"/>
      <!-- check: verified / tseka -->
      <path d="M14.5 21.5 21 28 34 14.5"
            fill="none" stroke="var(--tm-mark-check)" stroke-width="4.4"
            stroke-linecap="round" stroke-linejoin="round"/>
      <!-- the 'muna' beat: the gold attention ping -->
      <circle cx="39.5" cy="9.5" r="4.5" fill="var(--tm-gold)"/>
    </svg>
  `;
}

// Wordmark used in the card header: "Tseka" teal + "muna" gold, Fraunces 600.
export function wordmark(): string {
  return `<span class="wm"><span class="b">Tseka</span><span class="g">muna</span></span>`;
}
