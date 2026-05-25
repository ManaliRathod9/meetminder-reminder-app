import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import { BrowserRouter } from 'react-router-dom'

// ErrorBoundary: shows a readable error card instead of a blank page on runtime errors.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[MeetMinder] Uncaught render error:', error, info)
  }
  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{
        minHeight: '100vh', background: '#faf9f7',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
      }}>
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '32px',
          maxWidth: '480px', width: '100%', boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            MeetMinder hit an unexpected error. Check your <code style={{
              background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '12px'
            }}>.env</code> file has all six Firebase variables, then refresh the page.
          </p>
          <details style={{ marginBottom: '16px' }}>
            <summary style={{ fontSize: '12px', color: '#9ca3af', cursor: 'pointer' }}>
              Error details
            </summary>
            <pre style={{
              marginTop: '8px', fontSize: '11px', color: '#ef4444',
              background: '#fef2f2', padding: '12px', borderRadius: '8px',
              overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
            }}>
              {this.state.error?.message ?? String(this.state.error)}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              width: '100%', padding: '10px', borderRadius: '10px',
              background: '#3b82f6', color: '#fff', border: 'none',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
