import type { CSSProperties } from 'react'

// "Falling into place": pieces of the table (the board, cards, tokens, the
// manual) drop onto it one after another when a screen appears, instead of
// all popping on at once. The motion itself is the `drop-in` animation in
// index.css; this gives each piece its turn.
//
//   <div {...dropIn(3)}>…</div>                     the 4th piece to land
//   <div {...dropIn(3, undefined, 'absolute …')}>    with its own classes
//
// `order` sets when it starts: each piece waits DROP_STEP ms longer than the
// one before, so they land like things set down in turn.
// `origin` is the point it grows and shrinks around: normally its own middle
// (the default), but a layer that covers the whole screen needs the piece's
// middle given in px, or it would shrink toward the middle of the screen.
// With reduced motion (prefers-reduced-motion) pieces simply appear.

export const DROP_STEP = 60

export function dropIn(order: number, origin?: { x: number; y: number }, className = ''): { className: string; style: CSSProperties } {
  return {
    className: `animate-drop-in motion-reduce:animate-none ${className}`,
    style: { animationDelay: `${order * DROP_STEP}ms`, ...(origin && { transformOrigin: `${origin.x}px ${origin.y}px` }) },
  }
}
