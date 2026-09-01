import { useMemo } from 'react'
import './BackgroundFX.css'

interface Ember {
  id: number
  left: number
  delay: number
  duration: number
  driftX: number
  size: number
}

function makeEmbers(count: number): Ember[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 5 + Math.random() * 6,
    driftX: (Math.random() - 0.5) * 60,
    size: 2 + Math.random() * 3
  }))
}

const STREAKS = [8, 18, 27, 63, 74, 86, 92]

export default function BackgroundFX(): React.JSX.Element {
  const embers = useMemo(() => makeEmbers(24), [])

  return (
    <div className="bg-fx" aria-hidden="true">
      <div className="bg-fx__glow-top" />
      <div className="bg-fx__glow-bottom" />
      <div className="bg-fx__grid" />
      {STREAKS.map((left, index) => (
        <div
          key={left}
          className="bg-fx__streak"
          style={{
            left: `${left}%`,
            animationDelay: `${index * 0.6}s`,
            opacity: index % 2 === 0 ? 0.5 : 0.3
          }}
        />
      ))}
      <div className="bg-fx__embers">
        {embers.map((ember) => (
          <span
            key={ember.id}
            className="bg-fx__ember"
            style={
              {
                left: `${ember.left}%`,
                width: `${ember.size}px`,
                height: `${ember.size}px`,
                animationDelay: `${ember.delay}s`,
                animationDuration: `${ember.duration}s`,
                '--drift-x': `${ember.driftX}px`
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}
