// The words on the game manual pages ("05 how to play"), so they can be
// edited without touching the layout in src/screens/HowToPlay.tsx.
// No dashes in player-facing text: write ranges out ("steps 2 and 3").

export const manualObjective = {
  title: 'Objective:',
  goal: 'Simulate the complex stewardship of Lake Merritt through collective decision-making.',
  costsIntro: 'Decisions cost tokens:',
  // In the order shown on the page (each gets its token picture)
  tokens: ['political', 'economic', 'social'] as const,
  metricsIntro: 'Decisions impact three metrics:',
  metrics: ['social accessibility', 'reputation', 'environmental health'],
}

export const manualHowToPlay = {
  title: 'How to play',
  steps: [
    'Each player selects a character and reads their cheat sheet to understand individual goals.',
    'Draw an event card, deliberate the options presented, and decide how to proceed.',
    'After the group decides, the metrics card updates with the outcome.',
    'Repeat steps 2 and 3. After every five rounds, tokens are redistributed automatically.',
    'Continue until there are no more events. Take note of the final score, and debrief the game.',
  ],
}

/** The "what's in the box" page */
export const manualContents = {
  metricsCard: 'metrics card',
  characters: '6x characters & 6 cheat sheets',
  tokens: 'tokens',
  // Matches the totals in src/data/gameRules.ts (all six characters' starting tokens)
  tokenCounts: { social: '17x', political: '9x', economic: '10x' },
}
