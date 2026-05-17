import { create } from 'zustand'
import { dummyUser } from '../data/dummy'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,

  // Login dengan dummy — ganti dengan API saat BE siap
  login: (email, password) => {
    if (email === 'admin@kelolateam.com' && password === 'password') {
      const token = 'dummy-token-kelolateam'
      localStorage.setItem('token', token)
      set({ token, user: dummyUser })
      return true
    }
    return false
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  },

  setUser: (user) => set({ user }),
}))

export default useAuthStore