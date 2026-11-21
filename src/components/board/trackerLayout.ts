// Where things sit inside the score tracker (stage px), shared by the
// tracker itself and by the stars that fly into it.

import { TRACKER, type Metric } from '../../data/gameRules'
import { METRIC_ROWS } from '../../game/state'

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
export const STAR = { width: 10.79, height: 10.36 }

/** Stage x/y of the center of star `index` (0 = nearest zero) on a metric's bar. */
export function starSlotCenter(metric: Metric, index: number, negative: boolean) {
  const row = METRIC_ROWS.findIndex((r) => r.metric === metric)
  const barLeft = TRACKER_BOX.left + 1 + PADDING.x
  const barTop = TRACKER_BOX.top + 1 + PADDING.top + row * (ROW_HEIGHT + ROW_GAP)
  const slot = negative ? TRACKER.zeroAfterSlot - 1 - index : TRACKER.zeroAfterSlot + index
  return { x: barLeft + (slot + 0.5) * SLOT_WIDTH, y: barTop + BAR_HEIGHT / 2 }
}

