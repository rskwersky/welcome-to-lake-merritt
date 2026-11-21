import { useState } from 'react'
import { Button } from '../components/Button'
import { Postcard } from '../components/Postcard'
import { Stage } from '../components/Stage'

// Figma screens "02 landing" → "03 did you know".
// They're one component because 03 is just 02 after the postcard flips:
// hover the postcard and it lifts; click it and it turns over to the
// "did you know" fact, then "learn more" fades in underneath.

type LandingProps = {
  onLearnMore: () => void
}

export function Landing({ onLearnMore }: LandingProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <Stage className="bg-sky">
      {/* Figma: the card sits 334px from the top, the button 29px below it */}
      <div className="absolute inset-x-0 top-[334px] flex flex-col items-center gap-[29px]">
        <Postcard flipped={flipped} onClick={flipped ? undefined : () => setFlipped(true)} />

        {/* The button is in the layout from the start (just invisible),
            so the postcard doesn't jump when it fades in after the flip. */}
        <div
          className={`transition-opacity delay-500 duration-500 motion-reduce:delay-0 ${
            flipped ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={!flipped}
        >
          <Button onClick={onLearnMore} tabIndex={flipped ? 0 : -1}>
            learn more
          </Button>
        </div>
      </div>
    </Stage>
  )
}
