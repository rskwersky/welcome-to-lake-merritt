import type { ReactNode } from 'react'

// A phone "bottom sheet" (Figma M2, M3): a cream panel that slides up from
// the bottom of the screen over the dimmed board, with rounded top corners
// and a small grabber bar. Its content scrolls when it's taller than the
// screen; the footer (the continue button) always stays in view.
//
// The round's sheets can't be swiped away: the group has to decide.

type SheetProps = {
  /** The id of the sheet's title, or a label when it has none */
  labelledBy?: string
  label?: string
  children: ReactNode
  footer?: ReactNode
}

export function Sheet({ labelledBy, label, children, footer }: SheetProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-label={label}
      className="absolute inset-x-0 bottom-0 z-30 flex max-h-[calc(100%-40px)] animate-sheet-up flex-col rounded-t-[16px] border border-b-0 border-ink-soft bg-cream shadow-[0px_-4px_10px_rgba(0,0,0,0.12)] motion-reduce:animate-none"
    >
      <div aria-hidden="true" className="mx-auto mt-[12px] h-[4px] w-[40px] shrink-0 rounded-[2px] bg-ink-soft/25" />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[20px] pt-[28px] pb-[8px]">{children}</div>
      {footer && <div className="flex shrink-0 justify-center pt-[12px] pb-[max(28px,env(safe-area-inset-bottom))]">{footer}</div>}
    </div>
  )
}
