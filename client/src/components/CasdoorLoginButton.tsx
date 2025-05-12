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
    // Special handling for Replit environment or any production environment
    const isReplit = 
      window.location.hostname.includes('replit') || 
      window.location.hostname.includes('.app');
    
    // In Replit, go directly to Casdoor because of potential networking issues
    if (isReplit) {
      console.log('REPLIT ENVIRONMENT: Redirecting directly to Casdoor...');
      window.location.href = 'https://tracextech.casdoor.com';
      return;
    }
    
    // In local development, use the API endpoint
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/auth/casdoor`;
    
    console.log(`LOCAL DEVELOPMENT: Redirecting to Casdoor login via: ${redirectUrl}`);
    
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