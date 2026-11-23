import { useState } from 'react'
import { Button } from '../components/Button'
import { PhoneStage } from '../components/phone/PhoneStage'
import { Stage } from '../components/Stage'
import { usePhoneLayout } from '../hooks/usePhoneLayout'
import { MAX_PLAYERS, MIN_PLAYERS } from '../data/gameRules'

// Figma screens "06 player count / default" and "06 player count / selected".
// A postcard asking "How many players?" with six number buttons. Picking one
// turns it gold (Figma's `player-count-option`, state=selected), and
// "continue" fades in below. Character select then repeats once per player.
//
// `initialCount` is for "restart game": the last game's count comes back
// already selected (docs/game-rules.md, "New game").

const COUNTS = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i)

type PlayerCountProps = {
  initialCount?: number
  onContinue: (count: number) => void
}

export function PlayerCount({ initialCount, onContinue }: PlayerCountProps) {
  const [count, setCount] = useState<number | null>(initialCount ?? null)
  const phone = usePhoneLayout()
  if (phone) return <PlayerCountPhone count={count} setCount={setCount} onContinue={onContinue} />

  return (
    <Stage className="bg-sky">
      {/* Figma: the 649px-wide group starts 334px down; the card is centered in it. */}
      <div className="absolute top-[334px] left-[396px] flex w-[649px] flex-col items-center gap-[39px]">
        <div className="relative h-[356px] w-[574.638px] drop-shadow-[0_4px_2px_rgba(0,0,0,0.25)]">
          {/* The card picture is drawn upright (356 wide) in Figma and turned
              on its side, so we turn it 90° too, around its center. */}
          <img
            alt=""
            src="/assets/player-count-card.svg"
            width={356}
            height={574.638}
            className="absolute top-1/2 left-1/2 h-[574.638px] w-[356px] max-w-none -translate-1/2 rotate-90"
            draggable={false}
          />
          <h1 id="player-count-title" className="absolute top-[26px] left-[118px] font-script text-[48px] leading-script whitespace-nowrap text-ink">
            How many players?
          </h1>
          {/* 3 × 2 grid of 61px buttons, 12px apart across and 9px apart down */}
          <div
            role="group"
            aria-labelledby="player-count-title"
            className="absolute top-[143px] left-1/2 grid -translate-x-1/2 grid-cols-3 gap-x-[12px] gap-y-[9px]"
          >
            {COUNTS.map((n) => (
              <Button
                key={n}
                aria-pressed={count === n}
                aria-label={`${n} ${n === 1 ? 'player' : 'players'}`}
                width={61}
                colorClass={count === n ? 'bg-peach' : 'bg-cream'}
                onClick={() => setCount(n)}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        {/* Kept in the layout while hidden, so nothing jumps when it appears. */}
        <div
          className={`transition-opacity duration-300 motion-reduce:transition-none ${count ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          aria-hidden={!count}
        >
          <Button width={201} tabIndex={count ? 0 : -1} onClick={() => count && onContinue(count)}>
            continue
          </Button>
        </div>
      </div>
    </Stage>
  )
}

// ---------------------------------------------------------------------------
// The phone version: the postcard stands upright (its picture is portrait
// already; desktop turns it on its side), with bigger number buttons
// (72px, easy to tap) and continue underneath.

type PlayerCountPhoneProps = {
  count: number | null
  setCount: (n: number) => void
  onContinue: (count: number) => void
}

function PlayerCountPhone({ count, setCount, onContinue }: PlayerCountPhoneProps) {
  return (
    <PhoneStage className="bg-sky">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[32px] overflow-y-auto py-[24px]">
        <div className="relative h-[484px] w-[300px] shrink-0 drop-shadow-[0_4px_2px_rgba(0,0,0,0.25)]">
          <img alt="" src="/assets/player-count-card.svg" className="absolute inset-0 size-full" draggable={false} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[34px]">
            <h1 id="player-count-title" className="font-script text-[34px] leading-none whitespace-nowrap text-ink">
              How many players?
            </h1>
            <div role="group" aria-labelledby="player-count-title" className="grid grid-cols-3 gap-[14px]">
              {COUNTS.map((n) => (
                <Button
                  key={n}
                  aria-pressed={count === n}
                  aria-label={`${n} ${n === 1 ? 'player' : 'players'}`}
                  width={72}
                  className="h-[72px]!"
                  colorClass={count === n ? 'bg-peach' : 'bg-cream'}
                  onClick={() => setCount(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {/* Kept in the layout while hidden, so nothing jumps when it appears */}
        <div
          className={`shrink-0 transition-opacity duration-300 motion-reduce:transition-none ${count ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          aria-hidden={!count}
        >
          <Button width={201} tabIndex={count ? 0 : -1} onClick={() => count && onContinue(count)}>
            continue
          </Button>
        </div>
      </div>
    </PhoneStage>
  )
}
