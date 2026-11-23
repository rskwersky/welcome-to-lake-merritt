import { manualHowToPlay, manualObjective } from '../../data/manual'
import { TokenIcon } from '../TokenIcon'
import { Sheet } from './Sheet'

// The game manual on a phone: the "how to play" rules as one scrolling
// sheet, from the same words as the desktop manual (src/data/manual.ts).
// Desktop draws them as illustrated pages side by side, far too wide for a
// phone; here they're a simple column you scroll down. Opened from the menu
// (and from explore mode's top bar). ✕, tapping outside or Esc closes it.

export function PhoneManual({ onClose }: { onClose: () => void }) {
  const heading = 'font-mono text-[20px] leading-none text-ink italic'
  return (
    <Sheet labelledBy="manual-title" onClose={onClose}>
      <h2 id="manual-title" className="text-center font-script text-[40px] leading-none text-ink-soft">
        How to Play
      </h2>

      <section className="mt-[24px] font-mono text-[15px] leading-[1.3] text-ink-soft">
        <h3 className={heading}>{manualObjective.title.replace(':', '')}</h3>
        <p className="mt-[8px]">{manualObjective.goal}</p>

        <p className="mt-[14px]">{manualObjective.costsIntro}</p>
        <ul className="mt-[8px] flex gap-[18px]">
          {manualObjective.tokens.map((t) => (
            <li key={t} className="flex items-center gap-[6px]">
              <TokenIcon type={t} size={22} />
              {t}
            </li>
          ))}
        </ul>

        <p className="mt-[14px]">{manualObjective.metricsIntro}</p>
        <ul className="mt-[6px] list-disc pl-[22px]">
          {manualObjective.metrics.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="mt-[26px] border-t border-ink-soft/20 pt-[20px] font-mono text-[15px] leading-[1.3] text-ink-soft">
        <h3 className={heading}>{manualHowToPlay.title}</h3>
        <ol className="mt-[10px] flex flex-col gap-[10px]">
          {manualHowToPlay.steps.map((step, i) => (
            <li key={step} className="flex gap-[10px]">
              <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full border border-ink-soft bg-peach text-[13px]">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
      <div className="h-[24px]" />
    </Sheet>
  )
}
