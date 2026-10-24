import { MotionConfig } from 'framer-motion'
import { PrefsProvider } from './hooks/usePrefs.jsx'
import { SmoothScroll } from './motion/SmoothScroll.jsx'
import Nav from './components/Nav.jsx'
import Scene from './components/Scene.jsx'
import Marquee from './components/Marquee.jsx'
import Builds from './components/Builds.jsx'
import HowIBuild from './components/HowIBuild.jsx'
import Experiments from './components/Experiments.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <PrefsProvider>
        <SmoothScroll>
          <a className="skip" href="#main">
            Skip to content
          </a>
          <Nav />
          <Scene />
          <Marquee />
          <main id="main">
            <Builds />
          </main>
          <HowIBuild />
          <div className="booklet">
            <Experiments />
            <About />
            <Contact />
          </div>
          <Marquee tone="red" reverse speed={1.6} />
          <Footer />
        </SmoothScroll>
      </PrefsProvider>
    </MotionConfig>
  )
}
