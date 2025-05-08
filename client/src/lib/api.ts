import { AxiosResponse, AxiosRequestConfig } from 'axios';
import apiBridge, { setApiEndpoint } from './api-bridge';

// Use the Express.js backend by default
// Can be changed to 'go' to use the Go backend
setApiEndpoint('express');

// API interface - Authentication
export const authApi = {
  login: (username: string, password: string): Promise<AxiosResponse<any>> => {
    return apiBridge.post('/auth/login', { username, password });
  },
  
  logout: (): Promise<AxiosResponse<any>> => {
    return apiBridge.post('/auth/logout');
  },
  
  getCurrentUser: (): Promise<AxiosResponse<any>> => {
    return apiBridge.get('/auth/me');
  },
  
  switchTenant: (tenantId: number): Promise<AxiosResponse<any>> => {
    return apiBridge.post('/auth/switch-tenant', { tenantId });
  },
};

// API interface - Users
export const usersApi = {
  getUsers: (config?: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
    return apiBridge.get('/users', config);
  },
  
  getUser: (id: number): Promise<AxiosResponse<any>> => {
    return apiBridge.get(`/users/${id}`);
  },
  
  createUser: (userData: any): Promise<AxiosResponse<any>> => {
    return apiBridge.post('/users', userData);
  },
  
  updateUser: (id: number, userData: any): Promise<AxiosResponse<any>> => {
    return apiBridge.put(`/users/${id}`, userData);
  },
  
  deleteUser: (id: number): Promise<AxiosResponse<any>> => {
    return apiBridge.delete(`/users/${id}`);
  },
  
  assignRole: (userId: number, roleId: number, tenantId?: number): Promise<AxiosResponse<any>> => {
    return apiBridge.post(`/users/${userId}/roles`, { roleId, tenantId });
  },
  
  removeRole: (userId: number, roleId: number): Promise<AxiosResponse<any>> => {
    return apiBridge.delete(`/users/${userId}/roles/${roleId}`);
  },
};

// API interface - Roles
export const rolesApi = {
  getRoles: (config?: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
    return apiBridge.get('/roles', config);
  },
  
  getRole: (id: number): Promise<AxiosResponse<any>> => {
    return apiBridge.get(`/roles/${id}`);
  },
  
  createRole: (roleData: any): Promise<AxiosResponse<any>> => {
    return apiBridge.post('/roles', roleData);
  },
  
  updateRole: (id: number, roleData: any): Promise<AxiosResponse<any>> => {
    return apiBridge.put(`/roles/${id}`, roleData);
  },
  
  deleteRole: (id: number): Promise<AxiosResponse<any>> => {
    return apiBridge.delete(`/roles/${id}`);
  },
};

// API interface - Tenants
export const tenantsApi = {
  getTenants: (): Promise<AxiosResponse<any>> => {
    return apiBridge.get('/tenants');
  },
  
  getTenant: (id: number): Promise<AxiosResponse<any>> => {
    return apiBridge.get(`/tenants/${id}`);
  },
  
  createTenant: (tenantData: any): Promise<AxiosResponse<any>> => {
    return apiBridge.post('/tenants', tenantData);
  },
  
  updateTenant: (id: number, tenantData: any): Promise<AxiosResponse<any>> => {
    return apiBridge.put(`/tenants/${id}`, tenantData);
  },
  
  deleteTenant: (id: number): Promise<AxiosResponse<any>> => {
    return apiBridge.delete(`/tenants/${id}`);
  },
};

// Export the ability to switch API backends
export { setApiEndpoint } from './api-bridge';