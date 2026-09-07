import { useEffect, useState } from 'react'
import type { AppView, LauncherSettings, LibraryEntry, UpdateStatus } from '@shared/types'
import { GAME_CATALOG } from '@shared/gameDefinitions'
import BackgroundFX from './components/BackgroundFX'
import Button from './components/Button'
import GameOnboarding from './components/GameOnboarding'
import InfoView from './components/InfoView'
import PlayView from './components/PlayView'
import type { ViewId } from './components/NavTabs'
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
  const [view, setView] = useState<AppView>('info')
  const [activeTab, setActiveTab] = useState<ViewId>('home')
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
        setView(loadedSettings.lastView ?? 'info')
      }
    )
  }, [])

  const activeEntry = settings.library.find((item) => item.gameId === PRIMARY_GAME.id) ?? null

  // Re-checks are cheap: the main process caches each feed URL for a few
  // minutes, so calling this on most navigation clicks (plus a background
  // timer) keeps the "update available" banners fresh without hammering
  // GitHub on every click.
  function refreshUpdateChecks(): void {
    window.api.checkAppUpdate().then(setAppUpdateStatus)
    if (activeEntry && PRIMARY_GAME.safetyTool && activeEntry.toolPath) {
      const installedAt = activeEntry.toolPathUpdatedAt ?? activeEntry.addedAt
      window.api.checkToolUpdate(installedAt, PRIMARY_GAME.safetyTool.repoUrl).then(setToolUpdateStatus)
    } else {
      setToolUpdateStatus(null)
    }
  }

  useEffect(() => {
    if (!ready) return
    refreshUpdateChecks()
    const interval = setInterval(refreshUpdateChecks, 3 * 60 * 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, activeEntry?.toolPath, activeEntry?.toolPathUpdatedAt])

  async function persistLibrary(library: LibraryEntry[]): Promise<void> {
    const saved = await window.api.saveSettings({ ...settings, library })
    setSettings(saved)
  }

  async function switchView(next: AppView): Promise<void> {
    if (next === view) return
    setView(next)
    refreshUpdateChecks()
    const saved = await window.api.saveSettings({ ...settings, lastView: next })
    setSettings(saved)
  }

  async function handleOnboardingComplete(gamePath: string, toolPath?: string): Promise<void> {
    const now = new Date().toISOString()
    const entry: LibraryEntry = {
      gameId: PRIMARY_GAME.id,
      gamePath,
      toolPath,
      addedAt: now,
      toolPathUpdatedAt: toolPath ? now : undefined
    }
    const withoutExisting = settings.library.filter((item) => item.gameId !== PRIMARY_GAME.id)
    const nextSettings = { ...settings, library: [...withoutExisting, entry], lastView: 'info' as const }
    const saved = await window.api.saveSettings(nextSettings)
    setSettings(saved)
    setView('info')
    setActiveTab('home')
    setScreen('game')
  }

  async function handleSetupSaved(entry: LibraryEntry): Promise<void> {
    const previous = settings.library.find((item) => item.gameId === entry.gameId)
    const toolPathChanged = entry.toolPath && entry.toolPath !== previous?.toolPath
    const nextEntry: LibraryEntry = {
      ...entry,
      toolPathUpdatedAt: toolPathChanged ? new Date().toISOString() : previous?.toolPathUpdatedAt
    }
    const nextLibrary = settings.library.map((item) => (item.gameId === nextEntry.gameId ? nextEntry : item))
    await persistLibrary(nextLibrary)
  }

  async function handleResetToFactory(): Promise<void> {
    const reset = await window.api.resetSettings()
    setSettings(reset)
    setToolUpdateStatus(null)
    setView('info')
    setActiveTab('home')
    setScreen('onboarding')
  }

  return (
    <div className="app-shell">
      <BackgroundFX />
      <TitleBar
        version={version}
        onOpenLibrary={() => {
          const next = view === 'play' ? 'info' : 'play'
          if (next === 'info') setActiveTab('home')
          switchView(next)
        }}
      />
      <header className="app-shell__header app-region-drag">
        <span />
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
          <>
            {screen === 'onboarding' && (
              <div className="fade-in">
                <GameOnboarding game={PRIMARY_GAME} onComplete={handleOnboardingComplete} />
              </div>
            )}
            {screen === 'game' && activeEntry && (
              <div key={view} className="view-shell fade-in">
                {view === 'play' ? (
                  <PlayView
                    game={PRIMARY_GAME}
                    entry={activeEntry}
                    updateStatus={toolUpdateStatus}
                    onOpenInfo={() => switchView('info')}
                  />
                ) : (
                  <InfoView
                    game={PRIMARY_GAME}
                    entry={activeEntry}
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                      setActiveTab(tab)
                      refreshUpdateChecks()
                    }}
                    onSaved={handleSetupSaved}
                    onResetToFactory={handleResetToFactory}
                    onOpenPlay={() => switchView('play')}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
