import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Brick, PartsList } from '../bricks'

// The instruction booklet, played by scrolling: each step drops its bricks onto the tray and
// a small robot ("an agent") gets built. Scroll back up and it comes apart again.
// How I take a problem from vague to solved. Each step's parts are the practices it uses.
const STEPS = [
  {
    title: 'Find the real problem.',
    note: 'Talk to the people doing the work, map the workflow, and find where the time and errors actually go.',
    parts: [{ name: 'User interviews', color: 'gray', studs: 3 }, { name: 'Workflow map', color: 'blue' }],
  },
  {
    title: 'Define what solved looks like.',
    note: 'Pick a number worth moving (hours saved, errors avoided, response time) and agree on scope before writing code.',
    parts: [{ name: 'Success metric', color: 'black', studs: 3 }, { name: 'Scope', color: 'red', studs: 3 }],
  },
  {
    title: 'Ship the smallest useful version.',
    note: 'A working prototype in real hands within days, then iterate on what people actually use.',
    parts: [{ name: 'Prototype', color: 'yellow' }, { name: 'Feedback loop', count: 2, color: 'gray' }],
  },
  {
    title: 'Stress-test it until it breaks.',
    note: 'Edge cases, bad data and real traffic. Better I find the cracks than the users do.',
    parts: [{ name: 'Edge cases', count: 4, color: 'white', studs: 1 }, { name: 'Test suite', color: 'yellow', studs: 3 }],
  },
  {
    title: 'Harden it and hand it over.',
    note: 'Tests, monitoring and clear docs, so it keeps working without me in the room.',
    parts: [{ name: 'Monitoring', color: 'gray' }, { name: 'Docs', color: 'red' }],
  },
  {
    title: 'Measure the result.',
    note: 'Compare against the number from step two. Solved means measurably better, not just shipped.',
    parts: [{ name: 'Measurable outcome', color: 'green', studs: 3 }],
  },
]

// Robot bricks in stud units from its bottom-left corner. s = the step that adds it.
const ROBOT = [
  { s: 0, c: 1, row: 0, w: 3, color: 'gray' },
  { s: 0, c: 6, row: 0, w: 3, color: 'gray' },
  { s: 0, c: 2, row: 1, w: 2, color: 'blue' },
  { s: 0, c: 6, row: 1, w: 2, color: 'blue' },
  { s: 0, c: 2, row: 2, w: 2, color: 'blue' },
  { s: 0, c: 6, row: 2, w: 2, color: 'blue' },
  { s: 1, c: 1, row: 3, w: 8, color: 'black' },
  { s: 1, c: 1, row: 4, w: 8, color: 'red' },
  { s: 1, c: 1, row: 5, w: 8, color: 'red', name: true },
  { s: 1, c: 1, row: 6, w: 8, color: 'red' },
  { s: 2, c: -1, row: 4, w: 2, color: 'gray', arm: 'l' },
  { s: 2, c: -1, row: 5, w: 2, color: 'yellow', arm: 'l' },
  { s: 2, c: -1, row: 6, w: 2, color: 'yellow', arm: 'l' },
  { s: 2, c: 9, row: 4, w: 2, color: 'gray', arm: 'r' },
  { s: 2, c: 9, row: 5, w: 2, color: 'yellow', arm: 'r' },
  { s: 2, c: 9, row: 6, w: 2, color: 'yellow', arm: 'r' },
  { s: 3, c: 4, row: 7, w: 2, color: 'gray' },
  { s: 3, c: 2, row: 8, w: 6, color: 'white' },
  { s: 3, c: 2, row: 9, w: 1, color: 'white' },
  { s: 3, c: 3, row: 9, w: 1, color: 'yellow', eye: true },
  { s: 3, c: 4, row: 9, w: 2, color: 'white' },
  { s: 3, c: 6, row: 9, w: 1, color: 'yellow', eye: true },
  { s: 3, c: 7, row: 9, w: 1, color: 'white' },
  { s: 3, c: 2, row: 10, w: 6, color: 'white' },
  { s: 4, c: 4, row: 11, w: 2, color: 'gray' },
  { s: 4, c: 4, row: 12, w: 2, color: 'red', light: true },
]

