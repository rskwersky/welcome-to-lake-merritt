import type { TokenType } from '../data/gameRules'

// One round game token: social (cream), economic (gold) or political (navy).
//
// All three are drawn side by side in one picture (a "sprite",
// public/assets/overview/tokens.png). An icon shows its token's slice: a box
// with overflow hidden, and the picture moved left so only that slice shows.
// Measurements are in multiples of the token's height, so any size works.
//   start = where the token begins in the picture, width = how wide it is.

const SPRITE_SRC = '/assets/overview/tokens.png'
const SPRITE_WIDTH = 3.117 // the whole picture is 3.117× as wide as it is tall
const SLICE: Record<TokenType, { start: number; width: number }> = {
  social: { start: 0, width: 1.0213 },
  economic: { start: 1.057, width: 0.9911 },
  political: { start: 2.135, width: 0.9834 },
}

type TokenIconProps = {
  type: TokenType
  /** Height in px (Figma: 20 on the board, 37 in the cost pill) */
  size?: number
  /** Already spent this round: shown at 50% */
  spent?: boolean
  className?: string
}

export function TokenIcon({ type, size = 20, spent = false, className = '' }: TokenIconProps) {
  const slice = SLICE[type]
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden transition-opacity duration-300 motion-reduce:transition-none ${spent ? 'opacity-50' : ''} ${className}`}
      style={{ width: size * slice.width, height: size }}
    >
      <img
        alt=""
        src={SPRITE_SRC}
        draggable={false}
        className="absolute top-0 max-w-none"
        style={{ height: size, width: size * SPRITE_WIDTH, left: -size * slice.start }}
      />
    </span>
  )
}
