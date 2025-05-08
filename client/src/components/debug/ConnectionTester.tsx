import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-config';
import axios from 'axios';

interface EndpointStatus {
  name: string;
  url: string;
  status: 'success' | 'error' | 'pending' | 'unknown';
  message: string;
  responseTime?: number;
}

export const ConnectionTester: React.FC = () => {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { name: 'Express API', url: '/api/test', status: 'pending', message: 'Not tested yet' },
    { name: 'Go API', url: 'http://localhost:8080/api/test', status: 'pending', message: 'Not tested yet' },
    { name: 'Database', url: '/api/db/status', status: 'pending', message: 'Not tested yet' },
    { name: 'Auth Service', url: '/api/auth/status', status: 'pending', message: 'Not tested yet' },
  ]);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [logsExpanded, setLogsExpanded] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testEndpoint = async (index: number) => {
    const endpoint = endpoints[index];
    
    // Update endpoint status to pending
    setEndpoints(prev => {
      const newEndpoints = [...prev];
      newEndpoints[index] = {
        ...endpoint,
        status: 'pending',
        message: 'Testing...',
      };
      return newEndpoints;
    });
    
    addLog(`Testing ${endpoint.name} at ${endpoint.url}...`);
    
    try {
      const startTime = performance.now();
      const response = await axios.get(endpoint.url, {
        timeout: 5000,
        withCredentials: true,
      });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      addLog(`✓ ${endpoint.name} responded with status ${response.status} in ${responseTime}ms`);
      
      // Update endpoint status to success
      setEndpoints(prev => {
        const newEndpoints = [...prev];
        newEndpoints[index] = {
          ...endpoint,
          status: 'success',
          message: `OK (${response.status})`,
          responseTime,
        };
        return newEndpoints;
      });
    } catch (error: any) {
      let errorMessage = 'Unknown error';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network error - Service unavailable';
        } else if (error.response) {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        } else {
          errorMessage = error.message;
        }
      }
      
      addLog(`✗ ${endpoint.name} failed: ${errorMessage}`);
      
      // Update endpoint status to error
      setEndpoints(prev => {
        const newEndpoints = [...prev];
        newEndpoints[index] = {
          ...endpoint,
          status: 'error',
          message: errorMessage,
        };
        return newEndpoints;
      });
    }
  };

  const runAllTests = async () => {
    if (isRunningTests) return;
    
    setIsRunningTests(true);
    setLogs([]);
    setLogsExpanded(true);
    addLog('Starting connection tests...');
    
    // Reset all endpoints to pending
    setEndpoints(prev => prev.map(endpoint => ({
      ...endpoint,
      status: 'pending',
      message: 'Waiting...',
    })));
    
    // Test each endpoint sequentially
    for (let i = 0; i < endpoints.length; i++) {
      await testEndpoint(i);
    }
    
    addLog('Connection tests completed');
    setIsRunningTests(false);
    setLastRun(new Date().toLocaleTimeString());
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Failed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="animate-pulse">Testing...</Badge>;
      default:
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" /> Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Connection Tester</span>
          <Button 
            size="sm" 
            onClick={runAllTests} 
            disabled={isRunningTests}
            className="ml-2"
          >
            {isRunningTests ? 'Testing...' : 'Run All Tests'}
          </Button>
        </CardTitle>
        <CardDescription>
          Test connectivity to various system components
          {lastRun && (
            <span className="ml-2 text-xs text-muted-foreground">
              Last run: {lastRun}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-md border ${
                endpoint.status === 'success' 
                  ? 'border-green-200 bg-green-50' 
                  : endpoint.status === 'error'
                    ? 'border-destructive/50 bg-destructive/10'
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium flex items-center">
                    {endpoint.name}
                    <span className="ml-2">{renderStatusBadge(endpoint.status)}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{endpoint.url}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => testEndpoint(index)}
                  disabled={isRunningTests}
                >
                  Test
                </Button>
              </div>
              
              {(endpoint.status === 'success' || endpoint.status === 'error') && (
                <div className={`mt-2 text-sm ${
                  endpoint.status === 'success' ? 'text-green-700' : 'text-destructive'
                }`}>
                  {endpoint.message}
                  {endpoint.responseTime && (
                    <span className="ml-2 text-muted-foreground">
                      ({endpoint.responseTime}ms)
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Connection logs */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Connection Logs</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLogsExpanded(!logsExpanded)}
              className="h-6 text-xs"
            >
              {logsExpanded ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {logsExpanded && (
            <pre className="p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40 font-mono">
              {logs.length > 0 
                ? logs.map((log, i) => <div key={i}>{log}</div>)
                : 'No logs yet. Run tests to see connection details.'}
            </pre>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          Testing environment connectivity
        </div>
      </CardFooter>
    </Card>
  );
};