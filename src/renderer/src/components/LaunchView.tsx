import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { LaunchProgressEvent, LauncherSettings } from '@shared/types'
import Button from './Button'
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

  useEffect(() => {
    const unsubscribe = window.api.onLaunchProgress((event) => {
      setProgress(event)
    })
    return unsubscribe
  }, [])

  const isConfigured = Boolean(settings.t7PatchPath && settings.bo3Path)

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
      <motion.div
        className="launch-view__hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="launch-view__eyebrow">Mission Ready</span>
        <h1 className="launch-view__title">
          Patch first.
          <br />
          <span className="launch-view__title-accent">Then deploy.</span>
        </h1>
        <p className="launch-view__subtitle">
          We confirm the T7 patch is actually running before Black Ops 3 ever starts —
          closing the window where you could end up playing unpatched.
        </p>
      </motion.div>

      {!isConfigured ? (
        <motion.div
          className="launch-view__card launch-view__card--warning"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <p>Set your T7 patch and Black Ops 3 executables before launching.</p>
          <Button variant="outline" onClick={onGoToSetup}>
            Go to Setup
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="launch-view__card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
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
          </div>

          <motion.button
            className="launch-view__launch-btn"
            onClick={handleLaunch}
            disabled={isLaunching}
            whileTap={isLaunching ? undefined : { scale: 0.98 }}
          >
            {isLaunching ? 'Working...' : 'Launch T7 Patch → BO3'}
          </motion.button>

          <AnimatePresence mode="wait">
            {progress && (
              <motion.p
                key={progress.message}
                className={`launch-view__status ${progress.step === 'error' ? 'is-error' : ''}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {progress.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
