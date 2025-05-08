/**
 * API Bridge - Helper to transition from Express.js to Go backend
 * 
 * This file provides a bridge to help with the transition from the Express.js backend
 * to the Go backend. It enables testing the Go backend while still allowing fallback
 * to the Express.js backend until the transition is complete.
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Configuration for different backend environments
export type ApiEndpoint = 'express' | 'go';

const API_CONFIGS = {
  express: {
    baseURL: '/api',
    timeout: 10000,
  },
  go: {
    baseURL: import.meta.env.VITE_GO_API_URL || 'http://localhost:8080/api',
    timeout: 10000,
  }
};

// Log the available API configurations
console.log('API configurations:', {
  express: API_CONFIGS.express.baseURL,
  go: API_CONFIGS.go.baseURL
});

// Current API endpoint to use, defaults to Express
// Can be changed at runtime to test the Go backend
let currentEndpoint: ApiEndpoint = 'express';

// API instances for different backends
const apiInstances = {
  express: axios.create({
    ...API_CONFIGS.express,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  }),
  
  go: axios.create({
    ...API_CONFIGS.go,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  })
};

// Setup response interceptors for each API instance
Object.values(apiInstances).forEach(instance => {
  instance.interceptors.response.use(
    response => response,
    error => {
      // Handle session expiration or authentication errors
      if (error.response && error.response.status === 401) {
        // Only redirect if not already on the auth page
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }
      return Promise.reject(error);
    }
  );
});

/**
 * Set the active API endpoint
 * @param endpoint The endpoint to use ('express' or 'go')
 */
export function setApiEndpoint(endpoint: ApiEndpoint): void {
  currentEndpoint = endpoint;
  console.log(`API endpoint set to: ${endpoint}`);
}

/**
 * Get the current API instance based on the active endpoint
 */
export function getApiInstance() {
  return apiInstances[currentEndpoint];
}

/**
 * Make a request to the API, trying the primary endpoint first
 * and falling back to the secondary endpoint if the primary fails
 */
export async function apiBridgeRequest(
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse> {
  const api = getApiInstance();
  
  try {
    // Make the request to the current endpoint
    return await api.request({
      method,
      url,
      data,
      ...config,
    });
  } catch (error) {
    console.error(`Error with ${currentEndpoint} API:`, error);
    throw error;
  }
}

// For direct usage of apiBridgeRequest with common HTTP methods
export const apiBridge = {
  get: (url: string, config?: AxiosRequestConfig) => 
    apiBridgeRequest('GET', url, undefined, config),
  
  post: (url: string, data?: any, config?: AxiosRequestConfig) => 
    apiBridgeRequest('POST', url, data, config),
  
  put: (url: string, data?: any, config?: AxiosRequestConfig) => 
    apiBridgeRequest('PUT', url, data, config),
  
  delete: (url: string, config?: AxiosRequestConfig) => 
    apiBridgeRequest('DELETE', url, undefined, config),
};

export default apiBridge;