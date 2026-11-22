import { useCallback, useEffect, useState } from 'react'
import { BEYOND_STAGE, Board, DimOverlay, EventDeck, PlayerRoster, RoundCounter, ScoreTracker, TotalRounds } from '../components/board/GameBoard'
import { GameMenu } from '../components/board/GameMenu'
import { ManualArt } from '../components/board/ManualArt'
import { PlayerCards } from '../components/board/PlayerCards'
import { CharacterCard } from '../components/CharacterCard'
import { FeedbackForm } from '../components/FeedbackForm'
import { AllocateTokensPopup } from '../components/popups/AllocateTokensPopup'
import { EventCardPopup } from '../components/popups/EventCardPopup'
import { CityBankInfo, ManualPopup, NewGameConfirm, PhotoPopup } from '../components/popups/ExplorePopups'
import { measureFlights } from '../components/popups/flights'
import { FlyingStars, MetricChangePopup, type Flight } from '../components/popups/MetricChangePopup'
import { GameEnd } from '../components/popups/GameEnd'
import { SmallButton } from '../components/SmallButton'
import { Stage } from '../components/Stage'
import { STAR_PHOTOS, type MapStarId } from '../data/explore'
import type { CharacterId } from '../data/gameRules'
import { roundsUntilReset } from '../data/gameRules'
import { gameSummary } from '../game/debrief'
import { canAfford, finishRound, isGameOver, topCard, type Allocation, type GameState } from '../game/state'
import { feedbackAvailable } from '../feedback'

// Figma section "5 · game board + explore mode".
//
// Play mode ("09 game board"), one round at a time:
//   click the deck → event card → (allocate tokens) → stars fly to the
//   score tracker → next round. Tokens reset after rounds 5 and 10.
//
// Explore mode ("10 explore / …"): look around without playing. The roster
// becomes the players' cards; map stars, cards and the big manual lift on
// hover and open popups. Click outside a popup (or press Esc) to close it.
// "play mode" goes back to exactly where the game was.
//
// After round 15 ("10 game ending + total round tracker"): the final report,
// then the debrief one question at a time, then thank you + feedback
// (components/popups/GameEnd.tsx). Explore mode is still open afterwards.
//
// The game itself (round, deck, tokens, metrics) lives in the App, so it
// survives a trip to "learn more" and back.

type GameProps = {
  game: GameState
  setGame: (game: GameState) => void
  onLearnMore: () => void
  onRestart: () => void
}

type Phase = 'board' | 'event' | 'allocate' | 'metrics'
type Popup =
  | { kind: 'star'; star: MapStarId }
  | { kind: 'character'; id: CharacterId }
  | { kind: 'city-bank' }
  | { kind: 'manual' }
  | { kind: 'new-game' }
  | { kind: 'feedback' }
  | null

