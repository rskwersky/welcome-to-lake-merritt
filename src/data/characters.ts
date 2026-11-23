// The six characters' words, as printed on the back ("description" side) of
// each character card in Figma. Edit the text here; the card layout lives in
// src/components/CharacterCard.tsx.
//
// Every card reads as one sentence: the intro leads into the two starred goals
// ("…who strives to" → "Raise money…").

import type { CharacterId } from './gameRules'

// CharacterId is defined once, in gameRules.ts, next to the starting tokens.
export type { CharacterId }

export type Character = {
  id: CharacterId
  name: string
  intro: string
  goals: [string, string]
}

/** In the order of the character select grid: top row, then bottom row. */
export const characters: Character[] = [
  {
    id: 'organizer',
    name: 'The Organizer',
    intro: 'Coordinates events and nonprofits for Lake Merritt. Expert fundraiser who strives to',
    goals: ['Raise money to improve the facilities and ambiance', 'Mediate between characters as a liaison'],
  },
  {
    id: 'recreationist',
    name: 'The Recreationist',
    intro: 'Community member engaged in the vibrant social scene at the lake who',
    goals: ['Advocates for social harmony', 'Draws on lived experience to promote physical and social accessibility'],
  },
  {
    id: 'protector',
    name: 'The Protector',
    intro: 'Nonprofit founder who believes the lake is a precious resource that is in need of saving. Concerned about',
    goals: ['Pollution from events, vendors, and campers', 'The lack of park rangers enforcing rules'],
  },
  {
    id: 'environmentalist',
    name: 'The Environmentalist',
    intro: 'Scientist who maintains the health of the lake’s ecosystem.',
    goals: ['Prioritizes the health of the lake over social harmony', 'Leverages ties to city council to enact desired improvements'],
  },
  {
    id: 'citizen',
    name: 'The Citizen',
    intro: 'Multi-generational, affluent Oakland resident who wants',
    goals: ['Designated spaces and events for families', 'Enforced regulations for noise pollution and trash management'],
  },
  {
    id: 'educator',
    name: 'The Educator',
    intro: 'Long-time resident, volunteer, and guide. Wants to',
    goals: ['Diversify the community through free events and stewardship projects', 'Educate people on the lake’s history'],
  },
]

export function getCharacter(id: CharacterId): Character {
  const found = characters.find((c) => c.id === id)
  if (!found) throw new Error(`Unknown character: ${id}`)
  return found
}
