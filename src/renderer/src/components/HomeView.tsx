import { useEffect, useState } from 'react'
import type { AtomFeedEntry } from '@shared/types'
import type { GameDefinition } from '@shared/gameDefinitions'
import { LAUNCHER_REPO_URL } from '@shared/gameDefinitions'
import './HomeView.css'

interface FeedColumn {
  id: string
  title: string
  feedUrl: string
}

function formatRelativeTime(iso: string): string {
  const deltaMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(deltaMs / 60000)
  if (minutes < 60) return minutes <= 1 ? 'just now' : `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function FeedList({ column }: { column: FeedColumn }): React.JSX.Element {
  const [entries, setEntries] = useState<AtomFeedEntry[] | null>(null)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setEntries(null)
    setExpandedKey(null)
    window.api.fetchFeed(column.feedUrl, 5).then((result) => {
      if (!cancelled) setEntries(result)
    })
    return () => {
      cancelled = true
    }
  }, [column.feedUrl])

  return (
    <div className="home-view__column fade-in">
      <h3 className="home-view__column-title">{column.title}</h3>
      {entries === null && <p className="home-view__empty">Loading…</p>}
      {entries !== null && entries.length === 0 && <p className="home-view__empty">No updates found.</p>}
      {entries !== null && entries.length > 0 && (
        <ul className="home-view__list">
          {entries.map((entry, index) => {
            const key = `${index}-${entry.url || entry.title}`
            const isExpanded = expandedKey === key
            return (
              <li key={key} className={`home-view__item ${isExpanded ? 'is-expanded' : ''}`}>
                <button
                  className="home-view__item-header"
                  onClick={() => setExpandedKey(isExpanded ? null : key)}
                  aria-expanded={isExpanded}
                >
                  <span className="home-view__item-title">{entry.title}</span>
                  <span className="home-view__item-date">{formatRelativeTime(entry.updated)}</span>
                </button>
                <div className="home-view__item-body">
                  <div className="home-view__item-body-inner">
                    <button
                      className="home-view__item-visit"
                      disabled={!entry.url}
                      onClick={(event) => {
                        event.stopPropagation()
                        if (entry.url) window.api.openExternal(entry.url)
                      }}
                    >
                      Visit release ↗
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function HomeView({ game }: { game: GameDefinition }): React.JSX.Element {
  const columns: FeedColumn[] = [
    { id: 'launcher', title: 'Launcher updates', feedUrl: `${LAUNCHER_REPO_URL}/releases.atom` },
    ...(game.safetyTool
      ? [
          {
            id: game.safetyTool.id,
            title: `${game.safetyTool.label} releases`,
            feedUrl: `${game.safetyTool.repoUrl.replace(/\/$/, '')}/releases.atom`
          }
        ]
      : [])
  ]

  return (
    <div className="home-view">
      <div className="home-view__grid">
        {columns.map((column) => (
          <FeedList key={column.id} column={column} />
        ))}
      </div>
    </div>
  )
}
