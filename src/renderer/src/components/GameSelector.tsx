import type { GameEntry } from '../data/games'
import './GameSelector.css'

interface GameSelectorProps {
  games: GameEntry[]
  index: number
  onChange: (index: number) => void
}

export default function GameSelector({ games, index, onChange }: GameSelectorProps): React.JSX.Element {
  const game = games[index]
  const canCycle = games.length > 1

  function goPrev(): void {
    onChange((index - 1 + games.length) % games.length)
  }

  function goNext(): void {
    onChange((index + 1) % games.length)
  }

  return (
    <div className="game-selector">
      {canCycle && (
        <button className="game-selector__arrow" onClick={goPrev} aria-label="Previous game">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div className="game-selector__display">
        <span className="game-selector__big">{game.shortLabel}</span>
        <span className="game-selector__full">{game.fullName}</span>
        {game.status === 'coming-soon' && <span className="game-selector__badge">Coming soon</span>}
      </div>

      {canCycle && (
        <button className="game-selector__arrow" onClick={goNext} aria-label="Next game">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
