import { useEffect, useState } from 'react'
import type { LauncherSettings, LibraryEntry, UpdateStatus } from '@shared/types'
import { GAME_CATALOG } from '@shared/gameDefinitions'
import BackgroundFX from './components/BackgroundFX'
import Button from './components/Button'
import GameOnboarding from './components/GameOnboarding'
import LaunchView from './components/LaunchView'
import NavTabs, { type ViewId } from './components/NavTabs'
import SafetyView from './components/SafetyView'
import SetupView from './components/SetupView'
import TitleBar from './components/TitleBar'
import './App.css'

const EMPTY_SETTINGS: LauncherSettings = { library: [] }

// Only one game is wired up right now, so the app opens straight into it
// rather than a library grid. GAME_CATALOG staying a list (and everything
// downstream being keyed off gameId) means adding a second game back later
// is just a new catalog entry, not a rewrite.
const PRIMARY_GAME = GAME_CATALOG[0]

type Screen = 'game' | 'onboarding'

export default function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [activeTab, setActiveTab] = useState<ViewId>('launch')
  const [settings, setSettings] = useState<LauncherSettings>(EMPTY_SETTINGS)
  const [version, setVersion] = useState('2.0.0')
  const [ready, setReady] = useState(false)
  const [toolUpdateStatus, setToolUpdateStatus] = useState<UpdateStatus | null>(null)
  const [appUpdateStatus, setAppUpdateStatus] = useState<UpdateStatus | null>(null)

  useEffect(() => {
    Promise.all([window.api.getSettings(), window.api.getAppVersion()]).then(
      ([loadedSettings, appVersion]) => {
        setSettings(loadedSettings)
        setVersion(appVersion)
        setReady(true)
        const entry = loadedSettings.library.find((item) => item.gameId === PRIMARY_GAME.id)
        setScreen(entry?.gamePath ? 'game' : 'onboarding')
        window.api.checkAppUpdate().then(setAppUpdateStatus)
      }
    )
  }, [])

  const activeEntry = settings.library.find((item) => item.gameId === PRIMARY_GAME.id) ?? null

  useEffect(() => {
    if (!activeEntry || !PRIMARY_GAME.safetyTool || !activeEntry.toolPath) {
      setToolUpdateStatus(null)
      return
    }
    window.api.checkToolUpdate(activeEntry.toolPath, PRIMARY_GAME.safetyTool.repoUrl).then(setToolUpdateStatus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntry?.toolPath])

  async function persistLibrary(library: LibraryEntry[]): Promise<void> {
    const saved = await window.api.saveSettings({ ...settings, library })
    setSettings(saved)
  }

  async function handleOnboardingComplete(gamePath: string, toolPath?: string): Promise<void> {
    const entry: LibraryEntry = {
      gameId: PRIMARY_GAME.id,
      gamePath,
      toolPath,
      addedAt: new Date().toISOString()
    }
    const withoutExisting = settings.library.filter((item) => item.gameId !== PRIMARY_GAME.id)
    await persistLibrary([...withoutExisting, entry])
    setActiveTab('launch')
    setScreen('game')
  }

  async function handleSetupSaved(entry: LibraryEntry): Promise<void> {
    const nextLibrary = settings.library.map((item) => (item.gameId === entry.gameId ? entry : item))
    await persistLibrary(nextLibrary)
  }

  return (
    <div className="app-shell">
      <BackgroundFX />
      <TitleBar version={version} onOpenLibrary={() => setActiveTab('launch')} />
      <header className="app-shell__header app-region-drag">
        {screen === 'game' && (
          <NavTabs active={activeTab} onChange={setActiveTab} showSafety={Boolean(PRIMARY_GAME.safetyTool)} />
        )}
        {screen !== 'game' && <span />}
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
          <div key={`${screen}-${activeTab}`} className="fade-in">
            {screen === 'onboarding' && (
              <GameOnboarding game={PRIMARY_GAME} onComplete={handleOnboardingComplete} />
            )}
            {screen === 'game' && activeEntry && (
              <>
                {activeTab === 'launch' && (
                  <LaunchView game={PRIMARY_GAME} entry={activeEntry} updateStatus={toolUpdateStatus} />
                )}
                {activeTab === 'setup' && (
                  <SetupView game={PRIMARY_GAME} entry={activeEntry} onSaved={handleSetupSaved} />
                )}
                {activeTab === 'safety' && PRIMARY_GAME.safetyTool && <SafetyView />}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
