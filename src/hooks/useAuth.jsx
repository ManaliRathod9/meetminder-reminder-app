import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth, firebaseReady } from '../firebase/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false)
      return
    }

    // Safety timeout: if Firebase never calls back (bad network, wrong config),
    // resolve after 8 s so the user sees the Login page instead of a spinner.
    const timer = setTimeout(() => {
      console.warn(
        '[MeetMinder] Auth state did not resolve after 8 s.',
        'Check your Firebase project settings and internet connection.'
      )
      setLoading(false)
    }, 8_000)

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        clearTimeout(timer)
        setUser(firebaseUser)
        setLoading(false)
      },
      (err) => {
        clearTimeout(timer)
        console.error('[MeetMinder] Auth listener error:', err.code, '-', err.message)
        // Resolve to "no user" so the app shows Login instead of a blank page.
        setUser(null)
        setLoading(false)
      }
    )

    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [])

  async function signup(email, password, displayName) {
    if (!auth) throw new Error('Firebase is not configured. Check your .env file.')
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await updateProfile(credential.user, { displayName })
    }
    return credential
  }

  async function login(email, password) {
    if (!auth) throw new Error('Firebase is not configured. Check your .env file.')
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    if (!auth) return
    return signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.')
  return ctx
}
