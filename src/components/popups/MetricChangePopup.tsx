import { useEffect, useRef, useState } from 'react'
import type { Effect } from '../../data/events'
import { pointsToStars, type Metric } from '../../data/gameRules'
import { METRIC_ROWS } from '../../game/state'
import { STAR } from '../board/trackerLayout'
import { Star } from '../Star'

// Figma's `metric-change-popup` (tutorial step 6, and every round): how the
// chosen option changed the lake, as stars: "+★★ reputation". Pink stars and
// "−" for a metric that went down. The popup glows gold.
//
// Stars here use the same scale as the score tracker (1 star = 2 points,
// TRACKER in src/data/gameRules.ts), so what you see is what lands there.
//
// When the round moves on, each star flies from the popup into its slot in
// the score tracker (<FlyingStars>).

// Popup star size (Figma "Star 9") and its outline
const BIG = { width: 30.71, height: 29.31 } // the star shape is 30.71 × 29.31
const OUTLINE = 1.5

/**
 * A popup star, marked so it can fly. Its box is just wider than the star
 * (a half star gets a half-width box), so the gaps between stars are even.
 */
function BigStar({ negative, half, metric, index }: { negative: boolean; half: boolean; metric: Metric; index: number }) {
  return (
    <span className="flex h-[34.96px] shrink-0 items-center justify-center" style={{ width: (half ? BIG.width / 2 : BIG.width) + 4 }}>
      <span data-fly-star={metric} data-index={index} data-negative={negative} data-half={half}>
        <Star width={BIG.width} negative={negative} half={half} outline={OUTLINE} />
      </span>
    </span>
  )
}

// Figma: 446px wide, rows 368px wide (so 38px padding each side).
export function MetricChangePopup({ effect, hidden }: { effect: Effect; hidden?: boolean }) {
  const rows = METRIC_ROWS.filter(({ metric }) => effect[metric] !== 0)
  return (
    <div
      role="dialog"
      aria-label="How the lake changed"
      className={`flex w-[446px] animate-pop-in flex-col items-center justify-center gap-[5px] rounded-[7px] border border-ink-soft bg-cream px-[38px] py-[26px] drop-shadow-[0px_0px_12.4px_#f5bf5f] transition-opacity duration-300 motion-reduce:animate-none motion-reduce:transition-none ${
        hidden ? 'opacity-0' : ''
      }`}
    >
      {rows.length === 0 && <p className="font-mono text-[20px] text-ink-soft">No change to the lake.</p>}
      {rows.map(({ metric, label }) => {
        const stars = pointsToStars(effect[metric])
        const negative = stars < 0
        const count = Math.abs(stars)
        return (
          <div key={metric} className="flex w-full items-center gap-[15px] font-mono text-[20px] whitespace-nowrap text-ink-soft">
            <span className="flex items-center" aria-label={`${negative ? 'minus' : 'plus'} ${count} ${count === 1 ? 'star' : 'stars'}`}>
              <span aria-hidden="true">{negative ? '−' : '+'}</span>
              {Array.from({ length: Math.ceil(count) }, (_, i) => (
                <BigStar key={i} negative={negative} half={i + 1 > count} metric={metric} index={i} />
              ))}
            </span>
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------

export type Flight = {
  from: { x: number; y: number }
  to: { x: number; y: number }
  negative: boolean
  half: boolean
}

/**
 * Stars travelling from the popup to the score tracker. Each star starts
 * where its popup star was, then (one frame later, so the browser has drawn
 * the starting spot) glides to its tracker slot, shrinking as it goes.
 * All positions are stage px (1440×1024).
 *
 * To make the path a gentle curve instead of a straight line, the move is
 * split across two layers: the outer layer moves sideways and slows down
 * at the end (ease-out), the inner one moves up/down and speeds up
 * (ease-in). Together they trace an arc, like something tossed.
 * The stars leave one after another, STAGGER ms apart.
 */
export function FlyingStars({ flights, onLanded }: { flights: Flight[]; onLanded: () => void }) {
  const [launched, setLaunched] = useState(false)
  const DURATION = 850
  const STAGGER = 110
  // The round moves on exactly once, when the last star has arrived.
  const landed = useRef(false)
  const land = () => {
    if (landed.current) return
    landed.current = true
    onLanded()
  }

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      onLanded()
      return
    }
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setLaunched(true)))
    return () => cancelAnimationFrame(frame)
  }, [onLanded])

  // A safety net in case the browser skips the "transition ended" event
  // (e.g. the tab is in the background): land a bit after it should have.
  useEffect(() => {
    if (!launched) return
    const timer = setTimeout(land, DURATION + STAGGER * flights.length + 400)
    return () => clearTimeout(timer)
  })

  const small = STAR.width / BIG.width // tracker star size ÷ popup star size
  const last = flights.length - 1
  return (
    <div className="pointer-events-none absolute inset-0 z-40" aria-hidden="true">
      {flights.map((f, i) => {
        const timing = { transitionDuration: `${DURATION}ms`, transitionDelay: `${i * STAGGER}ms` }
        return (
          <div
            key={i}
            className="absolute transition-[translate] ease-[cubic-bezier(0.25,0.6,0.35,1)]"
            // `from` and `to` are the centers of the star; it shrinks around its center.
            style={{
              left: f.from.x - (f.half ? BIG.width / 4 : BIG.width / 2),
              top: f.from.y - BIG.height / 2,
              translate: launched ? `${f.to.x - f.from.x}px 0` : '0 0',
              ...timing,
            }}
          >
            <div
              className="transition-[translate,scale] ease-[cubic-bezier(0.55,0,0.75,0.6)]"
              style={{ translate: launched ? `0 ${f.to.y - f.from.y}px` : '0 0', scale: launched ? small : 1, ...timing }}
              // The last star to leave is the last to arrive: when it has
              // finished moving, the stars are all in place. (Measuring the
              // end instead of guessing it with a timer means no star is
              // ever removed mid-flight.)
              onTransitionEnd={i === last ? (e) => e.propertyName === 'translate' && land() : undefined}
            >
              <Star width={BIG.width} negative={f.negative} half={f.half} outline={OUTLINE} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
