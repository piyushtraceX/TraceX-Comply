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
    // Get the current origin with protocol
    const baseUrl = window.location.origin;
    
    // Special handling for Replit environment
    const isReplit = 
      window.location.hostname.includes('replit') || 
      window.location.hostname.includes('.app');
    
    // For Replit or production, use the current origin
    // This ensures we're using the same domain that's publicly accessible
    const redirectUrl = `${baseUrl}/api/auth/casdoor`;
    
    console.log(`Redirecting to Casdoor login at: ${redirectUrl} (${isReplit ? 'Replit' : 'Standard'} environment)`);
    
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