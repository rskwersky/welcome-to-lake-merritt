import type { ReactNode } from 'react'
import { characters, getCharacter } from '../../data/characters'
import { MAP_STARS, type MapStarId } from '../../data/explore'
import { TOKEN_ORDER, TOTAL_ROUNDS, type CharacterId, type Tokens, type TokenType } from '../../data/gameRules'
import { hasCityBank, remaining, startingTokens, type Metrics, type Player, type Spent } from '../../game/state'
import { Board, EventDeck, ScoreTrackerCard } from '../board/GameBoard'
import { MiniCharacterCard } from '../CardFrame'
import { PlacePostcard } from '../PlacePostcard'
import { CharacterToken } from '../CharacterToken'
import { DROP_STEP, dropIn } from '../dropIn'
import { TokenIcon } from '../TokenIcon'

// The parts of the phone game board (Figma "6b · mobile hi-fi", M1), top to
// bottom: the counters, the score tracker, the map with the event deck, and
// a strip of player cards you swipe sideways. Sizes are Figma's (390 wide).
//
// The tracker and the map are the desktop ones, shrunk or grown to fit, so
// they always match the desktop board exactly.

// Hover lift for clickable things (CLAUDE.md); hover only exists with a mouse
const LIFT =
  'cursor-pointer transition-[translate,box-shadow] duration-200 hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none motion-reduce:hover:translate-y-0'

const BOX = 'flex h-[27px] w-[128px] items-center justify-center rounded-[5px] border border-ink-soft bg-cream font-mono text-[12px] leading-none whitespace-nowrap text-ink-soft'

/** A cream counter box: "Round 7 of 15", "Token reset in 3". */
function Counter({ children }: { children: string }) {
  return <p className={BOX}>{children}</p>
}

/** The round counters (play mode). Once the game is over, resets mean nothing, so that one goes. */
export function Counters({ round, untilReset }: { round: number; untilReset?: number }) {
  return (
    <>
      <Counter>{round > TOTAL_ROUNDS ? `All ${TOTAL_ROUNDS} played` : `Round ${round} of ${TOTAL_ROUNDS}`}</Counter>
      {untilReset !== undefined && <Counter>{`Token reset in ${untilReset}`}</Counter>}
    </>
  )
}

