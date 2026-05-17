import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const [tab, setTab] = useState('masuk') // 'masuk' | 'daftar'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)

  const handleLogin = async () => {
    if (!email || !password) { setError('Email dan password wajib diisi'); return }
    setLoading(true)
    setError('')

    // Simulasi delay seperti API call
    await new Promise(r => setTimeout(r, 600))

    const success = login(email, password)
    if (success) {
      navigate('/dashboard')
    } else {
      setError('Email atau password salah')
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-black rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-md" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">KelolaTeam</h1>
          <p className="text-sm text-gray-500 mt-1">Platform tim & kelas generasi berikutnya</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          {/* Tab */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
            <button
              onClick={() => setTab('masuk')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'masuk' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
            >
              Masuk
            </button>
            <button
              onClick={() => setTab('daftar')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'daftar' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
            >
              Daftar
            </button>
          </div>

          {tab === 'masuk' ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs text-gray-500 font-medium">Password</label>
                  <span className="text-xs text-gray-400 cursor-pointer hover:text-black transition-colors">Lupa password?</span>
                </div>
                <input
                  type="password"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-all"
              >
                {loading ? 'Masuk...' : 'Masuk'}
              </button>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">atau</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button className="w-full border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors text-gray-700">
                Lanjut dengan Google
              </button>

              {/* Hint akun demo */}
              <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-400 font-medium mb-1">Akun Demo:</p>
                <p className="text-xs text-gray-500">Email: <span className="font-medium text-gray-700">admin@kelolateam.com</span></p>
                <p className="text-xs text-gray-500">Password: <span className="font-medium text-gray-700">password</span></p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Nama Lengkap</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-all" placeholder="Nama kamu" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Email</label>
                <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-all" placeholder="nama@email.com" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Password</label>
                <input type="password" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-all" placeholder="••••••••" />
              </div>
              <button className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 transition-all">
                Daftar Sekarang
              </button>
            </div>
          )}
        </div>

        {/* Info notif */}
        <div className="mt-3 bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
          <span className="text-xs text-gray-500">2 notifikasi absen & tugas menunggu</span>
        </div>
      </div>
    </div>
  )
}