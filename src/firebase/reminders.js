import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

function remindersCol(userId) {
  if (!db) throw new Error('Firestore is not initialised (check your .env file).')
  return collection(db, 'users', userId, 'reminders')
}

export async function addReminder(userId, data) {
  const ref = remindersCol(userId)
  const docRef = await addDoc(ref, {
    ...data,
    userId,
    status: data.status || 'Pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateReminder(userId, reminderId, data) {
  if (!db) throw new Error('Firestore is not initialised.')
  const ref = doc(db, 'users', userId, 'reminders', reminderId)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export async function deleteReminder(userId, reminderId) {
  if (!db) throw new Error('Firestore is not initialised.')
  const ref = doc(db, 'users', userId, 'reminders', reminderId)
  await deleteDoc(ref)
}

export async function updateReminderStatus(userId, reminderId, status) {
  if (!db) throw new Error('Firestore is not initialised.')
  const ref = doc(db, 'users', userId, 'reminders', reminderId)
  await updateDoc(ref, { status, updatedAt: serverTimestamp() })
}

export function subscribeToReminders(userId, callback) {
  const q = query(remindersCol(userId), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? null,
        updatedAt: d.data().updatedAt?.toDate?.() ?? null,
      }))
      callback(items)
    },
    (err) => {
      console.error('[MeetMinder] Firestore listener error:', err.message)
      // Don't crash — just stop loading with empty state
      callback([])
    }
  )
}
