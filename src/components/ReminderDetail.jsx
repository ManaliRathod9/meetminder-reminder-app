import { useState } from 'react'
import {
  X, Clock, MapPin, ExternalLink, FileText,
  CheckCircle, Pencil, Trash2, RefreshCw, AlertCircle, Bell,
  RotateCcw,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { updateReminderStatus } from '../firebase/reminders'
import { CATEGORY_COLORS, PRIORITY_COLORS, STATUS_COLORS } from '../utils/constants'
import { formatDate, formatTime, isPastDateTime } from '../utils/dateHelpers'
import { toDisplayTitle } from '../utils/textHelpers'

export default function ReminderDetail({ reminder, onClose, onEdit, onDelete }) {
  const { user } = useAuth()
  const [statusLoading, setStatusLoading] = useState(false)

  if (!reminder) return null

  const isMissed =
    reminder.status === 'Pending' && isPastDateTime(reminder.date, reminder.time)

  async function handleStatus(status) {
    setStatusLoading(true)
    try {
      await updateReminderStatus(user.uid, reminder.id, status)
    } finally {
      setStatusLoading(false)
    }
  }

  const reminderBeforeLabel = {
    10: '10 minutes before',
    30: '30 minutes before',
    60: '1 hour before',
    1440: '1 day before',
  }[reminder.reminderBefore]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-full">
      <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex-1 pr-4 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Chip color={CATEGORY_COLORS[reminder.category]}>{reminder.category}</Chip>
            <Chip color={PRIORITY_COLORS[reminder.priority]}>{reminder.priority} priority</Chip>
            <Chip color={STATUS_COLORS[isMissed ? 'Missed' : reminder.status]}>
              {isMissed ? 'Missed' : reminder.status}
            </Chip>
          </div>
          <h2
            className={`text-lg font-semibold leading-snug break-words ${
              reminder.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-800'
            }`}
          >
            {toDisplayTitle(reminder.title)}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 shrink-0 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <InfoRow icon={<Clock className="w-4 h-4" />} label="When">
          <span className="text-sm text-gray-700">
            {formatDate(reminder.date)}
            {reminder.time && (
              <span className="text-gray-500"> · {formatTime(reminder.time)}</span>
            )}
          </span>
        </InfoRow>

        {reminder.location && (
          <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location">
            <span className="text-sm text-gray-700">{reminder.location}</span>
          </InfoRow>
        )}

        {reminder.meetingLink && (
          <InfoRow icon={<ExternalLink className="w-4 h-4" />} label="Meeting">
            <a
              href={reminder.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-xl transition-colors font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Join Meeting
            </a>
          </InfoRow>
        )}

        {reminder.notes && (
          <InfoRow icon={<FileText className="w-4 h-4" />} label="Notes">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {reminder.notes}
            </p>
          </InfoRow>
        )}

        {reminderBeforeLabel && (
          <InfoRow icon={<Bell className="w-4 h-4" />} label="Remind me">
            <span className="text-sm text-gray-700">{reminderBeforeLabel}</span>
          </InfoRow>
        )}

        {isMissed && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>This one passed. Mark it as missed or rescheduled below.</span>
          </div>
        )}

        {reminder.category === 'Interview' && reminder.status === 'Pending' && !isMissed && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-sm text-purple-700">
            💪 Take a moment to prepare before your interview. You've got this.
          </div>
        )}

        {reminder.category === 'Payment' && reminder.status === 'Pending' && !isMissed && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-sm text-yellow-700">
            💳 Have everything ready before the due date.
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-5 py-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          {reminder.status !== 'Done' && (
            <ActionBtn
              onClick={() => handleStatus('Done')}
              disabled={statusLoading}
              color="green"
              icon={<CheckCircle className="w-3.5 h-3.5" />}
            >
              Mark done
            </ActionBtn>
          )}
          {reminder.status !== 'Rescheduled' && (
            <ActionBtn
              onClick={() => handleStatus('Rescheduled')}
              disabled={statusLoading}
              color="yellow"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reschedule
            </ActionBtn>
          )}
          {(isMissed || (reminder.status === 'Pending' && !isMissed)) && (
            <ActionBtn
              onClick={() => handleStatus('Missed')}
              disabled={statusLoading}
              color="red"
              icon={<AlertCircle className="w-3.5 h-3.5" />}
            >
              Mark missed
            </ActionBtn>
          )}
          {['Done', 'Missed', 'Rescheduled'].includes(reminder.status) && (
            <ActionBtn
              onClick={() => handleStatus('Pending')}
              disabled={statusLoading}
              color="gray"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset to pending
            </ActionBtn>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(reminder)}
            className="flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-xl transition-colors font-medium"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => onDelete?.(reminder)}
            className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-2 rounded-xl transition-colors font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function Chip({ color, children }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color || 'bg-gray-100 text-gray-600'}`}>
      {children}
    </span>
  )
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex gap-3">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  )
}

function ActionBtn({ onClick, disabled, color, icon, children }) {
  const colors = {
    green: 'bg-green-50 hover:bg-green-100 text-green-600',
    yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600',
    red: 'bg-red-50 hover:bg-red-100 text-red-500',
    gray: 'bg-gray-50 hover:bg-gray-100 text-gray-500',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-colors font-medium disabled:opacity-50 ${colors[color]}`}
    >
      {icon}
      {children}
    </button>
  )
}
