import { TOKEN_ORDER } from '../../data/gameRules'
import type { Cost, GameEvent } from '../../data/events'
import { SmallButton } from '../SmallButton'
import { TokenIcon } from '../TokenIcon'

// Figma's `event-card-popup` (tutorial steps 2–3, and every round of the game).
// The event card, big: title, scenario, and three options as blue bars. Each
// option shows what it costs as little tokens after its text.
// Click an option: it turns gold. "continue" stays greyed out until one is.
// The card grows out of the deck when it first appears ("draw-card" animation).

type EventCardPopupProps = {
  event: GameEvent
  selected: number | null
  onSelect: (option: number) => void
  onContinue: () => void
}

function CostTokens({ cost }: { cost: Cost }) {
  // Shown in the game's token order: social, economic, political.
  const tokens = TOKEN_ORDER.flatMap((t) => Array.from({ length: cost[t] ?? 0 }, () => t))
  if (tokens.length === 0) return null
  return (
    <span className="ml-[10px] inline-flex translate-y-[3px] gap-[2px]" aria-label={describeCost(cost)}>
      {tokens.map((t, i) => (
        <TokenIcon key={i} type={t} />
      ))}
    </span>
  )
}

function describeCost(cost: Cost): string {
  const parts = TOKEN_ORDER.filter((t) => cost[t]).map((t) => `${cost[t]} ${t}`)
  return parts.length ? `costs ${parts.join(', ')}` : 'free'
}

export function EventCardPopup({ event, selected, onSelect, onContinue }: EventCardPopupProps) {
  return (
    <div className="flex flex-col items-center gap-[22px]">
      <div
        role="dialog"
        aria-labelledby="event-title"
        className="relative h-[389.2px] w-[629.53px] animate-draw-card rounded-[7px] border border-ink-soft bg-cream motion-reduce:animate-none"
      >
        <h2 id="event-title" className="absolute top-[28.8px] left-[85.7px] font-script text-[56.43px] leading-none text-ink-soft">
          {event.title}
        </h2>
        <p className="absolute top-[95px] left-[43.8px] w-[560px] font-mono text-[18.81px] leading-[21.6px] text-ink">
          {event.scenario} Do you:
        </p>

        {/* The three options, 8.7px apart, each 587.8 × 63.2 */}
        <div role="radiogroup" aria-label="Options" className="absolute top-[152.8px] left-[21.17px] flex flex-col gap-[8.68px]">
          {event.options.map((option, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected === i}
              onClick={() => onSelect(i)}
              className={`h-[63.22px] w-[587.78px] cursor-pointer rounded-[5px] border border-ink-soft px-[8px] pt-[7.6px] text-left align-top font-mono text-[18.81px] leading-[21.1px] text-ink-soft transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none ${
                selected === i ? 'bg-peach' : 'bg-sky-blue hover:bg-[color-mix(in_srgb,var(--color-sky-blue),white_25%)]'
              }`}
            >
              <span className="block h-full">
                {option.text}.
                <CostTokens cost={option.cost} />
              </span>
            </button>
          ))}
        </div>
      </div>
      <SmallButton width={121} disabled={selected === null} onClick={onContinue}>
        continue
      </SmallButton>
    </div>
  )
}
