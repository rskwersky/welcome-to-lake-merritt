import { useState } from 'react'
import { historyShort } from './data/history'
import { GameOverview } from './screens/GameOverview'
import { History } from './screens/History'
import { Landing } from './screens/Landing'
import { NotBuiltYet } from './screens/NotBuiltYet'

// The app is a tiny "state machine": one piece of state says which screen is
// showing, and each screen gets callbacks to move to the next. The order
// follows the numbered Figma sections.
//
//   1 · intro:  01 game overview ─play game─▶ 02 landing ─click postcard─▶ 03 did you know
//               ─learn more─▶ 04 history / short ─continue─▶ 05 how to play (section 2, not built yet)
//
// 02 and 03 are one screen (Landing): 03 is just 02 with the postcard flipped.
// The old character select (CharacterSelect, Confirmed) is no longer in the
// flow; it follows an older design and will be rebuilt in section 3.

type Screen =
  | { name: 'game-overview' }
  | { name: 'landing' }
  | { name: 'history-short' }
  | { name: 'how-to-play' }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'game-overview' })

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
      return <NotBuiltYet screenName="05 how to play" onRestart={() => setScreen({ name: 'game-overview' })} />
  }
}
