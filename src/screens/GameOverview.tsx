import type { CSSProperties, ReactNode } from 'react'
import { Button } from '../components/Button'
import { Stage } from '../components/Stage'

// Figma screen "01 game overview": the first thing you see. A tabletop with
// the board, the six character cards, the manual, an event card and tokens.
//
// Every object is its own layer, placed at its exact Figma position and
// angle, so each one can lift a little when you hover it. That makes the
// table feel touchable before the game has even started.
//
// The numbers come straight from Figma. Two patterns repeat a lot:
//  • <Tilted>: Figma reports a rotated object's *bounding box* (the upright
//    box around it) plus the object's real size and angle. We place the box,
//    center the object inside it, and rotate the object.
//  • Container query units (cqw / cqh) inside the small postcards: 1cqw is 1%
//    of the surrounding box's width. Figma exports skewed layers that way.
//
// The objects aren't buttons: hovering is just for fun, nothing happens on
// click. The only control on this screen is "play game".

const A = '/assets/overview'

// ---------------------------------------------------------------------------
// Building blocks

/**
 * Wraps one object on the table. Hovering any part of it lifts the whole
 * object a few px and deepens its shadow.
 * The wrapper covers the whole stage but ignores the mouse itself
 * (pointer-events: none); only the object inside it reacts. A parent still
 * counts as "hovered" when the mouse is over one of its children.
 */
function Lift({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      aria-label={label}
      role="img"
      className="pointer-events-none absolute inset-0 transition-[translate,filter] duration-200 ease-out hover:-translate-y-1.5 hover:drop-shadow-[-3px_8px_6px_rgba(0,0,0,0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 [&>*]:pointer-events-auto"
    >
      {children}
    </div>
  )
}

type Box = { left: number; top: number; width: number; height: number }

/** A rotated object: `box` is its upright bounding box, `children` is the object at its real size. */
function Tilted({ box, rotate, children, className = '' }: { box: Box; rotate: number; children: ReactNode; className?: string }) {
  return (
    <div className={`absolute flex items-center justify-center ${className}`} style={box}>
      <div className="flex-none" style={{ rotate: `${rotate}deg` }}>
        {children}
      </div>
    </div>
  )
}

// The three tokens are one image side by side (a "sprite"): social (cream),
// economic (gold), political (navy). Each token shows its slice of it by
// making the image ~3× wider than the token and shifting it left.
type TokenKind = 'social' | 'economic' | 'political'
const TOKEN_SLICE: Record<TokenKind, string> = {
  social: 'left-0 top-[-0.02%] h-[100.04%] w-[305.34%]',
  economic: 'left-[-91.87%] top-0 h-full w-[287.04%]',
  political: 'left-[-206.76%] top-[-0.02%] h-[100.04%] w-[306.76%]',
}

