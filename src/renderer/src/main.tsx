import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/global.css'

window.addEventListener('error', (event) => {
  // eslint-disable-next-line no-console
  console.error('WINDOW_ERROR', event.message, event.error?.stack)
})

window.addEventListener('unhandledrejection', (event) => {
  // eslint-disable-next-line no-console
  console.error('UNHANDLED_REJECTION', event.reason?.stack ?? event.reason)
})

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
