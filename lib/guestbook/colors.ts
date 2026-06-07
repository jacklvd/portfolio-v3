// Client-safe (no server imports): the guestbook paper-color palette, shared by
// the API/validation layer and the UI. Keys are persisted in each note; the UI
// maps them to LITERAL Tailwind classes below (Tailwind JIT requires full class
// strings to appear in source — never build them dynamically).

export const NOTE_COLORS = ['cream', 'blush', 'sky', 'mint', 'butter', 'lilac'] as const
export type NoteColor = (typeof NOTE_COLORS)[number]
export const DEFAULT_NOTE_COLOR: NoteColor = 'cream'

// Paper fill + a matching washi-tape tint for each color. Dark text throughout
// so the cards always read as paper in both light and dark themes.
export const NOTE_COLOR_STYLES: Record<
  NoteColor,
  { paper: string; tape: string; swatch: string }
> = {
  // Default — matches the site's light-mode page background (--background: 36 44% 94%).
  cream: { paper: 'bg-[#f6f1e9]', tape: 'bg-[#e1d6bd]/70', swatch: 'bg-[#f6f1e9]' },
  blush: { paper: 'bg-[#fde7ec]', tape: 'bg-[#f3b6c4]/70', swatch: 'bg-[#fde7ec]' },
  sky: { paper: 'bg-[#e3f1fb]', tape: 'bg-[#acd2ee]/70', swatch: 'bg-[#e3f1fb]' },
  mint: { paper: 'bg-[#e4f5ea]', tape: 'bg-[#aadcbd]/70', swatch: 'bg-[#e4f5ea]' },
  butter: { paper: 'bg-[#fdf3cf]', tape: 'bg-[#f0dd92]/70', swatch: 'bg-[#fdf3cf]' },
  lilac: { paper: 'bg-[#efe7fb]', tape: 'bg-[#c9b6ec]/70', swatch: 'bg-[#efe7fb]' },
}
