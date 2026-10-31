import { Button } from '../components/Button'
import { Postcard } from '../components/Postcard'
import { Stage } from '../components/Stage'

// Figma screen 04: pick the long or short version of the history.

type ChooseLengthProps = {
  onLong: () => void
  onShort: () => void
}

export function ChooseLength({ onLong, onShort }: ChooseLengthProps) {
  return (
    <Stage className="bg-sky">
      <div className="absolute inset-x-0 top-[334px] flex flex-col items-center gap-[29px]">
        <Postcard flipped />
        <div className="flex gap-[26px]">
          <Button width="hug" onClick={onLong}>
            long story
          </Button>
          <Button width="hug" onClick={onShort}>
            long story short
          </Button>
        </div>
      </div>
    </Stage>
  )
}
