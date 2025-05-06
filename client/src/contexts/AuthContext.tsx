import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// Define Auth Context Type
type AuthContextType = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
};

// Create Auth Context with default values
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [, navigate] = useLocation();
  
  // Check login status from localStorage on initial load
  useEffect(() => {
    const loginStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loginStatus === 'true');
  }, []);
  
  // Login function
  const login = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
    navigate('/dashboard');
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    navigate('/login');
  };
  
  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Protected route component
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);
  
  return isLoggedIn ? <>{children}</> : null;
};