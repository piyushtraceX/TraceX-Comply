import React from 'react';
import { Button } from '@/components/ui/button';
import { FaKey } from 'react-icons/fa'; // Using a key icon instead of SiCasdoor

interface CasdoorLoginButtonProps {
  className?: string;
}

const CasdoorLoginButton: React.FC<CasdoorLoginButtonProps> = ({ className }) => {
  // Enterprise Casdoor endpoint
  const casdoorEndpoint = 'https://tracextech.casdoor.com';
  
  const handleCasdoorLogin = () => {
    // In development, we need to bypass the Express proxy and connect directly to Go server
    // because the proxy is having issues with the redirect flow
    const isDev = import.meta.env.DEV;
    
    // Get the current origin (hostname+port)
    const baseUrl = window.location.origin;
    // Get hostname without port
    const hostname = window.location.hostname;
    
    // Configure the redirect URL
    let redirectUrl;
    if (isDev) {
      // In dev, connect directly to Go server on port 8081
      redirectUrl = `http://${hostname}:8081/api/auth/casdoor`;
      console.log('DEV MODE: Redirecting directly to Go server at:', redirectUrl);
    } else {
      // In production, use normal path
      redirectUrl = `${baseUrl}/api/auth/casdoor`;
      console.log('PROD MODE: Redirecting to Casdoor login at:', redirectUrl);
    }
    
    // Perform the redirect
    window.location.href = redirectUrl;
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