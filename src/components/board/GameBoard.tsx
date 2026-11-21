import type { CSSProperties, ReactNode } from 'react'
import { TOKEN_ORDER, TRACKER, pointsToStars } from '../../data/gameRules'
import { BAR_HEIGHT, BAR_WIDTH, PADDING, ROW_GAP, ROW_HEIGHT, SLOT_WIDTH, STAR, TRACKER_BOX } from './trackerLayout'
import { METRIC_ROWS, hasCityBank, remaining, startingTokens, type Metrics, type Player, type Spent } from '../../game/state'
import { CharacterToken } from '../CharacterToken'
import { MiniPostcard } from '../MiniPostcard'
import { PlayerBadge } from '../PlayerBadge'
import { TokenIcon } from '../TokenIcon'

// The game board from Figma ("08 tutorial / …", "09 game board"), split into
// its parts so a screen can raise any one of them above the dark overlay
// (the tutorial's "look here" cue). Every position is the Figma x/y on the
// 1440×1024 frame.
//
// `raised` puts a part above the <DimOverlay> (z-20 vs z-10).

const B = '/assets/board'
const lift = (raised?: boolean) => (raised ? 'z-20' : '')

type Box = { left: number; top: number; width: number; height: number }

/** A rotated object: `box` is its upright bounding box, `children` the object at its real size. */
function Tilted({ box, rotate, children, className = '' }: { box: Box; rotate: number; children: ReactNode; className?: string }) {
  return (
    <div className={`absolute flex items-center justify-center ${className}`} style={box}>
      <div className="flex-none" style={{ rotate: `${rotate}deg` }}>
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// The board, map and map stars

const MAP_STARS: { name: string; left: number; top: number; kind: 'a' | 'b' }[] = [
  { name: 'pergola', left: 932.19, top: 191.01, kind: 'a' },
  { name: 'bird sanctuary', left: 569.19, top: 336.01, kind: 'b' },
  { name: 'lake shore ave', left: 788.19, top: 413.01, kind: 'b' },
  { name: 'boating center', left: 556.19, top: 413.01, kind: 'a' },
  { name: 'lake', left: 672.19, top: 467.01, kind: 'b' },
  { name: 'corner', left: 264.19, top: 223.01, kind: 'b' },
]

export function Board() {
  return (
    <>
      <Tilted box={{ left: 167.89, top: 30.15, width: 911.497, height: 911.497 }} rotate={-6.76}>
        <div className="bg-board size-[820.63px] border-[2.5px] border-ink-soft shadow-[-10px_10px_8px_0px_rgba(0,0,0,0.25)]" />
      </Tilted>
      <Tilted box={{ left: 177.81, top: 40.07, width: 891.655, height: 891.655 }} rotate={-6.76}>
        <img alt="" src={`${B}/map.png`} width={802.766} height={802.766} className="block size-[802.766px] max-w-none" draggable={false} />
      </Tilted>
      {/* The stars mark places to explore (explore mode, later). The SVGs include
          a drop shadow, so they're a little bigger than the star itself. */}
      {MAP_STARS.map((s) => (
        <div key={s.name} className={`absolute h-[46px] ${s.kind === 'a' ? 'w-[45px]' : 'w-[46px]'}`} style={{ left: s.left, top: s.top }}>
          <div className={`absolute ${s.kind === 'a' ? 'inset-[4.36%_-2.54%_-4.78%_-2.54%]' : 'inset-[4.23%_-2.33%_-4.84%_-2.33%]'}`}>
            <img alt="" src={`${B}/star-${s.kind}.svg`} className="block size-full max-w-none" draggable={false} />
          </div>
        </div>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// The event deck

/**
 * The stack of event cards: the little postcard, lying at an angle. With
 * `onDraw` it's a button; `glow` adds the golden halo (hover, or the
 * tutorial's "click this" cue).
 */
export function EventDeck({ onDraw, glow, raised }: { onDraw?: () => void; glow?: boolean; raised?: boolean }) {
  const card = (
    <div className="h-[211.907px] w-[131.878px]">
      <MiniPostcard textClass="text-[16px]" />
    </div>
  )
  return (
    <Tilted box={{ left: 415.37, top: 505, width: 243.724, height: 194.902 }} rotate={70.55} className={lift(raised)}>
      {onDraw ? (
        <button
          type="button"
          onClick={onDraw}
          aria-label="Draw an event card"
          // Golden halo on hover (Figma: event-deck state=hover). With `glow` it
          // stays on and gently pulses, to say "click me".
          className={`block cursor-pointer rounded-[8px] transition-[filter] duration-200 hover:drop-shadow-[0px_0px_12.4px_#f5bf5f] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none ${
            glow ? 'animate-glow drop-shadow-[0px_0px_12.4px_#f5bf5f] motion-reduce:animate-none' : ''
          }`}
        >
          {card}
        </button>
      ) : (
        card
      )}
    </Tilted>
  )
}

// ---------------------------------------------------------------------------
// Round counter and score tracker (top right)

export function RoundCounter({ roundsUntilReset, raised }: { roundsUntilReset: number; raised?: boolean }) {
  return (
    <div className={`absolute top-[40.07px] left-[1175.93px] h-[35.833px] w-[222.951px] rounded-[5px] border border-black bg-cream ${lift(raised)}`}>
      <p className="absolute top-[12.42px] left-[12.97px] font-mono text-[12px] leading-[0.94] whitespace-nowrap text-ink-soft">
        Rounds until token reset: {roundsUntilReset}
      </p>
    </div>
  )
}

/** One small rating star; `half` shows only the half nearest zero. */
export function RatingStar({ negative, half, className = '', style }: { negative: boolean; half?: boolean; className?: string; style?: CSSProperties }) {
  return (
    // Positioned `relative` unless the caller places it (e.g. `absolute`):
    // having both classes at once lets CSS order pick the wrong one.
    <span className={`block overflow-hidden ${className.includes('absolute') ? className : `relative ${className}`}`} style={{ width: half ? STAR.width / 2 : STAR.width, height: STAR.height, ...style }}>
      <img
        alt=""
        src={`${B}/rating-star-${negative ? 'b' : 'a'}.svg`}
        className="absolute top-0 max-w-none"
        // A negative half star keeps its right half (the side nearest zero).
        style={{ width: STAR.width, height: STAR.height, left: negative && half ? -STAR.width / 2 : 0 }}
      />
      {half && <HalfStarEdge side={negative ? 'left' : 'right'} />}
    </span>
  )
}

/**
 * The outline along a half star's cut edge, so it looks like a finished
 * shape rather than a star sliced off. It runs down the star's middle, from
 * the top point to the notch between the bottom points (about 86% down).
 * 1px navy, like the stars' own outline.
 */
export function HalfStarEdge({ side }: { side: 'left' | 'right' }) {
  return <span className={`absolute top-[2%] h-[85%] w-px bg-ink-soft ${side === 'right' ? 'right-0' : 'left-0'}`} />
}

/** One metric's bar: the stars for its current value. */
function MetricBar({ points }: { points: number }) {
  const stars = pointsToStars(points)
  const negative = stars < 0
  const count = Math.abs(stars)
  return (
    <div className="relative rounded-[1.5px] border border-ink-soft bg-cream" style={{ width: BAR_WIDTH, height: BAR_HEIGHT }}>
      {/* The zero line. (-1px everywhere: positions are measured from the
          bar's outer edge, but children start inside its 1px border.) */}
      <div className="absolute inset-y-0 w-px bg-ink-soft" style={{ left: TRACKER.zeroAfterSlot * SLOT_WIDTH - 1.5 }} />
      {Array.from({ length: Math.ceil(count) }, (_, i) => {
        const half = i + 1 > count
        // Stars fill outward from zero: right for positive, left for negative.
        const slot = negative ? TRACKER.zeroAfterSlot - 1 - i : TRACKER.zeroAfterSlot + i
        const center = (slot + 0.5) * SLOT_WIDTH - 1
        return (
          <RatingStar
            key={i}
            negative={negative}
            half={half}
            className="absolute animate-star-in motion-reduce:animate-none"
            style={{
              top: (BAR_HEIGHT - 2 - STAR.height) / 2,
              // A half star is the half nearest zero: the left half of the
              // slot for positive values, the right half for negative ones.
              left: half && negative ? center : center - STAR.width / 2,
            }}
          />
        )
      })}
    </div>
  )
}

export function ScoreTracker({ metrics, raised }: { metrics: Metrics; raised?: boolean }) {
  return (
    <div
      className={`absolute flex w-[222.951px] flex-col rounded-[5px] border border-black bg-cream ${lift(raised)}`}
      style={{ left: TRACKER_BOX.left, top: TRACKER_BOX.top, gap: ROW_GAP, padding: `${PADDING.top}px ${PADDING.x}px 12px` }}
      aria-label="Score tracker"
    >
      {METRIC_ROWS.map(({ metric, label }) => (
        <div key={metric} className="relative" style={{ height: ROW_HEIGHT }}>
          <MetricBar points={metrics[metric]} />
          <p className="absolute top-[23.24px] left-0 font-mono text-[12px] leading-[0.94] text-ink-soft">
            {label}
            <span className="sr-only">: {pointsToStars(metrics[metric])} stars</span>
          </p>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Player roster (right side)

const ROSTER_TOP = 290.48
const ROSTER_ROW = 94

/**
 * One holder's tokens: a row per type (social, economic, political); spent
 * ones at 50%. `perRow` wraps a long row (the city bank can hold 11 social
 * tokens) into neat lines of that many, and `typeGap` spaces the types apart.
 */
function TokenRows({ start, left: have, perRow, typeGap = 3 }: { start: Record<string, number>; left: Record<string, number>; perRow?: number; typeGap?: number }) {
  return (
    <div className="flex flex-col" style={{ gap: typeGap }}>
      {TOKEN_ORDER.map((t) => (
        <div
          key={t}
          className="flex min-h-[20px] flex-wrap items-center gap-[2px]"
          // perRow tokens of 20.2px with 2px between them
          style={perRow ? { width: perRow * 20.2 + (perRow - 1) * 2 } : undefined}
        >
          {Array.from({ length: start[t] }, (_, i) => (
            <TokenIcon key={i} type={t} spent={i >= have[t]} className="drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Each player: their badge, their character's round token, and their
 * tokens. With fewer than 6 players, the city bank's pool sits underneath.
 */
export function PlayerRoster({ players, spent, raised }: { players: Player[]; spent: Spent; raised?: boolean }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${lift(raised)}`} aria-label="Players">
      {players.map((p, i) => {
        const top = ROSTER_TOP + i * ROSTER_ROW
        return (
          <div key={p.number}>
            <div className="absolute size-[75px] drop-shadow-[-2px_5px_2px_rgba(0,0,0,0.25)]" style={{ left: 1219.34, top }}>
              <CharacterToken id={p.character} className="origin-top-left scale-150" />
            </div>
            <PlayerBadge player={p.number} size="small" className="absolute" style={{ left: 1202.34, top: top + 50.4 }} />
            <div className="absolute" style={{ left: 1308.71, top: top + 7.22 }}>
              <TokenRows start={startingTokens(p.character, players)} left={remaining(p.character, players, spent)} />
            </div>
          </div>
        )
      })}
      {hasCityBank(players) && (
        <div
          className="absolute flex w-[157px] flex-col gap-[6px] rounded-[7px] border border-ink bg-cream px-[12px] py-[10px]"
          style={{ left: 1202.34, top: ROSTER_TOP + players.length * ROSTER_ROW + 11 }}
        >
          <p className="font-mono text-[16px] text-ink italic">city bank</p>
          <TokenRows start={startingTokens('city', players)} left={remaining('city', players, spent)} perRow={6} typeGap={8} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

/** Darkens everything under it (navy at 50%), so the raised parts stand out. */
export function DimOverlay() {
  return <div className="pointer-events-none absolute inset-0 z-10 bg-ink-soft opacity-50" />
}
