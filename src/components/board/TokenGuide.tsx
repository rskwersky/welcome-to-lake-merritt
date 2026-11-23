import { TOKEN_GUIDE } from '../../data/explore'
import { dropIn } from '../dropIn'
import { TokenIcon } from '../TokenIcon'

// Explore mode, bottom right (under the character cards): what the three
// kinds of token stand for. A cream card in the same style as the city
// bank's, as wide as the cards above it. The words are in data/explore.ts.

export function TokenGuide() {
  // Falls into place after the character cards above it
  const fall = dropIn(7)
  return (
    <section
      aria-labelledby="token-guide-title"
      className={`absolute z-20 w-[246px] rounded-[5px] border border-black bg-cream px-[14px] pt-[12px] pb-[14px] shadow-[-4px_4px_2px_0px_rgba(0,0,0,0.25)] ${fall.className}`}
      style={{ ...fall.style, left: 1112.86, top: 566 }}
    >
      <h2 id="token-guide-title" className="font-mono text-[18px] leading-none text-ink italic">
        {TOKEN_GUIDE.title}
      </h2>
      <ul className="mt-[10px] flex flex-col gap-[8px]">
        {TOKEN_GUIDE.types.map(({ type, name, meaning }) => (
          <li key={type} className="flex gap-[10px]">
            <TokenIcon type={type} size={24} className="mt-[1px] drop-shadow-[0px_2px_2px_rgba(0,0,0,0.2)]" />
            {/* The name on its own line, then what it stands for */}
            <p className="font-mono text-[12px] leading-[1.25] text-ink-soft">
              <span className="block text-[13px] text-ink">{name}</span>
              {meaning}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-[10px] border-t border-ink-soft/20 pt-[8px] font-mono text-[12px] leading-[1.25] text-ink-soft">{TOKEN_GUIDE.footer}</p>
    </section>
  )
}
