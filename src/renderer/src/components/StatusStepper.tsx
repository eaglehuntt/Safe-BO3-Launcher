import { motion } from 'framer-motion'
import type { LaunchStep } from '@shared/types'
import './StatusStepper.css'

type StageStatus = 'pending' | 'active' | 'done' | 'error'

interface Stage {
  id: string
  label: string
}

const STAGES: Stage[] = [
  { id: 't7', label: 'T7 Patch' },
  { id: 'confirm', label: 'Confirm' },
  { id: 'bo3', label: 'Black Ops 3' }
]

function resolveStatuses(step: LaunchStep | null): StageStatus[] {
  if (!step) return ['pending', 'pending', 'pending']

  const order: Record<Exclude<LaunchStep, 'error'>, number> = {
    'launching-t7': 0,
    't7-already-running': 0,
    'waiting-t7': 1,
    't7-confirmed': 1,
    'launching-bo3': 2,
    done: 3
  }

  if (step === 'error') {
    return ['done', 'error', 'pending']
  }

  const activeIndex = order[step]
  return STAGES.map((_, index) => {
    if (index < activeIndex) return 'done'
    if (index === activeIndex) return step === 'done' ? 'done' : 'active'
    return 'pending'
  })
}

interface StatusStepperProps {
  step: LaunchStep | null
}

export default function StatusStepper({ step }: StatusStepperProps): React.JSX.Element {
  const statuses = resolveStatuses(step)

  return (
    <div className="stepper">
      {STAGES.map((stage, index) => (
        <div className="stepper__stage" key={stage.id}>
          <div className={`stepper__node stepper__node--${statuses[index]}`}>
            {statuses[index] === 'done' && (
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.35 }}
                viewBox="0 0 24 24"
                width="14"
                height="14"
              >
                <motion.path
                  d="M5 12.5 L10 17 L19 7"
                  fill="none"
                  stroke="#140b06"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
            {statuses[index] === 'active' && <span className="stepper__pulse" />}
            {statuses[index] === 'error' && <span className="stepper__error">!</span>}
          </div>
          <span className={`stepper__label stepper__label--${statuses[index]}`}>{stage.label}</span>
          {index < STAGES.length - 1 && (
            <div className={`stepper__connector ${statuses[index] === 'done' ? 'is-filled' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}
