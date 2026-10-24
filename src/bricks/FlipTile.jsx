import { useRef, useState } from 'react'
import { click, cx, prefersReducedMotion } from './util.js'

export default function FlipTile({ front, back, caption, rotate = -3, width, defaultFlipped = false, onFlip, sound = false, className, style }) {
  const [flipped, setFlipped] = useState(defaultFlipped)
  const ref = useRef(null)

  function tilt(e) {
    const el = ref.current
    if (!el || prefersReducedMotion() || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--tx', `${(y * -8).toFixed(2)}deg`)
    el.style.setProperty('--ty', `${(x * 10).toFixed(2)}deg`)
  }

  function untilt() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tx', '0deg')
    el.style.setProperty('--ty', '0deg')
  }

  function flip() {
    setFlipped(!flipped)
    if (sound) click(0.6)
    onFlip?.(!flipped)
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cx('rk-flip', flipped && 'rk-flipped', className)}
      style={{ '--rot': `${rotate}deg`, width, ...style }}
      aria-pressed={flipped}
      onClick={flip}
      onPointerMove={tilt}
      onPointerLeave={untilt}
    >
      <span className="rk-flip-inner">
        <span className="rk-flip-face rk-flip-front" aria-hidden={flipped}>
          <span className="rk-flip-media">{front}</span>
          {caption ? <span className="rk-flip-caption small">{caption}</span> : null}
        </span>
        <span className="rk-flip-face rk-flip-back title" aria-hidden={!flipped}>
          {back}
        </span>
      </span>
    </button>
  )
}
