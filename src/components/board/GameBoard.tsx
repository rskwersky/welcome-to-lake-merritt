import type { CSSProperties, ReactNode } from 'react'
import { getCharacter } from '../../data/characters'
import type { MapStarId } from '../../data/explore'
import { TOKEN_ORDER, TRACKER, pointsToStars, type CharacterId } from '../../data/gameRules'
import { BAR_HEIGHT, BAR_WIDTH, PADDING, ROW_GAP, ROW_HEIGHT, SLOT_WIDTH, STAR, TRACKER_BOX } from './trackerLayout'
import { METRIC_ROWS, hasCityBank, remaining, startingTokens, type Metrics, type Player, type Spent } from '../../game/state'
import { CharacterToken } from '../CharacterToken'
import { MiniPostcard } from '../MiniPostcard'
import { PlayerBadge } from '../PlayerBadge'
import { Star } from '../Star'
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

const MAP_STARS: { id: MapStarId; name: string; left: number; top: number; kind: 'a' | 'b' }[] = [
  { id: 'pergola', name: 'the pergola', left: 932.19, top: 191.01, kind: 'a' },
  { id: 'bird-sanctuary', name: 'the bird sanctuary', left: 569.19, top: 336.01, kind: 'b' },
  { id: 'lake-shore-ave', name: 'Lakeshore Ave', left: 788.19, top: 413.01, kind: 'b' },
  { id: 'boating-center', name: 'the boating center', left: 556.19, top: 413.01, kind: 'a' },
  { id: 'lake', name: 'the lake', left: 672.19, top: 467.01, kind: 'b' },
  { id: 'corner', name: 'the northwest shore', left: 264.19, top: 223.01, kind: 'b' },
]

/**
 * The board and map. The stars only appear in explore mode (`onStar`): in
 * play mode they're dormant, so they aren't drawn at all. In explore mode
 * they're buttons that lift on hover and open a photo.
 */
