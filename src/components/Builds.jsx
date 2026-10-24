import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { BrickButton, PartsList } from '../bricks'
import { builds } from '../data/content.js'
import { usePrefs } from '../hooks/usePrefs.jsx'
import { useSmoothScroll } from '../motion/SmoothScroll.jsx'
import { OnboardyArt, PhishArt, TransitArt } from './Art.jsx'
import RevealWords from './RevealWords.jsx'

const ART = { onboardy: OnboardyArt, 'ttc-pulse': TransitArt, phishguard: PhishArt }

// The section pins while it plays. The first part of the scroll opens the pile into a wheel;
// the rest turns the wheel so each polaroid gets its moment at the top.
const OPEN = 0.22
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const openOf = (p) => easeOut(clamp01(p / OPEN))
const spinOf = (p) => clamp01((p - OPEN) / (1 - OPEN))
// where each polaroid lies in the pile before it opens, and its resting tilt on the wheel
const PILE = [
  { x: -18, y: 10, r: -9 },
  { x: 14, y: -8, r: 7 },
  { x: 4, y: 16, r: -3 },
  { x: -10, y: -14, r: 11 },
  { x: 20, y: 6, r: -12 },
]
const TILT = [-4, 3, -2, 5, -3, 2, -5, 4]

// Polaroid and wheel sizes follow the stage, and get tighter as projects are added.
function useWheel(ref, n) {
  const [g, setG] = useState({ box: 560, R: 175, w: 168, h: 198, phone: false })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const measure = () => {
      const box = el.clientWidth
      const phone = window.innerWidth < 900
      const few = n <= 4
      const w = Math.round(box * (phone ? (few ? 0.37 : 0.28) : few ? 0.34 : 0.24))
      const R = Math.round(box * (phone ? (few ? 0.3 : 0.36) : few ? 0.3 : 0.37))
      setG({ box, R, w, h: Math.round(w * 1.2), phone })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, n])
  return g
}

function Polaroid({ build, index, n, progress, geo, hidden, onOpen }) {
  const Art = ART[build.id]
  const geoRef = useRef(geo)
  geoRef.current = geo
  const step = 360 / n
  const pile = PILE[index % PILE.length]
  const tilt = TILT[index % TILT.length]

  // angle on the wheel, starting at the top and turning anticlockwise as you scroll
  const angle = (p) => -90 + index * step - spinOf(p) * (n - 1) * step
  // 1 when this polaroid is at the top of the wheel, falling to 0 a slot away
  const near = (p) => {
    const a = (((angle(p) + 90) % 360) + 360) % 360
    return Math.max(0, 1 - Math.min(a, 360 - a) / step)
  }
  const x = useTransform(progress, (p) => {
    const o = openOf(p)
    return o * geoRef.current.R * Math.cos((angle(p) * Math.PI) / 180) + (1 - o) * pile.x
  })
  const y = useTransform(progress, (p) => {
    const o = openOf(p)
    return o * geoRef.current.R * Math.sin((angle(p) * Math.PI) / 180) + (1 - o) * pile.y
  })
  const rotate = useTransform(progress, (p) => {
    const o = openOf(p)
    return (1 - o) * pile.r + o * tilt * (1 - near(p) * 0.7)
  })
  const scale = useTransform(progress, (p) => {
    const o = openOf(p)
    return 0.8 + 0.08 * o + 0.2 * near(p) * o
  })
  const zIndex = useTransform(progress, (p) => Math.round(near(p) * 10) + (openOf(p) < 0.5 ? index : 1))

  const photoW = geo.w - 16
  const photoH = geo.h - 8 - (geo.phone ? 30 : 38)
  const artScale = Math.min(photoW / 250, photoH / 180)
  const no = String(build.step).padStart(2, '0')

  return (
    <motion.div className="pol-slot" style={{ x, y, rotate, scale, zIndex, width: geo.w, height: geo.h, marginLeft: -geo.w / 2, marginTop: -geo.h / 2 }}>
      <div className="pol-float" style={{ '--fd': `${index * -1.7}s` }}>
        <motion.button
          type="button"
          layoutId={`build-${build.id}`}
          className={`polaroid pol-${build.id}`}
          style={{ opacity: hidden ? 0 : 1 }}
          onClick={() => onOpen(build)}
          aria-label={`${build.title}: open the details`}
        >
          <span className="pol-photo">
            <span className="pol-art" style={{ '--art-scale': artScale.toFixed(3) }}>
              {Art ? <Art /> : null}
            </span>
          </span>
          <span className="pol-caption">
            <span className="pol-no">No. {no}</span>
            <span className="pol-title">{build.title}</span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  )
}

