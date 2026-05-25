import { isTodayDate, isTomorrowDate, formatTime, isPastDateTime } from '../utils/dateHelpers'
import { PRIORITY_COLORS } from '../utils/constants'
import { toDisplayTitle } from '../utils/textHelpers'

export default function DashboardSummary({ reminders, onCardClick }) {
  const todayPending = reminders.filter(
    (r) => isTodayDate(r.date) && r.status !== 'Done'
  )
  const tomorrowItems = reminders.filter(
    (r) => isTomorrowDate(r.date) && r.status !== 'Done'
  )
  const overdue = reminders.filter(
    (r) => r.status === 'Pending' && isPastDateTime(r.date, r.time)
  )
  // High-priority items that are NOT today, tomorrow, or already overdue
  const highPriorityUpcoming = reminders.filter(
    (r) =>
      r.priority === 'High' &&
      r.status === 'Pending' &&
      !isTodayDate(r.date) &&
      !isTomorrowDate(r.date) &&
      !isPastDateTime(r.date, r.time)
  )

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const n = todayPending.length
  const scheduledText =
    n === 0 ? 'No reminders scheduled' :
    n === 1 ? '1 reminder scheduled' :
    `${n} reminders scheduled`

  return (
    <div className="mb-5">
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Today</h1>
          <p className="text-sm text-gray-400 mt-0.5">{scheduledText}</p>
        </div>
        <span className="text-xs text-gray-400 pt-1 shrink-0 ml-3 text-right">{dateStr}</span>
      </div>

      {overdue.length > 0 && (
        <Section title={`Overdue · ${overdue.length}`} accent="red">
          {overdue.slice(0, 3).map((r) => (
            <MiniCard key={r.id} reminder={r} onClick={() => onCardClick(r)} />
          ))}
        </Section>
      )}

      {todayPending.length > 0 && (
        <Section title="Today">
          {todayPending.map((r) => (
            <MiniCard key={r.id} reminder={r} onClick={() => onCardClick(r)} />
          ))}
        </Section>
      )}

      {tomorrowItems.length > 0 && (
        <Section title="Tomorrow">
          {tomorrowItems.map((r) => (
            <MiniCard key={r.id} reminder={r} onClick={() => onCardClick(r)} />
          ))}
        </Section>
      )}

      {highPriorityUpcoming.length > 0 && (
        <Section title="High priority">
          {highPriorityUpcoming.slice(0, 4).map((r) => (
            <MiniCard key={r.id} reminder={r} onClick={() => onCardClick(r)} />
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, accent, children }) {
  const titleCls = accent === 'red' ? 'text-red-500' : 'text-gray-400'
  return (
    <div className="mb-4">
      <h3 className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${titleCls}`}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function MiniCard({ reminder, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-xl px-3 py-2.5 mb-1.5 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">
          {toDisplayTitle(reminder.title)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {reminder.time ? formatTime(reminder.time) : 'No time set'}
          {reminder.location ? ` · ${reminder.location}` : ''}
        </p>
      </div>
      <span
        className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 font-medium ${
          PRIORITY_COLORS[reminder.priority] || 'bg-gray-100 text-gray-500'
        }`}
      >
        {reminder.priority}
      </span>
    </button>
  )
}
