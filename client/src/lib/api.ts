import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
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

// API interface - Authentication
export const authApi = {
  login: (username: string, password: string): Promise<AxiosResponse<any>> => {
    return api.post('/auth/login', { username, password });
  },
  
  logout: (): Promise<AxiosResponse<any>> => {
    return api.post('/auth/logout');
  },
  
  getCurrentUser: (): Promise<AxiosResponse<any>> => {
    return api.get('/auth/me');
  },
  
  switchTenant: (tenantId: number): Promise<AxiosResponse<any>> => {
    return api.post('/auth/switch-tenant', { tenantId });
  },
};

// API interface - Users
export const usersApi = {
  getUsers: (config?: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
    return api.get('/users', config);
  },
  
  getUser: (id: number): Promise<AxiosResponse<any>> => {
    return api.get(`/users/${id}`);
  },
  
  createUser: (userData: any): Promise<AxiosResponse<any>> => {
    return api.post('/users', userData);
  },
  
  updateUser: (id: number, userData: any): Promise<AxiosResponse<any>> => {
    return api.put(`/users/${id}`, userData);
  },
  
  deleteUser: (id: number): Promise<AxiosResponse<any>> => {
    return api.delete(`/users/${id}`);
  },
  
  assignRole: (userId: number, roleId: number, tenantId?: number): Promise<AxiosResponse<any>> => {
    return api.post(`/users/${userId}/roles`, { roleId, tenantId });
  },
  
  removeRole: (userId: number, roleId: number): Promise<AxiosResponse<any>> => {
    return api.delete(`/users/${userId}/roles/${roleId}`);
  },
};

// API interface - Roles
export const rolesApi = {
  getRoles: (config?: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
    return api.get('/roles', config);
  },
  
  getRole: (id: number): Promise<AxiosResponse<any>> => {
    return api.get(`/roles/${id}`);
  },
  
  createRole: (roleData: any): Promise<AxiosResponse<any>> => {
    return api.post('/roles', roleData);
  },
  
  updateRole: (id: number, roleData: any): Promise<AxiosResponse<any>> => {
    return api.put(`/roles/${id}`, roleData);
  },
  
  deleteRole: (id: number): Promise<AxiosResponse<any>> => {
    return api.delete(`/roles/${id}`);
  },
};

// API interface - Tenants
export const tenantsApi = {
  getTenants: (): Promise<AxiosResponse<any>> => {
    return api.get('/tenants');
  },
  
  getTenant: (id: number): Promise<AxiosResponse<any>> => {
    return api.get(`/tenants/${id}`);
  },
  
  createTenant: (tenantData: any): Promise<AxiosResponse<any>> => {
    return api.post('/tenants', tenantData);
  },
  
  updateTenant: (id: number, tenantData: any): Promise<AxiosResponse<any>> => {
    return api.put(`/tenants/${id}`, tenantData);
  },
  
  deleteTenant: (id: number): Promise<AxiosResponse<any>> => {
    return api.delete(`/tenants/${id}`);
  },
};

export default api;