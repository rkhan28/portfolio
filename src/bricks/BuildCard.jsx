import BrickButton from './BrickButton.jsx'
import PartsList from './PartsList.jsx'
import { cx } from './util.js'

export default function BuildCard({ id, step, title, kind, year, description, parts = [], links = [], sound, className, children }) {
  const n = step != null ? String(step).padStart(2, '0') : null
  const meta = [kind, year].filter(Boolean).join(' · ')
  return (
    <article id={id} className={cx('rk-build', className)}>
      <header className="rk-build-head">
        {n ? <span className="rk-build-step step">{n}</span> : null}
        {meta ? <span className="rk-build-meta label">{meta}</span> : null}
      </header>
      {children ? <div className="rk-build-art">{children}</div> : null}
      <h3 className="rk-build-title title">{title}</h3>
      {description ? <p className="rk-build-desc body">{description}</p> : null}
      {parts.length ? <PartsList parts={parts} /> : null}
      {links.length ? (
        <div className="rk-build-links">
          {links.map((l, i) => (
            <BrickButton
              key={l.label}
              size="sm"
              color={l.color || (i === 0 ? 'blue' : 'white')}
              href={l.href}
              target={l.target}
              icon={l.icon === undefined ? '↗' : l.icon}
              onClick={l.onClick}
              sound={sound}
            >
              {l.label}
            </BrickButton>
          ))}
        </div>
      ) : null}
    </article>
  )
}
