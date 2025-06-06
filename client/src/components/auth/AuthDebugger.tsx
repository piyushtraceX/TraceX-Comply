import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextV2';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { setApiEndpoint } from '@/lib/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import axios from 'axios';

/**
 * Debug component to test authentication and API switching
 */
export function AuthDebugger() {
  const { user, tenant, isLoading, login, logout } = useAuth();
  const [username, setUsername] = useState('demouser');
  const [password, setPassword] = useState('password');
  const [useGoBackend, setUseGoBackend] = useState(true); // Default to Go backend
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [logoutInProgress, setLogoutInProgress] = useState(false);
  const [goApiStatus, setGoApiStatus] = useState<'checking' | 'available' | 'unavailable' | 'error'>('checking');
  const [expressApiStatus, setExpressApiStatus] = useState<'checking' | 'available' | 'unavailable' | 'error'>('checking');
  
  // State for storing token information
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [headerAuthToken, setHeaderAuthToken] = useState<string | null>(null);
  const [authCheckStatus, setAuthCheckStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [authCheckResult, setAuthCheckResult] = useState<string>('');
  const [sessionCheckStatus, setSessionCheckStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [sessionCheckResult, setSessionCheckResult] = useState<string>('');

  // Check API status and auth token on mount
  useEffect(() => {
    checkApiStatus();
    refreshTokenInfo();
  }, []);
  
  // Refresh token information
  const refreshTokenInfo = () => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    setAuthToken(token);
    
    // Get token from axios headers
    const axiosToken = axios.defaults.headers.common['Authorization'] as string;
    setHeaderAuthToken(axiosToken || null);
  };
  
  // Test authentication endpoint directly
  const testAuthEndpoint = async () => {
    setAuthCheckStatus('checking');
    setAuthCheckResult('');
    
    try {
      const host = window.location.hostname;
      const authApiUrl = `${window.location.protocol}//${host}/api/auth/me`;
      console.log('Testing auth endpoint at:', authApiUrl);
      
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const authResponse = await axios.get(authApiUrl, { 
        withCredentials: true,
        headers,
        timeout: 5000 
      });
      
      console.log('Auth endpoint test result:', authResponse);
      setAuthCheckStatus('success');
      setAuthCheckResult(JSON.stringify(authResponse.data, null, 2));
    } catch (error: any) {
      console.error('Error testing auth endpoint:', error);
      setAuthCheckStatus('failed');
      
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const data = error.response?.data;
        setAuthCheckResult(`Status: ${statusCode}\nData: ${JSON.stringify(data, null, 2)}`);
      } else {
        setAuthCheckResult(error.message);
      }
    }
  };
  
  // Test session debugging in the health endpoint
  const testSessionEndpoint = async () => {
    setSessionCheckStatus('checking');
    setSessionCheckResult('');
    
    try {
      const host = window.location.hostname;
      const sessionApiUrl = `${window.location.protocol}//${host}/api/health/session`;
      console.log('Testing session endpoint at:', sessionApiUrl);
      
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const sessionResponse = await axios.get(sessionApiUrl, { 
        withCredentials: true,
        headers,
        timeout: 5000 
      });
      
      console.log('Session endpoint test result:', sessionResponse);
      setSessionCheckStatus('success');
      setSessionCheckResult(JSON.stringify(sessionResponse.data, null, 2));
    } catch (error: any) {
      console.error('Error testing session endpoint:', error);
      setSessionCheckStatus('failed');
      
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const data = error.response?.data;
        setSessionCheckResult(`Status: ${statusCode}\nData: ${JSON.stringify(data, null, 2)}`);
      } else {
        setSessionCheckResult(error.message);
      }
    }
  };
  
  // Function to check the API status
  const checkApiStatus = async () => {
    // Check Go API
    setGoApiStatus('checking');
    try {
      const host = window.location.hostname;
      const goApiUrl = `${window.location.protocol}//${host}/api/health`;
      console.log('Checking Go API at:', goApiUrl);
      
      const goResponse = await axios.get(goApiUrl, { timeout: 3000 });
      if (goResponse.status === 200) {
        console.log('Go API is available');
        setGoApiStatus('available');
      } else {
        console.log('Go API returned unexpected status:', goResponse.status);
        setGoApiStatus('error');
      }
    } catch (error) {
      console.error('Error checking Go API:', error);
      setGoApiStatus('unavailable');
    }
    
    // Check Express API
    setExpressApiStatus('checking');
    try {
      // Express API should be available on the same host during development
      const expressApiUrl = `/api/test`;
      console.log('Checking Express API at:', expressApiUrl);
      
      const expressResponse = await axios.get(expressApiUrl, { timeout: 3000 });
      if (expressResponse.status === 200) {
        console.log('Express API is available');
        setExpressApiStatus('available');
      } else {
        console.log('Express API returned unexpected status:', expressResponse.status);
        setExpressApiStatus('error');
      }
    } catch (error) {
      console.error('Error checking Express API:', error);
      setExpressApiStatus('unavailable');
    }
  };
  
  // Handle API backend switch
  const handleBackendSwitch = (checked: boolean) => {
    console.log(`Switching to ${checked ? 'Go' : 'Express'} backend`);
    
    setUseGoBackend(checked);
    setApiEndpoint(checked ? 'go' : 'express');
    
    // Clear query cache when switching backends
    queryClient.clear();
    
    // Force a reload after a short delay to ensure all hooks re-run with new API configuration
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };
  
  // Handle login
  const handleLogin = async () => {
    setLoginInProgress(true);
    try {
      await login({ username, password });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoginInProgress(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    setLogoutInProgress(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutInProgress(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authentication Debugger</CardTitle>
        <CardDescription>Test authentication and API configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="backend-switch"
            checked={useGoBackend}
            onCheckedChange={handleBackendSwitch}
          />
          <Label htmlFor="backend-switch">
            Use Go Backend ({useGoBackend ? 'Enabled' : 'Disabled'})
          </Label>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800 text-sm mb-4">
          <p className="font-medium mb-2">Backend Status</p>
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            Currently using the <span className="font-bold">{useGoBackend ? 'Go' : 'Express.js'}</span> backend. 
            {useGoBackend 
              ? ' Make sure the Go server is running on port 8080.' 
              : ' Express.js is already running with the Vite development server.'}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Authentication State</Label>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            <div>Status: {isLoading 
              ? <span className="text-blue-600 dark:text-blue-400">Loading...</span> 
              : user 
                ? <span className="text-green-600 dark:text-green-400">Authenticated</span> 
                : <span className="text-red-600 dark:text-red-400">Not Authenticated</span>
            }</div>
            {user && (
              <>
                <div>User: <span className="font-mono">{user.username}</span> (ID: {user.id})</div>
                <div>Name: {user.name}</div>
                <div>Email: {user.email}</div>
                {tenant && <div>Tenant: {tenant.name} (ID: {tenant.id})</div>}
                {user.roles && <div>Roles: {user.roles.join(', ')}</div>}
              </>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="font-medium text-sm mb-1">Auth Token Info</div>
              <div className="text-xs">
                <div>LocalStorage Token: {authToken 
                  ? <span className="text-green-600 dark:text-green-400 font-mono break-all">{authToken.substring(0, 15)}...</span> 
                  : <span className="text-red-600 dark:text-red-400">Not Found</span>
                }</div>
                <div>Axios Headers Token: {headerAuthToken 
                  ? <span className="text-green-600 dark:text-green-400 font-mono break-all">{headerAuthToken.substring(0, 15)}...</span> 
                  : <span className="text-red-600 dark:text-red-400">Not Found</span>
                }</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={refreshTokenInfo}
                >
                  Refresh Token Info
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Test Authentication Endpoint</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={testAuthEndpoint} 
              className="h-8 px-2 text-xs"
            >
              Test Auth API
            </Button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            <div className="flex items-center justify-between mb-2">
              <span>Auth Endpoint Status:</span> 
              {authCheckStatus === 'idle' ? (
                <span className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 flex items-center">
                  Not Tested
                </span>
              ) : authCheckStatus === 'checking' ? (
                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex items-center">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Testing...
                </span>
              ) : authCheckStatus === 'success' ? (
                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Success
                </span>
              ) : (
                <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center">
                  <XCircle className="mr-1 h-3 w-3" />
                  Failed
                </span>
              )}
            </div>
            
            {authCheckResult && (
              <div className="text-xs mt-2 p-2 bg-black/10 dark:bg-white/5 rounded font-mono whitespace-pre-wrap break-all">
                {authCheckResult}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Test Session Endpoint</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={testSessionEndpoint} 
              className="h-8 px-2 text-xs"
            >
              Test Session
            </Button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            <div className="flex items-center justify-between mb-2">
              <span>Session Endpoint Status:</span> 
              {sessionCheckStatus === 'idle' ? (
                <span className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 flex items-center">
                  Not Tested
                </span>
              ) : sessionCheckStatus === 'checking' ? (
                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex items-center">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Testing...
                </span>
              ) : sessionCheckStatus === 'success' ? (
                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Success
                </span>
              ) : (
                <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center">
                  <XCircle className="mr-1 h-3 w-3" />
                  Failed
                </span>
              )}
            </div>
            
            {sessionCheckResult && (
              <div className="text-xs mt-2 p-2 bg-black/10 dark:bg-white/5 rounded font-mono whitespace-pre-wrap break-all">
                {sessionCheckResult}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>API Health Check</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={checkApiStatus} 
              className="h-8 px-2 text-xs"
            >
              Refresh
            </Button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            <div className="flex items-center justify-between">
              <span>Express API:</span> 
              {expressApiStatus === 'checking' ? (
                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex items-center">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Checking
                </span>
              ) : expressApiStatus === 'available' ? (
                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Available
                </span>
              ) : expressApiStatus === 'unavailable' ? (
                <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center">
                  <XCircle className="mr-1 h-3 w-3" />
                  Unavailable
                </span>
              ) : (
                <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center">
                  <XCircle className="mr-1 h-3 w-3" />
                  Error
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span>Go API:</span> 
              {goApiStatus === 'checking' ? (
                <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex items-center">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Checking
                </span>
              ) : goApiStatus === 'available' ? (
                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Available
                </span>
              ) : goApiStatus === 'unavailable' ? (
                <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center">
                  <XCircle className="mr-1 h-3 w-3" />
                  Unavailable
                </span>
              ) : (
                <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center">
                  <XCircle className="mr-1 h-3 w-3" />
                  Error
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={!user || logoutInProgress}
        >
          {logoutInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Logout
        </Button>
        <Button
          onClick={handleLogin}
          disabled={isLoading || loginInProgress}
        >
          {loginInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
      </CardFooter>
    </Card>
  );
}