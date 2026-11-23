// Works out where each star in the metric-change popup should fly: from its
// spot in the popup to the next free slot on its metric's bar in the score
// tracker.
//
// Everything is measured on screen, then converted to the frame's own px:
// the desktop stage (1440 wide) or the phone frame (390 wide). Both are
// scaled to fit the window, and each says its design width in
// `data-width`. Measuring (instead of using fixed numbers) means the same
// code works wherever the tracker is drawn and however big it is.

import { TRACKER, pointsToStars, type Metric } from '../../data/gameRules'
import type { Effect } from '../../data/events'
import type { Metrics } from '../../game/state'
import { BAR_WIDTH, STAR, STAR_ASPECT } from '../board/trackerLayout'
import type { Flight } from './MetricChangePopup'

/** The frame the stars fly in, and how much it's scaled on screen. */
function measureFrame() {
  const el = document.querySelector<HTMLElement>('[data-stage]')!
  const rect = el.getBoundingClientRect()
  return { rect, scale: rect.width / Number(el.dataset.width ?? 1440) }
}

export function measureFlights(metrics: Metrics, effect: Effect): Flight[] {
  const frame = measureFrame()
  // A screen rectangle, in frame px
  const inFrame = (r: DOMRect) => ({
    left: (r.left - frame.rect.left) / frame.scale,
    top: (r.top - frame.rect.top) / frame.scale,
    width: r.width / frame.scale,
    height: r.height / frame.scale,
  })

  return [...document.querySelectorAll<HTMLElement>('[data-fly-star]')].map((el) => {
    const metric = el.dataset.flyStar as Metric
    const negative = el.dataset.negative === 'true'
    const half = el.dataset.half === 'true'

    // Where it starts: the popup star. Its height gives its size (a half
    // star is as tall as a whole one, so height works for both).
    const start = inFrame(el.getBoundingClientRect())
    const fromWidth = start.height / STAR_ASPECT

    // Where it lands: the right slot on its metric's bar. Stars already on
    // the bar (same direction) come first.
    const bar = inFrame(document.querySelector(`[data-tracker-bar="${metric}"]`)!.getBoundingClientRect())
    const slotWidth = bar.width / TRACKER.slots
    const toWidth = (STAR.width * bar.width) / BAR_WIDTH // tracker stars grow with the bar
    const current = pointsToStars(metrics[metric])
    const already = Math.sign(current) === (negative ? -1 : 1) ? Math.floor(Math.abs(current)) : 0
    const slot = already + Number(el.dataset.index)
    const filled = negative ? TRACKER.zeroAfterSlot - 1 - slot : TRACKER.zeroAfterSlot + slot
    const to = { x: bar.left + (filled + 0.5) * slotWidth, y: bar.top + bar.height / 2 }

    // Aim at the star as it will look once it lands. If it ends up as a half
    // star, that half sits on the zero side of its slot (left for gold,
    // right for pink), so its middle is a quarter star's width off center.
    const after = Math.abs(pointsToStars(metrics[metric] + effect[metric]))
    const endsHalf = slot === Math.ceil(after) - 1 && after % 1 !== 0
    if (endsHalf) to.x += (negative ? 1 : -1) * (toWidth / 4)

    return { from: { x: start.left + start.width / 2, y: start.top + start.height / 2 }, to, fromWidth, toWidth, negative, half }
  })
}
