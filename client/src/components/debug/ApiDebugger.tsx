import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

// Get the hostname from window.location to ensure we're using the correct host
const getApiBaseUrl = () => {
  const host = window.location.hostname;
  const port = '5000'; // Fixed port for Go API
  const protocol = window.location.protocol;
  
  // Use the explicit port only in development mode or when not on Replit
  if (host.includes('replit') || host.includes('repl.co')) {
    return `${protocol}//${host}/api`;
  }
  
  return `${protocol}//${host}:${port}/api`;
};

export const ApiDebugger = () => {
  const [username, setUsername] = useState('demouser');
  const [password, setPassword] = useState('password');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [endpoint, setEndpoint] = useState('/auth/me');

  const baseUrl = getApiBaseUrl();

  // Function to make API calls
  const callApi = async (method: string, path: string, data?: any) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log(`Making ${method} request to ${baseUrl}${path}`);
      
      let response;
      
      if (method === 'GET') {
        response = await axios.get(`${baseUrl}${path}`, {
          withCredentials: true,
        });
      } else if (method === 'POST') {
        response = await axios.post(`${baseUrl}${path}`, data, {
          withCredentials: true,
        });
      }
      
      console.log('API Response:', response?.data);
      setResponse(response?.data);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message + (err.response?.data ? `: ${JSON.stringify(err.response.data)}` : ''));
      setResponse(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = () => {
    callApi('POST', '/auth/login', { username, password });
  };

  // Logout handler
  const handleLogout = () => {
    callApi('POST', '/auth/logout');
  };

  // Get current user handler
  const handleGetUser = () => {
    callApi('GET', '/auth/me');
  };

  // Custom API call handler
  const handleCustomCall = () => {
    callApi('GET', endpoint);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Go API Debugger</CardTitle>
        <CardDescription>Test the Go API endpoints directly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Login
          </Button>
          <Button onClick={handleLogout} disabled={loading} variant="outline">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Logout
          </Button>
          <Button onClick={handleGetUser} disabled={loading} variant="secondary">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Get User
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endpoint">Custom Endpoint (e.g., /auth/me)</Label>
          <div className="flex space-x-2">
            <Input 
              id="endpoint" 
              value={endpoint} 
              onChange={(e) => setEndpoint(e.target.value)} 
            />
            <Button onClick={handleCustomCall} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Call
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>API Base URL</Label>
          <div className="p-2 bg-muted rounded-md text-sm font-mono break-all">
            {baseUrl}
          </div>
        </div>

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            {error}
          </div>
        )}
        
        {response && (
          <div className="space-y-2">
            <Label>Response</Label>
            <div className="p-2 bg-muted rounded-md text-sm font-mono overflow-auto max-h-40">
              {JSON.stringify(response, null, 2)}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Note: API calls use withCredentials to send cookies
        </p>
      </CardFooter>
    </Card>
  );
};

export default ApiDebugger;