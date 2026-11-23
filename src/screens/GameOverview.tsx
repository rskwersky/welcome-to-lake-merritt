import type { CSSProperties, ReactNode } from 'react'
import { Button } from '../components/Button'
import { MiniCharacterCard } from '../components/CardFrame'
import { ManualArt } from '../components/board/ManualArt'
import { MiniPostcard } from '../components/MiniPostcard'
import { PhoneStage } from '../components/phone/PhoneStage'
import { Stage } from '../components/Stage'
import { usePhoneLayout } from '../hooks/usePhoneLayout'
import type { CharacterId } from '../data/gameRules'

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
        <MiniPostcard textClass="text-[12px]" />
      </div>
    </div>
  )
}

// The six character cards lying on the table, each a little tilted.
// `center` is the card's middle (stage px) and `rotate` its tilt, from Figma.
// The card itself is the shared MiniCharacterCard, so all six match.

function TableCard({ id, center, rotate }: { id: CharacterId; center: { x: number; y: number }; rotate: number }) {
  const w = 107.61
  const h = 138.49
  return (
    <div className={`absolute rounded-[6px] ${cardShadow}`} style={{ left: center.x - w / 2, top: center.y - h / 2, width: w, height: h, rotate: `${rotate}deg` }}>
      <MiniCharacterCard id={id} />
    </div>
  )
}

const Protector = () => <TableCard id="protector" center={{ x: 97.65, y: 585.48 }} rotate={7.61} />
const Citizen = () => <TableCard id="citizen" center={{ x: 124.3, y: 749.4 }} rotate={7.61} />
const Environmentalist = () => <TableCard id="environmentalist" center={{ x: 272.65, y: 804.28 }} rotate={-4.82} />
const Organizer = () => <TableCard id="organizer" center={{ x: 255.95, y: 634.45 }} rotate={7.61} />
const Educator = () => <TableCard id="educator" center={{ x: 223.46, y: 466.47 }} rotate={-3.2} />
const Recreationist = () => <TableCard id="recreationist" center={{ x: 87.69, y: 380.22 }} rotate={-0.36} />

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
  const phone = usePhoneLayout()
  if (phone) return <GameOverviewPhone onPlay={onPlay} />
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
        <ManualArt />
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

// ---------------------------------------------------------------------------
// The phone version (Figma "6b · mobile hi-fi", M7)
//
// The same table, rearranged into a portrait collage: the board in the
// middle, three character cards above it and three below, the manual top
// right, the tokens bottom right, then "play game". The pieces are the
// desktop ones: the board, game card and manual are drawn on a stage-sized
// layer and shrunk; the cards are the same small cards at 60%.
// Touch screens have no hover, so nothing lifts here.

/** Figma M7: the board's 370px box sits at (10, 211.6); desktop's is 816.4px at (311.81, 62.87). */
const PHONE_BOARD = { left: 10, top: 211.6, scale: 370 / 816.385 }

/** A small character card at 60%, centered on `center` (phone px), tilted by `rotate`. */
function PhoneTableCard({ id, center, rotate }: { id: CharacterId; center: { x: number; y: number }; rotate: number }) {
  const scale = 0.6
  const w = 107.61
  const h = 138.49
  return (
    <div className="absolute" style={{ left: center.x - w / 2, top: center.y - h / 2, width: w, height: h, rotate: `${rotate}deg`, scale }}>
      <div className={`relative size-full rounded-[6px] ${cardShadow}`}>
        <MiniCharacterCard id={id} />
      </div>
    </div>
  )
}

function GameOverviewPhone({ onPlay }: GameOverviewProps) {
  return (
    <PhoneStage>
      {/* Scrolls on screens shorter than Figma's 844px */}
      <div className="absolute inset-0 overflow-x-hidden overflow-y-auto">
        <div className="relative h-[844px] w-full" role="img" aria-label="The game laid out on a table: the board, the six character cards, the manual and tokens">
          {/* The board and the game card on it: a stage-sized layer, shrunk
              and moved so the board's box lands at Figma's spot */}
          <div
            className="pointer-events-none absolute top-0 left-0 h-[1024px] w-[1440px] origin-top-left"
            style={{ transform: `translate(${PHONE_BOARD.left}px, ${PHONE_BOARD.top}px) scale(${PHONE_BOARD.scale}) translate(-311.81px, -62.87px)` }}
          >
            <Board />
            <GameCard />
          </div>
          {/* The manual, top right (71% of its overview size) */}
          <div className="pointer-events-none absolute top-0 left-0 h-[1024px] w-[1440px]">
            <ManualArt at={{ left: 245.5, top: 109.3 }} scale={0.71} />
          </div>
          <LooseToken kind="social" box={{ left: 323.5, top: 508.5, width: 29.3, height: 28.7 }} />
          <LooseToken kind="political" box={{ left: 296.2, top: 543.7, width: 29.3, height: 28.9 }} />
          <LooseToken kind="economic" box={{ left: 334.8, top: 552, width: 32.2, height: 29.6 }} />
          {/* Three cards above the board, three below */}
          <PhoneTableCard id="recreationist" center={{ x: 52, y: 239.2 }} rotate={-0.36} />
          <PhoneTableCard id="environmentalist" center={{ x: 124.7, y: 222.7 }} rotate={-4.82} />
          <PhoneTableCard id="educator" center={{ x: 199.3, y: 202.6 }} rotate={-3.2} />
          <PhoneTableCard id="protector" center={{ x: 59.1, y: 577.4 }} rotate={7.61} />
          <PhoneTableCard id="organizer" center={{ x: 137.2, y: 586 }} rotate={2} />
          <PhoneTableCard id="citizen" center={{ x: 210.5, y: 593.7 }} rotate={0} />
        </div>
        {/* Figma: 211.5 × 54.9 at y 750, the large button at 90% */}
        <div className="absolute inset-x-0 top-[750px] flex justify-center">
          <div style={{ zoom: 211.5 / 235 }}>
            <Button onClick={onPlay}>play game</Button>
          </div>
        </div>
      </div>
    </PhoneStage>
  )
}
