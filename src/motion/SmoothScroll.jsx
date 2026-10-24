import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

// Inertial scrolling for the whole page (off when the visitor prefers reduced motion).
const ScrollContext = createContext({ scrollTo: (target) => document.querySelector(target)?.scrollIntoView(), lenis: null })

export function SmoothScroll({ children }) {
  const [lenis, setLenis] = useState(null)
  const raf = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const l = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: { offset: -72 }, autoRaf: false })
    const loop = (t) => {
      l.raf(t)
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    setLenis(l)
    return () => {
      cancelAnimationFrame(raf.current)
      l.destroy()
      setLenis(null)
    }
  }, [])

  const scrollTo = (target, opts = {}) => {
    if (lenis) lenis.scrollTo(target, { offset: -72, duration: 1.4, ...opts })
    else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView({ behavior: 'smooth' })
  }

  return <ScrollContext.Provider value={{ lenis, scrollTo }}>{children}</ScrollContext.Provider>
}

export const useSmoothScroll = () => useContext(ScrollContext)
