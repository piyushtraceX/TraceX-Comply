import axios from 'axios';
import { API_BASE_URL } from './api-config';

// API service settings
type ApiType = 'express' | 'go';
let currentApiType: ApiType = 'go';

// A list of endpoints and their implementation status
const ENDPOINTS = {
  // Auth related endpoints
  '/auth/login': { express: true, go: true },
  '/auth/logout': { express: true, go: true },
  '/auth/me': { express: true, go: true },
  '/auth/switch-tenant': { express: true, go: true },
  
  // User management
  '/users': { express: true, go: true },
  '/users/:id': { express: true, go: true },
  
  // Test endpoints
  '/test': { express: true, go: true },
  '/health': { express: false, go: true },
  
  // Other API endpoints
  '/suppliers': { express: true, go: false },
  '/customers': { express: true, go: false },
  '/declarations': { express: true, go: false },
};

// Create API instances for both Express and Go
const expressApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const goApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Setup interceptors
// Logging
expressApi.interceptors.request.use(
  (config) => {
    console.log(`Express API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  }
);
goApi.interceptors.request.use(
  (config) => {
    console.log(`Go API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  }
);

// Error handling
const handleApiError = (error: any, apiType: ApiType) => {
  console.error(`${apiType.toUpperCase()} API Error:`, error.message);
  
  if (axios.isAxiosError(error)) {
    console.error("Response details:", {
      status: error.response?.status,
      data: error.response?.data
    });
    
    // For unauthorized errors, redirect to login if not already there
    if (error.response?.status === 401 && window.location.pathname !== '/auth') {
      console.log('Not authenticated, redirecting to login');
      window.location.href = '/auth';
    }
  }
  
  return Promise.reject(error);
};

expressApi.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error, 'express')
);

goApi.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error, 'go')
);

// Function to determine if an endpoint is available in the Go API
const isEndpointAvailableInGo = (endpoint: string): boolean => {
  // Check exact matches first
  if (endpoint in ENDPOINTS) {
    return ENDPOINTS[endpoint as keyof typeof ENDPOINTS].go;
  }
  
  // Check for parametrized endpoints
  for (const [path, status] of Object.entries(ENDPOINTS)) {
    if (path.includes(':') && status.go) {
      const regex = new RegExp('^' + path.replace(/:\w+/g, '[^/]+') + '$');
      if (regex.test(endpoint)) {
        return true;
      }
    }
  }
  
  return false;
};

// Function to set the active API type
export const setApiType = (type: ApiType) => {
  currentApiType = type;
  console.log(`API Type set to: ${type}`);
};

// Function to get the current API type
export const getApiType = (): ApiType => currentApiType;

// Check if we can use Go API for a specific endpoint
const canUseGoApi = (endpoint: string): boolean => {
  // If current API type is Express, don't try to use Go
  if (currentApiType === 'express') {
    return false;
  }
  
  // If current API type is Go, check if endpoint is available
  return isEndpointAvailableInGo(endpoint);
};

// Main API request router function
export const apiRouter = async (
  method: string,
  endpoint: string,
  data?: any
): Promise<any> => {
  // Determine which API to use
  const useGoApi = canUseGoApi(endpoint);
  const api = useGoApi ? goApi : expressApi;
  
  console.log(`Using ${useGoApi ? 'Go' : 'Express'} API for ${method} ${endpoint}`);
  
  // Make the request
  try {
    let response;
    switch (method.toUpperCase()) {
      case 'GET':
        response = await api.get(endpoint);
        break;
      case 'POST':
        response = await api.post(endpoint, data);
        break;
      case 'PUT':
        response = await api.put(endpoint, data);
        break;
      case 'DELETE':
        response = await api.delete(endpoint);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    return response.data;
  } catch (error) {
    // If using Go API and it fails, try fallback to Express if available
    if (useGoApi && error instanceof Error) {
      console.warn(`Go API request failed for ${endpoint}: ${error.message}`);
      console.warn('Falling back to Express API');
      
      const fallbackApi = expressApi;
      try {
        let fallbackResponse;
        switch (method.toUpperCase()) {
          case 'GET':
            fallbackResponse = await fallbackApi.get(endpoint);
            break;
          case 'POST':
            fallbackResponse = await fallbackApi.post(endpoint, data);
            break;
          case 'PUT':
            fallbackResponse = await fallbackApi.put(endpoint, data);
            break;
          case 'DELETE':
            fallbackResponse = await fallbackApi.delete(endpoint);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
        
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('Express API fallback also failed');
        throw fallbackError;
      }
    }
    
    throw error;
  }
};