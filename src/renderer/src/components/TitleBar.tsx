import './TitleBar.css'

interface TitleBarProps {
  version: string
}

export default function TitleBar({ version }: TitleBarProps): React.JSX.Element {
  return (
    <div className="titlebar app-region-drag">
      <div className="titlebar__brand">
        <span className="titlebar__mark">
          <svg viewBox="0 0 32 32" width="18" height="18">
            <polygon points="16,1 30,8 30,24 16,31 2,24 2,8" fill="none" stroke="url(#tb-grad)" strokeWidth="2" />
            <path d="M11 21 L16 10 L21 21 M13 17 H19" fill="none" stroke="url(#tb-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="tb-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffb454" />
                <stop offset="100%" stopColor="#e8352a" />
              </linearGradient>
            </defs>
          </svg>
        </span>
        <span className="titlebar__title">
          SAFE <span className="titlebar__title--accent">BO3</span> LAUNCHER
        </span>
        <span className="titlebar__version">v{version}</span>
      </div>
    </div>
  )
}
