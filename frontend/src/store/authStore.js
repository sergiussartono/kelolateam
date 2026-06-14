import axiosInstance from '../api/axios';
import { create } from 'zustand'
const useAuthStore = create((set) => ({ 
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      // Tembak API login asli ke Laravel
      const response = await axiosInstance.post('/api/login', { email, password });
      
      if (response.data.token) {
        // Jika menggunakan Bearer Token, simpan ke localStorage atau header axios
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }

      set({ user: response.data.user, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Auth Store Error:', error);
      throw error; // Lempar kembali ke LoginPage agar ditangkap blok catch(err)
    }
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  }
}))
export default useAuthStore;
