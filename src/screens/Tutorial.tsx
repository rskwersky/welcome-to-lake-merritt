import { useCallback, useState } from 'react'
import { Board, DimOverlay, EventDeck, PlayerRoster, RoundCounter, ScoreTracker } from '../components/board/GameBoard'
import { measureFlights } from '../components/popups/flights'
import { AllocateTokensPopup } from '../components/popups/AllocateTokensPopup'
import { EventCardPopup } from '../components/popups/EventCardPopup'
import { FlyingStars, MetricChangePopup, type Flight } from '../components/popups/MetricChangePopup'
import { SmallButton } from '../components/SmallButton'
import { Stage } from '../components/Stage'
import { Tip } from '../components/Tip'
import { EVENTS } from '../data/events'
import { TUTORIAL_EVENT_ID, roundsUntilReset } from '../data/gameRules'
import { applyEffect, hasCityBank, spend, startingMetrics, type Metrics, type Player, type Spent } from '../game/state'

// Figma section "4 · tutorial": round 1, played with the players' help.
// The board is dimmed, and each step raises one part of it with a tip:
//   1 draw a card      the deck glows; click it
//   2 event card       the card grows out of the deck; pick an option
//   3 option chosen    the option turns gold; continue
//   4 allocate tokens  type who gives which tokens
//   5 tokens entered   continue unlocks once the cost is covered
//   6 metrics update   the stars fly into the score tracker
//   7 tokens update    the roster shows the spent tokens (at 50%)
//   8 ready to start   the round counter; "start game"
// (Steps 3 and 5 are the same screens as 2 and 4, once something is chosen.)
// A free option skips the token steps.

const EVENT = EVENTS.find((e) => e.id === TUTORIAL_EVENT_ID)!

/** What round 1 leaves behind: tokens spent, the metrics, and which option (0 to 2) was chosen */
export type TutorialResult = { spent: Spent; metrics: Metrics; option: number }

type TutorialProps = {
  players: Player[]
  onStart: (result: TutorialResult) => void
}

type Step = 'draw' | 'event' | 'allocate' | 'metrics' | 'tokens' | 'ready'

export function Tutorial({ players, onStart }: TutorialProps) {
  const [step, setStep] = useState<Step>('draw')
  const [selected, setSelected] = useState<number | null>(null)
  const [spent, setSpent] = useState<Spent>({})
  const [metrics, setMetrics] = useState<Metrics>(startingMetrics)
  const [flights, setFlights] = useState<Flight[] | null>(null)

  const option = selected === null ? null : EVENT.options[selected]

  // Step 6 → 7: every star in the popup flies to its slot in the tracker.
  const launchStars = () => {
    if (!option) return
    const next = measureFlights(metrics, option.effect)
    if (next.length === 0) landStars()
    else setFlights(next)
  }

  const landStars = useCallback(() => {
    setFlights(null)
    if (option) setMetrics((m) => applyEffect(m, option.effect))
    setStep('tokens')
  }, [option])

  return (
    <Stage className="bg-overview">
      <div className="bg-overview absolute inset-0" />
      <Board />
      <EventDeck raised={step === 'draw'} glow={step === 'draw'} onDraw={step === 'draw' ? () => setStep('event') : undefined} />
      <RoundCounter roundsUntilReset={roundsUntilReset(1)} raised={step === 'ready'} />
      {/* Lit up only once the stars start flying to it */}
      <ScoreTracker metrics={metrics} raised={step === 'metrics' && !!flights} />
      <PlayerRoster players={players} spent={spent} raised={step === 'tokens'} />
      <DimOverlay />

      {step === 'draw' && (
        <Tip width={249.3} className="absolute z-30" style={{ left: 113, top: 548 }}>
          At the start of each round, click on the event card stack to draw a card.
        </Tip>
      )}

      {step === 'event' && (
        <div className="absolute z-30 flex w-[629.53px] flex-col items-start gap-[22px]" style={{ left: 405.23, top: 214 }}>
          <Tip width={251.85}>Deliberate as a group and click an option to continue.</Tip>
          <EventCardPopup
            event={EVENT}
            players={players}
            selected={selected}
            onSelect={setSelected}
            onContinue={() => setStep(option && Object.values(option.cost).some(Boolean) ? 'allocate' : 'metrics')}
          />
        </div>
      )}

      {step === 'allocate' && option && (
        <div className="absolute z-30 flex w-[629.53px] flex-col items-start gap-[22px]" style={{ left: 405.23, top: 205.23 }}>
          <Tip>
            {hasCityBank(players)
              ? 'Type in the input fields to allocate tokens from players and the city bank.'
              : 'Type in the input fields to allocate tokens from players.'}
          </Tip>
          <div className="w-full">
            <AllocateTokensPopup
              cost={option.cost}
              players={players}
              spent={spent}
              onContinue={(allocation) => {
                setSpent((s) => spend(s, allocation))
                setStep('metrics')
              }}
            />
          </div>
        </div>
      )}

      {step === 'metrics' && option && (
        <>
          <Tip className="absolute z-30" style={{ left: 497, top: 297.04 }} onNext={flights ? undefined : launchStars}>
            Decisions impact health metrics, which are updated in the score tracker.
          </Tip>
          <div className="absolute z-30" style={{ left: 497, top: 409 }}>
            <MetricChangePopup effect={option.effect} hidden={!!flights} />
          </div>
          {flights && <FlyingStars flights={flights} onLanded={landStars} />}
        </>
      )}

      {step === 'tokens' && (
        <Tip className="absolute z-30" style={{ left: 834, top: 527 }} onNext={() => setStep('ready')}>
          Token amounts automatically update across players.
        </Tip>
      )}

      {step === 'ready' && (
        <>
          <Tip className="absolute z-30" style={{ left: 857, top: 36.4 }}>
            Token amounts reset every five rounds. Ready to begin?
          </Tip>
          <div className="absolute z-30" style={{ left: 932.19, top: 127.39 }}>
            <SmallButton width={152} onClick={() => onStart({ spent, metrics, option: selected ?? 2 })}>
              start game
            </SmallButton>
          </div>
        </>
      )}
    </Stage>
  )
}
