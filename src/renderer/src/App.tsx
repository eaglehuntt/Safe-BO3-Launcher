import { useEffect, useState } from 'react'
import type { LauncherSettings, LibraryEntry, UpdateStatus } from '@shared/types'
import { getGameDefinition } from '@shared/gameDefinitions'
import BackgroundFX from './components/BackgroundFX'
import Button from './components/Button'
import GameOnboarding from './components/GameOnboarding'
import LaunchView from './components/LaunchView'
import LibraryView from './components/LibraryView'
import NavTabs, { type ViewId } from './components/NavTabs'
import SafetyView from './components/SafetyView'
import SetupView from './components/SetupView'
import TitleBar from './components/TitleBar'
import './App.css'

const EMPTY_SETTINGS: LauncherSettings = { library: [] }

type Screen = 'library' | 'game' | 'onboarding'

export default function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('library')
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
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
        window.api.checkAppUpdate().then(setAppUpdateStatus)
      }
    )
  }, [])

  const activeEntry = settings.library.find((item) => item.gameId === activeGameId) ?? null
  const activeGame = activeGameId ? getGameDefinition(activeGameId) : null

  useEffect(() => {
    if (!activeEntry || !activeGame?.safetyTool || !activeEntry.toolPath) {
      setToolUpdateStatus(null)
      return
    }
    window.api.checkToolUpdate(activeEntry.toolPath, activeGame.safetyTool.repoUrl).then(setToolUpdateStatus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntry?.toolPath])

  function openLibrary(): void {
    setScreen('library')
    setActiveGameId(null)
  }

  function handleSelectGame(gameId: string): void {
    const isConfigured = settings.library.some((entry) => entry.gameId === gameId && entry.gamePath)
    setActiveGameId(gameId)
    setActiveTab('launch')
    setScreen(isConfigured ? 'game' : 'onboarding')
  }

  async function persistLibrary(library: LibraryEntry[]): Promise<void> {
    const saved = await window.api.saveSettings({ ...settings, library })
    setSettings(saved)
  }

  async function handleOnboardingComplete(gamePath: string, toolPath?: string): Promise<void> {
    if (!activeGameId) return
    const entry: LibraryEntry = { gameId: activeGameId, gamePath, toolPath, addedAt: new Date().toISOString() }
    const withoutExisting = settings.library.filter((item) => item.gameId !== activeGameId)
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
      <TitleBar version={version} onOpenLibrary={openLibrary} />
      <header className="app-shell__header app-region-drag">
        {screen === 'game' && activeGame && (
          <NavTabs active={activeTab} onChange={setActiveTab} showSafety={Boolean(activeGame.safetyTool)} />
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
          <div key={`${screen}-${activeGameId}-${activeTab}`} className="fade-in">
            {screen === 'library' && (
              <LibraryView library={settings.library} onSelectGame={handleSelectGame} />
            )}
            {screen === 'onboarding' && activeGame && (
              <GameOnboarding game={activeGame} onComplete={handleOnboardingComplete} onCancel={openLibrary} />
            )}
            {screen === 'game' && activeGame && activeEntry && (
              <>
                {activeTab === 'launch' && (
                  <LaunchView game={activeGame} entry={activeEntry} updateStatus={toolUpdateStatus} />
                )}
                {activeTab === 'setup' && (
                  <SetupView game={activeGame} entry={activeEntry} onSaved={handleSetupSaved} />
                )}
                {activeTab === 'safety' && activeGame.safetyTool && <SafetyView />}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
