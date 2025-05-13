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
    console.log('Initiating Casdoor authentication flow...');
    
    // Use the Go server's OAuth endpoint with a timestamp parameter to avoid caching
    const timestamp = new Date().getTime();
    const authUrl = `/api/auth/casdoor?ts=${timestamp}`;
    
    // Log more details about the request
    console.log(`Current location: ${window.location.href}`);
    console.log(`Full auth URL: ${window.location.origin}${authUrl}`);
    console.log(`Redirecting to Go server OAuth endpoint: ${authUrl}`);
    
    // Set a flag so we know this is a fresh login attempt
    localStorage.setItem('casdoor_login_attempt', timestamp.toString());
    
    // This will redirect to Casdoor
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