import { useState } from 'react'
import type { CharacterId } from './data/gameRules'
import { historyShort } from './data/history'
import { CharacterSelect } from './screens/CharacterSelect'
import { GameOverview } from './screens/GameOverview'
import { History } from './screens/History'
import { HowToPlay } from './screens/HowToPlay'
import { Landing } from './screens/Landing'
import { NotBuiltYet } from './screens/NotBuiltYet'
import { PlayerCount } from './screens/PlayerCount'
import { Tutorial } from './screens/Tutorial'
import { playersFromPicks } from './game/state'
import { readDevStart, type ScreenName } from './devStart'

// The app is a tiny "state machine": one piece of state says which screen is
// showing, and each screen gets callbacks to move to the next. The order
// follows the numbered Figma sections.
//
//   1 · intro:  01 game overview ─play game─▶ 02 landing ─click postcard─▶ 03 did you know
//               ─learn more─▶ 04 history / short ─continue─▶
//   2 · setup:  05 how to play ─continue─▶ 06 player count ─continue─▶
//   3 · character select (players take turns) ─continue─▶
//   4 · tutorial (round 1, steps 1–8) ─start game─▶
//   5 · game board (not built yet)
//
// 02 and 03 are one screen (Landing): 03 is just 02 with the postcard flipped.

type Screen = { name: ScreenName }

// While developing, "?screen=tutorial" (and friends) in the URL opens that
// screen directly, with made-up players. See src/devStart.ts.
const devStart = readDevStart()

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: devStart?.screen ?? 'game-overview' })
  // Remembered across screens: character select needs it, and "restart game"
  // will bring it back pre-selected.
  const [playerCount, setPlayerCount] = useState<number | undefined>(devStart?.playerCount)
  // picks[0] is Player 1's character, and so on.
  const [picks, setPicks] = useState<CharacterId[] | undefined>(devStart?.picks)

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
        <CharacterSelect
          // A new key when the count changes starts the picks over.
          key={playerCount}
          playerCount={playerCount ?? 1}
          initialPicks={picks?.length === playerCount ? picks : undefined}
          onContinue={(chosen) => {
            setPicks(chosen)
            setScreen({ name: 'tutorial' })
          }}
        />
      )
    case 'tutorial':
      return <Tutorial players={playersFromPicks(picks ?? [])} onStart={() => setScreen({ name: 'game' })} />
    case 'game':
      return <NotBuiltYet screenName="09 game board (round 2)" onRestart={() => setScreen({ name: 'game-overview' })} />
  }
}
