import { useState } from 'react'
import { Bell } from 'lucide-react'
import { dummyNotifications, dummyUser } from '../data/dummy'

export default function Topbar() {
  const [showNotif, setShowNotif] = useState(false)
  const unread = dummyNotifications.filter(n => !n.read).length

  return (
    <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-end px-6 gap-3 flex-shrink-0">
      {/* Notifikasi */}
      <div className="relative">
        <button
          onClick={() => setShowNotif(!showNotif)}
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

        {/* Dropdown Notifikasi */}
        {showNotif && (
          <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium">Notifikasi</p>
            </div>
            {dummyNotifications.map(n => (
              <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                <p className="text-sm text-gray-700">{n.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-medium">
        {dummyUser.avatar}
      </div>
    </div>
  )
}