function Token({ kind, width, height, className = '', style }: { kind: TokenKind; width: number; height: number; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative ${className}`} style={{ width, height, ...style }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img alt="" src={`${A}/tokens.png`} className={`absolute max-w-none ${TOKEN_SLICE[kind]}`} draggable={false} />
      </div>
    </div>
  )
}

/** A small token lying on a character card, placed by its bounding box and tilted. */
function CardToken({ kind, box, rotate }: { kind: TokenKind; box: Box; rotate: number }) {
  // Each token kind has a slightly different size in Figma.
  const height = kind === 'social' ? 16.722 : kind === 'economic' ? 15.727 : 16.8
  return (
    <Tilted box={box} rotate={rotate}>
      <Token kind={kind} width={17.079} height={height} />
    </Tilted>
  )
}

/** A character card's front image. */
function CardImage({ id, className = '', style }: { id: string; className?: string; style?: CSSProperties }) {
  return (
    <div className={`absolute ${className}`} style={style}>
      <img alt="" src={`${A}/card-${id}.png`} className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[inherit] object-cover" draggable={false} />
    </div>
  )
}

const cardShadow = 'shadow-[-4px_4px_2px_0px_rgba(0,0,0,0.25)]'

// ---------------------------------------------------------------------------
// The objects on the table

function Board() {
  return (
    <>
      <Tilted box={{ left: 311.81, top: 62.87, width: 816.385, height: 816.385 }} rotate={-6.76}>
        <div className="bg-board size-[735px] border-[2.5px] border-ink-soft shadow-[-10px_10px_8px_0px_rgba(0,0,0,0.25)]" />
      </Tilted>
      <Tilted box={{ left: 320.69, top: 71.75, width: 798.614, height: 798.614 }} rotate={-6.76}>
        <img alt="" src={`${A}/map.png`} width={719} height={719} className="block size-[719px] max-w-none" draggable={false} />
      </Tilted>
    </>
  )
}

/** The small "greetings from Lake Merritt" postcard lying on the board. */
function GameCard() {
  return (
    <div
      className="absolute flex aspect-[207.47/165.91] -translate-y-1/2 items-center justify-center"
      style={{ left: '37.09%', right: '48.51%', top: 'calc(50% + 67.8px)', containerType: 'size' }}
    >
      <div className="h-[hypot(-81.9862cqw,36.1959cqh)] w-[hypot(18.0138cqw,63.8041cqh)] flex-none rotate-[70.55deg]">
        <div className="relative size-full">
          <div className="absolute inset-[1.92%_3.1%]">
            <img alt="" src={`${A}/postcard-blue.svg`} className="absolute inset-0 block size-full max-w-none" />
          </div>
          <div className="absolute inset-[0.27%_0.44%]">
            <img alt="" src={`${A}/postcard-inner-stroke.svg`} className="absolute inset-0 block size-full max-w-none" />
          </div>
          <img alt="" src={`${A}/postcard-rectangle.svg`} className="absolute inset-0 block size-full max-w-none" />

          <div className="absolute inset-[6.36%_9.32%_10.73%_2.95%] flex items-center justify-center" style={{ containerType: 'size' }}>
            <div className="h-[hypot(68.4886cqw,-10.3522cqh)] w-[hypot(-31.5114cqw,-89.6478cqh)] flex-none rotate-[-103.03deg] skew-x-[-0.11deg]">
              <div className="pointer-events-none relative size-full overflow-hidden">
                <img alt="" src={`${A}/merritt.png`} className="absolute top-0 left-0 h-[127.47%] w-full max-w-none" />
              </div>
            </div>
          </div>
          <div className="absolute inset-[42.32%_26.59%_4.27%_8.12%] flex items-center justify-center" style={{ containerType: 'size' }}>
            <div className="h-[hypot(73.4738cqw,-12.8285cqh)] w-[hypot(-26.5262cqw,-87.1715cqh)] flex-none rotate-[-103.03deg] skew-x-[-0.11deg]">
              <img alt="" src={`${A}/lake.png`} className="pointer-events-none size-full max-w-none" />
            </div>
          </div>
          {/* canoe */}
          <div className="absolute inset-[38.8%_67.68%_51.24%_23.12%]">
            <img alt="" src={`${A}/canoe-1.svg`} className="absolute inset-0 block size-full max-w-none" />
          </div>
          <div className="absolute inset-[30.19%_72.9%_61.93%_15.64%]">
            <img alt="" src={`${A}/canoe-2.svg`} className="absolute inset-0 block size-full max-w-none" />
          </div>
          <div className="absolute inset-[30.77%_67.16%_50.85%_14.98%]">
            <img alt="" src={`${A}/canoe-3.svg`} className="absolute inset-0 block size-full max-w-none" />
          </div>
          <div className="absolute inset-[38.31%_71.86%_60.77%_24.33%]">
            <img alt="" src={`${A}/canoe-4.svg`} className="absolute inset-0 block size-full max-w-none" />
          </div>
          {/* pelican */}
          <div className="absolute inset-[14.37%_18.13%_64.56%_60.97%] flex items-center justify-center" style={{ containerType: 'size' }}>
            <div className="h-[hypot(83.2357cqw,5.5863cqh)] w-[hypot(16.7643cqw,-94.4137cqh)] flex-none rotate-[-83.74deg] skew-x-[0.05deg]">
              <img alt="" src={`${A}/bird.png`} className="pointer-events-none size-full max-w-none" />
            </div>
          </div>
          <div className="absolute inset-[54.53%_58.68%_7.49%_8.3%] flex items-center justify-center" style={{ containerType: 'size' }}>
            <div className="h-[hypot(33.8152cqw,-6.98104cqh)] w-[hypot(-66.1848cqw,-93.019cqh)] flex-none rotate-[-111.05deg] skew-x-[-0.16deg]">
              <p className="relative size-full font-script text-[12px] leading-[0.94] text-ink">greetings from</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// The six character cards, each with its three stat tokens on top.

function Protector() {
  return (
    <>
      <Tilted box={{ left: 35.3, top: 509.96, width: 124.695, height: 151.041 }} rotate={7.61}>
        <div className={`relative h-[138.044px] w-[107.368px] rounded-[5px] ${cardShadow}`}>
          <CardImage id="protector" className="inset-0 rounded-[5px]" />
        </div>
      </Tilted>
      <CardToken kind="social" box={{ left: 76.25, top: 627.3, width: 19.142, height: 18.836 }} rotate={7.61} />
      <CardToken kind="economic" box={{ left: 109.48, top: 632.15, width: 19.01, height: 17.849 }} rotate={7.61} />
      <CardToken kind="political" box={{ left: 44.17, top: 622.94, width: 19.153, height: 18.913 }} rotate={7.61} />
    </>
  )
}

function Citizen() {
  return (
    <div className="absolute" style={{ left: 69.86, top: 681.2, width: 124.7, height: 160.225 }}>
      <CardImage id="citizen" className={`top-[-0.8px] right-[13.29%] left-[0.6%] aspect-[1106/1422] rounded-[4px] ${cardShadow}`} />
      <CardToken kind="social" box={{ left: 40.68, top: 109.55, width: 19.142, height: 18.836 }} rotate={7.61} />
      <CardToken kind="economic" box={{ left: 72.3, top: 110.04, width: 19.01, height: 17.849 }} rotate={7.61} />
      <CardToken kind="political" box={{ left: 7.81, top: 109.55, width: 19.153, height: 18.913 }} rotate={7.61} />
    </div>
  )
}

function Environmentalist() {
  return (
    <Tilted box={{ left: 213.33, top: 730.68, width: 118.645, height: 147.203 }} rotate={-4.82}>
      <div className={`relative h-[138.67px] w-[107.37px] rounded-[5px] ${cardShadow}`}>
        <CardImage id="environmentalist" className="inset-0 rounded-[5px]" />
        <Token kind="political" width={17.08} height={16.801} className="absolute!" style={{ left: 7.34, top: 114.29 }} />
        <Token kind="social" width={17.08} height={16.723} className="absolute!" style={{ left: 39.69, top: 114.37 }} />
        <Token kind="economic" width={17.08} height={15.727} className="absolute!" style={{ left: 72.05, top: 114.29 }} />
      </div>
    </Tilted>
  )
}

function Organizer() {
  return (
    <>
      <CardImage id="organizer" className={cardShadow} style={{ left: 202.26, top: 565.43, width: 107.37, height: 138.047 }} />
      <CardToken kind="social" box={{ left: 242.25, top: 676.96, width: 19.142, height: 18.836 }} rotate={7.61} />
      <CardToken kind="economic" box={{ left: 273.88, top: 677.45, width: 19.01, height: 17.849 }} rotate={7.61} />
      <CardToken kind="political" box={{ left: 209.39, top: 676.96, width: 19.153, height: 18.913 }} rotate={7.61} />
    </>
  )
}

function Educator() {
  return (
    <>
      <Tilted box={{ left: 166, top: 394.55, width: 114.915, height: 143.83 }} rotate={-3.2}>
        <div className="relative h-[138.047px] w-[107.37px]">
          <CardImage id="educator" className={`inset-[-0.31%_0_0.31%_0] rounded-[5px] ${cardShadow}`} />
        </div>
      </Tilted>
      <CardToken kind="social" box={{ left: 213.7, top: 508.83, width: 18.051, height: 17.717 }} rotate={-3.44} />
      <CardToken kind="economic" box={{ left: 244.62, top: 507.8, width: 17.992, height: 16.723 }} rotate={-3.44} />
      <CardToken kind="political" box={{ left: 180.69, top: 511.1, width: 18.056, height: 17.795 }} rotate={-3.44} />
    </>
  )
}

function Recreationist() {
  return (
    <>
      <CardImage id="recreationist" className="overflow-hidden rounded-[5px]" style={{ left: 34, top: 311.2, width: 107.37, height: 138.047 }} />
      <CardToken kind="social" box={{ left: 75.31, top: 425.42, width: 17.185, height: 16.83 }} rotate={-0.36} />
      <CardToken kind="economic" box={{ left: 106.24, top: 426.05, width: 17.178, height: 15.834 }} rotate={-0.36} />
      <CardToken kind="political" box={{ left: 42.23, top: 425.92, width: 17.185, height: 16.908 }} rotate={-0.36} />
    </>
  )
}

/** The rule book, top right: a blue "greetings from Lake Merritt" cover with a page peeking out behind it. */
function Manual() {
  return (
    <>
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
      {/* cover art: "LAKE", "MERRITT", canoe, pelican */}
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
      <Tilted box={{ left: 1178.91, top: 191.96, width: 76.58, height: 54.771 }} rotate={-16.19}>
        <p className="font-script text-[15px] leading-normal whitespace-nowrap text-black">greetings from</p>
      </Tilted>
    </>
  )
}

/** The "Graffiti at the Boathouse" event card, with tiny tokens next to its options. */
function EventCard() {
  // Option text on the card: 6px Courier Prime, tilted with the card.
  const tiny = 'relative font-mono text-[6px] leading-[6px] text-ink-soft'
  const tiltedText = (inset: string, w: string, h: string, text: string, extra = 'size-full') => (
    <div className={`absolute ${inset} flex items-center justify-center`} style={{ containerType: 'size' }}>
      <div className={`${h} ${w} flex-none rotate-[-19.46deg]`}>
        <p className={`${tiny} ${extra}`}>{text}</p>
      </div>
    </div>
  )
  const optionBar = (inset: string, src: string) => (
    <div className={`absolute ${inset} flex items-center justify-center`} style={{ containerType: 'size' }}>
      <div className="h-[hypot(96.4527cqw,-77.2498cqh)] w-[hypot(-3.54727cqw,-22.7502cqh)] flex-none rotate-[-109.46deg]">
        <div className="relative size-full">
          <div className="absolute inset-[-0.31%_-2.99%]">
            <img alt="" src={`${A}/${src}`} className="block size-full max-w-none" />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Tilted box={{ left: 1144.25, top: 469.93, width: 205.873, height: 165.096 }} rotate={-19.47}>
        <div className="h-[111.889px] w-[178.8px] rounded-[5px] border border-ink-soft bg-cream shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
      </Tilted>
      {optionBar('inset-[50.16%_7.97%_43.09%_81.13%]', 'event-option-a.svg')}
      {optionBar('inset-[52.07%_7.5%_41.17%_81.6%]', 'event-option-b.svg')}
      {optionBar('inset-[53.98%_7.01%_39.26%_82.09%]', 'event-option-a.svg')}
      {tiltedText('inset-[50.57%_8.41%_43.44%_81.39%]', 'w-[hypot(97.398cqw,-82.377cqh)]', 'h-[hypot(2.60205cqw,17.623cqh)]', 'Declare a new art space to encourage graffiti in a designated area.')}
      <div
        className="absolute flex h-[69.237px] w-[130.769px] items-center justify-center"
        style={{ left: 'calc(50% + 451.72px)', top: 'calc(50% - 28.5px)' }}
      >
        <p className="h-[27.905px] w-[128.833px] flex-none rotate-[-19.46deg] font-script text-[15px] leading-none text-ink-soft">
          Graffiti at the Boathouse
        </p>
      </div>
      {tiltedText('inset-[48.58%_8.47%_45.08%_80.72%]', 'w-[hypot(97.4311cqw,-82.5675cqh)]', 'h-[hypot(2.56887cqw,17.4325cqh)]', 'Graffiti has been appearing on the boathouse. Some find it disruptive. Do you:', 'w-full text-ink')}
      {tiltedText('inset-[52.26%_7.58%_41.57%_81.86%]', 'w-[hypot(97.4861cqw,-82.8844cqh)]', 'h-[hypot(2.51394cqw,17.1156cqh)]', 'Station an officer to walk the perimeter of the lake and patrol for vandalism.')}
      {tiltedText('inset-[57.34%_12.84%_39.87%_82.5%]', 'w-[hypot(97.0187cqw,-80.2524cqh)]', 'h-[hypot(2.98129cqw,19.7476cqh)]', 'Leave the graffiti.', 'whitespace-nowrap')}

      {/* Option 1 cost: 2 political, 3 social */}
      <Tilted box={{ left: 1277.17, top: 526.39, width: 34.042, height: 16.968 }} rotate={-19.59}>
        <div className="flex h-[5.901px] w-[34.033px] items-center gap-px">
          <Token kind="political" width={5.944} height={5.847} className="shrink-0" />
          <Token kind="political" width={5.944} height={5.847} className="shrink-0" />
          <Token kind="social" width={5.944} height={5.819} className="shrink-0" />
          <Token kind="social" width={5.944} height={5.819} className="shrink-0" />
          <Token kind="social" width={5.944} height={5.819} className="shrink-0" />
        </div>
      </Tilted>
      {/* Option 2 cost: 3 political */}
      <Tilted box={{ left: 1298.02, top: 543.36, width: 23.381, height: 14.616 }} rotate={-19.87}>
        <div className="flex w-[22.136px] items-center">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex h-[7.539px] w-[7.597px] shrink-0 items-center justify-center ${i < 2 ? 'mr-[-1px]' : ''}`}>
              <Token kind="political" width={5.944} height={5.847} className="flex-none rotate-[-20.2deg]" />
            </div>
          ))}
        </div>
      </Tilted>
    </>
  )
}

