import { useState } from 'react'
import { Studs } from './Brick.jsx'
import { click, colorClass, cx } from './util.js'

export default function BrickToggle({ checked, defaultChecked = false, onChange, label, color = 'green', disabled = false, sound = false, className }) {
  const controlled = checked != null
  const [inner, setInner] = useState(defaultChecked)
  const on = controlled ? !!checked : inner

  // onChange also gets the switch's centre, so a theme change can spread out from it.
  function toggle(e) {
    const next = !on
    const r = e.currentTarget.getBoundingClientRect()
    if (!controlled) setInner(next)
    if (sound) click(0.8)
    onChange?.(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }

  return (
    <label className={cx('rk-toggle', on && 'rk-on', disabled && 'rk-toggle-disabled', className)}>
      <button type="button" role="switch" aria-checked={on} className="rk-toggle-track" onClick={toggle} disabled={disabled}>
        <span className={cx('rk-brick rk-toggle-knob', on ? colorClass(color) : 'rk-c-off')}>
          <Studs />
          <span className="rk-brick-body" />
        </span>
      </button>
      {label ? <span className="rk-toggle-label">{label}</span> : null}
    </label>
  )
}
