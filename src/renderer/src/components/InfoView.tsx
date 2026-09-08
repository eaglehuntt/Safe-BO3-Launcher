import { useLayoutEffect, useRef, useState } from 'react'
import type { LibraryEntry } from '@shared/types'
import type { GameDefinition } from '@shared/gameDefinitions'
import CoverArt from './CoverArt'
import HomeView from './HomeView'
import NavTabs, { type ViewId } from './NavTabs'
import SafetyView from './SafetyView'
import SetupView from './SetupView'
import './InfoView.css'

interface InfoViewProps {
  game: GameDefinition
  entry: LibraryEntry
  activeTab: ViewId
  onTabChange: (id: ViewId) => void
  onSaved: (entry: LibraryEntry) => void
  onResetToFactory: () => void
  onOpenPlay: () => void
}

export default function InfoView({
  game,
  entry,
  activeTab,
  onTabChange,
  onSaved,
  onResetToFactory,
  onOpenPlay
}: InfoViewProps): React.JSX.Element {
  const sideRef = useRef<HTMLDivElement>(null)
  const [sideHeight, setSideHeight] = useState<number | null>(null)

  // The content panel's height should always match the cover-art column's
  // natural height (so its border lines up with the Play button, and the
  // Play button never moves between tabs) rather than filling the window
  // or growing with whichever tab's content is tallest. A ResizeObserver
  // keeps this correct as the cover art's own size changes with a
  // resizable window, without hardcoding any pixel values.
  useLayoutEffect(() => {
    const el = sideRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      setSideHeight(entries[0].contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="info-view">
      <div className="info-view__side fade-in" ref={sideRef}>
        <CoverArt
          steamAppId={game.steamAppId}
          alt={game.name}
          variant="cover"
          className="info-view__cover-art"
          onClick={onOpenPlay}
        />
        <button className="info-view__play-btn" onClick={onOpenPlay}>
          Play
        </button>
      </div>

      <div className="info-view__main" style={sideHeight ? { height: sideHeight } : undefined}>
        <NavTabs active={activeTab} onChange={onTabChange} showSafety={Boolean(game.safetyTool)} />
        <div className="info-view__content">
          <div key={activeTab} className="fade-in">
            {activeTab === 'home' && <HomeView game={game} />}
            {activeTab === 'setup' && (
              <SetupView game={game} entry={entry} onSaved={onSaved} onResetToFactory={onResetToFactory} />
            )}
            {activeTab === 'safety' && game.safetyTool && <SafetyView />}
          </div>
        </div>
      </div>
    </div>
  )
}
