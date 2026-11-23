import { useState, type ReactNode } from 'react'
import type { Cost } from '../../data/events'
import { TOKEN_ORDER, type TokenType } from '../../data/gameRules'
import { checkAllocation, costOf, hasCityBank, noTokens, remaining, type Allocation, type Holder, type InputState, type Player, type Spent } from '../../game/state'
import { CharacterToken } from '../CharacterToken'
import { SmallButton } from '../SmallButton'
import { TokenIcon } from '../TokenIcon'
import { Sheet } from './Sheet'

// Paying for the chosen option on a phone (Figma M3). Same rules as the
// desktop popup (AllocateTokensPopup.tsx), but instead of typing numbers,
// each box has − and + buttons: no keyboard popping up over the screen.
//
//   • The pill at the top shows the cost; each token dims as it's covered.
//   • A row per player, a column per token type: [−] given/has [+]
//       green = they've used every token of that type
//   • Types the cost doesn't need fade out.
//   • With fewer than 6 players the city bank comes last. A type's city
//     box stays locked until every player has used up their own tokens of
//     that type (docs/game-rules.md).
//   • + stops at what the holder has and at what the cost still needs, so
//     nobody can give too much by accident.

type AllocateSheetProps = {
  /** A tutorial tip at the top of the sheet */
  note?: ReactNode
  cost: Cost
  players: Player[]
  spent: Spent
  onContinue: (allocation: Allocation) => void
}

const BOX: Record<InputState, string> = {
  default: 'bg-cream',
  complete: 'bg-done',
  error: 'bg-error',
  locked: 'bg-cream',
  unneeded: 'bg-cream',
}

// The token columns: shared by the header icons and every row, so they line up
const COLUMNS = 'grid grid-cols-[52px_repeat(3,1fr)] items-center gap-x-[4px]'

/** A round − or + button. The visible circle is 24px; the tap area is bigger. */
function StepButton({ sign, label, disabled, onClick }: { sign: '−' | '+'; label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="relative flex size-[24px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink-soft bg-cream font-mono text-[18px] leading-none text-ink-soft transition-colors duration-150 before:absolute before:-inset-[8px] enabled:hover:bg-peach enabled:active:bg-peach focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-default disabled:opacity-30 motion-reduce:transition-none"
    >
      <span aria-hidden="true">{sign}</span>
    </button>
  )
}

export function AllocateSheet({ cost, players, spent, onContinue, note }: AllocateSheetProps) {
  const [allocation, setAllocation] = useState<Allocation>({})
  const check = checkAllocation(cost, allocation, players, spent)
  const given = (h: Holder, t: TokenType) => allocation[h]?.[t] ?? 0

  const change = (h: Holder, t: TokenType, by: number) =>
    setAllocation((prev) => ({ ...prev, [h]: { ...(prev[h] ?? noTokens()), [t]: Math.max(0, given(h, t) + by) } }))

  // The cost pill: every token of the cost, in order; covered ones dim.
  const costTokens = TOKEN_ORDER.flatMap((t) => Array.from({ length: costOf(cost, t) }, (_, i) => ({ type: t, covered: i < check.total[t] })))

  /** One holder's three steppers */
  const steppers = (h: Holder, name: string) => {
    const have = remaining(h, players, spent)
    return TOKEN_ORDER.map((t) => {
      const state = check.input(h, t)
      const off = state === 'locked' || state === 'unneeded'
      const g = given(h, t)
      const full = g >= have[t] || check.total[t] >= costOf(cost, t)
      return (
        <div key={t} className={`flex items-center justify-center gap-[3px] transition-opacity duration-200 motion-reduce:transition-none ${off && g === 0 ? 'opacity-30' : ''}`}>
          {/* − stays usable on a locked box that still holds tokens, so they can be taken back */}
          <StepButton sign="−" label={`${name}: one less ${t}`} disabled={g === 0} onClick={() => change(h, t, -1)} />
          <output
            aria-label={`${name}: giving ${g} of ${have[t]} ${t}`}
            className={`flex h-[24px] min-w-[32px] items-center justify-center rounded-[2px] border border-ink-soft px-[3px] font-mono text-[12px] leading-none whitespace-nowrap text-ink-soft ${BOX[state]}`}
          >
            {g}/{have[t]}
          </output>
          <StepButton sign="+" label={`${name}: one more ${t}`} disabled={off || full} onClick={() => change(h, t, 1)} />
        </div>
      )
    })
  }

  /** The three token icons above the columns; faded when the cost doesn't use that type */
  const header = (
    <div className={COLUMNS} aria-hidden="true">
      <span />
      {TOKEN_ORDER.map((t) => (
        <span key={t} className="flex justify-center">
          <TokenIcon type={t} size={22} spent={costOf(cost, t) === 0} />
        </span>
      ))}
    </div>
  )

  return (
    <Sheet
      note={note}
      label="Allocate tokens"
      footer={
        <SmallButton width={121} disabled={!check.ready} onClick={() => onContinue(allocation)}>
          continue
        </SmallButton>
      }
    >
      <div
        className="mx-auto flex h-[50px] w-fit items-center gap-[1px] rounded-full border border-ink-soft bg-sky-blue px-[16px]"
        aria-label={`Cost: ${TOKEN_ORDER.filter((t) => cost[t]).map((t) => `${cost[t]} ${t}`).join(', ')}`}
      >
        {costTokens.map((tok, i) => (
          <TokenIcon key={i} type={tok.type} size={30} spent={tok.covered} className="drop-shadow-[0px_3px_3px_rgba(0,0,0,0.25)]" />
        ))}
      </div>

      <div className="mt-[20px]">{header}</div>
      <div className="mt-[10px] flex flex-col gap-[22px]">
        {players.map((p) => (
          <div key={p.number} className={COLUMNS}>
            <span className="relative size-[52px]">
              <CharacterToken id={p.character} className="origin-top-left scale-[1.04]" />
              <span className="absolute -bottom-[4px] -left-[6px] flex h-[19px] w-[21px] items-center justify-center rounded-[5px] border border-ink bg-cream font-mono text-[12px] leading-none text-ink-soft italic">
                P{p.number}
              </span>
            </span>
            {steppers(p.character, `Player ${p.number}`)}
          </div>
        ))}
      </div>

      {hasCityBank(players) && (
        <div className="mt-[22px] border-t border-ink-soft/25 pt-[16px]">
          <p className="font-mono text-[18px] leading-none text-ink italic">city bank</p>
          <p className="mt-[6px] font-mono text-[12px] leading-[1.25] text-ink-soft">Unlocks a token type once every player has used up their own tokens of that type.</p>
          <div className="mt-[14px]">{header}</div>
          <div className={`mt-[10px] ${COLUMNS}`}>
            <span />
            {steppers('city', 'City bank')}
          </div>
        </div>
      )}
    </Sheet>
  )
}
