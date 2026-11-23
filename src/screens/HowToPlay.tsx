import { useRef, type CSSProperties, type ReactNode, type WheelEvent } from 'react'
import { Button } from '../components/Button'
import { CharacterToken } from '../components/CharacterToken'
import { Stage } from '../components/Stage'
import type { CharacterId } from '../data/gameRules'
import { manualContents, manualHowToPlay, manualObjective } from '../data/manual'

// Figma screen "05 how to play (manual)": the game manual, opened flat like a
// fold-out brochure. The Figma frame is 3027px wide, more than twice the
// 1440px screen, so the pages scroll sideways. "continue" sits under the last
// page.
//
// How it's built:
//  • <Stage> scales the 1440×1024 window as usual. Inside it, a scroll box
//    holds a wide "canvas", and every picture sits at its Figma x/y on it.
//  • The text on pages 3–5 flows inside its page with even padding instead,
//    so it never runs close to the page edges.
//  • A normal mouse wheel scrolls up and down, which would do nothing here,
//    so we turn vertical wheel movement into sideways scrolling.
//  • The scroll box can be focused, so the arrow keys scroll it too, and
//    tabbing to "continue" scrolls it into view.
//  • Some small pictures (the event card stacks) use percentages of the
//    canvas, or container query units (cqw/cqh), exactly as Figma exports them.

const M = '/assets/manual'

// The pages run from x = 229 (cover's left edge) to x = 2771 (last page's
// right edge). The canvas ends the same 229px after the last page, so the
// margin is equal on both sides and you can't scroll past the manual.
// (Figma's frame is 3027px wide, which left extra room on the right.)
const MARGIN = 229.14

// Every inside page is the same size. (In Figma, pages 3 and 5 were a few px
// bigger, 514×699, so they stuck out past their neighbours.)
const PAGE_WIDTH = 510
const PAGE_HEIGHT = 694
const CANVAS_WIDTH = 2261.04 + 510 + MARGIN

const CHARACTER_ORDER: CharacterId[] = ['citizen', 'educator', 'environmentalist', 'protector', 'recreationist', 'organizer']

// ---------------------------------------------------------------------------
// Pieces used on several pages

/**
 * An SVG whose stroke pokes slightly outside its box. Figma exports these
 * with a wrapper pulled outward by a few % (negative inset) so the stroke
 * isn't clipped; the picture fills that wrapper.
 */
function Bleed({ inset, src }: { inset: string; src: string }) {
  return (
    <div className={`absolute ${inset}`}>
      <img alt="" src={`${M}/${src}`} className="block size-full max-w-none" />
    </div>
  )
}

/**
 * A manual page: paper fill, the same soft drop shadow on every page, and the
 * shading where the pages fold. Children are placed relative to the page.
 */
function Page({ left, top, width, height, fill, fold, children }: {
  left: number; top: number; width: number; height: number
  fill: string; fold: string; children?: ReactNode
}) {
  return (
    <div className={`absolute ${fill} ${PAGE_SHADOW}`} style={{ left, top, width, height }}>
      {/* The fold shading is a separate layer on top of the paper. */}
      <div className={`pointer-events-none absolute inset-0 ${fold}`} />
      {children}
    </div>
  )
}
// Inner shadows along the page edges, like a folded sheet of paper.
const FOLD_BOTH = 'shadow-[inset_12px_0px_19.8px_0px_rgba(0,0,0,0.25),inset_-12px_0px_19.5px_0px_rgba(0,0,0,0.25)]'
const PAGE_SHADOW = 'shadow-[0px_5px_4px_0px_rgba(0,0,0,0.3)]'
// Text padding inside pages 3–5: 40px from the sides, 36px from the top.
// That leaves 430px for text: just enough for the longest lines on page 3
// ("Decisions cost tokens:" is 22 characters × 19.2px = 422px).
const PAGE_TEXT = 'absolute inset-0 flex flex-col px-[40px] pt-[36px] text-ink-soft'

