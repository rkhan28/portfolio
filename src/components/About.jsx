import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { BrickButton, FlipTile } from '../bricks'
import { about, links } from '../data/content.js'
import { usePrefs } from '../hooks/usePrefs.jsx'
import { LearnScene, MiniAgent, MiniLoop, OnboardyArt } from './Art.jsx'
import RevealWords from './RevealWords.jsx'

// Each word lights up as the paragraph scrolls past, like reading along with a finger.
function ReadAlong({ text, className }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className={className} style={{ position: 'relative' }}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} reduced={reduced}>
          {w + (i < words.length - 1 ? ' ' : '')}
        </Word>
      ))}
    </p>
  )
}

function Word({ progress, range, reduced, children }) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return <motion.span style={{ opacity: reduced ? 1 : opacity }}>{children}</motion.span>
}

// Underlined words pop a tiny brick build above themselves on hover, focus or tap.
// The card is nudged sideways so it never hangs off a phone screen.
function PopWord({ children, art, caption }) {
  const [open, setOpen] = useState(false)
  const word = useRef(null)
  const card = useRef(null)

  useLayoutEffect(() => {
    if (!open || !card.current || !word.current) return
    const w = card.current.offsetWidth
    const r = word.current.getBoundingClientRect()
    const left = r.left + r.width / 2 - w / 2
    const clamped = Math.min(Math.max(left, 12), window.innerWidth - 12 - w)
    card.current.style.marginLeft = `${clamped - left}px`
  }, [open])

  return (
    <span ref={word} className="popword" onPointerEnter={() => setOpen(true)} onPointerLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} tabIndex={0}>
      {children}
      <AnimatePresence>
        {open ? (
          <motion.span
            ref={card}
            className="popword-card"
            role="tooltip"
            initial={{ opacity: 0, y: 14, scale: 0.6, rotate: -8 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -2 }}
            exit={{ opacity: 0, y: 8, scale: 0.8, rotate: 4, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          >
            <span className="popword-art">{art}</span>
            <span className="small popword-caption">{caption}</span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  )
}

export default function About() {
  const { sound } = usePrefs()
  return (
    <section id="about" className="section split">
      <div className="about-copy">
        <span className="label eyebrow">About · the builder</span>
        <RevealWords as="h2" className="heading" text="A little about me" />
        <ReadAlong className="lead" text={about.lead} />
        <p className="body muted">
          Lately, that’s meant <PopWord art={<MiniAgent />} caption="Agents: tiny robots for chores.">AI agents</PopWord>,{' '}
          <PopWord art={<MiniLoop />} caption="Do it once. Never again.">automation</PopWord>, and{' '}
          <PopWord art={<div className="popword-scale"><OnboardyArt /></div>} caption="Onboardy, build 01.">Onboardy</PopWord>. I’m interested in the
          messy part between a promising idea and software someone can actually use.
        </p>
        <p className="body muted">{about.body[1]}</p>
        <div className="row">
          <BrickButton size="sm" color="blue" href={links.github} target="_blank" icon="↗" sound={sound}>
            GitHub
          </BrickButton>
          <BrickButton size="sm" color="white" href={links.resume} target="_blank" sound={sound}>
            Résumé
          </BrickButton>
          <BrickButton size="sm" color="black" href={links.x} target="_blank" icon="↗" sound={sound}>
            X
          </BrickButton>
        </div>
      </div>
      <div className="about-tile">
        <div className="float">
          <FlipTile
            front={<LearnScene />}
            caption="How I learn things. Click to turn it over."
            rotate={-4}
            width="min(320px, 100%)"
            sound={sound}
            back={
              <>
                <span>{about.quote}</span>
                <span className="small scene-tile-note">{about.quoteNote}</span>
              </>
            }
          />
        </div>
      </div>
    </section>
  )
}
