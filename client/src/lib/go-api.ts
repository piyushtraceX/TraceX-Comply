import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

// Create axios instance for API
// Use the explicitly configured Go server URL
const getApiBaseUrl = () => {
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Default Go server port is 8081
  const goPort = "8081";
  
  // Add debugging logs for API URL construction
  console.log('Building Go API URL with:', { protocol, host, goPort });
  
  // Use the same host but specific port for Go API
  const apiUrl = `${protocol}//${host}:${goPort}`;
  console.log('Using Go API URL:', apiUrl);
  return apiUrl;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Initialize auth token from localStorage on module load
(function initAuthToken() {
  const token = localStorage.getItem('auth_token');
  
  // Also check for user data which might be stored as a fallback
  const userData = localStorage.getItem('user_data');
  const justLoggedIn = localStorage.getItem('just_logged_in') === 'true';
  
  if (token) {
    console.log('[API] Initializing authorization header from localStorage token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else if (userData) {
    console.log('[API] Found user data in localStorage but no token');
    if (justLoggedIn) {
      console.log('[API] Just logged in flag is set, will try to fetch new token');
    }
  }
})();

// Setup request interceptor for logging and auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add authorization header if we have a token in localStorage and it's not already in the request
    const token = localStorage.getItem('auth_token');
    if (token && !config.headers['Authorization']) {
      console.log('[API Request] Adding Authorization header from local storage');
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Setup response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error);
    
    // Handle authentication errors - redirect to login page
    if (error.response && error.response.status === 401) {
      const justLoggedIn = localStorage.getItem('just_logged_in') === 'true';
      const hasUserData = localStorage.getItem('user_data') !== null;
      const isAuthPage = window.location.pathname === '/auth';
      
      // Only redirect if:
      // 1. Not already on auth page
      // 2. Not just logged in (might be race condition)
      // 3. No backup user data available
      // 4. Not calling /auth/me endpoint (which will be handled separately)
      if (!isAuthPage && !justLoggedIn && !hasUserData && !error.config.url?.includes('/auth/me')) {
        console.log('[API] 401 error, redirecting to login page');
        window.location.href = '/auth';
      } else if (justLoggedIn) {
        console.log('[API] 401 error but just_logged_in flag is set, not redirecting');
      } else if (hasUserData) {
        console.log('[API] 401 error but has backup user data, not redirecting');
      }
    }
    
    return Promise.reject(error);
  }
);

