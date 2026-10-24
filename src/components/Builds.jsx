import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { BrickButton, BuildCard, PartsList } from '../bricks'
import { builds } from '../data/content.js'
import { usePrefs } from '../hooks/usePrefs.jsx'
import { useSmoothScroll } from '../motion/SmoothScroll.jsx'
import { OnboardyArt, PhishArt, TransitArt } from './Art.jsx'
import RevealWords from './RevealWords.jsx'

const ART = { onboardy: OnboardyArt, 'ttc-pulse': TransitArt, phishguard: PhishArt }
const ENTER_TILT = [-5, 3, -2]

// One card: lands with a spring, assembles its bricks, and leans toward the pointer.
function BuildTile({ build, index, onOpen, hidden }) {
  const { sound } = usePrefs()
  const reduced = useReducedMotion()
  const [inView, setInView] = useState(false)
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const Art = ART[build.id]

  function lean(e) {
    if (reduced || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 9)
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -7)
  }
  function settle() {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      className="build-tile"
      data-in={inView || undefined}
      initial={reduced ? false : { y: 140, rotate: ENTER_TILT[index % 3], opacity: 0 }}
      whileInView={{ y: 0, rotate: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: 'spring', stiffness: 70, damping: 14, delay: index * 0.12 }}
      onViewportEnter={() => setInView(true)}
      style={{ perspective: 1000 }}
    >
      <motion.div
        layoutId={`build-${build.id}`}
        className="build-tilt"
        style={{ rotateX: rx, rotateY: ry, opacity: hidden ? 0 : 1 }}
        onPointerMove={lean}
        onPointerLeave={settle}
      >
        <BuildCard
          id={build.id}
          step={build.step}
          title={build.title}
          kind={build.kind}
          description={build.description}
          parts={build.parts}
          sound={sound}
          links={[
            { label: 'GitHub', href: build.github, target: '_blank' },
            { label: 'Details', icon: '→', onClick: () => onOpen(build) },
          ]}
        >
          {Art ? <Art /> : null}
        </BuildCard>
      </motion.div>
    </motion.div>
  )
}

// The card grows into a full instruction page, and shrinks back into place on close.
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
  const [open, setOpen] = useState(null)

  return (
    <section id="builds" className="section">
      <div className="section-head">
        <span className="label eyebrow">Selected builds · 3 sets</span>
        <RevealWords as="h2" className="heading" text="Take a look." />
      </div>

      <LayoutGroup>
        <div className="builds-grid">
          {builds.map((b, i) => (
            <BuildTile key={b.id} build={b} index={i} onOpen={setOpen} hidden={open?.id === b.id} />
          ))}
        </div>
        <AnimatePresence>{open ? <DetailsPage key={open.id} build={open} onClose={() => setOpen(null)} /> : null}</AnimatePresence>
      </LayoutGroup>
    </section>
  )
}
