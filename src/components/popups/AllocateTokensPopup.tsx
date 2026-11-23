import { useState } from 'react'
import type { Cost } from '../../data/events'
import { TOKEN_ORDER, type TokenType } from '../../data/gameRules'
import { checkAllocation, costOf, hasCityBank, noTokens, remaining, type Allocation, type Holder, type InputState, type Player, type Spent } from '../../game/state'
import { CharacterToken } from '../CharacterToken'
import { PlayerBadge } from '../PlayerBadge'
import { SmallButton } from '../SmallButton'
import { TokenIcon } from '../TokenIcon'

// Figma's `allocate-tokens-popup` (tutorial steps 4–5, and every round).
// The group covers the chosen option's cost:
//  • The pill at the top shows the cost; each token dims as it's covered.
//  • Each player has a box per token type: "typed / have".
//      red   = more than they have, or more than the cost needs (blocks continue)
//      green = they've used every token of that type
//  • With fewer than 6 players there's a city bank row. A type's city box
//    stays locked until every player has used up their own tokens of that
//    type (docs/game-rules.md, "the city bank").
//  • Token types the cost doesn't need are greyed out (no boxes to fill).
//  • "continue" unlocks when every type is covered exactly.

type AllocateTokensPopupProps = {
  cost: Cost
  players: Player[]
  spent: Spent
  onContinue: (allocation: Allocation) => void
}

const BOX_STYLE: Record<InputState, string> = {
  default: 'bg-cream',
  complete: 'bg-done',
  error: 'bg-error',
  locked: 'bg-cream opacity-50',
  // The cost doesn't use this type: greyed out so nobody types there
  unneeded: 'bg-cream opacity-30',
}

/** One "typed / have" box: an input for the number, then "/have". */
function TokenBox({ value, have, state, label, onChange }: { value: number; have: number; state: InputState; label: string; onChange: (n: number) => void }) {
  return (
    <label
      // At least Figma's 34.79px, wider when a number has two digits (the city bank can hold 11).
      className={`relative flex h-[18.17px] min-w-[34.79px] items-center rounded-[2px] border border-ink-soft px-[5px] font-mono text-[12px] leading-none whitespace-nowrap text-ink-soft ${BOX_STYLE[state]}`}
    >
      {/* The flash: a cream layer that blinks over the red a couple of times.
          It only exists while the box is red, so it plays each time the box
          turns red. (The input itself stays put, so typing isn't interrupted.) */}
      {state === 'error' && <span aria-hidden="true" className="absolute inset-0 animate-flash rounded-[1px] bg-cream opacity-0 motion-reduce:animate-none" />}
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        aria-invalid={state === 'error'}
        disabled={state === 'locked' || state === 'unneeded'}
        value={value === 0 ? '' : String(value)}
        placeholder="0"
        maxLength={2}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
        onFocus={(e) => e.target.select()}
        // As wide as what's typed (1 or 2 digits)
        style={{ width: `${Math.max(1, String(value || '').length)}ch` }}
        className="relative bg-transparent text-right outline-none placeholder:text-ink-soft disabled:cursor-not-allowed"
      />
      <span aria-hidden="true" className="relative">/{have}</span>
    </label>
  )
}

/** The three token icons (social, economic, political) next to a column of boxes. */
function TokenColumn({ holder, name, players, spent, allocation, check, setGiven }: {
  holder: Holder
  name: string
  players: Player[]
  spent: Spent
  allocation: Allocation
  check: ReturnType<typeof checkAllocation>
  setGiven: (holder: Holder, type: TokenType, n: number) => void
}) {
  const have = remaining(holder, players, spent)
  return (
    <div className="flex gap-[6.95px]">
      <div className="flex flex-col gap-[3px] pt-[0.5px]">
        {TOKEN_ORDER.map((t) => (
          <TokenIcon key={t} type={t} spent={check.input(holder, t) === 'locked' || check.input(holder, t) === 'unneeded'} />
        ))}
      </div>
      <div className="flex flex-col gap-[4.5px] pt-[1.5px]">
        {TOKEN_ORDER.map((t) => (
          <TokenBox
            key={t}
            value={allocation[holder]?.[t] ?? 0}
            have={have[t]}
            state={check.input(holder, t)}
            label={`${name}: ${t} tokens to give (has ${have[t]})`}
            onChange={(n) => setGiven(holder, t, n)}
          />
        ))}
      </div>
    </div>
  )
}

export function AllocateTokensPopup({ cost, players, spent, onContinue }: AllocateTokensPopupProps) {
  const [allocation, setAllocation] = useState<Allocation>({})
  const check = checkAllocation(cost, allocation, players, spent)

  const setGiven = (holder: Holder, type: TokenType, n: number) =>
    setAllocation((prev) => ({ ...prev, [holder]: { ...(prev[holder] ?? noTokens()), [type]: n } }))

  // The cost pill: every token of the cost, in order; covered ones dim.
  const costTokens = TOKEN_ORDER.flatMap((t) =>
    Array.from({ length: costOf(cost, t) }, (_, i) => ({ type: t, covered: i < check.total[t] })),
  )

  return (
    <div className="flex flex-col items-center gap-[22px]">
      {/* Figma's popup (446px wide) was too small to read on screen, so it's
          drawn 1.3× bigger. CSS `zoom` grows everything inside (tokens, boxes,
          text) and, unlike a transform, also the space it takes up. */}
      <div role="dialog" aria-label="Allocate tokens" style={{ zoom: 1.3 }} className="flex w-[446.04px] animate-pop-in flex-col items-center gap-[15px] rounded-[7px] border border-ink-soft bg-cream px-[25px] py-[28px] motion-reduce:animate-none">
        <div className="flex h-[50.48px] items-center gap-[2px] rounded-full border border-ink-soft bg-sky-blue px-[16.77px]" aria-label={`Cost: ${TOKEN_ORDER.filter((t) => cost[t]).map((t) => `${cost[t]} ${t}`).join(', ')}`}>
          {costTokens.map((tok, i) => (
            <TokenIcon key={i} type={tok.type} size={37} spent={tok.covered} className="drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]" />
          ))}
        </div>

        {/* 2 columns × up to 3 rows, one cell per player */}
        <div className="grid w-[397px] grid-cols-2 gap-x-[28px] gap-y-[38px]">
          {players.map((p) => (
            <div key={p.number} className="flex items-center justify-center gap-[10px]">
              <div className="relative">
                <div className="size-[75px]">
                  <CharacterToken id={p.character} className="origin-top-left scale-150" />
                </div>
                <PlayerBadge player={p.number} size="small" shadow={false} className="absolute -bottom-[8px] -left-[8px]" />
              </div>
              <TokenColumn holder={p.character} name={`Player ${p.number}`} players={players} spent={spent} allocation={allocation} check={check} setGiven={setGiven} />
            </div>
          ))}
        </div>

        {hasCityBank(players) && (
          <div className="flex w-full items-center gap-[16px] rounded-[7px] border border-ink-soft px-[16px] py-[10px]">
            <p className="w-[60px] text-center font-mono text-[24px] leading-[1.05] text-ink italic">city bank</p>
            <TokenColumn holder="city" name="City bank" players={players} spent={spent} allocation={allocation} check={check} setGiven={setGiven} />
            <p className="min-w-0 flex-1 font-mono text-[13px] leading-[1.2] text-ink-soft">
              Unlocks a token type once every player has used up their own tokens of that type.
            </p>
          </div>
        )}
      </div>
      <SmallButton width={121} disabled={!check.ready} onClick={() => onContinue(allocation)}>
        continue
      </SmallButton>
    </div>
  )
}
