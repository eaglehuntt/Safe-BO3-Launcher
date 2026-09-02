import { useEffect, useState } from 'react'
import type { LauncherSettings, UpdateStatus } from '@shared/types'
import BackgroundFX from './components/BackgroundFX'
import Button from './components/Button'
import LaunchView from './components/LaunchView'
import NavTabs, { type ViewId } from './components/NavTabs'
import SafetyView from './components/SafetyView'
import SetupView from './components/SetupView'
import TitleBar from './components/TitleBar'
import './App.css'

const EMPTY_SETTINGS: LauncherSettings = { t7PatchPath: '', bo3Path: '' }

export default function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<ViewId>('launch')
  const [settings, setSettings] = useState<LauncherSettings>(EMPTY_SETTINGS)
  const [version, setVersion] = useState('2.0.0')
  const [ready, setReady] = useState(false)
  const [t7UpdateStatus, setT7UpdateStatus] = useState<UpdateStatus | null>(null)
  const [appUpdateStatus, setAppUpdateStatus] = useState<UpdateStatus | null>(null)

  useEffect(() => {
    Promise.all([window.api.getSettings(), window.api.getAppVersion()]).then(
      ([loadedSettings, appVersion]) => {
        setSettings(loadedSettings)
        setVersion(appVersion)
        setReady(true)
        if (!loadedSettings.t7PatchPath || !loadedSettings.bo3Path) {
          setActiveView('setup')
        }
        if (loadedSettings.t7PatchPath) {
          window.api.checkT7Update().then(setT7UpdateStatus)
        }
        window.api.checkAppUpdate().then(setAppUpdateStatus)
      }
    )
  }, [])

  return (
    <div className="app-shell">
      <BackgroundFX />
      <TitleBar version={version} />
      <header className="app-shell__header app-region-drag">
        <NavTabs active={activeView} onChange={setActiveView} />
        <div className="app-shell__header-actions app-region-no-drag">
          {appUpdateStatus?.updateAvailable && (
            <button
              className="app-shell__update-pill"
              onClick={() => window.api.openExternal(appUpdateStatus.releaseUrl)}
            >
              Update available
            </button>
          )}
          <Button variant="ghost" onClick={() => window.api.openExternal('https://github.com/eaglehuntt/Safe-BO3-Launcher')}>
            GitHub ↗
          </Button>
        </div>
      </header>

      <main className="app-shell__content">
        {ready && (
          <div key={activeView} className="fade-in">
            {activeView === 'launch' && (
              <LaunchView
                settings={settings}
                updateStatus={t7UpdateStatus}
                onGoToSetup={() => setActiveView('setup')}
              />
            )}
            {activeView === 'setup' && (
              <SetupView settings={settings} onSettingsSaved={setSettings} />
            )}
            {activeView === 'safety' && <SafetyView />}
          </div>
        )}
      </main>
    </div>
  )
}
