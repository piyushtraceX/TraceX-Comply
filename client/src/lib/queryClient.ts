import { QueryClient, QueryFunction } from "@tanstack/react-query";
import axios from "axios";
import { getApiBaseUrl } from "./go-api";

// Use Go server API exclusively - get the correct URL based on environment
const API_URL = `${getApiBaseUrl()}/api`;

// Log the API URL being used
console.log('Using API URL:', API_URL);

// Create a reusable axios instance configured for the API
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  },
  withCredentials: true,
  timeout: 10000,
  allowAbsoluteUrls: true,
});

// Log requests in development
apiClient.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  
  // Log which API backend we're using
  if (config.baseURL) {
    console.log(`Using API at: ${config.baseURL}`);
  }
  
  return config;
});

// Handle errors consistently
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.message);
    
    if (axios.isAxiosError(error)) {
      console.error("Response details:", {
        status: error.response?.status,
        data: error.response?.data
      });
    }
    
    // For unauthorized errors, redirect to login if not already there
    if (error.response?.status === 401 && window.location.pathname !== '/auth') {
      console.log('Not authenticated, redirecting to login');
      window.location.href = '/auth';
    }
    
    return Promise.reject(error);
  }
);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Always use the direct API URL
  const fullUrl = url.startsWith('/api/') ? url.substring(5) : url;
  
  try {
    let response;
    
    // Use different HTTP methods based on the method parameter
    switch (method.toUpperCase()) {
      case 'GET':
        response = await apiClient.get(fullUrl);
        break;
      case 'POST':
        response = await apiClient.post(fullUrl, data);
        break;
      case 'PUT':
        response = await apiClient.put(fullUrl, data);
        break;
      case 'DELETE':
        response = await apiClient.delete(fullUrl);
        break;
      default:
        // Fall back to fetch for other methods
        return await fetch(fullUrl, {
          method,
          headers: data ? { "Content-Type": "application/json" } : {},
          body: data ? JSON.stringify(data) : undefined,
          credentials: "include",
        });
    }
    
    // Convert Axios response to a Response object
    const fetchResponse = new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers as any),
    });
    
    return fetchResponse;
  } catch (error: any) {
    console.error("API request error:", error);
    
    // Create a Response object from the error
    const errorResponse = new Response(JSON.stringify({ 
      message: error.message || "Unknown error occurred" 
    }), {
      status: error.response?.status || 500,
      statusText: error.response?.statusText || "Internal Server Error",
    });
    
    await throwIfResNotOk(errorResponse);
    return errorResponse;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey[0] as string;
    // Always use direct path, removing /api/ prefix if present
    const url = path.startsWith('/api/') ? path.substring(5) : path;
    
    try {
      // Use consistent API client for all requests
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error("Query error:", error);
      
      // Handle 401 unauthorized based on options
      if (error.response?.status === 401 && unauthorizedBehavior === "returnNull") {
        return null;
      }
      
      // Re-throw other errors
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      // Prevent refetching when the query is already fetching or errored
      refetchOnMount: false,
    },
    mutations: {
      retry: false,
    },
  },
});
