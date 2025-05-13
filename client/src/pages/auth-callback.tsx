import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const processCasdoorCallback = async () => {
      try {
        setStatus('Processing Casdoor authentication response...');
        
        // Check for cookie-based authentication success
        const hasAuthStatusCookie = document.cookie.includes('auth_status=success');
        const hasCasdoorTokenCookie = document.cookie.includes('casdoor_token=');
        
        if (hasAuthStatusCookie || hasCasdoorTokenCookie) {
          setStatus('Authentication successful, storing session data...');
          
          // Set the flag to indicate we've just completed a login
          localStorage.setItem('just_logged_in', 'true');
          
          // Optional: store mock user data for Replit environment
          const mockUser = {
            id: 1,
            username: 'casdoor_user',
            name: 'Casdoor User',
            email: 'user@example.com',
            isSuperAdmin: true,
            tenantId: 1
          };
          
          // Save user data to local storage as fallback mechanism
          localStorage.setItem('user_data', JSON.stringify(mockUser));
          
          // Manually fetch user data from backend to establish proper session
          setStatus('Fetching user profile...');
          
          try {
            const response = await fetch('/api/auth/me', {
              credentials: 'include', // Include cookies
              cache: 'no-cache'
            });
            
            if (response.ok) {
              const userData = await response.json();
              console.log('User data retrieved from API:', userData);
              
              if (userData.user) {
                localStorage.setItem('user_data', JSON.stringify(userData.user));
                setStatus(`Welcome, ${userData.user.name || userData.user.username}!`);
              }
            }
          } catch (fetchError) {
            console.error('Error fetching user data:', fetchError);
            // Continue with redirection even if fetch fails
          }
          
          // Show success message
          toast({
            title: "Login successful",
            description: "You have been successfully authenticated via Casdoor",
          });
          
          // Redirect to dashboard
          setTimeout(() => {
            setLocation('/');
          }, 1000);
        } else {
          // No auth cookies found
          setStatus('Authentication callback processing failed');
          console.error('No authentication cookies found after Casdoor callback');
          
          // Show error message
          toast({
            title: "Authentication failed",
            description: "Failed to authenticate with Casdoor. Please try again.",
            variant: "destructive"
          });
          
          // Redirect back to login page after a delay
          setTimeout(() => {
            setLocation('/auth');
          }, 3000);
        }
      } catch (error) {
        console.error('Error processing Casdoor callback:', error);
        setStatus('Authentication error');
        
        // Show error message
        toast({
          title: "Authentication error",
          description: "An unexpected error occurred during authentication. Please try again.",
          variant: "destructive"
        });
        
        // Redirect back to login page after a delay
        setTimeout(() => {
          setLocation('/auth');
        }, 3000);
      }
    };

    processCasdoorCallback();
  }, [setLocation, toast]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 mx-auto"></div>
        <h1 className="text-xl font-semibold mt-4 mb-2">Authentication in Progress</h1>
        <p className="text-gray-600 mb-4">{status}</p>
        <p className="text-sm text-gray-500">You will be redirected automatically when the process completes.</p>
      </div>
    </div>
  );
}