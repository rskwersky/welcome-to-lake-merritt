// The 15 event cards. Source of truth: the "Event Deck & Token Rules" doc.
// Options are written from the players' side: they're community groups, not
// the city, so they fund, petition, lobby or volunteer. (Costs and effects
// are unchanged from the balance-tested numbers.)
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
  /**
   * One line from someone the event affects, shown in italics under the
   * title. These were written for the game (not taken from the interviews);
   * swap in real interview lines, with permission, when you have them.
   */
  voice: { quote: string; speaker: string }
  options: [EventOption, EventOption, EventOption]
}

const fx = (environment: number, accessibility: number, reputation: number): Effect => ({ environment, accessibility, reputation })
const free: Cost = {}

export const EVENTS: GameEvent[] = [
  {
    id: 'unhoused-occupation',
    title: 'Shelter by the Shore',
    scenario: 'Tents have lined the shore near the Pergola since winter. Trash is reaching the water, and some walkers now take the long way around.',
    voice: { quote: 'Everyone deserves to be at the lake. That includes the folks who live here.', speaker: 'an outreach volunteer' },
    options: [
      { text: 'Fund outreach workers, restrooms and daily trash pickup, with referrals to shelter', cost: { economic: 4, social: 4 }, effect: fx(2, 2, 1), pushedBy: ['educator', 'recreationist'] },
      { text: 'Ask the city to clear the encampment', cost: { political: 3 }, effect: fx(3, -2, -1), pushedBy: ['protector', 'environmentalist'] },
      { text: 'Do nothing', cost: free, effect: fx(-2, 0, -1), pushedBy: [] },
    ],
  },
  {
    id: 'parking-panic',
    title: 'Parking Panic',
    scenario: 'It\'s a sunny Saturday and every car in Oakland wants a spot on Lakeshore Avenue. Drivers circle the block, double park and honk at the cyclists squeezing past.',
    voice: { quote: 'I spent more time parking than picnicking.', speaker: 'a visitor from across town' },
    options: [
      { text: 'Push the city to spend meter revenue on a free weekend shuttle and bike valet', cost: { economic: 4, political: 3 }, effect: fx(0, 3, 1), pushedBy: ['recreationist', 'educator'] },
      { text: 'Petition the city for stricter weekend parking enforcement', cost: { political: 3 }, effect: fx(0, -1, 2), pushedBy: ['citizen'] },
      { text: 'Do nothing', cost: free, effect: fx(0, -2, -2), pushedBy: [] },
    ],
  },
  {
    id: 'bandage-the-bandstand',
    title: 'Bandage the Bandstand',
    scenario: 'The Edoff Memorial Bandstand is cracked and wrapped in orange fencing. The summer concert series is canceled until further notice.',
    voice: { quote: 'My grandparents danced here. I want my kids to.', speaker: 'a Lakeside Park regular' },
    options: [
      { text: 'Fundraise to restore it with ramps and accessible seating', cost: { economic: 4, political: 3 }, effect: fx(0, 2, 2), pushedBy: ['organizer', 'recreationist'] },
      { text: 'Hold a volunteer patch-and-paint day', cost: { social: 6 }, effect: fx(0, 1, 1), pushedBy: ['educator'] },
      { text: 'Leave it fenced off', cost: free, effect: fx(0, -1, -2), pushedBy: [] },
    ],
  },
  {
    id: 'accessible-bathrooms',
    title: 'Accessible Bathrooms',
    scenario: 'The lakeside restrooms lock before sunset, and the ramp is too steep for a wheelchair. Vendors hold it all afternoon; families pack up early.',
    voice: { quote: 'Access isn\'t a luxury. It\'s the first thing.', speaker: 'a disability advocate' },
    options: [
      { text: 'Lobby the city for accessible restrooms that stay open until dark', cost: { economic: 5, political: 3 }, effect: fx(1, 3, 1), pushedBy: ['recreationist', 'citizen'] },
      { text: 'Pool money to rent portable toilets on weekends', cost: { economic: 3 }, effect: fx(0, 1, -1), pushedBy: ['organizer'] },
      { text: 'Do nothing', cost: free, effect: fx(-1, -1, -1), pushedBy: [] },
    ],
  },
  {
    id: 'birds-down',
    title: 'Birds Down',
    scenario: 'Lake Merritt became North America\'s first official wildlife refuge in 1870. Now volunteers at the bird sanctuary are finding sick ducks and herons, and nobody knows why yet.',
    voice: { quote: 'The birds tell you how the water is doing.', speaker: 'a Rotary Nature Center volunteer' },
    options: [
      { text: 'Fund water testing and a wildlife rescue team with Rotary Nature Center volunteers', cost: { economic: 3, social: 5 }, effect: fx(3, 0, 1), pushedBy: ['environmentalist', 'educator'] },
      { text: 'Run a volunteer campaign asking visitors not to feed the birds', cost: { social: 4 }, effect: fx(1, 0, 0), pushedBy: ['protector'] },
      { text: 'Do nothing', cost: free, effect: fx(-2, 0, -1), pushedBy: [] },
    ],
  },
  {
    id: 'power-outage',
    title: 'Power Outage',
    scenario: 'The Necklace of Lights has gone dark. Evening joggers run by phone flashlight, and the paths feel a lot less friendly after sunset.',
    voice: { quote: 'The lights are how you know you\'re home.', speaker: 'an Adams Point neighbor' },
    options: [
      { text: 'Raise money to repair the lights and upgrade them to LEDs', cost: { economic: 5, political: 1 }, effect: fx(0, 2, 2), pushedBy: ['organizer', 'citizen'] },
      { text: 'Organize volunteer lantern walks until repairs are funded', cost: { social: 4 }, effect: fx(0, 1, 1), pushedBy: ['recreationist', 'educator'] },
      { text: 'Wait for the city', cost: free, effect: fx(0, -2, -1), pushedBy: [] },
    ],
  },
  {
    id: 'covid-spike',
    title: 'Covid Spike',
    scenario: 'Cases are climbing again, and the county is weighing whether to close the lakeside lawns. For neighbors without a backyard, the lake is the only outdoor space they have.',
    voice: { quote: 'Closing the park doesn\'t keep people home. It keeps them inside.', speaker: 'a public health nurse' },
    options: [
      { text: 'Set up free masks, hand-washing stations and spaced-out outdoor events', cost: { economic: 3, social: 5 }, effect: fx(1, 2, 1), pushedBy: ['educator', 'recreationist'] },
      { text: 'Urge the county to close the lawns and picnic areas', cost: { political: 3 }, effect: fx(2, -2, -1), pushedBy: ['protector', 'citizen'] },
      { text: 'Do nothing', cost: free, effect: fx(0, -1, -2), pushedBy: [] },
    ],
  },
  {
    // Tutorial card (round 1). Keeps its original, cheaper costs.
    id: 'graffiti-at-the-boathouse',
    title: 'Graffiti at the Boathouse',
    scenario: 'Overnight, a burst of color appeared across the boathouse wall. Some neighbors call it vandalism; others are already taking photos in front of it.',
    voice: { quote: 'Who decides what counts as art?', speaker: 'a local muralist' },
    options: [
      { text: 'Propose a new art space where graffiti is welcome', cost: { political: 2, social: 3 }, effect: fx(0, 3, 2), pushedBy: ['recreationist', 'educator'] },
      { text: 'Ask the city to station an officer to patrol the lake for vandalism', cost: { political: 3 }, effect: fx(0, -1, 1), pushedBy: ['citizen', 'protector'] },
      { text: 'Leave the graffiti', cost: free, effect: fx(0, 0, -3), pushedBy: [] },
    ],
  },
  {
    id: 'dredging',
    title: 'Dredging',
    scenario: 'Decades of silt have settled on the lake bottom. On hot days the water turns green with algae, and fish come up gasping for air.',
    voice: { quote: 'You can smell the lake before you see it now.', speaker: 'a rower at the Boating Center' },
    options: [
      { text: 'Campaign for the city to dredge the whole lake', cost: { economic: 5, political: 4 }, effect: fx(4, 0, 2), pushedBy: ['environmentalist', 'protector'] },
      { text: "Fund aeration fountains like the Lake Merritt Institute's", cost: { economic: 3 }, effect: fx(2, 0, 1), pushedBy: ['environmentalist'] },
      { text: 'Do nothing', cost: free, effect: fx(-4, 0, 0), pushedBy: [] },
    ],
  },
  {
    id: 'recycling-initiative',
    title: 'Recycling Initiative',
    scenario: 'After every sunny weekend, bins overflow along the shore and the wind does the rest. By Monday morning, bottles bob between the geese.',
    voice: { quote: 'It\'s not that people don\'t care. There\'s just nowhere to put it.', speaker: 'a weekend vendor' },
    options: [
      { text: 'Fund a paid youth crew for weekend cleanup and recycling stations', cost: { economic: 3, social: 5 }, effect: fx(2, 2, 1), pushedBy: ['educator', 'organizer'] },
      { text: 'Host a monthly volunteer cleanup', cost: { social: 4 }, effect: fx(2, 0, 0), pushedBy: ['protector', 'environmentalist'] },
      { text: 'Do nothing', cost: free, effect: fx(-2, 0, -1), pushedBy: [] },
    ],
  },
  {
    id: 'jam-session',
    title: 'Jam Session',
    scenario: 'The Saturday drum circle at the Pergola has grown into a full party with DJs and dancing. It draws crowds from across the Bay, and some neighbors hear it with the windows shut.',
    voice: { quote: 'This is what the lake sounds like when it\'s alive.', speaker: 'a drummer' },
    options: [
      { text: 'Petition the city for a permitted performance zone with set hours', cost: { political: 1, social: 5 }, effect: fx(0, 2, 1), pushedBy: ['recreationist', 'organizer'] },
      { text: 'Call on the city to enforce the noise ordinance', cost: { political: 3 }, effect: fx(0, -1, 1), pushedBy: ['citizen'] },
      { text: 'Do nothing', cost: free, effect: fx(0, 0, -2), pushedBy: [] },
    ],
  },
  {
    id: 'wild-ride',
    title: 'Wild Ride',
    scenario: 'Rental scooters zip along the lakeside path, weaving between strollers and runners. Volunteers keep fishing them out of the water.',
    voice: { quote: 'I love that they bring people here. I don\'t love dodging them.', speaker: 'a morning runner' },
    options: [
      { text: 'Push the city to add scooter lanes and docking corrals', cost: { economic: 3, political: 3 }, effect: fx(1, 2, 1), pushedBy: ['recreationist', 'organizer'] },
      { text: 'Petition the city to ban scooters from the park', cost: { political: 3 }, effect: fx(2, -1, -1), pushedBy: ['protector', 'environmentalist'] },
      { text: 'Do nothing', cost: free, effect: fx(-1, 0, -1), pushedBy: [] },
    ],
  },
  {
    id: 'vendor-dispute',
    title: 'Vendor Dispute',
    scenario: 'Every weekend, dozens of vendors line Lakeshore Avenue selling food, art and clothes. For many it\'s their main income. Some neighbors complain about trash and blocked sidewalks.',
    voice: { quote: 'We\'re not in the way. We\'re the reason people come.', speaker: 'a vendor' },
    options: [
      { text: 'Partner with the city on a vendor program with free permits, assigned spots and trash service', cost: { economic: 3, political: 1, social: 4 }, effect: fx(1, 2, 1), pushedBy: ['recreationist', 'organizer'] },
      { text: 'Ask the city to crack down on unpermitted vendors', cost: { political: 3 }, effect: fx(1, -2, 1), pushedBy: ['citizen', 'protector'] },
      { text: 'Do nothing', cost: free, effect: fx(-2, 0, 0), pushedBy: [] },
    ],
  },
  {
    id: 'sticky-situation',
    title: 'Sticky Situation',
    scenario: 'A developer wants to build a café on public parkland by the water, with part of the profits going to park upkeep. The council vote is next week.',
    voice: { quote: 'A café is nice. A café you can\'t afford is a fence.', speaker: 'a neighborhood organizer' },
    options: [
      { text: 'Testify at city council: approve it only with free public seating and restrooms', cost: { political: 3, social: 4 }, effect: fx(0, 1, 2), pushedBy: ['organizer', 'educator'] },
      { text: 'Speak in support of the café as proposed', cost: { political: 1 }, effect: fx(0, -2, 2), pushedBy: ['citizen'] },
      { text: 'Stay out of the debate', cost: free, effect: fx(0, -1, -1), pushedBy: [] },
    ],
  },
  {
    id: 'storm-incoming',
    title: 'Storm Incoming',
    scenario: 'A big storm is heading for the Bay. Every storm drain around the lake empties straight into the water, carrying whatever is in the gutter with it.',
    voice: { quote: 'Whatever\'s on the street today is in the lake tomorrow.', speaker: 'a creek volunteer' },
    options: [
      { text: 'Fund trash-capture screens for the storm drains', cost: { economic: 5, political: 1 }, effect: fx(3, 0, 1), pushedBy: ['environmentalist', 'protector'] },
      { text: 'Organize volunteers to clear the drains before the storm', cost: { social: 4 }, effect: fx(1, 0, 1), pushedBy: ['educator'] },
      { text: 'Do nothing', cost: free, effect: fx(-2, 0, -2), pushedBy: [] },
    ],
  },
]
