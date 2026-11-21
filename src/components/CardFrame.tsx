import type { ReactNode } from 'react'
import { getCharacter } from '../data/characters'
import { STARTING_TOKENS, type CharacterId, type TokenType } from '../data/gameRules'
import { TokenIcon } from './TokenIcon'

// The frame every character card shares: colored border, title bar with
// the name, the inside, and (on the small cards) a stats strip.
//
// Why it's drawn in code and not a picture: the exported card pictures were
// each drawn a little differently (corner radius, border width, title bar
// height, where the stats sit). Drawn here from one set of numbers, all six
// cards match exactly; only their colors and pictures differ.
//
// It's drawn at the big card's size (284 × 365). The small cards are the
// same drawing, shrunk with a CSS scale (see MiniCharacterCard).

const CARD = { width: 284, height: 365 }

// Tailwind only creates classes it can find written out in full, so each
// character's color classes are listed here rather than built from the id.
const COLORS: Record<CharacterId, { frame: string; title: string; inside: string }> = {
  organizer: { frame: 'bg-card-organizer-frame', title: 'bg-card-organizer-title', inside: 'bg-card-organizer' },
  recreationist: { frame: 'bg-card-recreationist-frame', title: 'bg-card-recreationist-title', inside: 'bg-card-recreationist' },
  protector: { frame: 'bg-card-protector-frame', title: 'bg-card-protector-title', inside: 'bg-card-protector' },
  environmentalist: { frame: 'bg-card-environmentalist-frame', title: 'bg-card-environmentalist-title', inside: 'bg-card-environmentalist' },
  citizen: { frame: 'bg-card-citizen-frame', title: 'bg-card-citizen-title', inside: 'bg-card-citizen' },
  educator: { frame: 'bg-card-educator-frame', title: 'bg-card-educator-title', inside: 'bg-card-educator' },
}

/** The stats, in the order printed on the cards */
const STAT_ORDER: TokenType[] = ['political', 'social', 'economic']

type CardFrameProps = {
  id: CharacterId
  /** Show the stats strip at the bottom (the small cards) */
  stats?: boolean
  /** Drawn on top of the inside, below the title bar */
  children?: ReactNode
}

export function CardFrame({ id, stats = false, children }: CardFrameProps) {
  const c = COLORS[id]
  return (
    <div className={`absolute inset-0 rounded-[16px] p-[10px] ${c.frame}`}>
      <div className={`flex size-full flex-col overflow-hidden rounded-[8px] ${c.inside}`}>
        <p className={`flex h-[44px] shrink-0 items-center justify-center font-script text-[30px] leading-none whitespace-nowrap text-cream ${c.title}`}>
          {getCharacter(id).name}
        </p>
        <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
        {stats && (
          <>
            <p className={`flex h-[22px] shrink-0 items-center justify-center font-mono text-[14px] font-bold tracking-[0.08em] text-cream italic ${c.title}`}>STATS</p>
            <div className="flex h-[58px] shrink-0 items-center justify-around bg-cream px-[8px]">
              {STAT_ORDER.map((t) => (
                <span key={t} className="flex items-center gap-[6px] font-mono text-[30px] leading-none text-ink-soft">
                  <TokenIcon type={t} size={38} />
                  {STARTING_TOKENS[id][t]}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Each character's picture on the small cards, fitted into the space between
// the title bar and the stats strip. `size` is how much of that space it may
// fill (some pictures have empty space around them, so they get more).
const A = '/assets/characters'
const MINI_PICTURE: Record<CharacterId, { src: string; size: string }> = {
  organizer: { src: 'icon-organizer.svg', size: 'inset-[6%_10%]' },
  recreationist: { src: 'icon-recreationist.png', size: 'inset-[0%_0%]' },
  protector: { src: 'icon-protector.png', size: 'inset-[10%_18%]' },
  environmentalist: { src: 'icon-environmentalist.png', size: 'inset-[0%_6%]' },
  citizen: { src: 'icon-citizen.png', size: 'inset-[-18%_-10%]' },
  educator: { src: 'icon-educator.svg', size: 'inset-[6%_8%]' },
}

/**
 * The small card (Figma `player-card`, 107.6 × 138.5): the big card's
 * frame with the stats strip, shrunk to fit.
 */
export function MiniCharacterCard({ id }: { id: CharacterId }) {
  const scale = 107.61 / CARD.width
  return (
    <div className="absolute top-0 left-0 origin-top-left" style={{ width: CARD.width, height: CARD.height, transform: `scale(${scale})` }}>
      <CardFrame id={id} stats>
        <div className={`absolute ${MINI_PICTURE[id].size}`}>
          <img alt="" src={`${A}/${MINI_PICTURE[id].src}`} className="size-full max-w-none object-contain" draggable={false} />
        </div>
      </CardFrame>
    </div>
  )
}
