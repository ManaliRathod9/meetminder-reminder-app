import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: Vite reads .env only at server startup.
// After editing .env you must stop and restart npm run dev.
const API_KEY             = import.meta.env.VITE_FIREBASE_API_KEY
const AUTH_DOMAIN         = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
const PROJECT_ID          = import.meta.env.VITE_FIREBASE_PROJECT_ID
const STORAGE_BUCKET      = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
const MESSAGING_SENDER_ID = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
const APP_ID              = import.meta.env.VITE_FIREBASE_APP_ID

// Dev-only: logs true/false for each var — never prints actual key values.
if (import.meta.env.DEV) {
  console.group('%c MeetMinder · Firebase env check', 'color:#3b82f6;font-weight:bold')
  console.log('VITE_FIREBASE_API_KEY            :', !!API_KEY)
  console.log('VITE_FIREBASE_AUTH_DOMAIN        :', !!AUTH_DOMAIN)
  console.log('VITE_FIREBASE_PROJECT_ID         :', !!PROJECT_ID)
  console.log('VITE_FIREBASE_STORAGE_BUCKET     :', !!STORAGE_BUCKET)
  console.log('VITE_FIREBASE_MESSAGING_SENDER_ID:', !!MESSAGING_SENDER_ID)
  console.log('VITE_FIREBASE_APP_ID             :', !!APP_ID)
  console.groupEnd()
}

export const firebaseReady =
  !!API_KEY &&
  !!AUTH_DOMAIN &&
  !!PROJECT_ID &&
  !!STORAGE_BUCKET &&
  !!MESSAGING_SENDER_ID &&
  !!APP_ID

// `let` so the assignments inside the if/else block work in ES modules.
export let auth = null
export let db   = null

if (!firebaseReady) {
  console.error(
    '%c MeetMinder · Firebase not configured',
    'color:red;font-weight:bold',
    '\n\nOne or more VITE_FIREBASE_* variables are missing or empty in your .env file.',
    '\nMake sure your meetminder/.env looks like this:',
    '\n\nVITE_FIREBASE_API_KEY=...',
    '\nVITE_FIREBASE_AUTH_DOMAIN=...',
    '\nVITE_FIREBASE_PROJECT_ID=...',
    '\nVITE_FIREBASE_STORAGE_BUCKET=...',
    '\nVITE_FIREBASE_MESSAGING_SENDER_ID=...',
    '\nVITE_FIREBASE_APP_ID=...',
    '\n\nThen STOP the dev server and run  npm run dev  again.'
  )
} else {
  // try-catch here because getAuth() in Firebase 12 throws synchronously on a bad
  // API key, which would crash the entire ES module chain before React mounts.
  try {
    const app = initializeApp({
      apiKey:            API_KEY,
      authDomain:        AUTH_DOMAIN,
      projectId:         PROJECT_ID,
      storageBucket:     STORAGE_BUCKET,
      messagingSenderId: MESSAGING_SENDER_ID,
      appId:             APP_ID,
    })

    auth = getAuth(app)
    db   = getFirestore(app)

    if (import.meta.env.DEV) {
      console.log('%c MeetMinder · Firebase initialized ✓', 'color:green;font-weight:bold')
    }
  } catch (err) {
    auth = null
    db   = null
    console.error(
      '%c MeetMinder · Firebase initialization failed',
      'color:red;font-weight:bold',
      '\nError code    :', err.code ?? 'unknown',
      '\nError message :', err.message,
      '\n\nCommon causes:',
      '\n • Invalid API key (check Firebase Console → Project Settings)',
      '\n • Wrong project ID or app ID',
      '\n • Values copied with extra spaces or quotes in .env'
    )
  }
}
