import { Button } from '../components/Button'
import { Stage } from '../components/Stage'

// Temporary stand-in for screens that aren't built yet, so the intro has
// somewhere to go. Replace it as each section is built (next: "2 · setup").

type NotBuiltYetProps = {
  screenName: string
  onRestart: () => void
}

export function NotBuiltYet({ screenName, onRestart }: NotBuiltYetProps) {
  return (
    <Stage className="bg-sky">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-ink">
        <p className="font-script text-[64px]">coming soon</p>
        <p className="font-mono text-2xl italic">next screen: {screenName}</p>
        <Button width="hug" onClick={onRestart}>
          back to start
        </Button>
      </div>
    </Stage>
  )
}
