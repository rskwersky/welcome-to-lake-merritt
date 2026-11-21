import type { CharacterId } from '../../data/gameRules'
import { characters } from '../../data/characters'
import { MiniCharacterCard } from '../CardFrame'

// Figma's `player-card` (explore mode, right side): a small card for each of
// the six characters with its stats, 2 across. All six are always there,
// even ones nobody is playing, so players can read about every character.
// Hover lifts a card; click opens that character's big card. While one is
// open, the others are dimmed.
//
// The card itself is MiniCharacterCard (CardFrame.tsx), the same drawing as
// the big cards, so all six match.

type PlayerCardsProps = {
  open: CharacterId | null
  onOpen: (id: CharacterId) => void
}

export function PlayerCards({ open, onOpen }: PlayerCardsProps) {
  return (
    <div className="absolute z-20 grid grid-cols-[repeat(2,107.61px)] gap-x-[31px] gap-y-[20px]" style={{ left: 1112.86, top: 89 }}>
      {characters.map(({ id: character, name }) => {
        const dimmed = open !== null && open !== character
        return (
          <button
            key={character}
            type="button"
            onClick={() => onOpen(character)}
            aria-label={`Open ${name}’s card`}
            aria-pressed={open === character}
            className="relative h-[138.49px] w-[107.61px] cursor-pointer rounded-[6px] shadow-[-4px_4px_2px_0px_rgba(0,0,0,0.25)] transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-1.5 hover:shadow-[-4px_10px_8px_0px_rgba(0,0,0,0.22)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <MiniCharacterCard id={character} />
            {dimmed && <span className="absolute inset-0 rounded-[6px] bg-ink-soft opacity-50" />}
          </button>
        )
      })}
    </div>
  )
}
