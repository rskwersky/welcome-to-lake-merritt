// Figma's `player-badge`: a little cream tag with "P1"–"P6".
// large (53×49) sits on a character card once a player has picked it;
// small (34×31) labels the player roster on the board.
// With `onClick` it can be clicked (on the "all picked" screen, clicking a
// badge lets that player choose again). Without it, it's a disabled button
// that looks the same. It's always the same kind of element, so React keeps
// it (and doesn't replay its appear animation) when it becomes clickable.

import type { CSSProperties } from 'react'

type PlayerBadgeProps = {
  player: number
  style?: CSSProperties
  size?: 'large' | 'small'
  /** The soft drop shadow (on by default; off where the badge sits on a flat popup) */
  shadow?: boolean
  onClick?: () => void
  className?: string
}

const badge =
  'flex items-center justify-center rounded-[7px] border-[1.25px] border-ink bg-cream font-mono text-ink-soft italic'
const SIZE = { large: 'h-[49px] w-[53px] text-[24px]', small: 'h-[31px] w-[34px] text-[16px]' }

export function PlayerBadge({ player, size = 'large', shadow = true, onClick, className = '', style }: PlayerBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={style}
      aria-label={onClick ? `Change Player ${player}’s character` : `Player ${player}`}
      className={`${badge} ${SIZE[size]} ${shadow ? 'drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)]' : ''} enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:bg-peach transition-[translate,background-color,opacity] duration-150 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0 ${className}`}
    >
      P{player}
    </button>
  )
}
