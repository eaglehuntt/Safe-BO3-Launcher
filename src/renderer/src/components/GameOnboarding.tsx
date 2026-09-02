import { useState } from 'react'
import type { GameDefinition } from '@shared/gameDefinitions'
import Button from './Button'
import './GameOnboarding.css'

interface GameOnboardingProps {
  game: GameDefinition
  onComplete: (gamePath: string, toolPath?: string) => void
  onCancel?: () => void
}

type DetectStatus = 'idle' | 'detecting' | 'found' | 'not-found'

export default function GameOnboarding({ game, onComplete, onCancel }: GameOnboardingProps): React.JSX.Element {
  const hasTool = Boolean(game.safetyTool)

  // Steps: intro -> [get-tool -> tool-path] (if hasTool) -> game-path -> finish
  const stepIds = hasTool ? ['intro', 'get-tool', 'tool-path', 'game-path', 'finish'] : ['intro', 'game-path', 'finish']

  const [stepIndex, setStepIndex] = useState(0)
  const [gamePath, setGamePath] = useState('')
  const [toolPath, setToolPath] = useState('')
  const [detectStatus, setDetectStatus] = useState<DetectStatus>('idle')

  const stepId = stepIds[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === stepIds.length - 1

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

  function goNext(): void {
    if (isLast) {
      onComplete(gamePath, hasTool ? toolPath : undefined)
      return
    }
    setStepIndex((index) => index + 1)
  }

  function goBack(): void {
    if (isFirst) {
      onCancel?.()
      return
    }
    setStepIndex((index) => index - 1)
  }

  const canProceed =
    stepId === 'tool-path' ? Boolean(toolPath) : stepId === 'game-path' ? Boolean(gamePath) : true

  return (
    <div className="onboarding fade-in">
      <div className="onboarding__progress">
        {stepIds.map((id, index) => (
          <span key={id} className={`onboarding__dot ${index <= stepIndex ? 'is-done' : ''}`} />
        ))}
      </div>

      {stepId === 'intro' && (
        <div className="onboarding__step">
          <h2 className="onboarding__title">Let&apos;s set up {game.name}</h2>
          <p className="onboarding__body">
            {hasTool
              ? `We'll walk through getting ${game.safetyTool?.label} installed and pointing us at both executables. Takes a minute.`
              : "We just need to know where the game's executable lives. Takes a few seconds."}
          </p>
        </div>
      )}

      {stepId === 'get-tool' && game.safetyTool && (
        <div className="onboarding__step">
          <h2 className="onboarding__title">Get {game.safetyTool.label}</h2>
          <p className="onboarding__body">Grab it from the community repo if you haven&apos;t already:</p>
          <ol className="onboarding__list">
            {game.safetyTool.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <Button variant="outline" onClick={() => window.api.openExternal(game.safetyTool!.repoUrl)}>
            Open the {game.safetyTool.label} repo ↗
          </Button>
        </div>
      )}

      {stepId === 'tool-path' && game.safetyTool && (
        <div className="onboarding__step">
          <h2 className="onboarding__title">Locate {game.safetyTool.label}</h2>
          <p className="onboarding__body">Browse to the executable you just extracted.</p>
          <div className="onboarding__row">
            <input
              className="onboarding__input"
              type="text"
              readOnly
              value={toolPath}
              placeholder="No file selected"
            />
            <Button variant="outline" onClick={browseTool}>
              Browse
            </Button>
          </div>
        </div>
      )}

      {stepId === 'game-path' && (
        <div className="onboarding__step">
          <h2 className="onboarding__title">Locate {game.name}</h2>
          <p className="onboarding__body">We can try to find it via Steam, or you can browse to it yourself.</p>
          <div className="onboarding__row">
            <input
              className="onboarding__input"
              type="text"
              readOnly
              value={gamePath}
              placeholder="No file selected"
            />
            <Button variant="outline" onClick={browseGame}>
              Browse
            </Button>
          </div>
          <div className="onboarding__detect-row">
            <Button variant="ghost" onClick={detectGame} disabled={detectStatus === 'detecting'}>
              {detectStatus === 'detecting' ? 'Searching Steam libraries...' : 'Auto-detect via Steam'}
            </Button>
            {detectStatus === 'found' && <span className="onboarding__detect-msg is-good">Found</span>}
            {detectStatus === 'not-found' && (
              <span className="onboarding__detect-msg is-bad">
                Couldn&apos;t find it automatically, browse manually above.
              </span>
            )}
          </div>
        </div>
      )}

      {stepId === 'finish' && (
        <div className="onboarding__step">
          <h2 className="onboarding__title">All set</h2>
          <p className="onboarding__body">Here&apos;s what we&apos;ve got. Looks good?</p>
          <div className="onboarding__summary">
            {hasTool && (
              <div className="onboarding__summary-row">
                <span className="onboarding__summary-label">{game.safetyTool?.label}</span>
                <span className="onboarding__summary-value">{toolPath}</span>
              </div>
            )}
            <div className="onboarding__summary-row">
              <span className="onboarding__summary-label">{game.name}</span>
              <span className="onboarding__summary-value">{gamePath}</span>
            </div>
          </div>
        </div>
      )}

      <div className="onboarding__nav">
        {!isFirst || onCancel ? (
          <Button variant="ghost" onClick={goBack}>
            {isFirst ? 'Cancel' : '← Back'}
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={goNext} disabled={!canProceed}>
          {isLast ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
