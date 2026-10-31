import { Button } from '../components/Button'
import { CharacterCard } from '../components/CharacterCard'
import { Stage } from '../components/Stage'
import { getCharacter, type CharacterId } from '../data/characters'

// Placeholder for whatever comes after character select.
// Replace this screen when you build the game board.

type ConfirmedProps = {
  characterId: CharacterId
  onChooseAgain: () => void
}

export function Confirmed({ characterId, onChooseAgain }: ConfirmedProps) {
  const character = getCharacter(characterId)

  return (
    <Stage className="bg-cream">
      <div className="absolute inset-0 flex items-center justify-center gap-24">
        <CharacterCard character={character} />
        <div className="flex max-w-[460px] flex-col gap-8">
          <h1 className="font-mono text-[40px] leading-tight italic">
            you are playing as <span className="font-script text-6xl not-italic">{character.name}</span>
          </h1>
          <p className="font-mono text-2xl italic text-ink/70">the game board is coming soon.</p>
          <Button width="hug" onClick={onChooseAgain} className="self-start">
            choose again
          </Button>
        </div>
      </div>
    </Stage>
  )
}
