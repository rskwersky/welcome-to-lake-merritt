import { STAR_PHOTOS, type MapStarId } from '../../data/explore'
import { ManualPages } from '../../screens/HowToPlay'
import { SmallButton } from '../SmallButton'

// The popups that open over the board (explore mode and the menu).
// All of them close by clicking outside (the dark overlay) or with Esc; the
// screen handles that.

/** A map star's photo postcard (Figma "10 explore / star – …"). */
export function PhotoPopup({ star }: { star: MapStarId }) {
  const { photo, caption } = STAR_PHOTOS[star]
  return (
    // Two layers: the outer one centers the photo (translate -50%), the inner
    // one plays the pop-in animation. The animation also uses `translate`, so
    // on one element it would replace the centering until it finished, and
    // the photo would start half a screen too low and then jump.
    // (The stage's middle is y 512; Figma's popups are centered a bit lower.)
    <div className="absolute left-[357.59px] -translate-y-1/2" style={{ top: 521.6 }}>
      <figure
        role="dialog"
        aria-label={caption}
        className="w-[721.79px] animate-pop-in rounded-[3px] bg-cream px-[17px] pt-[19.14px] pb-[27px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] motion-reduce:animate-none"
      >
        <img alt="" src={photo} className="block w-[687.2px] max-w-none" />
        <figcaption className="mt-[17.6px] px-[9.6px] font-mono text-[20px] leading-none text-black italic">{caption}</figcaption>
      </figure>
    </div>
  )
}

/**
 * "Start a new game?" (Figma "10 explore / new game confirmation"): the blue
 * postcard with two small buttons. Restart keeps the same players and
 * characters (they can change them); return to game changes nothing.
 */
export function NewGameConfirm({ onRestart, onCancel }: { onRestart: () => void; onCancel: () => void }) {
  return (
    // Centered by the outer layer, animated by the inner one (see PhotoPopup)
    <div className="absolute top-1/2 left-1/2 -translate-1/2">
      <div role="alertdialog" aria-labelledby="new-game-title" className="relative h-[356px] w-[574.64px] animate-pop-in drop-shadow-[0_4px_2px_rgba(0,0,0,0.25)] motion-reduce:animate-none">
        <img
          alt=""
          src="/assets/player-count-card.svg"
          className="absolute top-1/2 left-1/2 h-[574.638px] w-[356px] max-w-none -translate-1/2 rotate-90"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[26px]">
          <p id="new-game-title" className="font-mono text-[32px] text-black italic">
            Start a new game?
          </p>
          <div className="flex gap-[11px]">
            <SmallButton width={195} onClick={onRestart}>
              restart game
            </SmallButton>
            <SmallButton width={195} onClick={onCancel} autoFocus>
              return to game
            </SmallButton>
          </div>
        </div>
        <img alt="" src="/assets/overview/bird.png" className="absolute right-[42px] bottom-[34px] w-[62px] rotate-[6deg]" />
      </div>
    </div>
  )
}

/**
 * The manual opened on the board (Figma "10 explore / learn more open"): the
 * three rule pages from "how to play", at 68.4% size. They're drawn on the
 * manual screen's canvas at x 1243 to 2771, so we slide that canvas left and
 * shrink it into a 1048px window.
 */
export function ManualPopup() {
  const scale = 1048 / (2771.04 - 1243.27)
  return (
    <div role="dialog" aria-label="Game manual" className="absolute animate-pop-in overflow-hidden motion-reduce:animate-none" style={{ left: 177.81, top: 199.71, width: 1048, height: 699 * scale + 8 }}>
      <div className="origin-top-left" style={{ transform: `scale(${scale}) translate(${-1243.27}px, ${-165.01}px)` }}>
        <ManualPages />
      </div>
    </div>
  )
}

/**
 * What the city bank is for (play mode: click the city bank box). Sits
 * next to the box, in the same style.
 */
export function CityBankInfo() {
  return (
    <div className="absolute -translate-y-1/2" style={{ left: 655, top: 512 }}>
      <div role="dialog" aria-labelledby="city-bank-title" className="w-[480px] animate-pop-in rounded-[7px] border border-black bg-cream px-[28px] pt-[24px] pb-[28px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] motion-reduce:animate-none">
        <h2 id="city-bank-title" className="font-mono text-[30px] leading-none text-ink italic">
          city bank
        </h2>
        <div className="mt-[16px] flex flex-col gap-[12px] font-mono text-[18px] leading-[1.3] text-ink-soft">
          <p>The city bank holds the tokens of the characters nobody is playing, so a smaller group has as many tokens to work with as six players.</p>
          <p>The group can only use a token type from the city bank once every player has used up their own tokens of that type.</p>
          <p>Like everyone else’s tokens, it refills every five rounds.</p>
        </div>
      </div>
    </div>
  )
}
