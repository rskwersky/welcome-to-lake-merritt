import { useState, type CSSProperties } from 'react'
import { ManualArt } from './ManualArt'

// Figma's `manual-button` + `menu` (bottom left of the board).
// A little "MENU" booklet. Hover it (or focus it, or tap it) and three
// `menu-button`s fan out of it, like cards spread from a hand:
//   new game · learn more · explore mode (or "play mode" while exploring)
// The menu stays open while the mouse is anywhere over the booklet or the
// buttons (they share one hover area), and closes when it leaves.

type GameMenuProps = {
  mode: 'play' | 'explore'
  onNewGame: () => void
  onLearnMore: () => void
  onToggleMode: () => void
  /** "feedback": shown only when the feedback form is available */
  onFeedback?: () => void
}

const A = '/assets/overview'

// Each button's resting tilt once fanned out, top to bottom. They spread
// from the booklet's corner, so the one farthest away tilts the most.
// (Top to bottom; with 3 buttons the top one is skipped.)
const FAN = [-8, -6, -3.5, -1]
// The booklet is drawn twice Figma's size (Figma's 69 × 87 was too small to
// read as a menu): scaled 2× from its bottom-left corner, which moves from
// Figma's (41, 975) to (24, 1000).
const BOOKLET = { scale: 2, from: { x: 41.13, y: 975.3 }, to: { x: 24, y: 1000 }, width: 139, height: 174 }

// Buttons: 46 tall, 12 apart, 28 above the booklet.
const STEP = 46 + 12
const GAP_ABOVE_BOOKLET = 28
// How far each button travels: from the middle of the booklet to its spot.
// `fromBottom`: 0 for the button just above the booklet, 1 for the next…
const travel = (fromBottom: number) => fromBottom * STEP + 46 / 2 + GAP_ABOVE_BOOKLET + BOOKLET.height / 2

const BUTTON =
  'h-[46px] w-[190px] origin-bottom-left cursor-pointer rounded-[9px] border-[1.5px] border-ink bg-cream font-mono text-[20px] text-ink-soft drop-shadow-[0px_3px_2px_rgba(0,0,0,0.2)] hover:bg-peach focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink'

// Closed: shrunk, tilted back and tucked into the booklet, invisible.
// Open: at its spot with its fan tilt. The transform reads the per-button
// numbers from CSS variables (--travel, --tilt) set in `style`.
const CLOSED = '[transform:translateY(var(--travel))_rotate(-24deg)_scale(0.4)] opacity-0 pointer-events-none'
const OPEN = '[transform:rotate(var(--tilt))] opacity-100 pointer-events-auto'
const OPEN_ON_HOVER =
  'group-hover/menu:[transform:rotate(var(--tilt))] group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto group-focus-within/menu:[transform:rotate(var(--tilt))] group-focus-within/menu:opacity-100 group-focus-within/menu:pointer-events-auto'

export function GameMenu({ mode, onNewGame, onLearnMore, onToggleMode, onFeedback }: GameMenuProps) {
  // Opened by tapping (touch screens have no hover); hover and focus open it too.
  const [open, setOpen] = useState(false)
  const items = [
    { label: 'new game', onClick: onNewGame },
    { label: 'learn more', onClick: onLearnMore },
    { label: mode === 'play' ? 'explore mode' : 'play mode', onClick: onToggleMode },
  ]
  if (onFeedback) items.splice(2, 0, { label: 'feedback', onClick: onFeedback })

  return (
    <>
      {/* The booklet (<MenuBooklet>, below), scaled up (BOOKLET) in one go */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          transformOrigin: `${BOOKLET.from.x}px ${BOOKLET.from.y}px`,
          transform: `translate(${BOOKLET.to.x - BOOKLET.from.x}px, ${BOOKLET.to.y - BOOKLET.from.y}px) scale(${BOOKLET.scale})`,
        }}
      >
        <MenuBooklet />
      </div>

      {/* One hover area covering the buttons and the booklet */}
      <div
        className="group/menu absolute flex w-[200px] flex-col justify-end"
        style={{ left: BOOKLET.to.x - 3, top: 570, height: BOOKLET.to.y - 570 }}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="flex flex-col gap-[12px] pl-[3px]" role="menu" aria-label="Game menu">
          {items.map((item, i) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={(e) => {
                // Close the menu: also let go of keyboard focus, which would
                // otherwise keep it open (it opens on focus)
                setOpen(false)
                e.currentTarget.blur()
                item.onClick()
              }}
              // An "overshoot" curve, so each one springs a little past its
              // spot and settles. The nearest button goes first.
              className={`${BUTTON} transition-[transform,opacity,background-color] duration-[420ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${open ? OPEN : `${CLOSED} ${OPEN_ON_HOVER}`}`}
              style={{ '--travel': `${travel(items.length - 1 - i)}px`, '--tilt': `${FAN[FAN.length - items.length + i]}deg`, transitionDelay: `${(items.length - 1 - i) * 60}ms` } as CSSProperties}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          style={{ width: BOOKLET.width, height: BOOKLET.height, marginTop: GAP_ABOVE_BOOKLET, marginLeft: 3 }}
          className="flex-none cursor-pointer rounded-[4px] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
      </div>
    </>
  )
}

/**
 * The booklet drawing, at its Figma spot on the 1440 × 1024 stage (69 × 87
 * at 41, 888): the game overview manual's pages at 0.379×, then its own art
 * placed in % of the stage: canoe on top, "MENU", pelican below. Its parent
 * must be stage sized. (The phone's top bar draws it too, shrunk.)
 */
export function MenuBooklet() {
  return (
    <>
      <ManualArt at={{ left: 41.13, top: 888.15 }} scale={0.3792} menu />
      <div className="absolute inset-0">
        <div className="absolute inset-[88.43%_94.58%_9.83%_3.53%] flex items-center justify-center" style={{ containerType: 'size' }}>
          <div className="h-[hypot(93.6696cqw,16.5351cqh)] w-[hypot(6.33041cqw,-83.4649cqh)] flex-none rotate-[-83.4deg]">
            <img alt="" src={`${A}/manual-canoe.svg`} className="block size-full max-w-none" />
          </div>
        </div>
        <div className="absolute inset-[92.35%_92.81%_5.54%_5.15%] flex items-center justify-center" style={{ containerType: 'size' }}>
          <div className="h-[hypot(-14.8153cqw,62.8135cqh)] w-[hypot(85.1847cqw,37.1865cqh)] flex-none rotate-[17.79deg]">
            <img alt="" src={`${A}/manual-bird.png`} className="size-full max-w-none" />
          </div>
        </div>
        <div className="absolute inset-[89.05%_92.81%_7.34%_3.41%] flex items-center justify-center" style={{ containerType: 'size' }}>
          <div className="h-[hypot(11.8598cqw,65.1263cqh)] w-[hypot(88.1402cqw,-34.8737cqh)] flex-none rotate-[-15.08deg]">
            <img alt="" src="/assets/explore/menu-label.png" className="size-full max-w-none object-cover" />
          </div>
        </div>
      </div>
    </>
  )
}
