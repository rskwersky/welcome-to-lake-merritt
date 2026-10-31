# Welcome to Lake Merritt

A 6-player roleplaying game about who cares for Oakland's Lake Merritt, built from
interviews with real Oakland organizers and residents. No one can win: stewardship
is never finished, and compromise is inevitable.

This repo is the web prototype of the game's intro: the postcard landing, the
history of the lake, and character select. Designed in Figma, built with
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

## The flow

```
landing ──learn more──▶ choose length ──▶ history (long / short) ──┐
   └──────────play game───────────────────────────────────────────┴─▶ character select ──▶ confirmed
```

| Figma frame | Code |
| --- | --- |
| 01 landing, 02 fact card, 03 learn more or play | `src/screens/Landing.tsx` |
| 04 choose history length | `src/screens/ChooseLength.tsx` |
| 05 history / long, 05 history / short | `src/screens/History.tsx` |
| 06 character select / … | `src/screens/CharacterSelect.tsx` |
| (next screen, not designed yet) | `src/screens/Confirmed.tsx` (placeholder) |

## How the code is organized

```
src/
  App.tsx              Which screen is showing (a small state machine)
  index.css            Tailwind + design tokens (colors, fonts) from Figma
  data/
    characters.ts      All six characters: text, colors, images, card positions
    history.ts         The long and short history, one string per paragraph
  components/
    Stage.tsx          Scales a 1440×1024 Figma frame to fit any window
    Button.tsx         The cream / colored button
    Postcard.tsx       The flip card (CSS 3D, no library)
    CharacterIcon.tsx  One icon in the grid: default / active / dimmed
    CharacterCard.tsx  A character card: Figma image + live text
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

- Click an icon: it lifts with a glow, the other five dim, and its card appears.
- Click anywhere outside the card (or press **Esc**) to deselect.
- Click a different icon to switch characters directly.
- **select** under the card confirms the character.

## Known gaps

- **Script font:** Figma uses *Boucherie Cursive*. If you have the font file, save it
  as `public/fonts/BoucherieCursive.woff2` and it's used automatically. Until then,
  *Dancing Script* (Google Fonts) stands in.
- **Select-button colors** for the Environmentalist (green), Citizen (blue), and
  Educator (periwinkle) were matched by best guess. Adjust them in `src/index.css`.
- **Phones:** the stage-scaled screens shrink to fit, which works but gets small on
  phones. The history page is fully responsive.

## Deploy

`npm run build` makes a static site in `dist/`. Any static host works. For
example, connect the GitHub repo to Vercel or Netlify, or use GitHub Pages.
