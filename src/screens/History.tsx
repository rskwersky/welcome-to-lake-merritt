import { useEffect } from 'react'
import { Button } from '../components/Button'
import { historyTitle } from '../data/history'
import { useInView } from '../hooks/useInView'

// Figma screens "05 history / long" and "05 history / short".
// This is a normal scrolling page (not a <Stage>), so it reflows on phones.
// The sky gradient stretches over the whole page, like the tall Figma frames,
// and each paragraph fades up as it scrolls into view.

type HistoryProps = {
  paragraphs: string[]
  onPlay: () => void
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

export function History({ paragraphs, onPlay }: HistoryProps) {
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

        <article className="flex w-full flex-col items-center border border-ink bg-cream px-6 pt-[3px] pb-[22px] text-ink sm:pr-[76px] sm:pl-[69px]">
          {/* The title is an SVG of the Figma text, so it shows in Boucherie
              Cursive even though that font isn't installed. The alt text keeps
              it readable for screen readers and search. */}
          <h1 className="flex h-[156px] items-center">
            <img src="/assets/history/title.svg" alt={historyTitle} width={579} height={45} className="h-auto max-w-full" />
          </h1>
          {/* Figma's text box is a fixed 600px, 2px wider than the space inside
              the card's padding, so it may not shrink on desktop (or the lines
              would wrap in different places). On phones it fills the card. */}
          <div className="w-full space-y-[1lh] font-mono text-xl leading-[normal] sm:w-[600px] sm:shrink-0">

            {paragraphs.map((text, i) => (
              <FadeInParagraph key={i} text={text} />
            ))}
          </div>
        </article>

        <Button onClick={onPlay}>play game</Button>
      </main>
    </div>
  )
}
