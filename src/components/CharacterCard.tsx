import type { ReactNode } from 'react'
import { getCharacter } from '../data/characters'
import type { CharacterId } from '../data/gameRules'
import { CardFrame } from './CardFrame'
import { PlayerBadge } from './PlayerBadge'

// Figma's `character-card` (284×365). Three states:
//  • default:     the card's picture (lantern, saxophone, gem…)
//  • description: who they are and their two goals. On character select
//                 the card *flips over* to this side on hover or keyboard
//                 focus, like turning over a real card (same CSS 3D trick
//                 as the postcard).
//  • taken:       someone picked it: darkened, with their player badge.
//
// Each side is the shared card frame (CardFrame: border, name, inside
// color; the same for every character) with the picture or the text on top.

const A = '/assets/characters'

/**
 * A picture placed by a box. (An <img> ignores left+right / top+bottom and
 * keeps its own size, so we size a <div> instead and let the picture fill it.)
 */
function Pic({ box, src, fit = 'object-cover' }: { box: string; src: string; fit?: string }) {
  return (
    <div className={`pointer-events-none absolute ${box}`}>
      <img alt="" src={`${A}/${src}`} className={`absolute inset-0 size-full max-w-none ${fit}`} draggable={false} />
    </div>
  )
}

// Each character's picture on the front, placed in % of the card (Figma's numbers).
const PICTURE: Record<CharacterId, ReactNode> = {
  organizer: <Pic box="inset-[23.68%_27.5%_14.81%_28.79%]" src="icon-organizer.svg" fit="block" />,
  recreationist: <Pic box="inset-[17.28%_3.74%_3.19%_3.74%]" src="icon-recreationist.png" />,
  protector: <Pic box="top-[112px] right-[19.9%] left-[19.9%] aspect-[237/257]" src="icon-protector.png" />,
  environmentalist: <Pic box="top-[32.44px] right-[4.4%] left-[4.4%] aspect-[440/566]" src="icon-environmentalist.png" />,
  // The house picture has empty space around it, so it's cropped: shown
  // larger inside a smaller box that hides what spills out.
  citizen: (
    <div className="absolute top-[96px] left-[48px] h-[178px] w-[189px] overflow-hidden rounded-[39px]">
      <img alt="" src={`${A}/icon-citizen.png`} className="absolute top-[-27.74%] left-[-22.11%] h-[188.32%] w-[142.84%] max-w-none" />
    </div>
  ),
  educator: <Pic box="inset-[17.4%_6.83%_8.22%_6.81%]" src="icon-educator.svg" fit="block" />,
}

/** One side of the card: the shared frame (CardFrame), then this side's contents. */
function Face({ id, back, children }: { id: CharacterId; back?: boolean; children: ReactNode }) {
  return (
    <div className={`absolute inset-0 backface-hidden ${back ? 'rotate-y-180' : ''}`}>
      <CardFrame id={id} />
      {children}
    </div>
  )
}

/** The back: intro sentence, then two starred goals. 20px Courier Prime. */
function Description({ id }: { id: CharacterId }) {
  const c = getCharacter(id)
  return (
    <div id={`character-${id}-description`} className="absolute top-[60px] right-[14px] left-[20px] text-left font-mono text-[20px] leading-[1.05] text-ink-soft">
      <p>{c.intro}</p>
      <ul className="mt-[8px] flex flex-col gap-[21px]">
        {c.goals.map((goal) => (
          <li key={goal} className="flex gap-[4px]">
            {/* Figma's star sits in a 35.85px box with some empty space around it */}
            <span className="relative size-[35.85px] shrink-0">
              <Pic box="inset-[8.13%_9.99%_15.41%_9.99%]" src="star.svg" fit="block" />
            </span>
            <span>{goal}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type CharacterCardProps = {
  id: CharacterId
  /** The player (1–6) whose badge sits on this card, if any */
  badge?: number
  /** Darkened and not clickable: someone has it */
  taken?: boolean
  /** Called when the card is picked. Without it the card can't be clicked or flipped. */
  onPick?: () => void
  /** Called when the badge is clicked */
  onBadgeClick?: () => void
  /** Show the description side (explore mode opens a card this way) */
  side?: 'front' | 'description'
}

export function CharacterCard({ id, badge, taken = false, onPick, onBadgeClick, side = 'front' }: CharacterCardProps) {
  const { name } = getCharacter(id)
  const canPick = !!onPick && !taken

  return (
    // group/card: lets the badge react to the mouse anywhere on the card
    <div className="group/card relative h-[365px] w-[284px]">
      <button
        type="button"
        onClick={onPick}
        disabled={!canPick}
        aria-label={canPick ? `Choose ${name}${badge ? ` (Player ${badge} has it)` : ''}` : badge ? `${name}, picked by Player ${badge}` : name}
        aria-describedby={`character-${id}-description`}
        className="group perspective-[1600px] block size-full cursor-pointer rounded-[16px] drop-shadow-[-4px_4px_1px_rgba(0,0,0,0.25)] focus-visible:outline-3 focus-visible:outline-offset-6 focus-visible:outline-ink disabled:cursor-default"
      >
        {/* The two faces turn together. Only cards that can be picked flip. */}
        <div
          className={`relative size-full transform-3d transition-transform duration-500 ease-in-out motion-reduce:duration-0 ${
            side === 'description' ? 'rotate-y-180' : canPick ? 'group-hover:rotate-y-180 group-focus-visible:rotate-y-180' : ''
          }`}
        >
          <Face id={id}>{PICTURE[id]}</Face>
          <Face id={id} back>
            <Description id={id} />
          </Face>
        </div>
        {/* "taken": the whole card darkened by a 25% navy layer. When a card is
            picked it first flips back to its picture (500ms), so the darkening
            waits 450ms before fading in. Freeing a card clears it right away. */}
        <div
          className={`pointer-events-none absolute inset-0 rounded-[16px] bg-ink-soft transition-opacity motion-reduce:delay-0 motion-reduce:duration-0 ${
            taken ? 'opacity-25 delay-450 duration-200' : 'opacity-0 duration-150'
          }`}
        />
      </button>

      {/* Figma: 12.5px from the card's right edge, 18.8px from its bottom.
          The `key` makes a new badge (or one that moved here) play its
          appear animation, which also waits for the flip.
          While the card can be picked and is flipped to its text, the badge
          fades out so it doesn't cover the words. */}
      {badge && (
        <PlayerBadge
          key={badge}
          player={badge}
          onClick={onBadgeClick}
          className={`absolute right-[12.5px] bottom-[18.8px] animate-badge-in motion-reduce:animate-none ${
            canPick ? 'transition-opacity group-hover/card:opacity-0 group-has-focus-visible/card:opacity-0' : ''
          }`}
        />
      )}
    </div>
  )
}