/** A tiny metrics card: three empty score bars with labels. */
function MiniMetricsCard({ className = 'absolute!', style }: { className?: string; style?: CSSProperties }) {
  const rows = [
    { bar: 'metric-environment.svg', label: 'environmental health', barTop: 9.5, labelTop: 24.23, barWidth: 126.09 },
    { bar: 'metric-reputation.svg', label: 'reputation', barTop: 37.54, labelTop: 52.26, barWidth: 126.09 },
    { bar: 'metric-accessibility.svg', label: 'social accessibility', barTop: 65.57, labelTop: 80.3, barWidth: 127.853 },
  ]
  return (
    <div className={`relative h-[95.111px] w-[141.312px] shrink-0 rounded-[5px] border border-ink-soft bg-cream ${className}`} style={style}>
      {rows.map((r) => (
        <div key={r.label}>
          {/* -1px: these offsets are measured from the card's outer edge, and the border is inside it */}
          <img alt="" src={`${M}/${r.bar}`} className="absolute h-[9.658px] max-w-none" style={{ left: 7.28, top: r.barTop - 1, width: r.barWidth }} />
          <p className="absolute h-[6.97px] w-[126.09px] font-mono text-[10px] leading-[0.94] text-ink-soft" style={{ left: 7.28, top: r.labelTop - 1 }}>
            {r.label}
          </p>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page 1: the cover

function Cover() {
  return (
    <>
      <Page left={MARGIN} top={165.01} width={509.604} height={693.99} fill="bg-sky-blue" fold="shadow-[inset_-12px_0px_19.8px_-1px_rgba(0,0,0,0.25)]" />
      {/* "LAKE", "MERRITT", canoe and pelican, placed as Figma exports them */}
      <div className="absolute inset-[31.31%_76.81%_35.95%_7.72%] flex items-center justify-center" style={{ containerType: 'size' }}>
        <div className="relative h-[hypot(13.5649cqw,64.5793cqh)] w-[hypot(86.4351cqw,-35.4207cqh)] flex-none rotate-[-16.35deg] overflow-hidden">
          <img alt="" src={`${M}/cover-lake.png`} className="absolute top-0 left-0 h-[119.39%] w-full max-w-none" />
        </div>
      </div>
      <div className="absolute inset-[36.94%_83.01%_41.94%_7.63%] flex items-center justify-center" style={{ containerType: 'size' }}>
        <div className="relative h-[hypot(15.0947cqw,67.3775cqh)] w-[hypot(84.9053cqw,-32.6225cqh)] flex-none rotate-[-16.35deg] overflow-hidden">
          <img alt="" src={`${M}/cover-merritt.png`} className="absolute top-[-23.44%] left-[-11.21%] h-[123.44%] w-[117.16%] max-w-none" />
        </div>
      </div>
      <div className="absolute inset-[30.59%_78.99%_59.19%_15.45%] flex items-center justify-center" style={{ containerType: 'size' }}>
        <div className="h-[hypot(96.6741cqw,-9.16201cqh)] w-[hypot(-3.32585cqw,-90.838cqh)] flex-none rotate-[-93.37deg]">
          <img alt="" src={`${M}/cover-canoe.svg`} className="block size-full max-w-none" />
        </div>
      </div>
      <div className="absolute inset-[54.32%_77.79%_34.9%_16.44%] flex items-center justify-center" style={{ containerType: 'size' }}>
        <div className="h-[hypot(-6.9272cqw,79.7862cqh)] w-[hypot(93.0728cqw,20.2138cqh)] flex-none rotate-[7.82deg]">
          <img alt="" src={`${M}/cover-bird.png`} className="size-full max-w-none" />
        </div>
      </div>
      <p className="absolute top-[743.48px] left-[380.45px] font-script text-[48px] leading-script whitespace-nowrap text-ink-soft">game manual</p>
      <div className="absolute flex h-[200.733px] w-[249.84px] items-center justify-center" style={{ left: 247.81, top: 292.61 }}>
        <p className="flex-none rotate-[-25.5deg] font-script text-[48px] leading-normal whitespace-nowrap text-ink-soft">greetings from</p>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Page 2: what's in the box

/**
 * The little event card lying on a postcard (page 2, and again on page 4).
 * Its pieces are placed in % of the whole canvas, as Figma exports them, so
 * the wrapper covers the canvas. On page 4 the same picture appears ~92% the
 * size, so we move and shrink it with a transform instead of repeating it.
 */
function EventCardStack({ transform }: { transform?: string }) {
  const cq = { containerType: 'size' } as const
  const bar = (inset: string, src: string) => (
    <div className={`absolute ${inset} flex items-center justify-center`} style={cq}>
      <div className="h-[100cqw] w-[100cqh] flex-none -rotate-90">
        <div className="relative size-full">
          <Bleed inset="inset-[-0.44%_-3.14%]" src={src} />
        </div>
      </div>
    </div>
  )
  return (
    <div className="pointer-events-none absolute inset-0" style={transform ? { transform, transformOrigin: STACK_CENTER } : undefined}>
      {/* the postcard underneath */}
      <div className="absolute inset-[70.65%_59.86%_21.6%_35.95%] rounded-[5px] border border-ink-soft bg-cream" />
      <div className="absolute inset-[71.27%_60.07%_22.22%_36.17%] flex items-center justify-center" style={cq}>
        <div className="h-[100cqw] w-[100cqh] flex-none -rotate-90">
          <div className="relative size-full">
            <Bleed inset="inset-[-0.44%_-0.75%]" src="eventcard-outline.svg" />
          </div>
        </div>
      </div>
      <div className="absolute inset-[71.61%_60.35%_22.6%_36.67%] flex items-center justify-center" style={cq}>
        <div className="h-[hypot(10.3522cqw,68.4886cqh)] w-[hypot(89.6478cqw,-31.5114cqh)] relative flex-none rotate-[-13.03deg] skew-x-[-0.11deg] overflow-hidden">
          <img alt="" src={`${M}/merritt.png`} className="absolute top-0 left-0 h-[127.47%] w-full max-w-none" />
        </div>
      </div>
      <div className="absolute inset-[71.95%_61.64%_23.74%_36.44%] flex items-center justify-center" style={cq}>
        <div className="h-[hypot(12.8285cqw,73.4738cqh)] w-[hypot(87.1715cqw,-26.5262cqh)] flex-none rotate-[-13.03deg] skew-x-[-0.11deg]">
          <img alt="" src={`${M}/lake.png`} className="size-full max-w-none" />
        </div>
      </div>
      <div className="absolute inset-[72.4%_61.2%_26.42%_38.12%] flex items-center justify-center" style={cq}>
        <div className="h-[100cqw] w-[100cqh] flex-none rotate-90">
          <img alt="" src={`${M}/canoe.svg`} className="block size-full max-w-none" />
        </div>
      </div>
      <div className="absolute inset-[75.44%_60.63%_23.18%_38.61%] flex items-center justify-center" style={cq}>
        <div className="h-[hypot(-5.5863cqw,83.2357cqh)] w-[hypot(94.4137cqw,16.7643cqh)] flex-none rotate-[6.26deg] skew-x-[0.05deg]">
          <img alt="" src={`${M}/bird.png`} className="size-full max-w-none" />
        </div>
      </div>
      {/* the event card on top */}
      <div className="absolute inset-[67.73%_62.18%_24.52%_33.64%] rounded-[5px] border border-ink-soft bg-cream" />
      {bar('inset-[69.36%_62.37%_29.09%_33.87%]', 'eventcard-bar-1.svg')}
      {bar('inset-[71.27%_62.37%_27.17%_33.87%]', 'eventcard-bar-2.svg')}
      {bar('inset-[73.19%_62.37%_25.26%_33.87%]', 'eventcard-bar-3.svg')}
      <p className="absolute inset-[68.01%_63.68%_31.02%_35.13%] font-script text-[10px] leading-none whitespace-nowrap text-ink-soft">Event Card</p>
    </div>
  )
}
// The center of the event card on page 2. Page 4's copy is scaled around this
// point, then moved so its center lands at (1973.7, 757.3): Figma's spot,
// 29px lower to leave room for step 2 now that the text has more padding.
const STACK_CENTER = '1081.55px 733.3px'
const PAGE_4_STACK = 'translate(892.18px, 24px) scale(0.923)'

function ContentsPage() {
  const label = 'absolute font-mono text-[24px] leading-none whitespace-nowrap text-ink-soft'
  return (
    <>
      <Page left={738.75} top={165.01} width={PAGE_WIDTH} height={PAGE_HEIGHT} fill="bg-cream" fold={FOLD_BOTH} />

      <p className="absolute top-[296.92px] left-[1074.56px] w-[143.06px] font-mono text-[24px] leading-none text-black">{manualContents.metricsCard}</p>
      <MiniMetricsCard style={{ left: 1073.88, top: 353.74 }} />

      {/* the board, slightly tilted */}
      <div className="absolute flex size-[288.486px] items-center justify-center" style={{ left: 766.34, top: 196.94 }}>
        <div className="bg-board size-[286.617px] flex-none rotate-[-0.37deg] border border-ink-soft" />
      </div>
      <div className="absolute flex size-[282.206px] items-center justify-center" style={{ left: 769.48, top: 200.08 }}>
        <img alt="" src={`${M}/board-map.png`} width={280.377} height={280.377} className="block size-[280.377px] max-w-none flex-none rotate-[-0.37deg]" />
      </div>

      <p className={label} style={{ left: 767.22, top: 503.76 }}>{manualContents.characters}</p>
      <div className="absolute grid w-[160.5px] grid-cols-3 gap-[3px]" style={{ left: 766.21, top: 536.57 }}>
        {CHARACTER_ORDER.map((id) => (
          <CharacterToken key={id} id={id} />
        ))}
      </div>
      {/* three cheat sheets */}
      <img alt="" src={`${M}/cheat-sheet-a.svg`} className="absolute size-[64.431px] max-w-none" style={{ left: 1101.62, top: 572.93 }} />
      <img alt="" src={`${M}/cheat-sheet-a.svg`} className="absolute size-[64.431px] max-w-none" style={{ left: 1056.45, top: 539.5 }} />
      <img alt="" src={`${M}/cheat-sheet-b.svg`} className="absolute size-[64.431px] max-w-none" style={{ left: 1018.63, top: 559.8 }} />

      <p className={label} style={{ left: 767.22, top: 687.18 }}>{manualContents.tokens}</p>
      <img alt="" src={`${M}/token-social.svg`} className="absolute h-[55px] w-[56px] max-w-none" style={{ left: 766.21, top: 715.14 }} />
      <img alt="" src={`${M}/token-political.svg`} className="absolute size-[55px] max-w-none" style={{ left: 841.17, top: 715.71 }} />
      <img alt="" src={`${M}/token-economic.svg`} className="absolute h-[55px] w-[60px] max-w-none" style={{ left: 915.14, top: 714.84 }} />
      <p className={label} style={{ left: 770.5, top: 774.74 }}>{manualContents.tokenCounts.social}</p>
      <p className={label} style={{ left: 850.68, top: 774.74 }}>{manualContents.tokenCounts.political}</p>
      <p className={label} style={{ left: 927.28, top: 774.74 }}>{manualContents.tokenCounts.economic}</p>

      <EventCardStack />
    </>
  )
}

// ---------------------------------------------------------------------------
// Page 3: objective

const TOKEN_ICON = {
  political: { src: 'token-political-2.svg', width: 39, height: 37.556 },
  economic: { src: 'token-economic-2.svg', width: 42, height: 39 },
  social: { src: 'token-social-2.svg', width: 39, height: 38 },
}

function ObjectivePage() {
  const o = manualObjective
  return (
    <Page left={1243.27} top={165.01} width={PAGE_WIDTH} height={PAGE_HEIGHT} fill="bg-manual-page" fold={FOLD_BOTH}>
      <div className={PAGE_TEXT}>
        <h2 className="font-script text-[48px] leading-none">{o.title}</h2>
        <div className="mt-[25px] flex flex-col gap-[32px] font-mono text-[32px]">
          <p className="leading-[32px]">{o.goal}</p>
          <div className="flex flex-col gap-[5px]">
            <p className="leading-[32px]">{o.costsIntro}</p>
            <ul>
              {o.tokens.map((t) => (
                // Each row is 44px tall: a token picture centered 38.7px from the
                // left edge, then the word starting 4 characters in (76.8px).
                <li key={t} className="relative h-[44px] pl-[76.8px] leading-[44px]">
                  <img
                    alt=""
                    src={`${M}/${TOKEN_ICON[t].src}`}
                    className="absolute top-1/2 left-[38.7px] max-w-none -translate-1/2"
                    style={{ width: TOKEN_ICON[t].width, height: TOKEN_ICON[t].height }}
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="leading-[32px]">{o.metricsIntro}</p>
            <ul className="list-disc pl-[39px] leading-[32px] italic">
              {o.metrics.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Page>
  )
}

// ---------------------------------------------------------------------------
// Pages 4 and 5: how to play

/** One numbered step. Figma: 32px Courier, text indented 38px, with the number hanging in that space. */
function Step({ n, children, className = '' }: { n: number; children: ReactNode; className?: string }) {
  return (
    <ol start={n} className={`list-decimal font-mono text-[32px] leading-none text-ink-soft ${className}`}>
      <li className="ms-[38px]">{children}</li>
    </ol>
  )
}

function HowToPlayPages() {
  const s = manualHowToPlay.steps
  return (
    <>
      <Page left={1751.04} top={165.01} width={PAGE_WIDTH} height={PAGE_HEIGHT} fill="bg-cream" fold={FOLD_BOTH}>
        <div className={PAGE_TEXT}>
          <h2 className="font-script text-[48px] leading-none">{manualHowToPlay.title}</h2>
          <Step n={1} className="mt-[19px]">{s[0]}</Step>
          <div className="mt-[28px] flex justify-center gap-[11px]">
            {CHARACTER_ORDER.map((id) => (
              <CharacterToken key={id} id={id} />
            ))}
          </div>
          <Step n={2} className="mt-[31px]">{s[1]}</Step>
        </div>
      </Page>
      <EventCardStack transform={PAGE_4_STACK} />

      <Page left={2261.04} top={165.01} width={PAGE_WIDTH} height={PAGE_HEIGHT} fill="bg-manual-page" fold="shadow-[inset_12px_0px_19.8px_0px_rgba(0,0,0,0.25)]">
        <div className={PAGE_TEXT}>
          <Step n={3}>{s[2]}</Step>
          <MiniMetricsCard className="mt-[24px] self-center" />
          <Step n={4} className="mt-[32px]">{s[3]}</Step>
          <Step n={5} className="mt-[32px]">{s[4]}</Step>
        </div>
      </Page>
    </>
  )
}

/**
 * Just the three rule pages (Objective, How to play, steps 3 to 5), for
 * explore mode's "open the manual". They sit at their canvas positions
 * (x 1243 to 2771, y 165 to 864), so the caller moves and scales this box.
 */
export function ManualPages() {
  return (
    <div className="relative h-[1024px] overflow-clip" style={{ width: CANVAS_WIDTH }}>
      <ObjectivePage />
      <HowToPlayPages />
    </div>
  )
}

// ---------------------------------------------------------------------------

type HowToPlayProps = {
  onContinue: () => void
}

export function HowToPlay({ onContinue }: HowToPlayProps) {
  const scroller = useRef<HTMLDivElement>(null)

  // Turn up/down wheel movement into sideways scrolling. Trackpads that
  // already scroll sideways (deltaX) are left alone.
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    const el = scroller.current
    if (!el || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
    el.scrollLeft += e.deltaY
  }

  return (
    <Stage className="bg-sky">
      <div
        ref={scroller}
        onWheel={onWheel}
        tabIndex={0}
        role="region"
        aria-label="Game manual. Scroll sideways to read all the pages."
        // The scrollbar is hidden: the page cut off at the right edge shows
        // there's more. overscroll-x-none stops the "rubber band" bounce past
        // the ends (and the browser's swipe-back gesture). Focus outline is
        // inset so it isn't clipped.
        className="absolute inset-0 overflow-x-auto overflow-y-hidden overscroll-x-none [scrollbar-width:none] focus-visible:outline-3 focus-visible:-outline-offset-4 focus-visible:outline-ink [&::-webkit-scrollbar]:hidden"
      >
        {/* No background of its own: the window's sky shows through, so it
            matches above and below the stage on tall or wide windows. */}
        {/* overflow-clip: page 4's shrunken card stack still has a full-size
            (invisible) box, which would otherwise make the canvas scroll wider. */}
        <div className="relative h-[1024px] overflow-clip" style={{ width: CANVAS_WIDTH }}>
          {/* Listed bottom to top, in Figma's layer order (page 2 overlaps page 3's edge). */}
          <Cover />
          <ObjectivePage />
          <ContentsPage />
          <HowToPlayPages />
          {/* centered under the last page */}
          <div className="absolute top-[910px] left-[2516.04px] -translate-x-1/2">
            <Button width={202} onClick={onContinue}>
              continue
            </Button>
          </div>
        </div>
      </div>
    </Stage>
  )
}
