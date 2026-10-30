// All six characters live here as data. The UI reads from this list, so to
// change a description, color, or image you only edit this file.

export type CharacterId =
  | 'protector'
  | 'recreationist'
  | 'organizer'
  | 'environmentalist'
  | 'citizen'
  | 'educator'

// Where the character's card appears on the 1440×1024 character-select screen,
// measured from the Figma frames ("card-slot" x/y).
export type CardPosition = { left: number; top: number }

export type Character = {
  id: CharacterId
  name: string
  icon: { src: string; alt: string; width: number; height: number }
  card: { src: string; width: number; height: number }
  description: string
  strength: string
  weakness: string
  /** Tailwind background class for this character's "select" button */
  buttonClass: string
  cardPosition: CardPosition
}

// Order matters: the first three are the top row of the icon grid,
// the last three are the bottom row (same as Figma).
export const characters: Character[] = [
  {
    id: 'protector',
    name: 'The Protector',
    icon: { src: '/assets/icons/gem.png', alt: 'Red gem', width: 196, height: 213 },
    card: { src: '/assets/cards/protector.png', width: 500, height: 643 },
    description:
      'Perceives Lake Merritt as a precious resource. Concerned about trash and noise pollution from vendors and community events.',
    strength: 'knows people',
    weakness: 'offends people',
    buttonClass: 'bg-protector',
    cardPosition: { left: 603, top: 190 },
  },
  {
    id: 'recreationist',
    name: 'The Recreationist',
    icon: { src: '/assets/icons/saxophone.png', alt: 'Saxophone', width: 238, height: 263 },
    card: { src: '/assets/cards/recreationist.png', width: 500, height: 643 },
    description:
      'Community member who advocates for a vibrant social scene through public events such as swing dancing and live jazz.',
    strength: 'in the know',
    weakness: 'there to play (only)',
    buttonClass: 'bg-recreationist',
    cardPosition: { left: 65, top: 193 },
  },
  {
    id: 'organizer',
    name: 'The Organizer',
    icon: { src: '/assets/icons/lantern.png', alt: 'Lamppost lantern', width: 274, height: 352 },
    card: { src: '/assets/cards/organizer.png', width: 516, height: 663 },
    description:
      'Coordinates nonprofits and events around Lake Merritt, fundraising for projects that improve the facilities and ambiance.',
    strength: 'legendary fundraiser',
    weakness: 'surface-level motives',
    buttonClass: 'bg-organizer',
    cardPosition: { left: 398, top: 183 },
  },
  {
    id: 'environmentalist',
    name: 'The Environmentalist',
    icon: { src: '/assets/icons/olive.png', alt: 'Olive branch', width: 207, height: 267 },
    card: { src: '/assets/cards/environmentalist.png', width: 500, height: 643 },
    description:
      'Shares scientific knowledge with the community. Prioritizes the health of the lake over social harmony.',
    strength: 'holds sway w/ city',
    weakness: 'scientific elitist',
    buttonClass: 'bg-environmentalist',
    cardPosition: { left: 603, top: 190 },
  },
  {
    id: 'citizen',
    name: 'The Citizen',
    icon: { src: '/assets/icons/house.png', alt: 'House', width: 230, height: 217 },
    card: { src: '/assets/cards/citizen.png', width: 516, height: 663 },
    description:
      'Longstanding Oakland resident. Wants Lake Merritt to be a safer space for families.',
    strength: 'expansive network',
    weakness: 'NIMBY tendencies',
    buttonClass: 'bg-citizen',
    cardPosition: { left: 65, top: 193 },
  },
  {
    id: 'educator',
    name: 'The Educator',
    icon: { src: '/assets/icons/manual.png', alt: 'Newsletter', width: 263, height: 291 },
    card: { src: '/assets/cards/educator.png', width: 528, height: 679 },
    description:
      'Long-time resident, volunteer, and guide. Wants to diversify the community through free events and stewardship projects.',
    strength: 'excellent communicator',
    weakness: 'idealistic',
    buttonClass: 'bg-educator',
    cardPosition: { left: 398, top: 183 },
  },
]

export function getCharacter(id: CharacterId): Character {
  const found = characters.find((c) => c.id === id)
  if (!found) throw new Error(`Unknown character: ${id}`)
  return found
}
