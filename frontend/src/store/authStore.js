import { create } from 'zustand'
import axiosInstance from '../api/axios'

/**
 * Token & Axios header helpers
 * Single Responsibility: isolasi side-effects dari store logic
 */
const TokenStorage = {
  get:    ()      => localStorage.getItem('token'),
  set:    (token) => localStorage.setItem('token', token),
  remove: ()      => localStorage.removeItem('token'),
}

const AxiosAuth = {
  set:    (token) => { axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}` },
  remove: ()      => { delete axiosInstance.defaults.headers.common['Authorization'] },
}

/**
 * useAuthStore — Global auth state (Zustand)
 *
 * State:
 *   user            — data user dari /me
 *   isAuthenticated — true jika token valid ada di localStorage
 *
 * Actions:
 *   login(email, password) — POST /login, simpan token
 *   logout()               — POST /logout (best-effort), clear semua state
 *   fetchMe()              — GET /me, restore session saat app load
 */
const useAuthStore = create((set, get) => ({
  user:            null,
  isAuthenticated: !!TokenStorage.get(),

  login: async (email, password) => {
    // Throws on failure — biarkan caller (LoginPage) handle error
    const { data } = await axiosInstance.post('/login', { email, password })
    const { token, user } = data

    TokenStorage.set(token)
    AxiosAuth.set(token)
    set({ user, isAuthenticated: true })

    return true
  },

  /**
   * logout — always succeeds locally
   * POST /logout dikirim best-effort: jika BE error (misal token sudah expired),
   * local state tetap dibersihkan via `finally`
   */
  logout: async () => {
    try {
      await axiosInstance.post('/logout')
    } catch (_) {
      // Intentionally swallowed — local cleanup tetap jalan
    } finally {
      TokenStorage.remove()
      AxiosAuth.remove()
      set({ user: null, isAuthenticated: false })
    }
  },

  /**
   * fetchMe — restore session saat app di-refresh
   * Dipanggil di App.jsx sekali saat mount jika token ada
   */
  fetchMe: async () => {
    const token = TokenStorage.get()
    if (!token) return

    try {
      AxiosAuth.set(token) // pastikan header terisi sebelum request
      const { data } = await axiosInstance.get('/me')
      set({ user: data, isAuthenticated: true })
    } catch (_) {
      // Token invalid/expired — force logout lokal
      TokenStorage.remove()
      AxiosAuth.remove()
      set({ user: null, isAuthenticated: false })
    }
  },

  getUser: () => get().user,
}))

export default useAuthStore