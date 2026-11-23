// A testing shortcut: open the app straight on any screen, instead of
// clicking through from the start. Only works while developing
// (`npm run dev`); the built site always starts at the beginning.
//
//   http://localhost:5173/?screen=tutorial
//   http://localhost:5173/?screen=tutorial&players=4
//   http://localhost:5173/?screen=tutorial&characters=citizen,organizer
//   http://localhost:5173/?screen=game&players=4&round=15   (the last round)
//   http://localhost:5173/?screen=game-over&players=4       (the end cards)
//
// screen:     game-overview, landing, history-short, how-to-play,
//             player-count, character-select, tutorial, game,
//             history-long, game-over
// players:    1 to 6 (default 6). Players get characters in grid order.
// characters: pick exactly which characters, in player order
//             (sets the player count too).
// round:      with screen=game, start at this round (2 to 15). Earlier
//             rounds are played for you with random choices, so the
//             debrief has a history to work with.
// game-over:  a whole game played for you, straight to the final report.

import { characters } from './data/characters'
import { MAX_PLAYERS, MIN_PLAYERS, TOTAL_ROUNDS, type CharacterId } from './data/gameRules'

export const SCREEN_NAMES = [
  'game-overview',
  'landing',
  'history-short',
  'how-to-play',
  'player-count',
  'character-select',
  'tutorial',
  'game',
  'history-long',
  'game-over',
] as const
export type ScreenName = (typeof SCREEN_NAMES)[number]

type DevStart = { screen: ScreenName; playerCount: number; picks: CharacterId[]; round: number }

export function readDevStart(): DevStart | null {
  if (!import.meta.env.DEV) return null
  const params = new URLSearchParams(window.location.search)
  const screen = params.get('screen') as ScreenName | null
  if (!screen || !SCREEN_NAMES.includes(screen)) return null

  const ids = characters.map((c) => c.id)
  const chosen = (params.get('characters') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is CharacterId => (ids as string[]).includes(s))
  const count = chosen.length || Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Number(params.get('players')) || MAX_PLAYERS))
  // Character select starts with nobody picked, unless characters are given.
  const picks = chosen.length ? chosen : screen === 'character-select' ? [] : ids.slice(0, count)
  const round = Math.min(TOTAL_ROUNDS, Math.max(2, Number(params.get('round')) || 2))
  return { screen, playerCount: count, picks, round }
}
