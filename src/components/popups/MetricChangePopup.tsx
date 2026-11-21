import { useEffect, useState } from 'react'
import type { Effect } from '../../data/events'
import { pointsToStars, type Metric } from '../../data/gameRules'
import { METRIC_ROWS } from '../../game/state'
import { HalfStarEdge } from '../board/GameBoard'

// Figma's `metric-change-popup` (tutorial step 6, and every round): how the
// chosen option changed the lake, as stars: "+★★ reputation". Pink stars and
// "−" for a metric that went down. The popup glows gold.
//
// Stars here use the same scale as the score tracker (1 star = 2 points,
// TRACKER in src/data/gameRules.ts), so what you see is what lands there.
//
// When the round moves on, each star flies from the popup into its slot in
// the score tracker (<FlyingStars>).

const B = '/assets/board'
const BIG = { width: 30.71, height: 29.31 } // popup star size (Figma "Star 9")

/** The popup-size star picture. Pink when negative; `half` keeps the half nearest zero. */
function StarImage({ negative, half }: { negative: boolean; half: boolean }) {
  return (
    <span className="relative block overflow-hidden" style={{ width: half ? BIG.width / 2 : BIG.width, height: BIG.height }}>
      <img
        alt=""
        src={negative ? `${B}/rating-star-b.svg` : `${B}/popup-star.svg`}
        className="absolute top-0 max-w-none"
        style={{ width: BIG.width, height: BIG.height, left: half && negative ? -BIG.width / 2 : 0 }}
      />
      {half && <HalfStarEdge side={negative ? 'left' : 'right'} />}
    </span>
  )
}

/** A popup star in its 34.96px box (the star is inset in it, as in Figma). Marked so it can fly. */
function BigStar({ negative, half, metric, index }: { negative: boolean; half: boolean; metric: Metric; index: number }) {
  return (
    <span className="relative block size-[34.96px] shrink-0">
      <span
        className="absolute top-[3.97%] left-[6.08%]"
        style={half && negative ? { left: `calc(6.08% + ${BIG.width / 2}px)` } : undefined}
        data-fly-star={metric}
        data-index={index}
        data-negative={negative}
        data-half={half}
      >
        <StarImage negative={negative} half={half} />
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
 * the starting spot) moves and shrinks to its tracker slot. They leave one
 * after another, 90ms apart. All positions are stage px (1440×1024).
 */
export function FlyingStars({ flights, onLanded }: { flights: Flight[]; onLanded: () => void }) {
  const [launched, setLaunched] = useState(false)
  const DURATION = 700
  const STAGGER = 90

  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setLaunched(true)))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const done = setTimeout(onLanded, reduce ? 0 : DURATION + STAGGER * flights.length)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(done)
    }
  }, [flights, onLanded])

  const small = 10.79 / BIG.width // tracker star size ÷ popup star size
  return (
    <div className="pointer-events-none absolute inset-0 z-40" aria-hidden="true">
      {flights.map((f, i) => (
        <div
          key={i}
          className="absolute transition-[translate,scale] ease-in-out motion-reduce:transition-none"
          // `from` and `to` are the centers of the star; shrink around the center.
          style={{
            left: f.from.x - (f.half ? BIG.width / 4 : BIG.width / 2),
            top: f.from.y - BIG.height / 2,
            translate: launched ? `${f.to.x - f.from.x}px ${f.to.y - f.from.y}px` : '0 0',
            scale: launched ? small : 1,
            transitionDuration: `${DURATION}ms`,
            transitionDelay: `${i * STAGGER}ms`,
          }}
        >
          <StarImage negative={f.negative} half={f.half} />
        </div>
      ))}
    </div>
  )
}
