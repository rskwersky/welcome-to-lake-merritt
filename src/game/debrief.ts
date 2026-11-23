// The end of the game: the final report (worked out from the game's
// history: which option was chosen each round) and the debrief cards. Like
// state.ts, there's no React here: plain data in, plain data out.

import { EVENTS } from '../data/events'
import { pointsToStars, type Metric } from '../data/gameRules'
import { METRIC_ROWS, type GameState } from './state'

/** The option the group chose in each finished round, with its card. */
function choices(game: GameState) {
  return game.history.flatMap(({ eventId, option }) => {
    const event = EVENTS.find((e) => e.id === eventId)
    return event ? [{ event, option, chosen: event.options[option] }] : []
  })
}

// ---------------------------------------------------------------------------
// The final report

export type Report = {
  /** Option 1 on a card is the funded fix, option 2 the compromise, option 3 doing nothing */
  funded: number
  compromised: number
  letSlide: number
  rounds: number
  /** Final value of each metric, in stars (they all started at 0) */
  stars: Record<Metric, number>
  /** One line on how the lake ended up overall */
  verdict: string
}

export function report(game: GameState): Report {
  const picks = choices(game).map((c) => c.option)
  const stars = Object.fromEntries(METRIC_ROWS.map(({ metric }) => [metric, pointsToStars(game.metrics[metric])])) as Record<Metric, number>
  const values = Object.values(stars)
  const up = values.filter((v) => v > 0).length
  const down = values.filter((v) => v < 0).length
  const verdict =
    down === 0 && up > 0
      ? 'The lake is better off on every count than when the game started.'
      : up === 0 && down > 0
        ? 'The lake is worse off than when the game started.'
        : up === 0 && down === 0
          ? 'The lake ended up right where it started.'
          : 'Some things got better and some got worse.'
  return {
    funded: picks.filter((o) => o === 0).length,
    compromised: picks.filter((o) => o === 1).length,
    letSlide: picks.filter((o) => o === 2).length,
    rounds: picks.length,
    stars,
    verdict,
  }
}

// ---------------------------------------------------------------------------
// The debrief cards
// Each card is a question on the front and talking points on the back
// (click to flip). The talking points guide the discussion without
// answering the question: the group works the answer out together.

export type DebriefCard = { question: string; talkingPoints: string[] }

const VISION: DebriefCard = {
  question: 'Whose vision was attained this game?',
  talkingPoints: [
    'Think about the options the group chose most often. Whose goals did they serve?',
    "Was any character's vision left out? How did that player feel?",
    'Did the best argument win, or the loudest one?',
  ],
}

const PRIVILEGE: DebriefCard = {
  question: 'Which character started with the most privilege?',
  talkingPoints: [
    "Compare the characters' starting tokens. What could each kind of token buy?",
    'Political tokens get the city to act. Who could do that on their own, and who had to rely on others?',
    'Who in Oakland does each character stand for?',
  ],
}

const METRICS: DebriefCard = {
  question: 'Which metrics changed the most over the course of the game?',
  talkingPoints: [
    'Look at the score tracker. Which metric did each character care about most?',
    'Which decisions moved the lake the most, for better or worse?',
    'Is this the lake the group was fighting for?',
  ],
}

const ALLIANCES: DebriefCard = {
  question: 'Were alliances formed? Who tended to agree with each other?',
  talkingPoints: [
    'Which characters kept backing the same options?',
    'Did anyone switch sides to win something later?',
    'Were any of the alliances surprising?',
  ],
}

const COMMUNICATION: DebriefCard = {
  question: 'How can communication be improved? Who was most outspoken?',
  talkingPoints: [
    'Did everyone get a chance to speak before the group decided?',
    'Whose arguments changed minds, and why?',
    'What would the group do differently next time?',
  ],
}

/** The debrief, in order. Alliances need at least two players. */
export function debriefCards(game: GameState): DebriefCard[] {
  return game.players.length > 1 ? [VISION, PRIVILEGE, METRICS, ALLIANCES, COMMUNICATION] : [VISION, PRIVILEGE, METRICS, COMMUNICATION]
}

/** A short line about the game, sent along with feedback so it has context. */
export function gameSummary(game: GameState): string {
  const r = report(game)
  const stars = METRIC_ROWS.map(({ metric, label }) => `${label} ${r.stars[metric] > 0 ? '+' : ''}${r.stars[metric]} stars`).join(', ')
  return `${game.players.length} ${game.players.length === 1 ? 'player' : 'players'}, ${r.rounds} rounds. ${stars}. Funded ${r.funded}, compromised ${r.compromised}, let slide ${r.letSlide}.`
}
