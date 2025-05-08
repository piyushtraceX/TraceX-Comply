import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '../queryClient';
import { useToast } from '@/hooks/use-toast';

// Define the shape of the user data returned from the API
export interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  tenantId?: number;
  isSuperAdmin?: boolean;
}

// Define the login credentials type
export interface LoginCredentials {
  username: string;
  password: string;
}

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  logout: () => void;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Query to fetch the current user
  const { 
    data: user, 
    isLoading,
    error,
  } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    queryFn: async (): Promise<User | null> => {
      try {
        const res = await fetch('/api/auth/me');
        
        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch user');
        }
        
        const data = await res.json();
        return data.user;
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
  });
  
  // Login mutation
  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await res.json();
      return data.user;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data);
      toast({
        title: 'Success',
        description: 'Login successful',
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Logout function
  const logout = async () => {
    try {
      const res = await apiRequest('POST', '/api/auth/logout');
      
      if (!res.ok) {
        throw new Error('Logout failed');
      }
      
      // Clear the cached user data
      queryClient.setQueryData(['/api/auth/me'], null);
      
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Logout Failed',
        description: 'Failed to log out properly',
        variant: 'destructive',
      });
    }
  };
  
  // Determine if user is logged in
  const isLoggedIn = !!user;
  
  // Log error if there's an issue fetching the user
  useEffect(() => {
    if (error) {
      console.error('Error fetching user:', error);
    }
  }, [error]);
  
  return (
    <AuthContext.Provider 
      value={{ 
        user: user || null, 
        isLoading, 
        isLoggedIn, 
        loginMutation, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route HOC - use this to wrap components that need authentication
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WithAuth: React.FC<P> = (props) => {
    const { isLoggedIn, isLoading } = useAuth();
    const [, navigate] = useLocation();
    
    useEffect(() => {
      if (!isLoading && !isLoggedIn) {
        navigate('/login');
      }
    }, [isLoggedIn, isLoading, navigate]);
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (!isLoggedIn) {
      return null;
    }
    
    return <Component {...props} />;
  };
  
  return WithAuth;
};

// Protected Route component for use with React Router / Wouter
export const ProtectedRoute: React.FC<{ 
  component: React.ComponentType<any>;
  path: string;
}> = ({ component: Component, path }) => {
  const { isLoggedIn, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return null;
  }
  
  return <Component />;
};