const N = STEPS.length

function RobotBrick({ b, progress, index }) {
  const inStep = ROBOT.filter((x) => x.s === b.s)
  const k = inStep.indexOf(b)
  const start = (b.s + (k / inStep.length) * 0.62) / N
  const end = start + 0.32 / N
  const y = useTransform(progress, [start, end], [-520, 0])
  const opacity = useTransform(progress, [start, start + 0.04 / N], [0, 1])
  return (
    <motion.div
      className={'robot-brick' + (b.eye ? ' robot-eye' : '') + (b.light ? ' robot-light' : '') + (b.arm ? ` robot-arm-${b.arm}` : '')}
      style={{ '--c': b.c + 1, '--row': b.row, y, opacity, zIndex: 10 + b.row, '--i': index }}
    >
      <Brick color={b.color} studs={b.w}>
        {b.name ? <span className="robot-name">rk-01</span> : null}
      </Brick>
    </motion.div>
  )
}

export default function HowIBuild() {
  const reduced = useReducedMotion()
  const section = useRef(null)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.6 })
  const progress = reduced ? scrollYProgress : smooth
  const [step, setStep] = useState(0)
  const fill = useTransform(progress, [0, 1], ['0%', '100%'])
  const stage = useRef(null)

  // The robot sizes its studs to the stage, so its head never pokes out on short screens.
  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return undefined
    const fit = () => {
      const room = el.clientHeight * 0.9 - 14 - 16
      const p = Math.max(8, Math.min(22, Math.floor(room / 13.4 / 1.2), Math.floor((el.clientWidth * 0.9) / 12)))
      el.style.setProperty('--p', `${p}px`)
      el.style.setProperty('--h', `${Math.round(p * 1.2)}px`)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const s = Math.min(N - 1, Math.max(0, Math.floor(p * N * 0.999)))
    if (s !== step) setStep(s)
  })

  const current = STEPS[step]
  return (
    <section id="how" className="how" ref={section} aria-label="How I solve problems">
      <div className="how-sticky">
        <div className="how-copy">
          <span className="label eyebrow">How I solve problems · instructions</span>
          <div className="how-step" aria-live="polite">
            <span className="how-step-label label">Step</span>
            <span className="how-step-num step">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={step}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                >
                  {String(step + 1).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="how-step-of label">/ {String(N).padStart(2, '0')}</span>
          </div>
          <div className="how-title-wrap">
            {/* Keyed, not queued: a fast flick lands straight on the current step instead of waiting out old exits. */}
            <motion.div
              key={step}
              initial={{ y: 24, opacity: 0, filter: 'blur(6px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <h2 className="heading how-title">{current.title}</h2>
              {current.note ? <p className="lead muted how-note">{current.note}</p> : null}
              <PartsList title={`Toolkit for step ${step + 1}`} parts={current.parts} className="how-parts" />
            </motion.div>
          </div>
          <div className="how-progress" aria-hidden="true">
            <motion.span className="how-progress-fill" style={{ width: fill }} />
          </div>
        </div>

        <div className="how-stage" ref={stage} aria-hidden="true">
          <div className={'robot' + (step === 3 ? ' robot-wobble' : '') + (step >= 4 ? ' robot-named' : '') + (step === 5 ? ' robot-alive' : '')}>
            {ROBOT.map((b, i) => (
              <RobotBrick key={i} b={b} index={i} progress={progress} />
            ))}
          </div>
          <div className="how-tray" />
          <span className="how-caption label">{step === 5 ? 'Solved, measured, still waving.' : 'Scroll to build'}</span>
        </div>
      </div>
    </section>
  )
}
