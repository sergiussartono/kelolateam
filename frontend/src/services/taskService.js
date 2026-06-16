import api from '../api/axios'

const taskService = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id)     => api.get(`/tasks/${id}`),
  create: (data)   => api.post('/tasks', data),
  
  update: (id, data) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/tasks/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/tasks/${id}`, data);
  },
  
  remove: (id) => api.delete(`/tasks/${id}`),
  updateStatus: (id, status) => api.put(`/tasks/${id}`, { status }),

  getFileUrl: (id) => {
    const baseURL = api.defaults.baseURL || 'http://localhost:8000/api';
    return `${baseURL}/tasks/${id}/view-file`;
  }
}

export default taskService