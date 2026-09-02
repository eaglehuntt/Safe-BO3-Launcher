import { useState } from 'react'
import type { GameDefinition } from '@shared/gameDefinitions'
import Button from './Button'
import './GameSetupForm.css'

type DetectStatus = 'idle' | 'detecting' | 'found' | 'not-found'

interface GameSetupFormProps {
  game: GameDefinition
  initialGamePath?: string
  initialToolPath?: string
  saveLabel: string
  onSave: (gamePath: string, toolPath?: string) => void
}

export default function GameSetupForm({
  game,
  initialGamePath = '',
  initialToolPath = '',
  saveLabel,
  onSave
}: GameSetupFormProps): React.JSX.Element {
  const [gamePath, setGamePath] = useState(initialGamePath)
  const [toolPath, setToolPath] = useState(initialToolPath)
  const [detectStatus, setDetectStatus] = useState<DetectStatus>('idle')

  async function detectGame(): Promise<void> {
    setDetectStatus('detecting')
    const path = await window.api.detectGameInstall(game.steamAppId, game.exeFileName)
    if (path) {
      setGamePath(path)
      setDetectStatus('found')
    } else {
      setDetectStatus('not-found')
    }
  }

  async function browseGame(): Promise<void> {
    const path = await window.api.browseForExe(`Select ${game.exeFileName}`)
    if (path) setGamePath(path)
  }

  async function browseTool(): Promise<void> {
    if (!game.safetyTool) return
    const path = await window.api.browseForExe(`Select the ${game.safetyTool.label} executable`)
    if (path) setToolPath(path)
  }

  const canSave = Boolean(gamePath && (!game.safetyTool || toolPath))

  return (
    <div className="game-setup-form">
      <div className="game-setup-form__field">
        <label className="game-setup-form__label">{game.name} executable</label>
        <div className="game-setup-form__row">
          <input
            className="game-setup-form__input"
            type="text"
            readOnly
            value={gamePath}
            placeholder="No file selected"
          />
          <Button variant="outline" onClick={browseGame}>
            Browse
          </Button>
        </div>
        <div className="game-setup-form__detect-row">
          <Button variant="ghost" onClick={detectGame} disabled={detectStatus === 'detecting'}>
            {detectStatus === 'detecting' ? 'Searching Steam libraries...' : 'Auto-detect via Steam'}
          </Button>
          {detectStatus === 'found' && <span className="game-setup-form__detect-msg is-good">Found</span>}
          {detectStatus === 'not-found' && (
            <span className="game-setup-form__detect-msg is-bad">
              Couldn&apos;t find it automatically, browse manually above.
            </span>
          )}
        </div>
      </div>

      {game.safetyTool && (
        <div className="game-setup-form__field">
          <label className="game-setup-form__label">{game.safetyTool.label} executable</label>
          <div className="game-setup-form__row">
            <input
              className="game-setup-form__input"
              type="text"
              readOnly
              value={toolPath}
              placeholder="No file selected"
            />
            <Button variant="outline" onClick={browseTool}>
              Browse
            </Button>
          </div>
          <ol className="game-setup-form__steps">
            {game.safetyTool.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <Button variant="outline" onClick={() => window.api.openExternal(game.safetyTool!.repoUrl)}>
            Open the {game.safetyTool.label} repo ↗
          </Button>
        </div>
      )}

      <Button onClick={() => onSave(gamePath, game.safetyTool ? toolPath : undefined)} disabled={!canSave}>
        {saveLabel}
      </Button>
    </div>
  )
}
