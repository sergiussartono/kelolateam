import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, CheckSquare,
  ClipboardList, BarChart2, Sparkles, LogOut
} from 'lucide-react'
import useAuthStore from '../store/authStore'

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Kelola Tim', path: '/tim', icon: Users },
  { label: 'Tugas', path: '/tugas', icon: CheckSquare },
  { label: 'Absensi', path: '/absensi', icon: ClipboardList },
  { label: 'Laporan', path: '/laporan', icon: BarChart2 },
  { label: 'AI Insight', path: '/ai', icon: Sparkles },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore(s => s.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="w-52 min-h-screen bg-white border-r border-gray-100 flex flex-col py-5 px-3 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mb-6">
        <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-white rounded-sm" />
        </div>
        <span className="font-semibold text-sm tracking-tight">KelolaTeam</span>
      </div>

      {/* Menu */}
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>
      <div className="flex flex-col gap-0.5">
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-all
                ${isActive
                  ? 'bg-gray-100 text-black font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
            >
              <Icon size={15} className={isActive ? 'text-black' : 'text-gray-400'} />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Logout */}
      <div className="mt-auto px-3">
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full text-sm text-gray-400 hover:text-red-500 py-2 transition-colors"
          >
            <LogOut size={15} />
            Keluar
          </button>
        </div>
      </div>
    </div>
  )
}