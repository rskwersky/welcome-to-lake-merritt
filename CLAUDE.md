# Notes for Claude Code

## Project
Web version of "Welcome to Lake Merritt", a roleplaying game for 1–6 players about who cares
for Oakland's Lake Merritt. Built from interviews with Oakland organizers and residents.
Portfolio piece. There is no winner: players try to improve three lake metrics while
arguing for their character's goals.

Stack: React 19 + TypeScript + Tailwind CSS v4 (via `@tailwindcss/vite`) + Vite.
No router, state library or animation library, on purpose: the owner is learning, so keep
dependencies minimal and code readable. Prefer plain React state, CSS transitions/keyframes
and Tailwind utilities. Add a library only when it clearly earns its place, and explain why.

## Read these first
- `docs/game-rules.md` — every rule in plain words.
- `src/data/gameRules.ts` — starting tokens, resets, city bank rule, score tracker scale.
- `src/data/events.ts` — the 15 event cards (costs, effects, who pushes for each option).
These numbers were balance-tested. Don't change them without saying so.
`gameRules.ts` defines `CharacterId`; if `src/data/characters.ts` also defines one, make
characters.ts import it from gameRules.ts so there is a single source.

## Design source (Figma)
https://www.figma.com/design/ngmTVvmsAQ59uJWXg4cbC4/Merritt-Game — use the Figma MCP.

Screens are 1440×1024 frames grouped in sections, numbered in flow order:
- **1 · intro**: 01 game overview → 02 landing → 03 did you know → 04 history / short
  (04 history / long is only opened from the game menu)
- **2 · setup**: 05 how to play (manual, horizontal scroll) → 06 player count
- **3 · character select**: 07 … (repeats once per player)
- **4 · tutorial**: 08 tutorial / 1–8 (the tutorial is round 1)
- **4b · city bank pool (approved design)**: how the popup and roster look with fewer than 6 players
- **5 · game board + explore mode**: 09 game board, 10 explore / …, new game confirmation

**Dev Mode annotations** on frames and layers describe every interaction (blue = interaction,
green = rules/logic). Read them for each screen before building it.

Reusable components live in the **🧩 components** section: `character-card`
(character × state: default / description / taken), `player-card`, `character-token`,
`player-badge`, `player-count-option`, `button / large`, `button / small`, `menu-button`,
`event-deck`, `postcard`, `resource-token`, `token-input` (default / error / complete),
`arrow-button`, `icon / …`, `color-palette`. Build one React component per Figma component.

Ignore: sections starting with 🗄 (old designs) or 🗑 (unused duplicates), and loose
layers outside sections.

## Build order
Build and show one section at a time; wait for review before the next:
1. intro, 2. setup, 3. character select, 4. tutorial, 5. game board + explore mode, then the
city bank variations. The end screen isn't designed yet: ask before building it.

## Conventions
- Game screens use `<Stage>` with the exact Figma pixel positions (1440×1024). Long
  scrolling text pages (history) use normal responsive layout.
- Content and numbers live in `src/data/`, not in components.
- Colors and fonts are tokens in `src/index.css` `@theme` (e.g. `bg-organizer`), not hex codes.
- Hover on clickable objects (cards, postcards, manual, map stars) = a small lift: a few px
  up with a slightly larger shadow. Glow is only the tutorial's "click this next" cue.
- Respect `prefers-reduced-motion` for every animation (`motion-reduce:` variants).
- Interactive things are real `<button>`s with labels; keep keyboard support (Esc closes popups).
- Comment the *why* in plain language; the owner reads the code to learn.

## Fonts
- Courier Prime: Google Fonts (already in `index.html`).
- Boucherie Cursive is an **Adobe Font**: it cannot be downloaded or self-hosted. Load it with
  the web-project embed in `index.html`'s `<head>`:
  `<link rel="stylesheet" href="https://use.typekit.net/rnt1frz.css">`
  Then use the CSS family name shown in the Adobe web project (probably `boucherie-cursive`)
  first in `--font-script` in `src/index.css`, keeping Dancing Script as the fallback.
  Remove the old `@font-face` for `/fonts/BoucherieCursive.woff2`.

## Commands
- `npm run dev` — dev server
- `npm run build` — type-check + production build (run before committing)
- `npm run lint` — lint
- `npm run fetch-assets` — old Figma image script (links expired); export new assets with the Figma MCP instead

## Existing code (from the first prototype, October)
`Stage`, `Button`, `Postcard` (3D flip), `useInView` and the history screen are reusable.
`CharacterSelect`, `CharacterIcon`, `CharacterCard` and `Confirmed` follow an older design
(icon grid with a pop-out card) and should be rebuilt to the new character-card grid.
