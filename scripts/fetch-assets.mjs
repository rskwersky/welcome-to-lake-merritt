// Downloads the game's images from the Figma file into public/assets.
// The downloaded files are committed, so you only need to run this after
// changing an asset in Figma:   npm run fetch-assets
//
// Every asset is an SVG export of a Figma node. SVG (instead of PNG) because:
//  • vector art (the lantern, the manual, all the text) stays sharp at any size;
//  • raster art (the gem, the cards…) is embedded at its full original resolution,
//    with the exact crop, rounded corners, shadows, and transparency from Figma.
//
// Figma's export service draws things that aren't part of the node: a dark
// #1E1E1E rectangle (the color of the Figma canvas) behind it, the purple dashed
// outline of the component set (for variants), and, for a node nested inside a
// screen, the screen's own background rectangles. This script strips them,
// which is what makes the backgrounds transparent.
//
// The URLs below are temporary Figma export links (they expire about 7 days
// after they were made, around Nov 7, 2026). If they've expired, ask Claude
// Code (with the Figma MCP connected) to "re-export the assets listed in
// scripts/fetch-assets.mjs as SVG and update the URLs". Each entry lists the
// Figma node it came from.
//
// Figma file: https://www.figma.com/design/ngmTVvmsAQ59uJWXg4cbC4/Merritt-Game

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets')
const base = 'https://www.figma.com/api/mcp/asset/'

const assets = [
  // Postcard. Front = game-card side=front. Back = the instance on screen 04,
  // because the screens override the fact text ("Oakland, California").
  { file: 'postcard/front.svg', node: '1:994', id: 'a9fdac2d-97e6-4ea0-8d4f-dd100fbe785d' },
  { file: 'postcard/back.svg', node: '9:214', id: '6020b4fc-13ee-4d06-9f46-a4700d4e121a', keepFrom: 'fact-card' },

  // "Who owns Lake Merritt?" title, with the Boucherie Cursive letters as shapes
  { file: 'history/title.svg', node: '9:249', id: '75ccd826-d259-4bd0-8732-bfc5dc2cda0e', keepFrom: 'history-title' },

  // Character icons (state=default)
  { file: 'icons/gem.svg', node: '1:689', id: '9aa29101-e006-46e9-a739-3cd9c151cf24' },
  { file: 'icons/saxophone.svg', node: '1:434', id: 'ec8eac4d-2580-41af-a921-738278e88b7f' },
  { file: 'icons/lantern.svg', node: '2:1292', id: '5d75a30a-e523-4b9b-86db-087e4cd6334f' },
  { file: 'icons/olive.svg', node: '2:1363', id: 'b4dc9162-e73f-4c1f-8b77-8ac17f4a7eca' },
  { file: 'icons/house.svg', node: '2:1373', id: 'aa36319f-b887-477d-a0cb-cf39262d7cfe' },
  { file: 'icons/manual.svg', node: '2:1417', id: '51bd6812-78ab-46c2-ac4d-14de5ae0b91c' },

  // Character cards (view=blank — the text is added in code)
  { file: 'cards/protector.svg', node: '1:872', id: '27c01a96-b72f-444d-b71c-ccdd4569ac4e' },
  { file: 'cards/recreationist.svg', node: '1:900', id: '68cb2474-2d2e-40f5-8deb-1b7d4e0abbc0' },
  { file: 'cards/environmentalist.svg', node: '21:1030', id: '9c2aeafb-466d-47cc-a102-92fc44451efe' },
  { file: 'cards/citizen.svg', node: '21:1058', id: '9add737c-d57c-41f1-a205-373a446c4cdc' },
  { file: 'cards/organizer.svg', node: '21:2174', id: '5895cb91-53ac-40b2-b137-91f6d4cfadda' },
  { file: 'cards/educator.svg', node: '21:1089', id: '1afa60f6-696a-4747-bd73-6a32c206291a' },
]

// Removes everything that isn't part of the node itself (see top).
// `keepFrom` is the node's layer name: for a nested node, every <rect> drawn
// before that layer belongs to a parent frame (backgrounds, borders), so it goes.
function cleanSvg(svg, keepFrom) {
  let lines = svg.split('\n')
  if (keepFrom) {
    const start = lines.findIndex((line) => line.includes(`id="${keepFrom}"`))
    if (start === -1) throw new Error(`layer "${keepFrom}" not found`)
    lines = lines.filter((line, i) => i >= start || !line.startsWith('<rect'))
  }
  return lines
    .filter((line) => !/^<rect [^>]*fill="#1E1E1E"/.test(line))
    .filter((line) => !/^<rect [^>]*stroke="#8A38F5"/.test(line))
    .join('\n')
    .replace(NOISE_COLOR, NOISE_COLOR_SOFT)
}

// The postcard has Figma's "noise" effect (black specks at 25%). Figma draws it
// as a barely-visible texture, but browsers render the exported SVG filter much
// coarser, so the card looked like sandpaper. 6% looks like Figma's version.
const NOISE_COLOR = /flood-color="rgba\(0, 0, 0, 0\.25\)" result="color1Flood"/g
const NOISE_COLOR_SOFT = 'flood-color="rgba(0, 0, 0, 0.06)" result="color1Flood"'

let failed = 0
for (const { file, node, id, keepFrom } of assets) {
  const dest = join(root, file)
  try {
    const res = await fetch(base + id + '.svg')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const svg = cleanSvg(await res.text(), keepFrom)
    if (/<rect [^>]*#1E1E1E/.test(svg)) throw new Error('canvas background was not removed')
    await mkdir(dirname(dest), { recursive: true })
    await writeFile(dest, svg)
    console.log(`✓ ${file}`)
  } catch (err) {
    failed++
    console.error(`✗ ${file} (Figma node ${node}): ${err.message}`)
  }
}

if (failed) {
  console.error(`\n${failed} image(s) failed. The links may have expired — see the note at the top of this file.`)
  process.exit(1)
}
console.log('\nAll images downloaded to public/assets.')
