import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrickButton, BrickToggle } from '../bricks'
import { links, profile } from '../data/content.js'
import { usePrefs } from '../hooks/usePrefs.jsx'
import { useSmoothScroll } from '../motion/SmoothScroll.jsx'

const SECTIONS = [
  { id: 'builds', label: 'Builds' },
  { id: 'how', label: 'How' },
  { id: 'experiments', label: 'Experiments' },
  { id: 'about', label: 'About' },
]

// On phones the sections live in a sheet that drops down from the nav.
const SHEET_LINKS = [
  { id: 'builds', label: 'Selected builds', color: 'yellow' },
  { id: 'how', label: 'How I build', color: 'blue' },
  { id: 'experiments', label: 'Experiments', color: 'red' },
  { id: 'about', label: 'About', color: 'green' },
  { id: 'contact', label: 'Say hello', color: 'white' },
]

export default function Nav() {
  const { dark, setDark, sound, setSound } = usePrefs()
  const { lenis, scrollTo } = useSmoothScroll()
  const [onPlate, setOnPlate] = useState(true)
  const [active, setActive] = useState(null)
  const [menu, setMenu] = useState(false)

  // Over the hero the nav sits on the wall; past it, it tucks into a floating pill.
  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return undefined
    const io = new IntersectionObserver(([e]) => setOnPlate(e.intersectionRatio > 0.12), { threshold: [0, 0.12, 0.3] })
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  // A yellow brick slides under whichever section you're reading.
  useEffect(() => {
    const seen = new Map()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.intersectionRatio))
        let best = null
        let ratio = 0.08
        for (const [id, r] of seen) if (r > ratio) [best, ratio] = [id, r]
        setActive(best)
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  // While the sheet is open the page holds still, and Escape closes it.
  useEffect(() => {
    if (!menu) return undefined
    lenis?.stop()
    document.documentElement.classList.add('sheet-open')
    const onKey = (e) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.documentElement.classList.remove('sheet-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [menu, lenis])

  function go(e, id) {
    e.preventDefault()
    setMenu(false)
    // let the sheet start closing before the page moves
    setTimeout(() => scrollTo(`#${id}`), 120)
  }

  return (
    <>
      <header className={'nav' + (onPlate && !menu ? ' nav-on-plate' : ' nav-pill') + (menu ? ' nav-menu-open' : '')}>
        <a className="nav-mark" href="#top" aria-label="Rahmat Khan, back to top" onClick={() => setMenu(false)}>
          {profile.mark}
        </a>
        <nav className="nav-links" aria-label="Sections">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'is-active' : undefined}>
              <span className="nav-roll">
                <span>{s.label}</span>
                <span aria-hidden="true">{s.label}</span>
              </span>
              {active === s.id && !onPlate ? <motion.span layoutId="nav-brick" className="nav-brick" transition={{ type: 'spring', stiffness: 420, damping: 30 }} /> : null}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <BrickToggle label="Night" checked={dark} onChange={setDark} sound={sound} className="nav-toggle" />
          <span className="nav-menu-btn">
            <BrickButton size="sm" color="white" onClick={() => setMenu(!menu)} sound={sound}>
              {menu ? 'Close' : 'Menu'}
            </BrickButton>
          </span>
          <BrickButton size="sm" color="red" href={links.email} icon="↗" sound={sound}>
            Say hello
          </BrickButton>
        </div>
      </header>

      <AnimatePresence>
        {menu ? (
          <motion.div
            className="nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'inset(0 0 100% 0 round 0 0 28px 28px)' }}
            animate={{ clipPath: 'inset(0 0 0% 0 round 0 0 0px 0px)' }}
            exit={{ clipPath: 'inset(0 0 100% 0 round 0 0 28px 28px)', transition: { duration: 0.35, ease: [0.7, 0, 0.3, 1] } }}
            transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1] }}
          >
            <nav className="nav-sheet-links" aria-label="Sections">
              {SHEET_LINKS.map((s, i) => (
                <motion.a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => go(e, s.id)}
                  className={`nav-sheet-link rk-c-${s.color}`}
                  initial={{ y: -90, opacity: 0, rotate: i % 2 ? 6 : -6 }}
                  animate={{ y: 0, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 16, delay: 0.18 + i * 0.06 } }}
                  exit={{ y: 30, opacity: 0, transition: { duration: 0.15 } }}
                >
                  <span className="nav-sheet-num label">{String(i + 1).padStart(2, '0')}</span>
                  <span className="heading">{s.label}</span>
                  <span className="nav-sheet-brick" aria-hidden="true" />
                </motion.a>
              ))}
            </nav>
            <motion.div className="nav-sheet-foot" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} exit={{ opacity: 0 }}>
              <div className="row">
                <BrickButton size="sm" color="blue" href={links.github} target="_blank" icon="↗">
                  GitHub
                </BrickButton>
                <BrickButton size="sm" color="white" href={links.resume} target="_blank" icon="↓">
                  Résumé
                </BrickButton>
                <BrickButton size="sm" color="black" href={links.x} target="_blank" icon="↗">
                  X
                </BrickButton>
              </div>
              <div className="nav-sheet-toggles">
                <BrickToggle label="Night build" checked={dark} onChange={setDark} sound={sound} />
                <BrickToggle label="Click sounds" checked={sound} onChange={setSound} sound />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
