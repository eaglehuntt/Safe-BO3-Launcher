import { useState } from 'react'
import type { LibraryEntry } from '@shared/types'
import type { GameDefinition } from '@shared/gameDefinitions'
import GameSetupForm from './GameSetupForm'
import './SetupView.css'

interface SetupViewProps {
  game: GameDefinition
  entry: LibraryEntry
  onSaved: (entry: LibraryEntry) => void
  onResetToFactory: () => void
}

export default function SetupView({ game, entry, onSaved, onResetToFactory }: SetupViewProps): React.JSX.Element {
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle')
  const [resetArmed, setResetArmed] = useState(false)

  function handleSave(gamePath: string, toolPath?: string): void {
    onSaved({ ...entry, gamePath, toolPath })
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 1800)
  }

  function handleResetClick(): void {
    if (resetArmed) {
      onResetToFactory()
      return
    }
    setResetArmed(true)
    setTimeout(() => setResetArmed(false), 4000)
  }

  return (
    <div className="setup-view fade-in">
      <h2 className="setup-view__heading">{game.name} paths</h2>
      <p className="setup-view__subheading">
        Change where {game.name}{game.safetyTool ? ` or ${game.safetyTool.label}` : ''} live on disk.
      </p>

      <GameSetupForm
        game={game}
        initialGamePath={entry.gamePath}
        initialToolPath={entry.toolPath}
        saveLabel="Save changes"
        onSave={handleSave}
      />

      {saveState === 'saved' && <span className="setup-view__saved-msg">Saved.</span>}

      <div className="setup-view__danger-zone">
        <div>
          <h3 className="setup-view__danger-title">Reset to factory defaults</h3>
          <p className="setup-view__danger-body">
            Wipes your saved paths and settings and takes you back through first-time setup. This
            can&apos;t be undone.
          </p>
        </div>
        <button
          className={`setup-view__danger-btn ${resetArmed ? 'is-armed' : ''}`}
          onClick={handleResetClick}
        >
          {resetArmed ? 'Click again to confirm' : 'Reset everything'}
        </button>
      </div>
    </div>
  )
}
