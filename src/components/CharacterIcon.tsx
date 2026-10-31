import type { Character } from '../data/characters'

// One clickable icon in the character grid.
// Matches the Figma "icon / …" component's three states:
//   default  → normal
//   active   → Figma's "hover" variant: the picture rises and a golden glow
//              appears under it. Shown on mouse hover, and kept while selected.
//   dimmed   → 25% opacity, while another character is selected

export type IconState = 'default' | 'active' | 'dimmed'

type CharacterIconProps = {
  character: Character
  state: IconState
  onSelect: () => void
}

export function CharacterIcon({ character, state, onSelect }: CharacterIconProps) {
  const { icon, name } = character
  const isActive = state === 'active'

  return (
    <button
      type="button"
      aria-pressed={isActive}
      aria-label={`${name} (${icon.alt.toLowerCase()})`}
      onClick={(e) => {
        e.stopPropagation() // don't let the background "click outside" handler fire
        onSelect()
      }}
      className={`group relative shrink-0 cursor-pointer rounded-3xl transition-opacity duration-300 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none ${
        state === 'dimmed' ? 'opacity-25 hover:opacity-50' : 'opacity-100'
      }`}
      style={{ width: icon.width, height: icon.height }}
    >
      {/* Glow under the icon. Figma: "shadow" ellipse, 120×38, radial gradient
          from solid gold in the middle to 31% gold at the edge. */}
      <span
        aria-hidden
        className={`absolute h-[38px] w-[120px] rounded-[50%] bg-[radial-gradient(closest-side,#fcc560,rgb(252_197_96/0.31))] transition-opacity duration-300 motion-reduce:transition-none ${
          isActive ? 'opacity-100' : state === 'default' ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
        }`}
        style={{ left: icon.glow.left, top: icon.glow.top }}
      />
      {/* Every icon rises 26px, the amount of the saxophone's hover variant in
          Figma (the only one that moved), so they all behave the same. */}
      <img
        src={icon.src}
        alt=""
        draggable={false}
        className={`relative size-full transition-transform duration-300 motion-reduce:transition-none ${
          isActive ? '-translate-y-[26px]' : state === 'default' ? 'group-hover:-translate-y-[26px]' : ''
        }`}
      />
    </button>
  )
}
