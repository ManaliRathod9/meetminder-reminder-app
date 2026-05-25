import { useEffect, useState } from 'react'
import { subscribeToReminders } from '../firebase/reminders'
import { useAuth } from './useAuth'
import { firebaseReady } from '../firebase/firebase'

export function useReminders() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !firebaseReady) {
      setReminders([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = subscribeToReminders(user.uid, (items) => {
      setReminders(items)
      setLoading(false)
    })

    return unsub
  }, [user])

  return { reminders, loading }
}
