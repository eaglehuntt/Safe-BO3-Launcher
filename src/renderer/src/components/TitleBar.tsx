import './TitleBar.css'

interface TitleBarProps {
  version: string
  onOpenLibrary: () => void
}

export default function TitleBar({ version, onOpenLibrary }: TitleBarProps): React.JSX.Element {
  return (
    <div className="titlebar app-region-drag">
      <div className="titlebar__brand">
        <button
          className="titlebar__mark app-region-no-drag"
          onClick={onOpenLibrary}
          title="Your library"
          aria-label="Open library"
        >
          <svg viewBox="0 0 32 32" width="18" height="18">
            <rect x="3" y="3" width="11" height="11" rx="2" fill="url(#tb-grad)" />
            <rect x="18" y="3" width="11" height="11" rx="2" fill="url(#tb-grad)" opacity="0.55" />
            <rect x="3" y="18" width="11" height="11" rx="2" fill="url(#tb-grad)" opacity="0.55" />
            <rect x="18" y="18" width="11" height="11" rx="2" fill="url(#tb-grad)" opacity="0.85" />
            <defs>
              <linearGradient id="tb-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffb454" />
                <stop offset="100%" stopColor="#e8352a" />
              </linearGradient>
            </defs>
          </svg>
        </button>
        <span className="titlebar__title">
          GAME<span className="titlebar__title--accent">SAFE</span> LAUNCHER
        </span>
        <span className="titlebar__version">v{version}</span>
      </div>
    </div>
  )
}
