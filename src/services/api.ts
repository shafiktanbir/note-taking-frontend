const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://note-taking-backend-opal.vercel.app/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getCurrentUser(): any {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: any): void {
  localStorage.setItem('user', JSON.stringify(user));
}

async function request(endpoint: string, method = 'GET', body?: any) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || json.message || 'API request failed');
  }

  return json;
}

export const api = {
  // Auth
  login: async (credentials: any) => {
    const res = await request('/auth/login', 'POST', credentials);
    if (res.data?.token) {
      setAuthToken(res.data.token);
      setCurrentUser(res.data.user);
    }
    return res;
  },

  register: async (userData: any) => {
    const res = await request('/auth/register', 'POST', userData);
    if (res.data?.token) {
      setAuthToken(res.data.token);
      setCurrentUser(res.data.user);
    }
    return res;
  },

  // Notes
  getNotes: (page = 1, limit = 10) => request(`/notes?page=${page}&limit=${limit}`),
  createNote: (data: { title: string; content: string }) => request('/notes', 'POST', data),
  updateNote: (id: string, data: { title?: string; content?: string }) => request(`/notes/${id}`, 'PUT', data),
  deleteNote: (id: string) => request(`/notes/${id}`, 'DELETE'),

  // Admin User Management
  getUsers: (page = 1, limit = 10) => request(`/users?page=${page}&limit=${limit}`),
  createUser: (userData: any) => request('/users', 'POST', userData),
  updateUser: (id: string, userData: any) => request(`/users/${id}`, 'PUT', userData),
  deleteUser: (id: string) => request(`/users/${id}`, 'DELETE'),

  // Aggregations
  getGroupedInterests: () => request('/aggregations/interests'),
  getUserPosts: (userId?: string) => request(`/aggregations/user-posts${userId ? `?userId=${userId}` : ''}`),
};
