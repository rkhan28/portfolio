import { Brick, BrickStack } from '../bricks'
import { experiments } from '../data/content.js'
import { usePrefs } from '../hooks/usePrefs.jsx'
import RevealWords from './RevealWords.jsx'

export default function Experiments() {
  const { sound } = usePrefs()
  return (
    <section id="experiments" className="section split">
      <div className="section-head">
        <span className="label eyebrow">Side projects · loose parts</span>
        <RevealWords as="h2" className="heading" text="Smaller experiments" />
        <p className="body muted experiments-intro">Weekend builds, stacked as they shipped. Hover a brick for the short version, click it for the code.</p>
        <p className="body muted experiments-intro-touch">Weekend builds, stacked as they shipped. Tap a brick for the code.</p>
      </div>
      <div>
        <BrickStack items={experiments.map((x) => ({ ...x, target: '_blank' }))} sound={sound} className="experiments-stack" />
        {/* Touch screens have no hover, so the short versions sit under the stack instead. */}
        <ul className="experiments-list">
          {experiments.map((x) => (
            <li key={x.label}>
              <a href={x.href} target="_blank" rel="noopener noreferrer">
                <Brick color={x.color} studs={2} className="rk-mini" />
                <span className="experiments-name">{x.label} ↗</span>
                <span className="small muted">{x.meta}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
