import { click } from '../bricks/util.js'
import { sculptureBricks } from './letters.js'

// A tiny brick physics world for the hero: a studded wall with a street at the bottom.
// Bricks fall in stud columns and stack on whatever is below them. Everything moves with the
// Web Animations API, so React never re-renders during motion.

const DROP_COLORS = ['red', 'yellow', 'blue', 'white', 'tan', 'black', 'gray', 'green']
const rand = (a, b) => a + Math.random() * (b - a)
const pick = (list) => list[Math.floor(Math.random() * list.length)]
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export default class BrickWorld {
  constructor(root, { reduced = false, sound = () => false, onEvent = () => {}, road = 56 } = {}) {
    this.root = root
    this.reduced = reduced
    this.sound = sound
    this.onEvent = onEvent
    this.road = road
    this.sculpt = []
    this.drops = []
    this.mode = 'idle'
    this.timers = new Set()
    this.lastClick = 0
    this.dropped = 0
    this.measure()
  }

  // ---------- geometry ----------
  measure() {
    const W = this.root.clientWidth
    const Hh = this.root.clientHeight
    this.P = W < 400 ? 14 : W < 600 ? 16 : W < 1100 ? 20 : 26
    this.H = Math.round(this.P * 1.2)
    this.studH = Math.max(3, Math.round(this.P * 0.22))
    this.cols = Math.floor(W / this.P)
    this.offX = Math.round((W - this.cols * this.P) / 2)
    this.ground = Hh - this.road
    this.wide = W >= 900
    const s = this.root.style
    s.setProperty('--stud-pitch', `${this.P}px`)
    s.setProperty('--stud-size', `${Math.round(this.P * 0.6)}px`)
    s.setProperty('--brick-height', `${this.H}px`)
    s.setProperty('--world-stud-h', `${this.studH}px`)
    // the sculpture stands on the right on wide screens, centred on narrow ones
    const { cols } = sculptureBricks()
    this.sx = this.wide ? Math.max(0, this.cols - cols - Math.round(this.cols * 0.07)) : Math.max(0, Math.floor((this.cols - cols) / 2))
    // dropped piles stay low enough not to bury the copy; on the sculpture they may climb a little higher
    this.maxRows = this.wide ? 7 : 4
    this.sculptCap = this.wide ? 12 : 10
  }

  onSculpture(c, w) {
    return c + w > this.sx && c < this.sx + 15
  }

  // How many rows a pile may reach in these columns: higher on the sculpture, never into the copy.
  limitFor(c, w) {
    if (this.onSculpture(c, w)) return this.sculptCap
    const k = this.ceiling
    if (k && this.X(c + w) > k.left && this.X(c) < k.right) {
      return Math.max(0, Math.min(this.maxRows, Math.floor((this.ground - k.bottom - 12) / this.H)))
    }
    return this.maxRows
  }

  X(c) {
    return this.offX + c * this.P
  }
  Y(row) {
    return this.ground - (row + 1) * this.H - this.studH
  }

  heightsFrom(list) {
    const h = new Array(this.cols).fill(0)
    for (const b of list) for (let i = 0; i < b.w; i++) if (b.c + i < this.cols) h[b.c + i] = Math.max(h[b.c + i], b.row + 1)
    return h
  }
  get heights() {
    return this.heightsFrom([...this.sculpt.filter((b) => b.home), ...this.drops])
  }
  landingRow(c, w, heights = this.heights) {
    let row = 0
    for (let i = 0; i < w; i++) row = Math.max(row, heights[c + i] || 0)
    return row
  }

  // ---------- elements ----------
  make(color, w, kind) {
    const el = document.createElement('div')
    el.className = `rk-brick rk-c-${color} wb wb-${kind}`
    el.style.setProperty('--studs', w)
    el.innerHTML = '<span class="rk-studs"></span><span class="rk-brick-body"></span>'
    this.root.appendChild(el)
    return el
  }
  place(b) {
    b.el.style.left = `${this.X(b.c)}px`
    b.el.style.top = `${this.Y(b.row)}px`
    b.el.style.zIndex = String(10 + b.row)
  }
  later(fn, ms) {
    const t = setTimeout(() => {
      this.timers.delete(t)
      fn()
    }, ms)
    this.timers.add(t)
    return t
  }
  tick(strength = 0.6) {
    if (!this.sound()) return
    const now = performance.now()
    if (now - this.lastClick < 45) return
    this.lastClick = now
    click(strength)
  }

  // A brick falls from above the wall into its slot, squashes and settles.
  fall(b, delay = 0) {
    this.place(b)
    if (this.reduced) return 0
    // always start above the top edge, even if the wall hasn't been measured yet
    const from = -Math.max(this.H * 4, this.Y(b.row) + this.H * 2 + rand(20, 160))
    const fallMs = clamp(Math.sqrt(-from) * 24, 360, 900)
    const total = fallMs / 0.72
    b.el.animate(
      [
        { transform: `translate3d(0, ${from}px, 0)`, easing: 'cubic-bezier(.55, 0, 1, .45)' },
        { transform: 'translate3d(0, 0, 0)', offset: 0.72, easing: 'ease-out' },
        { transform: 'translate3d(0, 0, 0) scale(1.04, .88)', offset: 0.82, easing: 'ease-out' },
        { transform: 'translate3d(0, -5px, 0) scale(.98, 1.03)', offset: 0.92, easing: 'ease-in-out' },
        { transform: 'translate3d(0, 0, 0)' },
      ],
      { duration: total, delay, fill: 'backwards' },
    )
    this.later(() => this.tick(rand(0.45, 0.8)), delay + fallMs)
    return delay + total
  }

  // A brick flies along an arc to a new slot, spinning whole turns so it lands flat.
  fly(b, toC, toRow, { delay = 0, dur = rand(820, 1250), lift = rand(90, 240), spin = 360 * Math.round(rand(-2, 2)) } = {}) {
    if (this.reduced) {
      b.c = toC
      b.row = toRow
      this.place(b)
      return Promise.resolve()
    }
    const dx = this.X(toC) - this.X(b.c)
    const dy = this.Y(toRow) - this.Y(b.row)
    const peak = Math.min(0, dy) - lift
    b.el.style.zIndex = '60'
    const anim = b.el.animate(
      [
        { transform: 'translate3d(0, 0, 0) rotate(0deg)', easing: 'cubic-bezier(.15, .6, .4, 1)' },
        { transform: `translate3d(${dx * 0.45}px, ${peak}px, 0) rotate(${spin * 0.5}deg)`, offset: 0.42, easing: 'cubic-bezier(.6, 0, 1, .6)' },
        { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${spin}deg)`, offset: 0.84, easing: 'ease-out' },
        { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${spin}deg) scale(1.04, .9)`, offset: 0.92, easing: 'ease-in-out' },
        { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${spin}deg)` },
      ],
      { duration: dur, delay, fill: 'forwards' },
    )
    this.later(() => this.tick(0.7), delay + dur * 0.84)
    return anim.finished.then(() => {
      b.c = toC
      b.row = toRow
      this.place(b)
      anim.cancel()
    }).catch(() => {})
  }

  // ---------- the sculpture ----------
  build(startDelay = 250) {
    this.clearSculpture()
    const { bricks } = sculptureBricks()
    let end = 0
    const order = [...bricks].sort((a, b) => a.row - b.row || a.c - b.c)
    this.mode = 'building'
    order.forEach((spec, i) => {
      const b = { ...spec, c: this.sx + spec.c, kind: 'sculpt', home: { c: this.sx + spec.c, row: spec.row } }
      b.el = this.make(spec.color, spec.w, 'sculpt')
      b.el.addEventListener('click', (e) => {
        e.stopPropagation()
        this.pop(b)
      })
      this.sculpt.push(b)
      end = Math.max(end, this.fall(b, startDelay + spec.row * 105 + (spec.c % 5) * 22 + i * 4 + rand(0, 50)))
    })
    this.later(() => {
      this.mode = 'idle'
      this.onEvent('built')
    }, end)
    return end
  }

  clearSculpture() {
    for (const b of this.sculpt) b.el.remove()
    this.sculpt = []
  }

  // Click one brick: it hops out, lands on the street, then climbs back into its slot.
  pop(b) {
    if (this.mode !== 'idle' || b.busy) return
    b.busy = true
    const home = b.home
    const side = Math.random() < 0.5 ? -1 : 1
    const toC = clamp(home.c + side * Math.round(rand(4, 10)), 0, this.cols - b.w)
    const toRow = this.landingRow(toC, b.w, this.heightsFrom(this.drops))
    this.onEvent('pop')
    this.fly(b, toC, toRow, { dur: rand(700, 900), lift: rand(80, 140) }).then(() => {
      this.later(() => {
        this.fly(b, home.c, home.row, { dur: 760, lift: 120, spin: 0 }).then(() => {
          b.busy = false
        })
      }, 1600)
    })
  }

  // Everything comes down in a heap, then the sculpture rebuilds itself.
  knockDown() {
    if (this.mode !== 'idle') return false
    this.mode = 'knocked'
    this.onEvent('knocked')
    const all = [...this.sculpt, ...this.drops].sort(() => Math.random() - 0.5)
    const heights = new Array(this.cols).fill(0)
    const landed = []
    for (const b of all) {
      const toC = clamp(b.c + Math.round(rand(-9, 9)), 0, this.cols - b.w)
      let row = 0
      for (let i = 0; i < b.w; i++) row = Math.max(row, heights[toC + i])
      for (let i = 0; i < b.w; i++) heights[toC + i] = row + 1
      landed.push(this.fly(b, toC, row, { delay: rand(0, 220) }))
    }
    Promise.all(landed).then(() => this.later(() => this.rebuild(), 1400))
    return true
  }

  rebuild() {
    this.mode = 'rebuilding'
    this.onEvent('rebuilding')
    // stray bricks get swept off the street
    for (const b of this.drops) this.sweep(b, rand(0, 300))
    this.drops = []
    const order = [...this.sculpt].sort((a, b) => a.home.row - b.home.row || a.home.c - b.home.c)
    const arrivals = order.map((b, i) => this.fly(b, b.home.c, b.home.row, { delay: 300 + i * 26, dur: rand(700, 950), lift: rand(140, 260), spin: 360 * Math.round(rand(-1, 1)) }))
    Promise.all(arrivals).then(() => {
      this.mode = 'idle'
      this.onEvent('built')
    })
  }

  sweep(b, delay = 0) {
    if (this.reduced) {
      b.el.remove()
      return
    }
    const anim = b.el.animate(
      [
        { transform: 'translate3d(0, 0, 0)', opacity: 1 },
        { transform: `translate3d(${rand(-40, 40)}px, ${this.road + 60}px, 0) rotate(${rand(-30, 30)}deg)`, opacity: 0 },
      ],
      { duration: 520, delay, easing: 'cubic-bezier(.5, 0, .9, .4)', fill: 'forwards' },
    )
    anim.finished.then(() => b.el.remove()).catch(() => b.el.remove())
  }

  // ---------- visitors and weather ----------
  dropAt(px, { ambient = false } = {}) {
    if (this.mode === 'knocked' || this.mode === 'rebuilding') return null
    const w = ambient ? pick([1, 2, 2, 3]) : pick([1, 2, 2, 3, 4])
    const c = clamp(Math.floor((px - this.offX) / this.P - w / 2 + 0.5), 0, this.cols - w)
    const row = this.landingRow(c, w)
    if (row >= this.limitFor(c, w)) {
      this.onEvent('full')
      return null
    }
    const b = { c, row, w, kind: 'drop', color: pick(DROP_COLORS) }
    b.el = this.make(b.color, w, 'drop')
    this.drops.push(b)
    this.fall(b)
    if (!ambient) {
      this.dropped++
      this.onEvent('drop', this.dropped)
    }
    // too many on the street: sweep the oldest half away
    if (this.drops.length > 70) this.tidy(35)
    return b
  }

  ambientDrop() {
    if (this.mode !== 'idle') return
    // weather falls away from the copy on wide screens
    const W = this.root.clientWidth
    const x = this.wide ? rand(W * 0.5, W * 0.98) : rand(0, W)
    const avoid = this.sculpt.length ? [this.X(this.sx) - this.P, this.X(this.sx + 15) + this.P] : null
    if (avoid && x > avoid[0] && x < avoid[1]) return
    this.dropAt(x, { ambient: true })
  }

  tidy(count = this.drops.length) {
    const gone = this.drops.splice(0, count)
    gone.forEach((b, i) => this.sweep(b, i * 12))
    // anything left floating settles down onto what remains
    const rest = this.drops
    this.drops = []
    for (const b of rest) {
      const row = this.landingRow(b.c, b.w)
      this.drops.push(b)
      if (row !== b.row) this.fly(b, b.c, row, { dur: 420, lift: 0, spin: 0 })
    }
    this.onEvent('swept')
  }

  // New size: clear the street and stand the sculpture back up, without the show.
  resize() {
    for (const t of this.timers) clearTimeout(t)
    this.timers.clear()
    for (const b of this.drops) b.el.remove()
    this.drops = []
    this.measure()
    const reduced = this.reduced
    this.reduced = true
    this.build(0)
    this.reduced = reduced
    this.mode = 'idle'
  }

  destroy() {
    for (const t of this.timers) clearTimeout(t)
    this.timers.clear()
    for (const b of [...this.sculpt, ...this.drops]) b.el.remove()
    this.sculpt = []
    this.drops = []
  }
}
