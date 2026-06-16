import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const [tab, setTab] = useState('masuk')
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, register } = useAuthStore()

  const handleLogin = async () => {
    if (!form.email || !form.password) { 
      setError('Email dan password wajib diisi')
      return 
    }
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      toast.success('Login berhasil!')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Nama, email, dan password wajib diisi')
      return
    }
    if (form.password !== form.password_confirmation) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    setLoading(true)
    setError('')
    try {
      // Menyesuaikan payload dengan validasi AuthController di Laravel
      await register(form.name, form.email, form.password, form.password_confirmation)
      toast.success('Registrasi berhasil! Silakan masuk.')
      setTab('masuk')
      setForm({ name: '', email: '', password: '', password_confirmation: '' })
    } catch (err) {
      // Tambahkan console log ini untuk melihat detail error di Inspect Element > Console
      console.log("Detail Error:", err.response?.data?.errors); 
      
      // Jika err.response.data.errors ada, ambil pesan pertama
      const serverErrors = err.response?.data?.errors;
      const errorMsg = serverErrors 
        ? Object.values(serverErrors)[0][0] 
        : (err.response?.data?.message || 'Registrasi gagal, periksa data kembali');
        
      setError(errorMsg);
    } finally {
      setLoading(false)
    }
    
    
  }

  const handleKeyDown = (e) => { 
    if (e.key === 'Enter') {
      tab === 'masuk' ? handleLogin() : handleRegister()
    } 
  }
  
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-black rounded-2xl mx-auto mb-3 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-md" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">KelolaTeam</h1>
          <p className="text-xs text-gray-400 mt-1">Platform manajemen tim & tugas internal</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          
          {/* Tab Switcher */}
          <div className="flex bg-gray-50 p-1 rounded-xl mb-5">
            <button 
              onClick={() => { setTab('masuk'); setError('') }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all
                ${tab === 'masuk' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
            >
              Masuk
            </button>
            <button 
              onClick={() => { setTab('daftar'); setError('') }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all
                ${tab === 'daftar' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
            >
              Daftar
            </button>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-3.5">
            {tab === 'daftar' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Nama Lengkap</label>
                <input type="text"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-all"
                  placeholder="John Doe"
                  value={form.name} onChange={set('name')} onKeyDown={handleKeyDown} />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Email</label>
              <input type="email"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-all"
                placeholder="nama@email.com"
                value={form.email} onChange={set('email')} />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-500 font-medium">Password</label>
                <p className="text-[10px] text-gray-400 mt-1">Minimal 8 karakter</p>
                {tab === 'masuk' && (
                  <span className="text-[11px] text-gray-400 cursor-pointer hover:text-black">Lupa password?</span>
                )}
              </div>
              <input type="password"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-all"
                placeholder="••••••••"
                value={form.password} onChange={set('password')} onKeyDown={handleKeyDown} />
            </div>

            {tab === 'daftar' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Konfirmasi Password</label>
                <input type="password"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-all"
                  placeholder="••••••••"
                  value={form.password_confirmation} onChange={set('password_confirmation')} onKeyDown={handleKeyDown} />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {tab === 'masuk' ? (
              <button onClick={handleLogin} disabled={loading}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-all mt-1">
                {loading ? 'Masuk...' : 'Masuk'}
              </button>
            ) : (
              <button onClick={handleRegister} disabled={loading}
                className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-all mt-1">
                {loading ? 'Mendaftar...' : 'Buat Akun'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}