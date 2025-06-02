// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://lifskill-backend.onrender.com';

// Default fetch options
export const defaultFetchOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://lifskill-web-frontend.onrender.com',
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
    console.log('Making request to:', url);
    console.log('With options:', fetchOptions);
    const response = await fetch(url, fetchOptions);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status}, data: ${JSON.stringify(errorData)}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}; 