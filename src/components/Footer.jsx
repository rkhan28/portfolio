import { BrickButton, BrickToggle } from '../bricks'
import { links } from '../data/content.js'
import { usePrefs } from '../hooks/usePrefs.jsx'
import { useSmoothScroll } from '../motion/SmoothScroll.jsx'
import Letters from './Letters.jsx'

export default function Footer() {
  const { dark, setDark, sound, setSound, dropped } = usePrefs()
  const { scrollTo } = useSmoothScroll()
  const tally = dropped > 0 ? `You dropped ${dropped} brick${dropped === 1 ? '' : 's'} on the wall. I’ll sweep up later.` : 'Some assembly required.'
  return (
    <footer className="footer">
      <div className="footer-top">
        <Letters as="p" className="display-lg footer-line" text="Let’s build." />
        <BrickButton color="white" icon="↑" onClick={() => scrollTo(0, { duration: 1.8 })} sound={sound}>
          Back to the baseplate
        </BrickButton>
      </div>
      <p className="small muted footer-tally">{tally}</p>
      <div className="footer-row">
        <span className="small muted">© {new Date().getFullYear()} Rahmat Khan · Toronto</span>
        <div className="footer-toggles">
          <BrickToggle label="Night build" checked={dark} onChange={setDark} sound={sound} />
          <BrickToggle label="Click sounds" checked={sound} onChange={setSound} sound />
        </div>
        <nav className="footer-links small" aria-label="Elsewhere">
          <a href={links.github} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
          <a href={links.x} target="_blank" rel="noopener noreferrer">
            X ↗
          </a>
          <a href={links.resume} target="_blank" rel="noopener noreferrer">
            Résumé
          </a>
        </nav>
      </div>
    </footer>
  )
}
