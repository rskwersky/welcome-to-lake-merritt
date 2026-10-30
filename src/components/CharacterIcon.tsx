import type { Character } from '../data/characters'

// One clickable icon in the character grid.
// Matches the Figma "icon / …" component's three states:
//   default  → normal
//   active   → lifted with a golden glow underneath (Figma's "hover" variant)
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
      className={`group relative flex shrink-0 cursor-pointer items-end justify-center rounded-3xl transition-opacity duration-300 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none ${
        state === 'dimmed' ? 'opacity-25 hover:opacity-50' : 'opacity-100'
      }`}
      style={{ width: icon.width, height: icon.height }}
    >
      {/* Glow under the icon (Figma: "shadow" ellipse, 120×38) */}
      <span
        aria-hidden
        className={`absolute -bottom-6 left-1/2 h-[38px] w-[120px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(251,187,75,0.9),rgba(251,187,75,0))] transition-opacity duration-300 ${
          isActive ? 'opacity-100' : state === 'default' ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
        }`}
      />
      <img
        src={icon.src}
        alt=""
        draggable={false}
        className={`relative size-full object-contain transition-transform duration-300 motion-reduce:transition-none ${
          isActive ? '-translate-y-3' : state === 'default' ? 'group-hover:-translate-y-3' : ''
        }`}
      />
    </button>
  )
}
