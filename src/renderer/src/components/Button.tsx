import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import './Button.css'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'outline'
  disabled?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  title?: string
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  icon,
  title
}: ButtonProps): React.JSX.Element {
  return (
    <motion.button
      className={`btn btn--${variant} ${fullWidth ? 'btn--full' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { y: -1 }}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </motion.button>
  )
}
