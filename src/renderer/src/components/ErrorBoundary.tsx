import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
  info: string | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, info: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, info: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('RENDER_CRASH', error.stack ?? error.message, errorInfo.componentStack)
    this.setState({ info: errorInfo.componentStack ?? null })
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#ffb4a8', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <h2>Something crashed</h2>
          <p>{this.state.error.message}</p>
          <p>{this.state.error.stack}</p>
          <p>{this.state.info}</p>
        </div>
      )
    }
    return this.props.children
  }
}
