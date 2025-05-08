import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

// Create axios instance for Go API
// Get the hostname from window.location to ensure we're using the correct host
const getApiBaseUrl = () => {
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Add debugging logs for API URL construction
  console.log('Building API URL with:', { protocol, host });
  
  // On Replit, use the same host for the API (handled by Go server)
  if (host.includes('replit') || host.includes('repl.co')) {
    const apiUrl = `${protocol}//${host}/api`;
    console.log('Using Replit API URL:', apiUrl);
    return apiUrl;
  }
  
  // In local development, use port 5000
  const port = '5000'; // Fixed port for Go API
  const localApiUrl = `${protocol}//${host}:${port}/api`;
  console.log('Using local API URL:', localApiUrl);
  return localApiUrl;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Setup request interceptor for logging and auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add authorization header if we have a token in localStorage
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
      // Only redirect if not already on auth page
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
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
    delete axios.defaults.headers.common['Authorization'];
    
    return apiClient.post('/auth/login', { username, password })
      .then(response => {
        // Store token in localStorage if it exists in response
        if (response.data?.auth?.token) {
          console.log('Login successful, saving auth token');
          localStorage.setItem('auth_token', response.data.auth.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.auth.token}`;
        }
        return response;
      });
  },
  
  logout: (): Promise<AxiosResponse<any>> => {
    return apiClient.post('/auth/logout')
      .finally(() => {
        // Always clear token on logout regardless of API success/failure
        console.log('Removing auth token from localStorage');
        localStorage.removeItem('auth_token');
        delete axios.defaults.headers.common['Authorization'];
      });
  },
  
  getCurrentUser: (): Promise<AxiosResponse<any>> => {
    // Use token-based auth as fallback for cookie-based auth
    const token = localStorage.getItem('auth_token');
    const config: AxiosRequestConfig = {};
    
    if (token) {
      config.headers = {
        'Authorization': `Bearer ${token}`
      };
    }
    
    return apiClient.get('/auth/me', config);
  },
  
  switchTenant: (tenantId: number): Promise<AxiosResponse<any>> => {
    return apiClient.post('/auth/switch-tenant', { tenantId });
  },
};

// API interface - Users
export const usersApi = {
  getUsers: (config?: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
    return apiClient.get('/users', config);
  },
  
  getUser: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.get(`/users/${id}`);
  },
  
  createUser: (userData: any): Promise<AxiosResponse<any>> => {
    return apiClient.post('/users', userData);
  },
  
  updateUser: (id: number, userData: any): Promise<AxiosResponse<any>> => {
    return apiClient.put(`/users/${id}`, userData);
  },
  
  deleteUser: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.delete(`/users/${id}`);
  },
};

// API interface - Roles
export const rolesApi = {
  getRoles: (config?: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
    return apiClient.get('/roles', config);
  },
  
  getRole: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.get(`/roles/${id}`);
  },
  
  createRole: (roleData: any): Promise<AxiosResponse<any>> => {
    return apiClient.post('/roles', roleData);
  },
  
  updateRole: (id: number, roleData: any): Promise<AxiosResponse<any>> => {
    return apiClient.put(`/roles/${id}`, roleData);
  },
  
  deleteRole: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.delete(`/roles/${id}`);
  },
};

// API interface - Tenants
export const tenantsApi = {
  getTenants: (): Promise<AxiosResponse<any>> => {
    return apiClient.get('/tenants');
  },
  
  getTenant: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.get(`/tenants/${id}`);
  },
  
  createTenant: (tenantData: any): Promise<AxiosResponse<any>> => {
    return apiClient.post('/tenants', tenantData);
  },
  
  updateTenant: (id: number, tenantData: any): Promise<AxiosResponse<any>> => {
    return apiClient.put(`/tenants/${id}`, tenantData);
  },
  
  deleteTenant: (id: number): Promise<AxiosResponse<any>> => {
    return apiClient.delete(`/tenants/${id}`);
  },
};

export default {
  auth: authApi,
  users: usersApi,
  roles: rolesApi,
  tenants: tenantsApi,
};