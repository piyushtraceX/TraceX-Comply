import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of our auth context
type AuthContextType = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check localStorage when component mounts
  useEffect(() => {
    const storedAuthState = localStorage.getItem('isLoggedIn');
    if (storedAuthState === 'true') {
      setIsLoggedIn(true);
    }
  }, []);
  
  // Login function
  const login = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    // Force navigation to login page
    window.location.href = '/login';
  };
  
  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route HOC - use this to wrap components that need authentication
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WithAuth: React.FC<P> = (props) => {
    const { isLoggedIn } = useAuth();
    
    useEffect(() => {
      if (!isLoggedIn) {
        window.location.href = '/login';
      }
    }, [isLoggedIn]);
    
    if (!isLoggedIn) {
      return null;
    }
    
    return <Component {...props} />;
  };
  
  return WithAuth;
};