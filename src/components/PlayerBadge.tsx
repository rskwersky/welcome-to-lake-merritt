// Figma's `player-badge` (size=large): a little cream tag with "P1"–"P6".
// It sits on a character card once a player has picked it.
// With `onClick` it can be clicked (on the "all picked" screen, clicking a
// badge lets that player choose again). Without it, it's a disabled button
// that looks the same. It's always the same kind of element, so React keeps
// it (and doesn't replay its appear animation) when it becomes clickable.

type PlayerBadgeProps = {
  player: number
  onClick?: () => void
  className?: string
}

const badge =
  'flex h-[49px] w-[53px] items-center justify-center rounded-[7px] border-[1.25px] border-ink bg-cream font-mono text-[24px] text-ink-soft italic drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)]'

export function PlayerBadge({ player, onClick, className = '' }: PlayerBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={onClick ? `Change Player ${player}’s character` : `Player ${player}`}
      className={`${badge} enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:bg-peach transition-[translate,background-color,opacity] duration-150 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0 ${className}`}
    >
      P{player}
    </button>
  )
}
