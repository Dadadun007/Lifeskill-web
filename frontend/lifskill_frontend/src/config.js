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
  const url = `${API_URL}${path}`;
  console.log('Constructed API URL:', url);
  return url;
};

// Helper function to get image URL
export const getImageUrl = (path) => {
  if (!path) return '/default-avatar.png';
  if (path.startsWith('http')) return path;
  const url = `${API_URL}/${path}`;
  console.log('Constructed image URL:', url);
  return url;
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

  console.group(`API Request: ${options.method || 'GET'} ${path}`);
  console.log('URL:', url);
  console.log('Options:', {
    ...fetchOptions,
    headers: fetchOptions.headers,
    body: fetchOptions.body ? JSON.parse(fetchOptions.body) : undefined,
  });

  try {
    const response = await fetch(url, fetchOptions);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.json().catch(() => null);
    console.log('Response data:', responseData);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, data: ${JSON.stringify(responseData)}`);
    }
    
    console.groupEnd();
    return responseData;
  } catch (error) {
    console.error('API call failed:', error);
    console.log('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    console.groupEnd();
    throw error;
  }
}; 