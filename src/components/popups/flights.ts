// Works out where each star in the metric-change popup should fly: from its
// spot in the popup to the next free slot on its metric's bar in the score
// tracker. Positions are measured on screen, then converted to stage px
// (the stage is scaled to fit the window).

import { pointsToStars, type Metric } from '../../data/gameRules'
import type { Effect } from '../../data/events'
import type { Metrics } from '../../game/state'
import { STAR, starSlotCenter } from '../board/trackerLayout'
import type { Flight } from './MetricChangePopup'

function toStage(rect: DOMRect) {
  const stage = document.querySelector('[data-stage]')!.getBoundingClientRect()
  const scale = stage.width / 1440
  return { x: (rect.left + rect.width / 2 - stage.left) / scale, y: (rect.top + rect.height / 2 - stage.top) / scale }
}

export function measureFlights(metrics: Metrics, effect: Effect): Flight[] {
  return [...document.querySelectorAll<HTMLElement>('[data-fly-star]')].map((el) => {
    const metric = el.dataset.flyStar as Metric
    const negative = el.dataset.negative === 'true'
    // Stars already on the bar (same direction) come first.
    const current = pointsToStars(metrics[metric])
    const already = Math.sign(current) === (negative ? -1 : 1) ? Math.floor(Math.abs(current)) : 0
    const slot = already + Number(el.dataset.index)
    const to = starSlotCenter(metric, slot, negative)

    // Aim at the star as it will look once it lands. If it ends up as a half
    // star, that half sits on the zero side of its slot (left for gold,
    // right for pink), so its middle is a quarter star's width off center.
    const after = Math.abs(pointsToStars(metrics[metric] + effect[metric]))
    const endsHalf = slot === Math.ceil(after) - 1 && after % 1 !== 0
    if (endsHalf) to.x += (negative ? 1 : -1) * (STAR.width / 4)

    return { from: toStage(el.getBoundingClientRect()), to, negative, half: el.dataset.half === 'true' }
  })
}
