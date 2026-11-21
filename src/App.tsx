import { useState } from 'react'
import type { CharacterId } from './data/gameRules'
import { historyLong, historyShort } from './data/history'
import { CharacterSelect } from './screens/CharacterSelect'
import { GameOverview } from './screens/GameOverview'
import { History } from './screens/History'
import { HowToPlay } from './screens/HowToPlay'
import { Landing } from './screens/Landing'
import { NotBuiltYet } from './screens/NotBuiltYet'
import { PlayerCount } from './screens/PlayerCount'
import { Game } from './screens/Game'
import { Tutorial } from './screens/Tutorial'
import { freshGame, gameAfterTutorial, playersFromPicks, startingMetrics, type GameState } from './game/state'
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
//   5 · game board, rounds 2–15 (play mode ⇄ explore mode) ─after round 15─▶
//       end screen (not designed yet)
//
// From the board's menu: "learn more" → 04 history / long ─return to game─▶ board;
// "new game" → restart: player count and character select with last game's
// choices pre-selected, then straight to round 1 (no tutorial).
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
  // The game in progress: round, deck, tokens, metrics. Kept here so it
  // survives a visit to "learn more".
  const [game, setGame] = useState<GameState | null>(() =>
    devStart?.screen === 'game' ? gameAfterTutorial(playersFromPicks(devStart.picks), {}, startingMetrics()) : null,
  )
  // True after "restart game": skip the tutorial this time.
  const [restarting, setRestarting] = useState(false)

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
            if (restarting) {
              setRestarting(false)
              setGame(freshGame(playersFromPicks(chosen)))
              setScreen({ name: 'game' })
            } else {
              setScreen({ name: 'tutorial' })
            }
          }}
        />
      )
    case 'tutorial': {
      const players = playersFromPicks(picks ?? [])
      return (
        <Tutorial
          players={players}
          onStart={({ spent, metrics }) => {
            setGame(gameAfterTutorial(players, spent, metrics))
            setScreen({ name: 'game' })
          }}
        />
      )
    }
    case 'game':
      if (!game) return <NotBuiltYet screenName="09 game board (no game yet)" onRestart={() => setScreen({ name: 'game-overview' })} />
      return (
        <Game
          game={game}
          setGame={setGame}
          onLearnMore={() => setScreen({ name: 'history-long' })}
          onRestart={() => {
            setRestarting(true)
            setScreen({ name: 'player-count' })
          }}
          onGameOver={() => setScreen({ name: 'game-over' })}
        />
      )
    case 'history-long':
      return (
        <History
          paragraphs={historyLong}
          button={{ label: 'return to game', width: 331, onClick: () => setScreen({ name: 'game' }) }}
        />
      )
    case 'game-over':
      return <NotBuiltYet screenName="end screen (not designed yet)" onRestart={() => setScreen({ name: 'game-overview' })} />
  }
}
