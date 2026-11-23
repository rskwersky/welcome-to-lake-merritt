import { useEffect, useState } from 'react'
import { DimOverlay } from '../components/board/GameBoard'
import { PlayerBadge } from '../components/PlayerBadge'
import { CharacterCard } from '../components/CharacterCard'
import { SmallButton } from '../components/SmallButton'
import { PhoneStage } from '../components/phone/PhoneStage'
import { Stage } from '../components/Stage'
import { usePhoneLayout } from '../hooks/usePhoneLayout'
import { characters, getCharacter } from '../data/characters'
import type { CharacterId } from '../data/gameRules'

// Figma screens "07 character select / …".
// The players take turns: "Player 1, choose your character:", then Player 2,
// and so on, once per player (the count from the player count screen).
//  • Hover (or tab to) a card: it flips over to show who they are.
//  • Click a card: it's that player's. It flips back, then darkens and gets
//    their badge, and the next player chooses.
//  • When everyone has picked, "continue" appears. A player can change their
//    mind by clicking their badge. Then *every* card can be picked:
//      – a free card: they move to it, and their old card is free again;
//      – another player's card: the two swap, so the "ousted" player gets
//        the card the re-chooser left;
//      – their own card: nothing changes.
//    Esc (or picking) ends the re-choose.
//
// The state is a list with one slot per player: picks[0] is Player 1's
// character (or null if they haven't picked), plus which player is
// re-choosing, if any. Everything on screen is worked out from those two, so
// the cards, badges and heading can't disagree.

type CharacterSelectProps = {
  playerCount: number
  /** For "restart game": last game's characters come back already picked */
  initialPicks?: CharacterId[]
  onContinue: (picks: CharacterId[]) => void
}

