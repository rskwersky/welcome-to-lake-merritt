import { useEffect, useState, type ReactNode } from 'react'

// The phone version of <Stage>. Figma's phone screens are 390 × 844
// (iPhone portrait). <PhoneStage> lays things out at those numbers and
// scales the frame to the screen:
//   • a phone about 390 wide: scale ≈ 1, the frame fills the screen;
//   • a tablet held upright: scaled up until the frame is as tall as the
//     screen, centered, with the background showing at the sides.
// The frame is always exactly as tall as the screen (in frame px), so
// sheets can sit at its bottom edge. Content that doesn't fit (a short
// phone) scrolls inside the frame instead.

const WIDTH = 390
const HEIGHT = 844

function useFrame() {
  const compute = () => {
    const scale = Math.min(window.innerWidth / WIDTH, Math.max(window.innerHeight / HEIGHT, 1))
    return { scale, height: window.innerHeight / scale }
  }
  const [frame, setFrame] = useState(compute)
  useEffect(() => {
    const onResize = () => setFrame(compute())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return frame
}

export function PhoneStage({ children }: { children: ReactNode }) {
  const { scale, height } = useFrame()
  return (
    <div className="bg-overview flex h-full w-full justify-center overflow-clip">
      <div style={{ width: WIDTH * scale, height: height * scale }}>
        {/* data-stage + data-width: the flying stars measure positions in
            this frame (components/popups/flights.ts) */}
        <div data-stage data-width={WIDTH} className="relative origin-top-left" style={{ width: WIDTH, height, transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
