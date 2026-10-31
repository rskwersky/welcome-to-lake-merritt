import type { CSSProperties } from 'react'
import type { Character, TextSpot } from '../data/characters'

// A character card = the "blank" card image from Figma (border + title bar)
// with the description, strength, and weakness written on top as real text.
// Keeping the words as text (not baked into the image) means you can edit them
// in src/data/characters.ts, and screen readers can read them.
//
// Each card puts its text in a slightly different spot in Figma, so the
// positions come from the character's data (`card.text`).

type CharacterCardProps = {
  character: Character
}

// Turns a TextSpot (percentages) into CSS for an absolutely positioned element
function at({ left, top, width }: TextSpot): CSSProperties {
  return { left: `${left}%`, top: `${top}%`, width: width === undefined ? undefined : `${width}%` }
}

export function CharacterCard({ character }: CharacterCardProps) {
  const { card, name, description, strength, weakness } = character

  return (
    <article
      aria-label={name}
      // Figma: drop shadow 0 4px, blur 4, black at 25%
      className="relative font-mono text-ink-soft italic drop-shadow-[0_4px_2px_rgba(0,0,0,0.25)]"
      style={{ width: card.width, height: card.height }}
    >
      <img
        src={card.src}
        alt=""
        draggable={false}
        className="absolute max-w-none"
        style={card.image ?? { left: 0, top: 0, width: card.width, height: card.height }}
      />
      {/* The title is part of the card image, so give it to screen readers here */}
      <h2 className="sr-only">{name}</h2>

      <p className="absolute text-[36px] leading-[normal]" style={at(card.text.description)}>
        {description}
      </p>

      <dl className="text-[24px] leading-[normal] whitespace-nowrap">
        <div className="absolute flex gap-[1ch]" style={at(card.text.strength)}>
          <dt>Strength:</dt>
          <dd>{strength}</dd>
        </div>
        <div className="absolute flex gap-[1ch]" style={at(card.text.weakness)}>
          <dt>Weakness:</dt>
          <dd>{weakness}</dd>
        </div>
      </dl>
    </article>
  )
}
