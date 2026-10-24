import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

// Theme ("Night build"), click sounds and the visitor's brick count, shared across the page.
const PrefsContext = createContext({ dark: false, sound: false, dropped: 0, setDark: () => {}, setSound: () => {}, setDropped: () => {} })

function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // private window or storage blocked: the choice lasts this visit only
  }
}

export function PrefsProvider({ children }) {
  const [dark, setDarkState] = useState(() => document.documentElement.dataset.theme === 'dark')
  const [sound, setSoundState] = useState(() => read('rk-sound') === 'on')
  const [dropped, setDropped] = useState(0)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  // Lights out: the new theme spreads in a circle from wherever the switch was pressed.
  const setDark = useCallback((v, origin) => {
    write('rk-theme', v ? 'dark' : 'light')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduced) {
      setDarkState(v)
      return
    }
    const x = origin?.x ?? window.innerWidth - 80
    const y = origin?.y ?? 36
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const t = document.startViewTransition(() => {
      flushSync(() => setDarkState(v))
      document.documentElement.dataset.theme = v ? 'dark' : 'light'
    })
    t.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' },
        )
      })
      .catch(() => {})
  }, [])

  const setSound = useCallback((v) => {
    setSoundState(v)
    write('rk-sound', v ? 'on' : 'off')
  }, [])

  return <PrefsContext.Provider value={{ dark, sound, dropped, setDark, setSound, setDropped }}>{children}</PrefsContext.Provider>
}

export const usePrefs = () => useContext(PrefsContext)
