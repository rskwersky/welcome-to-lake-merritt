import type { Character } from '../data/characters'

// A character card = the "blank" card image from Figma (border + title bar)
// with the description, strength, and weakness written on top as real text.
// Keeping the words as text (not baked into the image) means you can edit them
// in src/data/characters.ts, and screen readers can read them.
//
// Text positions are percentages of the card, measured from the Figma
// "character-card / … view=description" variants.

type CharacterCardProps = {
  character: Character
}

export function CharacterCard({ character }: CharacterCardProps) {
  const { card, name, description, strength, weakness } = character

  return (
    <article
      aria-label={name}
      className="relative text-ink-soft"
      style={{ width: card.width, height: card.height }}
    >
      <img src={card.src} alt="" draggable={false} className="absolute inset-0 size-full" />
      {/* The title is part of the card image, so give it to screen readers here */}
      <h2 className="sr-only">{name}</h2>

      <p className="absolute top-[18.4%] right-[9.3%] left-[9.1%] font-mono text-[32px] leading-[1.15] italic">
        {description}
      </p>

      <dl className="absolute top-[82.5%] right-[4%] left-[6.4%] space-y-1 font-mono text-[22px] italic">
        <div className="flex gap-2">
          <dt>Strength:</dt>
          <dd>{strength}</dd>
        </div>
        <div className="flex gap-2">
          <dt>Weakness:</dt>
          <dd>{weakness}</dd>
        </div>
      </dl>
    </article>
  )
}
