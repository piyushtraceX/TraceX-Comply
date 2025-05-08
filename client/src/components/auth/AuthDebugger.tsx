import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextV2';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { setApiEndpoint } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

/**
 * Debug component to test authentication and API switching
 */
export function AuthDebugger() {
  const { user, tenant, isLoading, login, logout } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [useGoBackend, setUseGoBackend] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [logoutInProgress, setLogoutInProgress] = useState(false);
  
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
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>API Health Check</Label>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            <div className="flex items-center justify-between">
              <span>Express API:</span> 
              <span className={`px-2 py-1 rounded text-xs ${user ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                {user ? 'Connected' : 'Not Authenticated'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span>Go API:</span> 
              <span className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                Not Tested
              </span>
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