export function Board({ onStar }: { onStar?: (id: MapStarId) => void } = {}) {
  return (
    <>
      <Tilted box={{ left: 167.89, top: 30.15, width: 911.497, height: 911.497 }} rotate={-6.76}>
        <div className="bg-board size-[820.63px] border-[2.5px] border-ink-soft shadow-[-10px_10px_8px_0px_rgba(0,0,0,0.25)]" />
      </Tilted>
      <Tilted box={{ left: 177.81, top: 40.07, width: 891.655, height: 891.655 }} rotate={-6.76}>
        <img alt="" src={`${B}/map.png`} width={802.766} height={802.766} className="block size-[802.766px] max-w-none" draggable={false} />
      </Tilted>
      {/* The SVGs include a drop shadow, so they're a little bigger than the star itself. */}
      {onStar &&
        MAP_STARS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onStar(s.id)}
            aria-label={`Photo of ${s.name}`}
            className={`absolute z-20 h-[46px] ${s.kind === 'a' ? 'w-[45px]' : 'w-[46px]'} animate-pop-in cursor-pointer rounded-full transition-[translate,filter] duration-200 hover:-translate-y-1.5 hover:drop-shadow-[-2px_6px_4px_rgba(0,0,0,0.25)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
            style={{ left: s.left, top: s.top }}
          >
            <div className={`absolute ${s.kind === 'a' ? 'inset-[4.36%_-2.54%_-4.78%_-2.54%]' : 'inset-[4.23%_-2.33%_-4.84%_-2.33%]'}`}>
              <img alt="" src={`${B}/star-${s.kind}.svg`} className="block size-full max-w-none" draggable={false} />
            </div>
          </button>
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

/** One small rating star (the shared <Star> drawing); `half` shows only the half nearest zero. */
export function RatingStar({ negative, half, className = '', style }: { negative: boolean; half?: boolean; className?: string; style?: CSSProperties }) {
  return (
    // Positioned `relative` unless the caller places it (e.g. `absolute`):
    // having both classes at once lets CSS order pick the wrong one.
    <span className={`block ${className.includes('absolute') ? className : `relative ${className}`}`} style={style}>
      <Star width={STAR.width} negative={negative} half={half} outline={1} />
    </span>
  )
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
            // No appear animation: new stars arrive by flying in from the
            // popup (FlyingStars), and a second "pop" on landing looks jerky.
            className="absolute"
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

// Layout of the right-hand column, built on a few spacing rules so it reads
// as clear groups (the Gestalt "proximity" and "alignment" principles):
//   • one shared left edge: counter, tracker, badges and city bank all start
//     at the tracker's x, so the eye runs straight down the column;
//   • small gaps inside a group, bigger gaps between groups: 11px between the
//     counter and tracker (both are "the score"), 32px before the players,
//     16px between one player and the next, 24px before the city bank;
//   • each player's tokens are centered on their character token, and the
//     token rows always start at the same x, so players are easy to compare.
const COLUMN_LEFT = TRACKER_BOX.left // 1175.93, same as the counter and tracker
const COLUMN_WIDTH = 222.951
const TRACKER_BOTTOM = 238.5 // TRACKER_BOX.top + its height
const ROSTER_TOP = TRACKER_BOTTOM + 32
const CIRCLE = 75 // character token
const BADGE = { width: 34, height: 31, overlap: 50.4 } // small badge, its top sits 50.4px down the circle
const ROSTER_ROW = BADGE.overlap + BADGE.height + 16 // one player's height + the gap to the next
const CIRCLE_LEFT = COLUMN_LEFT + 17 // the badge pokes out 17px to the left of the circle
const TOKENS_LEFT = CIRCLE_LEFT + CIRCLE + 16
const TOKEN = 20.2
const TOKEN_GAP = 2
const ROWS_HEIGHT = 3 * TOKEN + 2 * 3 // three token rows, 3px apart

/**
 * One holder's tokens: a row per type (social, economic, political); spent
 * ones at 50%. A row wraps after `perRow` tokens so it never runs off the
 * edge, and `typeGap` spaces the types apart. A type the holder has none of
 * keeps its (empty) row, so each type is always at the same height.
 */
function TokenRows({ start, left: have, perRow, typeGap = 3 }: { start: Record<string, number>; left: Record<string, number>; perRow: number; typeGap?: number }) {
  return (
    <div className="flex flex-col" style={{ gap: typeGap }}>
      {TOKEN_ORDER.map((t) => (
        <div key={t} className="flex flex-wrap items-center" style={{ minHeight: TOKEN, gap: TOKEN_GAP, width: perRow * TOKEN + (perRow - 1) * TOKEN_GAP }}>
          {Array.from({ length: start[t] }, (_, i) => (
            <TokenIcon key={i} type={t} spent={i >= have[t]} className="drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Hover lift for the clickable parts of the roster (CLAUDE.md: a few px up, a bit more shadow)
const LIFT =
  'pointer-events-auto cursor-pointer transition-[translate,filter] duration-200 hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none motion-reduce:hover:translate-y-0'

type PlayerRosterProps = {
  players: Player[]
  spent: Spent
  raised?: boolean
  /** Click a character token (opens their motivation card). Without it the tokens are just pictures. */
  onCharacter?: (id: CharacterId) => void
  /** Click the city bank (explains what it's for) */
  onCityBank?: () => void
}

/**
 * Each player: their badge, their character's round token, and their
 * tokens. With fewer than 6 players, the city bank's pool sits underneath.
 */
export function PlayerRoster({ players, spent, raised, onCharacter, onCityBank }: PlayerRosterProps) {
  // Room for the tokens between their left edge and the column's right edge
  const perRow = Math.floor((COLUMN_LEFT + COLUMN_WIDTH - TOKENS_LEFT + TOKEN_GAP) / (TOKEN + TOKEN_GAP))
  return (
    <div className={`absolute inset-0 pointer-events-none ${lift(raised)}`} aria-label="Players">
      {players.map((p, i) => {
        const top = ROSTER_TOP + i * ROSTER_ROW
        return (
          <div key={p.number}>
            {/* Always a <button> (disabled during a round), so the element
                never swaps and nothing jumps. "flex items-start": a button
                centers its contents top to bottom by default, which would
                push the picture down. */}
            <button
              type="button"
              onClick={onCharacter ? () => onCharacter(p.character) : undefined}
              disabled={!onCharacter}
              aria-label={`Player ${p.number}, ${getCharacter(p.character).name}${onCharacter ? ': open their card' : ''}`}
              className={`absolute flex items-start rounded-full drop-shadow-[-2px_5px_2px_rgba(0,0,0,0.25)] ${onCharacter ? `hover:drop-shadow-[-2px_9px_5px_rgba(0,0,0,0.22)] ${LIFT}` : ''}`}
              style={{ left: CIRCLE_LEFT, top, width: CIRCLE, height: CIRCLE }}
            >
              <CharacterToken id={p.character} className="origin-top-left scale-150" />
            </button>
            <PlayerBadge player={p.number} size="small" className="absolute" style={{ left: COLUMN_LEFT, top: top + BADGE.overlap }} />
            <div className="absolute" style={{ left: TOKENS_LEFT, top: top + (CIRCLE - ROWS_HEIGHT) / 2 }}>
              <TokenRows start={startingTokens(p.character, players)} left={remaining(p.character, players, spent)} perRow={perRow} />
            </div>
          </div>
        )
      })}
      {hasCityBank(players) &&
        (() => {
          // A button when it can be clicked, otherwise a plain box; same look.
          const Tag = onCityBank ? 'button' : 'div'
          return (
            <Tag
              {...(onCityBank ? { type: 'button' as const, onClick: onCityBank, 'aria-label': 'City bank: what is it?' } : {})}
              className={`absolute flex flex-col gap-[8px] rounded-[5px] border border-black bg-cream px-[12px] pt-[10px] pb-[12px] text-left ${onCityBank ? `${LIFT} hover:shadow-[0px_6px_8px_rgba(0,0,0,0.18)]` : ''}`}
              // Same width, border and corner as the tracker above, so the column has one shape
              style={{ left: COLUMN_LEFT, width: COLUMN_WIDTH, top: ROSTER_TOP + players.length * ROSTER_ROW - 16 + 24 }}
            >
              <span className="font-mono text-[16px] leading-none text-ink italic">city bank</span>
              <TokenRows start={startingTokens('city', players)} left={remaining('city', players, spent)} perRow={8} typeGap={6} />
            </Tag>
          )
        })()}
    </div>
  )
}

// ---------------------------------------------------------------------------

/**
 * How far an overlay reaches past the 1440 × 1024 frame. When the window's
 * shape differs from the frame's, there's empty space beside or above it;
 * the overlay must darken that too, or the edges stay bright. The page
 * clips anything past the window (<Stage> has overflow-hidden), so a huge
 * number is harmless.
 */
export const BEYOND_STAGE = '-inset-[10000px]'

/**
 * Darkens everything under it (navy at 50%), so the raised parts stand out.
 * `visible={false}` fades it away (it stays in the page so it can fade).
 */
export function DimOverlay({ visible = true }: { visible?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute ${BEYOND_STAGE} z-10 bg-ink-soft transition-opacity duration-500 motion-reduce:transition-none ${visible ? 'opacity-50' : 'opacity-0'}`}
    />
  )
}
