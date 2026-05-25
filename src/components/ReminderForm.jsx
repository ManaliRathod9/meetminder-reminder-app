import { useState, useEffect } from 'react'
import { X, Calendar, Clock, MapPin, Link as LinkIcon, Tag, Flag, FileText, Bell } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { addReminder, updateReminder } from '../firebase/reminders'
import { CATEGORIES, PRIORITIES, STATUSES, REMINDER_BEFORE_OPTIONS } from '../utils/constants'

const BLANK = {
  title: '',
  date: '',
  time: '',
  location: '',
  meetingLink: '',
  category: 'Personal',
  priority: 'Medium',
  notes: '',
  reminderBefore: 30,
  status: 'Pending',
}

export default function ReminderForm({ isOpen, onClose, editReminder, defaultDate }) {
  const { user } = useAuth()
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSaved(false)
    setErrors({})
    if (editReminder) {
      setForm({
        title: editReminder.title ?? '',
        date: editReminder.date ?? '',
        time: editReminder.time ?? '',
        location: editReminder.location ?? '',
        meetingLink: editReminder.meetingLink ?? '',
        category: editReminder.category ?? 'Personal',
        priority: editReminder.priority ?? 'Medium',
        notes: editReminder.notes ?? '',
        reminderBefore: editReminder.reminderBefore ?? 30,
        status: editReminder.status ?? 'Pending',
      })
    } else {
      setForm({ ...BLANK, date: defaultDate ?? '' })
    }
  }, [isOpen, editReminder, defaultDate])

  function field(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'A title is required.'
    if (!form.date) e.date = 'A date is required.'
    if (!form.time) e.time = 'A time is required.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      if (editReminder) {
        await updateReminder(user.uid, editReminder.id, form)
      } else {
        await addReminder(user.uid, form)
      }
      setSaved(true)
      setTimeout(() => onClose(true), 650)
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 flex flex-col max-h-[93dvh]">
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-800 text-base">
            {editReminder ? 'Edit reminder' : 'New reminder'}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          id="reminder-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
        >
          {errors.submit && <Banner color="red">{errors.submit}</Banner>}
          {saved && (
            <Banner color="green">
              {editReminder ? 'Changes saved!' : 'Reminder added!'}
            </Banner>
          )}

          <Field label="What is this?" icon={<Tag className="w-3.5 h-3.5" />} error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => field('title', e.target.value)}
              placeholder="e.g. Team standup, Interview at 3pm, Pay rent…"
              className={input(errors.title)}
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" icon={<Calendar className="w-3.5 h-3.5" />} error={errors.date}>
              <input
                type="date"
                value={form.date}
                onChange={(e) => field('date', e.target.value)}
                className={input(errors.date)}
              />
            </Field>
            <Field label="Time" icon={<Clock className="w-3.5 h-3.5" />} error={errors.time}>
              <input
                type="time"
                value={form.time}
                onChange={(e) => field('time', e.target.value)}
                className={input(errors.time)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" icon={<Tag className="w-3.5 h-3.5" />}>
              <select value={form.category} onChange={(e) => field('category', e.target.value)} className={input()}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Priority" icon={<Flag className="w-3.5 h-3.5" />}>
              <select value={form.priority} onChange={(e) => field('priority', e.target.value)} className={input()}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Location (optional)" icon={<MapPin className="w-3.5 h-3.5" />}>
            <input
              type="text"
              value={form.location}
              onChange={(e) => field('location', e.target.value)}
              placeholder="Office, Zoom, Starbucks…"
              className={input()}
            />
          </Field>

          <Field label="Meeting link (optional)" icon={<LinkIcon className="w-3.5 h-3.5" />}>
            <input
              type="url"
              value={form.meetingLink}
              onChange={(e) => field('meetingLink', e.target.value)}
              placeholder="https://meet.google.com/…"
              className={input()}
            />
          </Field>

          <Field label="Notes (optional)" icon={<FileText className="w-3.5 h-3.5" />}>
            <textarea
              value={form.notes}
              onChange={(e) => field('notes', e.target.value)}
              placeholder="Anything worth writing down…"
              rows={3}
              className={`${input()} resize-none`}
            />
          </Field>

          <Field label="Remind me" icon={<Bell className="w-3.5 h-3.5" />}>
            <select
              value={form.reminderBefore}
              onChange={(e) => field('reminderBefore', Number(e.target.value))}
              className={input()}
            >
              {REMINDER_BEFORE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          {/* Status is only editable when editing an existing reminder */}
          {editReminder && (
            <Field label="Status">
              <select value={form.status} onChange={(e) => field('status', e.target.value)} className={input()}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          )}
        </form>

        <div className="border-t border-gray-100 px-5 py-4 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            form="reminder-form"
            type="submit"
            disabled={saving || saved}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-semibold transition-colors"
          >
            {saving ? 'Saving…' : saved ? '✓ Saved!' : editReminder ? 'Save changes' : 'Add reminder'}
          </button>
        </div>
      </div>
    </div>
  )
}

function input(error) {
  return `w-full border ${
    error ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
  } rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent placeholder-gray-400`
}

function Field({ label, icon, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        {icon}
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function Banner({ color, children }) {
  const cls =
    color === 'red'
      ? 'bg-red-50 border-red-100 text-red-600'
      : 'bg-green-50 border-green-100 text-green-700'
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm ${cls}`}>
      {children}
    </div>
  )
}
