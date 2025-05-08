import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      // If we're on the auth page, skip the API call
      if (isAuthPage) {
        return null;
      }
      
      try {
        const response = await authApi.getCurrentUser();
        return response.data;
      } catch (error) {
        // Return null for 401 errors (not authenticated)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    // Add these options to prevent excessive refetching
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: Infinity,
    retry: false,
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
    mutationFn: (credentials: LoginCredentials) => {
      return authApi.login(credentials.username, credentials.password);
    },
    onSuccess: (response) => {
      // Update the user data in the query cache
      queryClient.setQueryData(['auth', 'me'], response.data);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.response?.data?.error || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => {
      return authApi.logout();
    },
    onSuccess: () => {
      // Clear user data from the query cache
      queryClient.setQueryData(['auth', 'me'], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.response?.data?.error || "An error occurred while logging out",
        variant: "destructive",
      });
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
    <LoaderIcon className="h-8 w-8 animate-spin" />
  </div> 
}) => {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return <>{fallback}</>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    // Use react router instead of hard redirect to prevent refresh loops
    if (window.location.pathname !== '/auth') {
      window.location.href = '/auth';
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

// For importing axios in the component
import axios from 'axios';