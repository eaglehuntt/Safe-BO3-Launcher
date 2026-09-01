import { useEffect, useState } from 'react'
import type { LauncherSettings } from '@shared/types'
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

  useEffect(() => {
    Promise.all([window.api.getSettings(), window.api.getAppVersion()]).then(
      ([loadedSettings, appVersion]) => {
        setSettings(loadedSettings)
        setVersion(appVersion)
        setReady(true)
        if (!loadedSettings.t7PatchPath || !loadedSettings.bo3Path) {
          setActiveView('setup')
        }
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
          <Button variant="ghost" onClick={() => window.api.openExternal('https://github.com/eaglehuntt/Safe-BO3-Launcher')}>
            GitHub ↗
          </Button>
        </div>
      </header>

      <main className="app-shell__content">
        {ready && (
          <div key={activeView} className="fade-in">
            {activeView === 'launch' && (
              <LaunchView settings={settings} onGoToSetup={() => setActiveView('setup')} />
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
