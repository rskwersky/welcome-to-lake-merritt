// Game logic that the tutorial (and later the real game) share. No React here:
// just plain data in, plain data out, so it's easy to read and test.
// The numbers themselves (starting tokens, the city bank rule) live in
// src/data/gameRules.ts.

import { EVENTS, type Cost, type Effect } from '../data/events'
import {
  STARTING_TOKENS,
  TOKEN_ORDER,
  TOTAL_ROUNDS,
  TUTORIAL_EVENT_ID,
  isResetAfter,
  cityBankPool,
  isCityUnlocked,
  type CharacterId,
  type Metric,
  type TokenType,
  type Tokens,
} from '../data/gameRules'

/** A player and the character they picked. `number` is 1–6. */
export type Player = { number: number; character: CharacterId }

/** Turns character select's list (picks[0] = Player 1) into players, in player order. */
export function playersFromPicks(picks: CharacterId[]): Player[] {
  return picks.map((character, i) => ({ number: i + 1, character }))
}

export const noTokens = (): Tokens => ({ political: 0, social: 0, economic: 0 })

export function costOf(cost: Cost, type: TokenType): number {
  return cost[type] ?? 0
}

// ---------------------------------------------------------------------------
// Who holds what
// Tokens belong to characters. Each character (and the city bank) starts a
// reset cycle with a set number of tokens; we track how many were *spent*.
// What's left = start − spent.

/** "city" = the shared city bank made of the unclaimed characters' tokens. */
export type Holder = CharacterId | 'city'

export type Spent = Partial<Record<Holder, Tokens>>

export function startingTokens(holder: Holder, players: Player[]): Tokens {
  if (holder === 'city') return cityBankPool(players.map((p) => p.character))
  return STARTING_TOKENS[holder]
}

export function remaining(holder: Holder, players: Player[], spent: Spent): Tokens {
  const start = startingTokens(holder, players)
  const used = spent[holder] ?? noTokens()
  return { political: start.political - used.political, social: start.social - used.social, economic: start.economic - used.economic }
}

/** With fewer than 6 players there's a city bank; with all 6 there isn't. */
export function hasCityBank(players: Player[]): boolean {
  return players.length < 6
}

// ---------------------------------------------------------------------------
// The allocate-tokens popup
// Players type how many of each token type they give toward the cost.

export type Allocation = Partial<Record<Holder, Tokens>>

/** locked = the city bank isn't open for this type yet; unneeded = the cost has none of this type */
export type InputState = 'default' | 'error' | 'complete' | 'locked' | 'unneeded'

export type AllocationCheck = {
  /** How each box should look: error = more than they have (or more than needed) */
  input: (holder: Holder, type: TokenType) => InputState
  /** How many of each type have been put in so far */
  total: Record<TokenType, number>
  /** True when every type is covered exactly and nothing is wrong */
  ready: boolean
}

export function checkAllocation(cost: Cost, allocation: Allocation, players: Player[], spent: Spent): AllocationCheck {
  const given = (h: Holder, t: TokenType) => allocation[h]?.[t] ?? 0
  const holders: Holder[] = [...players.map((p) => p.character), ...(hasCityBank(players) ? (['city'] as const) : [])]

  const total = noTokens()
  for (const t of TOKEN_ORDER) for (const h of holders) total[t] += given(h, t)

  // The city bank's box for a type opens only once every player has used up
  // all of their own tokens of that type (counting what they've typed here).
  const cityOpen = (t: TokenType) =>
    isCityUnlocked(players.map((p) => remaining(p.character, players, spent)[t] - given(p.character, t)))

  const input = (h: Holder, t: TokenType): InputState => {
    if (costOf(cost, t) === 0) return 'unneeded'
    if (h === 'city' && !cityOpen(t)) return 'locked'
    const have = remaining(h, players, spent)[t]
    const g = given(h, t)
    if (g > have) return 'error'
    if (g > 0 && total[t] > costOf(cost, t)) return 'error'
    if (have > 0 && g === have) return 'complete'
    return 'default'
  }

  const anyError = holders.some((h) => TOKEN_ORDER.some((t) => input(h, t) === 'error'))
  const covered = TOKEN_ORDER.every((t) => total[t] === costOf(cost, t))
  // A locked city box can't count, even if something was typed before it locked.
  const lockedButUsed = TOKEN_ORDER.some((t) => given('city', t) > 0 && input('city', t) === 'locked')

  return { input, total, ready: covered && !anyError && !lockedButUsed }
}

/** Adds this round's allocation to what each holder has spent. */
export function spend(spent: Spent, allocation: Allocation): Spent {
  const next: Spent = { ...spent }
  for (const [holder, tokens] of Object.entries(allocation) as [Holder, Tokens][]) {
    const before = next[holder] ?? noTokens()
    next[holder] = {
      political: before.political + tokens.political,
      social: before.social + tokens.social,
      economic: before.economic + tokens.economic,
    }
  }
  return next
}

/**
 * Can the group pay for this option at all? Every type it needs must be
 * covered by what the players and the city bank have left together. (The
 * city bank's lock only says *when* it can chip in, not whether.) Options the
 * group can't afford are greyed out on the event card, so nobody gets stuck.
 */
