import { useEffect, useState } from 'react'
import type { LaunchProgressEvent, LibraryEntry, UpdateStatus } from '@shared/types'
import type { GameDefinition } from '@shared/gameDefinitions'
import CoverArt from './CoverArt'
import StatusStepper from './StatusStepper'
import './LaunchView.css'

interface LaunchViewProps {
  game: GameDefinition
  entry: LibraryEntry
  updateStatus: UpdateStatus | null
}

const TOOL_POLL_INTERVAL_MS = 4000

function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

export default function LaunchView({ game, entry, updateStatus }: LaunchViewProps): React.JSX.Element {
  const [progress, setProgress] = useState<LaunchProgressEvent | null>(null)
  const [isLaunching, setIsLaunching] = useState(false)
  const [isToolRunning, setIsToolRunning] = useState(false)

  useEffect(() => {
    setProgress(null)
  }, [game.id])

  useEffect(() => {
    const unsubscribe = window.api.onLaunchProgress((event) => {
      setProgress(event)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const toolPath = entry.toolPath
    if (!toolPath) return

    let cancelled = false
    async function poll(): Promise<void> {
      const running = await window.api.isProcessRunning(toolPath!)
      if (!cancelled) setIsToolRunning(running)
    }
    poll()
    const interval = setInterval(poll, TOOL_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [entry.toolPath])

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
        <CoverArt steamAppId={game.steamAppId} alt={game.name} variant="hero" className="launch-view__hero-art" />
      </div>

      <div className="launch-view__title-block fade-in">
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
                <span className="launch-view__path-label">
                  {game.safetyTool.label}
                  {isToolRunning && (
                    <span className="launch-view__running-badge" title={`${game.safetyTool.label} is running`}>
                      <svg viewBox="0 0 24 24" width="10" height="10">
                        <path d="M5 12.5 L10 17 L19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Running
                    </span>
                  )}
                </span>
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
          {isLaunching ? 'Working' : 'Launch Safely'}
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
