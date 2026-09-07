import { useState } from 'react'
import { motion } from 'framer-motion'
import './CoverArt.css'

const CDN_HOSTS = ['cdn.akamai.steamstatic.com', 'cdn.cloudflare.steamstatic.com']

const VARIANT_FILENAME = {
  cover: 'library_600x900.jpg',
  hero: 'library_hero.jpg'
} as const

interface CoverArtProps {
  steamAppId: number
  alt: string
  className?: string
  /** 'cover' is the portrait library capsule; 'hero' is Steam's wide banner art. */
  variant?: keyof typeof VARIANT_FILENAME
  onClick?: () => void
}

export default function CoverArt({
  steamAppId,
  alt,
  className,
  variant = 'cover',
  onClick
}: CoverArtProps): React.JSX.Element {
  const [hostIndex, setHostIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  const clickable = Boolean(onClick)

  if (failed) {
    return (
      <motion.div
        className={`cover-art cover-art--fallback cover-art--${variant} ${clickable ? 'is-clickable' : ''} ${className ?? ''}`}
        onClick={onClick}
        whileTap={clickable ? { scale: 0.97 } : undefined}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
      >
        <svg viewBox="0 0 24 24" width="28" height="28">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 16 L9 10 L13 14 L17 10 L21 14" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="1.6" fill="currentColor" />
        </svg>
      </motion.div>
    )
  }

  return (
    <motion.img
      className={`cover-art cover-art--${variant} ${clickable ? 'is-clickable' : ''} ${className ?? ''}`}
      alt={alt}
      src={`https://${CDN_HOSTS[hostIndex]}/steam/apps/${steamAppId}/${VARIANT_FILENAME[variant]}`}
      onClick={onClick}
      whileTap={clickable ? { scale: 0.97 } : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onError={() => {
        if (hostIndex < CDN_HOSTS.length - 1) {
          setHostIndex(hostIndex + 1)
        } else {
          setFailed(true)
        }
      }}
    />
  )
}
