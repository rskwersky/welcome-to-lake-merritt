import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { CharacterCard } from '../components/CharacterCard'
import { CharacterIcon, type IconState } from '../components/CharacterIcon'
import { Stage } from '../components/Stage'
import { characters, getCharacter, type CharacterId } from '../data/characters'

// Figma screen "06 character select". Behavior (from the Figma annotation):
//  • Click an icon → it lifts with a glow, the other five dim, its card appears.
//  • Click anywhere outside the card → deselect (everything back to default).
//  • Click a different icon while one is selected → switch to that character.
//  • "select" under the card → confirm and move on.
//  • (Added) Esc key also deselects.

type CharacterSelectProps = {
  onConfirm: (id: CharacterId) => void
}

export function CharacterSelect({ onConfirm }: CharacterSelectProps) {
  const [selectedId, setSelectedId] = useState<CharacterId | null>(null)
  const selected = selectedId ? getCharacter(selectedId) : null

  // Esc to deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const iconState = (id: CharacterId): IconState => {
    if (!selectedId) return 'default'
    return id === selectedId ? 'active' : 'dimmed'
  }

  const topRow = characters.slice(0, 3)
  const bottomRow = characters.slice(3)

  return (
    <Stage className="bg-paper" onBackgroundClick={() => setSelectedId(null)}>
      <h1 className="absolute inset-x-0 top-[94px] text-center font-mono text-[40px] italic text-black">
        choose your character
      </h1>

      {/* Icon grid: 841px wide, centered, two rows (spacing from Figma) */}
      <div className="absolute top-1/2 left-1/2 flex w-[841px] -translate-x-1/2 -translate-y-1/2 flex-col gap-[35px]">
        <div className="flex items-center gap-[89px]">
          {topRow.map((c) => (
            <CharacterIcon
              key={c.id}
              character={c}
              state={iconState(c.id)}
              onSelect={() => setSelectedId(c.id)}
            />
          ))}
        </div>
        <div className="flex items-center gap-[93px]">
          {bottomRow.map((c) => (
            <CharacterIcon
              key={c.id}
              character={c}
              state={iconState(c.id)}
              onSelect={() => setSelectedId(c.id)}
            />
          ))}
        </div>
      </div>

      {/* The selected character's card + select button.
          `key` makes React re-mount it when the character changes,
          which replays the pop-in animation. */}
      {selected && (
        <div
          key={selected.id}
          className="absolute flex animate-card-in flex-col items-center gap-6 p-[10px] motion-reduce:animate-none"
          style={{ left: selected.cardPosition.left, top: selected.cardPosition.top }}
          onClick={(e) => e.stopPropagation()} // clicks on the card don't count as "outside"
        >
          <CharacterCard character={selected} />
          <Button colorClass={selected.buttonClass} onClick={() => onConfirm(selected.id)}>
            select
          </Button>
        </div>
      )}

    </Stage>
  )
}