/** One of the three big loose tokens, bottom right. */
function LooseToken({ kind, box }: { kind: TokenKind; box: Box }) {
  return (
    // drop-shadow (not box-shadow) so the shadow follows the round token, not its square box
    <div className="absolute drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]" style={box}>
      <Token kind={kind} width={box.width} height={box.height} />
    </div>
  )
}

// ---------------------------------------------------------------------------

type GameOverviewProps = {
  onPlay: () => void
}

export function GameOverview({ onPlay }: GameOverviewProps) {
  return (
    <Stage className="bg-overview">
      {/* Objects are listed bottom to top, in Figma's layer order. */}
      <Board />
      <Lift label="The 'greetings from Lake Merritt' game card">
        <GameCard />
      </Lift>

      <Lift label="The Protector card">
        <Protector />
      </Lift>
      <Lift label="The Citizen card">
        <Citizen />
      </Lift>
      <Lift label="The Environmentalist card">
        <Environmentalist />
      </Lift>
      <Lift label="The Organizer card">
        <Organizer />
      </Lift>
      <Lift label="A political token">
        <LooseToken kind="political" box={{ left: 1187.99, top: 799.78, width: 59.665, height: 58.691 }} />
      </Lift>
      <Lift label="A social token">
        <LooseToken kind="social" box={{ left: 1243.68, top: 728.08, width: 59.667, height: 58.421 }} />
      </Lift>
      <Lift label="An economic token">
        <LooseToken kind="economic" box={{ left: 1266.56, top: 816.58, width: 65.47, height: 60.286 }} />
      </Lift>
      <Lift label="The Educator card">
        <Educator />
      </Lift>
      <Lift label="The Recreationist card">
        <Recreationist />
      </Lift>
      <Lift label="The game manual">
        <Manual />
      </Lift>
      <Lift label="The 'Graffiti at the Boathouse' event card">
        <EventCard />
      </Lift>

      {/* Figma: 235×61, centered, 919px from the top */}
      <div className="absolute inset-x-0 top-[919px] flex justify-center">
        <Button onClick={onPlay}>play game</Button>
      </div>
    </Stage>
  )
}
