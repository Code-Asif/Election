import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    // Don't show toast for network errors or if error is already handled
    if (error.code === 'ERR_NETWORK' || error.config?.skipErrorToast) {
      return Promise.reject(error)
    }
    
    let message = 'An error occurred'
    
    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          message = 'Invalid request. Please check your input.'
          break
        case 403:
          message = 'You do not have permission to perform this action.'
          break
        case 404:
          message = 'The requested resource was not found.'
          break
        case 500:
          message = 'Server error. Please try again later.'
          break
        default:
          message = `Request failed with status ${error.response.status}`
      }
    } else if (error.message) {
      message = error.message
    }
    
    toast.error(message)
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
}

// Elections API
export const electionsApi = {
  getAll: (params?: { public?: boolean }) => {
    if (params?.public) {
      return api.get('/elections/public');
    }
    return api.get('/elections', { params });
  },
  getById: (id: string) => api.get(`/elections/${id}`),
  getBySlug: (slug: string) => api.get(`/elections/slug/${slug}`),
  getStats: (id: string) => api.get(`/elections/${id}/stats`),
  create: (data: any) => api.post('/elections', data),
  update: (id: string, data: any) => api.patch(`/elections/${id}`, data),
  delete: (id: string) => api.delete(`/elections/${id}`),
  start: (id: string) => api.post(`/elections/${id}/start`),
  close: (id: string) => api.post(`/elections/${id}/close`),
}

// Candidates API
export const candidatesApi = {
  getByElection: (electionId: string) =>
    api.get(`/candidates/election/${electionId}`),
  getStats: (electionId: string) =>
    api.get(`/candidates/election/${electionId}/stats`),
  create: (data: any) => api.post('/candidates', data),
  update: (id: string, data: any) => api.patch(`/candidates/${id}`, data),
  delete: (id: string) => api.delete(`/candidates/${id}`),
}

// Votes API
export const votesApi = {
  cast: (data: { electionId: string; candidateId: string }) =>
    api.post('/votes/cast', data),
  getResults: (electionId: string) => api.get(`/votes/results/${electionId}`),
  checkStatus: (electionId: string) => api.get(`/votes/check/${electionId}`),
}

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  delete: (id: string) => api.delete(`/users/${id}`),
}
