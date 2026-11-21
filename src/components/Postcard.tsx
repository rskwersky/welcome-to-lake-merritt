// The "game-card" from Figma, as a 3D flip card.
// Front = "greetings from Lake Merritt", back = "did you know..." fact.
//
// How the flip works (pure CSS, no animation library):
//  1. The wrapper gets `perspective` so rotations look 3D.
//  2. The inner box holds both faces and rotates 180° on the Y axis when flipped.
//  3. Each face hides its back side (`backface-hidden`), and the back face starts
//     pre-rotated 180°, so only one face is ever visible.

type PostcardProps = {
  flipped: boolean
  onClick?: () => void
}

// The card's size in Figma. The exported images are a little bigger
// (583×364) because they include the drop shadow, which spills 4px to the
// left and right and 8px below. We let the image hang over the edges so that
// the layout around the card uses the card's real size, like Figma does.
export const POSTCARD_WIDTH = 574.638
export const POSTCARD_HEIGHT = 356

export function Postcard({ flipped, onClick }: PostcardProps) {
  const face = 'absolute -left-1 top-0 h-[364px] w-[583px] max-w-none backface-hidden'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={flipped ? 'Did you know: Lake Merritt in Oakland, California is the oldest wildlife refuge in North America?' : 'Greetings from Lake Merritt. Flip the postcard'}
      // Hover (only while it can still be clicked): it rises 12px, grows 3%,
      // tilts a hair, and its shadow spreads out below, like a card picked up
      // off the table. This is the first thing people click, so the cue is
      // stronger than the small lift on the other objects.
      // drop-shadow follows the card's rounded shape, unlike box-shadow.
      // With reduced motion, only the shadow changes (no movement).
      className="perspective-[1600px] block shrink-0 cursor-pointer rounded-[10px] transition-[translate,scale,rotate,filter] duration-300 ease-out focus-visible:outline-3 focus-visible:outline-offset-8 focus-visible:outline-ink enabled:hover:-translate-y-3 enabled:hover:scale-[1.03] enabled:hover:-rotate-1 enabled:hover:drop-shadow-[-4px_18px_16px_rgba(0,0,0,0.28)] disabled:cursor-default motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0 motion-reduce:enabled:hover:scale-100 motion-reduce:enabled:hover:rotate-0"
      style={{ width: POSTCARD_WIDTH, height: POSTCARD_HEIGHT }}
    >
      <div
        className={`relative size-full transform-3d transition-transform duration-700 ease-in-out motion-reduce:duration-0 ${
          flipped ? 'rotate-y-180' : ''
        }`}
      >
        <img src="/assets/postcard/front.svg" alt="" className={face} draggable={false} />
        <img src="/assets/postcard/back.svg" alt="" className={`${face} rotate-y-180`} draggable={false} />
      </div>
    </button>
  )
}
