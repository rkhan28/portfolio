import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Brick, BrickButton, PartsList } from '../bricks'
import { builds } from '../data/content.js'
import { usePrefs } from '../hooks/usePrefs.jsx'
import { useSmoothScroll } from '../motion/SmoothScroll.jsx'
import { OnboardyArt, PhishArt, TransitArt } from './Art.jsx'
import RevealWords from './RevealWords.jsx'

const ART = { onboardy: OnboardyArt, 'ttc-pulse': TransitArt, phishguard: PhishArt }
const PART_COLORS = ['blue', 'red', 'yellow', 'green', 'tan', 'gray']

// The section pins while the reveal plays: the stacked pile bursts apart (to BURST),
// then every card flies into its place in the row (by SETTLED) and stays there.
const BURST = 0.38
const SETTLED = 0.82
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a, b, t) => a + (b - a) * t
// how each card lies in the pile, and how it tumbles during the burst
const PILE = [
  { x: -14, y: 10, r: -8 },
  { x: 12, y: -10, r: 7 },
  { x: 2, y: 14, r: -3 },
  { x: -8, y: -12, r: 10 },
  { x: 16, y: 4, r: -11 },
]
const SPIN = [-14, 12, -8, 16, -12, 9]

function Card({ build, index, n, progress, offsets, hidden, picked, onOpen }) {
  const { sound } = usePrefs()
  const Art = ART[build.id]
  const off = useRef(offsets)
  off.current = offsets
  const pile = PILE[index % PILE.length]
  // burst direction: spread around the circle, starting up and to the left
  const a = ((-150 + (index * 360) / Math.max(n, 3)) * Math.PI) / 180

  // where the card is, relative to its own slot in the row (0, 0 = lined up)
  const at = (p) => {
    const d = off.current[index] || { x: 0, y: 0, w: 300 }
    const R = Math.max(160, d.w * 0.7)
    const pileX = d.x + pile.x
    const pileY = d.y + pile.y
    const burstX = d.x + Math.cos(a) * R
    const burstY = d.y + Math.sin(a) * R * 0.55
    if (p <= BURST) {
      const t = easeOut(clamp01(p / BURST))
      return { x: lerp(pileX, burstX, t), y: lerp(pileY, burstY, t), r: lerp(pile.r, SPIN[index % SPIN.length], t), s: lerp(0.62, 0.74, t) }
    }
    const t = easeInOut(clamp01((p - BURST) / (SETTLED - BURST)))
    return { x: lerp(burstX, 0, t), y: lerp(burstY, 0, t), r: lerp(SPIN[index % SPIN.length], 0, t), s: lerp(0.74, 1, t) }
  }
  const x = useTransform(progress, (p) => at(p).x)
  const y = useTransform(progress, (p) => at(p).y)
  const rotate = useTransform(progress, (p) => at(p).r)
  const scale = useTransform(progress, (p) => at(p).s)
  const zIndex = useTransform(progress, (p) => (p < SETTLED ? n - index : 1))

  const no = String(build.step).padStart(2, '0')
  // the brick photo is drawn at 250x180 and scaled to fill the card's 16:10 frame
  const photoW = Math.max(160, (offsets[index]?.w || 300) - 20)
  const artScale = Math.min(photoW / 250, (photoW * 0.62) / 180, 1.7)
  return (
    <motion.div className="deck-move" style={{ x, y, rotate, scale, zIndex }}>
      <motion.article layoutId={`build-${build.id}`} className={`deck-card deck-${build.id}` + (picked ? ' is-picked' : '')} style={{ opacity: hidden ? 0 : 1 }}>
        <button type="button" className="deck-photo" onClick={() => onOpen(build)} aria-label={`${build.title}: open the details`}>
          <span className="deck-art" style={{ '--art-scale': artScale.toFixed(3) }}>
            {Art ? <Art /> : null}
          </span>
        </button>
        <div className="deck-body">
          <div className="deck-meta label">
            <span>No. {no}</span>
            <span>{build.kind}</span>
          </div>
          <h3 className="title deck-title">{build.title}</h3>
          <p className="body muted deck-desc">{build.description}</p>
          <ul className="deck-parts">
            {build.parts.map((part, i) => (
              <li key={part}>
                <Brick color={PART_COLORS[i % PART_COLORS.length]} studs={2} className="rk-mini" />
                {part}
              </li>
            ))}
          </ul>
          <div className="deck-actions">
            <BrickButton size="sm" color="blue" href={build.github} target="_blank" icon="↗" sound={sound}>
              GitHub
            </BrickButton>
            <BrickButton size="sm" color="white" icon="→" onClick={() => onOpen(build)} sound={sound}>
              Details
            </BrickButton>
          </div>
        </div>
      </motion.article>
    </motion.div>
  )
}

