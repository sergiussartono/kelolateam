import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import useAuthStore from '../store/authStore'
import notificationService from '../services/notificationService'

/**
 * Topbar — Global header component
 * Responsibilities:
 *   - Tampilkan notifikasi real-time dari BE
 *   - Tampilkan avatar + nama user yang sedang login
 *   - Close dropdown saat klik di luar (accessibility)
 */

/** Ambil 2 huruf pertama dari nama untuk avatar */
const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

export default function Topbar() {
  const { user, fetchMe }           = useAuthStore()
  const [notifications, setNotifs]  = useState([])
  const [showNotif, setShowNotif]   = useState(false)
  const dropdownRef                 = useRef(null)

  // Fetch user & notifikasi saat mount
  useEffect(() => {
  const token = localStorage.getItem('token');
  
  // Hanya jalankan fetch jika user memiliki token di storagenya
  if (token) {
    if (!user) fetchMe()
    fetchNotifications()
  }
}, [])

  // Close dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll()
      setNotifs(res.data ?? [])
    } catch (_) {
      // Silent fail — notifikasi bukan fitur kritikal
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setNotifs(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      )
    } catch (_) {}
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifs(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
    } catch (_) {}
  }

  const unread = notifications.filter(n => !n.read_at).length

  return (
    <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-end px-6 gap-3 flex-shrink-0">

      {/* Notifikasi */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowNotif(prev => !prev)}
          className="relative flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Bell size={14} />
          Notifikasi
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
              {unread}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showNotif && (
          <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
            {/* Header dropdown */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium">Notifikasi</p>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-gray-400 hover:text-black transition-colors"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-gray-400">
                  Tidak ada notifikasi
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.read_at && handleMarkRead(n.id)}
                    className={`px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors
                      ${!n.read_at ? 'bg-blue-50/50' : ''}`}
                  >
                    {/* Notif data bisa berupa JSON string — parse jika perlu */}
                    <p className="text-sm text-gray-700">
                      {typeof n.data === 'string'
                        ? (() => { try { return JSON.parse(n.data).message ?? n.data } catch { return n.data } })()
                        : n.data?.message ?? n.type
                      }
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Avatar user */}
      <div
        className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-semibold cursor-default"
        title={user?.name ?? ''}
      >
        {getInitials(user?.name)}
      </div>
    </div>
  )
}