import { motion, useReducedMotion } from 'framer-motion'

// Words rise out of a mask, one after another, the first time they scroll into view.
export default function RevealWords({ as = 'h2', text, className, delay = 0 }) {
  const reduced = useReducedMotion()
  const Tag = motion[as]
  const words = text.split(' ')
  return (
    <Tag className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }}>
      {words.map((w, i) => (
        <span className="mask" key={i} aria-hidden="true">
          <motion.span
            className="mask-inner"
            variants={{
              hidden: reduced ? { y: 0 } : { y: '110%', rotate: 4 },
              show: { y: '0%', rotate: 0, transition: { type: 'spring', stiffness: 140, damping: 18, delay: delay + i * 0.08 } },
            }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
