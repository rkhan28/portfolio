import { Baseplate, Brick } from '../bricks'

// Small brick builds used as illustrations. A column lists bricks bottom-up.
// --d is each brick's place in the build order, so cards can assemble them one by one.
export function Column({ children }) {
  return <div className="art-col">{children}</div>
}

const d = (n) => ({ '--d': n })

export function OnboardyArt() {
  return (
    <div className="art-row">
      {['12', '13', '14', '15', '16'].map((day, i) =>
        day === '14' ? (
          <Column key={day}>
            <Brick color="green" studs={2} tall={2} style={d(i)}>
              {day}
            </Brick>
            <Brick color="red" studs={3} tall={1.5} style={d(6)}>
              10:30
            </Brick>
          </Column>
        ) : (
          <Brick key={day} color="white" studs={2} tall={2} style={d(i)}>
            {day}
          </Brick>
        ),
      )}
    </div>
  )
}

export function TransitArt() {
  return (
    <Column>
      <Brick color="gray" studs={11} style={d(0)} />
      <Brick color="red" studs={6} tall={2} style={d(2)} className="art-tram">
        510 Spadina
      </Brick>
    </Column>
  )
}

export function PhishArt() {
  return (
    <Column>
      <Brick color="white" studs={10} tall={2} style={d(0)}>
        Verify your account
      </Brick>
      <Brick color="yellow" studs={8} tall={2} style={d(1)}>
        Urgent action
      </Brick>
      <Brick color="red" studs={2} tall={1.5} style={d(3)} className="art-alert">
        2
      </Brick>
    </Column>
  )
}

export function LearnScene() {
  return (
    <Baseplate glow={false} className="art-scene">
      <Column>
        <Brick color="green" studs={7} tall={1.5}>
          Build
        </Brick>
        <Brick color="red" studs={6} tall={1.5}>
          Break it
        </Brick>
        <Brick color="blue" studs={5} tall={1.5} className="learn-top">
          Try again
        </Brick>
      </Column>
    </Baseplate>
  )
}

// Tiny builds that pop out of hover words in About.
export function MiniAgent() {
  return (
    <Column>
      <Brick color="red" studs={4} />
      <Brick color="white" studs={3} tall={1.5} className="mini-eyes">
        • •
      </Brick>
      <Brick color="gray" studs={1} tall={0.5} />
    </Column>
  )
}

export function MiniLoop() {
  return (
    <div className="art-row">
      <Brick color="blue" studs={2} tall={1.5}>
        do
      </Brick>
      <Brick color="yellow" studs={2} tall={1.5} className="mini-spin">
        ↻
      </Brick>
      <Brick color="green" studs={3} tall={1.5}>
        done
      </Brick>
    </div>
  )
}
