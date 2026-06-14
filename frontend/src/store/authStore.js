import { create } from 'zustand'
import axiosInstance from '../api/axios'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email, password) => {
    const response = await axiosInstance.post('/login', { email, password })
    const { token, user } = response.data

    // Persist token
    localStorage.setItem('token', token)
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`

    set({ user, isAuthenticated: true })
    return true
  },

  logout: () => {
    localStorage.removeItem('token')
    delete axiosInstance.defaults.headers.common['Authorization']
    set({ user: null, isAuthenticated: false })
  },

  fetchMe: async () => {
    try {
      const response = await axiosInstance.get('/me')
      set({ user: response.data, isAuthenticated: true })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false })
    }
  },
}))

export default useAuthStore 