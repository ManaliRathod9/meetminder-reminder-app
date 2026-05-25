import { Search, X } from 'lucide-react'
import { CATEGORIES, PRIORITIES, STATUSES } from '../utils/constants'

const QUICK_FILTERS = ['All', 'Today', 'Tomorrow', 'This Week', 'This Month']

export default function Sidebar({ filters, onChange, onClose }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value })
  }

  function clearAll() {
    onChange({ search: '', quickFilter: 'All', category: '', priority: '', status: '' })
  }

  const hasActive =
    filters.search ||
    filters.quickFilter !== 'All' ||
    filters.category ||
    filters.priority ||
    filters.status

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Filters</span>
        <div className="flex items-center gap-2">
          {hasActive && (
            <button
              onClick={clearAll}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable filter area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Search */}
        <FilterSection label="Search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => set('search', e.target.value)}
              placeholder="Title, notes, location…"
              className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent placeholder-gray-400"
            />
            {filters.search && (
              <button
                onClick={() => set('search', '')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </FilterSection>

        {/* Quick date filters */}
        <FilterSection label="When">
          <div className="space-y-0.5">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => set('quickFilter', f)}
                className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                  filters.quickFilter === f
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Category */}
        <FilterSection label="Category">
          <div className="space-y-0.5">
            <button
              onClick={() => set('category', '')}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                !filters.category ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              All categories
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => set('category', c)}
                className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                  filters.category === c
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Priority */}
        <FilterSection label="Priority">
          <div className="flex flex-wrap gap-1.5">
            {['', ...PRIORITIES].map((p) => (
              <button
                key={p || '_all'}
                onClick={() => set('priority', p)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  filters.priority === p
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p || 'Any'}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Status */}
        <FilterSection label="Status">
          <div className="flex flex-wrap gap-1.5">
            {['', ...STATUSES].map((s) => (
              <button
                key={s || '_all'}
                onClick={() => set('status', s)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  filters.status === s
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s || 'Any'}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  )
}

function FilterSection({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
        {label}
      </p>
      {children}
    </div>
  )
}
