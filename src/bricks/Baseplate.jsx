import { forwardRef, useRef } from 'react'
import { cx } from './util.js'

const Baseplate = forwardRef(function Baseplate({ glow = true, height, as: Tag = 'div', className, style, children, ...rest }, outerRef) {
  const ref = useRef(null)

  function setRef(el) {
    ref.current = el
    if (typeof outerRef === 'function') outerRef(el)
    else if (outerRef) outerRef.current = el
  }

  function move(e) {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
    el.classList.add('rk-lit')
  }

  function leave() {
    ref.current?.classList.remove('rk-lit')
  }

  return (
    <Tag
      ref={setRef}
      className={cx('rk-baseplate', className)}
      style={{ minHeight: height, ...style }}
      onPointerMove={glow ? move : undefined}
      onPointerLeave={glow ? leave : undefined}
      {...rest}
    >
      {glow ? <div className="rk-baseplate-glow" aria-hidden="true" /> : null}
      <div className="rk-baseplate-content">{children}</div>
    </Tag>
  )
})

export default Baseplate
