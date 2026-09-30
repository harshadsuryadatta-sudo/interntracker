import { mockApi } from './mockApi';

export function getApiBaseUrl() {
  const custom = typeof window !== 'undefined' ? localStorage.getItem('custom_api_url') : null;
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  return import.meta.env.VITE_API_URL || '/api';
}

export function isDemoModeActive() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('demo_mode') === 'true';
}

export function setDemoMode(enabled) {
  if (typeof window !== 'undefined') {
    if (enabled) {
      localStorage.setItem('demo_mode', 'true');
    } else {
      localStorage.removeItem('demo_mode');
    }
    window.dispatchEvent(new Event('demo_mode_changed'));
  }
}

export function setCustomBackendUrl(url) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('custom_api_url', url.trim());
      localStorage.removeItem('demo_mode');
    } else {
      localStorage.removeItem('custom_api_url');
    }
    window.dispatchEvent(new Event('backend_url_changed'));
  }
}

/**
 * Universal API client supporting credentials and Bearer token
 */
async function request(endpoint, options = {}) {
  // If demo mode is explicitly enabled, use in-browser mock
  if (isDemoModeActive()) {
    return handleMockRequest(endpoint, options);
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = localStorage.getItem('auth_token');

  const headers = {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    // If downloading a file (e.g. CSV or Excel)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/csv') || contentType.includes('spreadsheetml')) {
      if (!response.ok) {
        throw new Error('Failed to download file.');
      }
      return response.blob();
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMsg = data.message || `Request failed with status ${response.status}`;
      
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      
      if (response.status === 404) {
        err.is404 = true;
        err.isBackendUnavailable = true;
      }
      throw err;
    }

    return data;
  } catch (error) {
    if (error.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/me')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.dispatchEvent(new Event('auth_logout'));
    }

    // Detect offline / 404 on static deployment
    if (error.status === 404 || error.name === 'TypeError') {
      error.isBackendUnavailable = true;
    }

    throw error;
  }
}

function handleMockRequest(endpoint, options) {
  // Mock request router
  if (endpoint.startsWith('/auth/login')) return mockApi.login(JSON.parse(options.body || '{}'));
  if (endpoint.startsWith('/auth/logout')) return mockApi.logout();
  if (endpoint.startsWith('/auth/me')) return mockApi.getMe();
  if (endpoint.startsWith('/auth/profile')) return mockApi.updateProfile(JSON.parse(options.body || '{}'));
  if (endpoint.startsWith('/auth/password')) return mockApi.changePassword(JSON.parse(options.body || '{}'));
  
  if (endpoint.startsWith('/interns')) {
    if (endpoint.includes('/reset-password')) {
      const parts = endpoint.split('/');
      const id = parts[2];
      return mockApi.resetPassword(id, JSON.parse(options.body || '{}').newPassword);
    }
    if (options.method === 'POST') return mockApi.createIntern(JSON.parse(options.body || '{}'));
    if (options.method === 'PUT') {
      const parts = endpoint.split('/');
      const id = parts[2];
      return mockApi.updateIntern(id, JSON.parse(options.body || '{}'));
    }
    if (options.method === 'DELETE') {
      const parts = endpoint.split('/');
      const id = parts[2];
      return mockApi.deleteIntern(id);
    }
    return mockApi.getInterns();
  }

  if (endpoint.startsWith('/reports/calendar')) return mockApi.getCalendar();
  if (endpoint.startsWith('/reports')) {
    if (options.method === 'POST') return mockApi.saveReport(JSON.parse(options.body || '{}'));
    if (options.method === 'PUT') {
      const parts = endpoint.split('/');
      const id = parts[2];
      return mockApi.updateReport(id, JSON.parse(options.body || '{}'));
    }
    if (options.method === 'DELETE') {
      const parts = endpoint.split('/');
      const id = parts[2];
      return mockApi.deleteReport(id);
    }
    return mockApi.getReports();
  }

  if (endpoint.startsWith('/attendance/today')) return mockApi.getTodayAttendance();
  if (endpoint.startsWith('/attendance/check-in')) return mockApi.checkIn();
  if (endpoint.startsWith('/attendance/check-out')) return mockApi.checkOut();
  if (endpoint.startsWith('/attendance')) {
    if (options.method === 'PUT') {
      const parts = endpoint.split('/');
      const id = parts[2];
      return mockApi.updateAttendance(id, JSON.parse(options.body || '{}'));
    }
    return mockApi.getAttendance();
  }

  if (endpoint.startsWith('/instagram/accounts')) return mockApi.getInstagramAccounts();
  if (endpoint.startsWith('/instagram/sync')) return mockApi.syncInstagram();

  if (endpoint.startsWith('/admin/dashboard')) return mockApi.getAdminStats();
  if (endpoint.startsWith('/admin/analytics')) return mockApi.getAdminAnalytics();
  if (endpoint.startsWith('/admin/audit-logs')) return mockApi.getAuditLogs();

  if (endpoint.startsWith('/export/reports')) return mockApi.exportReports();

  return Promise.resolve({ success: true });
}

