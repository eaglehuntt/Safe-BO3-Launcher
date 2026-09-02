import { useEffect, useState } from 'react'
import type { LaunchProgressEvent, LibraryEntry, UpdateStatus } from '@shared/types'
import type { GameDefinition } from '@shared/gameDefinitions'
import StatusStepper from './StatusStepper'
import './LaunchView.css'

interface LaunchViewProps {
  game: GameDefinition
  entry: LibraryEntry
  updateStatus: UpdateStatus | null
}

function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

export default function LaunchView({ game, entry, updateStatus }: LaunchViewProps): React.JSX.Element {
  const [progress, setProgress] = useState<LaunchProgressEvent | null>(null)
  const [isLaunching, setIsLaunching] = useState(false)

  useEffect(() => {
    setProgress(null)
  }, [game.id])

  useEffect(() => {
    const unsubscribe = window.api.onLaunchProgress((event) => {
      setProgress(event)
    })
    return unsubscribe
  }, [])

  async function handleLaunch(): Promise<void> {
    setProgress(null)
    setIsLaunching(true)
    const result = await window.api.startLaunch(game.id)
    if (!result.success) {
      setProgress((current) => current ?? { step: 'error', message: result.message })
    }
    setIsLaunching(false)
  }

  return (
    <div className="launch-view">
      <div className="launch-view__hero fade-in">
        <span className="launch-view__big">{game.shortLabel}</span>
        <span className="launch-view__full">{game.name}</span>
        <p className="launch-view__tagline">
          {game.safetyTool ? 'Patch first, then deploy.' : 'Ready when you are.'}
        </p>
      </div>

      <div className="launch-view__card fade-in">
        {updateStatus?.updateAvailable && (
          <button
            className="launch-view__update-banner"
            onClick={() => window.api.openExternal(updateStatus.releaseUrl)}
          >
            <span className="launch-view__update-dot" />
            New {game.safetyTool?.label} update available
          </button>
        )}

        <div className="launch-view__paths">
          {game.safetyTool && (
            <>
              <div className="launch-view__path">
                <span className="launch-view__path-label">{game.safetyTool.label}</span>
                <span className="launch-view__path-value">{basename(entry.toolPath ?? '')}</span>
              </div>
              <div className="launch-view__path-divider" />
            </>
          )}
          <div className="launch-view__path">
            <span className="launch-view__path-label">{game.shortLabel}</span>
            <span className="launch-view__path-value">{basename(entry.gamePath)}</span>
          </div>
        </div>

        {game.safetyTool && (
          <div className="launch-view__stepper-wrap">
            <StatusStepper step={progress?.step ?? null} toolLabel={game.safetyTool.label} gameLabel={game.shortLabel} />
            {progress?.step === 'waiting-tool' && (
              <div className="launch-view__scan-track">
                <div className="launch-view__scan-bar" />
              </div>
            )}
          </div>
        )}

        <button
          className={`launch-view__launch-btn ${isLaunching ? 'is-busy' : ''}`}
          onClick={handleLaunch}
          disabled={isLaunching}
        >
          {isLaunching && <span className="launch-view__spinner" />}
          {isLaunching
            ? 'Working'
            : game.safetyTool
              ? `Launch ${game.safetyTool.label} → ${game.shortLabel}`
              : `Launch ${game.shortLabel}`}
        </button>

        {progress && (
          <p
            key={progress.message}
            className={`launch-view__status fade-in ${progress.step === 'error' ? 'is-error' : ''}`}
          >
            {progress.message}
          </p>
        )}
      </div>
    </div>
  )
}
