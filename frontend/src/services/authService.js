import api from '../api/axios'

/**
 * Auth Service — wraps all /auth endpoints
 * Swap dummy logic here when BE is ready
 */
const authService = {
  login: (email, password) =>
    api.post('/login', { email, password }),

  register: (name, email, password) =>
    api.post('/register', { name, email, password }),

  logout: () =>
    api.post('/logout'),

  me: () =>
    api.get('/me'),
}

export default authService