/** A top bar button in the counters' shape (explore mode: "play mode", "learn more"). */
export function TopButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    // The visible box is 27px tall; the tap area reaches 44px
    <button
      type="button"
      onClick={onClick}
      className={`${BOX} relative cursor-pointer transition-[translate,background-color] duration-200 before:absolute before:-inset-y-[9px] before:inset-x-0 hover:-translate-y-0.5 hover:bg-peach focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
    >
      {children}
    </button>
  )
}

/** The top bar: the menu booklet, then the counters or buttons (`children`). */
export function TopBar({ menu, children }: { menu: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-[15px] px-[28px] pt-[43px]">
      {menu}
      {children}
    </div>
  )
}

/** The desktop tracker card, grown to Figma's 250px width. */
export function PhoneTracker({ metrics }: { metrics: Metrics }) {
  // CSS `zoom` (unlike a transform) also grows the space the card takes up
  const fall = dropIn(3)
  return <ScoreTrackerCard metrics={metrics} className={fall.className} style={{ zoom: 250 / 222.951, ...fall.style }} />
}

// The desktop board sits in a 911.5px square box at (167.89, 30.15) on the
// stage. Here that square is shrunk to 321.7px, with the deck where it
// always is on the map.
const MAP = { size: 321.7, stageBox: { left: 167.89, top: 30.15, size: 911.497 } }

/** Phone map stars are drawn this big (Figma M5), twice the size the shrunk map would give them */
const STAR_SIZE = 23
/** ...but each one can be tapped anywhere in a 44px circle around it (Apple's minimum tap size) */
const STAR_TAP = 44

type PhoneMapProps = {
  /** Tap the deck to draw a card */
  onDraw?: () => void
  glowDeck?: boolean
  raisedDeck?: boolean
  /** Explore mode: the map stars appear, and tapping one opens its photo */
  onStar?: (id: MapStarId) => void
  /**
   * Tutorial: dim the board but keep the deck bright. The map is raised
   * above the screen's dim layer, and gets its own dim square over the
   * board, under the deck.
   */
  dimBoard?: boolean
}

/** The map and the event deck; in explore mode, the map stars too. */
/** The board's tilt on the table (Board in GameBoard.tsx), which the phone undoes */
const BOARD_TILT = -6.76
/** The straight board (820.63px) grown to fill the box its tilted corners needed (911.5px) */
const STRAIGHT_SCALE = MAP.stageBox.size / 820.63

/** Where the deck's middle lands on the phone map (its desktop spot, shrunk) */
const DECK_CENTER = { x: (415.37 + 243.724 / 2 - MAP.stageBox.left) * (MAP.size / MAP.stageBox.size), y: (505 + 194.902 / 2 - MAP.stageBox.top) * (MAP.size / MAP.stageBox.size) }
/** The deck's tap area: much bigger than the little card (86 × 69), since it's the main thing to tap */
const DECK_TAP = { width: 120, height: 100 }

export function PhoneMap({ onDraw, glowDeck, raisedDeck, onStar, dimBoard }: PhoneMapProps) {
  const scale = MAP.size / MAP.stageBox.size
  return (
    <div className={`relative shrink-0 ${dimBoard ? 'z-20' : ''}`} style={{ width: MAP.size, height: MAP.size }}>
      {/* On a phone the board sits straight, not tilted like on the table:
          everything below is turned back by the board's tilt, and grown so
          the straight board fills the square (it's smaller than the box
          its tilted corners needed). The deck and stars turn with it. */}
      <div className="absolute inset-0" style={{ rotate: `${-BOARD_TILT}deg`, scale: STRAIGHT_SCALE }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${scale}) translate(${-MAP.stageBox.left}px, ${-MAP.stageBox.top}px)` }}>
        <Board />
        {dimBoard && (
          // The board's own square (820.63px, tilted -6.76°), in the dim navy
          <div className="absolute z-10 flex items-center justify-center" style={{ left: MAP.stageBox.left, top: MAP.stageBox.top, width: MAP.stageBox.size, height: MAP.stageBox.size }}>
            <div className="size-[820.63px] flex-none bg-ink-soft/50" style={{ rotate: '-6.76deg' }} />
          </div>
        )}
        {/* The deck's own button isn't used here: the bigger one below is */}
        <EventDeck glow={glowDeck} bigGlow raised={raisedDeck} />
      </div>
      {onDraw && (
        <button
          type="button"
          onClick={onDraw}
          aria-label="Draw an event card"
          className={`absolute cursor-pointer rounded-[12px] focus-visible:outline-3 focus-visible:outline-ink ${raisedDeck ? 'z-30' : 'z-10'}`}
          style={{ left: DECK_CENTER.x - DECK_TAP.width / 2, top: DECK_CENTER.y - DECK_TAP.height / 2, ...DECK_TAP }}
        />
      )}
      {/* The stars sit outside the shrunk layer, so they can be bigger than
          it would make them. Each is placed by its center on the desktop
          map (MAP_STARS), moved and shrunk the same way as the map. */}
      {onStar &&
        MAP_STARS.map((star, i) => {
          const x = (star.left + 23 - MAP.stageBox.left) * scale
          const y = (star.top + 23 - MAP.stageBox.top) * scale
          return (
            <button
              key={star.id}
              type="button"
              onClick={() => onStar(star.id)}
              aria-label={`Photo of ${star.name}`}
              // Each star falls into place in turn when explore mode opens
              className="group/star absolute z-10 flex animate-drop-in cursor-pointer items-center justify-center rounded-full focus-visible:outline-3 focus-visible:outline-ink motion-reduce:animate-none"
              style={{ left: x - STAR_TAP / 2, top: y - STAR_TAP / 2, width: STAR_TAP, height: STAR_TAP, animationDelay: `${(1 + i) * DROP_STEP}ms` }}
            >
              <img
                alt=""
                src={`/assets/board/star-${star.kind}.svg`}
                draggable={false}
                className="block max-w-none transition-[translate,filter] duration-200 group-hover/star:-translate-y-1 group-hover/star:drop-shadow-[-1px_4px_3px_rgba(0,0,0,0.25)] motion-reduce:transition-none motion-reduce:group-hover/star:translate-y-0"
                // Turned back upright (the map under them was turned straight)
                style={{ width: STAR_SIZE, height: STAR_SIZE, rotate: `${BOARD_TILT}deg` }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * All six characters' small cards, 3 across (Figma M5): every character,
 * played or not, so players can read about each one. Tap one for its card.
 */
export function PhoneCharacterCards({ onOpen }: { onOpen: (id: CharacterId) => void }) {
  return (
    <div className="grid grid-cols-[repeat(3,107.61px)] gap-x-[17.5px] gap-y-[17px]">
      {characters.map(({ id, name }, i) => (
        <button
          key={id}
          type="button"
          onClick={() => onOpen(id)}
          aria-label={`Open ${name}’s card`}
          // Fall into place in turn, after the places
          style={{ animationDelay: `${(10 + i) * DROP_STEP}ms` }}
          className="relative h-[138.49px] w-[107.61px] animate-drop-in cursor-pointer rounded-[6px] shadow-[-3px_3px_2px_0px_rgba(0,0,0,0.25)] transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[-3px_8px_7px_0px_rgba(0,0,0,0.22)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <MiniCharacterCard id={id} />
        </button>
      ))}
    </div>
  )
}

/**
 * Explore mode's "places": the six map stars' photos as little postcards in
 * a row you swipe sideways. The map's stars are small to tap on a phone, so
 * this is the easy way in; both open the same photo.
 */
export function PhonePlaces({ onOpen }: { onOpen: (id: MapStarId) => void }) {
  return (
    <section aria-label="Places" className="w-full">
      <StripLabel swipe>places</StripLabel>
      <div className="mt-[7px] flex snap-x snap-mandatory scroll-px-[16px] gap-[14px] overflow-x-auto px-[16px] pt-[8px] pb-[14px] [scrollbar-width:none]">
        {MAP_STARS.map((star, i) => (
          <PlacePostcard key={star.id} star={star.id} name={star.name} index={i} firstDrop={4} width={124} photoHeight={84} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Players strip

/** A small italic label over a row ("players", "places"), with "swipe →" when the row scrolls sideways. */
export function StripLabel({ children, swipe = false }: { children: string; swipe?: boolean }) {
  return (
    <div className="flex justify-between px-[18px] font-mono text-[12px] leading-none text-ink-soft italic">
      <span>{children}</span>
      {swipe && <span aria-hidden="true">swipe →</span>}
    </div>
  )
}

const STRIP_TOKEN = 16

/** The little "P1" tag in a player card's corner (Figma: 21 × 19). */
function MiniBadge({ player }: { player: number }) {
  return (
    <span className="absolute bottom-[4px] left-[4px] flex h-[19px] w-[21px] items-center justify-center rounded-[5px] border border-ink bg-cream font-mono text-[12px] leading-none text-ink-soft italic">
      P{player}
    </span>
  )
}

/** Every token in order (social, economic, political), spent ones at 50%. */
function tokenList(start: Tokens, have: Tokens) {
  return TOKEN_ORDER.flatMap((t: TokenType) => Array.from({ length: start[t] }, (_, i) => ({ type: t, spent: i >= have[t] })))
}

function describeTokens(have: Tokens) {
  return TOKEN_ORDER.map((t) => `${have[t]} ${t}`).join(', ')
}

type PlayersStripProps = {
  players: Player[]
  spent: Spent
  /** Tap a player card: their motivation card. Without it the cards are just pictures. */
  onCharacter?: (id: CharacterId) => void
  /** Tap the city bank: what it's for */
  onCityBank?: () => void
}

/**
 * One card per player (character token, tokens, P badge), then the city bank
 * with fewer than 6 players. More cards than fit: swipe sideways. Each
 * character has 6 tokens, shown 2 across and 3 down, like Figma.
 */
export function PlayersStrip({ players, spent, onCharacter, onCityBank }: PlayersStripProps) {
  const card = 'relative shrink-0 snap-start rounded-[7px] border border-black bg-cream text-left'
  return (
    <section aria-label="Players" className="w-full">
      <StripLabel swipe>players</StripLabel>
      {/* Scrolls sideways; snap: a swipe stops with a card at the left edge.
          The padding leaves room for the cards' lift and shadow. */}
      <div className="mt-[7px] flex snap-x snap-mandatory scroll-px-[16px] gap-[17px] overflow-x-auto px-[16px] pt-[6px] pb-[14px] [scrollbar-width:none]">
        {players.map((p) => {
          const have = remaining(p.character, players, spent)
          const tokens = tokenList(startingTokens(p.character, players), have)
          return (
            <button
              key={p.number}
              type="button"
              onClick={onCharacter ? () => onCharacter(p.character) : undefined}
              disabled={!onCharacter}
              aria-label={`Player ${p.number}, ${getCharacter(p.character).name}. Tokens left: ${describeTokens(have)}.${onCharacter ? ' Open their card.' : ''}`}
              // The player cards fall into place in turn, after the tracker
              style={{ animationDelay: `${(4 + p.number) * DROP_STEP}ms` }}
              className={`${card} flex h-[100px] w-[120px] animate-drop-in items-start gap-[11px] pt-[18px] pl-[12px] drop-shadow-[0px_3px_2px_rgba(0,0,0,0.15)] motion-reduce:animate-none ${onCharacter ? LIFT : ''}`}
            >
              <span className="relative size-[53px] shrink-0">
                <CharacterToken id={p.character} className="origin-top-left scale-[1.06]" />
              </span>
              <span className="grid grid-cols-2 gap-[3px]" style={{ width: STRIP_TOKEN * 2 + 3 }}>
                {tokens.map((t, i) => (
                  <TokenIcon key={i} type={t.type} spent={t.spent} size={STRIP_TOKEN} />
                ))}
              </span>
              <MiniBadge player={p.number} />
            </button>
          )
        })}
        {hasCityBank(players) &&
          (() => {
            const have = remaining('city', players, spent)
            const start = startingTokens('city', players)
            return (
              <button
                type="button"
                onClick={onCityBank}
                disabled={!onCityBank}
                aria-label={`City bank. Tokens left: ${describeTokens(have)}.${onCityBank ? ' What is it?' : ''}`}
                style={{ animationDelay: `${(5 + players.length) * DROP_STEP}ms` }}
                className={`${card} flex min-h-[100px] min-w-[166px] animate-drop-in flex-col gap-[6px] px-[10px] pt-[8px] pb-[10px] drop-shadow-[0px_3px_2px_rgba(0,0,0,0.15)] motion-reduce:animate-none ${onCityBank ? LIFT : ''}`}
              >
                <span className="font-mono text-[14px] leading-none text-ink italic">city bank</span>
                {/* A row per type: the pool can hold many tokens */}
                {TOKEN_ORDER.map((t) => (
                  <span key={t} className="flex gap-[2px]" style={{ minHeight: STRIP_TOKEN - 2 }}>
                    {Array.from({ length: start[t] }, (_, i) => (
                      <TokenIcon key={i} type={t} spent={i >= have[t]} size={STRIP_TOKEN - 2} />
                    ))}
                  </span>
                ))}
              </button>
            )
          })()}
      </div>
    </section>
  )
}
