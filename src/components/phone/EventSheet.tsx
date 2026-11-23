import type { ReactNode } from 'react'
import type { Cost, GameEvent } from '../../data/events'
import { TOKEN_ORDER } from '../../data/gameRules'
import type { Player } from '../../game/state'
import { Backers } from '../popups/EventCardPopup'
import { SmallButton } from '../SmallButton'
import { TokenIcon } from '../TokenIcon'
import { Sheet } from './Sheet'

// The event card on a phone (Figma M2): the same card as the desktop popup
// (title, a voice from the lake, scenario, three options), laid out for a
// 390px screen in a bottom sheet. Each option's cost and backers sit on
// their own line under its text, so the text gets the full width.
// Tap an option: it turns gold; continue unlocks.

type EventSheetProps = {
  /** A tutorial tip at the top of the sheet */
  note?: ReactNode
  event: GameEvent
  selected: number | null
  onSelect: (option: number) => void
  onContinue: () => void
  canAfford: (cost: Cost) => boolean
  players: Player[]
}

function describeCost(cost: Cost): string {
  const parts = TOKEN_ORDER.filter((t) => cost[t]).map((t) => `${cost[t]} ${t}`)
  return parts.length ? `costs ${parts.join(', ')}` : 'free'
}

function CostTokens({ cost }: { cost: Cost }) {
  const tokens = TOKEN_ORDER.flatMap((t) => Array.from({ length: cost[t] ?? 0 }, () => t))
  if (tokens.length === 0) return <span className="font-mono text-[11px] italic">no cost</span>
  return (
    <span className="flex flex-wrap gap-[2px]" aria-label={describeCost(cost)}>
      {tokens.map((t, i) => (
        <TokenIcon key={i} type={t} size={18} />
      ))}
    </span>
  )
}

export function EventSheet({ event, selected, onSelect, onContinue, canAfford, players, note }: EventSheetProps) {
  return (
    <Sheet
      note={note}
      labelledBy="event-title"
      footer={
        <SmallButton width={121} disabled={selected === null} onClick={onContinue}>
          continue
        </SmallButton>
      }
    >
      <h2 id="event-title" className="text-center font-script text-[40px] leading-none text-ink-soft">
        {event.title}
      </h2>
      <figure className="mt-[10px] px-[8px] text-center font-mono text-ink-soft">
        <blockquote className="text-[13px] leading-[1.25] italic">“{event.voice.quote}”</blockquote>
        <figcaption className="mt-[3px] text-[11px] leading-none">{event.voice.speaker}</figcaption>
      </figure>
      <p className="mt-[17px] font-mono text-[15px] leading-[1.15] text-ink">{event.scenario} Do you:</p>

      <div role="radiogroup" aria-label="Options" className="mt-[24px] flex flex-col gap-[18px]">
        {event.options.map((option, i) => {
          const affordable = canAfford(option.cost)
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected === i}
              disabled={!affordable}
              onClick={() => onSelect(i)}
              className={`flex w-full cursor-pointer flex-col gap-[8px] rounded-[5px] border border-ink-soft px-[12px] py-[10px] text-left font-mono text-[15px] leading-[1.15] text-ink-soft transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none ${
                selected === i ? 'bg-peach' : 'bg-sky-blue enabled:hover:bg-[color-mix(in_srgb,var(--color-sky-blue),white_25%)]'
              }`}
            >
              <span>
                {option.text}.{!affordable && <span className="ml-[6px] text-[13px] italic">(not enough tokens left)</span>}
              </span>
              <span className="flex min-h-[32px] items-center justify-between gap-[10px]">
                <CostTokens cost={option.cost} />
                <Backers ids={option.pushedBy} players={players} row />
              </span>
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
