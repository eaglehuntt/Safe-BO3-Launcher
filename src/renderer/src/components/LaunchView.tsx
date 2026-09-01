import { useEffect, useState } from 'react'
import type { LaunchProgressEvent, LauncherSettings, T7UpdateStatus } from '@shared/types'
import { GAMES } from '../data/games'
import Button from './Button'
import GameSelector from './GameSelector'
import StatusStepper from './StatusStepper'
import './LaunchView.css'

interface LaunchViewProps {
  settings: LauncherSettings
  onGoToSetup: () => void
}

function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

export default function LaunchView({ settings, onGoToSetup }: LaunchViewProps): React.JSX.Element {
  const [progress, setProgress] = useState<LaunchProgressEvent | null>(null)
  const [isLaunching, setIsLaunching] = useState(false)
  const [gameIndex, setGameIndex] = useState(0)
  const [updateStatus, setUpdateStatus] = useState<T7UpdateStatus | null>(null)

  const game = GAMES[gameIndex]
  const isConfigured = Boolean(settings.t7PatchPath && settings.bo3Path)

  useEffect(() => {
    const unsubscribe = window.api.onLaunchProgress((event) => {
      setProgress(event)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (game.status !== 'available' || !settings.t7PatchPath) {
      setUpdateStatus(null)
      return
    }
    window.api.checkT7Update().then(setUpdateStatus)
  }, [game.status, settings.t7PatchPath])

  async function handleLaunch(): Promise<void> {
    setProgress(null)
    setIsLaunching(true)
    const result = await window.api.startLaunch()
    if (!result.success) {
      setProgress((current) => current ?? { step: 'error', message: result.message })
    }
    setIsLaunching(false)
  }

  return (
    <div className="launch-view">
      <div className="launch-view__hero fade-in">
        <GameSelector games={GAMES} index={gameIndex} onChange={setGameIndex} />
        <p className="launch-view__tagline">Patch first, then deploy.</p>
        <p className="launch-view__subtitle">
          We confirm the T7 patch is actually running before Black Ops 3 ever starts, closing
          the window where you could end up playing unpatched.
        </p>
      </div>

      {game.status === 'coming-soon' ? (
        <div className="launch-view__card launch-view__card--warning fade-in">
          <p>{game.fullName} support isn&apos;t wired up yet. Check back soon.</p>
        </div>
      ) : !isConfigured ? (
        <div className="launch-view__card launch-view__card--warning fade-in">
          <p>Set your T7 patch and Black Ops 3 executables before launching.</p>
          <Button variant="outline" onClick={onGoToSetup}>
            Go to Setup
          </Button>
        </div>
      ) : (
        <div className="launch-view__card fade-in">
          {updateStatus?.updateAvailable && (
            <button
              className="launch-view__update-banner"
              onClick={() => window.api.openExternal(updateStatus.releaseUrl)}
            >
              <span className="launch-view__update-dot" />
              New T7 patch update available
            </button>
          )}

          <div className="launch-view__paths">
            <div className="launch-view__path">
              <span className="launch-view__path-label">T7 Patch</span>
              <span className="launch-view__path-value">{basename(settings.t7PatchPath)}</span>
            </div>
            <div className="launch-view__path-divider" />
            <div className="launch-view__path">
              <span className="launch-view__path-label">Black Ops 3</span>
              <span className="launch-view__path-value">{basename(settings.bo3Path)}</span>
            </div>
          </div>

          <div className="launch-view__stepper-wrap">
            <StatusStepper step={progress?.step ?? null} />
            {progress?.step === 'waiting-t7' && (
              <div className="launch-view__scan-track">
                <div className="launch-view__scan-bar" />
              </div>
            )}
          </div>

          <button
            className={`launch-view__launch-btn ${isLaunching ? 'is-busy' : ''}`}
            onClick={handleLaunch}
            disabled={isLaunching}
          >
            {isLaunching && <span className="launch-view__spinner" />}
            {isLaunching ? 'Working' : 'Launch T7 Patch → BO3'}
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
      )}
    </div>
  )
}
