import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { LauncherSettings } from '@shared/types'
import Button from './Button'
import './SetupView.css'

const T7_PATCH_REPO_URL = 'https://github.com/Scroptss/T7Patch'

interface SetupViewProps {
  settings: LauncherSettings
  onSettingsSaved: (settings: LauncherSettings) => void
}

type DetectStatus = 'idle' | 'detecting' | 'found' | 'not-found'

export default function SetupView({ settings, onSettingsSaved }: SetupViewProps): React.JSX.Element {
  const [local, setLocal] = useState<LauncherSettings>(settings)
  const [detectStatus, setDetectStatus] = useState<DetectStatus>('idle')
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle')

  useEffect(() => {
    setLocal(settings)
  }, [settings])

  async function browseT7(): Promise<void> {
    const path = await window.api.browseForExe('Select the T7 patch executable')
    if (path) setLocal((prev) => ({ ...prev, t7PatchPath: path }))
  }

  async function browseBo3(): Promise<void> {
    const path = await window.api.browseForExe('Select BlackOps3.exe')
    if (path) setLocal((prev) => ({ ...prev, bo3Path: path }))
  }

  async function autoDetectBo3(): Promise<void> {
    setDetectStatus('detecting')
    const path = await window.api.detectBlackOps3()
    if (path) {
      setLocal((prev) => ({ ...prev, bo3Path: path }))
      setDetectStatus('found')
    } else {
      setDetectStatus('not-found')
    }
  }

  async function handleSave(): Promise<void> {
    const saved = await window.api.saveSettings(local)
    onSettingsSaved(saved)
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 1800)
  }

  return (
    <div className="setup-view">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h2 className="setup-view__heading">Configure your paths</h2>
        <p className="setup-view__subheading">
          It doesn&apos;t matter where the T7 patch lives on disk — just point us at it once.
        </p>

        <div className="setup-view__field">
          <label className="setup-view__label" htmlFor="t7-path">
            T7 Patch executable
          </label>
          <div className="setup-view__row">
            <input
              id="t7-path"
              className="setup-view__input"
              type="text"
              readOnly
              value={local.t7PatchPath}
              placeholder="No file selected"
            />
            <Button variant="outline" onClick={browseT7}>
              Browse
            </Button>
          </div>
        </div>

        <div className="setup-view__field">
          <label className="setup-view__label" htmlFor="bo3-path">
            Black Ops 3 executable
          </label>
          <div className="setup-view__row">
            <input
              id="bo3-path"
              className="setup-view__input"
              type="text"
              readOnly
              value={local.bo3Path}
              placeholder="No file selected"
            />
            <Button variant="outline" onClick={browseBo3}>
              Browse
            </Button>
          </div>
          <div className="setup-view__detect-row">
            <Button variant="ghost" onClick={autoDetectBo3} disabled={detectStatus === 'detecting'}>
              {detectStatus === 'detecting' ? 'Searching Steam libraries...' : 'Auto-detect via Steam'}
            </Button>
            {detectStatus === 'found' && <span className="setup-view__detect-msg is-good">Found it.</span>}
            {detectStatus === 'not-found' && (
              <span className="setup-view__detect-msg is-bad">
                Couldn&apos;t find it automatically — browse manually above.
              </span>
            )}
          </div>
        </div>

        <div className="setup-view__save-row">
          <Button onClick={handleSave} disabled={!local.t7PatchPath && !local.bo3Path}>
            Save Paths
          </Button>
          {saveState === 'saved' && <span className="setup-view__saved-msg">Saved.</span>}
        </div>
      </motion.div>

      <motion.div
        className="setup-view__instructions"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <h3 className="setup-view__instructions-title">Getting the T7 patch</h3>
        <ol className="setup-view__steps">
          <li>Grab the latest release from the community T7 Patch repo.</li>
          <li>Extract it anywhere you like — the folder location doesn&apos;t matter to us.</li>
          <li>Come back here and browse to the patch&apos;s .exe above.</li>
          <li>Point us at BlackOps3.exe, or let auto-detect find it via Steam.</li>
          <li>Save, then head to the Launch tab.</li>
        </ol>
        <Button variant="outline" onClick={() => window.api.openExternal(T7_PATCH_REPO_URL)}>
          Open the T7 Patch repo ↗
        </Button>
      </motion.div>
    </div>
  )
}
