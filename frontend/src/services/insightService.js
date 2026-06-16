import api from '../api/axios'

const insightService = {
  // Mengambil insight untuk user/semua tim
  getUserInsights: () => api.get('/insights/user'),

  // Mengambil insight spesifik per tim
  getTeamInsights: (teamId) => api.get(`/insights/team/${teamId}`),

  // Jika nanti kamu butuh menyimpan/mengirim pesan chat ke BE
  store: (data) => api.post('/insights', data)
}

export default insightService