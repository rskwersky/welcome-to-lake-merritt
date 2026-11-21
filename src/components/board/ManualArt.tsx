import type { ReactNode } from 'react'

// The game manual drawing: a blue "greetings from Lake Merritt" booklet with
// a page peeking out behind it. It appears three times at different sizes:
//   • the game overview, top right (as drawn in Figma: scale 1)
//   • explore mode, bottom right, bigger (click to open the manual pages)
//   • the little "MENU" button, bottom left of the board (with "MENU"
//     instead of the title)
// The pieces are placed at their game overview positions, then the whole
// drawing is moved and scaled with one CSS transform.

const A = '/assets/overview'
const cardShadow = 'shadow-[-4px_4px_2px_0px_rgba(0,0,0,0.25)]'

/** Top-left corner of the drawing on the game overview, which `at` moves it from. */
const ORIGIN = { left: 1151.67, top: 144.72 }

type Box = { left: number; top: number; width: number; height: number }

function Tilted({ box, rotate, children }: { box: Box; rotate: number; children: ReactNode }) {
  return (
    <div className="absolute flex items-center justify-center" style={box}>
      <div className="flex-none" style={{ rotate: `${rotate}deg` }}>
        {children}
      </div>
    </div>
  )
}

type ManualArtProps = {
  /** Where its top-left corner goes (stage px). Default: the game overview spot. */
  at?: { left: number; top: number }
  scale?: number
  /** The "MENU" version: just the pages; the caller draws its art */
  menu?: boolean
}

export function ManualArt({ at = ORIGIN, scale = 1, menu = false }: ManualArtProps) {
  const moved = at !== ORIGIN || scale !== 1
  return (
    // Covers the stage, so the pieces' % positions are % of the stage. The
    // cover itself ignores the mouse (pointer-events-none!, "!" = important,
    // so a parent can't turn it back on); only the drawing's pieces react.
    <div
      className="pointer-events-none! absolute inset-0 [&>*]:pointer-events-auto"
      style={
        moved
          ? { transformOrigin: `${ORIGIN.left}px ${ORIGIN.top}px`, transform: `translate(${at.left - ORIGIN.left}px, ${at.top - ORIGIN.top}px) scale(${scale})` }
          : undefined
      }
    >
      {/* back page */}
      <Tilted box={{ left: 1156.76, top: 144.72, width: 176.825, height: 223.532 }} rotate={8.6}>
        <div className="relative h-[201.63px] w-[155.396px] skew-x-2">
          <div className="absolute inset-[0_0_-2.98%_-3.86%]">
            <img alt="" src={`${A}/manual-back.svg`} className="block size-full max-w-none" />
          </div>
        </div>
      </Tilted>
      {/* cover */}
      <Tilted box={{ left: 1156.7, top: 144.72, width: 177.611, height: 220.902 }} rotate={7.6}>
        <div className={`h-[201.632px] w-[155.804px] skew-x-1 bg-sky-blue ${cardShadow}`} />
      </Tilted>
      {/* cover art: "LAKE", "MERRITT", canoe, pelican. The MENU booklet
          draws its own (arranged differently, see GameMenu). */}
      {!menu && (
        <div className="absolute contents">
          <div className="absolute inset-[20.53%_8.33%_69.47%_81.52%] flex items-center justify-center" style={{ containerType: 'size' }}>
            <div className="h-[hypot(6.66446cqw,85.1006cqh)] w-[hypot(93.3355cqw,-14.8994cqh)] flex-none rotate-[-6.38deg]">
              <img alt="" src={`${A}/manual-lake.png`} className="pointer-events-none size-full max-w-none" />
            </div>
          </div>
          <div className="absolute inset-[20.24%_12.23%_72.8%_80.71%] flex items-center justify-center" style={{ containerType: 'size' }}>
            <div className="h-[hypot(6.66288cqw,85.0973cqh)] w-[hypot(93.3371cqw,-14.9027cqh)] flex-none rotate-[-6.38deg]">
              <img alt="" src={`${A}/manual-merritt.png`} className="pointer-events-none size-full max-w-none" />
            </div>
          </div>
          <div className="absolute inset-[19.67%_9.15%_76.73%_86.94%] flex items-center justify-center" style={{ containerType: 'size' }}>
            <div className="h-[hypot(93.6698cqw,16.5357cqh)] w-[hypot(6.33016cqw,-83.4643cqh)] flex-none rotate-[-83.4deg]">
              <img alt="" src={`${A}/manual-canoe.svg`} className="block size-full max-w-none" />
            </div>
          </div>
          <div className="absolute inset-[27.2%_9.26%_68.52%_86.6%] flex items-center justify-center" style={{ containerType: 'size' }}>
            <div className="h-[hypot(-14.8153cqw,62.8135cqh)] w-[hypot(85.1847cqw,37.1865cqh)] flex-none rotate-[17.79deg]">
              <img alt="" src={`${A}/manual-bird.png`} className="pointer-events-none size-full max-w-none" />
            </div>
          </div>
        </div>
      )}
      {!menu && (
        <Tilted box={{ left: 1178.91, top: 191.96, width: 76.58, height: 54.771 }} rotate={-16.19}>
          <p className="font-script text-[15px] leading-normal whitespace-nowrap text-black">greetings from</p>
        </Tilted>
      )}
    </div>
  )
}
