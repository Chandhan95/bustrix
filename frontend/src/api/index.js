import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:2020/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not intercept 401s for login/register requests
    const originalRequest = error.config
    const isAuthRequest = originalRequest?.url?.includes('/auth/')
    
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth APIs ──────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (email, otp) => api.post('/auth/verify-email', { email, otp }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

// ── Bus/Search APIs ────────────────────────────────────────
export const busApi = {
  search: (data) => api.post('/buses/search', data),
  getSeats: (busId) => api.get(`/buses/${busId}/seats`),
  getScheduleSeats: (scheduleId) => api.get(`/schedules/${scheduleId}/seats`),
  getCities: () => api.get('/routes/cities'),
}

// ── Booking APIs ───────────────────────────────────────────
export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (page = 0, size = 10) => api.get(`/bookings/my?page=${page}&size=${size}`),
  getByPnr: (pnr) => api.get(`/bookings/pnr/${pnr}`),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
  lockSeats: (data) => api.post('/bookings/seats/lock', data),
  unlockSeats: (data) => api.post('/bookings/seats/unlock', data),
}

// ── Admin APIs ─────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Users
  getUsers: (page = 0, size = 20, query = '') =>
    api.get(`/admin/users?page=${page}&size=${size}&query=${query}`),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  // Buses
  getBuses: (page = 0, size = 20) => api.get(`/admin/buses?page=${page}&size=${size}`),
  createBus: (data) => api.post('/admin/buses', data),
  updateBus: (id, data) => api.put(`/admin/buses/${id}`, data),
  deleteBus: (id) => api.delete(`/admin/buses/${id}`),
  // Routes
  getRoutes: () => api.get('/admin/routes'),
  createRoute: (data) => api.post('/admin/routes', data),
  updateRoute: (id, data) => api.put(`/admin/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/admin/routes/${id}`),
  // Schedules
  getSchedules: (page = 0, size = 20) => api.get(`/admin/schedules?page=${page}&size=${size}`),
  createSchedule: (data) => api.post('/admin/schedules', data),
}