// API interface - Authentication
export const authApi = {
  login: (username: string, password: string): Promise<AxiosResponse<any>> => {
    // Clear any existing token before login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
    
    // Set a flag to indicate we're in the login process
    localStorage.setItem('just_logged_in', 'true');
    
    console.log('Login attempt with username:', username);
    
    return apiClient.post('/api/auth/login', { username, password })
      .then(response => {
        console.log('Login response received:', response.data);
        
        // Store the successful login flag to prevent immediate logouts
        localStorage.setItem('just_logged_in', 'true');
        
        // Extract and store the user data for fallback authentication
        let userData = null;
        let token = null;
        
        // Handle different API response formats
        
        // Response format with user and token objects
        if (response.data?.user) {
          console.log('Found user data in response, storing in localStorage');
          userData = response.data.user;
          localStorage.setItem('user_data', JSON.stringify(userData));
        }
        
        // Format 1: { auth: { token: "..." } }
        if (response.data?.auth?.token) {
          token = response.data.auth.token;
        } 
        // Format 2: { token: "..." }
        else if (response.data?.token) {
          token = response.data.token;
        }
        // Format 3: Token in authorization header 
        else if (response.headers?.authorization) {
          const authHeader = response.headers.authorization;
          if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
          }
        }
        // Format 4: String token directly in body 
        else if (typeof response.data === 'string' && response.data.length > 20) {
          token = response.data;
        }
        
        // Store token if we found one
        if (token) {
          console.log('Login successful, saving auth token');
          localStorage.setItem('auth_token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          console.log('No token found in login response');
          
          // If we have user data but no token, we might still need to call /api/auth/me
          // to get a proper session cookie established
          if (userData) {
            console.log('We have user data but no token, will try session-based auth');
          }
        }
        
        // Schedule clearing of just_logged_in flag
        setTimeout(() => {
          localStorage.removeItem('just_logged_in');
        }, 30000); // Clear after 30 seconds
        
        return response;
      });
  },
  
  logout: (): Promise<AxiosResponse<any>> => {
    return apiClient.post('/api/auth/logout')
      .finally(() => {
        // Always clear all auth data on logout regardless of API success/failure
        console.log('Clearing all auth data from localStorage');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('just_logged_in');
        delete axios.defaults.headers.common['Authorization'];
      });
  },
  
  getCurrentUser: (): Promise<AxiosResponse<any>> => {
    // Check if we just logged in
    const justLoggedIn = localStorage.getItem('just_logged_in') === 'true';
    
    // Use token-based auth as fallback for cookie-based auth
    const token = localStorage.getItem('auth_token');
    const config: AxiosRequestConfig = {};
    
    if (token) {
      console.log('[API] Using token for getCurrentUser request');
      config.headers = {
        'Authorization': `Bearer ${token}`
      };
    } else {
      console.log('[API] No token available for getCurrentUser request');
    }
    
    // Try to get user from API first
    return apiClient.get('/api/auth/me', config)
      .catch(error => {
        console.error('[API] Error in getCurrentUser:', error);
        
        // If we have stored user data and either just logged in or getting a 401 error, use the fallback
        if (justLoggedIn || (error.response && error.response.status === 401)) {
          const userData = localStorage.getItem('user_data');
          
          if (userData) {
            console.log('[API] Using localStorage fallback for user data');
            
            // Create a mock response with the stored user data
            return Promise.resolve({
              data: { user: JSON.parse(userData) },
              status: 200,
              statusText: 'OK (localStorage fallback)',
              headers: {},
              config: config
            } as AxiosResponse);
          }
        }
        
        // If no fallback, rethrow the error
        return Promise.reject(error);
      });
  },
  
  switchTenant: (tenantId: number): Promise<AxiosResponse<any>> => {
    return apiClient.post('/api/auth/switch-tenant', { tenantId });
  },
};

// API interface - Users
export const usersApi = {
  getUsers: (config?: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
    return apiClient.get('/api/users', config);
  },
  
  getUser: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.get(`/api/users/${id}`);
  },
  
  createUser: (userData: any): Promise<AxiosResponse<any>> => {
    return apiClient.post('/api/users', userData);
  },
  
  updateUser: (id: number, userData: any): Promise<AxiosResponse<any>> => {
    return apiClient.put(`/api/users/${id}`, userData);
  },
  
  deleteUser: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.delete(`/api/users/${id}`);
  },
};

// API interface - Roles
export const rolesApi = {
  getRoles: (config?: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
    return apiClient.get('/api/roles', config);
  },
  
  getRole: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.get(`/api/roles/${id}`);
  },
  
  createRole: (roleData: any): Promise<AxiosResponse<any>> => {
    return apiClient.post('/api/roles', roleData);
  },
  
  updateRole: (id: number, roleData: any): Promise<AxiosResponse<any>> => {
    return apiClient.put(`/api/roles/${id}`, roleData);
  },
  
  deleteRole: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.delete(`/api/roles/${id}`);
  },
};

// API interface - Tenants
export const tenantsApi = {
  getTenants: (): Promise<AxiosResponse<any>> => {
    return apiClient.get('/api/tenants');
  },
  
  getTenant: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.get(`/api/tenants/${id}`);
  },
  
  createTenant: (tenantData: any): Promise<AxiosResponse<any>> => {
    return apiClient.post('/api/tenants', tenantData);
  },
  
  updateTenant: (id: number, tenantData: any): Promise<AxiosResponse<any>> => {
    return apiClient.put(`/api/tenants/${id}`, tenantData);
  },
  
  deleteTenant: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.delete(`/api/tenants/${id}`);
  },
};

export default {
  auth: authApi,
  users: usersApi,
  roles: rolesApi,
  tenants: tenantsApi,
};