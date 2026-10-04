import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './index'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('OmniVerse ErrorBoundary caught an exception:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl glass p-8 border border-rose-500/30 text-center shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#0e1424] to-[#070b14]">
            {/* Ambient Red/Aurora Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center mb-5 shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="font-display text-2xl font-bold text-white">Something went off orbit</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)] max-w-sm mx-auto">
              An unexpected anomaly occurred while rendering this interface. Your data and library are safe.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 text-left text-xs font-mono text-rose-300/80 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={this.handleReload} variant="primary" className="gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </Button>
              <Button onClick={this.handleGoHome} variant="secondary" className="gap-2 text-xs">
                <Home className="w-3.5 h-3.5" />
                <span>Back to Universe</span>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
