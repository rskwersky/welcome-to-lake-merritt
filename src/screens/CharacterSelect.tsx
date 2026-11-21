import { useEffect, useState } from 'react'
import { CharacterCard } from '../components/CharacterCard'
import { SmallButton } from '../components/SmallButton'
import { Stage } from '../components/Stage'
import { characters } from '../data/characters'
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
