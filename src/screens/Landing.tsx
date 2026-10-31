import { useState } from 'react'
import { Button } from '../components/Button'
import { Postcard } from '../components/Postcard'
import { Stage } from '../components/Stage'

// Figma screens 01 → 03.
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
      {/* Figma: the card sits 334px from the top, buttons 29px below it */}
      <div className="absolute inset-x-0 top-[334px] flex flex-col items-center gap-[29px]">
        <Postcard flipped={flipped} onClick={flipped ? undefined : () => setFlipped(true)} />

        {/* The buttons are in the layout from the start (just invisible),
            so the postcard doesn't jump when they fade in after the flip. */}
        <div
          className={`flex w-[515px] justify-between transition-opacity delay-500 duration-500 motion-reduce:delay-0 ${
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
    </Stage>
  )
}
