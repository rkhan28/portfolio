import { useLayoutEffect, useRef, useState } from 'react'
import { click, colorClass, cx, prefersReducedMotion, studPitch } from './util.js'

// Arrows leave the way they point, and a twin slides in from the opposite corner.
const ICON_DIR = { '↗': 'ne', '↘': 'se', '↓': 's', '→': 'e', '↑': 'n' }

export default function BrickButton({
  color = 'red',
  size = 'md',
  href,
  target,
  icon,
  disabled = false,
  type = 'button',
  sound = false,
  onClick,
  className,
  children,
}) {
  const ref = useRef(null)
  const [studs, setStuds] = useState(3)
  const Tag = href && !disabled ? 'a' : 'button'

  // One stud per 20px of width, re-counted when the label changes size.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const measure = () => setStuds(Math.max(2, Math.round((el.offsetWidth - 4) / studPitch(el))))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // A slight magnetic pull toward the pointer.
  function onPointerMove(e) {
    if (disabled || e.pointerType !== 'mouse' || prefersReducedMotion()) return
    const el = ref.current
    const r = el.getBoundingClientRect()
    el.style.setProperty('--bx', `${(((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(1)}px`)
    el.style.setProperty('--by', `${(((e.clientY - r.top) / r.height - 0.5) * 8).toFixed(1)}px`)
  }
  function onPointerLeave() {
    ref.current?.style.setProperty('--bx', '0px')
    ref.current?.style.setProperty('--by', '0px')
  }

  return (
    <Tag
      ref={ref}
      className={cx('rk-brick rk-btn', !disabled && 'rk-live', colorClass(disabled ? 'gray' : color), 'rk-btn-' + size, className)}
      href={Tag === 'a' ? href : undefined}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? disabled : undefined}
      onPointerDown={sound && !disabled ? () => click(1) : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={disabled ? undefined : onClick}
    >
      <span className="rk-studs-row" aria-hidden="true">
        {Array.from({ length: studs }, (_, i) => (
          <i key={i} style={{ '--k': i }} />
        ))}
      </span>
      <span className="rk-brick-body button">
        <span className="rk-roll">
          <span className="rk-roll-a">{children}</span>
          <span className="rk-roll-b" aria-hidden="true">
            {children}
          </span>
        </span>
        {icon ? (
          <span className={'rk-btn-icon rk-icon-' + (ICON_DIR[icon] || 'fade')} aria-hidden="true">
            <span className="rk-icon-a">{icon}</span>
            <span className="rk-icon-b">{icon}</span>
          </span>
        ) : null}
      </span>
    </Tag>
  )
}
