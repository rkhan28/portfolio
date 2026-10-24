import { useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'

const LINES = [
  'Some assembly required',
  'Ages 4 to 99',
  'Contains small parts',
  'Instructions not read',
  'Built in Toronto',
  'Snaps, doesn’t float',
  'Five minutes saved per day',
]

const wrap = (min, max, v) => {
  const r = max - min
  return ((((v - min) % r) + r) % r) + min
}

// A band of box-art warnings that never stops drifting; scrolling speeds it up and turns it around.
export default function Marquee({ tone = 'yellow', reverse = false, speed = 2.2 }) {
  const reduced = useReducedMotion()
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(velocity, [0, 1200], [0, 5], { clamp: false })
  const dir = useRef(reverse ? -1 : 1)
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (reduced) return
    const b = boost.get()
    if (b < -0.05) dir.current = reverse ? 1 : -1
    else if (b > 0.05) dir.current = reverse ? -1 : 1
    base.set(base.get() - dir.current * speed * (delta / 1000) * (1 + Math.abs(b)))
  })

  // the track holds the lines twice so the loop has no seam
  const items = [0, 1].flatMap((copy) =>
    LINES.flatMap((line) => [
      <span key={`${copy}-${line}`} className="marquee-item">
        {line}
      </span>,
      <span key={`${copy}-${line}-sep`} className="marquee-sep" aria-hidden="true" />,
    ]),
  )

  return (
    <div className={`marquee marquee-${tone}`} aria-label={LINES.join('. ')} role="note">
      <motion.div className="marquee-track label" style={{ x }} aria-hidden="true">
        {items}
      </motion.div>
    </div>
  )
}
