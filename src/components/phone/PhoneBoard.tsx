import type { ReactNode } from 'react'
import { getCharacter } from '../../data/characters'
import { TOKEN_ORDER, TOTAL_ROUNDS, type CharacterId, type Tokens, type TokenType } from '../../data/gameRules'
import { hasCityBank, remaining, startingTokens, type Metrics, type Player, type Spent } from '../../game/state'
import { Board, EventDeck, ScoreTrackerCard } from '../board/GameBoard'
import { CharacterToken } from '../CharacterToken'
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

/** A cream counter box: "Round 7 of 15", "Token reset in 3". */
function Counter({ children }: { children: string }) {
  return (
    <p className="flex h-[27px] w-[128px] items-center justify-center rounded-[5px] border border-ink-soft bg-cream font-mono text-[12px] leading-none whitespace-nowrap text-ink-soft">
      {children}
    </p>
  )
}

/**
 * The top bar: the menu booklet, then the round counter and the token reset
 * counter. (Once the game is over, resets mean nothing, so that one goes.)
 */
export function TopBar({ menu, round, untilReset }: { menu: ReactNode; round: number; untilReset?: number }) {
  return (
    <div className="flex items-center gap-[15px] px-[28px] pt-[43px]">
      {menu}
      <Counter>{round > TOTAL_ROUNDS ? `All ${TOTAL_ROUNDS} played` : `Round ${round} of ${TOTAL_ROUNDS}`}</Counter>
      {untilReset !== undefined && <Counter>{`Token reset in ${untilReset}`}</Counter>}
    </div>
  )
}

/** The desktop tracker card, grown to Figma's 250px width. */
export function PhoneTracker({ metrics }: { metrics: Metrics }) {
  // CSS `zoom` (unlike a transform) also grows the space the card takes up
  return <ScoreTrackerCard metrics={metrics} style={{ zoom: 250 / 222.951 }} />
}

// The desktop board sits in a 911.5px square box at (167.89, 30.15) on the
// stage. Here that square is shrunk to 321.7px, with the deck where it
// always is on the map.
const MAP = { size: 321.7, stageBox: { left: 167.89, top: 30.15, size: 911.497 } }

/** The map and the event deck. With `onDraw`, tapping the deck draws a card. */
export function PhoneMap({ onDraw, glowDeck, raisedDeck }: { onDraw?: () => void; glowDeck?: boolean; raisedDeck?: boolean }) {
  const scale = MAP.size / MAP.stageBox.size
  return (
    <div className="relative shrink-0" style={{ width: MAP.size, height: MAP.size }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${scale}) translate(${-MAP.stageBox.left}px, ${-MAP.stageBox.top}px)` }}>
        <Board />
        <EventDeck onDraw={onDraw} glow={glowDeck} raised={raisedDeck} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Players strip

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
      <div className="flex justify-between px-[18px] font-mono text-[12px] leading-none text-ink-soft italic">
        <span>players</span>
        <span aria-hidden="true">swipe →</span>
      </div>
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
              className={`${card} flex h-[100px] w-[120px] items-start gap-[11px] pt-[18px] pl-[12px] drop-shadow-[0px_3px_2px_rgba(0,0,0,0.15)] ${onCharacter ? LIFT : ''}`}
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
                className={`${card} flex min-h-[100px] min-w-[166px] flex-col gap-[6px] px-[10px] pt-[8px] pb-[10px] drop-shadow-[0px_3px_2px_rgba(0,0,0,0.15)] ${onCityBank ? LIFT : ''}`}
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
