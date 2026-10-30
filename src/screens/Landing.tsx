import { useState } from 'react'
import { Button } from '../components/Button'
import { Postcard } from '../components/Postcard'
import { Stage } from '../components/Stage'

// Figma screens 01 → 02 → 03.
// Clicking the postcard flips it to the "did you know" fact,
// then "learn more" and "play game" fade in underneath.

type LandingProps = {
  onLearnMore: () => void
  onPlay: () => void
}

export function Landing({ onLearnMore, onPlay }: LandingProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <Stage className="bg-sky">
      <div className="absolute inset-x-0 top-[290px] flex flex-col items-center gap-[29px]">
        <Postcard flipped={flipped} onClick={flipped ? undefined : () => setFlipped(true)} />

        {/* Hint before the flip; buttons after. Both stay in the layout
            (just hidden) so the postcard doesn't jump when they swap. */}
        <div className="relative h-[61px] w-[515px]">
          <p
            className={`absolute inset-0 flex items-center justify-center font-mono text-2xl italic text-ink/70 transition-opacity duration-300 ${
              flipped ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
          >
            click the postcard to flip it
          </p>
          <div
            className={`absolute inset-0 flex justify-between transition-opacity delay-500 duration-500 motion-reduce:delay-0 ${
              flipped ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-hidden={!flipped}
          >
            <Button onClick={onLearnMore} tabIndex={flipped ? 0 : -1}>
              learn more
            </Button>
            <Button onClick={onPlay} tabIndex={flipped ? 0 : -1}>
              play game
            </Button>
          </div>
        </div>
      </div>
    </Stage>
  )
}