// The card grows into a full instruction page, and shrinks back into the row on close.
function DetailsPage({ build, onClose }) {
  const { sound } = usePrefs()
  const { lenis } = useSmoothScroll()
  const closeRef = useRef(null)

  useEffect(() => {
    lenis?.stop()
    document.documentElement.classList.add('modal-open')
    const prev = document.activeElement
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lenis?.start()
      document.documentElement.classList.remove('modal-open')
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
  const reduced = useReducedMotion()
  const { lenis } = useSmoothScroll()
  const [picked, setPicked] = useState(null)
  const jumpRef = useRef(null)
  const section = useRef(null)
  const row = useRef(null)
  const n = builds.length
  const [offsets, setOffsets] = useState([])
  const [open, setOpen] = useState(null)
  const [settled, setSettled] = useState(false)
  const [current, setCurrent] = useState(0)
  const [overflowing, setOverflowing] = useState(false)

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 130, damping: 26, mass: 0.6 })
  const progress = useTransform(smooth, (p) => (reduced ? 1 : p))

  // Each card's distance from its slot to the middle of the row: that's where the pile sits.
  useLayoutEffect(() => {
    const el = row.current
    if (!el) return undefined
    const measure = () => {
      const r = el.getBoundingClientRect()
      const cx = r.left + el.clientWidth / 2
      const cy = r.top + r.height / 2
      const slots = [...el.querySelectorAll('.deck-slot')]
      setOffsets(
        slots.map((s) => {
          const b = s.getBoundingClientRect()
          return { x: cx - (b.left + b.width / 2) + el.scrollLeft, y: cy - (b.top + b.height / 2), w: b.width }
        }),
      )
      setOverflowing(el.scrollWidth > el.clientWidth + 4)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [n])

  useMotionValueEvent(smooth, 'change', (p) => {
    const done = reduced || p >= SETTLED - 0.02
    if (done !== settled) setSettled(done)
  })
  useEffect(() => {
    if (reduced) setSettled(true)
  }, [reduced])

  // Phones (and wide decks later) swipe; the dots follow and jump.
  function onRowScroll() {
    const el = row.current
    const first = el?.querySelector('.deck-slot')
    if (!first) return
    const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0')
    setCurrent(Math.min(n - 1, Math.round(el.scrollLeft / step)))
  }
  function jump(k) {
    const el = row.current
    const slot = el?.querySelectorAll('.deck-slot')[k]
    if (!slot) return
    el.scrollTo({ left: slot.offsetLeft - el.offsetLeft - (el.clientWidth - slot.clientWidth) / 2, behavior: reduced ? 'auto' : 'smooth' })
  }

  jumpRef.current = jump

  // "See the builds", the streetcar and the menu send you here: the scroll plays the whole
  // reveal on the way down, then the row swipes to the project you came for.
  useEffect(() => {
    const onShow = (e) => {
      const el = section.current
      if (!el) return
      const k = Math.max(0, builds.findIndex((b) => b.id === e.detail?.id))
      const top = el.getBoundingClientRect().top + window.scrollY
      const target = reduced ? top : top + (el.offsetHeight - window.innerHeight) * 0.92
      const after = () =>
        setTimeout(() => {
          jumpRef.current?.(k)
          if (e.detail?.id) {
            setPicked(e.detail.id)
            setTimeout(() => setPicked(null), 1600)
          }
        }, 450)
      if (lenis) lenis.scrollTo(target, { duration: 1.6, onComplete: after })
      else {
        window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' })
        setTimeout(after, 900)
      }
    }
    window.addEventListener('rk:show-build', onShow)
    return () => window.removeEventListener('rk:show-build', onShow)
  }, [lenis, reduced])

  return (
    <section id="builds" ref={section} className={'deck-section' + (reduced ? ' deck-still' : '')} style={{ '--n': n }}>
      <div className="deck-sticky">
        <div className="deck-head">
          <div>
            <span className="label eyebrow">Selected builds · {n} sets</span>
            <RevealWords as="h2" className="heading" text="Take a look." />
          </div>
          <span className={'label deck-hint' + (settled ? ' is-settled' : '')} aria-hidden="true">
            {settled ? (overflowing ? 'Swipe for more' : 'Click a card for the details') : 'Keep scrolling'}
          </span>
        </div>

        <LayoutGroup>
          <div
            ref={row}
            className={'deck-row' + (settled ? ' is-settled' : '')}
            data-in={settled || undefined}
            onScroll={settled ? onRowScroll : undefined}
          >
            {builds.map((b, i) => (
              <div className="deck-slot" key={b.id}>
                <Card build={b} index={i} n={n} progress={progress} offsets={offsets} hidden={open?.id === b.id} picked={picked === b.id} onOpen={setOpen} />
              </div>
            ))}
          </div>
          <AnimatePresence>{open ? <DetailsPage key={open.id} build={open} onClose={() => setOpen(null)} /> : null}</AnimatePresence>
        </LayoutGroup>

        {overflowing ? (
          <div className={'deck-dots' + (settled ? ' is-settled' : '')} role="tablist" aria-label="Projects">
            {builds.map((b, i) => (
              <button key={b.id} type="button" role="tab" aria-selected={current === i} aria-label={b.title} className={current === i ? 'is-on' : undefined} onClick={() => jump(i)} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
