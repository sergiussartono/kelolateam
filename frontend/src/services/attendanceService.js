import api from '../api/axios'

const attendanceService = {
  getAll: (params) => api.get('/attendances', { params }),  // ?date=2026-05-17
  create: (data)   => api.post('/attendances', data),
  update: (id, data) => api.put(`/attendances/${id}`, data),
  remove: (id)     => api.delete(`/attendances/${id}`),
}

export default attendanceService