import { useSyncExternalStore } from 'react'

// Should the game use its phone layout? Yes when the screen is held upright
// (taller than wide) and isn't a big monitor: phones, and tablets in
// portrait. A 1440 × 1024 board squeezed into a tall narrow screen would
// shrink its 12px text to about 4px, so those screens get a column layout
// instead (Figma "6b · mobile hi-fi"). Landscape tablets keep the desktop
// board, which fits them well.
//
// It updates live: turn a tablet sideways and the layout switches.

const QUERY = '(orientation: portrait) and (max-width: 1099px)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

export function usePhoneLayout(): boolean {
  // useSyncExternalStore: React's way to read something that lives outside
  // React (here, the browser's media query) and re-render when it changes.
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches)
}
