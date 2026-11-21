import { useEffect } from 'react'
import { Button } from '../components/Button'
import { historyTitle } from '../data/history'
import { useInView } from '../hooks/useInView'

// Figma screens "04 history / short" (in the intro) and "04 history / long"
// (opened later from the game menu, with a "return to game" button).
// This is a normal scrolling page (not a <Stage>), so it reflows on phones.
// The sky gradient stretches over the whole page, like the tall Figma frames,
// and each paragraph fades up as it scrolls into view.

type HistoryProps = {
  paragraphs: string[]
  /** The button under the card: "continue" in the intro, "return to game" from the menu */
  button: { label: string; width: number; onClick: () => void }
}

// Turns the *italic* and ***bold italic*** markers in src/data/history.ts
// into real <em>/<strong> elements. Splitting on a regex with a capture group
// keeps the matched pieces in the result, so we can style them.
function Emphasis({ text }: { text: string }) {
  return text.split(/(\*\*\*[^*]+\*\*\*|\*[^*]+\*)/).map((part, i) => {
    if (part.startsWith('***')) return <strong key={i} className="font-bold italic">{part.slice(3, -3)}</strong>
    if (part.startsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
    return part
  })
}

function FadeInParagraph({ text }: { text: string }) {
  const [ref, inView] = useInView<HTMLParagraphElement>()
  return (
    <p
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <Emphasis text={text} />
    </p>
  )
}

export function History({ paragraphs, button }: HistoryProps) {
  // Start at the top when this screen opens. The braces matter: an arrow
  // function without them returns whatever scrollTo returns, and React treats
  // anything an effect returns as a cleanup function. Some browsers' scrollTo
  // returns a Promise, so React would crash trying to "clean it up".
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="bg-sky-page min-h-full">
      {/* Figma: a 745px column starting 324px down, with 35px between the postcard,
          the history card, and the button. The column shrinks to fit on phones. */}
      <main className="mx-auto flex max-w-[745px] flex-col items-center gap-[35px] px-4 pt-16 pb-24 md:px-0 md:pt-[324px] md:pb-[226px]">
        {/* Figma wraps the postcard in a container with 10px of padding.
            The image includes the card's drop shadow, which hangs 8px below
            the card itself; the negative margin takes it back out of the layout. */}
        <div className="max-w-full p-[10px]">
          <img
            src="/assets/postcard/back.svg"
            alt="Did you know: Lake Merritt in Oakland, California is the oldest wildlife refuge in North America?"
            width={583}
            height={364}
            className="-mb-2 h-auto w-[583px] max-w-full"
          />
        </div>

        <article className="flex w-full flex-col items-center rounded-[5px] border-2 border-ink bg-cream px-6 pt-[3px] pb-[22px] text-ink sm:pr-[76px] sm:pl-[69px]">
          {/* Figma: the title's box is 156px tall (Boucherie Cursive has very
              tall line spacing). We fix that height and center the text, so the
              body starts in the same place even before the font has loaded.
              On phones the 64px title wouldn't fit, so it shrinks and may wrap. */}
          <h1 className="flex min-h-[156px] items-center text-center font-script text-[40px] leading-tight sm:text-[64px] sm:whitespace-nowrap">
            {historyTitle}
          </h1>
          {/* Figma's text box is a fixed 600px, 2px wider than the space inside
              the card's padding, so it may not shrink on desktop (or the lines
              would wrap in different places). On phones it fills the card.
              Line height is 22px: Figma's "auto" for Courier Prime at 20px.
              (The browser's "normal" is 22.5px, which adds up over a long page.) */}
          <div className="w-full space-y-[1lh] font-mono text-xl leading-[22px] sm:w-[600px] sm:shrink-0">

            {paragraphs.map((text, i) => (
              <FadeInParagraph key={i} text={text} />
            ))}
          </div>
        </article>

        <Button width={button.width} onClick={button.onClick}>
          {button.label}
        </Button>
      </main>
    </div>
  )
}
