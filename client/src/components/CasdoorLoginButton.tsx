import React from 'react';
import { Button } from '@/components/ui/button';
import { FaKey } from 'react-icons/fa'; // Using a key icon instead of SiCasdoor
import axios from 'axios';

// Extend window interface for TypeScript
declare global {
  interface Window {
    axios?: typeof axios;
  }
}

interface CasdoorLoginButtonProps {
  className?: string;
}

const CasdoorLoginButton: React.FC<CasdoorLoginButtonProps> = ({ className }) => {
  // Enterprise Casdoor endpoint
  const casdoorEndpoint = 'https://tracextech.casdoor.com';
  
  const handleCasdoorLogin = () => {
    // Clear any existing authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('just_logged_in');
    sessionStorage.clear();
    
    // Remove any authorization headers from axios
    try {
      if (axios.defaults?.headers?.common) {
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (e) {
      console.error('Error clearing axios headers:', e);
    }
    
    // Delete all cookies related to authentication
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    
    console.log('Cleared all authentication data');
    
    // Redirect to the Casdoor authentication flow
    console.log('Initiating Casdoor authentication flow...');
    
    // Use the auth/casdoor endpoint directly handled by Express
    const authUrl = '/auth/casdoor';
    console.log(`Redirecting to: ${authUrl}`);
    
    // This will be redirected to Casdoor by Express
    window.location.href = authUrl;
  };

  return (
    <Button 
      variant="outline" 
      className={`w-full ${className}`} 
      onClick={handleCasdoorLogin}
    >
      <FaKey className="mr-2 h-4 w-4" />
      Sign in with Casdoor
    </Button>
  );
};

export default CasdoorLoginButton;