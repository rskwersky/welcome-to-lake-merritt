import { useState } from 'react'
import { historyShort } from './data/history'
import { GameOverview } from './screens/GameOverview'
import { History } from './screens/History'
import { HowToPlay } from './screens/HowToPlay'
import { Landing } from './screens/Landing'
import { NotBuiltYet } from './screens/NotBuiltYet'
import { PlayerCount } from './screens/PlayerCount'

// The app is a tiny "state machine": one piece of state says which screen is
// showing, and each screen gets callbacks to move to the next. The order
// follows the numbered Figma sections.
//
//   1 · intro:  01 game overview ─play game─▶ 02 landing ─click postcard─▶ 03 did you know
//               ─learn more─▶ 04 history / short ─continue─▶
//   2 · setup:  05 how to play ─continue─▶ 06 player count ─continue─▶
//   3 · character select (not built yet; repeats once per player)
//
// 02 and 03 are one screen (Landing): 03 is just 02 with the postcard flipped.
// The old character select (CharacterSelect, Confirmed) is no longer in the
// flow; it follows an older design and will be rebuilt in section 3.

type Screen =
  | { name: 'game-overview' }
  | { name: 'landing' }
  | { name: 'history-short' }
  | { name: 'how-to-play' }
  | { name: 'player-count' }
  | { name: 'character-select' }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'game-overview' })
  // Remembered across screens: character select needs it, and "restart game"
  // will bring it back pre-selected.
  const [playerCount, setPlayerCount] = useState<number | undefined>()

  switch (screen.name) {
    case 'game-overview':
      return <GameOverview onPlay={() => setScreen({ name: 'landing' })} />
    case 'landing':
      return <Landing onLearnMore={() => setScreen({ name: 'history-short' })} />
    case 'history-short':
      return (
        <History
          paragraphs={historyShort}
          button={{ label: 'continue', width: 202, onClick: () => setScreen({ name: 'how-to-play' }) }}
        />
      )
    case 'how-to-play':
      return <HowToPlay onContinue={() => setScreen({ name: 'player-count' })} />
    case 'player-count':
      return (
        <PlayerCount
          initialCount={playerCount}
          onContinue={(count) => {
            setPlayerCount(count)
            setScreen({ name: 'character-select' })
          }}
        />
      )
    case 'character-select':
      return (
        <NotBuiltYet
          screenName={`07 character select (${playerCount} ${playerCount === 1 ? 'player' : 'players'})`}
          onRestart={() => setScreen({ name: 'game-overview' })}
        />
      )
  }
}
