import { useEffect, useRef, useState } from 'react'

// Returns a ref to attach to an element, and `true` once that element has
// scrolled into view. Uses the browser's IntersectionObserver, which is the
// standard (and cheap) way to react to scrolling without a scroll listener.
//
// Usage:
//   const [ref, inView] = useInView<HTMLParagraphElement>()
//   <p ref={ref} className={inView ? 'opacity-100' : 'opacity-0'}>…</p>

export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect() // only animate in once
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView] as const
}