export const api = {
  // Backend config & Demo Mode
  isDemoMode: isDemoModeActive,
  setDemoMode,
  getBackendUrl: getApiBaseUrl,
  setBackendUrl: setCustomBackendUrl,

  // Auth
  login: (credentials) => {
    if (isDemoModeActive()) return mockApi.login(credentials);
    return request('/auth/login', { method: 'POST', body: credentials });
  },
  logout: () => {
    if (isDemoModeActive()) return mockApi.logout();
    return request('/auth/logout', { method: 'POST' });
  },
  getMe: () => {
    if (isDemoModeActive()) return mockApi.getMe();
    return request('/auth/me');
  },
  updateProfile: (data) => {
    if (isDemoModeActive()) return mockApi.updateProfile(data);
    return request('/auth/profile', { method: 'PUT', body: data });
  },
  changePassword: (data) => {
    if (isDemoModeActive()) return mockApi.changePassword(data);
    return request('/auth/password', { method: 'PUT', body: data });
  },

  // Interns (Admin)
  getInterns: (params = {}) => {
    if (isDemoModeActive()) return mockApi.getInterns(params);
    const q = new URLSearchParams(params).toString();
    return request(`/interns${q ? `?${q}` : ''}`);
  },
  getInternById: (id) => {
    if (isDemoModeActive()) return mockApi.getInternById(id);
    return request(`/interns/${id}`);
  },
  createIntern: (data) => {
    if (isDemoModeActive()) return mockApi.createIntern(data);
    return request('/interns', { method: 'POST', body: data });
  },
  updateIntern: (id, data) => {
    if (isDemoModeActive()) return mockApi.updateIntern(id, data);
    return request(`/interns/${id}`, { method: 'PUT', body: data });
  },
  deleteIntern: (id) => {
    if (isDemoModeActive()) return mockApi.deleteIntern(id);
    return request(`/interns/${id}`, { method: 'DELETE' });
  },
  resetPassword: (id, newPassword) => {
    if (isDemoModeActive()) return mockApi.resetPassword(id, newPassword);
    return request(`/interns/${id}/reset-password`, { method: 'POST', body: { newPassword } });
  },

  // Reports
  getReports: (params = {}) => {
    if (isDemoModeActive()) return mockApi.getReports(params);
    const q = new URLSearchParams(params).toString();
    return request(`/reports${q ? `?${q}` : ''}`);
  },
  getReportById: (id) => {
    if (isDemoModeActive()) return mockApi.getReportById(id);
    return request(`/reports/${id}`);
  },
  saveReport: (data) => {
    if (isDemoModeActive()) return mockApi.saveReport(data);
    return request('/reports', { method: 'POST', body: data });
  },
  updateReport: (id, data) => {
    if (isDemoModeActive()) return mockApi.updateReport(id, data);
    return request(`/reports/${id}`, { method: 'PUT', body: data });
  },
  deleteReport: (id) => {
    if (isDemoModeActive()) return mockApi.deleteReport(id);
    return request(`/reports/${id}`, { method: 'DELETE' });
  },
  getCalendar: (params = {}) => {
    if (isDemoModeActive()) return mockApi.getCalendar(params);
    const q = new URLSearchParams(params).toString();
    return request(`/reports/calendar${q ? `?${q}` : ''}`);
  },

  // Attendance
  getTodayAttendance: (params = {}) => {
    if (isDemoModeActive()) return mockApi.getTodayAttendance(params);
    const q = new URLSearchParams(params).toString();
    return request(`/attendance/today${q ? `?${q}` : ''}`);
  },
  checkIn: () => {
    if (isDemoModeActive()) return mockApi.checkIn();
    return request('/attendance/check-in', { method: 'POST' });
  },
  checkOut: () => {
    if (isDemoModeActive()) return mockApi.checkOut();
    return request('/attendance/check-out', { method: 'POST' });
  },
  getAttendance: (params = {}) => {
    if (isDemoModeActive()) return mockApi.getAttendance(params);
    const q = new URLSearchParams(params).toString();
    return request(`/attendance${q ? `?${q}` : ''}`);
  },
  updateAttendance: (id, data) => {
    if (isDemoModeActive()) return mockApi.updateAttendance(id, data);
    return request(`/attendance/${id}`, { method: 'PUT', body: data });
  },

  // Instagram Analytics
  getInstagramAccounts: () => {
    if (isDemoModeActive()) return mockApi.getInstagramAccounts();
    return request('/instagram/accounts');
  },
  getInstagramAccountById: (id) => {
    if (isDemoModeActive()) return mockApi.getInstagramAccountById(id);
    return request(`/instagram/accounts/${id}`);
  },
  syncInstagram: () => {
    if (isDemoModeActive()) return mockApi.syncInstagram();
    return request('/instagram/sync', { method: 'POST' });
  },
  addInstagramAccount: (data) => {
    if (isDemoModeActive()) return mockApi.addInstagramAccount(data);
    return request('/instagram/accounts', { method: 'POST', body: data });
  },
  updateInstagramAccount: (id, data) => {
    if (isDemoModeActive()) return mockApi.updateInstagramAccount(id, data);
    return request(`/instagram/accounts/${id}`, { method: 'PUT', body: data });
  },
  deleteInstagramAccount: (id) => {
    if (isDemoModeActive()) return mockApi.deleteInstagramAccount(id);
    return request(`/instagram/accounts/${id}`, { method: 'DELETE' });
  },

  // Admin Dashboard & Analytics
  getAdminStats: () => {
    if (isDemoModeActive()) return mockApi.getAdminStats();
    return request('/admin/dashboard');
  },
  getAdminAnalytics: (month) => {
    if (isDemoModeActive()) return mockApi.getAdminAnalytics(month);
    return request(`/admin/analytics${month ? `?month=${month}` : ''}`);
  },
  getAuditLogs: () => {
    if (isDemoModeActive()) return mockApi.getAuditLogs();
    return request('/admin/audit-logs');
  },

  // Export
  exportReports: async (params = {}) => {
    if (isDemoModeActive()) return mockApi.exportReports(params);
    const q = new URLSearchParams(params).toString();
    return request(`/export/reports${q ? `?${q}` : ''}`);
  },
};
