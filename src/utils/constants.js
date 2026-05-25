export const CATEGORIES = [
  'Interview',
  'Meeting',
  'Work',
  'Class',
  'Assignment',
  'Personal',
  'Travel',
  'Health',
  'Payment',
  'Other',
]

export const PRIORITIES = ['High', 'Medium', 'Low']

export const STATUSES = ['Pending', 'Done', 'Missed', 'Rescheduled']

export const REMINDER_BEFORE_OPTIONS = [
  { label: '10 minutes before', value: 10 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
]

export const CATEGORY_COLORS = {
  Interview: 'bg-purple-100 text-purple-700',
  Meeting: 'bg-blue-100 text-blue-700',
  Work: 'bg-indigo-100 text-indigo-700',
  Class: 'bg-cyan-100 text-cyan-700',
  Assignment: 'bg-teal-100 text-teal-700',
  Personal: 'bg-pink-100 text-pink-700',
  Travel: 'bg-orange-100 text-orange-700',
  Health: 'bg-green-100 text-green-700',
  Payment: 'bg-yellow-100 text-yellow-700',
  Other: 'bg-gray-100 text-gray-600',
}

export const PRIORITY_COLORS = {
  High: 'bg-red-100 text-red-600',
  Medium: 'bg-amber-100 text-amber-600',
  Low: 'bg-green-100 text-green-600',
}

export const STATUS_COLORS = {
  Pending: 'bg-blue-50 text-blue-600',
  Done: 'bg-green-100 text-green-700',
  Missed: 'bg-red-100 text-red-600',
  Rescheduled: 'bg-yellow-100 text-yellow-600',
}
