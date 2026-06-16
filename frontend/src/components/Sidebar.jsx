import { useState } from 'react' // Tambahkan useState
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, CheckSquare,
  ClipboardList, BarChart2, Sparkles, LogOut,
  Menu, X // Tambahkan icon Menu dan X untuk toggle
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
  
  // State untuk kontrol buka/tutup sidebar di mobile
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavigation = (path) => {
    navigate(path)
    setIsOpen(false) // Otomatis tutup sidebar setelah pilih menu di mobile
  }

  return (
    <>
      {/* --- TOMBOL HAMBURGER (Hanya muncul di HP/Mobile) --- */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-600 focus:outline-none"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* --- BACKDROP LALU LINTAS (Otomatis tutup jika area luar diklik di mobile) --- */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- SIDEBAR CONTAINER --- */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-52 bg-green-200 border-r border-gray-100 flex flex-col py-5 px-3 transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none md:flex-shrink-0 min-h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo */}
        <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center">
            <img 
              src="/favicon.svg" 
              alt="Logo" 
              className="w-full h-full object-contain" 
            />
        </div>

        {/* Menu */}
        <p className="text-[10px] font-medium text-black uppercase tracking-wider px-3 mb-2">Menu</p>
        <div className="flex flex-col gap-0.5">
          {menuItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-all
                  ${isActive
                    ? 'bg-gray-100 text-black font-medium'
                    : 'text-black hover:bg-gray-50 hover:text-gray-800'
                  }`}
              >
                <Icon size={15} className="text-black" />
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
    </>
  )
}