export function Game({ game, setGame, onLearnMore, onRestart }: GameProps) {
  const [mode, setMode] = useState<'play' | 'explore'>('play')
  const [phase, setPhase] = useState<Phase>('board')
  const [selected, setSelected] = useState<number | null>(null)
  const [allocation, setAllocation] = useState<Allocation>({})
  const [popup, setPopup] = useState<Popup>(null)
  const [flights, setFlights] = useState<Flight[] | null>(null)
  // Which end card is showing once the game is over (0 = final report)
  const [endStep, setEndStep] = useState(0)

  const card = topCard(game)
  const exploring = mode === 'explore'
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
    const next = finishRound(game, allocation, selected)
    setGame(next)
    setPhase('board')
    setSelected(null)
    setAllocation({})
  }, [game, allocation, option, selected, setGame])

  const launchStars = () => {
    if (!option) return
    const next = measureFlights(game.metrics, option.effect)
    if (next.length === 0) landStars()
    else setFlights(next)
  }

  const roundPopup = mode === 'play' && phase !== 'board'
  // The end cards: in play mode once the last stars have landed (and not
  // under another popup, like the new game question)
  const showEnd = mode === 'play' && over && !flights && !popup

  return (
    <Stage className="bg-overview">
      <div className="bg-overview absolute inset-0" />
      <Board onStar={exploring ? (star) => setPopup({ kind: 'star', star }) : undefined} />
      <EventDeck onDraw={mode === 'play' && phase === 'board' && card ? () => setPhase('event') : undefined} />
      {/* Explore mode hides the counter and tracker: the player cards take their place (as in Figma). */}
      {!exploring && (
        <>
          <TotalRounds round={game.round} />
          {/* Token resets mean nothing once the game is over */}
          {!over && <RoundCounter roundsUntilReset={roundsUntilReset(game.round)} />}
          <ScoreTracker metrics={game.metrics} />
        </>
      )}

      {exploring ? (
        <>
          <PlayerCards
            open={popup?.kind === 'character' ? popup.id : null}
            onOpen={(id) => setPopup({ kind: 'character', id })}
          />
          {/* The big manual (bottom right): lifts on hover, opens the rule pages.
              The lifting layer must cover the whole stage (absolute inset-0):
              anything that moves becomes the frame its drawing is measured
              from, and the drawing's pieces are placed in % of the stage. */}
          <div className="group/manual">
            <div className="pointer-events-none absolute inset-0 transition-[translate] duration-200 group-hover/manual:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover/manual:translate-y-0">
              <ManualArt at={{ left: 1162.52, top: 707.89 }} scale={1.191} />
            </div>
            <button
              type="button"
              aria-label="Open the game manual"
              onClick={() => setPopup({ kind: 'manual' })}
              className="absolute z-10 h-[266px] w-[217px] cursor-pointer rounded-[6px] focus-visible:outline-3 focus-visible:outline-ink"
              style={{ left: 1162.52, top: 707.89 }}
            />
          </div>
        </>
      ) : (
        // Between rounds, click a character token for their motivation card,
        // or the city bank to learn what it's for.
        <PlayerRoster
          players={game.players}
          spent={game.spent}
          onCharacter={phase === 'board' && !over ? (id) => setPopup({ kind: 'character', id }) : undefined}
          onCityBank={phase === 'board' && !over ? () => setPopup({ kind: 'city-bank' }) : undefined}
        />
      )}

      <GameMenu
        mode={mode}
        onNewGame={() => setPopup({ kind: 'new-game' })}
        onLearnMore={onLearnMore}
        onFeedback={feedbackAvailable ? () => setPopup({ kind: 'feedback' }) : undefined}
        onToggleMode={() => {
          setPopup(null)
          setMode(exploring ? 'play' : 'explore')
        }}
      />

      {/* ---- the round's popups (play mode) ---- */}
      {/* Fades out as the stars fly, so they land on a bright tracker */}
      <DimOverlay visible={(roundPopup && !flights) || showEnd} />

      {showEnd && (
        <GameEnd
          game={game}
          step={endStep}
          setStep={setEndStep}
          onRestart={() => setPopup({ kind: 'new-game' })}
          onExplore={() => setMode('explore')}
        />
      )}

      {mode === 'play' && phase === 'event' && card && (
        // Centered on the stage, whatever the card's height
        <div className="absolute top-1/2 z-30 -translate-y-1/2" style={{ left: 405.23 }}>
          <EventCardPopup
            event={card}
            selected={selected}
            onSelect={setSelected}
            canAfford={(cost) => canAfford(cost, game.players, game.spent)}
            players={game.players}
            onContinue={() => setPhase(option && Object.values(option.cost).some(Boolean) ? 'allocate' : 'metrics')}
          />
        </div>
      )}

      {mode === 'play' && phase === 'allocate' && option && (
        <div className="absolute top-1/2 z-30 w-[629.53px] -translate-y-1/2" style={{ left: 405.23 }}>
          <AllocateTokensPopup
            cost={option.cost}
            players={game.players}
            spent={game.spent}
            onContinue={(a) => {
              setAllocation(a)
              setPhase('metrics')
            }}
          />
        </div>
      )}

      {mode === 'play' && phase === 'metrics' && option && (
        <div className="absolute z-30 flex w-[446px] flex-col items-center gap-[22px]" style={{ left: 497, top: 409 }}>
          <MetricChangePopup effect={option.effect} hidden={!!flights} />
          {!flights && (
            <SmallButton width={121} onClick={launchStars}>
              continue
            </SmallButton>
          )}
        </div>
      )}
      {flights && <FlyingStars flights={flights} onLanded={landStars} />}

      {/* ---- explore popups and the new game question ---- */}
      {popup && (
        <>
          {/* Click outside the popup to close it */}
          <button type="button" aria-label="Close" onClick={() => setPopup(null)} className={`absolute ${BEYOND_STAGE} z-30 cursor-default bg-ink-soft/50`} />
          <div className="pointer-events-none absolute inset-0 z-40 [&>*]:pointer-events-auto">
            {popup.kind === 'star' && <PhotoPopup star={popup.star} />}
            {popup.kind === 'manual' && <ManualPopup />}
            {popup.kind === 'new-game' && <NewGameConfirm onRestart={onRestart} onCancel={() => setPopup(null)} />}
            {popup.kind === 'city-bank' && <CityBankInfo />}
            {popup.kind === 'feedback' && (
              <div className="absolute top-1/2 left-1/2 -translate-1/2">
                <div role="dialog" aria-label="Share feedback" className="w-[520px] animate-pop-in rounded-[7px] border border-black bg-cream px-[28px] pt-[24px] pb-[28px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] motion-reduce:animate-none">
                  <h2 className="mb-[14px] font-mono text-[28px] leading-none text-ink italic">share feedback</h2>
                  <FeedbackForm context={gameSummary(game)} />
                </div>
              </div>
            )}
            {popup.kind === 'character' && (
              // Explore mode: Figma's spot, beside the player cards. Play mode:
              // beside the roster, centered top to bottom.
              <div className="absolute" style={exploring ? { left: 773.52, top: 120.76 } : { left: 867, top: (1024 - 365) / 2 }}>
                <CharacterCard id={popup.id} side="description" />
              </div>
            )}
          </div>
          {/* The player cards stay clickable above the overlay, to switch characters */}
          {popup.kind === 'character' && exploring && (
            <div className="absolute inset-0 z-50 pointer-events-none [&>*]:pointer-events-auto">
              <PlayerCards open={popup.id} onOpen={(id) => setPopup({ kind: 'character', id })} />
            </div>
          )}
        </>
      )}
    </Stage>
  )
}
