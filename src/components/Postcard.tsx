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

export const POSTCARD_WIDTH = 583
export const POSTCARD_HEIGHT = 364

export function Postcard({ flipped, onClick }: PostcardProps) {
  const face = 'absolute inset-0 backface-hidden'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={flipped ? 'Did you know: Lake Merritt is the oldest wildlife refuge in North America' : 'Greetings from Lake Merritt. Flip the postcard'}
      className="perspective-[1600px] block cursor-pointer rounded-2xl focus-visible:outline-3 focus-visible:outline-offset-8 focus-visible:outline-ink disabled:cursor-default"
      style={{ width: POSTCARD_WIDTH, height: POSTCARD_HEIGHT }}
    >
      <div
        className={`relative size-full transform-3d transition-transform duration-700 ease-in-out motion-reduce:duration-0 ${
          flipped ? 'rotate-y-180' : ''
        }`}
      >
        <img src="/assets/postcard/front.png" alt="" className={face} draggable={false} />
        <img src="/assets/postcard/back.png" alt="" className={`${face} rotate-y-180`} draggable={false} />
      </div>
    </button>
  )
}
