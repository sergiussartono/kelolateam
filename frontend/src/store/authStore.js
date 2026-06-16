import { create } from 'zustand'
import authService from '../services/authService'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  authLoading: true,

  login: async (email, password) => {
    const response = await authService.login(email, password)
    const token = response.data.token
    const user = response.data.user
    localStorage.setItem('token', token)
    set({ user, isAuthenticated: true })
    return response
  },

  logout: async () => {
    try {
      await authService.logout()
    } catch (e) {}
    finally {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false })
    }
  },

  fetchMe: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ authLoading: false })
      return
    }
    try {
      const response = await authService.me()
      set({ user: response.data, isAuthenticated: true, authLoading: false })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, authLoading: false })
    }
  },

  getUser: () => get().user,
}))

export default useAuthStore