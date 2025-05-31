// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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