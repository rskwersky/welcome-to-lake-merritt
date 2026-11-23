import type { CSSProperties, ReactNode } from 'react'

// The tutorial's "tip" box: cream, thin navy border, 20px Courier Prime.
// With `onNext`, a small arrow button sits 10px to its right, lined up with
// its bottom edge (Figma's `arrow-button`), to move to the next step.

type TipProps = {
  children: ReactNode
  /** Text width in px (Figma sets each tip's text box) */
  width?: number
  onNext?: () => void
  className?: string
  style?: CSSProperties
}

export function Tip({ children, width = 273.844, onNext, className = '', style }: TipProps) {
  return (
    <div className={`flex items-end gap-[10px] ${className}`} style={style}>
      <p
        role="status"
        className="rounded-[7px] border border-ink-soft bg-cream p-[10px] font-mono text-[20px] leading-[0.94] text-black"
        // The width is for the text; padding and border add to it.
        style={{ width: width + 22 }}
      >
        {children}
      </p>
      {onNext && <ArrowButton onClick={onNext} />}
    </div>
  )
}

/** Figma's `arrow-button` (34×31): a small cream button with a → arrow. Gold on hover. */
export function ArrowButton({ onClick, label = 'Next' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative h-[31px] w-[34px] shrink-0 cursor-pointer rounded-[7px] border-[1.25px] border-ink bg-cream drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)] transition-colors duration-150 hover:bg-peach focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none"
    >
      {/* Figma's arrow, on its own so the background (CSS) can turn gold.
          The picture is the full 34×31 button size, so it sits at -1.25px to
          line up over the border. */}
      <img alt="" src="/assets/board/arrow.svg" className="absolute top-[-1.25px] left-[-1.25px] h-[31px] w-[34px] max-w-none" />
    </button>
  )
}
