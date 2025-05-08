import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiBridge, getApiInstance } from "./api-bridge";

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
  // Use the API bridge for more robust handling across backends
  try {
    let response;
    
    // Use different HTTP methods based on the method parameter
    switch (method.toUpperCase()) {
      case 'GET':
        response = await apiBridge.get(url);
        break;
      case 'POST':
        response = await apiBridge.post(url, data);
        break;
      case 'PUT':
        response = await apiBridge.put(url, data);
        break;
      case 'DELETE':
        response = await apiBridge.delete(url);
        break;
      default:
        // Fall back to fetch for other methods
        return await fetch(url, {
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
    try {
      // Use API bridge for consistent behavior
      const api = getApiInstance();
      const response = await api.get(queryKey[0] as string);
      
      // Convert Axios successful response
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
