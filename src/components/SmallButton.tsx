import type { ButtonHTMLAttributes } from 'react'

// Figma's `button / small`: used in character select, the tutorial and the
// game. 42px tall, 20px Courier Prime, cream; it turns gold on hover.
// Disabled = greyed out until the player finishes the step (Figma: a 25%
// navy layer over the button, drawn here with an ::after pseudo-element).
// By default it's as wide as its label plus 12.5px on each side (in code
// 11.25px of padding, because the 1.25px border sits inside the width).

type SmallButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** A fixed width in px, when Figma gives one */
  width?: number
}

export function SmallButton({ width, className = '', style, children, ...rest }: SmallButtonProps) {
  return (
    <button
      type="button"
      className={`h-[42px] shrink-0 cursor-pointer rounded-[7px] border-[1.25px] border-ink bg-cream px-[11.25px] font-mono text-[20px] whitespace-nowrap text-ink-soft drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)] transition-colors duration-150 hover:bg-peach focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink relative disabled:cursor-default disabled:hover:bg-cream disabled:after:absolute disabled:after:inset-[-1.25px] disabled:after:rounded-[7px] disabled:after:bg-ink-soft/25 motion-reduce:transition-none ${className}`}
      style={width ? { width, ...style } : style}
      {...rest}
    >
      {children}
    </button>
  )
}
