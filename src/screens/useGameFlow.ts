import { useCallback, useEffect, useState } from 'react'
import { measureFlights } from '../components/popups/flights'
import type { Flight } from '../components/popups/MetricChangePopup'
import { STAR_PHOTOS, type MapStarId } from '../data/explore'
import type { CharacterId } from '../data/gameRules'
import { finishRound, isGameOver, topCard, type Allocation, type GameState } from '../game/state'

// How a round moves along, shared by both layouts of the game screen: the
// desktop board (Game.tsx) and the phone board (GamePhone.tsx). They look
// different but follow the same steps, so the steps live here, once:
//
//   board ─draw a card─▶ event ─continue─▶ allocate (if it costs tokens)
//   ─continue─▶ metrics ─continue─▶ stars fly ─land─▶ next round
//
// A "hook" is a function that keeps React state for a component; calling
// useGameFlow() inside a screen gives it all of this state and the actions
// that change it.

export type Phase = 'board' | 'event' | 'allocate' | 'metrics'
export type Popup =
  | { kind: 'star'; star: MapStarId }
  | { kind: 'character'; id: CharacterId }
  | { kind: 'city-bank' }
  | { kind: 'manual' }
  | { kind: 'new-game' }
  | { kind: 'feedback' }
  | null

export function useGameFlow(game: GameState, setGame: (game: GameState) => void) {
  const [mode, setMode] = useState<'play' | 'explore'>('play')
  const [phase, setPhase] = useState<Phase>('board')
  const [selected, setSelected] = useState<number | null>(null)
  const [allocation, setAllocation] = useState<Allocation>({})
  const [popup, setPopup] = useState<Popup>(null)
  const [flights, setFlights] = useState<Flight[] | null>(null)
  // Which end card is showing once the game is over (0 = final report)
  const [endStep, setEndStep] = useState(0)

  const card = topCard(game)
  const option = card && selected !== null ? card.options[selected] : null
  const over = isGameOver(game)

  // Load the star photos ahead of time, so a photo appears the moment its
  // star is clicked instead of after a download.
  useEffect(() => {
    for (const { photo } of Object.values(STAR_PHOTOS)) new Image().src = photo
  }, [])

  // Esc closes an explore popup or the new game question.
  useEffect(() => {
    if (!popup) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPopup(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [popup])

  // The round is over once the stars have landed.
  const landStars = useCallback(() => {
    setFlights(null)
    if (!option || selected === null) return
    setGame(finishRound(game, allocation, selected))
    setPhase('board')
    setSelected(null)
    setAllocation({})
  }, [game, allocation, option, selected, setGame])

  /** "continue" under the metric popup: the stars fly to the tracker. */
  const launchStars = () => {
    if (!option) return
    const next = measureFlights(game.metrics, option.effect)
    if (next.length === 0) landStars()
    else setFlights(next)
  }

  /** "continue" under the event card: pay for it, or go straight to its effect if it's free. */
  const confirmOption = () => setPhase(option && Object.values(option.cost).some(Boolean) ? 'allocate' : 'metrics')

  /** "continue" under the allocate popup */
  const confirmAllocation = (a: Allocation) => {
    setAllocation(a)
    setPhase('metrics')
  }

  const toggleMode = () => {
    setPopup(null)
    setMode((m) => (m === 'play' ? 'explore' : 'play'))
  }

  // A round's popup is open (play mode)
  const roundPopup = mode === 'play' && phase !== 'board'
  // The end cards: in play mode once the last stars have landed (and not
  // under another popup, like the new game question)
  const showEnd = mode === 'play' && over && !flights && !popup

  return {
    mode, setMode, toggleMode,
    phase, setPhase,
    selected, setSelected,
    popup, setPopup,
    flights, launchStars, landStars,
    endStep, setEndStep,
    confirmOption, confirmAllocation,
    card, option, over, roundPopup, showEnd,
  }
}
