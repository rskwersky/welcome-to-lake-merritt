import { STAR_PHOTOS, type MapStarId } from '../data/explore'
import { DROP_STEP } from './dropIn'

// One of explore mode's "places": a map star's photo as a little postcard
// with the place's name, slightly tilted (alternating, like photos laid on
// a table). Click or tap it for the full photo. Used by the desktop gallery
// (board/PlacesGallery.tsx) and the phone's (phone/PhoneBoard.tsx).

type PlacePostcardProps = {
  star: MapStarId
  name: string
  /** Its place in the row: sets the tilt and when it falls into place */
  index: number
  /** The first piece's turn to fall into place (later ones follow) */
  firstDrop: number
  width: number
  photoHeight: number
  onOpen: (star: MapStarId) => void
}

export function PlacePostcard({ star, name, index, firstDrop, width, photoHeight, onOpen }: PlacePostcardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(star)}
      aria-label={`Photo of ${name}`}
      className="shrink-0 snap-start animate-drop-in cursor-pointer rounded-[3px] bg-cream p-[6px] pb-[8px] text-left shadow-[-2px_3px_3px_rgba(0,0,0,0.22)] transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[-2px_7px_7px_rgba(0,0,0,0.2)] focus-visible:outline-3 focus-visible:outline-ink motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{ width, rotate: `${index % 2 ? 1.2 : -1.2}deg`, animationDelay: `${(firstDrop + index) * DROP_STEP}ms` }}
    >
      <img alt="" src={STAR_PHOTOS[star].photo} className="block w-full object-cover" style={{ height: photoHeight }} draggable={false} />
      <span className="mt-[6px] block font-mono text-[11px] leading-[1.15] text-black italic first-letter:uppercase">{name}</span>
    </button>
  )
}
