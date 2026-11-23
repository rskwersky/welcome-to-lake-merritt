import { useEffect, useState } from 'react'
import { MenuBooklet } from '../board/GameMenu'

// The phone's menu: the same "MENU" booklet as the desktop board, small, in
// the top bar (Figma M1: 48.6 × 61). Tap it and the screen dims and a menu
// card opens just below it: a plain list, one row per choice. Tap a choice,
// the booklet again, anywhere outside, or press Esc to close it.
//
// (Desktop fans its buttons out of the booklet. On a phone the fanned
// buttons were too big and overlapped the board, so it's a simple card.)

type PhoneMenuProps = {
  items: { label: string; onClick: () => void }[]
  /** During a round's popups: the booklet can't be opened (it's dimmed with the board) */
  disabled?: boolean
}

const BOOKLET = { width: 48.6, height: 61.1 }

/** The booklet picture alone, at the top bar's size (also shown, inactive, in the tutorial). */
export function BookletPicture() {
  // The desktop booklet is drawn on a stage-sized layer at (41.13, 888.15),
  // 69.1 wide; shrink that layer and move it so the booklet's corner lands here.
  return (
    <span aria-hidden="true" className="relative block shrink-0" style={BOOKLET}>
      <span
        className="pointer-events-none absolute top-0 left-0 block h-[1024px] w-[1440px] origin-top-left"
        style={{ transform: `scale(${BOOKLET.width / 69.1}) translate(-41.13px, -888.15px)` }}
      >
        <MenuBooklet />
      </span>
    </span>
  )
}

export function PhoneMenu({ items, disabled = false }: PhoneMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    // Lifted above everything only while open; otherwise it sits under the
    // round's dim layer like the rest of the board
    <div className={`relative shrink-0 ${open ? 'z-40' : ''}`} style={BOOKLET}>
      {open && (
        // The dimmed screen; tap it to close. (`fixed` inside the scaled
        // phone frame covers the frame; it reaches far past it for tablets.)
        <button type="button" aria-label="Close the menu" className="fixed -inset-[10000px] animate-fade-in cursor-default bg-ink-soft/50 motion-reduce:animate-none" onClick={() => setOpen(false)} />
      )}
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        // Above the dim, so it stays bright and can close the menu again
        className="relative block size-full cursor-pointer rounded-[3px] transition-[translate] duration-200 enabled:hover:-translate-y-1 disabled:cursor-default focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <BookletPicture />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Game menu"
          className="absolute top-[calc(100%+12px)] left-0 w-[200px] animate-pop-in overflow-hidden rounded-[7px] border border-black bg-cream shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] motion-reduce:animate-none"
        >
          {items.map((item, i) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
              className={`flex h-[48px] w-full cursor-pointer items-center px-[16px] text-left font-mono text-[17px] text-ink-soft transition-colors duration-150 hover:bg-peach focus-visible:bg-peach focus-visible:outline-none motion-reduce:transition-none ${
                i > 0 ? 'border-t border-ink-soft/20' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