export function CharacterSelect({ playerCount, initialPicks, onContinue }: CharacterSelectProps) {
  const [picks, setPicks] = useState<(CharacterId | null)[]>(() =>
    Array.from({ length: playerCount }, (_, i) => initialPicks?.[i] ?? null),
  )
  // The player (0-based) choosing again after clicking their badge, or null.
  const [rechooser, setRechooser] = useState<number | null>(null)

  // Whose turn it is: the re-chooser, or else the first player without a
  // character. -1 = everyone has one and nobody is re-choosing.
  const chooser = rechooser ?? picks.indexOf(null)
  const allPicked = chooser === -1
  const phone = usePhoneLayout()

  const pick = (id: CharacterId) => {
    if (rechooser === null) {
      setPicks((prev) => prev.map((p, i) => (i === chooser ? id : p)))
      return
    }
    // Re-choosing: whoever had `id` (if anyone) takes the re-chooser's old card.
    setPicks((prev) => {
      const old = prev[rechooser]
      const ousted = prev.indexOf(id)
      return prev.map((p, i) => (i === rechooser ? id : i === ousted ? old : p))
    })
    setRechooser(null)
  }

  // Esc cancels a re-choose (everyone keeps their card).
  useEffect(() => {
    if (rechooser === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRechooser(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rechooser])

  if (phone) {
    return (
      <CharacterSelectPhone
        picks={picks}
        chooser={chooser}
        rechooser={rechooser}
        onPick={pick}
        onRechoose={setRechooser}
        onContinue={() => onContinue(picks as CharacterId[])}
      />
    )
  }

  return (
    <Stage className="bg-cream">
      {/* The heading names whose turn it is. aria-live reads the change aloud. */}
      <p aria-live="polite" className="absolute top-[42.88px] left-[44.84px] w-[490.908px] font-mono text-[24px] text-black italic">
        {allPicked ? '' : `Player ${chooser + 1}, choose your character:`}
      </p>

      {/* Figma: 3 × 2 grid, 50px apart across, 42px down, centered. The columns
          are a fixed 284px (the card width): an absolutely placed grid would
          otherwise squeeze them to fit the space to the right of center. */}
      <div className="absolute top-1/2 left-1/2 grid -translate-1/2 grid-cols-[repeat(3,284px)] gap-x-[50px] gap-y-[42px]">
        {characters.map(({ id }) => {
          const owner = picks.indexOf(id) // -1 = nobody has it
          const owned = owner !== -1
          return (
            <CharacterCard
              key={id}
              id={id}
              badge={owned ? owner + 1 : undefined}
              // While someone re-chooses, every card is available (and bright).
              taken={owned && rechooser === null}
              onPick={allPicked ? undefined : () => pick(id)}
              onBadgeClick={allPicked ? () => setRechooser(owner) : undefined}
            />
          )
        })}
      </div>

      {allPicked && (
        <div className="absolute inset-x-0 top-[944px] flex justify-center">
          <SmallButton width={121} onClick={() => onContinue(picks as CharacterId[])}>
            continue
          </SmallButton>
        </div>
      )}
    </Stage>
  )
}

// ---------------------------------------------------------------------------
// The phone version (Figma "6b · mobile hi-fi", M6)
//
// Phones have no hover, so cards don't flip by themselves. Instead:
//   tap a card → its description opens in the middle, over the dimmed grid,
//                with "select" underneath (or who has it, if it's taken);
//   select     → it's yours, and the next player chooses.
// Cards are 2 across. Taken cards are darkened, with the player's badge;
// once everyone has picked, tap a badge to let that player choose again.
// continue stays greyed out until everyone has a character.

// Figma M6: cards 164 × 211 (58% of 284 × 365), the open card 244 × 314 (86%)
const SMALL = 164 / 284
const OPEN = 244 / 284

type CharacterSelectPhoneProps = {
  picks: (CharacterId | null)[]
  /** The player choosing (0-based), or -1 once everyone has a character */
  chooser: number
  rechooser: number | null
  onPick: (id: CharacterId) => void
  onRechoose: (player: number) => void
  onContinue: () => void
}

function CharacterSelectPhone({ picks, chooser, rechooser, onPick, onRechoose, onContinue }: CharacterSelectPhoneProps) {
  // The card opened to read (tap a card), or null
  const [open, setOpen] = useState<CharacterId | null>(null)
  const allPicked = chooser === -1

  // Esc closes the open card
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const openOwner = open ? picks.indexOf(open) : -1
  // Can the chooser take the open card? Free cards, or any card while someone re-chooses.
  const canSelect = !allPicked && (openOwner === -1 || rechooser !== null)

  return (
    <PhoneStage>
      <div className="absolute inset-0 overflow-x-hidden overflow-y-auto">
        <div className="flex min-h-full flex-col items-center px-[24px] pt-[58px] pb-[38px]">
          <p aria-live="polite" className="min-h-[18px] w-full font-mono text-[15px] leading-none text-black italic">
            {allPicked ? 'Everyone has a character.' : `Player ${chooser + 1}, choose your character:`}
          </p>

          <div className="mt-[16px] grid grid-cols-[repeat(2,164px)] gap-x-[14px] gap-y-[11px]">
            {characters.map(({ id, name }) => {
              const owner = picks.indexOf(id)
              const taken = owner !== -1 && rechooser === null
              return (
                <div key={id} className="relative h-[211px] w-[164px]">
                  {/* The card picture, shrunk (not itself clickable here) */}
                  <div className="pointer-events-none absolute top-0 left-0 origin-top-left" style={{ scale: SMALL }} aria-hidden="true">
                    <CharacterCard id={id} taken={taken} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(id)}
                    aria-label={`${name}${owner !== -1 ? `, Player ${owner + 1}’s` : ''}: read their card`}
                    className="absolute inset-0 cursor-pointer rounded-[10px] transition-[translate] duration-200 hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  />
                  {owner !== -1 && (
                    <PlayerBadge
                      key={owner}
                      player={owner + 1}
                      size="small"
                      onClick={allPicked ? () => onRechoose(owner) : undefined}
                      className="absolute right-[8px] bottom-[10px] animate-badge-in motion-reduce:animate-none"
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className="min-h-[20px] flex-1" />
          <SmallButton width={121} disabled={!allPicked} onClick={onContinue}>
            continue
          </SmallButton>
        </div>
      </div>

      {/* The open card, over the dimmed grid. Tap outside (or Esc) to close. */}
      {open && (
        <>
          <DimOverlay />
          <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute inset-0 z-20 cursor-default" />
          <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-[18px]">
            <div className="animate-pop-in motion-reduce:animate-none" style={{ width: 284 * OPEN, height: 365 * OPEN }}>
              <div className="origin-top-left" style={{ scale: OPEN }}>
                <CharacterCard id={open} side="description" />
              </div>
            </div>
            <div className="pointer-events-auto">
              {canSelect ? (
                <SmallButton
                  width={121}
                  // In the character's own color (an inline style wins over the button's cream)
                  style={{ backgroundColor: `var(--color-${open})` }}
                  onClick={() => {
                    onPick(open)
                    setOpen(null)
                  }}
                >
                  select
                </SmallButton>
              ) : (
                <p className="rounded-[7px] border border-ink-soft bg-cream px-[12px] py-[8px] font-mono text-[15px] text-ink-soft italic">
                  {openOwner !== -1 ? `Player ${openOwner + 1} has ${getCharacter(open).name}` : 'Everyone has a character'}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </PhoneStage>
  )
}
