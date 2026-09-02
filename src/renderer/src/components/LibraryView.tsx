import type { LibraryEntry } from '@shared/types'
import { GAME_CATALOG } from '@shared/gameDefinitions'
import CoverArt from './CoverArt'
import './LibraryView.css'

interface LibraryViewProps {
  library: LibraryEntry[]
  onSelectGame: (gameId: string) => void
}

export default function LibraryView({ library, onSelectGame }: LibraryViewProps): React.JSX.Element {
  return (
    <div className="library-view fade-in">
      <h2 className="library-view__heading">Your library</h2>
      <p className="library-view__subheading">Pick a game to launch it, or set one up for the first time.</p>

      <div className="library-view__grid">
        {GAME_CATALOG.map((game) => {
          const isConfigured = library.some((entry) => entry.gameId === game.id && entry.gamePath)
          return (
            <button
              key={game.id}
              className={`library-card ${isConfigured ? '' : 'is-unconfigured'}`}
              onClick={() => onSelectGame(game.id)}
            >
              <CoverArt steamAppId={game.steamAppId} alt={game.name} className="library-card__art" />
              <span className="library-card__name">{game.name}</span>
              {!isConfigured && <span className="library-card__badge">Set up</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
