import { useId } from 'react'

// Every rating star in the game (score tracker, metric popup, flying stars)
// is drawn by this one component, from one shape, so they all match.
//
// Why not the exported SVG pictures: the small tracker star stretched to
// popup size had an outline 3× thicker than the popup's own star, and the
// line along a half star's cut edge was drawn separately, at yet another
// thickness. Here the outline is given in screen pixels, whatever the size.
//
// The outline is drawn *inside* the star's edge (like Figma's "inside"
// stroke): the stroke is twice as thick and clipped to the star, so the
// star's size never changes with its outline.

/** The star's shape (Figma "Star 9"), in a 30.71 × 29.31 box. */
const SHAPE =
  'M14.449 0.581153C14.8065 -0.193718 15.9077 -0.193717 16.2652 0.581154L20.055 8.79756C20.2007 9.11336 20.5 9.33081 20.8453 9.37175L29.8307 10.4371C30.6781 10.5376 31.0184 11.585 30.3919 12.1643L23.7488 18.3077C23.4935 18.5438 23.3792 18.8957 23.4469 19.2368L25.2103 28.1116C25.3767 28.9486 24.4857 29.5959 23.7411 29.1791L15.8455 24.7595C15.5421 24.5897 15.1721 24.5897 14.8687 24.7595L6.97312 29.1791C6.22851 29.5959 5.33755 28.9486 5.50385 28.1116L7.26727 19.2368C7.33505 18.8957 7.22073 18.5438 6.9654 18.3077L0.322265 12.1643C-0.304235 11.585 0.0360827 10.5376 0.883476 10.4371L9.86887 9.37175C10.2142 9.3308 10.5135 9.11336 10.6592 8.79756L14.449 0.581153Z'
const W = 30.7142
const H = 29.3091
const MID = W / 2
/** Where the cut edge of a half star ends: the notch between the two bottom points */
const NOTCH = 24.65

type StarProps = {
  /** Width of a whole star in px (a half star is half as wide) */
  width: number
  /** Pink (the metric went down) instead of gold */
  negative?: boolean
  /** Only the half nearest zero: the left half when gold, the right half when pink */
  half?: boolean
  /** Outline thickness in px */
  outline?: number
}

export function Star({ width, negative = false, half = false, outline = 1 }: StarProps) {
  const clip = useId()
  // The outline in the shape's own units (they get scaled to `width` px)
  const stroke = (outline * W) / width
  // A half star shows only part of the drawing, by narrowing the view box
  const viewBox = half ? `${negative ? MID : 0} 0 ${MID} ${H}` : `0 0 ${W} ${H}`
  return (
    <svg width={half ? width / 2 : width} height={(width * H) / W} viewBox={viewBox} className="block overflow-hidden" aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <path d={SHAPE} />
        </clipPath>
      </defs>
      <path d={SHAPE} className={negative ? 'fill-star-down' : 'fill-star-up'} />
      <g clipPath={`url(#${clip})`} className="stroke-ink-soft" fill="none">
        <path d={SHAPE} strokeWidth={stroke * 2} />
        {/* The cut edge: centered on the view box's edge, so the half that
            shows is exactly `outline` thick, like the rest of the outline */}
        {half && <line x1={MID} y1={0} x2={MID} y2={NOTCH} strokeWidth={stroke * 2} />}
      </g>
    </svg>
  )
}
