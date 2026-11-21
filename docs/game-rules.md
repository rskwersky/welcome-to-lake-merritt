# Welcome to Lake Merritt — game rules

The numbers live in code: `src/data/gameRules.ts` (tokens, resets, city bank, tracker) and
`src/data/events.ts` (the 15 event cards). This file explains them. Every number was
balance-tested with 20,000 simulated games; if you change one, re-run the check.

## The goal

There is no winner. Players try to improve the lake's three metrics — **environment**,
**accessibility** and **reputation** — while arguing for the choices that match their
character's goals. The game ends after the last event; the end screen shows how far each
metric moved and asks each player to reflect on their character's goals.

## Tokens

Tokens belong to characters, not players. Every character starts with 6:

| Character | Political | Social | Economic |
| --- | --- | --- | --- |
| Organizer | 2 | 2 | 2 |
| Recreationist | 0 | 5 | 1 |
| Protector | 1 | 3 | 2 |
| Environmentalist | 3 | 1 | 2 |
| Citizen | 1 | 3 | 2 |
| Educator | 2 | 3 | 1 |
| **All six** | **9** | **17** | **10** |

Display order everywhere: social (cream), economic (gold), political (navy).

## Rounds and resets

- 15 events, one per round. The **tutorial is round 1** and always uses *Graffiti at the
  Boathouse*; the other 14 cards are shuffled for rounds 2–15.
- After rounds **5 and 10**, every character and the city bank go **back to their
  starting tokens**. Spent tokens (shown at 50%
  opacity) return to 100%; unspent tokens do not carry over. The game ends after round 15.
- The round counter shows "Rounds until token reset: N" (5 → 1, then back to 5).

## Each round

1. Draw the top event card.
2. The group picks one of three options. Option 1 is the funded fix, option 2 a cheaper
   compromise that helps one metric at another's expense, option 3 is free and always
   hurts the lake.
3. The group covers the option's cost in the allocate-tokens popup. Nobody can enter more
   tokens than they have (the box flashes red). Continue unlocks only when the cost is
   fully covered.
4. The metric changes animate into the score tracker; spent tokens dim to 50%.

## Fewer than 6 players: the city bank

- 1–6 people can play. Each player claims one character; the unclaimed characters' tokens
  are pooled into one **city bank** (shown as a pool, not as characters).
- **Rule:** the city bank can only cover a token type once every player has used up their
  own tokens of that type. Players can't spend the city's tokens instead of their own.
- Because the total tokens never change, the game is equally hard at any player count
  (best option affordable in ~60% of rounds). Solo: one player + a five-character city bank.

## Score tracker

- Each metric starts at **0** ("the lake as it is today").
- **1 star = 2 points**, half stars allowed. 15 star slots per bar, zero after the 5th, so
  each bar shows **−10 to +20**. Negative = pink stars to the left of zero, positive =
  yellow stars to the right. Values outside the range are clamped.
- Typical game: metrics end around +5 to +20 (6–7 stars); about 1 game in 20 reaches the
  right edge on accessibility.

## New game

"restart game" → player count with the last game's player count and characters
pre-selected (players can keep or change them) → skip the tutorial → game board at round 1
with full tokens, a reshuffled full 15-card deck, and the counter at 5.

## Balance results (with these numbers)

| | Result |
| --- | --- |
| Rounds where the best option is affordable | 60% |
| Rounds the group settles for the compromise | 27% |
| Rounds the group can't afford anything | 13% |
| Average final change: environment / accessibility / reputation | about +11 / +13 / +12 |
| Games where accessibility ends up positive | 99.9% |
