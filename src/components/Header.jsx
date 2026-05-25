import { useState } from 'react'
import { Calendar, LogOut, Menu, X, Download, Upload } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Header({ onMenuToggle, menuOpen, onExport, onImport, importRef }) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const displayName =
    user?.displayName || user?.email?.split('@')[0] || 'there'
  const initials = displayName.slice(0, 2).toUpperCase()

  async function handleLogout() {
    setShowUserMenu(false)
    await logout()
  }

  return (
    <header className="bg-white border-b border-gray-100 z-30 shrink-0">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800 text-[15px] tracking-tight">
              MeetMinder
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onExport}
            title="Download backup JSON"
            className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Backup
          </button>

          <label
            title="Restore from backup JSON"
            className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Restore
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={onImport}
            />
          </label>

          <div className="relative ml-1">
            <button
              onClick={() => setShowUserMenu((s) => !s)}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-blue-600">{initials}</span>
              </div>
              <span className="hidden sm:block text-sm text-gray-700 max-w-[120px] truncate">
                {displayName}
              </span>
            </button>

            {showUserMenu && (
              <>
                {/* Closes the menu when the user clicks anywhere outside it */}
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />

                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-52 z-20">
                  <p className="px-4 pb-2 pt-1 text-xs text-gray-400 border-b border-gray-100 truncate">
                    {user?.email}
                  </p>

                  <button
                    onClick={() => { onExport(); setShowUserMenu(false) }}
                    className="sm:hidden w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Backup reminders
                  </button>

                  <label className="sm:hidden w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Restore backup
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => { onImport(e); setShowUserMenu(false) }}
                    />
                  </label>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
