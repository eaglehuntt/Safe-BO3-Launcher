import { useEffect, useState } from 'react'
import type { LaunchProgressEvent, LibraryEntry, UpdateStatus } from '@shared/types'
import type { GameDefinition } from '@shared/gameDefinitions'
import CoverArt from './CoverArt'
import StatusStepper from './StatusStepper'
import './PlayView.css'

interface PlayViewProps {
  game: GameDefinition
  entry: LibraryEntry
  updateStatus: UpdateStatus | null
  onOpenInfo: () => void
}

const TOOL_POLL_INTERVAL_MS = 4000

export default function PlayView({ game, entry, updateStatus, onOpenInfo }: PlayViewProps): React.JSX.Element {
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
    <div className="play-view">
      <div className="play-view__cover fade-in">
        <CoverArt
          steamAppId={game.steamAppId}
          alt={game.name}
          variant="cover"
          className="play-view__cover-art"
          onClick={onOpenInfo}
        />
      </div>

      <div className="play-view__card fade-in">
        {updateStatus?.updateAvailable && (
          <button
            className="play-view__update-banner"
            onClick={() => window.api.openExternal(updateStatus.releaseUrl)}
          >
            <span className="play-view__update-dot" />
            New {game.safetyTool?.label} update available
          </button>
        )}

        {game.safetyTool && (
          <div className="play-view__stepper-wrap">
            <StatusStepper
              step={progress?.step ?? null}
              toolLabel={game.safetyTool.label}
              gameLabel={game.shortLabel}
              isToolRunning={isToolRunning}
            />
            {progress?.step === 'waiting-tool' && (
              <div className="play-view__scan-track">
                <div className="play-view__scan-bar" />
              </div>
            )}
          </div>
        )}

        <button
          className={`play-view__launch-btn ${isLaunching ? 'is-busy' : ''}`}
          onClick={handleLaunch}
          disabled={isLaunching}
        >
          {isLaunching && <span className="play-view__spinner" />}
          {isLaunching ? 'Working' : 'Launch Safely'}
        </button>

        {progress && (
          <p
            key={progress.message}
            className={`play-view__status fade-in ${progress.step === 'error' ? 'is-error' : ''}`}
          >
            {progress.message}
          </p>
        )}
      </div>
    </div>
  )
}
