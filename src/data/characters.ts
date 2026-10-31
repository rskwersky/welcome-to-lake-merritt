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

// Where a piece of text sits on the card, in % of the card's size,
// measured from each Figma "character-card / … view=description" variant.
export type TextSpot = { left: number; top: number; width?: number }

export type Character = {
  id: CharacterId
  name: string
  icon: {
    src: string
    alt: string
    width: number
    height: number
    /** Figma's "hover" variant: where the golden glow ellipse (120×38) sits, in px */
    glow: { left: number; top: number }
  }
  card: {
    src: string
    width: number
    height: number
    /** Only when the image is bigger than the card (a shadow baked into the export) */
    image?: { left: number; top: number; width: number; height: number }
    text: { description: TextSpot; strength: TextSpot; weakness: TextSpot }
  }
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
    icon: {
      src: '/assets/icons/gem.svg',
      alt: 'Red gem',
      width: 196,
      height: 213,
      glow: { left: 38, top: 208 },
    },
    card: {
      src: '/assets/cards/protector.svg',
      width: 500,
      height: 643,
      text: {
        description: { left: 9.2, top: 20.84, width: 84.2 },
        strength: { left: 6.6, top: 82.58 },
        weakness: { left: 7, top: 88.34 },
      },
    },
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
    icon: {
      src: '/assets/icons/saxophone.svg',
      alt: 'Saxophone',
      width: 238,
      height: 263,
      glow: { left: 59, top: 225 },
    },
    card: {
      src: '/assets/cards/recreationist.svg',
      width: 500,
      height: 643,
      // This card's Figma component has its own drop shadow, baked into the image
      image: { left: -4, top: 0, width: 508, height: 651 },
      text: {
        description: { left: 7.8, top: 20.84, width: 84.2 },
        strength: { left: 7.8, top: 81.96 },
        weakness: { left: 7.8, top: 88.34 },
      },
    },
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
    icon: {
      src: '/assets/icons/lantern.svg',
      alt: 'Lamppost lantern',
      width: 274,
      height: 352,
      glow: { left: 62, top: 287 },
    },
    card: {
      src: '/assets/cards/organizer.svg',
      width: 516,
      height: 663,
      text: {
        description: { left: 9.11, top: 18.4, width: 81.59 },
        strength: { left: 6.2, top: 83.26 },
        weakness: { left: 6.59, top: 88.84 },
      },
    },
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
    icon: {
      src: '/assets/icons/olive.svg',
      alt: 'Olive branch',
      width: 207,
      height: 267,
      glow: { left: 44, top: 248 },
    },
    card: {
      src: '/assets/cards/environmentalist.svg',
      width: 500,
      height: 643,
      text: {
        description: { left: 7, top: 20.84, width: 84.2 },
        strength: { left: 6.6, top: 82.58 },
        weakness: { left: 7, top: 88.34 },
      },
    },
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
    // Figma's house hover variant has no glow, so this one is centered like the others
    icon: {
      src: '/assets/icons/house.svg',
      alt: 'House',
      width: 230,
      height: 217,
      glow: { left: 55, top: 205 },
    },
    card: {
      src: '/assets/cards/citizen.svg',
      width: 516,
      height: 663,
      text: {
        description: { left: 9.88, top: 19.91, width: 81.59 },
        strength: { left: 6.01, top: 82.05 },
        weakness: { left: 6.4, top: 87.63 },
      },
    },
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
    icon: {
      src: '/assets/icons/manual.svg',
      alt: 'Newsletter',
      width: 263,
      height: 291,
      glow: { left: 65, top: 250 },
    },
    card: {
      src: '/assets/cards/educator.svg',
      width: 528,
      height: 679,
      text: {
        description: { left: 6.44, top: 18.26, width: 79.73 },
        strength: { left: 4.17, top: 82.77 },
        weakness: { left: 4.55, top: 88.22 },
      },
    },
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
