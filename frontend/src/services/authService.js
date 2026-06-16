import api from '../api/axios'

/**
 * Auth Service — wraps all /auth endpoints
 * Swap dummy logic here when BE is ready
 */
const authService = {
  login: (email, password) =>
    api.post('/login', { email, password }),

  register: async (name, email, password, password_confirmation) => {
        // Asumsi kamu menggunakan axios instance yang sudah diset base URL-nya
        return await api.post('/register', { 
            name, email, password, password_confirmation 
        });
    },

  logout: () =>
    api.post('/logout'),

  me: () =>
    api.get('/me'),
}

export default authService