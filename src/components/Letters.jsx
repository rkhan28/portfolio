import { Fragment } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// Big type whose letters drop in like bricks and wobble when the pointer passes over them.
export default function Letters({ as = 'h2', text, className }) {
  const reduced = useReducedMotion()
  const Tag = motion[as]
  let n = 0
  return (
    <Tag className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
      {text.split(' ').map((word, w, all) => (
        <Fragment key={w}>
          <span className="letters-word" aria-hidden="true">
            {[...word].map((ch) => {
              const i = n++
              return (
                <motion.span
                  key={i}
                  className="letter"
                  variants={{
                    hidden: reduced ? { y: 0 } : { y: -120, opacity: 0, rotate: (i % 2 ? 1 : -1) * 18 },
                    show: { y: 0, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 14, delay: i * 0.035 } },
                  }}
                  whileHover={reduced ? undefined : { y: -10, rotate: i % 2 ? 8 : -8, transition: { type: 'spring', stiffness: 500, damping: 10 } }}
                >
                  {ch}
                </motion.span>
              )
            })}
          </span>
          {w < all.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  )
}
