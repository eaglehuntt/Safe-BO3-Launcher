import { motion } from 'framer-motion'
import './SafetyView.css'

const REDDIT_THREAD_URL =
  'https://www.reddit.com/r/blackops3/comments/1taywc6/how_to_play_safely_in_2026_the_t7_patch/'
const T7_PATCH_REPO_URL = 'https://github.com/Scroptss/T7Patch'

interface SafetyTip {
  title: string
  body: string
}

const TIPS: SafetyTip[] = [
  {
    title: 'Run a community patch, always',
    body: 'The base game still ships with long-standing exploits. A maintained patch like T7 closes off the crash and remote-code-execution issues that unpatched lobbies are vulnerable to — this launcher exists to make sure it’s actually running before BO3 starts.'
  },
  {
    title: 'Password your lobbies',
    body: 'Set a network/lobby password and only hand it out to people you actually trust. Open, unprotected lobbies are the most common way players get hit with crash or booting exploits.'
  },
  {
    title: 'Hide your Steam profile',
    body: 'Some exploits are aimed using info pulled from a public Steam profile. Setting your profile (and game details) to private removes an easy target.'
  },
  {
    title: 'Consider a VPN',
    body: 'If you’re worried about IP exposure or DDoS attempts, routing through a VPN masks your real IP from anyone in the lobby.'
  },
  {
    title: 'Keep the patch up to date',
    body: 'Coverage changes as new issues get found and fixed — grab updates from the official repo instead of an old, possibly stale copy.'
  },
  {
    title: 'Don’t mix it with public cheats',
    body: 'The patch is a safety net, not a modding shortcut. Running public cheats alongside it defeats the point and can get you banned regardless.'
  }
]

export default function SafetyView(): React.JSX.Element {
  return (
    <div className="safety-view">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h2 className="safety-view__heading">Playing safely in 2026</h2>
        <p className="safety-view__subheading">
          A quick summary of community guidance on staying safe in Black Ops 3 lobbies, gathered from
          the player-run T7 patch community.
        </p>
      </motion.div>

      <div className="safety-view__grid">
        {TIPS.map((tip, index) => (
          <motion.div
            className="safety-view__card"
            key={tip.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.3 }}
          >
            <span className="safety-view__card-index">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="safety-view__card-title">{tip.title}</h3>
            <p className="safety-view__card-body">{tip.body}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="safety-view__links"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <button className="safety-view__link" onClick={() => window.api.openExternal(REDDIT_THREAD_URL)}>
          Read the original community thread ↗
        </button>
        <button className="safety-view__link" onClick={() => window.api.openExternal(T7_PATCH_REPO_URL)}>
          T7 Patch GitHub repo ↗
        </button>
      </motion.div>
    </div>
  )
}
