import { motion } from 'framer-motion'
import './NavTabs.css'

export type ViewId = 'launch' | 'setup' | 'safety'

interface Tab {
  id: ViewId
  label: string
}

interface NavTabsProps {
  active: ViewId
  onChange: (id: ViewId) => void
  showSafety: boolean
}

export default function NavTabs({ active, onChange, showSafety }: NavTabsProps): React.JSX.Element {
  const tabs: Tab[] = [
    { id: 'launch', label: 'Launch' },
    { id: 'setup', label: 'Setup' },
    ...(showSafety ? [{ id: 'safety' as const, label: 'Safety Guide' }] : [])
  ]

  return (
    <nav className="nav-tabs app-region-no-drag">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tabs__item ${active === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {active === tab.id && (
            <motion.span
              layoutId="nav-underline"
              className="nav-tabs__underline"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
        </button>
      ))}
    </nav>
  )
}
