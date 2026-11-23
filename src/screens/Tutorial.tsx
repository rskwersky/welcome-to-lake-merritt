import { useCallback, useEffect, useRef, useState } from 'react'
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
import { applyEffect, canAfford, hasCityBank, spend, startingMetrics, type Allocation, type Metrics, type Player, type Spent } from '../game/state'
import { usePhoneLayout } from '../hooks/usePhoneLayout'
import { AllocateSheet } from '../components/phone/AllocateSheet'
import { EventSheet } from '../components/phone/EventSheet'
import { Counters, PhoneMap, PhoneTracker, PlayersStrip, TopBar } from '../components/phone/PhoneBoard'
import { BookletPicture } from '../components/phone/PhoneMenu'
import { PhoneStage } from '../components/phone/PhoneStage'

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
  const phone = usePhoneLayout()

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

  const toEvent = () => setStep('event')
  const afterChoice = () => setStep(option && Object.values(option.cost).some(Boolean) ? 'allocate' : 'metrics')
  const afterAllocation = (allocation: Allocation) => {
    setSpent((s) => spend(s, allocation))
    setStep('metrics')
  }
  const start = () => onStart({ spent, metrics, option: selected ?? 2 })

  if (phone) {
    return (
      <TutorialPhone
        players={players}
        step={step}
        selected={selected}
        onSelect={setSelected}
        spent={spent}
        metrics={metrics}
        flights={flights}
        onDraw={toEvent}
        onChoose={afterChoice}
        onAllocate={afterAllocation}
        onLaunch={launchStars}
        onLanded={landStars}
        onTokensSeen={() => setStep('ready')}
        onStart={start}
      />
    )
  }

  return (
    <Stage className="bg-overview">
      <div className="bg-overview absolute inset-0" />
      <Board />
      <EventDeck raised={step === 'draw'} glow={step === 'draw'} onDraw={step === 'draw' ? toEvent : undefined} />
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
            onContinue={afterChoice}
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
              onContinue={afterAllocation}
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
            <SmallButton width={152} onClick={start}>
              start game
            </SmallButton>
          </div>
        </>
      )}
    </Stage>
  )
}

// ---------------------------------------------------------------------------
// The phone version (Figma "6b · mobile hi-fi", M8)
//
// The same eight steps, on the phone board (see GamePhone.tsx). The screen is
// dimmed and the part each step explains is raised above the dim:
//   draw     the deck glows (the rest of the map stays dim); tip below the map
//   event    the event card sheet, with the tip at its top
//   allocate the token sheet, with the tip at its top
//   metrics  the impact popup over the tracker; the tip's arrow sends the
//            stars, and the tracker lights up while they fly
//   tokens   the players strip lights up; tip just above it
//   ready    the counters light up; tip below them, then "start game"

type TutorialPhoneProps = {
  players: Player[]
  step: Step
  selected: number | null
  onSelect: (option: number) => void
  spent: Spent
  metrics: Metrics
  flights: Flight[] | null
  onDraw: () => void
  onChoose: () => void
  onAllocate: (allocation: Allocation) => void
  onLaunch: () => void
  onLanded: () => void
  onTokensSeen: () => void
  onStart: () => void
}

// Tips with an arrow button leave room for it (34px + 10px gap)
const TIP_WIDTH = 320
const TIP_WITH_ARROW = 276

function TutorialPhone(props: TutorialPhoneProps) {
  const { players, step, selected, spent, metrics, flights } = props
  const option = selected === null ? null : EVENT.options[selected]
  const raise = (on: boolean) => (on ? 'relative z-20' : '')

  // Before the stars fly, scroll up so the tracker is in view
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (step === 'metrics' || step === 'ready') scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  return (
    <PhoneStage>
      <div ref={scroller} className="absolute inset-0 overflow-x-hidden overflow-y-auto">
        <div className="relative flex min-h-full flex-col items-center pb-[24px]">
          <div className="w-full">
            {/* No menu during the tutorial: the booklet is just a picture */}
            <TopBar menu={<BookletPicture />}>
              <div className={`flex gap-[15px] ${raise(step === 'ready')}`}>
                <Counters round={1} untilReset={roundsUntilReset(1)} />
              </div>
            </TopBar>
          </div>
          <div className={`mt-[20px] ${raise(step === 'metrics' && !!flights)}`}>
            <PhoneTracker metrics={metrics} />
          </div>
          <div className="mt-[28px]">
            <PhoneMap dimBoard={step === 'draw'} raisedDeck={step === 'draw'} glowDeck={step === 'draw'} onDraw={step === 'draw' ? props.onDraw : undefined} />
          </div>
          <div className="min-h-[32px] flex-1" />
          <div className={`relative w-full ${raise(step === 'tokens')}`}>
            {step === 'tokens' && (
              // Just above the strip (on top of the map's bottom edge), so the strip stays in view
              <div className="absolute bottom-[calc(100%+10px)] left-[17px] z-30">
                <Tip width={TIP_WITH_ARROW} onNext={props.onTokensSeen}>
                  Token amounts automatically update across players.
                </Tip>
              </div>
            )}
            <PlayersStrip players={players} spent={spent} />
          </div>

          {/* Tips placed on the board (Figma M8: below the map, over its bottom edge) */}
          {step === 'draw' && (
            <Tip width={TIP_WIDTH} className="absolute top-[591px] left-[21px] z-30">
              At the start of each round, tap the event card stack to draw a card.
            </Tip>
          )}
          {step === 'ready' && (
            <div className="absolute top-[124px] left-[21px] z-30 flex flex-col items-center gap-[18px]">
              <Tip width={TIP_WIDTH}>Token amounts reset every five rounds. Ready to begin?</Tip>
              <SmallButton width={152} onClick={props.onStart}>
                start game
              </SmallButton>
            </div>
          )}
        </div>
      </div>

      <DimOverlay />

      {step === 'event' && (
        <EventSheet
          event={EVENT}
          players={players}
          selected={selected}
          onSelect={props.onSelect}
          canAfford={(cost) => canAfford(cost, players, spent)}
          onContinue={props.onChoose}
          note="Deliberate as a group and tap an option to continue."
        />
      )}
      {step === 'allocate' && option && (
        <AllocateSheet
          cost={option.cost}
          players={players}
          spent={spent}
          onContinue={props.onAllocate}
          note={hasCityBank(players) ? 'Tap + and − to give tokens from players and the city bank.' : 'Tap + and − to give tokens from players.'}
        />
      )}
      {step === 'metrics' && option && (
        <div className="absolute top-[230px] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-[20px]">
          <div style={{ zoom: 330 / 446 }}>
            <MetricChangePopup effect={option.effect} hidden={!!flights} />
          </div>
          {!flights && (
            <Tip width={TIP_WITH_ARROW} onNext={props.onLaunch}>
              Decisions impact health metrics, which are updated in the score tracker.
            </Tip>
          )}
        </div>
      )}
      {flights && <FlyingStars flights={flights} onLanded={props.onLanded} />}
    </PhoneStage>
  )
}