export function canAfford(cost: Cost, players: Player[], spent: Spent): boolean {
  const holders: Holder[] = [...players.map((p) => p.character), ...(hasCityBank(players) ? (['city'] as const) : [])]
  return TOKEN_ORDER.every((t) => holders.reduce((sum, h) => sum + remaining(h, players, spent)[t], 0) >= costOf(cost, t))
}

// ---------------------------------------------------------------------------
// The lake's metrics

export type Metrics = Record<Metric, number>

export const startingMetrics = (): Metrics => ({ environment: 0, accessibility: 0, reputation: 0 })

export function applyEffect(metrics: Metrics, effect: Effect): Metrics {
  return {
    environment: metrics.environment + effect.environment,
    accessibility: metrics.accessibility + effect.accessibility,
    reputation: metrics.reputation + effect.reputation,
  }
}

/** Score tracker order, top to bottom, with the labels Figma uses. */
export const METRIC_ROWS: { metric: Metric; label: string }[] = [
  { metric: 'environment', label: 'environmental health' },
  { metric: 'reputation', label: 'reputation' },
  { metric: 'accessibility', label: 'social accessibility' },
]

// ---------------------------------------------------------------------------
// A whole game (rounds 1–15)
// The tutorial is round 1. Each round draws the next card from the deck.
// After rounds 5 and 10 every holder's tokens reset (spent is cleared).

/** What happened in one round: which card, and which option (0 to 2) the group chose. */
export type RoundRecord = { eventId: string; option: number }

export type GameState = {
  players: Player[]
  /** The round being played now (1–15). 16 = the game is over. */
  round: number
  /** Event ids still in the deck, top card first */
  deck: string[]
  spent: Spent
  metrics: Metrics
  /** Every finished round, in order. The debrief is built from it. */
  history: RoundRecord[]
}

/** A random order (Fisher–Yates shuffle: swap each card with a random earlier one). */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** After the tutorial: round 2, the other 14 cards shuffled, tutorial spending and choice kept. */
export function gameAfterTutorial(players: Player[], spent: Spent, metrics: Metrics, tutorialOption: number): GameState {
  return {
    players,
    round: 2,
    deck: shuffle(EVENTS.map((e) => e.id).filter((id) => id !== TUTORIAL_EVENT_ID)),
    spent,
    metrics,
    history: [{ eventId: TUTORIAL_EVENT_ID, option: tutorialOption }],
  }
}

/** "restart game": round 1, full tokens, all 15 cards shuffled, metrics at 0. */
export function freshGame(players: Player[]): GameState {
  return { players, round: 1, deck: shuffle(EVENTS.map((e) => e.id)), spent: {}, metrics: startingMetrics(), history: [] }
}

export function topCard(game: GameState) {
  return EVENTS.find((e) => e.id === game.deck[0])
}

export function isGameOver(game: GameState): boolean {
  return game.round > TOTAL_ROUNDS || game.deck.length === 0
}

/**
 * Finish a round with the chosen option (0 to 2): spend the tokens, change
 * the metrics, write it in the history, discard the card, maybe reset tokens.
 */
export function finishRound(game: GameState, allocation: Allocation, option: number): GameState {
  const card = topCard(game)
  if (!card) return game
  const reset = isResetAfter(game.round)
  return {
    ...game,
    round: game.round + 1,
    deck: game.deck.slice(1),
    spent: reset ? {} : spend(game.spent, allocation),
    metrics: applyEffect(game.metrics, card.options[option].effect),
    history: [...game.history, { eventId: card.id, option }],
  }
}

/**
 * A made-up game for testing (dev shortcuts only): plays rounds 1 to
 * `untilRound − 1` with random choices the group could afford, so the
 * ending and debrief have real-looking history to show.
 */
export function simulatedGame(players: Player[], untilRound: number): GameState {
  let game = freshGame(players)
  while (game.round < untilRound && !isGameOver(game)) {
    const card = topCard(game)!
    // Prefer funded fixes, sometimes compromise, rarely do nothing; skip what's unaffordable.
    const roll = Math.random()
    const wanted = roll < 0.55 ? 0 : roll < 0.85 ? 1 : 2
    const option = [wanted, 1, 2].find((i) => canAfford(card.options[i].cost, players, game.spent)) ?? 2
    // Pay from the whole group's tokens, players first, then the city bank.
    const allocation = payFor(card.options[option].cost, players, game.spent)
    game = finishRound(game, allocation, option)
  }
  return game
}

/** Covers a cost from whoever still has tokens (used by simulatedGame). */
function payFor(cost: Cost, players: Player[], spent: Spent): Allocation {
  const holders: Holder[] = [...players.map((p) => p.character), ...(hasCityBank(players) ? (['city'] as const) : [])]
  const allocation: Allocation = {}
  for (const t of TOKEN_ORDER) {
    let need = costOf(cost, t)
    for (const h of holders) {
      const give = Math.min(need, remaining(h, players, spent)[t])
      if (give > 0) {
        allocation[h] = { ...(allocation[h] ?? noTokens()), [t]: give }
        need -= give
      }
    }
  }
  return allocation
}
