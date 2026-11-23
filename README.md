# Welcome to Lake Merritt

A roleplaying game for 1–6 players about who cares for Oakland's Lake Merritt, built from
interviews with real Oakland organizers and residents. No one can win: stewardship
is never finished, and compromise is inevitable.

This repo is the web version of the game, built one Figma section at a time.
Done so far: **1 · intro** (game overview, postcard landing, history),
**2 · setup** (game manual, player count), **3 · character select**,
**4 · tutorial** (round 1), **5 · game board + explore mode** (rounds 2 to 15)
and the ending (final report, debrief, feedback).
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
| `localhost:5173/?screen=game&players=4` | the game board at round 2 |
| `localhost:5173/?screen=game&players=4&round=15` | the last round (earlier rounds played for you) |
| `localhost:5173/?screen=game-over&players=4` | a finished game: the final report and debrief |

Screen names: `game-overview`, `landing`, `history-short`, `how-to-play`,
`player-count`, `character-select`, `tutorial`, `game`, `game-over`. See `src/devStart.ts`.

**Phone layout:** the game board switches to its phone layout on any screen
held upright (taller than wide, under 1100px wide). To try it on a computer,
open the browser's device toolbar (Chrome: View → Developer → Developer Tools,
then the phone icon) and pick an iPhone or iPad, then open
`?screen=game&players=4&round=7`.

## Feedback form

The last end card (and "feedback" in the menu) has a text box that emails
players' feedback to you through [Formspree](https://formspree.io), because a
website can't send email on its own. To connect it:

1. Make a free Formspree account and create a form with your email address.
2. Copy `.env.example` to `.env.local` and paste the form's endpoint
   (`https://formspree.io/f/…`) after `VITE_FEEDBACK_URL=`.
3. Restart `npm run dev`. When you publish the site, add the same
   `VITE_FEEDBACK_URL` setting in your hosting service's environment settings.

Until it's connected, the form shows "not connected yet" while developing and
is hidden on the published site.

## The flow

```
01 game overview ──play game──▶ 02 landing ──click postcard──▶ 03 did you know
  ──learn more──▶ 04 history / short ──continue──▶ 05 how to play (manual)
  ──continue──▶ 06 player count ──continue──▶ 07 character select (once per player)
  ──continue──▶ 08 tutorial / 1–8 ──start game──▶ 09 game board (rounds 2 to 15)
  ⇄ 10 explore mode ──after round 15──▶ 10 game ending: final report ▶ debrief ▶ thank you
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
| 09 game board, 10 explore / … | `src/screens/Game.tsx` |
| 04 history / long (menu → learn more) | `src/screens/History.tsx` |
| end screen | `src/screens/NotBuiltYet.tsx` (placeholder) |

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
    phone/             The phone layout: PhoneStage, board column, bottom sheets, menu
  game/
    state.ts           Game logic: who holds which tokens, the city bank rule, metrics
  hooks/
    useInView.ts       "Has this scrolled into view?" — drives the history fade-ins
    usePhoneLayout.ts  "Is this screen held upright?" — picks the phone layout
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
- **One game, two layouts.** `useGameFlow.ts` holds how a round moves along; the
  desktop board (`Game.tsx`) and the phone board (`GamePhone.tsx`) both use it and
  only differ in how things are laid out.
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
- **Phones:** the game board has a phone layout (Figma "6b · mobile hi-fi", M1 to M4).
  Still to build for phones: explore mode (M5), character select (M6), the game
  overview (M7) and the tutorial (M8); until then those screens shrink to fit. The end
  cards on a phone are the desktop ones, shrunk. The history page is fully responsive.

## Deploy

`npm run build` makes a static site in `dist/`. Any static host works. For
example, connect the GitHub repo to Vercel or Netlify, or use GitHub Pages.
