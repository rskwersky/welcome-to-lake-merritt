import { useState } from 'react'
import { MAP_STARS, type MapStarId } from '../../data/explore'
import { PlacePostcard } from '../PlacePostcard'
import { ArrowButton } from '../Tip'

// Explore mode's "places" on the desktop board: the six map stars' photos
// as postcards, three at a time, in a carousel at the bottom of the table.
// The arrows slide to the other three. A page always shows whole
// postcards, never a cut-off one.
//
// Why here: the board is tilted, so its bottom edge slopes from y 942 on
// the left to 845 on the right. Only the right-hand part of the bottom has
// room for postcards below the board without covering it.
//
// Click a postcard for its photo, just like clicking its star on the map.
// (The phone has the same postcards in a row you swipe: PhoneBoard.tsx.)

const POSTCARD = { width: 112, photoHeight: 66, gap: 12 }
const PER_PAGE = 3
const PAGES = Math.ceil(MAP_STARS.length / PER_PAGE)
const PAGE_WIDTH = PER_PAGE * POSTCARD.width + (PER_PAGE - 1) * POSTCARD.gap
/** Where the carousel's window sits (stage px) */
const WINDOW = { left: 762, top: 896 }

export function PlacesGallery({ onOpen }: { onOpen: (star: MapStarId) => void }) {
  const [page, setPage] = useState(0)

  return (
    <section aria-label="Places" aria-roledescription="carousel" className="absolute z-20" style={{ left: WINDOW.left, top: WINDOW.top }}>
      {/* The window: shows one page. `overflow-x: clip` hides the other page
          side to side, while lifted postcards can still rise above it. */}
      <div className="overflow-x-clip px-[4px]" style={{ width: PAGE_WIDTH + 8 }}>
        <div
          className="flex items-end transition-[translate] duration-500 ease-[cubic-bezier(0.3,1.2,0.4,1)] motion-reduce:transition-none"
          // One page further along per arrow click: a page's width plus the gap after it
          style={{ gap: POSTCARD.gap, translate: `${-page * (PAGE_WIDTH + POSTCARD.gap)}px 0` }}
        >
          {MAP_STARS.map((star, i) => {
            const onPage = Math.floor(i / PER_PAGE) === page
            return (
              // Postcards on the other page can't be reached by Tab while hidden
              <div key={star.id} inert={!onPage} className="shrink-0">
                <PlacePostcard star={star.id} name={star.name} index={i} firstDrop={8} width={POSTCARD.width} photoHeight={POSTCARD.photoHeight} onOpen={onOpen} />
              </div>
            )
          })}
        </div>
      </div>

      {/* The arrows, either side, about halfway down the postcards */}
      {page > 0 && (
        <div className="absolute top-[40px] -left-[44px] rotate-180">
          <ArrowButton onClick={() => setPage(page - 1)} label="Previous places" />
        </div>
      )}
      {page < PAGES - 1 && (
        <div className="absolute top-[40px] -right-[44px]">
          <ArrowButton onClick={() => setPage(page + 1)} label="More places" />
        </div>
      )}
    </section>
  )
}
