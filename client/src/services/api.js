import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('medlocate_token');
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/pharmacy')) {
        token = localStorage.getItem('medlocate_pharmacy_token') || 'demo-pharmacy-token';
      } else if (window.location.pathname.startsWith('/admin')) {
        token = localStorage.getItem('medlocate_token') || localStorage.getItem('medlocate_admin_token') || 'demo-admin-token';
      } else {
        token = localStorage.getItem('medlocate_patient_token') || localStorage.getItem('medlocate_token') || 'demo-patient-token';
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const code = error.response.data?.code;
      if (code === 'TOKEN_EXPIRED') {
        localStorage.removeItem('medlocate_token');
        localStorage.removeItem('medlocate_user');
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Medicine endpoints
export const medicineService = {
  search: (params) => api.get('/medicines/search', { params }),
  getAll: (params) => api.get('/medicines', { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines', data)
};

// Inventory endpoints
export const inventoryService = {
  getAll: (params) => api.get('/inventory', { params }),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  syncPOS: (batch) => api.post('/inventory/sync', { batch })
};

// Reservation endpoints
export const reservationService = {
  create: (data) => api.post('/reservations', data),
  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  updateStatus: (id, status) => api.patch(`/reservations/${id}`, { status })
};

// Pharmacy endpoints
export const pharmacyService = {
  getAll: (params) => api.get('/pharmacies', { params }),
  getNearby: (params) => api.get('/pharmacies/nearby', { params }),
  getById: (id) => api.get(`/pharmacies/${id}`),
  updateVerification: (id, verified) => api.patch(`/pharmacies/${id}/verification`, { verified }),
  updateProfile: (id, data) => api.put(`/pharmacies/${id}`, data)
};

// Notification endpoints
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all')
};

// Admin endpoints
export const adminService = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getPharmacies: (params) => api.get('/admin/pharmacies', { params }),
  getReports: () => api.get('/admin/reports')
};

export default api;
