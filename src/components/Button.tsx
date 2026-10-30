import type { ButtonHTMLAttributes } from 'react'

// The "button" component from Figma: cream (or character-colored) box,
// thin ink border, italic Courier Prime label, soft drop shadow.

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Tailwind background class, e.g. "bg-organizer". Defaults to cream. */
  colorClass?: string
}

export function Button({ colorClass = 'bg-cream', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`h-[61px] min-w-[235px] cursor-pointer rounded-[7px] border-[1.25px] border-ink px-6 font-mono text-[32px] italic text-black drop-shadow-[0_4px_2px_rgba(0,0,0,0.25)] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none ${colorClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
