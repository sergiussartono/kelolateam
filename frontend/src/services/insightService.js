import api from '../api/axios'

const notificationService = {
  getAll: ()    => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  remove: (id)  => api.delete(`/notifications/${id}`),
}

export default notificationService