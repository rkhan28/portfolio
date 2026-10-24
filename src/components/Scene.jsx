import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Baseplate, BrickButton } from '../bricks'
import { links, profile } from '../data/content.js'
import { usePrefs } from '../hooks/usePrefs.jsx'
import BrickWorld from '../world/BrickWorld.js'
import Streetcar from './Streetcar.jsx'

const HINTS = [
  'Click anywhere on the wall to drop a brick',
  'Poke a brick in the logo. It comes back.',
  'Go on, knock it down. I’ll wait.',
  'No feet were harmed in the making of this site',
  'Some assembly required',
]

const KNOCK_LABEL = { idle: 'Knock it down', knocked: 'Oops', rebuilding: 'Rebuilding…', building: 'Building…' }

const rise = {
  hidden: { y: '110%' },
  show: (i) => ({ y: '0%', transition: { type: 'spring', stiffness: 120, damping: 18, delay: 0.25 + i * 0.12 } }),
}
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (d) => ({ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 20, delay: d } }),
}

export default function Scene() {
  const { sound, setDropped } = usePrefs()
  const reduced = useReducedMotion()
  const section = useRef(null)
  const layer = useRef(null)
  const world = useRef(null)
  const copy = useRef(null)
  const soundRef = useRef(sound)
  const [mode, setMode] = useState('building')
  const [hint, setHint] = useState(0)
  const [flash, setFlash] = useState(null)
  const [ctl, setCtl] = useState(null)

  soundRef.current = sound

  // The copy drifts up and the wall sinks a little as you scroll away.
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] })
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const copyFade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const wallY = useTransform(scrollYProgress, [0, 1], [0, 80])

  useEffect(() => {
    const el = layer.current
    const road = window.innerWidth < 900 ? 48 : 64
    const w = new BrickWorld(el, {
      reduced,
      road,
      sound: () => soundRef.current,
      onEvent: (type, value) => {
        if (type === 'built') {
          setCtl({ left: w.X(w.sx), width: 15 * w.P, bottom: w.road + 9 * w.H + w.studH + 18 })
          markCopy()
        }
        if (type === 'built' || type === 'knocked' || type === 'rebuilding') setMode(type === 'built' ? 'idle' : type)
        if (type === 'drop') setDropped(value)
        if (type === 'full') setFlash('That column’s tall enough. Try another.')
        if (type === 'swept') setFlash('Swept up. You’re welcome.')
        if (type === 'knocked') setFlash('Well. That happened.')
      },
    })
    world.current = w

    // Piles under the copy must stop below it, so tell the world where the copy ends.
    function markCopy() {
      const c = copy.current
      if (!c) return
      const lr = el.getBoundingClientRect()
      const cr = c.getBoundingClientRect()
      w.ceiling = { left: cr.left - lr.left, right: cr.right - lr.left, bottom: cr.bottom - lr.top }
    }

    // build once the wall has a size (a hidden tab or pane can mount it at zero height)
    let started = false
    const start = () => {
      if (started || !el.clientHeight) return
      started = true
      w.measure()
      markCopy()
      w.build(reduced ? 0 : 450)
    }
    const sizeWatch = new ResizeObserver(start)
    sizeWatch.observe(el)
    start()

    // Weather: now and then a brick falls on its own, but only while the hero is on screen.
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    const weather = reduced ? null : setInterval(() => visible && document.visibilityState === 'visible' && w.ambientDrop(), 3800)

    let resizeTimer = 0
    let lastW = window.innerWidth
    const onResize = () => {
      if (Math.abs(window.innerWidth - lastW) < 40) return
      lastW = window.innerWidth
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        w.resize()
        markCopy()
        setCtl({ left: w.X(w.sx), width: 15 * w.P, bottom: w.road + 9 * w.H + w.studH + 18 })
      }, 220)
    }
    window.addEventListener('resize', onResize)
    return () => {
      sizeWatch.disconnect()
      io.disconnect()
      clearInterval(weather)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      w.destroy()
    }
  }, [reduced, setDropped])

  // The hint rotates through its jokes; a flash message takes over briefly.
  useEffect(() => {
    const t = setInterval(() => setHint((h) => (h + 1) % HINTS.length), 4200)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (!flash) return undefined
    const t = setTimeout(() => setFlash(null), 2400)
    return () => clearTimeout(t)
  }, [flash])

  function onWallClick(e) {
    if (e.target.closest('a, button')) return
    const r = layer.current.getBoundingClientRect()
    world.current?.dropAt(e.clientX - r.left)
  }

  const message = flash || HINTS[hint]

  return (
    <Baseplate as="section" ref={section} id="top" className="scene" aria-label="Introduction" onClick={onWallClick}>
      <div className="scene-light" aria-hidden="true">
        <span className="sun sun-a" />
        <span className="sun sun-b" />
        <span className="beam" />
      </div>

      <motion.div className="scene-world" ref={layer} style={{ y: reduced ? 0 : wallY }} aria-hidden="true" />

      <motion.div ref={copy} className="scene-copy" style={{ y: reduced ? 0 : copyY, opacity: reduced ? 1 : copyFade }} initial="hidden" animate="show">
        <motion.p className="label scene-eyebrow" variants={fadeUp} custom={0.1}>
          Set 416 · Toronto edition<span className="eyebrow-extra"> · Ages 4–99</span>
        </motion.p>
        <h1 className="display-xl scene-name" aria-label={profile.name}>
          {['Rahmat', 'Khan.'].map((word, i) => (
            <span className="mask" key={word} aria-hidden="true">
              <motion.span className="mask-inner" variants={rise} custom={i}>
                {word}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p className="lead scene-intro" variants={fadeUp} custom={0.55}>
          {profile.intro}
        </motion.p>
        <motion.div className="scene-ctas" variants={fadeUp} custom={0.7}>
          <BrickButton color="yellow" icon="↘" onClick={() => window.dispatchEvent(new CustomEvent('rk:show-build'))} sound={sound}>
            See the builds
          </BrickButton>
          <BrickButton color="red" href={links.email} icon="↗" sound={sound}>
            Say hello
          </BrickButton>
        </motion.div>
        <motion.nav className="scene-socials" aria-label="Elsewhere" variants={fadeUp} custom={0.85}>
          <BrickButton size="sm" color="blue" href={links.github} target="_blank" icon="↗" sound={sound}>
            GitHub
          </BrickButton>
          <BrickButton size="sm" color="white" href={links.resume} target="_blank" icon="↓" sound={sound}>
            Résumé
          </BrickButton>
          <BrickButton size="sm" color="black" href={links.x} target="_blank" icon="↗" sound={sound}>
            X
          </BrickButton>
        </motion.nav>
      </motion.div>

      {/* The hint and the knock button hover just above the sculpture. */}
      <motion.div className="scene-controls" style={ctl ?? { visibility: 'hidden' }} variants={fadeUp} initial="hidden" animate={ctl ? 'show' : 'hidden'} custom={0.1}>
        <div className="scene-hint label" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={message}
              initial={{ y: 16, opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: -16, opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {message}
            </motion.span>
          </AnimatePresence>
        </div>
        <BrickButton size="sm" color="white" disabled={mode !== 'idle'} onClick={() => world.current?.knockDown()} sound={sound}>
          {KNOCK_LABEL[mode]}
        </BrickButton>
      </motion.div>

      <Streetcar />
    </Baseplate>
  )
}
