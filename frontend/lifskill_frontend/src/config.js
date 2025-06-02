// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Default fetch options
export const defaultFetchOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper function to get full API URL
export const getApiUrl = (path) => {
  return `${API_URL}${path}`;
};

// Helper function to get image URL
export const getImageUrl = (path) => {
  if (!path) return '/default-avatar.png';
  if (path.startsWith('http')) return path;
  return `${API_URL}/${path}`;
};

// Helper function for API calls
export const fetchApi = async (path, options = {}) => {
  const url = getApiUrl(path);
  const fetchOptions = {
    ...defaultFetchOptions,
    ...options,
    headers: {
      ...defaultFetchOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}; 