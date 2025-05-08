import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useLocation } from 'wouter';

// Types for our auth context
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  tenantId?: number;
  isSuperAdmin: boolean;
  roles?: string[];
}

interface Tenant {
  id: number;
  name: string;
  description: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchTenant: (tenantId: number) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tenant, setTenant] = useState<Tenant | null>(null);

  // Query to fetch the current user
  const isAuthPage = window.location.pathname === '/auth';
  
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      // If we're on the auth page, skip the API call to avoid unnecessary 401 errors
      if (isAuthPage) {
        console.log('On auth page, skipping auth check');
        return null;
      }
      
      try {
        console.log('Fetching current user...');
        const response = await authApi.getCurrentUser();
        console.log('Current user fetched:', response.data);
        return response.data;
      } catch (error: any) {
        // Return null for 401 errors (not authenticated)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log('Not authenticated (401)');
          return null;
        }
        
        // Log other errors for debugging
        console.error('Error fetching current user:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response status:', error.response?.status);
          console.error('Response data:', error.response?.data);
        }
        
        throw error;
      }
    },
    // Add these options to prevent excessive refetching
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: Infinity,
    retry: 1, // Allow one retry for potential network issues
    retryDelay: 1000, // Wait 1 second before retrying
    // Skip the query if we're on the auth page
    enabled: !isAuthPage,
  });

  // Extract user and tenant from data
  const user = data?.user || null;

  // Set tenant when user data changes
  useEffect(() => {
    if (data?.tenant) {
      setTenant(data.tenant);
    }
  }, [data]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      console.log('Attempting login with:', credentials.username);
      try {
        const response = await authApi.login(credentials.username, credentials.password);
        console.log('Login successful, response:', response.data);
        return response;
      } catch (error: any) {
        console.error('Login error:', error);
        
        if (axios.isAxiosError(error)) {
          console.error('Login response status:', error.response?.status);
          console.error('Login response data:', error.response?.data);
        }
        
        throw error;
      }
    },
    onSuccess: (response) => {
      // Update the user data in the query cache
      console.log('Updating auth cache with user data');
      queryClient.setQueryData(['auth', 'me'], response.data);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.data.user?.name || response.data.user?.username}!`,
      });
      
      // Redirect to the dashboard after successful login
      if (window.location.pathname === '/auth') {
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      }
    },
    onError: (error: any) => {
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message ||
        error.message ||
        "Invalid username or password";
        
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('Attempting logout...');
      try {
        const response = await authApi.logout();
        console.log('Logout API call succeeded');
        return response;
      } catch (error: any) {
        console.error('Logout error:', error);
        
        // Sometimes logout fails because the session is already expired
        // In this case, we can just clear the local state anyway
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log('Session already expired, continuing with local logout');
          return null;
        }
        
        throw error;
      }
    },
    onSuccess: () => {
      // Clear user data from the query cache
      console.log('Clearing auth cache');
      queryClient.setQueryData(['auth', 'me'], null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/auth';
      }, 500);
    },
    onError: (error: any) => {
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message ||
        error.message ||
        "An error occurred while logging out";
      
      toast({
        title: "Logout failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Even if logout fails on the server, clear local state
      queryClient.setQueryData(['auth', 'me'], null);
    },
  });

  // Switch tenant mutation
  const switchTenantMutation = useMutation({
    mutationFn: (tenantId: number) => {
      return authApi.switchTenant(tenantId);
    },
    onSuccess: (response) => {
      // Update the tenant data
      setTenant(response.data.tenant);
      // Refetch user data to get updated permissions
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast({
        title: "Tenant switched",
        description: `You're now using ${response.data.tenant.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Tenant switch failed",
        description: error.response?.data?.error || "An error occurred while switching tenants",
        variant: "destructive",
      });
    },
  });

  // Login function
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Switch tenant function
  const switchTenant = async (tenantId: number) => {
    await switchTenantMutation.mutateAsync(tenantId);
  };

  // Combine loading states
  const isLoadingAny = isLoading || loginMutation.isPending || logoutMutation.isPending || switchTenantMutation.isPending;

  // The value provided to consumers of this context
  const contextValue: AuthContextType = {
    user,
    tenant,
    isLoading: isLoadingAny,
    error: error as Error || null,
    login,
    logout,
    switchTenant,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ProtectedRoute component
interface ProtectedRouteProps {
  children: React.ReactNode;
  path?: string; // Optional path for compatibility with Route component
  component?: React.ComponentType<any>; // Optional component prop for backward compatibility
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  path,
  component: Component,
  fallback = <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div> 
}) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Show loading state
  if (isLoading) {
    return <>{fallback}</>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    // Use wouter for client-side navigation to prevent page refreshes
    console.log("User not authenticated, redirecting to /auth");
    
    // Only redirect if we're not already on the auth page
    if (window.location.pathname !== '/auth') {
      // Use setTimeout to avoid React state updates during render
      setTimeout(() => {
        setLocation('/auth');
      }, 0);
    }
    return null;
  }

  // Render the Component if provided (for backward compatibility)
  if (Component) {
    return <Component />;
  }

  // Render the children if authenticated
  return <>{children}</>;
};

