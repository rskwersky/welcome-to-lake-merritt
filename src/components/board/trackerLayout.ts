// Sizes inside the score tracker (stage px), shared by the tracker itself
// and by the stars that fly into it.

import { TRACKER } from '../../data/gameRules'

// The tracker's geometry, exported so stars can "fly" to the right slot.
// Each bar has TRACKER.slots star slots; zero is after slot TRACKER.zeroAfterSlot
// (src/data/gameRules.ts). Pink stars go left of zero, yellow stars right.
export const TRACKER_BOX = { left: 1175.93, top: 86.9 }
export const BAR_WIDTH = 199
export const BAR_HEIGHT = 15.24
export const SLOT_WIDTH = BAR_WIDTH / TRACKER.slots
export const ROW_HEIGHT = 34.52 // bar + label
export const ROW_GAP = 10
export const PADDING = { x: 12, top: 14 }
// Every star's height is its width × this (the star shape is 30.71 × 29.31)
export const STAR_ASPECT = 29.3091 / 30.7142
// The tracker's star size
export const STAR = { width: 10.79, height: 10.3 }
