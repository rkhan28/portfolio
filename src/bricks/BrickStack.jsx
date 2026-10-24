import { useEffect, useRef, useState } from 'react'
import Brick from './Brick.jsx'
import { cx, prefersReducedMotion } from './util.js'

const STACK_STUDS = [7, 5, 8, 6, 5, 7]
const STACK_OFFSET = [0, 1, -1, 2, 0, 1]
const CYCLE = ['blue', 'yellow', 'red', 'green', 'tan', 'white']

export default function BrickStack({ items = [], animate = true, sound = false, className }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(!animate)

  useEffect(() => {
    if (shown) return undefined
    const el = ref.current
    if (!el || !('IntersectionObserver' in window) || prefersReducedMotion()) {
      setShown(true)
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <ol ref={ref} className={cx('rk-stack', shown && 'rk-shown', className)}>
      {items.map((it, i) => {
        const label = String(it.label || '')
        const studs = it.studs || Math.max(STACK_STUDS[i % STACK_STUDS.length], Math.ceil((label.length * 8.6 + 32) / 20))
        const offset = it.offset != null ? it.offset : STACK_OFFSET[i % STACK_OFFSET.length]
        return (
          <li key={label} className="rk-stack-item" style={{ '--i': i, '--off': offset, zIndex: i + 1 }}>
            <Brick color={it.color || CYCLE[i % CYCLE.length]} studs={studs} tall={2} href={it.href} target={it.target} onClick={it.onClick} sound={sound}>
              {label}
            </Brick>
            {it.meta ? <span className="rk-stack-meta small">{it.meta}</span> : null}
          </li>
        )
      })}
    </ol>
  )
}
