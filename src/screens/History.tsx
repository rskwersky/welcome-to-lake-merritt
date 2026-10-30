import { useEffect } from 'react'
import { Button } from '../components/Button'
import { historyTitle } from '../data/history'
import { useInView } from '../hooks/useInView'

// Figma screens "05 history / long" and "05 history / short".
// This is a normal scrolling page (not a <Stage>), so it reflows on phones.
// The sky stays fixed behind the content, and each paragraph fades up as it
// scrolls into view.

type HistoryProps = {
  paragraphs: string[]
  onPlay: () => void
  onBack: () => void
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
      {text}
    </p>
  )
}

export function History({ paragraphs, onPlay, onBack }: HistoryProps) {
  // Start at the top when this screen opens
  useEffect(() => window.scrollTo(0, 0), [])

  return (
    <div className="relative min-h-full">
      {/* Fixed sky behind everything (works on mobile, unlike background-attachment: fixed) */}
      <div aria-hidden className="bg-sky fixed inset-0 -z-10" />

      <main className="mx-auto flex max-w-[745px] flex-col items-center gap-10 px-4 py-16">
        <img
          src="/assets/postcard/back.png"
          alt="Did you know: Lake Merritt in Oakland, California is the oldest wildlife refuge in North America"
          className="w-full max-w-[583px]"
        />

        <article className="w-full rounded-xl border border-ink/20 bg-cream px-6 py-12 shadow-lg sm:px-[72px]">
          <h1 className="mb-10 text-center font-script text-5xl text-ink sm:text-6xl">
            {historyTitle}
          </h1>
          <div className="space-y-6 font-mono text-lg leading-relaxed text-ink">
            {paragraphs.map((text, i) => (
              <FadeInParagraph key={i} text={text} />
            ))}
          </div>
        </article>

        <div className="flex flex-wrap justify-center gap-6 pb-8">
          <Button onClick={onBack}>back</Button>
          <Button onClick={onPlay}>play game</Button>
        </div>
      </main>
    </div>
  )
}
