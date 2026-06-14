import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const [tab, setTab] = useState('masuk')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const navigate = useNavigate()
  const { login, loading, error } = useAuthStore()

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleLogin = async () => {
    if (!form.email || !form.password) { toast.error('Email dan password wajib diisi'); return }
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success('Berhasil masuk!')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin() }

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
            {['masuk', 'daftar'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize
                  ${tab === t ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>
                {t === 'masuk' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          {tab === 'masuk' ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Email</label>
                <input type="email"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-all"
                  placeholder="nama@email.com"
                  value={form.email} onChange={set('email')} onKeyDown={handleKeyDown} />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs text-gray-500 font-medium">Password</label>
                  <span className="text-xs text-gray-400 cursor-pointer hover:text-black">Lupa password?</span>
                </div>
                <input type="password"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black transition-all"
                  placeholder="••••••••"
                  value={form.password} onChange={set('password')} onKeyDown={handleKeyDown} />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <button onClick={handleLogin} disabled={loading}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-all">
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
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Nama Lengkap</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                  placeholder="Nama kamu" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Email</label>
                <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                  placeholder="nama@email.com" value={form.email} onChange={set('email')} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Password</label>
                <input type="password" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                  placeholder="••••••••" value={form.password} onChange={set('password')} />
              </div>
              <button className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 transition-all">
                Daftar Sekarang
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}