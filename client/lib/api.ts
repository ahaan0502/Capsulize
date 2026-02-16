const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function for API requests
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers: Record<string, string> = {  // ← Changed type
    'Content-Type': 'application/json',
  };

  // Add Authorization if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge with any additional headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  console.log('API Request:', endpoint, 'Token:', token ? 'present' : 'missing');

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

// Auth API calls
export const auth = {
  register: (email: string, password: string) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () => fetchAPI('/auth/me'),
};

// Capsule API calls
export const capsules = {
  getAll: () => fetchAPI('/capsules'),

  getOne: (id: string) => fetchAPI(`/capsules/${id}`),

  create: (content: string, unlockDate: string) =>
    fetchAPI('/capsules', {
      method: 'POST',
      body: JSON.stringify({ content, unlockDate }),
    }),

  unlock: (id: string, answer: string) =>
    fetchAPI(`/capsules/${id}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }),

  delete: (id: string) =>
    fetchAPI(`/capsules/${id}`, {
      method: 'DELETE',
    }),
};