import { getCharacter } from '../../data/characters'
import { TOKEN_ORDER, type CharacterId } from '../../data/gameRules'
import type { Cost, GameEvent } from '../../data/events'
import type { Player } from '../../game/state'
import { CharacterToken } from '../CharacterToken'
import { SmallButton } from '../SmallButton'
import { TokenIcon } from '../TokenIcon'

// Figma's `event-card-popup` (tutorial steps 2–3, and every round of the game).
// The event card, big: title, a quote from someone it affects, scenario,
// and three options as blue bars. Each option shows what it costs as little
// tokens after its text, and who backs it.
// Click an option: it turns gold. "continue" stays greyed out until one is.
// An option the group can't pay for (not enough tokens left this cycle) is
// greyed out and can't be picked, so nobody gets stuck paying for it.
// The card grows out of the deck when it first appears ("draw-card" animation).
//
// The pieces stack top to bottom (title, quote, scenario, options), so a long
// scenario pushes the options down instead of running into them. Spacing
// follows Figma: 629.5px wide, options 587.8 × 63.2 and 8.7px apart.

type EventCardPopupProps = {
  event: GameEvent
  selected: number | null
  onSelect: (option: number) => void
  onContinue: () => void
  /** Whether the group has enough tokens for a cost (default: yes) */
  canAfford?: (cost: Cost) => boolean
  /** Who's playing: each option shows which of their characters back it */
  players?: Player[]
}

/**
 * The characters in this game who back an option: their round tokens at the
 * right of the option, so players know who should argue for it. Characters
 * nobody plays are left out (no one at the table speaks for them).
 * `row`: "backed by" beside the tokens instead of above them (phone).
 */
export function Backers({ ids, players, row = false }: { ids: CharacterId[]; players: Player[]; row?: boolean }) {
  const backers = players.filter((p) => ids.includes(p.character))
  if (backers.length === 0) return null
  const names = backers.map((p) => `Player ${p.number} (${getCharacter(p.character).name})`).join(' and ')
  return (
    <span className={`flex shrink-0 items-center ${row ? 'gap-[8px]' : 'flex-col gap-[3px]'}`} aria-label={`Backed by ${names}`} title={`Backed by ${names}`}>
      <span className="font-mono text-[11px] leading-none whitespace-nowrap text-ink-soft not-italic">backed by</span>
      <span className="flex gap-[3px]">
        {backers.map((p) => (
          <span key={p.number} className="relative size-[32px]">
            <CharacterToken id={p.character} className="origin-top-left scale-[0.64]" />
          </span>
        ))}
      </span>
    </span>
  )
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

export function EventCardPopup({ event, selected, onSelect, onContinue, canAfford = () => true, players = [] }: EventCardPopupProps) {
  return (
    <div className="flex flex-col items-center gap-[22px]">
      <div
        role="dialog"
        aria-labelledby="event-title"
        className="flex w-[629.53px] animate-draw-card flex-col items-center rounded-[7px] border border-ink-soft bg-cream px-[21.17px] pt-[24px] pb-[21px] motion-reduce:animate-none"
      >
        <h2 id="event-title" className="text-center font-script text-[56.43px] leading-[1.1] text-ink-soft">
          {event.title}
        </h2>
        {/* A voice from the lake: someone this event affects, like an epigraph */}
        <figure className="mt-[2px] w-full px-[24px] text-center font-mono text-ink-soft">
          <blockquote className="text-[17px] leading-[1.25] italic">“{event.voice.quote}”</blockquote>
          <figcaption className="mt-[3px] text-[13px] leading-none">{event.voice.speaker}</figcaption>
        </figure>
        <p className="mt-[12px] w-full px-[8px] font-mono text-[18.81px] leading-[21.6px] text-ink">
          {event.scenario} Do you:
        </p>

        <div role="radiogroup" aria-label="Options" className="mt-[14px] flex w-full flex-col gap-[8.68px]">
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
                className={`flex min-h-[63.22px] w-full cursor-pointer items-center gap-[10px] rounded-[5px] border border-ink-soft px-[8px] py-[7.6px] text-left font-mono text-[18.81px] leading-[21.1px] text-ink-soft transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none ${
                  selected === i ? 'bg-peach' : 'bg-sky-blue enabled:hover:bg-[color-mix(in_srgb,var(--color-sky-blue),white_25%)]'
                }`}
              >
                <span className="min-w-0 flex-1">
                  {option.text}.
                  <CostTokens cost={option.cost} />
                  {!affordable && <span className="ml-[10px] text-[15px] italic">(not enough tokens left)</span>}
                </span>
                <Backers ids={option.pushedBy} players={players} />
              </button>
            )
          })}
        </div>
      </div>
      <SmallButton width={121} disabled={selected === null} onClick={onContinue}>
        continue
      </SmallButton>
    </div>
  )
}
