import { useEffect, useState, type ReactNode } from 'react'

// Every screen in Figma is a 1440×1024 frame. <Stage> lets us lay things out
// with those exact pixel numbers, then scales the whole frame to fit the
// browser window (like a game canvas). Resize the window and it shrinks/grows.

export const STAGE_WIDTH = 1440
export const STAGE_HEIGHT = 1024

function useFitScale() {
  const compute = () =>
    Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT)
  const [scale, setScale] = useState(compute)

  useEffect(() => {
    const onResize = () => setScale(compute())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return scale
}

type StageProps = {
  children: ReactNode
  /** Background for the whole window (outside the scaled frame too) */
  className?: string
  onBackgroundClick?: () => void
}

export function Stage({ children, className = '', onBackgroundClick }: StageProps) {
  const scale = useFitScale()

  return (
    <div
      className={`flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      onClick={onBackgroundClick}
    >
      {/* The outer box takes up the scaled size so centering works;
          the inner box is the real 1440×1024 frame, scaled with CSS transform. */}
      <div style={{ width: STAGE_WIDTH * scale, height: STAGE_HEIGHT * scale }}>
        {/* data-stage: lets code find the frame to convert screen px to stage px */}
        <div
          data-stage
          className="relative origin-top-left"
          style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
