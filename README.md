# Welcome to Lake Merritt

A roleplaying game for 1–6 players about who cares for Oakland's Lake Merritt, built from
interviews with real Oakland organizers and residents. No one can win: stewardship
is never finished, and compromise is inevitable.

This repo is the web version of the game, built one Figma section at a time.
Done so far: **1 · intro** (game overview, postcard landing, history),
**2 · setup** (game manual, player count), **3 · character select** and
**4 · tutorial** (round 1 on the game board).
The full rules are in `docs/game-rules.md`. Designed in Figma, built with
**React + TypeScript + Tailwind CSS**, bundled with **Vite**.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install          # install dependencies
npm run dev          # start the dev server → open the URL it prints
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Type-checks and builds the site into `dist/` |
| `npm run preview` | Serves the built `dist/` folder locally |
| `npm run lint` | Checks the code for common mistakes |
| `npm run fetch-assets` | Re-downloads the images from Figma (only after changing them in Figma) |

> **The images are already in `public/assets/`.** Run `fetch-assets` only after
> you change a postcard, icon, or card in Figma, then commit the new files.
>
> **If `fetch-assets` fails:** the Figma export links expire after about a week.
> Open the project in Claude Code with the Figma MCP connected and ask it to
> re-export the assets listed in `scripts/fetch-assets.mjs`. Each entry lists the
> Figma node it came from.

## Jump to a screen while testing

With `npm run dev` running, add `?screen=` to the address to open a screen
directly, with made-up players (only in development, never on the built site):

| Address | Opens |
| --- | --- |
| `localhost:5173/?screen=tutorial` | the tutorial with 6 players |
| `localhost:5173/?screen=tutorial&players=4` | the tutorial with 4 players (city bank shows) |
| `localhost:5173/?screen=tutorial&characters=citizen,organizer` | exactly these characters, as P1 and P2 |
| `localhost:5173/?screen=character-select&players=3` | character select for 3 players |
| `localhost:5173/?screen=how-to-play` | the game manual |

Screen names: `game-overview`, `landing`, `history-short`, `how-to-play`,
`player-count`, `character-select`, `tutorial`, `game`. See `src/devStart.ts`.

## The flow

```
01 game overview ──play game──▶ 02 landing ──click postcard──▶ 03 did you know
  ──learn more──▶ 04 history / short ──continue──▶ 05 how to play (manual)
  ──continue──▶ 06 player count ──continue──▶ 07 character select (once per player)
  ──continue──▶ 08 tutorial / 1–8 ──start game──▶ 09 game board (not built yet)
```

| Figma frame | Code |
| --- | --- |
| 01 game overview | `src/screens/GameOverview.tsx` |
| 02 landing, 03 did you know | `src/screens/Landing.tsx` (03 is 02 with the postcard flipped) |
| 04 history / short, 04 history / long (from the game menu, later) | `src/screens/History.tsx` |
| 05 how to play (manual, scrolls sideways) | `src/screens/HowToPlay.tsx` |
| 06 player count / default, / selected | `src/screens/PlayerCount.tsx` |
| 07 character select / … | `src/screens/CharacterSelect.tsx` |
| 08 tutorial / 1–8 (and 4b, city bank) | `src/screens/Tutorial.tsx` |
| 09 game board and later | `src/screens/NotBuiltYet.tsx` (placeholder) |

## How the code is organized

```
src/
  App.tsx              Which screen is showing (a small state machine)
  index.css            Tailwind + design tokens (colors, fonts) from Figma
  data/
    gameRules.ts       Starting tokens, resets, city bank, score tracker (balance-tested)
    events.ts          The 15 event cards
    characters.ts      The six characters' descriptions and goals
    manual.ts          The words on the game manual pages
    history.ts         The long and short history, one string per paragraph
  components/
    Stage.tsx          Scales a 1440×1024 Figma frame to fit any window
    Button.tsx         The cream / colored button
    Postcard.tsx       The flip card (CSS 3D, no library)
    CharacterToken.tsx The small round character icon
    CharacterCard.tsx  A character card: picture side, description side, taken
    PlayerBadge.tsx    The P1–P6 tag (large on cards, small on the board)
    SmallButton.tsx    The small button (turns gold on hover, greyed when disabled)
    TokenIcon.tsx      One social / economic / political token
    Tip.tsx            The tutorial's tip box and arrow button
    board/             The game board: map, deck, round counter, score tracker, roster
    popups/            Event card, allocate tokens, metric change
  game/
    state.ts           Game logic: who holds which tokens, the city bank rule, metrics
  hooks/
    useInView.ts       "Has this scrolled into view?" — drives the history fade-ins
  screens/             One file per screen (see table above)
scripts/
  fetch-assets.mjs     Downloads the Figma images
```

### Ideas worth reading in the code

- **Content is data.** Characters and history text live in `src/data/`. The
  screens loop over that data, so editing a description never means touching UI code.
- **The stage.** `Stage.tsx` lets the game screens use the exact pixel positions from
  Figma, then scales the whole frame with a CSS `transform`. The history page is a
  normal scrolling page instead, so it reflows on phones.
- **State drives looks.** `CharacterSelect.tsx` stores one value, `selectedId`.
  Every icon's state (`default`, `active`, `dimmed`) is computed from it, so the UI
  can't get out of sync.
- **Design tokens.** Colors like `--color-organizer` in `index.css` become Tailwind
  classes (`bg-organizer`) automatically. That's Tailwind v4's `@theme`.

## Character select behavior

- Players take turns: "Player 1, choose your character:", then Player 2, and so on.
- Hover (or tab to) a card: it flips over to show who they are and their goals.
- Click a card: it's yours. It darkens and gets your badge (P1–P6).
- When everyone has picked, **continue** appears. Click a badge to let that
  player choose again.

## Known gaps

- **Script font:** *Boucherie Cursive* is an Adobe Font, loaded from the Adobe web
  project in `index.html`. Adobe only serves it to domains listed in that web project,
  so add the deploy domain there. *Dancing Script* shows if it can't load.
- **Phones:** the stage-scaled screens shrink to fit, which works but gets small on
  phones. The history page is fully responsive.

## Deploy

`npm run build` makes a static site in `dist/`. Any static host works. For
example, connect the GitHub repo to Vercel or Netlify, or use GitHub Pages.
