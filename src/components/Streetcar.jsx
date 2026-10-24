import { useState } from 'react'
import { click } from '../bricks/util.js'
import { usePrefs } from '../hooks/usePrefs.jsx'

// The 510 runs along the bottom of the hero forever. Hover to hold it at the stop; click to ride to TTC Pulse.
export default function Streetcar() {
  const { sound } = usePrefs()
  const [held, setHeld] = useState(false)

  function ding() {
    setHeld(true)
    if (sound) {
      click(1)
      setTimeout(() => click(0.8), 140)
    }
  }

  return (
    <div className="road" aria-hidden={false}>
      <div className="road-rails" aria-hidden="true" />
      <div className={'streetcar-lane' + (held ? ' held' : '')}>
        <button
          type="button"
          className="streetcar"
          onPointerEnter={ding}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
          onClick={() => window.dispatchEvent(new CustomEvent('rk:show-build', { detail: { id: 'ttc-pulse' } }))}
          aria-label="510 Spadina streetcar. Ride to TTC Pulse"
        >
          <span className="sc-pole" aria-hidden="true" />
          <span className="sc-roof" aria-hidden="true" />
          <span className="sc-body" aria-hidden="true">
            <span className="sc-sign">510</span>
            <span className="sc-win" />
            <span className="sc-win" />
            <span className="sc-door" />
            <span className="sc-win" />
            <span className="sc-win" />
            <span className="sc-light" />
          </span>
          <span className="sc-wheels" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="sc-tip label">510 Spadina · arriving eventually</span>
        </button>
      </div>
    </div>
  )
}
