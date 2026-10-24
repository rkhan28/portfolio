import Brick from './Brick.jsx'
import { cx } from './util.js'

const PART_COLORS = ['blue', 'red', 'yellow', 'green', 'tan', 'gray']

export default function PartsList({ parts = [], title = 'Parts', className }) {
  return (
    <div className={cx('rk-parts', className)}>
      {title === false ? null : <span className="rk-parts-title label">{title}</span>}
      <ul className="rk-parts-list">
        {parts.map((p, i) => {
          const part = typeof p === 'string' ? { name: p } : p
          return (
            <li key={part.name} className="rk-part">
              <Brick color={part.color || PART_COLORS[i % PART_COLORS.length]} studs={part.studs || 2} className="rk-mini" />
              <span className="rk-part-count count">{(part.count || 1) + 'x'}</span>
              <span className="rk-part-name">{part.name}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
