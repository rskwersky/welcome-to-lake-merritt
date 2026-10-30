import { useState } from 'react'
import type { CharacterId } from './data/characters'
import { historyLong, historyShort } from './data/history'
import { CharacterSelect } from './screens/CharacterSelect'
import { ChooseLength } from './screens/ChooseLength'
import { Confirmed } from './screens/Confirmed'
import { History } from './screens/History'
import { Landing } from './screens/Landing'

// The whole intro flow is a tiny "state machine": one piece of state says
// which screen is showing, and each screen gets callbacks to move to the next.
//
//   landing ──learn more──▶ choose-length ──▶ history-long / history-short ──┐
//      └──────play game──────────────────────────────────────────────────────┴─▶ character-select ──▶ confirmed

type Screen =
  | { name: 'landing' }
  | { name: 'choose-length' }
  | { name: 'history'; length: 'long' | 'short' }
  | { name: 'character-select' }
  | { name: 'confirmed'; characterId: CharacterId }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'landing' })

  switch (screen.name) {
    case 'landing':
      return (
        <Landing
          onLearnMore={() => setScreen({ name: 'choose-length' })}
          onPlay={() => setScreen({ name: 'character-select' })}
        />
      )
    case 'choose-length':
      return (
        <ChooseLength
          onLong={() => setScreen({ name: 'history', length: 'long' })}
          onShort={() => setScreen({ name: 'history', length: 'short' })}
        />
      )
    case 'history':
      return (
        <History
          paragraphs={screen.length === 'long' ? historyLong : historyShort}
          onBack={() => setScreen({ name: 'choose-length' })}
          onPlay={() => setScreen({ name: 'character-select' })}
        />
      )
    case 'character-select':
      return <CharacterSelect onConfirm={(id) => setScreen({ name: 'confirmed', characterId: id })} />
    case 'confirmed':
      return (
        <Confirmed
          characterId={screen.characterId}
          onChooseAgain={() => setScreen({ name: 'character-select' })}
        />
      )
  }
}
