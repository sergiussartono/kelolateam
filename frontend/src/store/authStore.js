import { create } from 'zustand'
import authService from '../services/authService'
import api from '../api/axios'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await authService.login(email, password)
    const token = response.data.token
    const user = response.data.user

    localStorage.setItem('token', token) // Cukup simpan di sini, interceptor yang akan ambil
    
    set({ user, isAuthenticated: true })
    return response
  },

  logout: async () => {
    try {
      await authService.logout()
    } catch (e) {
      // Abaikan jika token sudah hangus
    } finally {
      localStorage.removeItem('token') // Bersihkan localStorage
      set({ user: null, isAuthenticated: false })
    }
  },

  fetchMe: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await authService.me()
      set({ user: response.data, isAuthenticated: true })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false })
    }
  },

  getUser: () => get().user,
}))

export default useAuthStore