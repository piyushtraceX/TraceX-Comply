import { QueryClient, QueryFunction } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL, getApiUrl } from "./api-config";

// Create a reusable axios instance configured for the Go API
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Log requests in development
apiClient.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Handle errors consistently
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.message);
    
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
  // Make sure we're using the Go API URL
  const fullUrl = getApiUrl(url);
  
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
    const url = getApiUrl(path);
    
    try {
      // Use direct API call to Go server
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