// The polaroid grows into a full instruction page, and shrinks back into the wheel on close.
function DetailsPage({ build, onClose }) {
  const { sound } = usePrefs()
  const { lenis } = useSmoothScroll()
  const closeRef = useRef(null)

  useEffect(() => {
    lenis?.stop()
    const prev = document.activeElement
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lenis?.start()
      prev?.focus?.({ preventScroll: true })
    }
  }, [lenis, onClose])

  return (
    <div className="details-layer" role="dialog" aria-modal="true" aria-labelledby="details-title">
      <motion.div className="details-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div layoutId={`build-${build.id}`} className="details-page" data-lenis-prevent transition={{ type: 'spring', stiffness: 170, damping: 24 }}>
        <motion.div
          ref={closeRef}
          tabIndex={-1}
          className="details-inner"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.18 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          <header className="details-head">
            <span className="step">{String(build.step).padStart(2, '0')}</span>
            <span className="label details-kind">{build.kind}</span>
          </header>
          <h3 id="details-title" className="heading">
            {build.title}
          </h3>
          <p className="lead">{build.details.summary}</p>
          <h4 className="label details-sub">How it works</h4>
          <p className="body">{build.details.how}</p>
          <PartsList title="Current scope" parts={build.details.scope} />
          <div className="details-actions">
            <BrickButton color="blue" href={build.github} target="_blank" icon="↗" sound={sound}>
              View on GitHub
            </BrickButton>
            <BrickButton color="white" onClick={onClose} sound={sound}>
              Close
            </BrickButton>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function Builds() {
  const { sound } = usePrefs()
  const { lenis, scrollTo } = useSmoothScroll()
  const reduced = useReducedMotion()
  const section = useRef(null)
  const stage = useRef(null)
  const n = builds.length
  const geo = useWheel(stage, n)
  const [open, setOpen] = useState(null)
  const [active, setActive] = useState(0)
  const [opened, setOpened] = useState(false)

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.6 })
  // with reduced motion the wheel stands open and still; the arrows choose the project
  const fixed = useMotionValue(OPEN)
  useEffect(() => fixed.set(OPEN + ((1 - OPEN) * active) / Math.max(1, n - 1)), [fixed, active, n])
  const wheel = reduced ? fixed : smooth
  const dial = useTransform(wheel, (p) => -spinOf(p) * (n - 1) * (360 / n))

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (p > 0.04 && !opened) setOpened(true)
    if (reduced) return
    const k = n === 1 ? 0 : Math.round(spinOf(p) * (n - 1))
    if (k !== active) setActive(k)
  })

  // the arrows scroll to the spot where that project sits at the top
  function go(k) {
    const next = (k + n) % n
    if (reduced || !section.current) {
      setActive(next)
      return
    }
    const el = section.current
    const top = el.getBoundingClientRect().top + window.scrollY
    const span = el.offsetHeight - window.innerHeight
    const p = OPEN + ((1 - OPEN) * next) / Math.max(1, n - 1)
    if (lenis) lenis.scrollTo(top + span * p, { duration: 1.1 })
    else scrollTo(top + span * p)
  }

  const b = builds[active]
  return (
    <section id="builds" ref={section} className={'wheel-section' + (reduced ? ' wheel-still' : '')} style={{ '--n': n }}>
      <div className="wheel-sticky">
        <div className="wheel-head">
          <span className="label eyebrow">Selected builds · {n} sets</span>
          <RevealWords as="h2" className="heading" text="Take a look." />
        </div>

        <LayoutGroup>
          <div className="wheel-stage" ref={stage} data-in={opened || reduced || undefined}>
            <motion.div className="wheel-dial" style={{ rotate: dial }} aria-hidden="true">
              {builds.map((x, i) => (
                <span key={x.id} className="wheel-tick" style={{ rotate: `${(360 / n) * i}deg` }} />
              ))}
            </motion.div>
            {builds.map((x, i) => (
              <Polaroid key={x.id} build={x} index={i} n={n} progress={wheel} geo={geo} hidden={open?.id === x.id} onOpen={setOpen} />
            ))}
            <span className="wheel-hint label" aria-hidden="true">
              {opened ? 'Keep scrolling to spin' : 'Scroll to deal'}
            </span>
          </div>
          <AnimatePresence>{open ? <DetailsPage key={open.id} build={open} onClose={() => setOpen(null)} /> : null}</AnimatePresence>
        </LayoutGroup>

        <div className="wheel-info" aria-live="polite">
          <div className="wheel-count label">
            <span className="wheel-count-now" key={active}>
              {String(active + 1).padStart(2, '0')}
            </span>
            <span className="muted"> / {String(n).padStart(2, '0')} · {b.kind}</span>
          </div>
          {/* keyed, not queued: a fast scroll lands straight on the current project */}
          <motion.div
            key={b.id}
            className="wheel-text"
            initial={{ y: 18, opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h3 className="heading wheel-title">{b.title}</h3>
            <p className="body muted wheel-desc">{b.description}</p>
            <PartsList parts={b.parts} className="wheel-parts" />
          </motion.div>
          <div className="wheel-actions">
            <BrickButton size="sm" color="blue" href={b.github} target="_blank" icon="↗" sound={sound}>
              GitHub
            </BrickButton>
            <BrickButton size="sm" color="yellow" icon="→" onClick={() => setOpen(b)} sound={sound}>
              Details
            </BrickButton>
            <span className="wheel-arrows">
              <BrickButton size="sm" color="white" onClick={() => go(active - 1)} sound={sound}>
                <span aria-hidden="true">←</span>
                <span className="visually-hidden">Previous project</span>
              </BrickButton>
              <BrickButton size="sm" color="white" onClick={() => go(active + 1)} sound={sound}>
                <span aria-hidden="true">→</span>
                <span className="visually-hidden">Next project</span>
              </BrickButton>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
