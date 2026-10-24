// "rk." drawn on a stud grid, top row first. X = a stud of brick.
// Columns: r (0–4), gap, k (6–11), gap, . (13–14). Nine rows tall.
const RK = [
  '......XX.......',
  '......XX.......',
  '......XX.......',
  'XX.XX.XX..XX...',
  'XXX...XX.XX....',
  'XX....XXXX.....',
  'XX....XXXXX....',
  'XX....XX.XX..XX',
  'XX....XX..XX.XX',
]

// Which letter a column belongs to, for colouring.
const letterOf = (c) => (c <= 4 ? 'r' : c <= 11 ? 'k' : 'dot')
const LETTER_COLOR = { r: 'red', k: 'yellow', dot: 'blue' }
const ACCENTS = ['white', 'red', 'blue', 'yellow', 'tan']

// Small deterministic random so the sculpture looks the same on every visit.
function seeded(seed) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

// Split each row's runs into bricks of 1–4 studs, alternating split points so rows interlock.
export function sculptureBricks() {
  const rand = seeded(416)
  const rows = RK.length
  const bricks = []
  RK.forEach((line, i) => {
    const row = rows - 1 - i
    let c = 0
    while (c < line.length) {
      if (line[c] !== 'X') {
        c++
        continue
      }
      let end = c
      while (end < line.length && line[end] === 'X' && letterOf(end) === letterOf(c)) end++
      let run = end - c
      let start = c
      // odd rows lead with a shorter brick so joints stagger
      let first = row % 2 && run > 3 ? 1 + (run % 3 || 2) : 0
      while (run > 0) {
        const w = first || Math.min(run, run === 5 ? 3 : 4)
        first = 0
        const base = LETTER_COLOR[letterOf(start)]
        const color = rand() < 0.22 ? ACCENTS[Math.floor(rand() * ACCENTS.length)] : base
        bricks.push({ c: start, row, w, color })
        start += w
        run -= w
      }
      c = end
    }
  })
  return { bricks, cols: RK[0].length, rows }
}
