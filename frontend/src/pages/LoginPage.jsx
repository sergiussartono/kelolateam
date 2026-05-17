import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Sementara pakai dummy login, nanti diganti API
  const handleLogin = () => {
    if (email === 'admin@kelolateam.com' && password === 'password') {
      localStorage.setItem('token', 'dummy-token')
      navigate('/dashboard')
    } else {
      setError('Email atau password salah')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-[380px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl mx-auto mb-3" />
          <h1 className="text-xl font-medium">KelolaTeam</h1>
          <p className="text-sm text-gray-500 mt-1">Platform tim generasi berikutnya</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
            <button className="flex-1 bg-white rounded-lg py-1.5 text-sm font-medium shadow-sm">Masuk</button>
            <button className="flex-1 text-sm text-gray-400">Daftar</button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-500">Password</label>
                <span className="text-xs text-gray-400 cursor-pointer">Lupa password?</span>
              </div>
              <input
                type="password"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              onClick={handleLogin}
              className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800"
            >
              Masuk
            </button>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">atau</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button className="w-full border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">
              Lanjut dengan Google
            </button>
          </div>
        </div>

        {/* Info notif */}
        <div className="mt-3 bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
          <span className="text-xs text-gray-500">2 notifikasi absen & tugas menunggu</span>
        </div>

      </div>
    </div>
  )
}