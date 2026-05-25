import { useState, useMemo, useRef } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useReminders } from '../hooks/useReminders'
import { addReminder, deleteReminder } from '../firebase/reminders'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ReminderCard from '../components/ReminderCard'
import ReminderDetail from '../components/ReminderDetail'
import ReminderForm from '../components/ReminderForm'
import NotificationManager from '../components/NotificationManager'
import DashboardSummary from '../components/DashboardSummary'
import { exportReminders, parseBackupFile } from '../utils/backup'
import {
  isTodayDate,
  isTomorrowDate,
  isThisWeekDate,
  isThisMonthDate,
} from '../utils/dateHelpers'

const DEFAULT_FILTERS = {
  search: '',
  quickFilter: 'All',
  category: '',
  priority: '',
  status: '',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { reminders, loading } = useReminders()
  const importInputRef = useRef(null)

  // Undo-delete: hold the pending reminder + timer in a ref so async callbacks
  // always see the latest value without stale closures.
  const pendingDeleteRef = useRef(null)
  const toastTimerRef = useRef(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selectedReminder, setSelectedReminder] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editReminder, setEditReminder] = useState(null)
  const [toast, setToast] = useState(null)
  const [mobileView, setMobileView] = useState('list')

  function showToast(msg, type = 'success', duration = 3000) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ msg, type })
    toastTimerRef.current = setTimeout(() => setToast(null), duration)
  }

  const filtered = useMemo(() => {
    return reminders.filter((r) => {
      if (filters.quickFilter === 'Today' && !isTodayDate(r.date)) return false
      if (filters.quickFilter === 'Tomorrow' && !isTomorrowDate(r.date)) return false
      if (filters.quickFilter === 'This Week' && !isThisWeekDate(r.date)) return false
      if (filters.quickFilter === 'This Month' && !isThisMonthDate(r.date)) return false
      if (filters.category && r.category !== filters.category) return false
      if (filters.priority && r.priority !== filters.priority) return false
      if (filters.status && r.status !== filters.status) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const haystack = [r.title, r.notes, r.location, r.meetingLink]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [reminders, filters])

  const isFiltered =
    filters.search || filters.category || filters.priority || filters.status ||
    filters.quickFilter !== 'All'

  function handleCardClick(reminder) {
    setSelectedReminder(reminder)
    setMobileView('detail')
    setSidebarOpen(false)
  }

  function handleAddNew() {
    setEditReminder(null)
    setFormOpen(true)
  }

  function handleEdit(reminder) {
    setEditReminder(reminder)
    setFormOpen(true)
  }

  function handleFormClose(saved) {
    const wasEditing = !!editReminder
    setFormOpen(false)
    setEditReminder(null)
    if (saved) showToast(wasEditing ? 'Changes saved.' : 'Reminder added.')
  }

  // Soft-delete with undo: wait 4 s before writing to Firestore.
  // If Undo is clicked, cancel the timer — no Firestore call is ever made.
  function handleDeleteRequest(reminder) {
    // If a different reminder was already pending delete, flush it immediately.
    if (pendingDeleteRef.current) {
      clearTimeout(pendingDeleteRef.current.timerId)
      deleteReminder(user.uid, pendingDeleteRef.current.reminder.id).catch(() => {})
      pendingDeleteRef.current = null
    }

    // Hide the detail panel if this reminder is currently open.
    if (selectedReminder?.id === reminder.id) {
      setSelectedReminder(null)
      setMobileView('list')
    }

    const timerId = setTimeout(async () => {
      try {
        await deleteReminder(user.uid, reminder.id)
      } catch {
        showToast('Could not delete. Try again.', 'error')
      }
      pendingDeleteRef.current = null
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      setToast(null)
    }, 4000)

    pendingDeleteRef.current = { reminder, timerId }

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ msg: 'Reminder removed.', undo: true })
    toastTimerRef.current = setTimeout(() => setToast(null), 4200)
  }

  function handleUndoDelete() {
    if (!pendingDeleteRef.current) return
    clearTimeout(pendingDeleteRef.current.timerId)
    pendingDeleteRef.current = null
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ msg: 'Kept — no changes made.' })
    toastTimerRef.current = setTimeout(() => setToast(null), 2000)
  }

  function handleExport() {
    exportReminders(reminders, user?.displayName || user?.email)
    showToast('Backup downloaded.')
  }

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const items = await parseBackupFile(file)
      const existingIds = new Set(reminders.map((r) => r.id))
      let added = 0
      for (const item of items) {
        if (item.id && existingIds.has(item.id)) continue
        const { id: _id, userId: _uid, createdAt: _ca, updatedAt: _ua, ...rest } = item
        await addReminder(user.uid, rest)
        added++
      }
      showToast(
        added === 0
          ? 'All reminders already exist — nothing added.'
          : `Restored ${added} reminder${added !== 1 ? 's' : ''}.`
      )
    } catch (err) {
      showToast(err.message || 'Could not read that backup file.', 'error')
    }
    if (importInputRef.current) importInputRef.current.value = ''
  }

  // Follow the live Firestore version of whichever reminder is open in the detail panel.
  const liveSelected = selectedReminder
    ? reminders.find((r) => r.id === selectedReminder.id) ?? selectedReminder
    : null

  return (
    <div className="flex flex-col" style={{ height: '100dvh', overflow: 'hidden' }}>
      <Header
        onMenuToggle={() => setSidebarOpen((s) => !s)}
        menuOpen={sidebarOpen}
        onExport={handleExport}
        onImport={handleImport}
        importRef={importInputRef}
      />

      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`
            absolute lg:relative inset-y-0 left-0 z-30 w-64 bg-white
            border-r border-gray-100 flex flex-col
            transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
            lg:translate-x-0 lg:shadow-none
          `}
        >
          <Sidebar
            filters={filters}
            onChange={(f) => { setFilters(f); setSidebarOpen(false) }}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        <div className="flex flex-1 overflow-hidden min-w-0">
          <div
            className={`
              flex-1 flex flex-col min-w-0 overflow-y-auto
              ${mobileView === 'detail' ? 'hidden lg:flex' : 'flex'}
            `}
          >
            <div className="px-4 py-4 flex-1">
              <NotificationManager reminders={reminders} />

              {!isFiltered && (
                <DashboardSummary reminders={reminders} onCardClick={handleCardClick} />
              )}

              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">
                  {isFiltered ? 'Search results' : 'Reminders'}
                  {filtered.length > 0 && (
                    <span className="ml-2 font-normal text-gray-400">
                      {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </h2>
              </div>

              {loading && (
                <div className="space-y-2.5">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-[76px] bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="text-5xl mb-4">📋</span>
                  {isFiltered ? (
                    <>
                      <p className="text-gray-600 font-medium text-sm">Nothing matches your filters.</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
                      <button
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="mt-4 text-sm text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Clear filters
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 font-medium text-sm">Nothing here yet.</p>
                      <p className="text-gray-400 text-sm mt-1 max-w-xs">
                        Tap the + button to add your first reminder.
                      </p>
                      <button
                        onClick={handleAddNew}
                        className="mt-4 text-sm text-blue-500 hover:text-blue-600 font-medium"
                      >
                        + Add your first reminder
                      </button>
                    </>
                  )}
                </div>
              )}

              {!loading && filtered.length > 0 && (
                <div className="space-y-2.5 pb-24">
                  {filtered.map((r) => (
                    <ReminderCard
                      key={r.id}
                      reminder={r}
                      onClick={handleCardClick}
                      onDelete={handleDeleteRequest}
                      isSelected={selectedReminder?.id === r.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            className={`
              lg:w-[390px] xl:w-[430px] shrink-0
              border-l border-gray-100 overflow-y-auto
              ${mobileView === 'detail' ? 'flex flex-col flex-1 lg:flex-none' : 'hidden lg:flex lg:flex-col'}
            `}
          >
            {mobileView === 'detail' && (
              <div className="lg:hidden px-4 pt-4">
                <button
                  onClick={() => { setMobileView('list'); setSelectedReminder(null) }}
                  className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 mb-3"
                >
                  ← Back to list
                </button>
              </div>
            )}

            <div className="px-4 py-4 flex-1">
              {liveSelected ? (
                <ReminderDetail
                  reminder={liveSelected}
                  onClose={() => { setSelectedReminder(null); setMobileView('list') }}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center h-full text-center py-20">
                  <span className="text-4xl mb-3">👆</span>
                  <p className="text-sm text-gray-400">
                    Pick a reminder from the list to see its details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleAddNew}
        aria-label="Add reminder"
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Toast — supports an optional Undo action */}
      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium z-50 whitespace-nowrap ${
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'
          }`}
        >
          <span>{toast.msg}</span>
          {toast.undo && (
            <button
              onClick={handleUndoDelete}
              className="text-blue-300 hover:text-white font-semibold transition-colors"
            >
              Undo
            </button>
          )}
        </div>
      )}

      <ReminderForm
        isOpen={formOpen}
        onClose={handleFormClose}
        editReminder={editReminder}
      />
    </div>
  )
}
