// The 15 event cards. Source of truth: the "Event Deck & Token Rules" doc.
// Option 1 = funded fix, option 2 = cheaper compromise that helps one metric
// at another's expense, option 3 = free and always hurts the lake.
// If you change a cost or effect, re-run the balance check before shipping.

import type { CharacterId, Metric, TokenType } from './gameRules'

export type Cost = Partial<Record<TokenType, number>>
export type Effect = Record<Metric, number>

export type EventOption = {
  text: string
  cost: Cost
  effect: Effect
  /** Characters whose goals this option serves. Shown as hints, not rules. */
  pushedBy: CharacterId[]
}

export type GameEvent = {
  id: string
  title: string
  scenario: string
  options: [EventOption, EventOption, EventOption]
}

const fx = (environment: number, accessibility: number, reputation: number): Effect => ({ environment, accessibility, reputation })
const free: Cost = {}

export const EVENTS: GameEvent[] = [
  {
    id: 'unhoused-occupation',
    title: 'Unhoused Occupation',
    scenario: 'An encampment has grown along the shoreline near the Pergola. Trash is reaching the water, and some visitors avoid the area.',
    options: [
      { text: 'Fund outreach workers, restrooms and daily trash pickup, with referrals to shelter', cost: { economic: 4, social: 4 }, effect: fx(2, 2, 1), pushedBy: ['educator', 'recreationist'] },
      { text: 'Ask the city to clear the encampment', cost: { political: 3 }, effect: fx(3, -2, -1), pushedBy: ['protector', 'environmentalist'] },
      { text: 'Do nothing', cost: free, effect: fx(-2, 0, -1), pushedBy: [] },
    ],
  },
  {
    id: 'parking-panic',
    title: 'Parking Panic',
    scenario: 'Since meters went in on Lakeshore Avenue, weekend visitors circle for parking and double-park, blocking traffic.',
    options: [
      { text: 'Use meter revenue for a free weekend shuttle and bike valet', cost: { economic: 4, political: 3 }, effect: fx(0, 3, 1), pushedBy: ['recreationist', 'educator'] },
      { text: 'Step up ticketing and towing on weekends', cost: { political: 3 }, effect: fx(0, -1, 2), pushedBy: ['citizen'] },
      { text: 'Do nothing', cost: free, effect: fx(0, -2, -2), pushedBy: [] },
    ],
  },
  {
    id: 'bandage-the-bandstand',
    title: 'Bandage the Bandstand',
    scenario: 'The historic bandstand in Lakeside Park is cracked and fenced off, and summer concerts are canceled.',
    options: [
      { text: 'Restore it with ramps and accessible seating', cost: { economic: 4, political: 3 }, effect: fx(0, 2, 2), pushedBy: ['organizer', 'recreationist'] },
      { text: 'Hold a volunteer patch-and-paint day', cost: { social: 6 }, effect: fx(0, 1, 1), pushedBy: ['educator'] },
      { text: 'Keep it fenced off', cost: free, effect: fx(0, -1, -2), pushedBy: [] },
    ],
  },
  {
    id: 'accessible-bathrooms',
    title: 'Accessible Bathrooms',
    scenario: "The restrooms near the lake close early and aren't wheelchair accessible. Families and vendors have nowhere to go.",
    options: [
      { text: 'Build accessible restrooms that stay open until dark', cost: { economic: 5, political: 3 }, effect: fx(1, 3, 1), pushedBy: ['recreationist', 'citizen'] },
      { text: 'Rent portable toilets for weekends', cost: { economic: 3 }, effect: fx(0, 1, -1), pushedBy: ['organizer'] },
      { text: 'Do nothing', cost: free, effect: fx(-1, -1, -1), pushedBy: [] },
    ],
  },
  {
    id: 'birds-down',
    title: 'Birds Down',
    scenario: 'Volunteers are finding sick ducks and herons near the bird sanctuary.',
    options: [
      { text: 'Fund water testing and a wildlife rescue team with Rotary Nature Center volunteers', cost: { economic: 3, social: 5 }, effect: fx(3, 0, 1), pushedBy: ['environmentalist', 'educator'] },
      { text: 'Run a volunteer campaign asking visitors not to feed the birds', cost: { social: 4 }, effect: fx(1, 0, 0), pushedBy: ['protector'] },
      { text: 'Do nothing', cost: free, effect: fx(-2, 0, -1), pushedBy: [] },
    ],
  },
  {
    id: 'power-outage',
    title: 'Power Outage',
    scenario: 'The Necklace of Lights has gone dark, and the paths around the lake are unlit at night.',
    options: [
      { text: 'Repair the lights and upgrade them to LEDs', cost: { economic: 5, political: 1 }, effect: fx(0, 2, 2), pushedBy: ['organizer', 'citizen'] },
      { text: 'Organize volunteer lantern walks until repairs are funded', cost: { social: 4 }, effect: fx(0, 1, 1), pushedBy: ['recreationist', 'educator'] },
      { text: 'Wait for the city', cost: free, effect: fx(0, -2, -1), pushedBy: [] },
    ],
  },
  {
    id: 'covid-spike',
    title: 'Covid Spike',
    scenario: 'Cases are rising, and the county is considering closing lakeside gathering spaces.',
    options: [
      { text: 'Set up free masks, hand-washing stations and spaced-out outdoor events', cost: { economic: 3, social: 5 }, effect: fx(1, 2, 1), pushedBy: ['educator', 'recreationist'] },
      { text: 'Close the lawns and picnic areas', cost: { political: 3 }, effect: fx(2, -2, -1), pushedBy: ['protector', 'citizen'] },
      { text: 'Do nothing', cost: free, effect: fx(0, -1, -2), pushedBy: [] },
    ],
  },
  {
    // Tutorial card (round 1). Keeps its original, cheaper costs.
    id: 'graffiti-at-the-boathouse',
    title: 'Graffiti at the Boathouse',
    scenario: 'Graffiti has been appearing on the boathouse. Some find it disruptive to the ambiance.',
    options: [
      { text: 'Declare a new art space to encourage graffiti in a designated area', cost: { political: 2, social: 3 }, effect: fx(0, 3, 2), pushedBy: ['recreationist', 'educator'] },
      { text: 'Station an officer to walk the perimeter of the lake and patrol for vandalism', cost: { political: 3 }, effect: fx(0, -1, 1), pushedBy: ['citizen', 'protector'] },
      { text: 'Leave the graffiti', cost: free, effect: fx(0, 0, -3), pushedBy: [] },
    ],
  },
  {
    id: 'dredging',
    title: 'Dredging',
    scenario: 'Sediment has built up on the lake bottom, feeding algae and lowering oxygen.',
    options: [
      { text: 'Dredge the whole lake', cost: { economic: 5, political: 4 }, effect: fx(4, 0, 2), pushedBy: ['environmentalist', 'protector'] },
      { text: "Add aeration fountains like the Lake Merritt Institute's", cost: { economic: 3 }, effect: fx(2, 0, 1), pushedBy: ['environmentalist'] },
      { text: 'Do nothing', cost: free, effect: fx(-4, 0, 0), pushedBy: [] },
    ],
  },
  {
    id: 'recycling-initiative',
    title: 'Recycling Initiative',
    scenario: 'Trash bins overflow after every sunny weekend, and litter blows into the lake.',
    options: [
      { text: 'Hire a paid youth crew for weekend cleanup and add recycling stations', cost: { economic: 3, social: 5 }, effect: fx(2, 2, 1), pushedBy: ['educator', 'organizer'] },
      { text: 'Host a monthly volunteer cleanup', cost: { social: 4 }, effect: fx(2, 0, 0), pushedBy: ['protector', 'environmentalist'] },
      { text: 'Do nothing', cost: free, effect: fx(-2, 0, -1), pushedBy: [] },
    ],
  },
  {
    id: 'jam-session',
    title: 'Jam Session',
    scenario: 'A weekend drum circle and DJ sets draw big crowds. Some neighbors complain about the noise.',
    options: [
      { text: 'Create a permitted performance zone with set hours', cost: { political: 1, social: 5 }, effect: fx(0, 2, 1), pushedBy: ['recreationist', 'organizer'] },
      { text: 'Enforce the noise ordinance', cost: { political: 3 }, effect: fx(0, -1, 1), pushedBy: ['citizen'] },
      { text: 'Do nothing', cost: free, effect: fx(0, 0, -2), pushedBy: [] },
    ],
  },
  {
    id: 'wild-ride',
    title: 'Wild Ride',
    scenario: 'E-scooters race along the lakeside path, and some end up dumped in the water.',
    options: [
      { text: 'Add scooter lanes and docking corrals', cost: { economic: 3, political: 3 }, effect: fx(1, 2, 1), pushedBy: ['recreationist', 'organizer'] },
      { text: 'Ban scooters from the park', cost: { political: 3 }, effect: fx(2, -1, -1), pushedBy: ['protector', 'environmentalist'] },
      { text: 'Do nothing', cost: free, effect: fx(-1, 0, -1), pushedBy: [] },
    ],
  },
  {
    id: 'vendor-dispute',
    title: 'Vendor Dispute',
    scenario: 'On weekends, dozens of vendors set up along Lakeshore Avenue. Some neighbors complain about trash and blocked sidewalks.',
    options: [
      { text: 'Launch a vendor program with free permits, assigned spots and trash service', cost: { economic: 3, political: 1, social: 4 }, effect: fx(1, 2, 1), pushedBy: ['recreationist', 'organizer'] },
      { text: 'Crack down on unpermitted vendors', cost: { political: 3 }, effect: fx(1, -2, 1), pushedBy: ['citizen', 'protector'] },
      { text: 'Do nothing', cost: free, effect: fx(-2, 0, 0), pushedBy: [] },
    ],
  },
  {
    id: 'sticky-situation',
    title: 'Sticky Situation',
    scenario: 'A developer offers to build a lakeside café on public parkland, with a share of profits going to park maintenance.',
    options: [
      { text: 'Approve it only if it includes free public seating and restrooms', cost: { political: 3, social: 4 }, effect: fx(0, 1, 2), pushedBy: ['organizer', 'educator'] },
      { text: 'Approve the café as proposed', cost: { political: 1 }, effect: fx(0, -2, 2), pushedBy: ['citizen'] },
      { text: 'Delay the decision', cost: free, effect: fx(0, -1, -1), pushedBy: [] },
    ],
  },
  {
    id: 'storm-incoming',
    title: 'Storm Incoming',
    scenario: 'A big storm is forecast, and the storm drains around the lake carry street trash straight into the water.',
    options: [
      { text: 'Install trash-capture screens in the storm drains', cost: { economic: 5, political: 1 }, effect: fx(3, 0, 1), pushedBy: ['environmentalist', 'protector'] },
      { text: 'Organize volunteers to clear the drains before the storm', cost: { social: 4 }, effect: fx(1, 0, 1), pushedBy: ['educator'] },
      { text: 'Do nothing', cost: free, effect: fx(-2, 0, -2), pushedBy: [] },
    ],
  },
]
