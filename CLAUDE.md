# Notes for Claude Code

## Project
Web prototype of "Welcome to Lake Merritt", a 6-player roleplaying game about
stewardship of Oakland's Lake Merritt. Portfolio piece.

Stack: React 19 + TypeScript + Tailwind CSS v4 (via `@tailwindcss/vite`) + Vite.
No router, no state library, no animation library, on purpose: the owner is
learning, so keep dependencies minimal and code readable. Prefer plain React state,
CSS transitions, and Tailwind utilities. Add a library only when it clearly earns its
place, and explain why.

## Design source
Figma file: https://www.figma.com/design/ngmTVvmsAQ59uJWXg4cbC4/Merritt-Game
- Screens are top-level frames named `NN screen-name / state`
  (e.g. `06 character select / organizer – selected`).
- Components: `icon / <name>` (state = default/hover/dimmed),
  `character-card / <name>` (view = blank/stats/description),
  `button` (label = …), `game-card` (side = front/back).
- Interaction notes are written as Dev Mode annotations on the frames. Read them.
- Images are exported to `public/assets/` by `scripts/fetch-assets.mjs`.
  When adding assets, add them to that script with their Figma node id.

## Conventions
- Game screens use `<Stage>` and the exact Figma pixel positions (1440×1024 frame).
  Scrolling, text-heavy pages use normal responsive layout.
- Content (character text, history text) lives in `src/data/`, not in components.
- Colors and fonts are tokens in `src/index.css` `@theme`. Use `bg-organizer` etc.,
  not hex codes.
- Respect `prefers-reduced-motion` (`motion-reduce:` variants) for every animation.
- Interactive things are real `<button>`s with labels; keep keyboard support (Esc deselects).
- Comment the *why* in plain language; the owner reads the code to learn.

## Commands
- `npm run dev`: dev server
- `npm run build`: type-check + production build (run before committing)
- `npm run lint`: oxlint
- `npm run fetch-assets`: download Figma images

## Next up
- Design and build the screen after character select (replace `Confirmed.tsx`).
- Confirm the select-button colors for environmentalist, citizen, educator.
