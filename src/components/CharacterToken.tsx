import type { CharacterId } from '../data/gameRules'

// The small round character icon from Figma ("<character> character icon",
// the `character-token` component): a 50px colored circle with the
// character's object in it. Used in the manual now, and later on the board.
//
// Each circle is an SVG. Four characters' objects are separate pictures laid
// on top; the educator's and organizer's are already drawn into their SVG.

const M = '/assets/manual'

type Overlay = { src: string; className: string; imgClassName?: string }

const OVERLAY: Partial<Record<CharacterId, Overlay>> = {
  // The house picture has empty space around it, so it's cropped by
  // enlarging it inside a smaller box with overflow hidden.
  citizen: {
    src: 'icon-house.png',
    className: 'left-[16.19%] right-[16.19%] top-[9.08px] aspect-[291/274] overflow-hidden',
    imgClassName: 'absolute top-[-27.74%] left-[-22.11%] h-[188.32%] w-[142.84%]',
  },
  environmentalist: { src: 'icon-olive.png', className: 'left-[14.69%] right-[14.69%] top-[2.63px] aspect-[440/566]' },
  protector: { src: 'icon-gem.png', className: 'left-[20.78%] right-[20.78%] top-[9.16px] aspect-[237/257]' },
  recreationist: { src: 'icon-saxophone.png', className: 'left-[6px] top-[2.41px] h-[42px] w-[38px]' },
}

export function CharacterToken({ id, className = '' }: { id: CharacterId; className?: string }) {
  const overlay = OVERLAY[id]
  return (
    <div className={`relative size-[50px] shrink-0 ${className}`}>
      <img alt="" src={`${M}/circle-${id}.svg`} className="absolute inset-0 block size-full max-w-none" draggable={false} />
      {overlay && (
        <div className={`pointer-events-none absolute ${overlay.className}`}>
          <img
            alt=""
            src={`${M}/${overlay.src}`}
            className={`max-w-none ${overlay.imgClassName ?? 'absolute inset-0 size-full object-cover'}`}
            draggable={false}
          />
        </div>
      )}
    </div>
  )
}
