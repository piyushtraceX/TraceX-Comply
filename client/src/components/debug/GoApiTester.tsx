import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api-config';

// Endpoint types for testing
type Endpoint = {
  name: string;
  path: string;
  method: string;
  description: string;
  requiresAuth: boolean;
  requestBody?: Record<string, any>;
};

// Predefined endpoint tests
const ENDPOINTS: Endpoint[] = [
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    description: 'Check if the Go API server is running correctly',
    requiresAuth: false
  },
  {
    name: 'Test Endpoint',
    path: '/test',
    method: 'GET',
    description: 'Simple test endpoint that returns a greeting',
    requiresAuth: false
  },
  {
    name: 'Current User',
    path: '/auth/me',
    method: 'GET',
    description: 'Get the currently authenticated user',
    requiresAuth: true
  },
  {
    name: 'Login',
    path: '/auth/login',
    method: 'POST',
    description: 'Authenticate with username and password',
    requiresAuth: false,
    requestBody: {
      username: 'demouser',
      password: 'password123'
    }
  },
  {
    name: 'Logout',
    path: '/auth/logout',
    method: 'POST',
    description: 'Log out the current user',
    requiresAuth: true
  },
  {
    name: 'List Users',
    path: '/users',
    method: 'GET',
    description: 'Get a list of all users',
    requiresAuth: true
  }
];

export const GoApiTester: React.FC = () => {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(ENDPOINTS[0]);
  const [customEndpoint, setCustomEndpoint] = useState<Endpoint>({
    name: 'Custom',
    path: '/test',
    method: 'GET',
    description: 'Custom API request',
    requiresAuth: false,
    requestBody: {}
  });
  const [requestBody, setRequestBody] = useState<string>('{}');
  const [response, setResponse] = useState<{ data: any; status: number; headers: any; time: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Format JSON nicely
  const formatJson = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return JSON.stringify(obj);
    }
  };

  // Make the API request
  const makeRequest = async (endpoint: Endpoint) => {
    setLoading(true);
    setError(null);
    
    const url = `${API_BASE_URL}${endpoint.path}`;
    let bodyData = {};
    
    try {
      // Parse request body if provided
      if (endpoint.name === 'Custom') {
        try {
          bodyData = JSON.parse(requestBody || '{}');
        } catch (e) {
          toast({
            title: "Invalid JSON",
            description: "Please provide valid JSON for the request body",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      } else {
        bodyData = endpoint.requestBody || {};
      }
      
      console.log(`Making ${endpoint.method} request to ${url}`);
      
      const startTime = Date.now();
      let response;
      
      // Make request based on method
      switch (endpoint.method) {
        case 'GET':
          response = await axios.get(url, { withCredentials: true });
          break;
        case 'POST':
          response = await axios.post(url, bodyData, { withCredentials: true });
          break;
        case 'PUT':
          response = await axios.put(url, bodyData, { withCredentials: true });
          break;
        case 'DELETE':
          response = await axios.delete(url, { withCredentials: true });
          break;
        default:
          throw new Error(`Unsupported method: ${endpoint.method}`);
      }
      
      const endTime = Date.now();
      
      // Format the response
      setResponse({
        data: response.data,
        status: response.status,
        headers: response.headers,
        time: endTime - startTime
      });
      
      toast({
        title: "Request Successful",
        description: `Status: ${response.status} (${endTime - startTime}ms)`,
      });
    } catch (error: any) {
      console.error('API request failed:', error);
      
      const errorMessage = error.response 
        ? `${error.response.status}: ${JSON.stringify(error.response.data)}` 
        : error.message;
      
      setError(errorMessage);
      
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Still set response data if we have it
      if (error.response) {
        setResponse({
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
          time: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Go API Tester</CardTitle>
        <CardDescription>
          Test the standalone Go API server directly
          <div className="mt-2 bg-muted px-3 py-1 rounded text-sm">
            URL: {API_BASE_URL}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="predefined">
          <TabsList className="mb-4">
            <TabsTrigger value="predefined">Predefined Endpoints</TabsTrigger>
            <TabsTrigger value="custom">Custom Request</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predefined">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {ENDPOINTS.map((endpoint, index) => (
                <Button 
                  key={index}
                  variant={selectedEndpoint?.name === endpoint.name ? "default" : "outline"}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  className="justify-start"
                >
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mr-2 bg-primary-100 text-primary-800">
                    {endpoint.method}
                  </span>
                  {endpoint.name}
                </Button>
              ))}
            </div>
            
            {selectedEndpoint && (
              <div className="border rounded-md p-4 mb-4">
                <h3 className="text-lg font-medium mb-2">{selectedEndpoint.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{selectedEndpoint.description}</p>
                <div className="flex space-x-2 mb-2">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary-100 text-primary-800">
                    {selectedEndpoint.method}
                  </span>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border border-input bg-background">
                    {selectedEndpoint.path}
                  </span>
                  {selectedEndpoint.requiresAuth && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                      Requires Auth
                    </span>
                  )}
                </div>
                
                {selectedEndpoint.requestBody && (
                  <div className="mt-2">
                    <Label>Request Body:</Label>
                    <pre className="bg-muted p-2 rounded text-sm mt-1 overflow-auto">
                      {formatJson(selectedEndpoint.requestBody)}
                    </pre>
                  </div>
                )}
                
                <Button 
                  className="mt-4"
                  onClick={() => makeRequest(selectedEndpoint)}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Request"}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="method">Method</Label>
                  <select
                    id="method"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={customEndpoint.method}
                    onChange={(e) => setCustomEndpoint({...customEndpoint, method: e.target.value})}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="path">Path (after /api)</Label>
                  <Input 
                    id="path"
                    value={customEndpoint.path}
                    onChange={(e) => setCustomEndpoint({...customEndpoint, path: e.target.value})}
                    placeholder="/test"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="body">Request Body (JSON)</Label>
                <Textarea 
                  id="body"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder="{}"
                  className="font-mono text-sm"
                  rows={5}
                />
              </div>
              
              <Button 
                onClick={() => makeRequest(customEndpoint)}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Custom Request"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <div>
          <h3 className="text-lg font-medium mb-2">Response</h3>
          
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 mb-4">
              <h4 className="text-destructive font-medium">Error</h4>
              <p className="text-destructive-foreground text-sm">{error}</p>
            </div>
          )}
          
          {response ? (
            <div className="space-y-2">
              <div className="flex space-x-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  response.status < 400 ? 'bg-green-100 text-green-800' : 'bg-destructive text-destructive-foreground'
                }`}>
                  Status: {response.status}
                </span>
                {response.time > 0 && (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border border-input bg-background">
                    Time: {response.time}ms
                  </span>
                )}
              </div>
              
              <div>
                <Label>Response Body:</Label>
                <pre className="bg-muted p-2 rounded text-sm mt-1 overflow-auto max-h-96">
                  {formatJson(response.data)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground italic">No response yet. Send a request to see the result.</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setResponse(null);
          setError(null);
        }}>
          Clear Response
        </Button>
        <p className="text-sm text-muted-foreground">
          Testing Direct Go API Connection
        </p>
      </CardFooter>
    </Card>
  );
};