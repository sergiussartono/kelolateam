import api from '../api/axios'

const taskService = {
  getAll: (params) => api.get('/tasks', { params }),   // ?status=todo&team_id=1
  getOne: (id)     => api.get(`/tasks/${id}`),
  create: (data)   => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  remove: (id)     => api.delete(`/tasks/${id}`),

  // Shorthand untuk update status saja (approve / revisi)
  updateStatus: (id, status) => api.put(`/tasks/${id}`, { status }),
}

export default taskService