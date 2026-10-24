import { useEffect, useRef, useState } from 'react'
import { Baseplate, BrickButton } from '../bricks'
import { prefersReducedMotion } from '../bricks/util.js'
import { links, profile } from '../data/content.js'
import { usePrefs } from '../hooks/usePrefs.jsx'
import Letters from './Letters.jsx'

const BURST = ['red', 'yellow', 'blue', 'white', 'green', 'tan']

// Copying the email throws a handful of bricks out of the button. They fall off the page.
function burst(from) {
  if (prefersReducedMotion()) return
  const r = from.getBoundingClientRect()
  for (let i = 0; i < 16; i++) {
    const el = document.createElement('div')
    const w = 1 + Math.floor(Math.random() * 3)
    el.className = `rk-brick rk-c-${BURST[i % BURST.length]} confetti-brick`
    el.style.setProperty('--studs', w)
    el.innerHTML = '<span class="rk-studs"></span><span class="rk-brick-body"></span>'
    el.style.left = `${r.left + r.width / 2}px`
    el.style.top = `${r.top + r.height / 2}px`
    document.body.appendChild(el)
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2
    const speed = 260 + Math.random() * 320
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed
    const g = 1400
    const t = 1.1 + Math.random() * 0.5
    const frames = []
    for (let k = 0; k <= 12; k++) {
      const s = (t * k) / 12
      frames.push({ transform: `translate(${vx * s}px, ${vy * s + 0.5 * g * s * s}px) rotate(${(vx / 3) * s}deg)`, opacity: k > 9 ? (12 - k) / 3 : 1 })
    }
    el.animate(frames, { duration: t * 1000, easing: 'linear', fill: 'forwards' }).finished.finally(() => el.remove())
  }
}

export default function Contact() {
  const { sound } = usePrefs()
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)
  const copyWrap = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      burst(copyWrap.current)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = links.email
    }
  }

  return (
    <section id="contact" className="section">
      <Baseplate className="contact-plate">
        <span className="label contact-eyebrow">Last step · 07</span>
        <Letters as="h2" className="display-lg contact-title" text="What are you working on?" />
        <p className="lead contact-sub">Bring the idea. I’ll bring the bricks.</p>
        <a className="lead contact-email" href={links.email}>
          {profile.email} <span aria-hidden="true">↗</span>
        </a>
        <div className="row contact-actions">
          <BrickButton size="lg" color="red" href={links.email} icon="↗" sound={sound}>
            Say hello
          </BrickButton>
          <span ref={copyWrap} className="copy-wrap">
            <BrickButton size="lg" color="yellow" onClick={copy} sound={sound}>
              {copied ? 'Copied. Bricks everywhere.' : 'Copy email'}
            </BrickButton>
          </span>
          <span className="visually-hidden" aria-live="polite">
            {copied ? 'Email copied' : ''}
          </span>
        </div>
      </Baseplate>
    </section>
  )
}
