// API Configuration
// This file exports the base URL for API requests

// In a real production environment, this would be configured
// based on environment variables or build configuration
export const API_BASE_URL = 'http://localhost:8080/api';

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