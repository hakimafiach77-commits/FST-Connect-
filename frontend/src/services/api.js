const BASE_URL = 'http://localhost:3000/api';

/**
 * Core API service for FST-Connect
 */
const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('gdi_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle auto-logout on 401, except during login attempt
      if (response.status === 401 && endpoint !== '/auth/login') {
        localStorage.removeItem('gdi_token');
        localStorage.removeItem('gdi_user');
        window.location.href = '/auth';
      }
      throw new Error(data.message || 'API Error');
    }

    return data;
  } catch (error) {
    console.error(`API Call failed [${endpoint}]:`, error.message);
    throw error;
  }
};

export default api;
