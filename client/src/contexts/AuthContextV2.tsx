import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/go-api'; // Use API client
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

  // Initialize auth token from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.log('Found existing auth token in localStorage on startup');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Query to fetch the current user
  const isAuthPage = window.location.pathname === '/auth';
  
  // Check if we're in Replit environment
  const isReplitEnvironment = 
    window.location.hostname.includes('replit') || 
    window.location.hostname.includes('.app');

  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        console.log('Fetching current user...');
        
        // In Replit environment, fall back to localStorage data if available
        if (isReplitEnvironment) {
          console.log('Replit environment detected, checking localStorage for user data');
          const userData = localStorage.getItem('user_data');
          if (userData) {
            console.log('Using stored user data from localStorage in Replit environment');
            return { user: JSON.parse(userData) };
          } else {
            console.log('No stored user data available in Replit');
          }
        }
        
        // Try API call as usual
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
        
        // In Replit, check localStorage as fallback even for non-401 errors
        if (isReplitEnvironment) {
          const userData = localStorage.getItem('user_data');
          if (userData) {
            console.log('Using stored user data from localStorage after API error');
            return { user: JSON.parse(userData) };
          }
        }
        
        throw error;
      }
    },
    // Add these options to prevent excessive refetching
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: 60000, // Cache for 1 minute
    retry: 1, // Allow one retry for potential network issues
    retryDelay: 1000, // Wait 1 second before retrying
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
        
        // Save the "just logged in" flag
        localStorage.setItem('just_logged_in', 'true');
        
        // Extract user data from response
        let userData = null;
        if (response.data?.user) {
          userData = response.data.user;
          console.log('Found user data in response, storing in localStorage');
          localStorage.setItem('user_data', JSON.stringify(userData));
        }
        
        // Handle different token response formats
        let token = null;
        
        // Format 1: { auth: { token: "..." } }
        if (response.data?.auth?.token) {
          token = response.data.auth.token;
        } 
        // Format 2: { token: "..." }
        else if (response.data?.token) {
          token = response.data.token;
        }
        // Format 3: String token directly in body 
        else if (typeof response.data === 'string' && response.data.length > 20) {
          token = response.data;
        }
        
        // Store token if we found one
        if (token) {
          console.log('Saving auth token to localStorage');
          localStorage.setItem('auth_token', token);
          
          // Add the token to the Axios default headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          console.log('No token found in response, using cookie-based auth only');
        }
        
        // Schedule clearing of just_logged_in flag
        setTimeout(() => {
          localStorage.removeItem('just_logged_in');
        }, 30000); // Clear after 30 seconds
        
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
      queryClient.setQueryData(['/api/auth/me'], response.data);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.data.user?.name || response.data.user?.username}!`,
      });
      
      // Redirect to the dashboard after successful login with a more robust approach
      if (window.location.pathname === '/auth') {
        // Store a flag in localStorage to indicate we've just logged in
        localStorage.setItem('just_logged_in', 'true');
        
        // Store user data directly in localStorage as backup
        try {
          if (response.data.user) {
            localStorage.setItem('user_data', JSON.stringify(response.data.user));
          }
        } catch (e) {
          console.error('Failed to store user data in localStorage', e);
        }
        
        // Manually refetch the query to ensure we have the updated user
        console.log("Refetching auth state before redirecting...");
        queryClient.invalidateQueries({queryKey: ['/api/auth/me']});
        
        // Redirect directly without setTimeout to avoid race conditions
        console.log("Login successful, redirecting to dashboard immediately");
        window.location.href = '/'; // Redirect to root which should show dashboard if authenticated
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
      queryClient.setQueryData(['/api/auth/me'], null);
      
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
      queryClient.setQueryData(['/api/auth/me'], null);
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
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
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
  const [checkedLocalStorage, setCheckedLocalStorage] = useState(false);
  const [localUserData, setLocalUserData] = useState<any>(null);
  
  // Check localStorage for user data as fallback
  useEffect(() => {
    if (!user && !isLoading && !checkedLocalStorage) {
      try {
        const storedUserData = localStorage.getItem('user_data');
        const justLoggedIn = localStorage.getItem('just_logged_in');
        
        if (storedUserData) {
          console.log('Found user data in localStorage, using as fallback');
          const parsedData = JSON.parse(storedUserData);
          setLocalUserData(parsedData);
        }
        
        // If we just logged in, this is likely a race condition
        if (justLoggedIn === 'true') {
          console.log('Just logged in flag found in localStorage, refusing to redirect to auth');
          // Clear the flag after 30 seconds to prevent permanent blocking
          setTimeout(() => {
            localStorage.removeItem('just_logged_in');
          }, 30000);
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      } finally {
        setCheckedLocalStorage(true);
      }
    }
  }, [user, isLoading, checkedLocalStorage]);

  // Show loading state
  if (isLoading) {
    return <>{fallback}</>;
  }

  // If we just logged in, don't redirect immediately, wait for the auth state to sync
  const justLoggedIn = localStorage.getItem('just_logged_in') === 'true';
  
  // Use either the auth context user or the localStorage fallback
  const effectiveUser = user || localUserData;
  
  // If not authenticated and not just logged in, redirect to login
  if (!effectiveUser && !justLoggedIn) {
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
  
  // If we have localUserData but no user, use it as a temporary fallback
  // but also refresh the auth state
  if (!user && localUserData && !justLoggedIn) {
    console.log('Using localStorage user data as fallback while refreshing auth state');
  }

  // Render the Component if provided (for backward compatibility)
  if (Component) {
    return <Component />;
  }

  // Render the children if authenticated
  return <>{children}</>;
};

