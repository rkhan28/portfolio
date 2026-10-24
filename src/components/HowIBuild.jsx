import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Brick, PartsList } from '../bricks'

// The instruction booklet, played by scrolling: each step drops its bricks onto the tray and
// a small robot ("an agent") gets built. Scroll back up and it comes apart again.
const STEPS = [
  { title: 'Spot a five-minute chore I do every day.', parts: [{ name: '1x3 gray', count: 2, color: 'gray', studs: 3 }, { name: '1x2 blue', count: 4, color: 'blue' }] },
  { title: 'Decide it deserves its own agent.', parts: [{ name: '1x8 black', color: 'black', studs: 4 }, { name: '1x8 red', count: 3, color: 'red', studs: 4 }] },
  { title: 'Spend three days building it.', parts: [{ name: '1x2 yellow', count: 4, color: 'yellow' }, { name: '1x2 gray', count: 2, color: 'gray' }] },
  { title: 'Break it. Twice.', parts: [{ name: '1x6 white', count: 2, color: 'white', studs: 3 }, { name: '1x1 eye', count: 2, color: 'yellow', studs: 1 }] },
  { title: 'Fix it, test it, give it a name.', parts: [{ name: '1x2 antenna', color: 'gray' }, { name: '1x2 light', color: 'red' }] },
  { title: 'Five minutes saved. Every single day.', note: 'The ROI arrives eventually.', parts: [{ name: 'Five minutes', color: 'green', studs: 1 }] },
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

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const s = Math.min(N - 1, Math.max(0, Math.floor(p * N * 0.999)))
    if (s !== step) setStep(s)
  })

  const current = STEPS[step]
  return (
    <section id="how" className="how" ref={section} aria-label="How I build things">
      <div className="how-sticky">
        <div className="how-copy">
          <span className="label eyebrow">How I build things · instructions</span>
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
              <PartsList title={`Parts for step ${step + 1}`} parts={current.parts} className="how-parts" />
            </motion.div>
          </div>
          <div className="how-progress" aria-hidden="true">
            <motion.span className="how-progress-fill" style={{ width: fill }} />
          </div>
        </div>

        <div className="how-stage" aria-hidden="true">
          <div className={'robot' + (step === 3 ? ' robot-wobble' : '') + (step >= 4 ? ' robot-named' : '') + (step === 5 ? ' robot-alive' : '')}>
            {ROBOT.map((b, i) => (
              <RobotBrick key={i} b={b} index={i} progress={progress} />
            ))}
          </div>
          <div className="how-tray" />
          <span className="how-caption label">{step === 5 ? 'Agent online. Waving, mostly.' : 'Scroll to build'}</span>
        </div>
      </div>
    </section>
  )
}
