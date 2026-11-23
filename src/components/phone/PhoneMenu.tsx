import { useEffect, useState, type CSSProperties } from 'react'
import { MenuBooklet } from '../board/GameMenu'

// The phone's menu: the same "MENU" booklet as the desktop board, small, in
// the top bar (Figma M1: 48.6 × 61). Tap it and the menu buttons drop down
// out of it, each tilted a little, like the desktop fan. Tap a button, the
// booklet again, anywhere else, or press Esc to close it.

type PhoneMenuProps = {
  items: { label: string; onClick: () => void }[]
}

const BOOKLET = { width: 48.6, height: 61.1 }
// The booklet is drawn on a stage-sized layer at (41.13, 888.15), 69.1 wide
const BOOKLET_SCALE = BOOKLET.width / 69.1
const TILTS = [-4, -2.5, -1, 0.5]

export function PhoneMenu({ items }: PhoneMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative z-30 shrink-0" style={BOOKLET}>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative z-10 block size-full cursor-pointer rounded-[3px] transition-[translate] duration-200 hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {/* The desktop booklet, shrunk: its stage-sized layer moved so the
            booklet's corner sits at this button's corner */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 block h-[1024px] w-[1440px] origin-top-left"
          style={{ transform: `scale(${BOOKLET_SCALE}) translate(-41.13px, -888.15px)` }}
        >
          <MenuBooklet />
        </span>
      </button>

      {open && (
        <>
          {/* Tap anywhere else to close (reaches far past the frame) */}
          <button type="button" aria-label="Close the menu" className="fixed -inset-[10000px] cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" aria-label="Game menu" className="absolute top-[calc(100%+12px)] left-0 flex flex-col gap-[10px]">
            {items.map((item, i) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  item.onClick()
                }}
                // Drops in from the booklet, one after another
                className="h-[44px] w-[170px] origin-top-left animate-pop-in cursor-pointer rounded-[9px] border-[1.5px] border-ink bg-cream font-mono text-[18px] text-ink-soft drop-shadow-[0px_3px_2px_rgba(0,0,0,0.2)] hover:bg-peach focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:animate-none"
                style={{ rotate: `${TILTS[i % TILTS.length]}deg`, animationDelay: `${i * 50}ms` } as CSSProperties}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
