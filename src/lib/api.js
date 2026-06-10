/**
 * api.js — كل الـ API calls في مكان واحد
 * استخدم authFetch من AuthContext للـ private routes
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ── Helper ────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('fci_token');

const apiFetch = async (url, options = {}) => {
  const token = getToken();
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'خطأ في السيرفر');
  return data;
};

// للـ multipart/form-data (رفع ملفات)
const apiFetchFile = async (url, formData) => {
  const token = getToken();
  const res = await fetch(`${API_URL}${url}`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'خطأ في السيرفر');
  return data;
};

// ══════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════
export const authAPI = {
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (name, email, password, year, studentId) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, year, studentId })
    }),

  getMe: () => apiFetch('/auth/me'),
};

// ══════════════════════════════════════════════════════════════════
// SUBJECTS & LECTURES
// ══════════════════════════════════════════════════════════════════
export const subjectsAPI = {
  getByYearTerm: (year, term) => apiFetch(`/subjects?year=${year}&term=${term}`),

  getBySlug: (slug) => apiFetch(`/subjects/${slug}`),

  create: (data) =>
    apiFetch('/subjects', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    apiFetch(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id) =>
    apiFetch(`/subjects/${id}`, { method: 'DELETE' }),

  // Lectures
  addLecture: (subjectId, formData) =>
    apiFetchFile(`/subjects/${subjectId}/lectures`, formData),

  updateLecture: (subjectId, lectureId, data) =>
    apiFetch(`/subjects/${subjectId}/lectures/${lectureId}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteLecture: (subjectId, lectureId) =>
    apiFetch(`/subjects/${subjectId}/lectures/${lectureId}`, { method: 'DELETE' }),
};

// ══════════════════════════════════════════════════════════════════
// DEPARTMENTS
// ══════════════════════════════════════════════════════════════════
export const departmentsAPI = {
  getAll: () => apiFetch('/departments'),
  getBySlug: (slug) => apiFetch(`/departments/${slug}`),
  create: (data) => apiFetch('/departments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/departments/${id}`, { method: 'DELETE' }),
};

// ══════════════════════════════════════════════════════════════════
// CAREERS / ROADMAPS
// ══════════════════════════════════════════════════════════════════
export const careersAPI = {
  getAll: () => apiFetch('/careers'),
  getBySlug: (slug) => apiFetch(`/careers/${slug}`),
  create: (data) => apiFetch('/careers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/careers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/careers/${id}`, { method: 'DELETE' }),
};

// ══════════════════════════════════════════════════════════════════
// COURSES (External)
// ══════════════════════════════════════════════════════════════════
export const coursesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiFetch(`/courses${params ? '?' + params : ''}`);
  },
  getById: (id) => apiFetch(`/courses/${id}`),
  getOne: (id) => apiFetch(`/courses/${id}`),
  addVideo: (courseId, data) => apiFetch(`/courses/${courseId}/videos`, { method: 'POST', body: JSON.stringify(data) }),
  deleteVideo: (courseId, videoId) => apiFetch(`/courses/${courseId}/videos/${videoId}`, { method: 'DELETE' }),
  getMyCourses: () => apiFetch('/courses/my'),
  enroll: (id) => apiFetch(`/courses/${id}/enroll`, { method: 'POST' }),
  create: (data) => apiFetch('/courses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/courses/${id}`, { method: 'DELETE' }),
};

// ══════════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════════
export const adminAPI = {
  getStats: () => apiFetch('/admin/stats'),

  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/admin/users${query ? '?' + query : ''}`);
  },

  toggleUserActive: (id) =>
    apiFetch(`/admin/users/${id}/toggle-active`, { method: 'PATCH' }),

  deleteUser: (id) =>
    apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),

  getRecentRegistrations: (limit = 10) =>
    apiFetch(`/admin/recent-registrations?limit=${limit}`),

  getAllSubjects: () => apiFetch('/admin/subjects'),

  // يرجع كل الأقسام بدون filter — للأدمن فقط
  getAllDepartments: () => apiFetch('/admin/departments'),

  // يرجع كل المسارات بدون filter — للأدمن فقط
  getAllCareers: () => apiFetch('/admin/careers'),

  // كل الكورسات للأدمن (مع enrolledUsers)
  getCourses: () => apiFetch('/courses?_admin=1'),
}

// ══════════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════════
export const profileAPI = {
  updateProfile: (data) =>
    apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword, newPassword) =>
    apiFetch('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ══════════════════════════════════════════════════════════════════
// CAREER PROGRESS
// ══════════════════════════════════════════════════════════════════
export const careerProgressAPI = {
  // جلب تقدم الطالب في مسار معين
  get: (slug) => apiFetch(`/auth/career-progress/${slug}`),

  // حفظ التقدم — بيُستدعى عند كل تغيير
  save: (careerSlug, checkedItems, selectedChoices) =>
    apiFetch('/auth/career-progress', {
      method: 'PUT',
      body: JSON.stringify({ careerSlug, checkedItems, selectedChoices }),
    }),
};