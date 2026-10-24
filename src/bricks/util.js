const COLORS = ['red', 'yellow', 'blue', 'green', 'tan', 'white', 'black', 'gray']

export const cx = (...names) => names.filter(Boolean).join(' ')

export const colorClass = (color) => 'rk-c-' + (COLORS.includes(color) ? color : 'red')

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function studPitch(el) {
  const v = el && parseFloat(getComputedStyle(el).getPropertyValue('--stud-pitch'))
  return v > 0 ? v : 20
}

// A short synthesized plastic click. Callers only play it when the visitor has turned sounds on.
let audio = null
export function click(strength = 1) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)()
    const len = Math.floor(audio.sampleRate * 0.028)
    const buf = audio.createBuffer(1, len, audio.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 7)
    const src = audio.createBufferSource()
    const filter = audio.createBiquadFilter()
    const gain = audio.createGain()
    src.buffer = buf
    filter.type = 'bandpass'
    filter.frequency.value = 2600
    filter.Q.value = 1.4
    gain.gain.value = 0.32 * strength
    src.connect(filter)
    filter.connect(gain)
    gain.connect(audio.destination)
    src.start()
  } catch {
    // no audio available: stay silent
  }
}
