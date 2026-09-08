import { motion } from 'framer-motion'
import type { LaunchStep } from '@shared/types'
import './StatusStepper.css'

type StageStatus = 'pending' | 'active' | 'done' | 'error'

function resolveStatuses(step: LaunchStep | null, isToolRunning: boolean): StageStatus[] {
  if (!step) {
    // Nothing in flight yet, but if the tool's already running we can show
    // the first stage as already satisfied instead of leaving it blank.
    return isToolRunning ? ['done', 'pending', 'pending'] : ['pending', 'pending', 'pending']
  }

  const order: Record<Exclude<LaunchStep, 'error'>, number> = {
    'launching-tool': 0,
    'tool-already-running': 0,
    'waiting-tool': 1,
    'tool-confirmed': 1,
    'launching-game': 2,
    done: 3
  }

  if (step === 'error') {
    return ['done', 'error', 'pending']
  }

  const activeIndex = order[step]
  return [0, 1, 2].map((index) => {
    if (index < activeIndex) return 'done'
    if (index === activeIndex) return step === 'done' ? 'done' : 'active'
    return 'pending'
  })
}

interface StatusStepperProps {
  step: LaunchStep | null
  toolLabel: string
  gameLabel: string
  isToolRunning?: boolean
}

export default function StatusStepper({
  step,
  toolLabel,
  gameLabel,
  isToolRunning = false
}: StatusStepperProps): React.JSX.Element {
  const statuses = resolveStatuses(step, isToolRunning)
  const stages = [
    { id: 'tool', label: toolLabel },
    { id: 'confirm', label: 'Confirm' },
    { id: 'game', label: gameLabel }
  ]

  return (
    <div className="stepper">
      {stages.map((stage, index) => (
        <div className="stepper__stage" key={stage.id}>
          <div className="stepper__node-wrap">
            <motion.div
              key={statuses[index]}
              className={`stepper__node stepper__node--${statuses[index]}`}
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 16 }}
            >
              {statuses[index] === 'active' && (
                <>
                  <span className="stepper__ping" />
                  <span className="stepper__ping stepper__ping--delay" />
                </>
              )}
              {statuses[index] === 'done' && (
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path
                    className="stepper__check"
                    d="M5 12.5 L10 17 L19 7"
                    fill="none"
                    stroke="#140b06"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                  />
                </svg>
              )}
              {statuses[index] === 'active' && <span className="stepper__pulse" />}
              {statuses[index] === 'error' && <span className="stepper__error">!</span>}
            </motion.div>
            <span className={`stepper__label stepper__label--${statuses[index]}`}>{stage.label}</span>
          </div>
          {index < stages.length - 1 && (
            <div className={`stepper__connector ${statuses[index] === 'done' ? 'is-filled' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}
