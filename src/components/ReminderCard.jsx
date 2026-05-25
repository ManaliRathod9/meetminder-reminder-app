import { Clock, MapPin, AlertCircle, Trash2 } from 'lucide-react'
import { CATEGORY_COLORS, PRIORITY_COLORS, STATUS_COLORS } from '../utils/constants'
import { formatTime, getRelativeLabel, isPastDateTime } from '../utils/dateHelpers'
import { toDisplayTitle } from '../utils/textHelpers'

export default function ReminderCard({ reminder, onClick, onDelete, isSelected }) {
  const autoMissed =
    reminder.status === 'Pending' && isPastDateTime(reminder.date, reminder.time)
  const displayStatus = autoMissed ? 'Missed' : reminder.status
  const isDone = reminder.status === 'Done'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(reminder)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(reminder)}
      className={`w-full text-left p-4 rounded-2xl border cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-300 bg-blue-50/60 ring-1 ring-blue-200'
          : autoMissed
          ? 'border-red-100 bg-red-50/30 hover:border-red-200'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      {/* Category + priority on the left, status + delete on the right */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              CATEGORY_COLORS[reminder.category] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {reminder.category}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              PRIORITY_COLORS[reminder.priority] || 'bg-gray-100 text-gray-500'
            }`}
          >
            {reminder.priority}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              STATUS_COLORS[displayStatus] || 'bg-gray-100 text-gray-500'
            }`}
          >
            {displayStatus}
          </span>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(reminder) }}
              className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all -mr-0.5"
              aria-label="Delete reminder"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <p
        className={`text-sm font-semibold mb-2 leading-snug ${
          isDone ? 'line-through text-gray-400' : 'text-gray-800'
        }`}
      >
        {toDisplayTitle(reminder.title)}
      </p>

      {/* Date / time + location */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3 shrink-0" />
          {getRelativeLabel(reminder.date)}
          {reminder.time && (
            <span className="text-gray-400"> · {formatTime(reminder.time)}</span>
          )}
        </span>

        {reminder.location && (
          <span className="flex items-center gap-1 text-xs text-gray-400 max-w-[150px]">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{reminder.location}</span>
          </span>
        )}
      </div>

      {autoMissed && (
        <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-red-400">
          <AlertCircle className="w-3 h-3 shrink-0" />
          This one passed — tap to update it.
        </div>
      )}
    </div>
  )
}
