import { useEffect, useRef, useState } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { minutesUntil, formatTime } from '../utils/dateHelpers'
import { toDisplayTitle } from '../utils/textHelpers'

export default function NotificationManager({ reminders }) {
  const [permission, setPermission] = useState('default')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [upcomingAlerts, setUpcomingAlerts] = useState([])
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())
  const notifiedIds = useRef(new Set())

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [])

  async function requestPermission() {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') setBannerDismissed(true)
  }

  useEffect(() => {
    function tick() {
      if (!reminders?.length) return

      const alerts = []

      reminders.forEach((r) => {
        if (r.status !== 'Pending') return
        const mins = minutesUntil(r.date, r.time)
        if (mins === null) return

        const threshold = typeof r.reminderBefore === 'number' ? r.reminderBefore : 30

        if (mins >= -5 && mins <= threshold + 5) {
          alerts.push({ ...r, mins })
        }

        // Fire the browser notification once, within a 1-minute window of the threshold.
        if (
          permission === 'granted' &&
          mins >= threshold - 1 &&
          mins <= threshold + 1 &&
          !notifiedIds.current.has(r.id)
        ) {
          notifiedIds.current.add(r.id)
          try {
            new Notification('MeetMinder', {
              body: `${toDisplayTitle(r.title)} — coming up at ${formatTime(r.time)}`,
              icon: '/favicon.svg',
              tag: r.id,
            })
          } catch {
            // Notification API may be blocked by the OS
          }
        }
      })

      setUpcomingAlerts(alerts.slice(0, 3))
    }

    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [reminders, permission])

  const visibleAlerts = upcomingAlerts.filter((a) => !dismissedAlerts.has(a.id))

  return (
    <div className="space-y-2 mb-2">
      {permission === 'default' && !bannerDismissed && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Bell className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-700 flex-1 leading-snug">
            Want browser reminders before events?
          </p>
          <button
            onClick={requestPermission}
            className="text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Enable
          </button>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-blue-400 hover:text-blue-600 shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {permission === 'denied' && !bannerDismissed && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <BellOff className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 flex-1 leading-snug">
            Notifications are blocked. You can still check reminders right here.
          </p>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-amber-400 hover:text-amber-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {visibleAlerts.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3"
        >
          <Bell className="w-4 h-4 text-yellow-500 shrink-0 animate-pulse" />
          <p className="text-sm text-yellow-800 flex-1 leading-snug">
            <span className="font-semibold">{toDisplayTitle(r.title)}</span>
            {' '}
            {r.mins <= 0
              ? 'is happening right now.'
              : r.mins <= 10
              ? `is coming up in ${r.mins} minute${r.mins !== 1 ? 's' : ''}.`
              : `is at ${formatTime(r.time)} — heads up.`}
          </p>
          <button
            onClick={() => setDismissedAlerts((prev) => new Set([...prev, r.id]))}
            className="text-yellow-500 hover:text-yellow-700 shrink-0"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
