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
    // Redirect to the Go backend's Casdoor OAuth route
    // Use the full URL to avoid any path issues
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/api/auth/casdoor`;
    
    console.log('Attempting to redirect to Casdoor login at:', redirectUrl);
    
    // Add fetch to verify the endpoint is reachable first
    fetch(redirectUrl, { 
      method: 'GET',
      credentials: 'include' 
    })
    .then(response => {
      console.log('Casdoor redirect response:', response);
      // Let the redirect happen naturally
      window.location.href = redirectUrl;
    })
    .catch(error => {
      console.error('Error accessing Casdoor redirect endpoint:', error);
      alert('Failed to connect to authentication service. See console for details.');
    });
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