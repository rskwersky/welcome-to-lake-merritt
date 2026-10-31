import type { ButtonHTMLAttributes } from 'react'

// The "button" component from Figma: cream (or character-colored) box,
// thin ink border, italic Courier Prime label, soft drop shadow.
//
// Figma has two kinds of button:
//   fixed → 235px wide, label centered (learn more, play game, select…)
//   hug   → as wide as the label plus 31px on each side (long story, long story short).
//           In code that is 29.75px of padding, because the 1.25px border
//           counts toward the width here but sits inside the padding in Figma.

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Tailwind background class, e.g. "bg-organizer". Defaults to cream. */
  colorClass?: string
  width?: 'fixed' | 'hug'
}

export function Button({ colorClass = 'bg-cream', width = 'fixed', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`h-[61px] shrink-0 cursor-pointer rounded-[7px] border-[1.25px] border-ink font-mono text-[32px] whitespace-nowrap text-black italic drop-shadow-[0_4px_2px_rgba(0,0,0,0.25)] transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink active:translate-y-0 motion-reduce:transition-none ${
        width === 'fixed' ? 'w-[235px]' : 'px-[29.75px]'
      } ${colorClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
