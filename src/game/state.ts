// Game logic that the tutorial (and later the real game) share. No React here:
// just plain data in, plain data out, so it's easy to read and test.
// The numbers themselves (starting tokens, the city bank rule) live in
// src/data/gameRules.ts.

import type { Cost, Effect } from '../data/events'
import {
  STARTING_TOKENS,
  TOKEN_ORDER,
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

export type InputState = 'default' | 'error' | 'complete' | 'locked'

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
