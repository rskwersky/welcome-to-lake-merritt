// Game rules as data. Every number here was balance-tested (20,000 simulated
// games); see docs/game-rules.md before changing one.

export type CharacterId =
  | 'organizer'
  | 'recreationist'
  | 'protector'
  | 'environmentalist'
  | 'citizen'
  | 'educator'

export type TokenType = 'political' | 'social' | 'economic'
export type Metric = 'environment' | 'accessibility' | 'reputation'

export type Tokens = Record<TokenType, number>

/** Tokens each character starts with, and goes back to at every reset. Matches the player cards in Figma. */
export const STARTING_TOKENS: Record<CharacterId, Tokens> = {
  organizer: { political: 2, social: 2, economic: 2 },
  recreationist: { political: 0, social: 5, economic: 1 },
  protector: { political: 1, social: 3, economic: 2 },
  environmentalist: { political: 3, social: 1, economic: 2 },
  citizen: { political: 1, social: 3, economic: 2 },
  educator: { political: 2, social: 3, economic: 1 },
}

/** Display order of token rows everywhere in the UI (roster, popup, cost bars). */
export const TOKEN_ORDER: TokenType[] = ['social', 'economic', 'political']

export const MIN_PLAYERS = 1
export const MAX_PLAYERS = 6

/** Every N rounds, all tokens (players and city bank) go back to their starting values. Unspent tokens are lost. */
export const ROUNDS_PER_RESET = 5

/** 15 events = exactly three reset cycles. The tutorial plays the first event and counts as round 1. */
export const TOTAL_ROUNDS = 15
export const TUTORIAL_EVENT_ID = 'graffiti-at-the-boathouse'

/** Rounds left before the next reset, for the round counter. Round numbers start at 1. */
export function roundsUntilReset(round: number): number {
  return ROUNDS_PER_RESET - ((round - 1) % ROUNDS_PER_RESET)
}

export function isResetAfter(round: number): boolean {
  return round % ROUNDS_PER_RESET === 0 && round < TOTAL_ROUNDS
}

// ---------------------------------------------------------------------------
// City bank
// Characters nobody claims still exist; their tokens are pooled into one city
// bank. The city can only cover a token type once every player has used up
// their own tokens of that type, so players can't spend the city's tokens
// instead of their own. This keeps difficulty identical for 1–6 players.

export function cityBankPool(claimed: CharacterId[]): Tokens {
  const pool: Tokens = { political: 0, social: 0, economic: 0 }
  for (const id of Object.keys(STARTING_TOKENS) as CharacterId[]) {
    if (claimed.includes(id)) continue
    for (const t of TOKEN_ORDER) pool[t] += STARTING_TOKENS[id][t]
  }
  return pool
}

/**
 * Is the city bank's input for this token type unlocked?
 * @param playersRemaining tokens each player still has of this type, after what they've typed into the popup so far
 */
export function isCityUnlocked(playersRemaining: number[]): boolean {
  return playersRemaining.every((n) => n === 0)
}

// ---------------------------------------------------------------------------
// Score tracker (option 1)
// One star = 2 points, half stars allowed. 15 star slots per metric with zero
// after the 5th slot, so each bar shows −10 to +20. Every metric starts at 0
// ("the lake as it is today"). Values beyond the range are clamped.

export const TRACKER = {
  pointsPerStar: 2,
  slots: 15,
  zeroAfterSlot: 5,
  minPoints: -10,
  maxPoints: 20,
  startPoints: 0,
} as const

/** Signed number of stars to draw for a metric value, in half-star steps. Negative = pink stars left of zero. */
export function pointsToStars(points: number): number {
  const clamped = Math.max(TRACKER.minPoints, Math.min(TRACKER.maxPoints, points))
  return Math.round((clamped / TRACKER.pointsPerStar) * 2) / 2
}
