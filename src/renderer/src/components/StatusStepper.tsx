import type { LaunchStep } from '@shared/types'
import './StatusStepper.css'

type StageStatus = 'pending' | 'active' | 'done' | 'error'

function resolveStatuses(step: LaunchStep | null): StageStatus[] {
  if (!step) return ['pending', 'pending', 'pending']

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
}

export default function StatusStepper({ step, toolLabel, gameLabel }: StatusStepperProps): React.JSX.Element {
  const statuses = resolveStatuses(step)
  const stages = [
    { id: 'tool', label: toolLabel },
    { id: 'confirm', label: 'Confirm' },
    { id: 'game', label: gameLabel }
  ]

  return (
    <div className="stepper">
      {stages.map((stage, index) => (
        <div className="stepper__stage" key={stage.id}>
          <div className={`stepper__node stepper__node--${statuses[index]}`}>
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
          </div>
          <span className={`stepper__label stepper__label--${statuses[index]}`}>{stage.label}</span>
          {index < stages.length - 1 && (
            <div className={`stepper__connector ${statuses[index] === 'done' ? 'is-filled' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}
