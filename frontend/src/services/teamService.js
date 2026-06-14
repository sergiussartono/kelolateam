import api from '../api/axios'

const teamService = {
  getAll: ()                        => api.get('/teams'),
  getOne: (id)                      => api.get(`/teams/${id}`),
  create: (data)                    => api.post('/teams', data),
  update: (id, data)                => api.put(`/teams/${id}`, data),
  remove: (id)                      => api.delete(`/teams/${id}`),
  addMember: (teamId, userId, role) => api.post(`/teams/${teamId}/members`, { user_id: userId, role }),
  removeMember: (teamId, userId)    => api.delete(`/teams/${teamId}/members/${userId}`),
}

export default teamService