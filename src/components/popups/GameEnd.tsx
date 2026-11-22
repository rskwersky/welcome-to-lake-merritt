import { useState, type ReactNode } from 'react'
import { TOTAL_ROUNDS, pointsToStars, type Metric } from '../../data/gameRules'
import { debriefCards, gameSummary, report, type DebriefCard } from '../../game/debrief'
import { METRIC_ROWS, type GameState } from '../../game/state'
import { FeedbackForm } from '../FeedbackForm'
import { SmallButton } from '../SmallButton'
import { Star } from '../Star'

// The end of the game, shown after round 15's stars land. One card at a time,
// centered on the board, with buttons underneath:
//
//   step 0          final report: where the lake ended up, how the group spent
//   steps 1 to N    debrief cards: a question on the front, talking points
//                   on the back (click the card to flip it)
//   last step       a thank-you sticky note with the feedback box
//
// The report and debrief cards look like the event cards (cream, navy
// border, script title), so the ending feels like part of the same deck.

type GameEndProps = {
  game: GameState
  step: number
  setStep: (step: number) => void
  onRestart: () => void
  onExplore: () => void
}

export function GameEnd({ game, step, setStep, onRestart, onExplore }: GameEndProps) {
  const cards = debriefCards(game)
  const last = cards.length + 1

  let card: ReactNode
  let buttons: ReactNode
  if (step === 0) {
    card = <FinalReport game={game} />
    buttons = (
      <SmallButton width={195} onClick={() => setStep(1)}>
        debrief
      </SmallButton>
    )
  } else if (step < last) {
    // key: a new step starts with its card unflipped
    card = <DebriefFlipCard key={step} card={cards[step - 1]} number={step} of={cards.length} />
    buttons = (
      <>
        <SmallButton width={195} onClick={() => setStep(step - 1)}>
          back
        </SmallButton>
        <SmallButton width={195} onClick={() => setStep(step + 1)}>
          next
        </SmallButton>
      </>
    )
  } else {
    card = <ThankYouNote game={game} />
    buttons = (
      <>
        <SmallButton width={195} onClick={onRestart}>
          restart game
        </SmallButton>
        <SmallButton width={195} onClick={onExplore}>
          explore mode
        </SmallButton>
      </>
    )
  }

  return (
    // Centered on the stage. (The pop-in animation sits on the card inside:
    // both use `translate`, so they can't share an element.)
    <div className="absolute top-1/2 left-1/2 z-30 flex -translate-1/2 flex-col items-center gap-[22px]">
      {/* Pops in once, when the ending first appears. Moving between steps
          swaps the card at once (no fade each time, which felt laggy). */}
      <div className="animate-pop-in motion-reduce:animate-none">{card}</div>
      <div className="flex gap-[11px]">{buttons}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// The final report

/** The event card's look: cream, navy border, rounded corners. */
const EVENT_CARD = 'rounded-[7px] border border-ink-soft bg-cream'

/** A metric's final value as stars: gold above zero, pink below. */
function StarCount({ points }: { points: number }) {
  const stars = pointsToStars(points)
  const count = Math.abs(stars)
  if (count === 0) return <span className="text-[16px] italic">no change</span>
  return (
    <span className="flex items-center gap-[3px]" aria-label={`${stars > 0 ? 'up' : 'down'} ${count} ${count === 1 ? 'star' : 'stars'}`}>
      <span aria-hidden="true" className="mr-[4px] text-[20px]">
        {stars > 0 ? '+' : '−'}
      </span>
      {Array.from({ length: Math.ceil(count) }, (_, i) => (
        <Star key={i} width={24} negative={stars < 0} half={i + 1 > count} outline={1.25} />
      ))}
    </span>
  )
}

function FinalReport({ game }: { game: GameState }) {
  const r = report(game)
  return (
    <section role="dialog" aria-labelledby="end-title" className={`flex w-[629.53px] flex-col items-center px-[40px] pt-[24px] pb-[30px] text-center font-mono text-ink-soft ${EVENT_CARD}`}>
      <h2 id="end-title" className="font-script text-[56.43px] leading-[1.1]">
        Final Report
      </h2>
      <p className="mt-[6px] text-[18.81px] leading-[1.3]">After {TOTAL_ROUNDS} rounds, compared with the lake as it is today:</p>
      <dl className="mt-[20px] flex w-full flex-col gap-[14px]">
        {METRIC_ROWS.map(({ metric, label }) => (
          <div key={metric} className="flex items-center justify-between gap-[20px] border-b border-ink-soft/20 pb-[10px]">
            <dt className="text-[19px]">{label}</dt>
            <dd>
              <StarCount points={game.metrics[metric as Metric]} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-[22px] text-[18.81px] leading-[1.35]">
        The group funded {r.funded} {r.funded === 1 ? 'fix' : 'fixes'}, settled for {r.compromised} {r.compromised === 1 ? 'compromise' : 'compromises'} and let {r.letSlide}{' '}
        {r.letSlide === 1 ? 'problem' : 'problems'} slide.
      </p>
      <p className="mt-[12px] text-[20px] leading-[1.3] italic">{r.verdict}</p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// The debrief flip card

/**
 * A debrief card, the size and look of an event card. Front: the question.
 * Back: talking points. Click (or Enter / Space) flips it, the same 3D flip
 * as the postcard: both faces sit in one spot, the back one turned around,
 * and the whole card rotates 180° on its vertical axis.
 */
function DebriefFlipCard({ card, number, of }: { card: DebriefCard; number: number; of: number }) {
  const [flipped, setFlipped] = useState(false)
  const face = `absolute inset-0 flex flex-col items-center px-[44px] pt-[24px] pb-[22px] text-center font-mono text-ink-soft backface-hidden ${EVENT_CARD}`
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={flipped ? `Talking points: ${card.talkingPoints.join(' ')} Click to see the question again.` : `Question ${number} of ${of}: ${card.question} Click for talking points.`}
      // Hover: the small lift every clickable card has
      className="block h-[440px] w-[629.53px] cursor-pointer rounded-[7px] perspective-[1600px] shadow-[-4px_4px_2px_0px_rgba(0,0,0,0.25)] transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[-4px_8px_8px_0px_rgba(0,0,0,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-soft motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* will-change: the browser prepares the turning layer ahead of time, so
          the flip starts on the first frame instead of after a hitch */}
      <div className={`relative size-full transform-3d transition-transform duration-500 ease-in-out will-change-transform motion-reduce:duration-0 ${flipped ? 'rotate-y-180' : ''}`}>
        {/* front: the question */}
        <div className={face}>
          <p className="font-script text-[56.43px] leading-[1.1]">Game Debrief</p>
          <p className="text-[14px] leading-none">
            {number} of {of}
          </p>
          <p className="flex flex-1 items-center text-[28px] leading-[1.25]">{card.question}</p>
          <p className="text-[14px] leading-none italic">click the card for talking points</p>
        </div>
        {/* back: talking points */}
        <div className={`${face} rotate-y-180`}>
          <p className="font-script text-[56.43px] leading-[1.1]">Talking Points</p>
          <ul className="mt-[8px] flex flex-1 flex-col justify-center gap-[16px] text-left text-[19px] leading-[1.3]">
            {card.talkingPoints.map((point) => (
              <li key={point} className="flex gap-[12px]">
                <span aria-hidden="true">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-[12px] text-[14px] leading-none italic">click to see the question again</p>
        </div>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// The thank-you sticky note

/**
 * A cream sticky note with a folded bottom-right corner (like the character
 * descriptions' note). The fold is a small square in the corner with a
 * border on its top and left edges, and the note's own corner rounded.
 */
function ThankYouNote({ game }: { game: GameState }) {
  return (
    <section
      role="dialog"
      aria-labelledby="end-title"
      className="relative w-[540px] rounded-br-[22px] border border-ink-soft bg-note px-[36px] pt-[28px] pb-[40px] font-mono text-ink-soft shadow-[-4px_4px_2px_0px_rgba(0,0,0,0.25)]"
    >
      <h2 id="end-title" className="font-script text-[48px] leading-[1.1]">
        Thank You
      </h2>
      <p className="mt-[10px] text-[18px] leading-[1.35] italic">
        Thank you for caring for Lake Merritt. This game was built from interviews with Oakland organizers and residents. What did it make you think about?
      </p>
      <div className="mt-[18px]">
        <FeedbackForm context={gameSummary(game)} />
      </div>
      {/* the folded corner */}
      <span aria-hidden="true" className="absolute -right-px -bottom-px size-[22px] rounded-br-[22px] border-t border-l border-ink-soft bg-note" />
    </section>
  )
}
