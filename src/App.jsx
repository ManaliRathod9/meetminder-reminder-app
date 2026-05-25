import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { firebaseReady, auth } from './firebase/firebase'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'

// Inline styles below are intentional: these screens render before Tailwind is
// guaranteed to load, so they must not depend on utility classes to be visible.
const S = {
  page: {
    minHeight: '100vh',
    background: '#faf9f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px 32px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
    border: '1px solid #e5e7eb',
  },
  icon: {
    width: '48px',
    height: '48px',
    background: '#3b82f6',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    fontSize: '22px',
  },
  h1: { fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: '0 0 8px' },
  p:  { fontSize: '14px', color: '#6b7280', margin: '0 0 20px', lineHeight: '1.65' },
  code: {
    background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px',
    fontSize: '12px', color: '#374151',
  },
  pre: {
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
    padding: '16px', margin: '0 0 20px',
    fontSize: '12px', color: '#334155', lineHeight: '1.9',
    whiteSpace: 'pre-wrap', overflowX: 'auto',
  },
  ol: { fontSize: '13px', color: '#6b7280', lineHeight: '2.1', paddingLeft: '20px', margin: '0 0 24px' },
  btn: {
    width: '100%', padding: '12px', borderRadius: '12px',
    background: '#3b82f6', color: '#ffffff', border: 'none',
    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
  },
}

function SetupScreen() {
  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.icon}>📅</div>
        <h1 style={S.h1}>Firebase config is missing</h1>
        <p style={S.p}>
          Your <code style={S.code}>.env</code> file is missing or has empty values.
          MeetMinder needs your Firebase credentials to work.
        </p>
        <pre style={S.pre}>{[
          'VITE_FIREBASE_API_KEY=your_api_key',
          'VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com',
          'VITE_FIREBASE_PROJECT_ID=your_project_id',
          'VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com',
          'VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id',
          'VITE_FIREBASE_APP_ID=your_app_id',
        ].join('\n')}</pre>
        <ol style={S.ol}>
          <li>Open <strong>console.firebase.google.com</strong></li>
          <li>Go to Project Settings → Your apps → SDK setup → Config</li>
          <li>Paste those values into <code style={S.code}>meetminder/.env</code></li>
          <li>
            <strong>Stop</strong> the dev server and run{' '}
            <code style={S.code}>npm run dev</code> again
          </li>
        </ol>
        <button style={S.btn} onClick={() => window.location.reload()}>
          I've added the values — reload now
        </button>
      </div>
    </div>
  )
}

function FirebaseErrorScreen() {
  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ ...S.icon, background: '#ef4444' }}>⚠️</div>
        <h1 style={S.h1}>Firebase connection error</h1>
        <p style={S.p}>
          Your <code style={S.code}>.env</code> values are present but Firebase
          rejected the API key. The most common causes:
        </p>
        <ul style={{ ...S.ol, paddingLeft: '20px' }}>
          <li>The API key was copied with extra spaces or quotes</li>
          <li>The values belong to a different Firebase project</li>
          <li>Authentication is not enabled in the Firebase Console</li>
          <li>The dev server wasn't restarted after editing <code style={S.code}>.env</code></li>
        </ul>
        <p style={{ ...S.p, margin: '0 0 20px' }}>
          Check{' '}
          <strong>Firebase Console → Project Settings → Your apps → Config</strong>{' '}
          and copy the exact values into your <code style={S.code}>.env</code>.
          Then stop and restart <code style={S.code}>npm run dev</code>.
        </p>
        <button style={S.btn} onClick={() => window.location.reload()}>
          Reload after fixing
        </button>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ ...S.page, flexDirection: 'column', gap: '14px' }}>
      <div style={{
        width: '38px', height: '38px',
        border: '3px solid #bfdbfe',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'mm-spin 0.75s linear infinite',
      }} />
      <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
        Loading MeetMinder…
      </p>
      <style>{`@keyframes mm-spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  // 1. No env vars → guide the user to fill in .env
  if (!firebaseReady) return <SetupScreen />

  // 2. Env vars present but Firebase init failed
  if (firebaseReady && !auth) return <FirebaseErrorScreen />

  // 3. Waiting for auth state to resolve
  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  )
}
