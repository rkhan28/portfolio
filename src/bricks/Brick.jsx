import { useRef, useState } from 'react'
import { click, colorClass, cx, studPitch } from './util.js'

function Studs() {
  return <span className="rk-studs" aria-hidden="true" />
}

export { Studs }

export default function Brick({
  color = 'red',
  studs = 2,
  tall = 1,
  href,
  target,
  onClick,
  drag = false,
  onDrop,
  sound = false,
  title,
  ariaLabel,
  className,
  style,
  children,
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const track = useRef(null)
  const justDragged = useRef(false)

  function onPointerDown(e) {
    if (!drag || e.button > 0) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // synthetic pointer: the drag still tracks
    }
    track.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false, el: e.currentTarget }
  }

  function onPointerMove(e) {
    const s = track.current
    if (!s) return
    const dx = e.clientX - s.sx
    const dy = e.clientY - s.sy
    if (!s.moved && Math.abs(dx) + Math.abs(dy) < 4) return
    if (!s.moved) {
      s.moved = true
      setDragging(true)
    }
    setPos({ x: s.ox + dx, y: s.oy + dy })
  }

  function onPointerUp() {
    const s = track.current
    track.current = null
    if (!s || !s.moved) return
    justDragged.current = true
    setDragging(false)

    // Dropped off the plate: the brick goes home.
    const plate = s.el.closest('.rk-baseplate')
    if (plate) {
      const p = plate.getBoundingClientRect()
      const b = s.el.getBoundingClientRect()
      const cxp = b.left + b.width / 2
      const cyp = b.top + b.height / 2
      if (cxp < p.left || cxp > p.right || cyp < p.top || cyp > p.bottom) {
        setPos({ x: 0, y: 0 })
        return
      }
    }

    const pitch = studPitch(s.el)
    setPos((q) => ({ x: Math.round(q.x / pitch) * pitch, y: Math.round(q.y / pitch) * pitch }))
    if (sound) click(0.9)
    onDrop?.()
  }

  function handleClick(e) {
    if (justDragged.current) {
      justDragged.current = false
      e.preventDefault()
      return
    }
    if (sound && !drag) click(1)
    onClick?.(e)
  }

  const Tag = href ? 'a' : onClick ? 'button' : 'div'
  const live = !!(href || onClick || drag)
  const brickStyle = { '--studs': studs, '--tall': tall, ...style }
  if (drag) brickStyle.transform = `translate(${pos.x}px, ${pos.y}px)`

  return (
    <Tag
      className={cx('rk-brick', colorClass(color), live && 'rk-live', drag && 'rk-drag', dragging && 'rk-dragging', className)}
      style={brickStyle}
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      type={Tag === 'button' ? 'button' : undefined}
      draggable={href ? false : undefined}
      title={title}
      aria-label={ariaLabel}
      onClick={live ? handleClick : undefined}
      onPointerDown={drag ? onPointerDown : undefined}
      onPointerMove={drag ? onPointerMove : undefined}
      onPointerUp={drag ? onPointerUp : undefined}
      onPointerCancel={drag ? onPointerUp : undefined}
    >
      <Studs />
      <span className="rk-brick-body button">{children}</span>
    </Tag>
  )
}
