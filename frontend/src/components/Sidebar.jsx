import { useNavigate } from 'react-router-dom'

const menuItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Tim Saya', path: '/tim' },
  { label: 'Tugas', path: '/tugas' },
  { label: 'Absensi', path: '/absensi' },
  { label: 'Laporan', path: '/laporan' },
  { label: 'AI Insight', path: '/ai' },
]

export default function Sidebar({ active }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="w-52 min-h-screen bg-white border-r border-gray-100 flex flex-col py-5 px-3">
      <div className="flex items-center gap-2 px-3 mb-6">
        <div className="w-7 h-7 bg-black rounded-lg" />
        <span className="font-medium text-sm">KelolaTeam</span>
      </div>

      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>
      <div className="flex flex-col gap-0.5">
        {menuItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-colors
              ${active === item.label
                ? 'bg-gray-100 text-black font-medium'
                : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            <div className={`w-4 h-4 rounded ${active === item.label ? 'bg-black' : 'bg-gray-200'}`} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-auto px-3">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Akun</p>
        <button
          onClick={handleLogout}
          className="w-full text-sm text-gray-400 hover:text-red-500 text-left py-2"
        >
          Keluar
        </button>
      </div>
    </div>
  )
}