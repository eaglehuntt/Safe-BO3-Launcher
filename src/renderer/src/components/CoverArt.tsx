import { useState } from 'react'
import './CoverArt.css'

const CDN_HOSTS = ['cdn.akamai.steamstatic.com', 'cdn.cloudflare.steamstatic.com']

interface CoverArtProps {
  steamAppId: number
  alt: string
  className?: string
}

export default function CoverArt({ steamAppId, alt, className }: CoverArtProps): React.JSX.Element {
  const [hostIndex, setHostIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={`cover-art cover-art--fallback ${className ?? ''}`}>
        <svg viewBox="0 0 24 24" width="28" height="28">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 16 L9 10 L13 14 L17 10 L21 14" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="1.6" fill="currentColor" />
        </svg>
      </div>
    )
  }

  return (
    <img
      className={`cover-art ${className ?? ''}`}
      alt={alt}
      src={`https://${CDN_HOSTS[hostIndex]}/steam/apps/${steamAppId}/library_600x900.jpg`}
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
