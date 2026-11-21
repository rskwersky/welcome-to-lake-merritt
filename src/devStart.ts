// A testing shortcut: open the app straight on any screen, instead of
// clicking through from the start. Only works while developing
// (`npm run dev`); the built site always starts at the beginning.
//
//   http://localhost:5173/?screen=tutorial
//   http://localhost:5173/?screen=tutorial&players=4
//   http://localhost:5173/?screen=tutorial&characters=citizen,organizer
//
// screen:     game-overview, landing, history-short, how-to-play,
//             player-count, character-select, tutorial, game
// players:    1 to 6 (default 6). Players get characters in grid order.
// characters: pick exactly which characters, in player order
//             (sets the player count too).

import { characters } from './data/characters'
import { MAX_PLAYERS, MIN_PLAYERS, type CharacterId } from './data/gameRules'

export const SCREEN_NAMES = [
  'game-overview',
  'landing',
  'history-short',
  'how-to-play',
  'player-count',
  'character-select',
  'tutorial',
  'game',
] as const
export type ScreenName = (typeof SCREEN_NAMES)[number]

type DevStart = { screen: ScreenName; playerCount: number; picks: CharacterId[] }

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
  return { screen, playerCount: count, picks }
}
