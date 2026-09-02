import { useState } from 'react'
import type { LibraryEntry } from '@shared/types'
import type { GameDefinition } from '@shared/gameDefinitions'
import GameSetupForm from './GameSetupForm'
import './SetupView.css'

interface SetupViewProps {
  game: GameDefinition
  entry: LibraryEntry
  onSaved: (entry: LibraryEntry) => void
}

export default function SetupView({ game, entry, onSaved }: SetupViewProps): React.JSX.Element {
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle')

  function handleSave(gamePath: string, toolPath?: string): void {
    onSaved({ ...entry, gamePath, toolPath })
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 1800)
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
    </div>
  )
}
