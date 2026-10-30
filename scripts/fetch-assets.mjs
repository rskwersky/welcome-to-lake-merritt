// Downloads the game's images from the Figma file into public/assets.
// Run once after cloning:   npm run fetch-assets
//
// The URLs below are temporary Figma export links (they expire about 7 days
// after they were made, around Nov 6, 2026). If they've expired, ask Claude
// Code (with the Figma MCP connected) to "re-export the assets listed in
// scripts/fetch-assets.mjs at 2x PNG and update the URLs" — each entry lists
// the Figma node it came from. Or export them from Figma by hand at 2x and save
// them with the same file names.
//
// Figma file: https://www.figma.com/design/ngmTVvmsAQ59uJWXg4cbC4/Merritt-Game

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets')
const base = 'https://www.figma.com/api/mcp/asset/'

const assets = [
  // Postcard (game-card instances on screens 01 and 02, exported with their rotation)
  { file: 'postcard/front.png', node: '1:1059', id: '358df503-be89-4c5f-ae27-2a26ea24ec15' },
  { file: 'postcard/back.png', node: '1:1078', id: '52ae5304-51a8-4d50-ac0e-9d49f1d35a13' },

  // Character icons (state=default)
  { file: 'icons/gem.png', node: '1:689', id: '44661682-df34-44cb-900e-c8f45fbfcdc7' },
  { file: 'icons/saxophone.png', node: '1:434', id: '0dc58552-4afc-4eb4-a165-5103615dca4a' },
  { file: 'icons/lantern.png', node: '2:1292', id: '1b736578-30cb-42fa-a2f0-4b1028fca91e' },
  { file: 'icons/olive.png', node: '2:1363', id: '7105c86f-f268-47eb-bd28-fe0858fcc901' },
  { file: 'icons/house.png', node: '2:1373', id: 'b3344399-36e2-4e24-b268-1e4d524a9880' },
  { file: 'icons/manual.png', node: '2:1417', id: 'c2c85e51-0623-4cc3-b988-7beff60a4db1' },

  // Character cards (view=blank — the text is added in code)
  { file: 'cards/protector.png', node: '1:872', id: '7bc03196-6da0-4187-8c2e-6101bcc0d3f0' },
  { file: 'cards/recreationist.png', node: '1:900', id: 'b62d5324-3e12-411f-9392-17bac7cc6113' },
  { file: 'cards/environmentalist.png', node: '21:1030', id: 'f0d3d0e8-c210-4e98-978a-a64d7e9d7782' },
  { file: 'cards/citizen.png', node: '21:1058', id: '3ccd7848-38c1-4d6f-9fa9-46a1666043ea' },
  { file: 'cards/organizer.png', node: '21:2174', id: 'e718ef79-1bc9-47e7-b27b-626f55360f8d' },
  { file: 'cards/educator.png', node: '21:1089', id: 'a3abe8a2-23e4-4a88-a845-58b01b2f3955' },
]

let failed = 0
for (const { file, node, id } of assets) {
  const dest = join(root, file)
  try {
    const res = await fetch(base + id + '.png')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await mkdir(dirname(dest), { recursive: true })
    await writeFile(dest, Buffer.from(await res.arrayBuffer()))
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
