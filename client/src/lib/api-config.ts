// API Configuration
// This file exports the base URL for API requests

// In a real production environment, this would be configured
// based on environment variables or build configuration
// Get the current hostname dynamically
const host = window.location.hostname;
const port = window.location.port ? `:${window.location.port}` : '';
const protocol = window.location.protocol;

// Always use the same origin for API calls to avoid CORS issues
export const API_BASE_URL = `${protocol}//${host}${port}/api`;

// Export functions to ensure all API requests go to the Go server
export const getApiUrl = (path: string): string => {
  // Make sure path starts with a forward slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Check if it's a relative URL
  if (cleanPath.startsWith('/api/')) {
    // Extract the path after /api/
    const apiPath = cleanPath.substring(5);
    return `${API_BASE_URL}/${apiPath}`;
  }
  
  // If it's not an API URL, return as is
  return cleanPath;
};
